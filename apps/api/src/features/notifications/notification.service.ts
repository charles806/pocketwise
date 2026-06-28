import type { NotificationCategory } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { sendSavingsNotificationEmail } from "../../lib/mail.js";
import { cache, CACHE_KEYS, TTL } from "../../lib/cache.js";

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

    const emailHtml = `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #059669; padding:0;">

        <div style="background:#ecfdf5; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 0; letter-spacing:-0.3px;">Goal Unlocked 🎯</h1>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 12px;">You just created a new savings goal — <strong style="color:#059669;">${goalTitle}</strong>.</p>

          <div style="background:#ecfdf5; border-left:4px solid #059669; padding:14px 16px; margin:20px 0; border-radius:6px;">
            <p style="margin:0; color:#059669; font-weight:700; font-size:18px;">Target: ₦${formatAmount}</p>
          </div>

          <p style="margin:0 0 12px;">Every deposit brings you closer. Stay consistent and you'll get there! 💪</p>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`;

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

    const emailHtml = `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #4f46e5; padding:0;">

        <div style="background:#eef2ff; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 0; letter-spacing:-0.3px;">Goal Updated ✏️</h1>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 12px;">Your savings goal <strong style="color:#4f46e5;">${goalTitle}</strong> has been updated successfully.</p>

          <div style="background:#eef2ff; border-left:4px solid #4f46e5; padding:14px 16px; margin:20px 0; border-radius:6px;">
            <p style="margin:0; color:#475569; font-size:14px;">Your changes are locked in. Stay focused and keep building toward your target.</p>
          </div>

          <p style="margin:0;">You've got this. 💪</p>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`;

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

    const emailHtml = `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #475569; padding:0;">

        <div style="background:#f8fafc; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 0; letter-spacing:-0.3px;">Goal Removed 🗑️</h1>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 12px;">Your savings goal <strong style="color:#475569;">${goalTitle}</strong> has been removed from your account.</p>

          <div style="background:#f8fafc; border-left:4px solid #475569; padding:14px 16px; margin:20px 0; border-radius:6px;">
            <p style="margin:0; color:#475569; font-size:14px;">That's okay — the best financial plans adapt. When you're ready to set a new target, we'll be right here.</p>
          </div>

          <p style="margin:0;">Start fresh anytime. 🌱</p>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`;

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

    const emailHtml = `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #059669; padding:0;">

        <div style="background:#ecfdf5; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:24px; font-weight:700; color:#0f172a; margin:16px 0 4px; letter-spacing:-0.3px;">You Smashed It! 🎉</h1>
          <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:15px; color:#059669; font-weight:600; margin:0;">Goal complete</p>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 12px;">Your goal <strong style="color:#059669;">${goalTitle}</strong> has officially been completed. 🏆</p>

          <div style="background:#f0fdf4; border:2px solid #059669; border-radius:12px; padding:20px; margin:20px 0; text-align:center;">
            <p style="margin:0 0 4px; color:#059669; font-size:13px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">Transferred to Spend Wallet</p>
            <p style="margin:0; color:#059669; font-size:28px; font-weight:700; letter-spacing:-0.5px;">₦${formattedAmount}</p>
            <p style="margin:8px 0 0; color:#059669; font-size:14px;">✅ Ready to use</p>
          </div>

          <p style="margin:0 0 12px;">This is what discipline looks like. Set your next goal and keep the momentum going.</p>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`;

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

    const progressWidth = progressPercent;

    const emailHtml = `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid ${milestone.color}; padding:0;">

        <div style="background:${milestone.bgColor}; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 0; letter-spacing:-0.3px;">${milestone.emoji} ${milestone.heading}</h1>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 20px;">You've hit <strong style="color:${milestone.color}; font-size:17px;">${progressPercent}%</strong> on your goal — <strong style="color:#0f172a;">${goalTitle}</strong>.</p>

          <div style="margin:20px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td style="background:#e2e8f0; border-radius:9999px; height:10px; padding:0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:${progressWidth}%;">
                    <tr>
                      <td style="background:${milestone.color}; border-radius:9999px; height:10px;"></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0; color:${milestone.color}; font-weight:700; font-size:16px;">${progressPercent}% Complete ${milestone.emoji}</p>
          </div>

          <div style="background:${milestone.bgColor}; border-left:4px solid ${milestone.color}; padding:14px 16px; margin:20px 0; border-radius:6px;">
            <p style="margin:0; color:#475569; font-size:14px;">${milestone.line}</p>
          </div>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`;

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

    const allocationRows = allocations
      .map(
        (a) => `
        <tr>
            <td style="border-bottom:1px solid #f1f5f9; padding:12px 14px; color:#0f172a; font-weight:500; font-size:14px;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${walletColors[a.walletType] ?? "#4f46e5"}; margin-right:10px; vertical-align:middle;"></span>
                <span style="vertical-align:middle;">${a.walletType.charAt(0).toUpperCase() + a.walletType.slice(1)} Wallet</span>
            </td>
            <td style="border-bottom:1px solid #f1f5f9; padding:12px 14px; text-align:right; font-weight:700; color:${walletColors[a.walletType] ?? "#4f46e5"}; font-size:15px;">
                ₦${a.amount.toLocaleString("en-NG")}
            </td>
        </tr>
    `,
      )
      .join("");

    const emailHtml = `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #4f46e5; padding:0;">

        <div style="background:#eef2ff; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 4px; letter-spacing:-0.3px;">Money Landed 💰</h1>
          <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#4f46e5; margin:0; letter-spacing:-0.3px;">₦${formattedTotal}</p>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 20px;">Your deposit has arrived and been distributed according to your split config.</p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; border-radius:12px; overflow:hidden;">
            <thead>
              <tr>
                <th style="background:#eef2ff; padding:10px 14px; text-align:left; color:#475569; font-size:12px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">Wallet</th>
                <th style="background:#eef2ff; padding:10px 14px; text-align:right; color:#475569; font-size:12px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${allocationRows}
            </tbody>
          </table>

          <p style="margin:20px 0 0;">Your money is exactly where it should be. Keep it moving. 🚀</p>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`;

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

    const emailHtml = `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #059669; padding:0;">

        <div style="background:#ecfdf5; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 4px; letter-spacing:-0.3px;">Money Received 📩</h1>
          <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#059669; margin:0; letter-spacing:-0.3px;">₦${formattedAmount}</p>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 12px;"><strong style="color:#059669;">${senderName}</strong> just sent you <strong style="color:#059669;">₦${formattedAmount}</strong>.</p>

          <div style="background:#ecfdf5; border-left:4px solid #059669; padding:14px 16px; margin:20px 0; border-radius:6px;">
            <p style="margin:0; color:#059669; font-weight:600; font-size:14px;">₦${formattedAmount} received and split across your wallets ✅</p>
          </div>

          <p style="margin:0;">The money has been distributed across your wallets based on your split configuration. Open the app to see the full breakdown.</p>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`;

    return this.sendNotification({
      userId,
      title,
      message,
      category: "TRANSACTION",
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
