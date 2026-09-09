import { Router } from "express";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  freezeAccountSchema,
  unfreezeAccountSchema,
  updateAccountMetadataSchema,
} from "../validators/admin-account.validator.js";
import {
  freezeAccount,
  unfreezeAccount,
  updateAccountMetadata,
} from "../controller/admin-account.controller.js";

const adminAccountRouter = Router();

adminAccountRouter.post(
  "/:accountId/freeze",
  requireAdmin,
  validate(freezeAccountSchema),
  freezeAccount,
);

adminAccountRouter.post(
  "/unfreeze",
  requireAdmin,
  validate(unfreezeAccountSchema),
  unfreezeAccount,
);

adminAccountRouter.patch(
  "/:accountId",
  requireAdmin,
  validate(updateAccountMetadataSchema),
  updateAccountMetadata,
);

export default adminAccountRouter;
