// notification.controller.ts

import type { Request, Response } from "express"
import { sendError, sendSuccess } from "../../utils/response.js"
import { notificationService } from "../notifications/notification.service.js"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return sendError(res, "Unauthorized", 401)
        }

        const result = await notificationService.getNotifications(userId)

        return sendSuccess(res, "Notifications fetched successfully", result)
    } catch (error) {
        return sendError(
            res,
            error instanceof Error ? error.message : "Failed to fetch notifications",
            500
        )
    }
}

export const markOneAsReadController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id
        const notificationId = req.params.id as string

        if (!userId) {
            return sendError(res, "Unauthorized", 401)
        }

        if (!uuidRegex.test(notificationId)) {
            return sendError(res, "Invalid notification ID format", 400)
        }

        const result = await notificationService.markOneAsRead(userId, notificationId)

        return sendSuccess(res, "Notification marked as read", result)
    } catch (error) {
        return sendError(
            res,
            error instanceof Error ? error.message : "Failed to mark notification as read",
            500
        )
    }
}

export const markAllAsReadController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return sendError(res, "Unauthorized", 401)
        }

        const result = await notificationService.markAllAsRead(userId)

        return sendSuccess(res, "All notifications marked as read", result)
    } catch (error) {
        return sendError(
            res,
            error instanceof Error ? error.message : "Failed to mark all notifications as read",
            500
        )
    }
}