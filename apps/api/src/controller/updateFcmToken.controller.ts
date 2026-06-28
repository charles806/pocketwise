import type { Response, Request } from "express";
import { sendError, sendSuccess } from "../utils/response.js";
import prisma from "../lib/prisma.js";

export const updateFcmTokenController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id
        const { fcmToken } = req.body

        if (!fcmToken) {
            return sendError(res, "No token found", 404)
        }

        if (!userId) {
            return sendError(res, "Unauthorized", 401);
        }

        const result = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                fcmToken: fcmToken
            },
            select: {
                id: true,
                fcmToken: true,
            }
        })

        sendSuccess(res, "FCM token updated successfully", result, 200);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Error Joining waitlist";
        const status = (error as any)?.statusCode || 500;
        sendError(res, message, status);
    }
}


