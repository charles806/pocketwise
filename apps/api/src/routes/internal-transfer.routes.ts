import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { verifyTransferPin } from "../middleware/verify-pin.middleware.js";
import { internalTransferController } from "../controller/internal-transfer.controller.js";

const internalTransferRouter = Router();

internalTransferRouter.post(
  "/",
  authMiddleware,
  verifyTransferPin,
  internalTransferController,
);

export default internalTransferRouter;
