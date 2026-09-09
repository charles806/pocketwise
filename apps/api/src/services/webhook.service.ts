import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import {
  calculateWalletSplits,
  DEFAULT_WALLET_SPLIT_CONFIG,
} from "./split.service.js";
import crypto from "crypto";
import { cache, CACHE_KEYS } from "../lib/cache.js";

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
              baasRef: `${anchorReference}-${allocation.walletType}`,
              reference: crypto.randomUUID(),
            },
          });
        }
      });

      cache.del(CACHE_KEYS.userWallets(userId));

      return {
        success: true,
        reference: anchorReference,
        walletsUpdated: split.length,
      };
    }

    return {
      success: true,
      message: "Event ignored",
    };
  },
};
