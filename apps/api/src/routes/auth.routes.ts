import { Router } from "express";
import {
  signUp,
  login,
  refresh,
  logout,
  me,
  updateGoal,
  setupPin,
  changePin,
} from "../controller/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { signupSchema, loginSchema } from "../schemas/auth.schema.js";
import { setupPinSchema, changePinSchema } from "../schemas/pin.schema.js";

const router = Router();

router.post("/signup", validate(signupSchema), signUp);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.patch("/goal", authMiddleware, updateGoal);
router.post("/setup-pin", authMiddleware, validate(setupPinSchema), setupPin);
router.post(
  "/change-pin",
  authMiddleware,
  validate(changePinSchema),
  changePin,
);

export default router;
