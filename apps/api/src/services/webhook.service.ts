import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import {
  calculateWalletSplits,
  DEFAULT_WALLET_SPLIT_CONFIG,
} from "./split.service.js";
import crypto from "crypto";
import { cache, CACHE_KEYS } from "../lib/cache.js";
import { createReward } from "../lib/baas.js";
import { Sentry } from "../lib/sentry.js";

// ─────────────────────────────────────────────────────────────────────────────
// Waitlist signup bonus (first 100 eligible users).
//
// Constants:
//  - WAITLIST_BONUS_NAIRA: the bonus, in naira, credited IN FULL to Spend.
//  - WAITLIST_BONUS_KOBO:  the same amount in kobo — Anchor rewards are always
//    expressed in the LOWEST currency unit. Never hard-code the two; leaving
//    the ×100 next to the constant makes the unit hop explicit and greppable.
//
// Rules of the road (see processAnchorDepositWebhook for the full dance):
//  1. Only the precomputed first-100 waitlist cohort is eligible.
//  2. Only the user's FIRST successful inbound deposit may trigger it.
//  3. It is one-time-per-user, enforced by an atomic UPDATE.
//  4. It lands 100% in the Spend wallet — it is an incentive, NOT income, so
//     it deliberately bypasses the 50/30/10/10 split the deposit itself goes
//     through.
// ─────────────────────────────────────────────────────────────────────────────
const WAITLIST_BONUS_NAIRA = 1000;
const WAITLIST_BONUS_KOBO = WAITLIST_BONUS_NAIRA * 100;

// The org MASTER deposit account funds every reward. It must exist and be
// funded (Anchor fails reward creation with "Insufficient funds" otherwise).
// Read here rather than inline so every reward call shares one guard.
const rewardsSourceAccountId = (): string => {
  const id = process.env.ANCHOR_REWARDS_SOURCE_ACCOUNT_ID;
  if (!id) {
    throw Object.assign(
      new Error(
        "ANCHOR_REWARDS_SOURCE_ACCOUNT_ID is not set — rewards cannot be funded",
      ),
      { statusCode: 500 },
    );
  }
  return id;
};

interface AnchorEventPayload {
  event?: string;
  type?: string;
  data?: {
    id?: string;
    type?: string;
    attributes?: { createdAt?: string };
    relationships?: Record<string, { data?: { id?: string } }>;
  };
  included?: Array<{
    id?: string;
    type?: string;
    attributes?: {
      amount?: number | string;
      reference?: string;
      status?: string;
    };
  }>;
}

interface InboundNIPTransfer {
  id?: string;
  type?: string;
  attributes?: {
    amount?: number | string;
    reference?: string;
    status?: string;
  };
}

// Anchor events may arrive either flat at the top level
// ({ relationships: { account: { data: { id } } } }) or wrapped under a
// `data` key ({ data: { relationships: { account: { data: { id } } } } }).
// Resolve the deposit account ID defensively across both envelopes.
const extractDepositAccountId = (payload: any): string | undefined =>
  payload?.relationships?.account?.data?.id ??
  payload?.data?.relationships?.account?.data?.id;

// When "support included" is enabled, Anchor embeds the full InboundNIPTransfer
// resource in the event's `included` array. It holds the real amount (in KOBO)
// and the reference.
const findIncludedTransfer = (payload: any): InboundNIPTransfer | undefined =>
  (payload?.included ?? []).find(
    (res: any) => res?.type === "InboundNIPTransfer",
  );

export const webhookService = {
  async processAnchorDepositWebhook(payload: AnchorEventPayload) {
    const event = payload.type ?? payload.event;

    if (event === "nip.inbound.completed") {
      // 1. Resolve the user from the deposit account ID (Anchor's event does
      // not include userId or the amount at the top level).
      const depositAccountId = extractDepositAccountId(payload);

      if (!depositAccountId) {
        console.error(
          "[Webhook] nip.inbound.completed missing deposit account ID",
        );
        return { success: true, message: "Deposit account ID not found" };
      }

      const user = await prisma.user.findFirst({
        where: { baasAccountId: depositAccountId },
      });

      if (!user) {
        console.error(
          `[Webhook] nip.inbound.completed user not found for baasAccountId: ${depositAccountId}`,
        );
        return { success: true, message: "User not found for baasAccountId" };
      }

      const userId = user.id;

      // 2. Amount (in KOBO) and reference come from the included
      // InboundNIPTransfer resource.
      const transfer = findIncludedTransfer(payload);
      const amount = Number(transfer?.attributes?.amount ?? NaN);
      const anchorReference = transfer?.attributes?.reference;

      if (!anchorReference || isNaN(amount) || amount <= 0) {
        console.error(
          `[Webhook] nip.inbound.completed invalid transfer data for user ${userId}`,
        );
        return { success: true, message: "Invalid transfer data" };
      }

      // Amount is in KOBO — divide by 100.
      const amountInNaira = amount / 100;

      // 3. Idempotency Check (outside transaction — optimization to avoid work)
      const existingTransaction = await prisma.transaction.findFirst({
        where: { baasRef: anchorReference },
      });

      if (existingTransaction) {
        return { success: true, message: "Webhook already processed" };
      }

      const split = calculateWalletSplits(new Prisma.Decimal(amountInNaira), {
        spendPercent: new Prisma.Decimal(
          DEFAULT_WALLET_SPLIT_CONFIG.spendPercent,
        ),
        savingsPercent: new Prisma.Decimal(
          DEFAULT_WALLET_SPLIT_CONFIG.savingsPercent,
        ),
        emergencyPercent: new Prisma.Decimal(
          DEFAULT_WALLET_SPLIT_CONFIG.emergencyPercent,
        ),
        flexPercent: new Prisma.Decimal(
          DEFAULT_WALLET_SPLIT_CONFIG.flexPercent,
        ),
      });

      // Eligible cohort membership is looked up case-insensitively because the
      // landing page stores emails exactly as typed (see waitlist.service) while
      // signup normalises to lowercase (see auth.service). Both fields must match
      // regardless of casing, otherwise a legitimately eligible user could be
      // skipped purely over letter case.
      const eligibleWaitlist = await prisma.waitlist.findFirst({
        where: {
          email: { equals: user.email, mode: "insensitive" },
          isEligibleForBonus: true,
        },
        select: { id: true },
      });

      // True when the reward was claimed in this handler; gates the Anchor call
      // AFTER the deposit transaction commits (see below).
      let bonusClaimed = false;
      let spendWalletId: string | undefined;

      await prisma.$transaction(async (tx) => {
        const wallets = await tx.wallet.findMany({
          where: { userId },
        });

        if (!wallets.length) {
          throw Object.assign(new Error("Wallets not found"), {
            statusCode: 404,
          });
        }

        const walletMap = new Map(wallets.map((w) => [w.type, w]));

        // ── Waitlist bonus: eligibility + atomic claim ──────────────────────
        // The THREE conditions must ALL hold. Dropping any one of them either
        // double-pays a user, pays someone outside the first-100 cohort, or
        // pays on a non-first deposit:
        //   1. firstDeposit === 0  → this must be the user's FIRST successful
        //      inbound deposit (counted BEFORE this deposit's split rows are
        //      inserted below, so "first" is relative to pre-existing history).
        //   2. eligibleWaitlist     → email matches a precomputed eligible row
        //      (never a live count — see scripts/flag-waitlist-eligible.ts).
        //   3. creditedAt is null   → the one-time guard is still open.
        const creditedAt = await tx.user.findUnique({
          where: { id: userId },
          select: { waitlistBonusCreditedAt: true },
        });

        const firstDeposit = await tx.transaction.count({
          where: { userId, type: "deposit", status: "success" },
        });

        if (
          firstDeposit === 0 &&
          eligibleWaitlist &&
          creditedAt?.waitlistBonusCreditedAt === null
        ) {
          // ATOMIC CLAIM — the count check below is what makes this safe.
          // Two near-simultaneous webhook deliveries (or a delivery racing a
          // retry) can both read `creditedAt === null`, but the row-level lock
          // taken by this UPDATE serialises them: the loser matches zero rows
          // and gives up. Without the row-count guard, both could pass the
          // null-check and both would fire a reward = double pay.
          const claim = await tx.user.updateMany({
            where: { id: userId, waitlistBonusCreditedAt: null },
            data: { waitlistBonusCreditedAt: new Date() },
          });

          if (claim.count === 1) {
            bonusClaimed = true;
            const spendWallet = walletMap.get("spend");
            spendWalletId = spendWallet?.id;
          }
        }

        // The claim and the deposit credit live in the SAME transaction on
        // purpose: if the split fails for any reason the whole thing rolls
        // back, so a user can never be marked "already credited" without the
        // qualifying deposit actually succeeding.
        for (const allocation of split) {
          const matchingWallet = walletMap.get(allocation.walletType);

          if (!matchingWallet) {
            throw Object.assign(
              new Error(`Wallet ${allocation.walletType} not found`),
              { statusCode: 404 },
            );
          }

          await tx.wallet.update({
            where: { id: matchingWallet.id },
            data: {
              balance: { increment: allocation.amount },
            },
          });

          await tx.transaction.create({
            data: {
              userId,
              walletId: matchingWallet.id,
              type: "deposit",
              amount: allocation.amount,
              status: "success",
              baasRef: `${anchorReference}-${allocation.walletType}`,
              reference: crypto.randomUUID(),
            },
          });
        }
      });

      // ── Reward creation (only AFTER the deposit transaction committed) ────
      // Creating the Anchor reward is an external side effect; we deliberately
      // do it after the DB transaction so a failed Anchor call never rolls back
      // a good deposit split. The claim was already made atomically above.
      if (bonusClaimed) {
        // The spend wallet must have resolved during the claim; a bonus with no
        // destination wallet means the user's data is corrupt — release the
        // claim and alert rather than firing a reward with nowhere to land.
        if (!spendWalletId) {
          Sentry.captureMessage(
            `Waitlist bonus claimed but Spend wallet missing for user ${userId}`,
            { level: "error" },
          );
          await prisma.user.updateMany({
            where: { id: userId, waitlistBonusCreditedAt: { not: null } },
            data: { waitlistBonusCreditedAt: null },
          });
          return {
            success: true,
            reference: anchorReference,
            walletsUpdated: split.length,
            bonusStatus: "claim_released",
          };
        }

        const sourceAccountId = rewardsSourceAccountId();

        // The deposit just landed in this user's Anchor deposit account, so
        // baasAccountId is normally always present here; guard anyway so the
        // failure is loud and the claim is released instead of a dead send.
        if (!user.baasAccountId) {
          Sentry.captureMessage(
            `Waitlist bonus claimed but baasAccountId missing for user ${userId}`,
            { level: "error" },
          );
          await prisma.user.updateMany({
            where: { id: userId, waitlistBonusCreditedAt: { not: null } },
            data: { waitlistBonusCreditedAt: null },
          });
          return {
            success: true,
            reference: anchorReference,
            walletsUpdated: split.length,
            bonusStatus: "claim_released",
          };
        }

        let rewardId: string;
        try {
          const reward = await createReward(
            sourceAccountId,
            user.baasAccountId,
            WAITLIST_BONUS_KOBO,
            "Waitlist signup bonus",
            { userId: user.id, type: "waitlist_bonus" },
          );
          rewardId = reward.id;
        } catch (error) {
          // No money has moved at Anchor (the POST failed), so it is SAFE to
          // release the atomic claim and let the user's next deposit retry.
          Sentry.captureException(error);
          console.error(
            `[Webhook] createReward failed for user ${userId}; releasing claim:`,
            error,
          );
          await prisma.user.updateMany({
            where: { id: userId, waitlistBonusCreditedAt: { not: null } },
            data: { waitlistBonusCreditedAt: null },
          });
          return {
            success: true,
            reference: anchorReference,
            walletsUpdated: split.length,
            bonusStatus: "claim_released",
          };
        }

        try {
          await prisma.transaction.create({
            data: {
              userId,
              walletId: spendWalletId!,
              type: "promo_credit",
              amount: new Prisma.Decimal(WAITLIST_BONUS_NAIRA),
              reason: "Waitlist signup bonus",
              status: "pending",
              // baasRef is the reward id — the SAME correlation field used for
              // transfers — so the reward-reconciliation job can find this row
              // by reward id and settle it when Anchor reports COMPLETED.
              baasRef: rewardId,
              reference: crypto.randomUUID(),
            },
          });
        } catch (error) {
          // The reward EXISTS at Anchor but we failed to record it. We must NOT
          // release the claim here (that would double-send on the next
          // deposit); instead log loudly so an operator reconciles the orphan.
          Sentry.captureException(error);
          console.error(
            `[Webhook] Failed to persist pending promo_credit for user ${userId} (reward ${rewardId} exists at Anchor):`,
            error,
          );
        }
      }

      cache.del(CACHE_KEYS.userWallets(userId));

      return {
        success: true,
        reference: anchorReference,
        walletsUpdated: split.length,
        // Observable for tests: "claimed" when a reward was created,
        // "claim_released" when creation failed and the claim was freed, and
        // absent when the user was not eligible.
        bonusStatus: bonusClaimed ? "claimed" : undefined,
      };
    }

    return {
      success: true,
      message: "Event ignored",
    };
  },
};
