import { Router } from "express";
import {
  joinWaitList,
  getWaitlistCount,
} from "../controller/waitlist.controller.js";
import { waitListSchema } from "../schemas/waitListSchema.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/", validate(waitListSchema), joinWaitList);
router.get("/count", getWaitlistCount);

export default router;
