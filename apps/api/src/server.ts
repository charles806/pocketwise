import "dotenv/config";
import { Sentry } from "./lib/sentry.js";
import { getErrorMessage } from "./utils/errors.js";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { sendSuccess, sendError } from "./utils/response.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import waitlistRouter from "./routes/waitlist.routes.js";
import walletRouter from "./routes/wallet.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import savingsGoalRouter from "./routes/savings-goal.routes.js";
import keepAliveRouter from "./routes/keep-alive.routes.js";
import walletSplitRouter from "./routes/wallet-split.routes.js";
import notificationsRouter from "./features/notifications/notification.routes.js";
import internalTransferRouter from "./routes/internal-transfer.routes.js";
import bankRecipientRouter from "./routes/bank-recipent.routes.js";
import p2pRecipientRouter from "./routes/p2p-recipient.routes.js";
import emergencyUnlockRouter from "./routes/emergency-unlock.routes.js";
import { checkRedisConnection } from "./lib/redis.js";
import bankTransferRouter from "./routes/bank-transfer.routes.js";
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const MOBILE_URL = process.env.MOBILE_URL;
const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://api.getanchor.co",
          "https://api.sandbox.getanchor.co",
          "https://*.upstash.io",
          "https://fcm.googleapis.com",
        ],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);
app.use(cookieParser());
//DO NOT TOUCH OR MOVE LINE 35 to 37 Don't touch !!!!!!!!!!
import { webhookRoutes } from "./routes/webhook.routes.js";
import { jobsRouter } from "./routes/jobs.routes.js";
app.use("/api/v1/webhooks", webhookRoutes);
// Mounted here (before express.json) so QStash runner routes keep their raw bodies.
app.use("/api/internal/jobs", jobsRouter);
app.use(express.json({ limit: "10mb" }));
if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL environment variable is required");
}

const allowedOrigins = [FRONTEND_URL];
if (MOBILE_URL) allowedOrigins.push(MOBILE_URL);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  try {
    sendSuccess(res, "Welcome to PocketWise API");
  } catch (error) {
    const message = getErrorMessage(error, "Internal Server Error");
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
app.use("/api/v1/savings-goals", savingsGoalRouter);
app.use("/api/v1/wallet-split", walletSplitRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/wallets/internal-transfer", internalTransferRouter);
app.use("/api/v1/wallets/recent-recipients", bankRecipientRouter);
app.use("/api/v1/wallets/recent-p2p-recipients", p2pRecipientRouter);
app.use("/api/v1/wallets/emergency-unlock", emergencyUnlockRouter);
app.use("/api/v1/transfers/bank", bankTransferRouter);
//Internal Routes
app.use("/api/internal/keep-alive", keepAliveRouter);

Sentry.setupExpressErrorHandler(app);

//Error Handling Middleware
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  await checkRedisConnection();
});

export default app;
