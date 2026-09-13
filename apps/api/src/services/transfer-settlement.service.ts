import { type Transaction } from "@prisma/client";
import crypto from "crypto";
import { baasRequest } from "../lib/baas.js";
import { cache, CACHE_KEYS } from "../lib/cache.js";
import prisma from "../lib/prisma.js";
import { notificationService } from "../features/notifications/notification.service.js";
import { bankRecipientService } from "./bank-recipient.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// Transfer settlement core.
//
// One source of truth for reconciling an outbound transfer against Anchor:
// used by BOTH the real-time webhook handlers (nip.transfer.* / book.transfer.*)
// and the scheduled + opportunistic sweep (sweepStalePendingTransfers), so the
// two can never drift in behaviour.
//
// Money rules:
//  - success (book)  -> credit the receiver's Spend wallet, write a credit
//                       transaction, mark the sender's debit success.
//  - success (nip)   -> mark the sender's debit success (recipient is external).
//  - failed/reversed -> refund the sender's Spend wallet by abs(debit amount),
//                       mark the debit failed.
//
// Idempotency: the sender's debit row is claimed with SELECT ... FOR UPDATE and
// re-checked for status = "pending" inside the same transaction, so webhook,
// sweep and QStash retries can settle each transfer exactly once.
// ─────────────────────────────────────────────────────────────────────────────

interface SettleOptions {
  // Overrides the notification amount when the caller's source (webhook
  // payload) is more authoritative than the DB debit record.
  notifiedAmountNaira?: number;
}

interface SettleResult {
  outcome: "settled" | "skipped";
  kind: "nip" | "book";
  senderUserId: string;
  receiverUserId?: string | undefined;
  amount: number;
  notifiedAmount: number;
}

const isBookTransfer = (transaction: Transaction): boolean =>
  Boolean(transaction.receiverWalletId);

async function resolveRecipientName(userId: string): Promise<string> {
  const [recipient] = await bankRecipientService.getRecentRecipients(userId);
  return recipient
    ? `${recipient.accountName} at ${recipient.bankName}`
    : "your bank account";
}

async function settleOutboundTransfer(
  transaction: Transaction,
  finalStatus: "success" | "failed",
  options: SettleOptions = {},
): Promise<SettleResult> {
  const amount = Math.abs(Number(transaction.amount));
  const notifiedAmount = options.notifiedAmountNaira ?? amount;
  const kind = isBookTransfer(transaction) ? "book" : "nip";
  let receiverUserId: string | undefined;

  let didSettle = false;

  await prisma.$transaction(async (tx) => {
    // Claim the debit row so concurrent webhook/sweep runs settle it once.
    await tx.$queryRawUnsafe(
      `SELECT id FROM transactions WHERE id = $1::uuid FOR UPDATE`,
      transaction.id,
    );

    const current = await tx.transaction.findUnique({
      where: { id: transaction.id },
    });

    if (!current || current.status !== "pending") {
      return;
    }

    didSettle = true;

    if (finalStatus === "success") {
      if (kind === "book") {
        const receiverWallet = await tx.wallet.findUnique({
          where: { id: current.receiverWalletId! },
          select: { userId: true },
        });

        if (!receiverWallet) {
          throw new Error(
            `Receiver spend wallet not found for book transfer ${current.baasRef}`,
          );
        }

        await tx.$queryRawUnsafe(
          `SELECT id FROM wallets WHERE id = $1::uuid FOR UPDATE`,
          current.receiverWalletId!,
        );

        await tx.wallet.update({
          where: { id: current.receiverWalletId! },
          data: { balance: { increment: amount } },
        });

        await tx.transaction.create({
          data: {
            userId: receiverWallet.userId,
            walletId: current.receiverWalletId!,
            type: "transfer",
            amount,
            reason: current.reason,
            status: "success",
            reference: crypto.randomUUID(),
            senderWalletId: current.senderWalletId,
            receiverWalletId: current.receiverWalletId!,
          },
        });

        receiverUserId = receiverWallet.userId;
      }

      await tx.transaction.update({
        where: { id: current.id },
        data: { status: "success" },
      });
    } else {
      await tx.$queryRawUnsafe(
        `SELECT id FROM wallets WHERE user_id = $1::uuid AND type = 'spend' FOR UPDATE`,
        current.userId,
      );

      await tx.wallet.update({
        where: { id: current.walletId },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.update({
        where: { id: current.id },
        data: { status: "failed" },
      });
    }
  });

  if (!didSettle) {
    return {
      outcome: "skipped",
      kind,
      senderUserId: transaction.userId,
      receiverUserId,
      amount,
      notifiedAmount,
    };
  }

  // Best-effort labels for notifications (must not block settlement).
  let receiverLabel = "PocketWise user";
  let senderName: string | undefined;
  if (kind === "book") {
    const receiverId = receiverUserId ?? (await resolveReceiverUserId());
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: transaction.userId },
        select: { firstName: true, lastName: true },
      }),
      receiverId
        ? prisma.user.findUnique({
            where: { id: receiverId },
            select: { firstName: true, lastName: true },
          })
        : null,
    ]);
    senderName = sender
      ? `${sender.firstName} ${sender.lastName}`
      : undefined;
    receiverLabel = receiver
      ? `${receiver.firstName} ${receiver.lastName}`
      : receiverLabel;
    receiverUserId = receiverId;
  } else {
    receiverLabel = await resolveRecipientName(transaction.userId);
  }

  if (finalStatus === "success") {
    notificationService
      .notifyTransferSent(transaction.userId, notifiedAmount, receiverLabel)
      .catch(() => {});

    if (kind === "book" && receiverUserId && senderName) {
      notificationService
        .notifyBookTransferReceived(receiverUserId, notifiedAmount, senderName)
        .catch(() => {});

      cache.del(CACHE_KEYS.userWallets(receiverUserId));
    }
  } else {
    notificationService
      .notifyTransferFailed(transaction.userId, notifiedAmount, receiverLabel)
      .catch(() => {});
  }

  cache.del(CACHE_KEYS.userWallets(transaction.userId));

  return {
    outcome: "settled",
    kind,
    senderUserId: transaction.userId,
    receiverUserId,
    amount,
    notifiedAmount,
  };

  async function resolveReceiverUserId(): Promise<string | undefined> {
    if (!transaction.receiverWalletId) return undefined;
    const wallet = await prisma.wallet.findUnique({
      where: { id: transaction.receiverWalletId! },
      select: { userId: true },
    });
    return wallet?.userId;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sweep — finds stale pending outbound transfers, asks Anchor for their real
// status, and settles them. Fully idempotent thanks to settleOutboundTransfer.
// Runs from the scheduled QStash job AND opportunistically from the webhook
// controller, so reconciliation progresses even if the scheduler is down.
// ─────────────────────────────────────────────────────────────────────────────

// Statuses observed on GET /transfers/verify/:id. Anything else means the
// transfer is still in flight or unknown — leave it for the next pass.
const STATUS_TO_FINAL: Record<string, "success" | "failed"> = {
  COMPLETED: "success",
  SUCCESSFUL: "success",
  FAILED: "failed",
  REVERSED: "failed",
};

interface SweepOptions {
  limit?: number;
  maxAgeMs?: number;
}

const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_AGE_MS = 3 * 60_000;

async function fetchTransferStatus(
  transferId: string,
): Promise<string | undefined> {
  const response = await baasRequest(
    "GET",
    `/api/v1/transfers/verify/${transferId}`,
  );
  return (response as any)?.data?.attributes?.status as string | undefined;
}

export async function sweepStalePendingTransfers(
  options: SweepOptions = {},
): Promise<{
  checked: number;
  settled: number;
  skipped: number;
  failed: number;
}> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  const cutoff = new Date(Date.now() - maxAgeMs);

  const pendings = await prisma.transaction.findMany({
    where: {
      status: "pending",
      baasRef: { not: null },
      createdAt: { lt: cutoff },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let settled = 0;
  let skipped = 0;
  let failed = 0;

  for (const transaction of pendings) {
    try {
      if (!transaction.baasRef) continue;

      const status = await fetchTransferStatus(transaction.baasRef);
      const finalStatus = status ? STATUS_TO_FINAL[status] : undefined;

      if (!finalStatus) {
        skipped += 1;
        continue;
      }

      const result = await settleOutboundTransfer(transaction, finalStatus);
      if (result.outcome === "settled") {
        settled += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      failed += 1;
      console.error(
        `[Sweep] Failed to reconcile transfer ${transaction.baasRef}:`,
        error,
      );
    }
  }

  return { checked: pendings.length, settled, skipped, failed };
}

export { settleOutboundTransfer };
export type { SettleOptions, SettleResult };