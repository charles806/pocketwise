import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { savingsGoalService } from "../services/saving-goal.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const completeGoalsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const expiredGoals = await prisma.savingsGoal.findMany({
      where: {
        isCompleted: false,
        status: "ACTIVE",
        deletedAt: null,
        deadline: { lte: new Date() },
      },
    });

    if (expiredGoals.length === 0) {
      sendSuccess(res, "No expired goals found", { completed: 0 });
      return;
    }

    const results: {
      id: string;
      title: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const goal of expiredGoals) {
      try {
        await savingsGoalService.completeGoal(goal.id, goal.userId);
        results.push({ id: goal.id, title: goal.title, success: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          id: goal.id,
          title: goal.title,
          success: false,
          error: message,
        });
      }
    }

    sendSuccess(res, "Goal completion job finished", {
      completed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    sendError(res, message, 500);
  }
};
