import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { transactionService } from "../services/transaction.service.js";

const VALID_TYPES = ["sent", "received", "deposit"] as const;

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const type = req.query.type as string | undefined;

    if (type && !VALID_TYPES.includes(type as any)) {
      return sendError(
        res,
        "Invalid type filter. Use: sent, received, or deposit",
        400,
      );
    }

    const result = await transactionService.getUserTransactions(
      userId,
      page,
      type as (typeof VALID_TYPES)[number] | undefined,
    );

    sendSuccess(res, "Transactions fetched successfully", result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching transactions";
    const status = (error as any)?.statusCode || 500;
    sendError(res, message, status);
  }
};
