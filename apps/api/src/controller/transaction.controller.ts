import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { transactionService } from "../services/transaction.service.js";

export const getTranactions = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id
        const page = Number(req.query.page) || 1

        if (!userId) {
            return sendError(res, "Unauthorized", 401)
        }

        const result = await transactionService.getTranactions(userId, page)

        sendSuccess(res, "Transactions Fetched Successfully", result, 200)
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Error fetching wallets";

        const status = (error as any)?.statusCode || 500;

        sendError(res, message, status);
    }
}
