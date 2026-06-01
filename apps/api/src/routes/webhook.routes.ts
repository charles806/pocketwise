import Router from "express"
import { webhook } from "../controller/webhook.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"


export const webhookRoutes = Router()

webhookRoutes.post("/anchor/deposit", authMiddleware,  webhook)