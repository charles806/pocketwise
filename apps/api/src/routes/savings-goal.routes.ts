import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
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

savingsGoalRouter.post("/", authMiddleware, createSavingsGoalController);
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
  contributeToGoalController,
);
savingsGoalRouter.post("/:id/complete", authMiddleware, completeGoalController);

export default savingsGoalRouter;
