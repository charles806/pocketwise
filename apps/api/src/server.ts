import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { default as helmet } from "helmet";
import cookieParser from "cookie-parser";
import { sendSuccess, sendError } from "./utils/response.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import waitlistRouter from "./routes/waitlist.routes.js";
import walletRouter from "./routes/wallet.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import { webhookRoutes } from "./routes/webhook.routes.js";
import savingsGoalRouter from "./routes/savings-goal.routes.js";
import keepAliveRouter from "./routes/keep-alive.routes.js";
import { keepAliveAuthMiddleware } from "./middleware/keep-alive-auth.middleware.js";
import { completeGoalsController } from "./controller/goal-completion.controller.js";
import walletSplitRouter from "./routes/wallet-split.routes.js";
import notificationsRouter from "./features/notifications/notification.routes.js";
import internalTransferRouter from "./routes/internal-transfer.routes.js";
import bankRecipientRouter from "./routes/bank-recipent.routes.js";
import p2pRecipientRouter from "./routes/p2p-recipient.routes.js";
import emergencyUnlockRouter from "./routes/emergency-unlock.routes.js";
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL || true,
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  try {
    sendSuccess(res, "Welcome to PocketWise API");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    sendError(res, message);
  }
});

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "PocketWise API is running" });
});

//Auth Routes
app.use("/api/v1/auth", authRouter);
//Waitlist Routes
app.use("/api/v1/waitlist", waitlistRouter);
//Main App Routes
app.use("/api/v1/wallets", walletRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/savings-goals", savingsGoalRouter);
app.use("/api/v1/wallet-split", walletSplitRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/wallets/internal-transfer", internalTransferRouter);
app.use("/api/v1/wallets/recent-recipients", bankRecipientRouter);
app.use("/api/v1/wallets/recent-p2p-recipients", p2pRecipientRouter);
app.use("/api/v1/wallets/emergency-unlock", emergencyUnlockRouter);
//Internal Routes
app.use("/api/internal/keep-alive", keepAliveRouter);
app.post(
  "/api/internal/complete-goals",
  keepAliveAuthMiddleware,
  completeGoalsController,
);
//Error Handling Middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

export default app;
