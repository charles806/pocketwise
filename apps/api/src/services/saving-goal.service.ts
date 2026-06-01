import prisma from "../lib/prisma.js";
import { calculateDaysRemaining, calculateProgress } from "../utils/goal.utils.js";
import type { CreateSavingsGoalInput, UpdateSavingsGoalInput } from "../validators/savings-goal.validator.js";


export const savingsGoalService = {
    async createSavingsGoal(userId: string,
        data: CreateSavingsGoalInput) {
        const checkGoal = await prisma.savingsGoal.findFirst({
            where: {
                userId: userId,
                isCompleted: false,
                deletedAt: null,
                status: "ACTIVE"
            }
        })

        if (checkGoal) {
            throw new Error("You already have an active savings goal")
        }


        const createGoal = await prisma.savingsGoal.create({
            data: {
                userId: userId,
                title: data.title,
                targetAmount: data.targetAmount,
                deadline: data.deadline,
                isCompleted: false
            }
        })

        return {
            message: "Savings goal created successfully",
            result: createGoal

        }
    },

    async getSavingsGoals(userId: string) {
        const result = await prisma.savingsGoal.findMany({
            where: {
                userId: userId,
                deletedAt: null
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        const enrichedGoals = result.map((goal) => {
            const daysRemaining = goal.deadline ? calculateDaysRemaining(goal.deadline) : null

            const progress = calculateProgress(Number(goal.currentAmount), Number(goal.targetAmount))

            return { ...goal, daysRemaining, progress }
        })

        return enrichedGoals
    },

    async updateSavingsGoal(userId: string, goalId: string, data: UpdateSavingsGoalInput) {
        const checkGoal = await prisma.savingsGoal.findFirst({
            where: {
                id: goalId,
                userId: userId,
                isCompleted: false,
                status: "ACTIVE",
                deletedAt: null
            }
        })

        if (!checkGoal) {
            throw Error("Savings goal not found or cannot be updated")
        }

        const update = await prisma.savingsGoal.update({

            where: {
                id: goalId
            },
            data: Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== undefined)
            )
        })

        return update
    },

    async deleteSavingsGoal(userId: string, goalId: string) {
        const checkGoal = await prisma.savingsGoal.findFirst({
            where: {
                id: goalId,
                userId: userId,
                deletedAt: null,
                isCompleted: false
            }
        })

        if (!checkGoal) {
            throw new Error("Savings goal not found or already deleted")
        }

        const softDelete = await prisma.savingsGoal.update({
            where: {
                id: goalId
            },
            data: {
                deletedAt: new Date()
            }
        })

        return  softDelete 
    }
}