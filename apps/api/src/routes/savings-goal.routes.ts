import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import {
  completeGoalController,
  contributeToGoalController,
  createSavingsGoalController,
  deleteSavingsGoalController,
  getSavingsGoalController,
  getUnallocatedSavingsController,
  updateSavingsGoalController,
} from "../controller/savinggoal.controller.js";

const savingsGoalRouter = Router();

const userLimit = rateLimit({ windowMs: 60_000, max: 10, keyBy: "user" });

savingsGoalRouter.post(
  "/",
  authMiddleware,
  userLimit,
  createSavingsGoalController,
);
savingsGoalRouter.get("/", authMiddleware, getSavingsGoalController);
savingsGoalRouter.patch(
  "/:goalId",
  authMiddleware,
  updateSavingsGoalController,
);
savingsGoalRouter.delete(
  "/:goalId",
  authMiddleware,
  deleteSavingsGoalController,
);
savingsGoalRouter.get(
  "/unallocated",
  authMiddleware,
  getUnallocatedSavingsController,
);
savingsGoalRouter.post(
  "/:id/contribute",
  authMiddleware,
  userLimit,
  contributeToGoalController,
);
savingsGoalRouter.post("/:id/complete", authMiddleware, completeGoalController);

export default savingsGoalRouter;
