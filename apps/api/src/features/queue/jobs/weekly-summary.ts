import type { Request, Response } from "express";
import prisma from "../../../lib/prisma.js";
import { walletHelper } from "../../../helper/wallet-helpers.js";
import { notificationService } from "../../notifications/notification.service.js";
import { fcmMessaging } from "../../../lib/firebase.js";
import { sendError, sendSuccess } from "../../../utils/response.js";
import {
  failureCallbackUrl,
  getWeekStart,
  handleDispatchError,
  jobBaseUrl,
  publishBatch,
  toIsoDateStamp,
} from "../../queue/queue-utils.js";

const RUN_PATH = "/api/internal/jobs/weekly-summary/run";

// One message per chunk of users instead of one-per-user, so weekly fan-out
// drops from N messages to ceil(N / BATCH_SIZE) and stays under the QStash
// daily message cap.
const USERS_PER_MESSAGE = 50;
// Bounded in-handler concurrency keeps each runner request well under the
// serverless timeout while still parallelizing (reuses the Aug-18 fix pattern).
const RUN_CONCURRENCY = 10;

/**
 * Dispatcher — called on a schedule (weekly). Chunks the user base into
 * groups and enqueues one "send summary for these users" message per chunk,
 * then returns immediately regardless of user count.
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

    const chunks: string[][] = [];
    for (let i = 0; i < users.length; i += USERS_PER_MESSAGE) {
      chunks.push(users.slice(i, i + USERS_PER_MESSAGE).map((u) => u.id));
    }

    await publishBatch(
      chunks.map((userIds, index) => ({
        url: `${jobBaseUrl()}${RUN_PATH}`,
        body: { userIds },
        deduplicationId: `weekly-summary:${index}:${weekStamp}`,
        retries: 3,
        callback: failureCallbackUrl(),
      })),
    );

    sendSuccess(res, "Weekly summary jobs dispatched", {
      week: weekStamp,
      dispatched: users.length,
      messages: chunks.length,
    });
  } catch (error) {
    handleDispatchError(res, error, "Failed to dispatch weekly summary jobs");
  }
}

/**
 * Handler — invoked by QStash for a chunk of users. Skips users with no
 * weekly activity, so "no news" users never get a notification.
 */
export async function runWeeklySummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userIds, userId } = req.body as {
      userIds?: string[];
      userId?: string;
    };
    const ids = Array.isArray(userIds) ? userIds : userId ? [userId] : [];
    if (ids.length === 0) {
      sendError(res, "userId or userIds is required", 400);
      return;
    }

    let processed = 0;
    let channelsSent = 0;

    for (let i = 0; i < ids.length; i += RUN_CONCURRENCY) {
      const batch = ids.slice(i, i + RUN_CONCURRENCY);
      const results = await Promise.all(batch.map(processOneUser));
      for (const result of results) {
        if (result.processed) processed += 1;
        channelsSent += result.channelsSent;
      }
    }

    sendSuccess(
      res,
      "Weekly summary processed",
      { processed, channelsSent },
      200,
    );
  } catch (error) {
    sendError(res, "Internal server error", 500, error);
  }
}

async function processOneUser(
  userId: string,
): Promise<{ processed: boolean; channelsSent: number }> {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, fcmToken: true },
  });
  if (!user) {
    return { processed: false, channelsSent: 0 };
  }

  const summary = await walletHelper.getWeeklySummary(user.id);
  if (summary.thisWeekSpent === 0 && summary.thisWeekSaved === 0) {
    return { processed: false, channelsSent: 0 };
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

  return { processed: true, channelsSent };
}