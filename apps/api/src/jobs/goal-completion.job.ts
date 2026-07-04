import cron from "node-cron";
import prisma from "../lib/prisma.js";
import { savingsGoalService } from "../services/saving-goal.service.js";

export function startGoalCompletionJob() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("[GoalCompletionJob] Starting.......");

    const findGoal = await prisma.savingsGoal.findMany({
      where: {
        isCompleted: false,
        status: "ACTIVE",
        deletedAt: null,
        deadline: { lte: new Date() },
      },
    });

    if (findGoal.length === 0) {
      console.log("[GoalCompletionJob] No expired goals found");
      return;
    }

    console.log(`[GoalCompletionJob] Found ${findGoal.length} expired goals`);

    for (const goal of findGoal) {
      try {
        console.log(goal.title);
        await savingsGoalService.completeGoal(goal.id, goal.userId);
        console.log("Success");
      } catch (error) {
        console.error(
          `[GoalCompletionJob] Failed to complete goal ${goal.id}:`,
          error,
        );
      }
    }
    console.log("Finish");
  });
}
