import { Prisma, WalletType } from "@prisma/client";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { getDepositAccount } from "../lib/baas.js";
import { Sentry } from "../lib/sentry.js";
import { cache, CACHE_KEYS } from "../lib/cache.js";
import {
  calculateWalletSplits,
  getUserSplitConfig,
} from "./split.service.js";

// A deposit is considered orphaned only if the delta is meaningful — kobo dust
// (from rounding in splits or Anchor's own ledger) must never trigger a credit.
const MIN_DEPOSIT_DELTA_NAIRA = 1;

export interface OrphanDepositSweepResult {
  checked: number;
  credited: number;
  skipped: number;
  short: number;
  failed: number;
}

export interface OrphanDepositCandidate {
  userId: string;
  email: string;
  anchorBalanceNaira: number;
  walletSumNaira: number;
  deltaNaira: number;
  action: "skip" | "credit" | "short";
}

interface SweepOptions {
  limit?: number;
  dryRun?: boolean;
}

/**
 * Finds money that physically exists in a user's Anchor deposit account but was
 * never credited to their Pocketwise wallets — i.e. inbound deposits whose
 * `nip.inbound.completed` webhook was lost, or funds seeded into the Anchor
 * account without a matching webhook event.
 *
 * Delta = Anchor available balance − Σ wallet balances. A positive delta above
 * `MIN_DEPOSIT_DELTA_NAIRA` is an orphaned deposit and is credited through the
 * SAME split logic the deposit webhook uses (webhook.service.ts), so the money
 * lands consistently in spend/savings/emergency/flex.
 *
 * SAFETY — only flat books are evaluated:
 *  - Users with ANY pending transaction row are SKIPPED. A pending outbound
 *    transfer has already been debited from the wallets while Anchor still
 *    holds the money, which would fake a positive delta; a pending promo_credit
 *    means Anchor may already hold the bonus while the wallet does not. The
 *    transfer/reward sweeps settle those first, so the deposit sweep only ever
 *    sees a settled book.
 *  - Negative delta (wallets > Anchor) is never auto-fixed — money appearing
 *    "missing" at Anchor indicates a real problem to investigate, not a
 *    silent debit.
 *  - Verifying wallet rows with FOR UPDATE serialises concurrent sweep runs:
 *    the second run re-reads the post-credit balances and sees a zero delta.
 */
export async function sweepOrphanDeposits(
  options: SweepOptions = {},
): Promise<OrphanDepositSweepResult & { candidates: OrphanDepositCandidate[] }> {
  const limit = options.limit ?? 50;
  const dryRun = options.dryRun ?? false;

  const users = await prisma.user.findMany({
    where: {
      baasAccountId: { not: null },
      transactions: { none: { status: "pending" } },
    },
    select: {
      id: true,
      email: true,
      baasAccountId: true,
      wallets: { select: { type: true, balance: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const candidates: OrphanDepositCandidate[] = [];
  let credited = 0;
  let skipped = 0;
  let short = 0;
  let failed = 0;

  for (const user of users) {
    if (!user.baasAccountId) continue;

    const walletSumNaira = user.wallets.reduce(
      (sum, w) => sum + Number(w.balance),
      0,
    );

    let anchorBalanceNaira: number;
    try {
      const account = await getDepositAccount(user.baasAccountId);
      // Anchor reports balances in kobo — divide by 100 for naira.
      anchorBalanceNaira =
        Number(account?.attributes?.availableBalance ?? 0) / 100;
    } catch (error) {
      failed += 1;
      console.error(
        `[DepositRecon] Failed to fetch Anchor account for user ${user.id}:`,
        error,
      );
      continue;
    }

    const deltaNaira = anchorBalanceNaira - walletSumNaira;

    if (deltaNaira < -MIN_DEPOSIT_DELTA_NAIRA) {
      short += 1;
      candidates.push({
        userId: user.id,
        email: user.email,
        anchorBalanceNaira,
        walletSumNaira,
        deltaNaira,
        action: "short",
      });
      Sentry.captureMessage(
        `[DepositRecon] Anchor balance BELOW Pocketwise wallets by ${Math.abs(deltaNaira)} NGN for user ${user.id}`,
        { level: "warning" },
      );
      continue;
    }

    if (deltaNaira < MIN_DEPOSIT_DELTA_NAIRA) {
      skipped += 1;
      candidates.push({
        userId: user.id,
        email: user.email,
        anchorBalanceNaira,
        walletSumNaira,
        deltaNaira,
        action: "skip",
      });
      continue;
    }

    candidates.push({
      userId: user.id,
      email: user.email,
      anchorBalanceNaira,
      walletSumNaira,
      deltaNaira,
      action: "credit",
    });

    if (dryRun) {
      skipped += 1;
      continue;
    }

    const outcome = await creditOrphanDeposit(
      user.id,
      user.baasAccountId,
      anchorBalanceNaira,
    );
    if (outcome === "credited") credited += 1;
    else skipped += 1;
  }

  return { checked: users.length, credited, skipped, short, failed, candidates };
}

/**
 * Splits the orphaned balance into the user's four wallets using the same
 * default split the deposit webhook uses. Re-verifies the delta inside the
 * transaction (under FOR UPDATE locks) so a racing sweep can never double-credit.
 */
async function creditOrphanDeposit(
  userId: string,
  baasAccountId: string,
  anchorBalanceNaira: number,
): Promise<"credited" | "skipped"> {
  const split = calculateWalletSplits(
    new Prisma.Decimal(anchorBalanceNaira),
    await getUserSplitConfig(userId),
  );

  let didCredit = false;

  await prisma.$transaction(
    async (tx) => {
      // Serialise concurrent sweep runs on this user's whole wallet set.
      await tx.$queryRawUnsafe(
        `SELECT id FROM wallets WHERE user_id = $1::uuid ORDER BY id FOR UPDATE`,
        userId,
      );

    const wallets = await tx.wallet.findMany({ where: { userId } });
    if (wallets.length < split.length) {
      throw Object.assign(new Error(`Wallets not found for user ${userId}`), {
        statusCode: 404,
      });
    }

    // Re-read the balances AFTER acquiring the lock — if another sweep already
    // credited the delta, the gap is now closed and we must not credit again.
    const walletSumNaira = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    if (anchorBalanceNaira - walletSumNaira < MIN_DEPOSIT_DELTA_NAIRA) {
      return;
    }

    const walletMap = new Map(wallets.map((w) => [w.type, w]));
    const anchorReference = crypto.randomUUID();

    for (const allocation of split) {
      const wallet = walletMap.get(allocation.walletType as WalletType);
      if (!wallet) {
        throw Object.assign(
          new Error(
            `Wallet ${allocation.walletType} not found for user ${userId}`,
          ),
          { statusCode: 404 },
        );
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: allocation.amount } },
      });

      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: "deposit",
          amount: allocation.amount,
          status: "success",
          // Synthetic baasRef — not an Anchor transfer id, but the unique
          // correlation field is what keeps a repeat sweep from re-crediting.
          baasRef: `${anchorReference}-${allocation.walletType}`,
          reference: crypto.randomUUID(),
          reason: "Recovered unrecorded inbound deposit",
        },
      });
    }

    didCredit = true;
    },
    { timeout: 20_000 },
  );

  if (!didCredit) return "skipped";

  cache.del(CACHE_KEYS.userWallets(userId));
  console.log(
    `[DepositRecon] Credited ${anchorBalanceNaira} NGN to user ${userId} (account ${baasAccountId})`,
  );
  return "credited";
}