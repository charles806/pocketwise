import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  joinWaitList,
  getWaitlistCount,
  getAllWaitlist,
} from "../controller/waitlist.controller.js";
import { waitListSchema } from "../schemas/waitListSchema.js";
import { validate } from "../middleware/validate.middleware.js";

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || !authHeader || authHeader !== `Bearer ${adminSecret}`) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  next();
};

const router = Router();

router.post("/", validate(waitListSchema), joinWaitList);
router.get("/count", getWaitlistCount);
router.get("/all", requireAdmin, getAllWaitlist);

export default router;
