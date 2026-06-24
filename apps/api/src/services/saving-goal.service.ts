import { notificationService } from "../features/notifications/notification.service.js";
import prisma from "../lib/prisma.js";
import {
  calculateDaysRemaining,
  calculateProgress,
} from "../utils/goal.utils.js";
import type {
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
} from "../validators/savings-goal.validator.js";
import { internalWalletTransferService } from "./wallet.service.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";
import { walletHelper } from "../helper/wallet-helpers.js";

export const savingsGoalService = {
  async createSavingsGoal(userId: string, data: CreateSavingsGoalInput) {
    const checkGoal = await prisma.savingsGoal.findFirst({
      where: {
        userId: userId,
        isCompleted: false,
        deletedAt: null,
        status: "ACTIVE",
      },
    });

    if (checkGoal) {
      throw new Error("You already have an active savings goal");
    }

    const createGoal = await prisma.savingsGoal.create({
      data: {
        userId: userId,
        title: data.title,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        isCompleted: false,
      },
    });

    await cache.del(CACHE_KEYS.savingsGoals(userId));
    notificationService.notifyGoalCreated(
      userId,
      data.title,
      Number(createGoal.targetAmount),
    );

    return {
      message: "Savings goal created successfully",
      result: createGoal,
    };
  },

  async getSavingsGoals(userId: string) {
    const cacheKey = CACHE_KEYS.savingsGoals(userId);
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    const result = await prisma.savingsGoal.findMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const enrichedGoals = result.map((goal) => {
      const daysRemaining = goal.deadline
        ? calculateDaysRemaining(goal.deadline)
        : null;

      const progress = calculateProgress(
        Number(goal.currentAmount),
        Number(goal.targetAmount),
      );

      return { ...goal, daysRemaining, progress };
    });

    await cache.set(cacheKey, enrichedGoals, TTL.SAVINGS_GOALS);
    return enrichedGoals;
  },

  async updateSavingsGoal(
    userId: string,
    goalId: string,
    data: UpdateSavingsGoalInput,
  ) {
    const checkGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: goalId,
        userId: userId,
        isCompleted: false,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!checkGoal) {
      throw Error("Savings goal not found or cannot be updated");
    }

    const update = await prisma.savingsGoal.update({
      where: {
        id: goalId,
      },
      data: Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined),
      ),
    });

    notificationService.notifyGoalUpdated(userId, update.title);

    await cache.del(CACHE_KEYS.savingsGoals(userId));
    return update;
  },

  async deleteSavingsGoal(userId: string, goalId: string) {
    const checkGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: goalId,
        userId: userId,
        deletedAt: null,
        isCompleted: false,
      },
    });

    if (!checkGoal) {
      throw new Error("Savings goal not found or already deleted");
    }

    const softDelete = await prisma.savingsGoal.update({
      where: {
        id: goalId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    notificationService.notifyGoalDeleted(userId, checkGoal.title);

    await cache.del(CACHE_KEYS.savingsGoals(userId));
    return softDelete;
  },

  async completeGoal(goalId: string, userId: string) {
    const getGoal = await prisma.savingsGoal.findFirst({
      where: {
        userId: userId,
        id: goalId,
        isCompleted: false,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    const getSaveWalletBalance = await prisma.wallet.findUnique({
      where: {
        userId_type: {
          userId: userId,
          type: "savings",
        },
      },
    });

    if (!getGoal) throw new Error("Goal not found");
    if (!getSaveWalletBalance) throw new Error("Save wallet not found");

    const progressPercent =
      (getGoal.currentAmount.toNumber() / getGoal.targetAmount.toNumber()) *
      100;

    if (progressPercent < 80) {
      const error = new Error(
        `You need at least 80% of your goal saved to complete it. You're at ${Math.floor(progressPercent)}%.`,
      ) as any;
      error.statusCode = 400;
      throw error;
    }

    if (getGoal.currentAmount.toNumber() > 0) {
      await internalWalletTransferService.internalWalletTransfer({
        userId: userId,
        fromType: "savings",
        toType: "spend",
        amount: getGoal.currentAmount.toNumber(),
        type: "goal_completion",
        skipAllocationGuard: true,
      });
    }

    const completedGoal = await prisma.savingsGoal.update({
      where: {
        id: goalId,
      },
      data: {
        isCompleted: true,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    notificationService.notifyGoalCompleted(
      userId,
      getGoal.title,
      getGoal.currentAmount.toNumber(),
    );

    await cache.del(CACHE_KEYS.savingsGoals(userId));
    return completedGoal;
  },

  async contributeToGoal(userId: string, goalId: string, amount: number) {
    const findGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: goalId,
        userId: userId,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!findGoal) {
      const error = new Error("No Goal found") as any;
      error.statusCode = 404;
      throw error;
    }

    if (amount <= 0) {
      const error = new Error("Low Amount") as any;
      error.statusCode = 400;
      throw error;
    }

    if (amount > (await walletHelper.getUnallocatedSavings(userId))) {
      const error = new Error("Insufficient unallocated savings. ") as any;
      error.statusCode = 400;
      throw error;
    }

    const previousProgress = calculateProgress(
      findGoal.currentAmount.toNumber(),
      findGoal.targetAmount.toNumber(),
    );

    const update = await prisma.savingsGoal.update({
      where: {
        id: goalId,
      },
      data: {
        currentAmount: {
          increment: amount,
        },
      },
    });

    const newProgress = calculateProgress(
      update.currentAmount.toNumber(),
      update.targetAmount.toNumber(),
    );

    const milestones = [25, 50, 75] as const;

    for (const milestone of milestones) {
      if (previousProgress < milestone && newProgress >= milestone) {
        notificationService.notifyGoalProgress(
          userId,
          findGoal.title,
          milestone,
        );
      }
    }

    await cache.del(CACHE_KEYS.savingsGoals(userId));

    return update;
  },
};
