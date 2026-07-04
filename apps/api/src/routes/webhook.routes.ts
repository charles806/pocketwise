import Router from "express";
import { webhook } from "../controller/webhook.controller.js";
import express from "express";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

export const webhookRoutes = Router();

webhookRoutes.post(
  "/anchor/deposit",
  rateLimit({ windowMs: 60_000, max: 100, keyBy: "ip" }),
  express.raw({ type: "application/json" }),
  webhook,
);
