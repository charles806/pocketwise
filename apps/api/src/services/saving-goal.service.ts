import { notificationService } from "../features/notifications/notification.service.js";
import prisma from "../lib/prisma.js";
import { calculateDaysRemaining, calculateProgress } from "../utils/goal.utils.js";
import type { CreateSavingsGoalInput, UpdateSavingsGoalInput } from "../validators/savings-goal.validator.js";
import { internalWalletTransferService } from "./wallet.service.js";


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

        notificationService.notifyGoalCreated(userId, data.title, Number(createGoal.targetAmount))

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

        notificationService.notifyGoalUpdated(userId, update.title)

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

        notificationService.notifyGoalDeleted(userId, checkGoal.title)

        return softDelete
    },

    async completeGoal(goalId: string, userId: string) {
        const getGoal = await prisma.savingsGoal.findFirst({
            where: {
                userId: userId,
                id: goalId,
                isCompleted: false,
                status: "ACTIVE",
                deletedAt: null
            }
        })

        const getSaveWalletBalance = await prisma.wallet.findUnique({
            where: {
                userId_type: {
                    userId: userId,
                    type: "savings"
                }
            }
        })

        if (!getGoal) throw new Error("Goal not found")
        if (!getSaveWalletBalance) throw new Error("Save wallet not found")

        if (getSaveWalletBalance.balance.toNumber() > 0) {
            await internalWalletTransferService.internalWalletTransfer({
                userId: userId,
                fromType: "savings",
                toType: "spend",
                amount: getSaveWalletBalance.balance.toNumber(),
                type: "goal_completion"
            })
        }

        const completedGoal = await prisma.savingsGoal.update({
            where: {
                id: goalId
            },
            data: {
                isCompleted: true,
                status: "COMPLETED",
                completedAt: new Date()
            }
        })

        notificationService.notifyGoalCompleted(userId, getGoal.title, getSaveWalletBalance.balance.toNumber())

        return completedGoal


    },
    async checkAndUpdateGoal(userId: string) {
        const activeGoal = await prisma.savingsGoal.findFirst({
            where: {
                userId,
                isCompleted: false,
                status: "ACTIVE",
                deletedAt: null
            }
        })

        if (!activeGoal) return

        const saveWallet = await prisma.wallet.findUnique({
            where: {
                userId_type: {
                    userId,
                    type: "savings"
                }
            }
        })

        if (!saveWallet) {
            console.warn(`[GoalProgress] Savings wallet not found for user: ${userId}`)
            return
        }

        const previousCurrentAmount = activeGoal.currentAmount.toNumber()

        await prisma.savingsGoal.update({
            where: { id: activeGoal.id },
            data: { currentAmount: saveWallet.balance }
        })

        const targetAmount = activeGoal.targetAmount.toNumber()
        const newCurrentAmount = saveWallet.balance.toNumber()

        const previousProgress = calculateProgress(previousCurrentAmount, targetAmount)
        const newProgress = calculateProgress(newCurrentAmount, targetAmount)

        const milestones = [25, 50, 75] as const

        for (const milestone of milestones) {
            if (previousProgress < milestone && newProgress >= milestone) {
                notificationService.notifyGoalProgress(userId, activeGoal.title, milestone)
            }
        }
    }
}