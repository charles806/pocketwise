// internal-transfer.controller.ts

import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { internalTransferSchema } from "../validators/internal-transfer.validator.js";
import { internalTransferService } from "../services/internal-transfer.service.js";

export const internalTransferController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const parse = internalTransferSchema.safeParse(req.body);

    if (!parse.success) {
      const messages = Object.entries(parse.error.flatten().fieldErrors)
        .map(([_, errors]) => errors?.join(", "))
        .join("; ");
      return sendError(res, messages || "Validation failed", 400);
    }

    const result = await internalTransferService.internalTransfer(
      userId,
      parse.data,
    );

    return sendSuccess(res, "Transfer successful", result, 200);
  } catch (error) {
    return sendError(
      res,
      error instanceof Error ? error.message : "Failed to process transfer",
      (error as any)?.statusCode || 500,
    );
  }
};
