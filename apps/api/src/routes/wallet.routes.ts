import { Router } from "express";
import { getWallets, transfer } from "../controller/wallet.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { verifyTransferPin } from "../middleware/verify-pin.middleware.js";

const walletRouter = Router();

walletRouter.get("/", authMiddleware, getWallets);

walletRouter.post("/transfer", authMiddleware, verifyTransferPin, transfer);

export default walletRouter;
