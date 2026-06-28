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
} from "../controller/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { signupSchema, loginSchema } from "../schemas/auth.schema.js";
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
router.post("/login", strictIpLimit, validate(loginSchema), login);
router.post(
  "/refresh",
  rateLimit({ windowMs: 60_000, max: 10, keyBy: "ip" }),
  refresh,
);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.get("/lookup", authMiddleware, lookupUser);
router.patch("/goal", authMiddleware, updateGoal);
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
router.post("/fcm-token", authMiddleware, updateFcmTokenController)

export default router;
