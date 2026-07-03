import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { walletSplitConfigSchema } from "../validators/wallet-split.validator.js";
import { walletSplitService } from "../services/wallet-split.service.js";

export const setWalletSplitConfigController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const parse = walletSplitConfigSchema.safeParse(req.body);

    if (!parse.success) {
      return sendError(
        res,
        "Validation failed",
        400,
        parse.error.flatten().fieldErrors,
      );
    }

    const result = await walletSplitService.setWalletSplitConfig(
      userId,
      parse.data,
    );

    return sendSuccess(res, "Success", result, 201);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error setting wallet split config";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);
  }
};

export const getWalletSplitConfigController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Unauthorized", 401);

    const result = await walletSplitService.getWalletSplitConfig(userId);

    return sendSuccess(res, "Success", result, 200);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error fetching wallet split config";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);
  }
};

export const updateWalletSplitConfigController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const parse = walletSplitConfigSchema.safeParse(req.body);

    if (!parse.success) {
      return sendError(
        res,
        "Validation failed",
        400,
        parse.error.flatten().fieldErrors,
      );
    }

    const result = await walletSplitService.updateWalletSplitConfig(
      userId,
      parse.data,
    );

    return sendSuccess(res, "Success", result, 200);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error updating wallet split config";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);
  }
};
