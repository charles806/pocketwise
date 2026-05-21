import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTranactions } from "../controller/transaction.controller.js";

const transactionRouter = Router()

transactionRouter.get("/", authMiddleware, getTranactions)

export default transactionRouter