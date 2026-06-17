import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getRecentRecipients } from "../controller/bank-recipient.controller.js";

const bankRecipientRouter = Router()

bankRecipientRouter.get("/", authMiddleware, getRecentRecipients)

export default bankRecipientRouter