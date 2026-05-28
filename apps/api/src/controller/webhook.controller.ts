import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { webhookService } from "../services/webhook.service.js";


export const webhook = async (req: Request, res: Response) => {
    try {
        const payload = req.body;

        // Basic payload validation in the controller
        if (!payload || !payload.event || !payload.data) {
            return sendError(res, "Invalid webhook payload structure", 400);
        }

        const result = await webhookService.processAnchorDepositWebhook(payload);

        sendSuccess(
            res,
            "Webhook processed successfully",
            result,
            200
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Error processing webhook";

        const status = (error as any)?.statusCode || 500;

        sendError(res, message, status);
    }
}
