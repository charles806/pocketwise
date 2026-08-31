import type { Request, Response } from "express";
import prisma from "../../../lib/prisma.js";
import { walletHelper } from "../../../helper/wallet-helpers.js";
import { notificationService } from "../../notifications/notification.service.js";
import { fcmMessaging } from "../../../lib/firebase.js";
import { sendError, sendSuccess } from "../../../utils/response.js";
import {
  failureCallbackUrl,
  getWeekStart,
  jobBaseUrl,
  publishBatch,
  toIsoDateStamp,
} from "../../queue/queue-utils.js";

const RUN_PATH = "/api/internal/jobs/weekly-summary/run";

/**
 * Dispatcher — called on a schedule (QStash schedule or, during cutover,
 * cron-job.org). Enqueues one "send summary" message per user and returns
 * immediately, regardless of user count.
 */
export async function dispatchWeeklySummary(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const weekStamp = toIsoDateStamp(getWeekStart());
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    await publishBatch(
      users.map((user) => ({
        url: `${jobBaseUrl()}${RUN_PATH}`,
        body: { userId: user.id },
        deduplicationId: `weekly-summary:${user.id}:${weekStamp}`,
        retries: 3,
        callback: failureCallbackUrl(),
      })),
    );

    sendSuccess(res, "Weekly summary jobs dispatched", {
      week: weekStamp,
      dispatched: users.length,
    });
  } catch (error) {
    sendError(res, "Failed to dispatch weekly summary jobs", 500, error);
  }
}

/**
 * Handler — invoked by QStash for a single user. Skips users with no weekly
 * activity, so "no news" users never get a notification.
 */
export async function runWeeklySummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) {
      sendError(res, "userId is required", 400);
      return;
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, fcmToken: true },
    });
    if (!user) {
      sendSuccess(res, "User not found, skipped", { userId }, 200);
      return;
    }

    const summary = await walletHelper.getWeeklySummary(user.id);
    if (summary.thisWeekSpent === 0 && summary.thisWeekSaved === 0) {
      sendSuccess(res, "No weekly activity, skipped", { userId }, 200);
      return;
    }

    const message = await walletHelper.buildWeeklySummaryMessage(summary);
    let channelsSent = 0;

    if (user.fcmToken) {
      try {
        await fcmMessaging.send({
          token: user.fcmToken,
          notification: {
            title: "Your Weekly PocketWise Summary",
            body: message,
          },
        });
        channelsSent += 1;
      } catch (error) {
        console.error(
          `[WeeklySummary] FCM failed for user ${user.id}:`,
          error,
        );
      }
    }

    try {
      await notificationService.notifyWeeklySummary(user.id, summary);
      channelsSent += 1;
    } catch (error) {
      console.error(
        `[WeeklySummary] Notify failed for user ${user.id}:`,
        error,
      );
    }

    sendSuccess(
      res,
      "Weekly summary processed",
      { userId, channelsSent },
      200,
    );
  } catch (error) {
    sendError(res, "Internal server error", 500, error);
  }
}