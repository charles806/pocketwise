import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { emergencyUnlockSchema } from "../validators/emergency-unlock.validator.js";
import {
  getUnlockStatusController,
  requestUnlockController,
} from "../controller/emergency-unlock.controller.js";

const emergencyUnlockRouter = Router();

emergencyUnlockRouter.post(
  "/request",
  authMiddleware,
  rateLimit({ windowMs: 60_000, max: 3, keyBy: "user" }),
  validate(emergencyUnlockSchema),
  requestUnlockController,
);
emergencyUnlockRouter.get("/status", authMiddleware, getUnlockStatusController);

export default emergencyUnlockRouter;
