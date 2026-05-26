import { Router } from "express";
import { getWallets, transfer } from "../controller/wallet.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const walletRouter = Router();

walletRouter.get(
    "/",
    authMiddleware,
    getWallets
);

walletRouter.post("/transfer", authMiddleware, transfer)

export default walletRouter;