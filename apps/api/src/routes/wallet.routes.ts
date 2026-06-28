import { Router } from "express";
import { getWallets, transfer } from "../controller/wallet.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyTransferPin } from "../middleware/verify-pin.middleware.js";
import { transferSchema } from "../validators/transfer.validator.js";

const walletRouter = Router();

walletRouter.get("/", authMiddleware, getWallets);

walletRouter.post(
  "/transfer",
  authMiddleware,
  rateLimit({ windowMs: 60_000, max: 10, keyBy: "ip-and-user" }),
  validate(transferSchema),
  verifyTransferPin,
  transfer,
);

export default walletRouter;
