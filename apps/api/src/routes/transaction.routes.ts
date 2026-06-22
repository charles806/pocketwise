import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getTransactions } from "../controller/transaction.controller.js";

const transactionRouter = Router();

transactionRouter.get("/", authMiddleware, getTransactions);

export default transactionRouter;
