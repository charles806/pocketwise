import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { bankRecipientService } from "../services/bank-recipient.service.js";

export const getRecentRecipients = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            return sendError(res, "Unauthorized", 401)
        }

        const result = await bankRecipientService.getRecentRecipients(userId


        )

        sendSuccess(res, "Recipent Fetched Successfully", result, 200)
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Error fetching Recipents";

        const status = (error as any)?.statusCode || 500;

        sendError(res, message, status);
    }
}