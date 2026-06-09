import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
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
import { keepAliveService } from "./services/keep-alive.service.js";
import { keepAliveMonitor } from "./utils/keep-alive-monitor.js";
import walletSplitRouter from "./routes/wallet-split.routes.js";
import { startGoalCompletionJob } from "./jobs/goal-completion.job.js";
import notificationsRouter from "./features/notifications/notification.routes.js";
import internalTransferRouter from "./routes/internal-transfer.routes.js";

dotenv.config();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const KEEP_ALIVE_INTERVAL_MINUTES =
  Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES) || 5;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
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
app.use("/api/v1/wallet-split", walletSplitRouter)
app.use("/api/v1/notifications", notificationsRouter)
app.use("/api/v1/wallets/internal-transfer", internalTransferRouter)
//Internal Routes
app.use("/api/internal/keep-alive", keepAliveRouter);

//Error Handling Middleware
app.use(errorMiddleware);

function startKeepAliveCron(): void {
  const intervalMs = KEEP_ALIVE_INTERVAL_MINUTES * 60 * 1000;

  const runPing = async () => {
    const result = await keepAliveService.ping();
    if (result.success) {
      keepAliveMonitor.recordSuccess(result.latencyMs);
    } else {
      keepAliveMonitor.recordFailure(result.error ?? "Unknown error");
    }
  };

  runPing();

  setInterval(runPing, intervalMs);

  console.log(
    `[KeepAlive] Cron scheduled every ${KEEP_ALIVE_INTERVAL_MINUTES} minute(s)`,
  );
}

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  startKeepAliveCron();
  setTimeout(() => {
    startGoalCompletionJob()
  }, 5000)
});

export default app;
