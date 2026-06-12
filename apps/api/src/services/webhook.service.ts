import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import {
  calculateWalletSplits,
  DEFAULT_WALLET_SPLIT_CONFIG,
} from "./split.service.js";
import crypto from "crypto";
import { cache, CACHE_KEYS } from "../lib/cache.js";

interface AnchorDepositPayload {
  event: string;
  data: {
    reference: string;
    amount: number | string | Prisma.Decimal;
    userId: string;
    status: string;
  };
}

export const webhookService = {
  async processAnchorDepositWebhook(payload: AnchorDepositPayload) {
    const { event, data } = payload;

    // 1. Validation has already been partially done by the controller,
    // but we ensure all expected data fields exist here securely.
    if (!data.status || !data.reference || !data.amount || !data.userId) {
      const error = new Error("Missing required data fields in payload") as any;
      error.statusCode = 400;
      throw error;
    }

    const anchorReference = data.reference;
    const amount = Number(data.amount);

    if (isNaN(amount) || amount <= 0) {
      const error = new Error("Invalid deposit amount") as any;
      error.statusCode = 400;
      throw error;
    }

    // 2. Safe Idempotency Check
    // Use startsWith to match any of the split transactions created previously
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        anchorRef: { startsWith: `${anchorReference}` },
      },
    });

    if (existingTransaction) {
      return { success: true, message: "Webhook already processed" };
    }

    if (event === "deposit.success" && data.status === "success") {
      const userId = data.userId;
      const amount = data.amount;

      const split = calculateWalletSplits(new Prisma.Decimal(amount), {
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
              anchorRef: `${data.reference}-${allocation.walletType}`,
              reference: crypto.randomUUID(),
            },
          });
        }
      });

      cache.del(CACHE_KEYS.userWallets(userId));
      cache.delMany(`txns:${userId}:page:*`);

      return {
        success: true,
        reference: data.reference,
        walletsUpdated: split.length,
      };
    }

    return {
      success: true,
      message: "Event ignored",
    };
  },
};
