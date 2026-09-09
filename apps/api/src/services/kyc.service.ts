import prisma from "../lib/prisma.js";
import { cache, CACHE_KEYS } from "../lib/cache.js";
import {
  getCustomerVerification,
  createDepositAccountWithDetails,
} from "../lib/baas.js";

const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 2000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface KycApprovedResult {
  status: "approved";
  kycTier: number;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  showAccountModal: boolean;
}

export interface KycPendingResult {
  status: "pending";
}

export const KycService = {
  /**
   * Polls Anchor until the customer's KYC verification is approved, then
   * provisions a deposit account + account number and persists everything.
   *
   * This bypasses webhooks entirely (used in sandbox/dev where live Anchor
   * webhooks aren't configured). The webhook handler remains the production
   * path but writes the same fields.
   */
  async completeKycForUser(userId: string, baasCustomerId: string) {
    let approved = false;
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      try {
        const verification = await getCustomerVerification(baasCustomerId);
        if (verification?.status === "approved") {
          approved = true;
          break;
        }
      } catch (error) {
        console.error("[KYC] Error polling Anchor verification:", error);
      }

      if (attempt < POLL_ATTEMPTS - 1) {
        await sleep(POLL_INTERVAL_MS);
      }
    }

    if (!approved) {
      return { status: "pending" } as KycPendingResult;
    }

    let depositAccountId: string | undefined;
    let nuban = "";
    let bankName: string | undefined;
    let accountName: string | undefined;

    try {
      const details = await createDepositAccountWithDetails(baasCustomerId, userId);
      depositAccountId = details.depositAccountId;
      nuban = details.nuban;
      bankName = details.bankName;
      accountName = details.accountName;
    } catch (error) {
      console.error("[KYC] Failed to provision deposit account:", error);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        kycTier: 1,
        showAccountModal: true,
        ...(depositAccountId
          ? { baasAccountId: depositAccountId }
          : {}),
        ...(nuban ? { accountNumber: nuban } : {}),
        ...(bankName ? { bankName } : {}),
        ...(accountName ? { accountName } : {}),
      },
    });

    await cache.del(CACHE_KEYS.userProfile(userId));

    return {
      status: "approved",
      kycTier: 1,
      accountNumber: nuban || undefined,
      bankName,
      accountName,
      showAccountModal: true,
    } as KycApprovedResult;
  },

  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        kycTier: true,
        accountNumber: true,
        bankName: true,
        accountName: true,
        showAccountModal: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    return {
      kycTier: user.kycTier,
      accountNumber: user.accountNumber,
      bankName: user.bankName,
      accountName: user.accountName,
      showAccountModal: user.showAccountModal,
    };
  },

  async dismissAccountModal(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { showAccountModal: false },
    });
    await cache.del(CACHE_KEYS.userProfile(userId));
    return { success: true };
  },
};
