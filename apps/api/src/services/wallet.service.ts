import type { TransactionType, WalletType } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import {
  calculateWalletSplits,
  DEFAULT_WALLET_SPLIT_CONFIG,
} from "../services/split.service.js";
import { notificationService } from "../features/notifications/notification.service.js";
import { savingsGoalService } from "./saving-goal.service.js";
import { p2pRecipientService } from "./p2p-recipient.service.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";
import { EmergencyUnlockService } from "./emergency-unlock.service.js";

interface TransferInterface {
  userId: string;
  receiverUserId: string;
  amount: number;
  reason?: string;
}

interface internalWalletTransferInterface {
  userId: string;
  fromType: WalletType;
  toType: WalletType;
  amount: number;
  type: TransactionType;
  reason?: string | undefined;
}

const walletService = {
  async getWallet(userId: string) {
    const cacheKey = CACHE_KEYS.userWallets(userId);
    const cached =
      await cache.get<{ id: string; type: string; isLocked: boolean }[]>(
        cacheKey,
      );

    let wallets;
    if (cached) {
      const balanceData = await prisma.wallet.findMany({
        where: { userId },
        select: { id: true, type: true, balance: true, isLocked: true },
      });
      wallets = balanceData;
    } else {
      wallets = await prisma.wallet.findMany({
        where: { userId },
        select: { id: true, type: true, balance: true, isLocked: true },
      });

      if (wallets.length === 0) {
        const error = new Error("No wallets found") as any;
        error.statusCode = 404;
        throw error;
      }

      const cacheData = wallets.map((w) => ({
        id: w.id,
        type: w.type,
        isLocked: w.isLocked,
      }));
      await cache.set(cacheKey, cacheData, TTL.WALLETS_NO_BALANCE);
    }

    if (wallets.length === 0) {
      const error = new Error("No wallets found") as any;
      error.statusCode = 404;
      throw error;
    }

    let totalBalance = 0;
    for (const wallet of wallets) {
      totalBalance += Number(wallet.balance);
    }

    return { totalBalance, wallets };
  },
};

const transferService = {
  async transfer(data: TransferInterface) {
    const { userId, receiverUserId, amount, reason } = data;

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      const error = new Error("Enter a valid amount") as any;
      error.statusCode = 400;
      throw error;
    }

    if (!receiverUserId) {
      const error = new Error("Receiver not provided") as any;
      error.statusCode = 400;
      throw error;
    }

    if (userId === receiverUserId) {
      const error = new Error("Self transfer not supported") as any;
      error.statusCode = 400;
      throw error;
    }

    const senderWalletCheck = await prisma.wallet.findUnique({
      where: { userId_type: { userId, type: "spend" } },
      select: { id: true },
    });

    if (!senderWalletCheck) {
      const error = new Error("Sender spend wallet not found") as any;
      error.statusCode = 404;
      throw error;
    }

    const receiverCheck = await prisma.user.findUnique({
      where: { id: receiverUserId },
      select: { id: true, firstName: true, lastName: true, userName: true },
    });

    if (!receiverCheck) {
      const error = new Error("Receiver not found") as any;
      error.statusCode = 404;
      throw error;
    }

    const transferReference = crypto.randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      const senderWallet = await tx.wallet.findUnique({
        where: { userId_type: { userId, type: "spend" } },
      });

      if (!senderWallet) {
        const error = new Error("Sender spend wallet not found") as any;
        error.statusCode = 404;
        throw error;
      }

      if (senderWallet.balance.toNumber() < amount) {
        const error = new Error("Insufficient funds") as any;
        error.statusCode = 400;
        throw error;
      }

      // Debit sender
      const updatedSenderWallet = await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      });

      // Fetch receiver split config or fall back to default
      const receiverSplitConfig = await tx.walletSplitConfig.findUnique({
        where: { userId: receiverUserId },
      });

      const config = receiverSplitConfig ?? {
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
      };

      // Calculate allocations
      const allocations = calculateWalletSplits(
        new Prisma.Decimal(amount),
        config,
      );

      // Fetch all receiver wallets and map by type
      const receiverWallets = await tx.wallet.findMany({
        where: { userId: receiverUserId },
      });

      const receiverWalletMap = new Map(
        receiverWallets.map((w) => [w.type, w]),
      );

      // Credit each receiver wallet and create credit records
      for (const allocation of allocations) {
        const receiverWallet = receiverWalletMap.get(allocation.walletType);

        if (!receiverWallet) {
          throw new Error(`Receiver ${allocation.walletType} wallet not found`);
        }

        await tx.wallet.update({
          where: { id: receiverWallet.id },
          data: { balance: { increment: allocation.amount } },
        });

        await tx.transaction.create({
          data: {
            userId: receiverUserId,
            walletId: receiverWallet.id,
            type: "split_credit",
            amount: allocation.amount,
            status: "success",
            reference: `${transferReference}-${allocation.walletType}`,
            senderWalletId: senderWallet.id,
            receiverWalletId: receiverWallet.id,
          },
        });
      }

      // Create single debit record for sender
      await tx.transaction.create({
        data: {
          userId,
          walletId: senderWallet.id,
          type: "transfer",
          amount: -amount,
          reason: reason || null,
          status: "success",
          reference: transferReference,
          senderWalletId: senderWallet.id,
          receiverWalletId: null,
        },
      });

      return {
        reference: transferReference,
        senderBalance: updatedSenderWallet.balance,
        allocations,
      };
    });

    savingsGoalService.checkAndUpdateGoal(receiverUserId).catch(() => { });
    notificationService
      .notifyTransferReceived(receiverUserId, amount, "A PocketWise user")
      .catch(() => { });
    notificationService
      .notifyWalletSplit(receiverUserId, amount, result.allocations)
      .catch(() => { });

    cache.del(CACHE_KEYS.userWallets(userId)).catch(() => { });
    cache.del(CACHE_KEYS.userWallets(receiverUserId)).catch(() => { });

    p2pRecipientService
      .upsertRecipient({
        userId,
        recipientUserId: receiverUserId,
        recipientFirstName: receiverCheck.firstName,
        recipientLastName: receiverCheck.lastName,
        recipientUserName: receiverCheck.userName,
      })
      .catch(() => { });

    return result;
  },
};

const internalWalletTransferService = {
  async internalWalletTransfer(data: internalWalletTransferInterface) {
    const { userId, fromType, toType, amount, type, reason } = data;

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      const error = new Error(
        "Transfer amount must be greater than zero",
      ) as any;
      error.statusCode = 400;
      throw error;
    }


    const reference = crypto.randomUUID();

    let emergencyRequestId: string | undefined = undefined;

    const result = await prisma.$transaction(
      async (tx) => {
        // Lock both wallet rows
        await tx.$queryRaw`
        SELECT id
        FROM wallets
        WHERE user_id = ${userId}::uuid
          AND type IN (${fromType}, ${toType})
        FOR UPDATE
    `;

        const wallets = await tx.wallet.findMany({
          where: {
            userId: data.userId,
            type: {
              in: [data.fromType, data.toType],
            },
          },
        });

        const fromWallet = wallets.find(
          (wallets) => wallets.type === data.fromType,
        );

        const toWallet = wallets.find(
          (wallets) => wallets.type === data.toType,
        );

        if (!fromWallet) {
          throw new Error(`${data.fromType} wallet not found`);
        }

        function formatUnlockTime(unlocksAt: Date): string {
          const diffMs = new Date(unlocksAt).getTime() - Date.now();
          if (diffMs <= 0) return "any moment now";
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          if (hours > 0) return `${hours}h ${minutes}m`;
          if (minutes > 0) return `${minutes} minutes`;
          return "less than a minute";
        }

        if (fromWallet.type === "emergency") {
          const status = await EmergencyUnlockService.checkUnlockStatus(userId)
          if (!status.isUnlocked) {
            throw Object.assign(
              new Error(
                status.reason === "cooling_down"
                  ? `Your emergency wallet unlocks in ${formatUnlockTime(status.unlocksAt!)}`
                  : "Request an unlock before transferring from your emergency wallet"
              ),
              { statusCode: 403 }
            );
          }
          emergencyRequestId = status.requestId
        }

        if (!toWallet) {
          throw new Error(`${data.toType} wallet not found`);
        }

        if (fromWallet.balance.toNumber() < amount) {
          throw new Error("Insufficient funds");
        }

        const deductWallet = await tx.wallet.update({
          where: {
            id: fromWallet.id,
          },
          data: {
            balance: { decrement: amount },
          },
        });

        const addWallet = await tx.wallet.update({
          where: {
            id: toWallet.id,
          },
          data: {
            balance: { increment: amount },
          },
        });

        // Create Sender DEBIT transaction
        await tx.transaction.create({
          data: {
            userId,
            walletId: fromWallet.id,
            type: type,
            amount: -amount,
            status: "success",
            reference: reference,
            senderWalletId: deductWallet.id,
            receiverWalletId: addWallet.id,
            reason: reason ?? null,
          },
        });

        // Create Receiver CREDIT transaction
        await tx.transaction.create({
          data: {
            userId: addWallet.userId,
            walletId: addWallet.id,
            type: type,
            amount: amount,
            status: "success",
            reference: `${reference}-rx`,
            senderWalletId: deductWallet.id,
            receiverWalletId: addWallet.id,
            reason: reason ?? null,
          },
        });

        return {
          reference,
          fromWalletBalance: deductWallet.balance,
          toWalletBalance: addWallet.balance,
        };
      },
      {
        timeout: 15000,
      },
    );

    if (emergencyRequestId) {
      await EmergencyUnlockService.markRequestCompleted(emergencyRequestId);
    }

    cache.del(CACHE_KEYS.userWallets(userId));

    return result;
  },
};

export { walletService, transferService, internalWalletTransferService };
