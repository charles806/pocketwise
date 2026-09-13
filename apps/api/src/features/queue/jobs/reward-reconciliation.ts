import type { Request, Response } from "express";
import type { Transaction } from "@prisma/client";
import prisma from "../../../lib/prisma.js";
import { getReward } from "../../../lib/baas.js";
import { Sentry } from "../../../lib/sentry.js";
import { cache, CACHE_KEYS } from "../../../lib/cache.js";
import { notificationService } from "../../notifications/notification.service.js";
import { sendError, sendSuccess } from "../../../utils/response.js";
import {
  failureCallbackUrl,
  jobBaseUrl,
  publishBatch,
} from "../../queue/queue-utils.js";

const RUN_PATH = "/api/internal/jobs/reward-reconciliation/run";

// Anchor fires NO webhook when a reward's status changes — its event-types
// list has no reward.* events, so the only way to learn that a reward reached
// COMPLETED / FAILED is to poll GET /api/v1/rewards/{id}. This job is that
// poller, modelled on the existing transfer-reconciliation sweep.

/**
 * Dispatcher — called on a schedule (~every 5 min). Enqueues a single
 * "reconcile pending waitlist-bonus rewards" message, deduplicated to the same
 * 5-minute window as transfer-reconciliation so overlapping dispatches are
 * harmless.
 */
export async function dispatchRewardReconciliation(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const bucket = Math.floor(Date.now() / 300_000);
    const deduplicationId = `reward-reconciliation:${bucket}`;

    await publishBatch([
      {
        url: `${jobBaseUrl()}${RUN_PATH}`,
        body: {},
        deduplicationId,
        retries: 2,
        callback: failureCallbackUrl(),
      },
    ]);

    sendSuccess(res, "Reward reconciliation dispatched", { bucket });
  } catch (error) {
    sendError(res, "Failed to dispatch reward reconciliation", 500, error);
  }
}

/**
 * Handler — polls every pending waitlist-bonus reward via its reward id
 * (Transaction.baasRef) and settles it once Anchor reports a final status.
 * Idempotent: each pending promo_credit row is claimed with a FOR UPDATE lock
 * and re-checked for status="pending" inside the same transaction, so
 * overlapping sweep runs / re-dispatching can never double-credit or
 * double-notify.
 */
export async function runRewardReconciliation(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const pendings = await prisma.transaction.findMany({
      where: {
        type: "promo_credit",
        status: "pending",
        baasRef: { not: null },
      },
      orderBy: { createdAt: "asc" },
    });

    let settled = 0;
    let failed = 0;
    let skipped = 0;

    for (const transaction of pendings) {
      if (!transaction.baasRef) continue;

      let status: string | undefined;
      try {
        const reward = await getReward(transaction.baasRef);
        status = reward.status;
      } catch (error) {
        // Transient Anchor/network error — leave the row for the next pass.
        skipped += 1;
        console.error(
          `[RewardRecon] Failed to poll reward ${transaction.baasRef}:`,
          error,
        );
        continue;
      }

      if (status === "COMPLETED") {
        const outcome = await completePromoCredit(transaction);
        if (outcome === "settled") settled += 1;
        else skipped += 1;
      } else if (status === "FAILED") {
        await failPromoCredit(transaction);
        failed += 1;
      } else {
        // PENDING (or unknown) — still in flight at Anchor; try again later.
        skipped += 1;
      }
    }

    sendSuccess(res, "Reward reconciliation complete", {
      checked: pendings.length,
      settled,
      failed,
      skipped,
    });
  } catch (error) {
    sendError(res, "Failed to run reward reconciliation", 500, error);
  }
}

/**
 * Credits the full bonus to the user's Spend wallet and marks the reward
 * success. Returns "settled" only when THIS call performed the credit —
 * "skipped" when a concurrent sweep won the row.
 *
 * Split-bypass (intentional): the bonus lands 100% in Spend. It is a
 * promotional incentive, not income — the inbound deposit it piggybacked on
 * was already split 50/30/10/10. Routing the bonus through the split again
 * would both betray the offer and silently mislabel money inside the app's
 * wallets.
 */
async function completePromoCredit(
  transaction: Transaction,
): Promise<"settled" | "skipped"> {
  let didSettle = false;

  await prisma.$transaction(async (tx) => {
    // Claim the row so overlapping sweeps settle it exactly once.
    await tx.$queryRawUnsafe(
      `SELECT id FROM transactions WHERE id = $1::uuid FOR UPDATE`,
      transaction.id,
    );

    const current = await tx.transaction.findUnique({
      where: { id: transaction.id },
    });

    if (!current || current.status !== "pending" || current.type !== "promo_credit") {
      return;
    }

    // Lock then increment the user's Spend wallet (read-then-write on a
    // balance must be FOR UPDATE-guarded per project convention).
    const wallet = await tx.wallet.findFirst({
      where: { userId: current.userId, type: "spend" },
    });
    if (!wallet) {
      throw new Error(
        `Spend wallet not found for promo_credit ${current.baasRef}`,
      );
    }

    await tx.$queryRawUnsafe(
      `SELECT id FROM wallets WHERE id = $1::uuid FOR UPDATE`,
      wallet.id,
    );

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: current.amount } },
    });

    await tx.transaction.update({
      where: { id: current.id },
      data: { status: "success" },
    });

    didSettle = true;
  });

  if (!didSettle) return "skipped";

  cache.del(CACHE_KEYS.userWallets(transaction.userId));

  // Notify ONLY after completion is confirmed — never at reward creation time,
  // because the bonus ≠ real money until Anchor posts it to the ledger.
  notificationService
    .notifyWaitlistBonus(transaction.userId)
    .catch((error) => {
      console.error(
        `[RewardRecon] notifyWaitlistBonus failed for user ${transaction.userId}:`,
        error,
      );
    });

  return "settled";
}

/**
 * Marks a reward failed and alerts via Sentry. There is nothing to reverse:
 * no user funds were ever deducted (the money comes from the MASTER source
 * account, not the user), so there is no balance to claw back. The one-time
 * claim stays in place on purpose — the user earned their slot; a failed
 * reward is an Anchor/source-funding problem ops must investigate rather than
 * something that silently retries and surprises the user.
 */
async function failPromoCredit(transaction: Transaction): Promise<void> {
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: "failed" },
  });

  // baasRef is guaranteed non-null at the call site (`continue` above).
  Sentry.captureMessage(`Waitlist bonus reward FAILED at Anchor`, {
    extra: {
      userUuid: transaction.userId,
      rewardUuid: transaction.baasRef,
      likelyCause: "Source account (MASTER) unfunded or invalid",
    },
    level: "error",
  });
  console.error(
    `[RewardRecon] Waitlist bonus reward ${transaction.baasRef} FAILED for user ${transaction.userId}`,
  );
}