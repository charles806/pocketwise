import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import crypto from "crypto";
import {
  joinWaitList,
  getWaitlistCount,
  getAllWaitlist,
} from "../controller/waitlist.controller.js";
import { waitListSchema } from "../schemas/waitListSchema.js";
import { validate } from "../middleware/validate.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;
  if (
    !adminSecret ||
    !authHeader ||
    !safeEqual(authHeader, `Bearer ${adminSecret}`)
  ) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  next();
};

const router = Router();

router.post(
  "/",
  rateLimit({ windowMs: 60_000, max: 10, keyBy: "ip" }),
  validate(waitListSchema),
  joinWaitList,
);
router.get("/count", getWaitlistCount);
router.get("/all", rateLimit({ windowMs: 60_000, max: 10, keyBy: "ip" }), requireAdmin, getAllWaitlist);

export default router;
