import type { Request, Response } from "express";
import { bankTransferService, transferService, walletService } from "../services/wallet.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { externalTransferSchema } from "../validators/transfer.validator.js";

export const getWallets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if (!userId) return sendError(res, "Unauthorized", 401);

    const result = await walletService.getWallet(userId);

    sendSuccess(res, "Wallets fetched successfully", result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching wallets";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);
  }
};

export const transfer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    const { receiverUserId, amount, reason } = req.body;

    const result = await transferService.transfer({
      userId,
      receiverUserId,
      amount: Number(amount),
      reason,
    });

    sendSuccess(res, "Transfer successful", result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching wallets";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);
  }
};

export const bankTransfer = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return sendError(res, "Unauthorized", 401);

    const parsed = externalTransferSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error?.issues[0]?.message ?? "Invalid request", 400);
    }

    const { bankCode, accountNumber, accountName, amount, reason, pin } = parsed.data

    const result = await bankTransferService.sendToBank(userId, {
      bankCode,
      accountNumber,
      accountName,
      amount,
      reason,
      pin,
    })

    sendSuccess(res, "Transfer Successful", result, 200)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transfer failed";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);

  }
}
