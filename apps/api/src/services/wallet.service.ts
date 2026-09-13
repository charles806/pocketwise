import type { TransactionType, WalletType } from "@prisma/client";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { notificationService } from "../features/notifications/notification.service.js";
import { p2pRecipientService } from "./p2p-recipient.service.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";
import { EmergencyUnlockService } from "./emergency-unlock.service.js";
import { walletHelper } from "../helper/wallet-helpers.js";
import { feeCalculator } from "../helper/fee-calculator.js";
import { bankRecipientService } from "./bank-recipient.service.js";
import { createCounterParty, initiateNIPTransfer, initiateBookTransfer } from "../lib/baas.js";
import { isVerifiedUser, requireVerifiedError } from "../utils/verification.js";

interface TransferInterface {
  userId: string;
  receiverUserId: string;
  amount: number;
  reason?: string;
}

interface BookTransferInterface {
  userId: string;
  receiverUserId: string;
  amount: number;
  reason?: string | undefined;
}

interface internalWalletTransferInterface {
  userId: string;
  fromType: WalletType;
  toType: WalletType;
  amount: number;
  type: TransactionType;
  reason?: string | undefined;
  skipAllocationGuard?: boolean;
}

const BANK_CODES: Record<string, string> = {
  "058": "Guaranty Trust Bank",
  "011": "First Bank of Nigeria",
  "044": "Access Bank",
  "057": "Zenith Bank",
  "033": "United Bank for Africa",
  "232": "Sterling Bank",
  "215": "Unity Bank",
  "035": "Wema Bank",
  "070": "Fidelity Bank",
  "301": "Jaiz Bank",
  "076": "Polaris Bank",
  "221": "Stanbic IBTC Bank",
  "068": "Standard Chartered Bank",
  "023": "Citibank Nigeria",
  "063": "Diamond Bank",
  "100": "Suntrust Bank",
  "050": "EcoBank Nigeria",
  "999992": "OPay",
  "999991": "PalmPay",
  "999993": "Kuda Bank",
};

interface BankTransferInterface {
  bankCode: string;
  accountNumber: string;
  amount: number;
  accountName: string;
  reason: string;
  pin: string;
}

const walletService = {
  async getWallet(userId: string) {
    const cacheKey = CACHE_KEYS.userWallets(userId);
    const cached = await cache.get<{ id: string; type: string }[]>(cacheKey);

    let wallets;
    if (cached) {
      const balanceData = await prisma.wallet.findMany({
        where: { userId },
        select: { id: true, type: true, balance: true },
      });
      wallets = balanceData;
    } else {
      wallets = await prisma.wallet.findMany({
        where: { userId },
        select: { id: true, type: true, balance: true },
      });

      if (wallets.length === 0) {
        const error = new Error("No wallets found") as any;
        error.statusCode = 404;
        throw error;
      }

      const cacheData = wallets.map((w) => ({
        id: w.id,
        type: w.type,
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

    if (!data.reason || !data.reason.trim()) {
      const error = new Error(
        "Please provide a reason for this transfer",
      ) as any;
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

    const [user, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, kycTier: true, baasAccountId: true },
      }),
      prisma.user.findUnique({
        where: { id: receiverUserId },
        select: { id: true, kycTier: true, baasAccountId: true },
      }),
    ]);

    if (!user) {
      const error = new Error("User not found") as any;
      error.statusCode = 404;
      throw error;
    }

    if (!receiver) {
      const error = new Error("Receiver not found") as any;
      error.statusCode = 404;
      throw error;
    }

    // Transfers require both parties to be verified (KYC + Anchor account). An
    // unverified user has no real-money path, so there is no ledger-only
    // fallback — this is always an Anchor book transfer.
    if (!isVerifiedUser(user)) {
      throw requireVerifiedError;
    }

    if (!isVerifiedUser(receiver)) {
      throw Object.assign(
        new Error(
          "The recipient must complete identity verification (KYC) before receiving transfers.",
        ),
        { statusCode: 400 },
      );
    }

    return bookTransferService.sendToUser({
      userId,
      receiverUserId,
      amount,
      reason,
    });
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
          const status = await EmergencyUnlockService.checkUnlockStatus(userId);
          if (!status.isUnlocked) {
            throw Object.assign(
              new Error(
                status.reason === "cooling_down"
                  ? `Your emergency wallet unlocks in ${formatUnlockTime(status.unlocksAt!)}`
                  : "Request an unlock before transferring from your emergency wallet",
              ),
              { statusCode: 403 },
            );
          }
          emergencyRequestId = status.requestId;
        }

        if (!toWallet) {
          throw new Error(`${data.toType} wallet not found`);
        }

        if (fromWallet.balance.toNumber() < amount) {
          throw new Error("Insufficient funds");
        }

        if (fromWallet.type === "savings" && !data.skipAllocationGuard) {
          const unallocatedSavings =
            await walletHelper.getUnallocatedSavings(userId);
          if (amount > unallocatedSavings) {
            const error = new Error(
              `You can't transfer this much from Savings — ₦${unallocatedSavings} is allocated to your goals. Cancel a goal first to free it up.`,
            ) as any;
            error.statusCode = 400;
            throw error;
          }
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

export const bookTransferService = {
  async sendToUser(data: BookTransferInterface) {
    const { userId, receiverUserId, amount, reason } = data;

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      throw Object.assign(new Error("Enter a valid amount"), {
        statusCode: 400,
      });
    }

    if (!reason || !reason.trim()) {
      throw Object.assign(
        new Error("Please provide a reason for this transfer"),
        { statusCode: 400 },
      );
    }

    if (!receiverUserId) {
      throw Object.assign(new Error("Receiver not provided"), {
        statusCode: 400,
      });
    }

    if (userId === receiverUserId) {
      throw Object.assign(new Error("Self transfer not supported"), {
        statusCode: 400,
      });
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          baasAccountId: true,
          firstName: true,
          lastName: true,
          userName: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: receiverUserId },
        select: {
          id: true,
          baasAccountId: true,
          firstName: true,
          lastName: true,
          userName: true,
        },
      }),
    ]);

    if (!sender) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    if (!receiver) {
      throw Object.assign(new Error("Receiver not found"), {
        statusCode: 404,
      });
    }
    if (!sender.baasAccountId || !receiver.baasAccountId) {
      throw Object.assign(
        new Error(
          "Real-money transfers require both users to have completed account setup.",
        ),
        { statusCode: 400 },
      );
    }

    // Book transfers are free, so the full amount is the deduction.
    const totalDeduction = amount;
    const reference = crypto.randomUUID();
    const anchorReference = reference.replace(/-/g, "");
    const amountInKobo = Math.round(amount * 100);
    const transferReason = reason ?? "";

    // 1. Single DB transaction: lock the sender's Spend wallet, verify balance,
    // deduct, and record a PENDING transaction. The receiver gets credited when
    // the book.transfer.successful webhook lands.
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRawUnsafe(
        `SELECT id FROM wallets WHERE user_id = $1::uuid AND type = 'spend' FOR UPDATE`,
        userId,
      );

      const spendWallet = await tx.wallet.findUnique({
        where: { userId_type: { userId, type: "spend" } },
      });

      if (!spendWallet) {
        throw Object.assign(new Error("Sender spend wallet not found"), {
          statusCode: 404,
        });
      }

      if (spendWallet.balance.toNumber() < totalDeduction) {
        throw Object.assign(new Error("Insufficient funds"), {
          statusCode: 400,
        });
      }

      // Persist the receiver's spend wallet id on the debit record so the
      // webhook knows exactly where to credit when the book transfer settles.
      const receiverSpendWallet = await tx.wallet.findUnique({
        where: { userId_type: { userId: receiverUserId, type: "spend" } },
        select: { id: true },
      });

      if (!receiverSpendWallet) {
        throw Object.assign(new Error("Receiver spend wallet not found"), {
          statusCode: 404,
        });
      }

      const deductedWallet = await tx.wallet.update({
        where: { id: spendWallet.id },
        data: { balance: { decrement: totalDeduction } },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: spendWallet.id,
          type: "transfer",
          amount: -totalDeduction,
          status: "pending",
          reason: reason || null,
          reference,
          senderWalletId: spendWallet.id,
          receiverWalletId: receiverSpendWallet.id,
        },
      });

      return {
        transaction,
        newBalance: deductedWallet.balance,
      };
    });

    // 2. After commit, move the real money at Anchor.
    let transferId: string | undefined;
    try {
      transferId = await initiateBookTransfer(
        sender.baasAccountId,
        receiver.baasAccountId,
        amountInKobo,
        transferReason,
        anchorReference,
      );
    } catch (error) {
      // The Anchor call itself failed → re-credit and mark the transaction failed.
      await prisma.$transaction(async (tx) => {
        await tx.$queryRawUnsafe(
          `SELECT id FROM wallets WHERE user_id = $1::uuid AND type = 'spend' FOR UPDATE`,
          userId,
        );

        await tx.wallet.updateMany({
          where: { userId, type: "spend" },
          data: { balance: { increment: totalDeduction } },
        });

        await tx.transaction.update({
          where: { id: result.transaction.id },
          data: { status: "failed" },
        });
      });

      notificationService
        .notifyTransferFailed(
          userId,
          amount,
          `${receiver.firstName} ${receiver.lastName}`,
        )
        .catch(() => {});

      cache.del(CACHE_KEYS.userWallets(userId));

      throw Object.assign(
        new Error(
          "We couldn't complete this transfer. Your money has been returned to your Spend wallet. Please try again.",
        ),
        { statusCode: (error as any)?.statusCode || 502 },
      );
    }

    // 3. Anchor accepted it — persist the reference. Deliberately outside the
    // refund path: if this write fails, money has still moved and the transfer
    // webhook will reconcile by baasRef.
    await prisma.transaction
      .update({
        where: { id: result.transaction.id },
        data: { baasRef: transferId },
      })
      .catch((error) => {
        console.error(
          "[sendToUser] Transfer initiated but failed to persist baasRef:",
          error,
        );
      });

    // 4. Upsert the P2P recipient + invalidate caches.
    p2pRecipientService
      .upsertRecipient({
        userId,
        recipientUserId: receiverUserId,
        recipientFirstName: receiver.firstName,
        recipientLastName: receiver.lastName,
        recipientUserName: receiver.userName,
      })
      .catch(() => {});

    cache.del(CACHE_KEYS.userWallets(userId));

    return {
      reference,
      amount,
      status: "pending",
      receiverUserId,
      newBalance: result.newBalance,
    };
  },
};

export const bankTransferService = {
  async sendToBank(userId: string, data: BankTransferInterface) {
    const getUser = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        transferPin: true,
        baasAccountId: true,
      },
    });

    if (!getUser) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    if (!getUser.transferPin) {
      throw Object.assign(new Error("Transfer PIN not set up"), {
        statusCode: 400,
      });
    }

    const isPinValid = await bcrypt.compare(data.pin, getUser.transferPin);
    if (!isPinValid) {
      throw Object.assign(new Error("Invalid PIN"), { statusCode: 401 });
    }

    if (!getUser.baasAccountId) {
      throw Object.assign(
        new Error(
          "Bank transfers are not available yet. Please complete your KYC to enable them.",
        ),
        { statusCode: 400 },
      );
    }

    const fee = feeCalculator(data.amount) ?? 0;
    const totalDeduction = data.amount + fee;

    const bankName = BANK_CODES[data.bankCode] ?? "Unknown Bank";
    const reference = crypto.randomUUID();
    const anchorReference = reference.replace(/-/g, "");
    const amountInKobo = Math.round(data.amount * 100);

    // 1. Counterparty resolution: reuse a persisted one if it exists, otherwise
    // create it at Anchor and persist the id onto the recipient record.
    let counterPartyId: string;
    const existingRecipient = await bankRecipientService.getByAccount(
      userId,
      data.accountNumber,
    );

    if (existingRecipient?.counterPartyId) {
      counterPartyId = existingRecipient.counterPartyId;
    } else {
      const counterParty = await createCounterParty(
        data.bankCode,
        data.accountNumber,
        data.accountName,
      );
      counterPartyId = counterParty.id;
    }

    // 2. Single DB transaction: lock the Spend wallet, verify balance, deduct
    // the amount + fee, and record a PENDING transaction. Nothing is credited
    // or marked successful here — the Anchor call happens after commit.
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRawUnsafe(
        `SELECT id FROM wallets WHERE user_id = $1::uuid AND type = 'spend' FOR UPDATE`,
        userId,
      );

      const spendWallet = await tx.wallet.findUnique({
        where: { userId_type: { userId, type: "spend" } },
      });

      if (!spendWallet) {
        throw Object.assign(new Error("Spend wallet not found"), {
          statusCode: 404,
        });
      }

      if (spendWallet.balance.toNumber() < totalDeduction) {
        throw Object.assign(new Error("Insufficient funds"), {
          statusCode: 400,
        });
      }

      const deductedWallet = await tx.wallet.update({
        where: { id: spendWallet.id },
        data: { balance: { decrement: totalDeduction } },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: spendWallet.id,
          type: "transfer",
          amount: -totalDeduction,
          status: "pending",
          reason: data.reason,
          reference,
        },
      });

      return {
        transaction,
        newBalance: deductedWallet.balance,
      };
    });

    // 3. After commit, initiate the actual NIP transfer at Anchor.
    let transferId: string | undefined;
    try {
      transferId = await initiateNIPTransfer(
        getUser.baasAccountId,
        counterPartyId,
        amountInKobo,
        data.reason,
        anchorReference,
      );
    } catch (error) {
      // 4. If the Anchor call itself fails, re-credit amount + fee and mark the
      // transaction failed, then notify the user.
      await prisma.$transaction(async (tx) => {
        await tx.$queryRawUnsafe(
          `SELECT id FROM wallets WHERE user_id = $1::uuid AND type = 'spend' FOR UPDATE`,
          userId,
        );

        await tx.wallet.updateMany({
          where: { userId, type: "spend" },
          data: { balance: { increment: totalDeduction } },
        });

        await tx.transaction.update({
          where: { id: result.transaction.id },
          data: { status: "failed" },
        });
      });

      notificationService
        .notifyTransferFailed(
          userId,
          data.amount,
          `${data.accountName} at ${bankName}`,
        )
        .catch(() => {});

      cache.del(CACHE_KEYS.userWallets(userId));

      throw Object.assign(
        new Error(
          "We couldn't complete this transfer. Your money has been returned to your Spend wallet. Please try again.",
        ),
        { statusCode: (error as any)?.statusCode || 502 },
      );
    }

    // Anchor already accepted the transfer — persist its reference. This is
    // deliberately OUTSIDE the refund path: if this update ever fails, the
    // money has still moved, and the transfer webhook will reconcile the
    // transaction by baasRef instead.
    await prisma.transaction
      .update({
        where: { id: result.transaction.id },
        data: { baasRef: transferId },
      })
      .catch((error) => {
        console.error(
          "[sendToBank] Transfer initiated but failed to persist baasRef:",
          error,
        );
      });

    //  Upsert recipient for recent recipients list (with counterparty id)
    await bankRecipientService.upsertRecipient(userId, {
      bankCode: data.bankCode,
      bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      counterPartyId,
      userId: userId,
    });

    cache.del(CACHE_KEYS.userWallets(userId));

    return {
      reference,
      amount: data.amount,
      fee,
      totalDeduction,
      newBalance: result.newBalance,
      bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
    };
  },
};

export { walletService, transferService, internalWalletTransferService };
