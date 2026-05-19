import { Router } from "express";
import { getWallets } from "../controller/wallet.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const walletRouter = Router();

walletRouter.get(
    "/wallets",
    authMiddleware,
    getWallets
);

export default walletRouter;