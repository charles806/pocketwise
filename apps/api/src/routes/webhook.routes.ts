import Router from "express"
import { webhook } from "../controller/webhook.controller.js"


export const webhookRoutes = Router()

webhookRoutes.post("/anchor/deposit", webhook)