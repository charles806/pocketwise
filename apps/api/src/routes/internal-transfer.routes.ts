import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { verifyTransferPin } from "../middleware/verify-pin.middleware.js";
import { requireVerified } from "../middleware/require-verified.middleware.js";
import { internalTransferController } from "../controller/internal-transfer.controller.js";

const internalTransferRouter = Router();

internalTransferRouter.post(
  "/",
  authMiddleware,
  requireVerified,
  rateLimit({ windowMs: 60_000, max: 10, keyBy: "ip-and-user" }),
  verifyTransferPin,
  internalTransferController,
);

export default internalTransferRouter;
