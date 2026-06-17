import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import { p2pRecipientService } from "../services/p2p-recipient.service.js";

export const getRecentRecipients = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await p2pRecipientService.getRecentRecipients(userId);

    sendSuccess(res, "Recent recipients fetched successfully", result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching recipients";

    const status = (error as any)?.statusCode || 500;

    sendError(res, message, status);
  }
};
