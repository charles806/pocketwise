import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getWalletSplitConfigController,
  setWalletSplitConfigController,
  updateWalletSplitConfigController,
} from "../controller/wallet-split.controller.js";

const walletSplitRouter = Router();

walletSplitRouter.get("/", authMiddleware, getWalletSplitConfigController);
walletSplitRouter.post("/", authMiddleware, setWalletSplitConfigController);
walletSplitRouter.patch("/", authMiddleware, updateWalletSplitConfigController);

export default walletSplitRouter;
