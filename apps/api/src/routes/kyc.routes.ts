import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { kycVerifySchema } from "../schemas/kyc.schema.js";
import {
  verifyKyc,
  getKycStatus,
  dismissAccountModal,
} from "../controller/kyc.controller.js";

const kycRouter = Router();

kycRouter.post(
  "/verify",
  authMiddleware,
  rateLimit({
    windowMs: 900_000,
    max: 3,
    keyBy: "user",
    message: "Too many verification attempts. Please try again in 15 minutes.",
  }),
  validate(kycVerifySchema),
  verifyKyc,
);

kycRouter.get("/status", authMiddleware, getKycStatus);

kycRouter.patch(
  "/dismiss-account-modal",
  authMiddleware,
  dismissAccountModal,
);

export default kycRouter;
