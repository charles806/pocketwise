import type { NotificationCategory } from "@prisma/client";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import prisma from "../../lib/prisma.js";
import { sendSavingsNotificationEmail } from "../../lib/mail.js";
import { cache, CACHE_KEYS, TTL } from "../../lib/cache.js";

const goalCreatedTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "goal-created.hbs"),
  "utf-8",
);
const goalCreatedTemplate = Handlebars.compile(goalCreatedTemplateSource);

const goalUpdatedTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "goal-updated.hbs"),
  "utf-8",
);
const goalUpdatedTemplate = Handlebars.compile(goalUpdatedTemplateSource);

const goalDeletedTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "goal-deleted.hbs"),
  "utf-8",
);
const goalDeletedTemplate = Handlebars.compile(goalDeletedTemplateSource);

const goalCompletedTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "goal-completed.hbs"),
  "utf-8",
);
const goalCompletedTemplate = Handlebars.compile(goalCompletedTemplateSource);

const goalProgressTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "goal-progress.hbs"),
  "utf-8",
);
const goalProgressTemplate = Handlebars.compile(goalProgressTemplateSource);

const walletSplitTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "wallet-split.hbs"),
  "utf-8",
);
const walletSplitTemplate = Handlebars.compile(walletSplitTemplateSource);

const transferReceivedTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "transfer-received.hbs"),
  "utf-8",
);
const transferReceivedTemplate = Handlebars.compile(
  transferReceivedTemplateSource,
);

const weeklySummaryTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "weekly-summary.hbs"),
  "utf-8",
);
const weeklySummaryTemplate = Handlebars.compile(weeklySummaryTemplateSource);

const autoContributionTemplateSource = fs.readFileSync(
  path.join(__dirname, "templates", "auto-contribution.hbs"),
  "utf-8",
);
const autoContributionTemplate = Handlebars.compile(
  autoContributionTemplateSource,
);

interface NotificationInterface {
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  emailHtml: string;
  subject: string;
}

export const notificationService = {
  async sendNotification(data: NotificationInterface) {
    try {
      const { userId, title, message, category, emailHtml, subject } = data;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
          firstName: true,
        },
      });

      if (!user) {
        console.warn(`[Notification] User not found: ${userId}`);
        return;
      }

      const result = await Promise.all([
        prisma.notification.create({
          data: {
            userId: userId,
            title: title,
            message: message,
            category: category,
          },
        }),
        sendSavingsNotificationEmail(user.email, subject, emailHtml),
      ]);

      await cache.del(CACHE_KEYS.notifications(userId));
      return result;
    } catch (error) {
      console.error(`[Notification] Failed to send notification:`, error);
    }
  },

  async notifyGoalCreated(
    userId: string,
    goalTitle: string,
    targetAmount: number,
  ) {
    const formatAmount = targetAmount.toLocaleString("en-NG");

    const title = "🎯 New Savings Goal Created";
    const message = `Your goal "${goalTitle}" is officially live! You're saving up to ₦${formatAmount}. Every kobo counts — let's get it! 💪`;

    const emailHtml = goalCreatedTemplate({
      goalTitle,
      targetAmount: formatAmount,
    }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "GOAL",
      subject: title,
      emailHtml,
    });
  },

  async notifyGoalUpdated(userId: string, goalTitle: string) {
    const title = "✏️ Savings Goal Updated";
    const message = `Your goal "${goalTitle}" has been updated. Your changes are saved and you're still on track. Keep pushing! 🚀`;

    const emailHtml = goalUpdatedTemplate({ goalTitle }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "GOAL",
      subject: title,
      emailHtml,
    });
  },

  async notifyGoalDeleted(userId: string, goalTitle: string) {
    const title = "🗑️ Savings Goal Removed";
    const message = `Your goal "${goalTitle}" has been removed. No worries — every great plan evolves. Start a new one whenever you're ready.`;

    const emailHtml = goalDeletedTemplate({ goalTitle }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "GOAL",
      subject: title,
      emailHtml,
    });
  },

  async notifyGoalCompleted(
    userId: string,
    goalTitle: string,
    amountTransferred: number,
  ) {
    const formattedAmount = amountTransferred.toLocaleString("en-NG");
    const title = "🎉 Goal Smashed! Money's in Your Spend Wallet";
    const message = `You did it! "${goalTitle}" is complete. ₦${formattedAmount} has been moved to your Spend Wallet. Time to enjoy what you worked for! 🥂`;

    const emailHtml = goalCompletedTemplate({
      goalTitle,
      formattedAmount,
    }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "GOAL",
      subject: title,
      emailHtml,
    });
  },

  async notifyGoalProgress(
    userId: string,
    goalTitle: string,
    progressPercent: 25 | 50 | 75,
  ) {
    const milestoneMap = {
      25: {
        emoji: "🌱",
        heading: "You're 25% There!",
        color: "#d97706",
        bgColor: "#fffbeb",
        line: "A solid start. The hardest part is beginning — and you've already done that.",
      },
      50: {
        emoji: "🔥",
        heading: "Halfway to Your Goal!",
        color: "#4f46e5",
        bgColor: "#eef2ff",
        line: "You're right in the middle — and that's exactly where momentum builds. Don't stop now.",
      },
      75: {
        emoji: "⚡",
        heading: "75% Done — Almost There!",
        color: "#059669",
        bgColor: "#ecfdf5",
        line: "You're in the final stretch. Stay consistent — the finish line is closer than you think.",
      },
    };

    const milestone = milestoneMap[progressPercent];
    const title = `${milestone.emoji} ${milestone.heading}`;
    const message = `You're ${progressPercent}% of the way to your "${goalTitle}" goal. ${milestone.line}`;

    const emailHtml = goalProgressTemplate({
      goalTitle,
      progressPercent,
      milestoneColor: milestone.color,
      milestoneBgColor: milestone.bgColor,
      milestoneEmoji: milestone.emoji,
      milestoneHeading: milestone.heading,
      milestoneLine: milestone.line,
    }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "GOAL",
      subject: title,
      emailHtml,
    });
  },

  async notifyWalletSplit(
    userId: string,
    amount: number,
    allocations: { walletType: string; amount: number }[],
  ) {
    const formattedTotal = amount.toLocaleString("en-NG");
    const title = "💰 Money Landed — Your Wallets Have Been Topped Up";
    const message = `₦${formattedTotal} just hit your account and has been split across your wallets according to your config. Check your breakdown inside the app.`;

    const walletColors: Record<string, string> = {
      spend: "#4f46e5",
      savings: "#059669",
      emergency: "#d97706",
      flex: "#db2777",
    };

    const allocationsWithMeta = allocations.map((a) => ({
      walletLabel: a.walletType.charAt(0).toUpperCase() + a.walletType.slice(1),
      color: walletColors[a.walletType] ?? "#4f46e5",
      amount: a.amount.toLocaleString("en-NG"),
    }));

    const emailHtml = walletSplitTemplate({
      formattedTotal,
      allocations: allocationsWithMeta,
    }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "TRANSACTION",
      subject: title,
      emailHtml,
    });
  },

  async notifyTransferReceived(
    userId: string,
    amount: number,
    senderName: string,
  ) {
    const formattedAmount = amount.toLocaleString("en-NG");
    const title = "📩 You Just Received Money";
    const message = `₦${formattedAmount} from ${senderName} just landed in your account and has been split across your wallets. Check your breakdown inside the app.`;

    const emailHtml = transferReceivedTemplate({
      formattedAmount,
      senderName,
    }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "TRANSACTION",
      subject: title,
      emailHtml,
    });
  },

  async notifyWeeklySummary(
    userId: string,
    summary: {
      thisWeekSpent: number;
      thisWeekSaved: number;
      savedDifference: number;
      goalTitle: string | null;
      goalProgressPercent: number | null;
    },
  ) {
    const formattedSpent = summary.thisWeekSpent.toLocaleString("en-NG");
    const formattedSaved = summary.thisWeekSaved.toLocaleString("en-NG");
    const savedDiff = Math.abs(summary.savedDifference).toLocaleString("en-NG");

    const title = "📊 Your Weekly PocketWise Summary";
    let message: string;
    if (summary.savedDifference > 0) {
      message = `This week: ₦${formattedSpent} spent, ₦${formattedSaved} saved. You saved ₦${savedDiff} more than last week — keep it up! 🔥`;
    } else if (summary.savedDifference < 0) {
      message = `This week: ₦${formattedSpent} spent, ₦${formattedSaved} saved. You saved ₦${savedDiff} less than last week.`;
    } else {
      message = `This week: ₦${formattedSpent} spent, ₦${formattedSaved} saved. Same savings as last week.`;
    }

    const emailHtml = weeklySummaryTemplate({
      formattedSpent,
      formattedSaved,
      savedDiff,
      isMoreThanLastWeek: summary.savedDifference > 0,
      isLessThanLastWeek: summary.savedDifference < 0,
      isSameAsLastWeek: summary.savedDifference === 0,
      goalTitle: summary.goalTitle,
      goalProgressPercent: summary.goalProgressPercent,
    }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "SYSTEM",
      subject: title,
      emailHtml,
    });
  },

  async notifyAutoContribution(
    userId: string,
    goalTitle: string,
    amount: number,
  ) {
    const formattedAmount = amount.toLocaleString("en-NG");
    const title = "🎯 Auto-Save Contribution";
    const message = `₦${formattedAmount} was automatically added to your goal "${goalTitle}" this week 🎯`;

    const emailHtml = autoContributionTemplate({
      goalTitle,
      formattedAmount,
    }).trimEnd();

    return this.sendNotification({
      userId,
      title,
      message,
      category: "GOAL",
      subject: title,
      emailHtml,
    });
  },

  async getNotifications(userId: string) {
    const cacheKey = CACHE_KEYS.notifications(userId);
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    await cache.set(cacheKey, notifications, TTL.NOTIFICATIONS);
    return notifications;
  },

  async markOneAsRead(userId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
      },
      data: { isRead: true },
    });

    if (result.count === 0) {
      throw new Error("Notification not found");
    }

    await cache.del(CACHE_KEYS.notifications(userId));
    return result;
  },

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    await cache.del(CACHE_KEYS.notifications(userId));
    return result;
  },
};
