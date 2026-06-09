import { Router } from "express"
import { authMiddleware } from "../../middleware/auth.middleware.js"
import {
    getNotificationsController,
    markOneAsReadController,
    markAllAsReadController
} from "../notifications/notification.controller.js"
const notificationsRouter = Router()

notificationsRouter.get("/", authMiddleware, getNotificationsController)
notificationsRouter.patch("/:id/read", authMiddleware, markOneAsReadController)
notificationsRouter.patch("/read-all", authMiddleware, markAllAsReadController)

export default notificationsRouter