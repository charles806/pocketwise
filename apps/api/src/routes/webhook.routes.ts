import Router from "express"
import { webhook } from "../controller/webhook.controller.js"
import express from "express"

export const webhookRoutes = Router()

webhookRoutes.post(
    "/anchor/deposit",
    express.raw({ type: "application/json" }),
    webhook
)