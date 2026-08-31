import type { Request, Response } from "express";
import prisma from "../../../lib/prisma.js";
import { walletHelper } from "../../../helper/wallet-helpers.js";
import { savingsGoalService } from "../../../services/saving-goal.service.js";
import { notificationService } from "../../notifications/notification.service.js";
import { sendError, sendSuccess } from "../../../utils/response.js";
import {
  failureCallbackUrl,
  getWeekStart,
  jobBaseUrl,
  publishBatch,
  toIsoDateStamp,
} from "../../queue/queue-utils.js";

const RUN_PATH = "/api/internal/jobs/auto-contribute/run";

/**
 * Dispatcher — called weekly. Enqueues one "contribute this week" message per
 * active goal with auto-contribute enabled. Each message is deduplicated on
 * (goalId, week) so re-dispatching the same week is harmless.
 */
export async function dispatchAutoContribute(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const weekStart = getWeekStart();
    const weekStamp = toIsoDateStamp(weekStart);

    const goals = await prisma.savingsGoal.findMany({
      where: {
        autoContribute: true,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    await publishBatch(
      goals.map((goal) => ({
        url: `${jobBaseUrl()}${RUN_PATH}`,
        body: {
          goalId: goal.id,
          userId: goal.userId,
          weekStart: weekStamp,
        },
        deduplicationId: `auto-contribute:${goal.id}:${weekStamp}`,
        retries: 3,
        callback: failureCallbackUrl(),
      })),
    );

    sendSuccess(res, "Auto-contribute jobs dispatched", {
      week: weekStamp,
      dispatched: goals.length,
    });
  } catch (error) {
    sendError(res, "Failed to dispatch auto-contribute jobs", 500, error);
  }
}

/**
 * Handler — contributes `weeklyAmount` to one goal. Skips (200) when the goal
 * is no longer eligible or the user lacks unallocated savings, so QStash does
 * not burn retries on a state that will not change this week. Money only moves
 * once per (goalId, weekStart) thanks to the AutoContribution dedupe row
 * written inside the same transaction as the credit.
 */
export async function runAutoContribute(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { goalId, userId, weekStart } = req.body as {
      goalId?: string;
      userId?: string;
      weekStart?: string;
    };
    if (!goalId || !userId || !weekStart) {
      sendError(res, "goalId, userId and weekStart are required", 400);
      return;
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: {
        id: goalId,
        userId,
        autoContribute: true,
        status: "ACTIVE",
        deletedAt: null,
      },
    });
    if (!goal || !goal.weeklyAmount) {
      sendSuccess(res, "Goal no longer eligible, skipped", { goalId }, 200);
      return;
    }

    const unallocated = await walletHelper.getUnallocatedSavings(userId);
    if (unallocated < Number(goal.weeklyAmount)) {
      sendSuccess(res, "Insufficient unallocated savings, skipped", {
        goalId,
      }, 200);
      return;
    }

    await savingsGoalService.contributeToGoal(
      userId,
      goalId,
      Number(goal.weeklyAmount),
      weekStart,
    );

    notificationService
      .notifyAutoContribution(userId, goal.title, Number(goal.weeklyAmount))
      .catch((error) => {
        console.error(
          `[AutoContribute] Notification failed for goal ${goalId}:`,
          error,
        );
      });

    sendSuccess(
      res,
      "Auto-contribution processed",
      { goalId, weekStart },
      200,
    );
  } catch (error) {
    sendError(res, "Failed to process auto-contribution", 500, error);
  }
}