import type { Request, Response } from "express";
import prisma from "../../../lib/prisma.js";
import { savingsGoalService } from "../../../services/saving-goal.service.js";
import { sendError, sendSuccess } from "../../../utils/response.js";
import {
  failureCallbackUrl,
  jobBaseUrl,
  publishBatch,
} from "../../queue/queue-utils.js";

const RUN_PATH = "/api/internal/jobs/goal-completion/run";

const SKIPPABLE_ERRORS = ["Goal not found", "Save wallet not found"];

/**
 * Dispatcher — called on a recurring sweep. Enqueues one "complete this goal"
 * message per expired, still-active goal.
 */
export async function dispatchGoalCompletion(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const expiredGoals = await prisma.savingsGoal.findMany({
      where: {
        isCompleted: false,
        status: "ACTIVE",
        deletedAt: null,
        deadline: { lte: new Date() },
      },
      select: { id: true, userId: true },
    });

    await publishBatch(
      expiredGoals.map((goal) => ({
        url: `${jobBaseUrl()}${RUN_PATH}`,
        body: { goalId: goal.id, userId: goal.userId },
        retries: 3,
        callback: failureCallbackUrl(),
      })),
    );

    sendSuccess(res, "Goal completion jobs dispatched", {
      dispatched: expiredGoals.length,
    });
  } catch (error) {
    sendError(res, "Failed to dispatch goal completion jobs", 500, error);
  }
}

/**
 * Handler — completes a single expired goal. Idempotent: if the goal was
 * already completed (or disappeared) between dispatch and run, it reports
 * success so QStash does not retry.
 */
export async function runGoalCompletion(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { goalId, userId } = req.body as {
      goalId?: string;
      userId?: string;
    };
    if (!goalId || !userId) {
      sendError(res, "goalId and userId are required", 400);
      return;
    }

    await savingsGoalService.completeGoal(goalId, userId);
    sendSuccess(res, "Goal completed", { goalId }, 200);
  } catch (error) {
    const message = (error as Error).message ?? "";
    if (SKIPPABLE_ERRORS.some((prefix) => message.includes(prefix))) {
      sendSuccess(res, "Goal no longer eligible, skipped", {}, 200);
      return;
    }
    sendError(res, "Failed to complete goal", 500, error);
  }
}