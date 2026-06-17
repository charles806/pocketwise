import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getRecentRecipients } from "../controller/p2p-recipient.controller.js";

const p2pRecipientRouter = Router();

p2pRecipientRouter.get("/", authMiddleware, getRecentRecipients);

export default p2pRecipientRouter;
