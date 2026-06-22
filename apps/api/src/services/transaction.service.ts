import prisma from "../lib/prisma.js";

type Direction = "sent" | "received" | "deposit";
type TypeFilter = "sent" | "received" | "deposit";

interface EnrichedTransaction {
  id: string;
  type: string;
  direction: Direction;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: Date;
  counterpartyName: string | null;
}

function getDirection(tx: { type: string; amount: number }): Direction {
  switch (tx.type) {
    case "transfer":
    case "withdrawal":
    case "fee":
    case "goal_completion":
      return "sent";
    case "split_credit":
      return "received";
    case "referral_credit":
    case "deposit":
      return "deposit";
    case "internal_transfer":
      return tx.amount < 0 ? "sent" : "received";
    default:
      return tx.amount < 0 ? "sent" : "received";
  }
}

export const transactionService = {
  async getUserTransactions(userId: string, page: number, type?: TypeFilter) {
    const take = 20;
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = { userId };
    if (type === "sent") {
      where.type = "transfer";
    } else if (type === "received") {
      where.type = "split_credit";
    } else if (type === "deposit") {
      where.type = "deposit";
    }

    const [rawTransactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.transaction.count({ where: where as any }),
    ]);

    const normalised = rawTransactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    const enriched = await this.enrichTransactions(normalised);

    return {
      transactions: enriched,
      hasMore: skip + take < totalCount,
      page,
    };
  },

  async enrichTransactions(
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      reason: string | null;
      status: string;
      createdAt: Date;
      reference: string;
      senderWalletId: string | null;
      receiverWalletId: string | null;
    }>,
  ) {
    const splitCreditTxns = transactions.filter(
      (t) => t.type === "split_credit" && t.senderWalletId,
    );
    const transferTxns = transactions.filter((t) => t.type === "transfer");

    const walletUserMap = new Map<string, string>();
    if (splitCreditTxns.length > 0) {
      const senderWalletIds = [
        ...new Set(
          splitCreditTxns.map((t) => t.senderWalletId!).filter(Boolean),
        ),
      ];
      const wallets = await prisma.wallet.findMany({
        where: { id: { in: senderWalletIds } },
        select: { id: true, userId: true },
      });
      const userIds = [...new Set(wallets.map((w) => w.userId))];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      for (const w of wallets) {
        const user = userMap.get(w.userId);
        if (user) {
          walletUserMap.set(w.id, `${user.firstName} ${user.lastName}`);
        }
      }
    }

    const refToReceiverMap = new Map<string, string>();
    if (transferTxns.length > 0) {
      const suffixes = ["spend", "savings", "emergency", "flex"];
      const possibleRefs = transferTxns.flatMap((t) =>
        suffixes.map((s) => `${t.reference}-${s}`),
      );
      const receiverRecords = await prisma.transaction.findMany({
        where: {
          type: "split_credit",
          reference: { in: possibleRefs },
        },
        select: { reference: true, userId: true },
      });

      if (receiverRecords.length > 0) {
        const receiverUserIds = [
          ...new Set(receiverRecords.map((r) => r.userId)),
        ];
        const receiverUsers = await prisma.user.findMany({
          where: { id: { in: receiverUserIds } },
          select: { id: true, firstName: true, lastName: true },
        });
        const receiverUserMap = new Map(
          receiverUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`]),
        );

        for (const record of receiverRecords) {
          const refPrefix = record.reference.replace(
            /-(spend|savings|emergency|flex)$/,
            "",
          );
          const name = receiverUserMap.get(record.userId);
          if (name && !refToReceiverMap.has(refPrefix)) {
            refToReceiverMap.set(refPrefix, name);
          }
        }
      }
    }

    return transactions.map((tx) => {
      const direction = getDirection(tx);

      let counterpartyName: string | null = null;
      if (tx.type === "split_credit") {
        counterpartyName = walletUserMap.get(tx.senderWalletId ?? "") ?? null;
      } else if (tx.type === "transfer") {
        counterpartyName = refToReceiverMap.get(tx.reference) ?? null;
      } else if (tx.type === "deposit") {
        counterpartyName = "Deposit via Anchor";
      } else if (tx.type === "referral_credit") {
        counterpartyName = "Referral Bonus";
      }

      return {
        id: tx.id,
        type: tx.type,
        direction,
        amount: Number(tx.amount),
        reason: tx.reason,
        status: tx.status,
        createdAt: tx.createdAt,
        counterpartyName,
      };
    });
  },
};
