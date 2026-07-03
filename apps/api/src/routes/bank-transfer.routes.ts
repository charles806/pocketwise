import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { bankTransfer } from "../controller/wallet.controller.js";

const bankTransferRouter = Router();

bankTransferRouter.post("/", authMiddleware, bankTransfer);

export default bankTransferRouter;