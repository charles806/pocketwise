import { Router } from "express";
import { keepAliveAuthMiddleware } from "../middleware/keep-alive-auth.middleware.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware.js";
import {
  pingController,
  statusController,
} from "../controller/keep-alive.controller.js";

const keepAliveRouter = Router();

keepAliveRouter.use(keepAliveAuthMiddleware);
keepAliveRouter.use(rateLimitMiddleware);

keepAliveRouter.get("/", pingController);
keepAliveRouter.get("/status", statusController);

export default keepAliveRouter;
