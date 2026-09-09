import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { upgradeCustomerKYC } from "../lib/baas.js";
import { KycService } from "../services/kyc.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const PENDING_MESSAGE =
  "Verification submitted successfully. You will be notified once your identity is confirmed.";

export const verifyKyc = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    const { bvn, dateOfBirth, gender } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { baasCustomerId: true, kycTier: true },
    });

    if (!user) return sendError(res, "User not found", 404);

    if (!user.baasCustomerId) {
      return sendError(
        res,
        "Please complete your profile before verifying your identity",
        400,
      );
    }

    if (user.kycTier >= 1) {
      return sendError(res, "Your identity is already verified", 400);
    }

    await upgradeCustomerKYC(user.baasCustomerId, {
      bvn,
      dateOfBirth,
      gender,
    });

    // Poll Anchor (a few seconds) for the verification result. If approved,
    // provision the deposit account + account number and surface them so the
    // frontend can reveal the account immediately. If not yet approved, we
    // leave kycTier unchanged — the webhook handler completes it later.
    const result = await KycService.completeKycForUser(
      userId,
      user.baasCustomerId,
    );

    if (result.status === "approved") {
      sendSuccess(
        res,
        "Verification approved successfully.",
        {
          kycTier: result.kycTier,
          accountNumber: result.accountNumber,
          bankName: result.bankName,
          accountName: result.accountName,
          showAccountModal: result.showAccountModal,
        },
        200,
      );
      return;
    }

    sendSuccess(res, PENDING_MESSAGE, null, 200);
  } catch (error) {
    console.error("[KYC] Verification failed:", error);
    sendError(res, "Verification failed. Please try again later.", 500);
  }
};

export const getKycStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    const status = await KycService.getStatus(userId);
    sendSuccess(res, "KYC status fetched successfully", status, 200);
  } catch (error) {
    const status = (error as any)?.statusCode || 500;
    const message =
      status === 404 ? (error as Error).message : "Failed to fetch KYC status";
    sendError(res, message, status);
  }
};

export const dismissAccountModal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    await KycService.dismissAccountModal(userId);
    sendSuccess(res, "Account modal dismissed", null, 200);
  } catch (error) {
    console.error("[KYC] Failed to dismiss account modal:", error);
    sendError(res, "Something went wrong. Please try again later.", 500);
  }
};
