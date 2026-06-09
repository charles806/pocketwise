import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { internalTransferController } from "../controller/internal-transfer.controller.js"

const internalTransferRouter = Router()

internalTransferRouter.post("/", authMiddleware, internalTransferController)

export default internalTransferRouter