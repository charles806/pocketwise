import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js"
import { savingsGoalService } from "../services/saving-goal.service.js";

export const walletHelper = {
    async getUnallocatedSavings(userId: string) {
        const wallet = await prisma.wallet.findUnique({
            where: {
                userId_type: {
                    userId: userId,
                    type: "savings"
                }
            }
        })

        if (!wallet) {
            const error = new Error("No wallets found") as any;
            error.statusCode = 404;
            throw error;
        }

        const result = await prisma.savingsGoal.findMany({
            where: {
                userId: userId,
                status: "ACTIVE",
                deletedAt: null
            }
        })

        const totalAllocated = result.reduce((sum, goal) => {
            return sum + goal.currentAmount.toNumber()
        }, 0)

        return wallet.balance.toNumber() - totalAllocated
    },

    async getWeeklySummary(userId: string) {
        const now = new Date()
        const thisweekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

        const thisweekSpent = await prisma.transaction.aggregate({
            where: {
                userId: userId,
                type: "transfer",
                amount: { lt: 0 },
                createdAt: { gte: thisweekStart }
            },
            _sum: {
                amount: true
            }
        })

        const lastWeekSpent = await prisma.transaction.aggregate({
            where: {
                userId,
                type: "transfer",
                amount: { lt: 0 },
                createdAt: { gte: lastWeekStart, lt: thisweekStart },
            },
            _sum: { amount: true },
        });

        const thisWeekSaved = await prisma.transaction.aggregate({
            where: {
                userId,
                type: "split_credit",
                wallet: { type: "savings" },
                createdAt: { gte: thisweekStart },
            },
            _sum: { amount: true },
        });

        const lastWeekSaved = await prisma.transaction.aggregate({
            where: {
                userId,
                type: "split_credit",
                wallet: { type: "savings" },
                createdAt: { gte: lastWeekStart, lt: thisweekStart },
            },
            _sum: { amount: true },
        });

        const thisweekSpentAmount = (thisweekSpent._sum.amount ?? new Prisma.Decimal(0)).toNumber();
        const lastWeekSpentAmount = (lastWeekSpent._sum.amount ?? new Prisma.Decimal(0)).toNumber();
        const thisWeekSavedAmount = (thisWeekSaved._sum.amount ?? new Prisma.Decimal(0)).toNumber();
        const lastWeekSavedAmount = (lastWeekSaved._sum.amount ?? new Prisma.Decimal(0)).toNumber();

        const thisweekSpentAmountFlipped = Math.abs(thisweekSpentAmount);
        const lastWeekSpentAmountFlipped = Math.abs(lastWeekSpentAmount);

        const spentDifference = thisweekSpentAmountFlipped - lastWeekSpentAmountFlipped;
        const savedDifference = thisWeekSavedAmount - lastWeekSavedAmount;

        const goalProgress = (await savingsGoalService.getSavingsGoals(userId)) as any;

        const activeGoals = goalProgress.filter((g: any) => g.status === "ACTIVE");

        let goalTitle: string | null = null;
        let goalProgressPercent: number | null = null;

        if (activeGoals.length > 0) {
            const closestGoal = activeGoals.reduce((closest: any, current: any) =>
                current.progress > closest.progress ? current : closest
            );
            goalTitle = closestGoal.title;
            goalProgressPercent = Math.round(closestGoal.progress);
        }

        return {
            thisWeekSpent: thisweekSpentAmountFlipped,
            thisWeekSaved: thisWeekSavedAmount,
            spentDifference,
            savedDifference,
            goalTitle,
            goalProgressPercent,
        };


    },

    async buildWeeklySummaryMessage(summary: {
        thisWeekSpent: number;
        thisWeekSaved: number;
        spentDifference: number;
        savedDifference: number;
        goalTitle: string | null;
        goalProgressPercent: number | null;
    }): Promise<string> {
        const { thisWeekSpent, thisWeekSaved, savedDifference, goalTitle, goalProgressPercent } = summary;

        let message = `This week: ₦${thisWeekSpent.toLocaleString()} spent, ₦${thisWeekSaved.toLocaleString()} saved.`;

        if (savedDifference > 0) {
            message += ` You saved ₦${savedDifference.toLocaleString()} more than last week 🔥`;
        } else if (savedDifference < 0) {
            message += ` You saved ₦${Math.abs(savedDifference).toLocaleString()} less than last week.`;
        }

        if (goalTitle && goalProgressPercent !== null) {
            message += ` ${goalTitle}: ${goalProgressPercent}% there.`;
        }

        return message;
    }
}