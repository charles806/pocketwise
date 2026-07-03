import "dotenv/config";
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
import prisma from "./lib/prisma.js";
import { walletHelper } from "./helper/wallet-helpers.js";
import { savingsGoalService } from "./services/saving-goal.service.js";
import { th } from "zod/v4/locales";
import { notificationService } from "./features/notifications/notification.service.js";
import { fcmMessaging } from "./lib/firebase.js";
import bankTransferRouter from "./routes/bank-transfer.routes.js";
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
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
app.use("/api/v1/transfers/bank", bankTransferRouter);
//Internal Routes
app.use("/api/internal/keep-alive", keepAliveRouter);
/*
 * cron-job.org registration:
 * Endpoint: GET /api/internal/auto-contribute
 * Schedule: Weekly (ideally a few hours before /api/internal/weekly-summary)
 * Purpose: Moves weeklyAmount from unallocated savings into each goal where autoContribute is enabled
 */
app.get(
  "/api/internal/auto-contribute",
  keepAliveAuthMiddleware,
  async (_req: Request, res: Response) => {
    try {
      const goals = await prisma.savingsGoal.findMany({
        where: {
          autoContribute: true,
          status: "ACTIVE",
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, email: true, firstName: true },
          },
        },
      });

      let contributedCount = 0;

      for (const goal of goals) {
        const unallocated = await walletHelper.getUnallocatedSavings(
          goal.userId,
        );

        if (unallocated < Number(goal.weeklyAmount)) {
          continue;
        }

        try {
          await savingsGoalService.contributeToGoal(
            goal.userId,
            goal.id,
            Number(goal.weeklyAmount),
          );

          try {
            await notificationService.notifyAutoContribution(
              goal.userId,
              goal.title,
              Number(goal.weeklyAmount),
            );
          } catch (notifyError) {
            console.error(
              `[AutoContribute] Notification failed for goal ${goal.id}:`,
              notifyError,
            );
          }

          contributedCount++;
        } catch (contributeError) {
          console.error(
            `[AutoContribute] Contribution failed for goal ${goal.id}:`,
            contributeError,
          );
        }
      }

      return sendSuccess(res, "Auto-contribution complete", {
        contributedCount,
      });
    } catch (error) {
      console.error("[AutoContribute] Job failed:", error);
      return sendError(res, "Failed to process auto-contributions", 500);
    }
  },
);

app.post(
  "/api/internal/complete-goals",
  keepAliveAuthMiddleware,
  completeGoalsController,
);

app.get(
  "/api/internal/weekly-summary",
  keepAliveAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, firstName: true, fcmToken: true },
      });

      let notifiedCount = 0;

      for (const user of users) {
        const summary = await walletHelper.getWeeklySummary(user.id);
        const message = await walletHelper.buildWeeklySummaryMessage(summary);

        if (summary.thisWeekSpent === 0 && summary.thisWeekSaved === 0) {
          continue;
        }

        let sentSomething = false;

        if (user.fcmToken) {
          try {
            await fcmMessaging.send({
              token: user.fcmToken,
              notification: {
                title: "Your Weekly PocketWise Summary",
                body: message,
              },
            });
            sentSomething = true;
          } catch (error) {
            console.error(`FCM failed for user ${user.id}:`, error);
          }
        }

        try {
          await notificationService.notifyWeeklySummary(user.id, summary);
          sentSomething = true;
        } catch (error) {
          console.error(`Notification failed for user ${user.id}:`, error);
        }

        if (sentSomething) {
          notifiedCount++;
        }
      }

      return sendSuccess(
        res,
        "Weekly summaries processed",
        { notifiedCount },
        200,
      );
    } catch (error) {
      console.error("[WeeklySummary] Job failed:", error);
      return sendError(res, "Failed to process weekly summaries", 500);
    }
  },
);

//Error Handling Middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

export default app;
