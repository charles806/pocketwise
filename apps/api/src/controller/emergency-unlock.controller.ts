import type { Request, Response } from "express"
import { sendError, sendSuccess } from "../utils/response.js"
import { EmergencyUnlockService } from "../services/emergency-unlock.service.js"

export const requestUnlockController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id
        const { reason } = req.body

        if (!userId) {
            return sendError(res, "Unauthorized", 401)
        }

        if (!reason) {
            return sendError(res, "Please provide a reason for unlocking", 400)
        }

        const result = await EmergencyUnlockService.requestUnlock(userId, reason)

        return sendSuccess(res, "Unlock successful", result, 200)
    } catch (error) {
        return sendError(
            res,
            error instanceof Error ? error.message : "Failed to process Unlock",
            (error as any)?.statusCode || 500
        )
    }
}

export const getUnlockStatusController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return sendError(res, "Unauthorized", 401)
        }

        const result = await EmergencyUnlockService.checkUnlockStatus(userId)
        return sendSuccess(res, "Unlock status fetched successfully", result, 200)
    } catch (error) {
        return sendError(
            res,
            error instanceof Error ? error.message : "Failed to process Unlock",
            (error as any)?.statusCode || 500
        )
    }
}
