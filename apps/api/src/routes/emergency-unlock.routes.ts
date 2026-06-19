import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getUnlockStatusController, requestUnlockController } from "../controller/emergency-unlock.controller.js";

const emergencyUnlockRouter = Router()

emergencyUnlockRouter.post("/request", authMiddleware, requestUnlockController)
emergencyUnlockRouter.get("/status", authMiddleware, getUnlockStatusController)

export default emergencyUnlockRouter

