import { Router } from "express";
import { getWallets } from "../controller/wallet.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const walletRouter = Router();

walletRouter.get(
    "/",
    authMiddleware,
    getWallets
);

export default walletRouter;