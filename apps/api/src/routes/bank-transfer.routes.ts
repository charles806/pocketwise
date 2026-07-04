import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { bankTransfer } from "../controller/wallet.controller.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { verifyTransferPin } from "../middleware/verify-pin.middleware.js";

const bankTransferRouter = Router();

bankTransferRouter.post("/", rateLimit({ windowMs: 60_000, max: 10, keyBy: "ip-and-user" }), authMiddleware, verifyTransferPin, bankTransfer);

export default bankTransferRouter;