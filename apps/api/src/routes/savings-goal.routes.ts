import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { createSavingsGoalController, deleteSavingsGoalController, getSavingsGoalController, updateSavingsGoalController } from "../controller/savinggoal.controller.js"

const savingsGoalRouter = Router()

savingsGoalRouter.post("/", authMiddleware, createSavingsGoalController)
savingsGoalRouter.get("/", authMiddleware, getSavingsGoalController)
savingsGoalRouter.patch("/:goalId", authMiddleware, updateSavingsGoalController)
savingsGoalRouter.delete("/:goalId", authMiddleware, deleteSavingsGoalController)

export default savingsGoalRouter

