import { Router } from "express";
import {
  signUp,
  login,
  refresh,
  logout,
  me,
  lookupUser,
  updateGoal,
  setupPin,
  changePin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../controller/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  profileSchema,
  changePasswordSchema,
} from "../schemas/auth.schema.js";
import { setupPinSchema, changePinSchema } from "../schemas/pin.schema.js";
import { updateFcmTokenController } from "../controller/updateFcmToken.controller.js";

const router = Router();

const strictIpLimit = rateLimit({ windowMs: 60_000, max: 5, keyBy: "ip" });

router.post(
  "/signup",
  rateLimit({ windowMs: 60_000, max: 3, keyBy: "ip" }),
  validate(signupSchema),
  signUp,
);
router.post(
  "/login",
  rateLimit({
    windowMs: 60_000,
    max: 5,
    keyBy: "ip",
    keyFn: (req) => {
      const email = (req.body as { email?: string })?.email;
      return email ? `login:${email.toLowerCase().trim()}` : undefined;
    },
  }),
  validate(loginSchema),
  login,
);
router.post(
  "/refresh",
  rateLimit({ windowMs: 60_000, max: 10, keyBy: "ip" }),
  refresh,
);
const looseIpLimit = rateLimit({ windowMs: 60_000, max: 30, keyBy: "ip" });
router.post("/logout", looseIpLimit, logout);
router.get("/me", looseIpLimit, authMiddleware, me);
router.get("/lookup", looseIpLimit, authMiddleware, lookupUser);
router.patch("/goal", looseIpLimit, authMiddleware, updateGoal);
router.post(
  "/setup-pin",
  authMiddleware,
  rateLimit({ windowMs: 60_000, max: 5, keyBy: "user" }),
  validate(setupPinSchema),
  setupPin,
);
router.post(
  "/change-pin",
  authMiddleware,
  rateLimit({ windowMs: 60_000, max: 5, keyBy: "user" }),
  validate(changePinSchema),
  changePin,
);
router.post("/fcm-token", authMiddleware, updateFcmTokenController);
router.post(
  "/forgot-password",
  rateLimit({ windowMs: 60_000, max: 3, keyBy: "ip" }),
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/verify-otp",
  rateLimit({ windowMs: 60_000, max: 5, keyBy: "ip" }),
  validate(verifyOtpSchema),
  verifyOtp,
);
router.post(
  "/reset-password",
  rateLimit({ windowMs: 60_000, max: 3, keyBy: "ip" }),
  validate(resetPasswordSchema),
  resetPassword,
);

router.patch(
  "/profile",
  authMiddleware,
  validate(profileSchema),
  updateProfile,
);
router.post(
  "/change-password",
  authMiddleware,
  rateLimit({ windowMs: 60_000, max: 5, keyBy: "user" }),
  validate(changePasswordSchema),
  changePassword,
);
router.post(
  "/upload-avatar",
  authMiddleware,
  rateLimit({ windowMs: 60_000, max: 5, keyBy: "user" }),
  uploadAvatar,
);

export default router;
