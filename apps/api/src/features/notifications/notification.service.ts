import type { NotificationCategory } from "@prisma/client"
import prisma from "../../lib/prisma.js"
import { sendSavingsNotificationEmail } from "../../lib/mail.js"


interface NotificationInterface {
    userId: string
    title: string
    message: string
    category: NotificationCategory
    emailHtml: string
    subject: string
}

export const notificationService = {
    async sendNotification(data: NotificationInterface) {
        try {
            const { userId, title, message, category, emailHtml, subject } = data

            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    email: true,
                    firstName: true
                }
            })

            if (!user) {
                console.warn(`[Notification] User not found: ${userId}`)
                return
            }

            const result = await Promise.all([
                prisma.notification.create({
                    data: {
                        userId: userId,
                        title: title,
                        message: message,
                        category: category
                    }
                }),
                sendSavingsNotificationEmail(user.email, subject, emailHtml)
            ])
            return result
        } catch (error) {
            console.error(`[Notification] Failed to send notification:`, error)
        }
    },

    async notifyGoalCreated(userId: string, goalTitle: string, targetAmount: number) {
        const formatAmount = targetAmount.toLocaleString("en-NG")

        const title = "🎯 New Savings Goal Created"
        const message = `Your goal "${goalTitle}" is officially live! You're saving up to ₦${formatAmount}. Every kobo counts — let's get it! 💪`

        const emailHtml = `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif;">
  
  <div style="background:#4f46e5; padding:30px; text-align:center;">
    <h1 style="color:white; margin:0;">Goal Unlocked 🎯</h1>
  </div>

  <div style="background:#ffffff; padding:30px;">
    <p>Hey there,</p>
    <p>You just created a new savings goal — <strong>${goalTitle}</strong>.</p>
    <p>Target: <strong style="color:#059669;">₦${formatAmount}</strong></p>
    <p>Every deposit brings you closer. Stay consistent and you'll get there! 💪</p>
  </div>

  <div style="background:#f5f5f5; padding:20px; text-align:center;">
    <small style="color:#999;">PocketWise</small>
  </div>

</div>
        `

        return this.sendNotification({
            userId,
            title,
            message,
            category: "GOAL",
            subject: title,
            emailHtml
        })


    },

    async notifyGoalUpdated(userId: string, goalTitle: string) {
        const title = "✏️ Savings Goal Updated"
        const message = `Your goal "${goalTitle}" has been updated. Your changes are saved and you're still on track. Keep pushing! 🚀`

        const emailHtml = `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif;">
    <div style="background:#4f46e5; padding:30px; text-align:center;">
        <h1 style="color:white; margin:0;">Goal Updated ✏️</h1>
    </div>
    <div style="background:#ffffff; padding:30px;">
        <p>Hey there,</p>
        <p>Your savings goal <strong>${goalTitle}</strong> has been updated successfully.</p>
        <p style="color:#475569;">Your changes are locked in. Stay focused and keep building toward your target.</p>
        <p>You've got this. 💪</p>
    </div>
    <div style="background:#f8fafc; padding:20px; text-align:center;">
        <small style="color:#475569;">PocketWise — Your Smart Finance Partner</small>
    </div>
</div>`

        return this.sendNotification({
            userId,
            title,
            message,
            category: "GOAL",
            subject: title,
            emailHtml
        })
    },

    async notifyGoalDeleted(userId: string, goalTitle: string) {
        const title = "🗑️ Savings Goal Removed"
        const message = `Your goal "${goalTitle}" has been removed. No worries — every great plan evolves. Start a new one whenever you're ready.`

        const emailHtml = `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif;">
    <div style="background:#0f172a; padding:30px; text-align:center;">
        <h1 style="color:white; margin:0;">Goal Removed 🗑️</h1>
    </div>
    <div style="background:#ffffff; padding:30px;">
        <p>Hey there,</p>
        <p>Your savings goal <strong>${goalTitle}</strong> has been removed from your account.</p>
        <p style="color:#475569;">That's okay — the best financial plans adapt. When you're ready to set a new target, we'll be right here.</p>
        <p>Start fresh anytime. 🌱</p>
    </div>
    <div style="background:#f8fafc; padding:20px; text-align:center;">
        <small style="color:#475569;">PocketWise — Your Smart Finance Partner</small>
    </div>
</div>`

        return this.sendNotification({
            userId,
            title,
            message,
            category: "GOAL",
            subject: title,
            emailHtml
        })
    },

    async notifyGoalCompleted(userId: string, goalTitle: string, amountTransferred: number) {
        const formattedAmount = amountTransferred.toLocaleString("en-NG")
        const title = "🎉 Goal Smashed! Money's in Your Spend Wallet"
        const message = `You did it! "${goalTitle}" is complete. ₦${formattedAmount} has been moved to your Spend Wallet. Time to enjoy what you worked for! 🥂`

        const emailHtml = `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif;">
    <div style="background:#4f46e5; padding:40px; text-align:center;">
        <h1 style="color:white; margin:0; font-size:28px;">You Smashed It! 🎉</h1>
        <p style="color:#eef2ff; margin-top:10px;">Your savings goal is complete</p>
    </div>
    <div style="background:#ffffff; padding:30px;">
        <p>Hey there,</p>
        <p>Your goal <strong>${goalTitle}</strong> has officially been completed. 🏆</p>
        <p>We've moved <strong style="color:#059669;">₦${formattedAmount}</strong> straight into your Spend Wallet — it's yours to use.</p>
        <div style="background:#ecfdf5; border-left:4px solid #059669; padding:15px; margin:20px 0; border-radius:4px;">
            <p style="margin:0; color:#059669; font-weight:bold;">₦${formattedAmount} transferred to Spend Wallet ✅</p>
        </div>
        <p style="color:#475569;">This is what discipline looks like. Set your next goal and keep the momentum going.</p>
    </div>
    <div style="background:#f8fafc; padding:20px; text-align:center;">
        <small style="color:#475569;">PocketWise — Your Smart Finance Partner</small>
    </div>
</div>`

        return this.sendNotification({
            userId,
            title,
            message,
            category: "GOAL",
            subject: title,
            emailHtml
        })
    },

    async notifyGoalProgress(userId: string, goalTitle: string, progressPercent: 25 | 50 | 75) {
        const milestoneMap = {
            25: {
                emoji: "🌱",
                heading: "You're 25% There!",
                color: "#d97706",
                bgColor: "#fffbeb",
                line: "A solid start. The hardest part is beginning — and you've already done that."
            },
            50: {
                emoji: "🔥",
                heading: "Halfway to Your Goal!",
                color: "#4f46e5",
                bgColor: "#eef2ff",
                line: "You're right in the middle — and that's exactly where momentum builds. Don't stop now."
            },
            75: {
                emoji: "⚡",
                heading: "75% Done — Almost There!",
                color: "#059669",
                bgColor: "#ecfdf5",
                line: "You're in the final stretch. Stay consistent — the finish line is closer than you think."
            }
        }

        const milestone = milestoneMap[progressPercent]
        const title = `${milestone.emoji} ${milestone.heading}`
        const message = `You're ${progressPercent}% of the way to your "${goalTitle}" goal. ${milestone.line}`

        const emailHtml = `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif;">
    <div style="background:${milestone.color}; padding:30px; text-align:center;">
        <h1 style="color:white; margin:0;">${milestone.emoji} ${milestone.heading}</h1>
    </div>
    <div style="background:#ffffff; padding:30px;">
        <p>Hey there,</p>
        <p>You've hit <strong style="color:${milestone.color};">${progressPercent}%</strong> on your goal — <strong>${goalTitle}</strong>.</p>
        <div style="background:${milestone.bgColor}; border-left:4px solid ${milestone.color}; padding:15px; margin:20px 0; border-radius:4px;">
            <p style="margin:0; color:${milestone.color}; font-weight:bold;">${progressPercent}% Complete ${milestone.emoji}</p>
        </div>
        <p style="color:#475569;">${milestone.line}</p>
    </div>
    <div style="background:#f8fafc; padding:20px; text-align:center;">
        <small style="color:#475569;">PocketWise — Your Smart Finance Partner</small>
    </div>
</div>`

        return this.sendNotification({
            userId,
            title,
            message,
            category: "GOAL",
            subject: title,
            emailHtml
        })
    },

    async notifyWalletSplit(userId: string, amount: number, allocations: { walletType: string, amount: number }[]) {
        const formattedTotal = amount.toLocaleString("en-NG")
        const title = "💰 Money Landed — Your Wallets Have Been Topped Up"
        const message = `₦${formattedTotal} just hit your account and has been split across your wallets according to your config. Check your breakdown inside the app.`

        const walletColors: Record<string, string> = {
            spend: "#4f46e5",
            savings: "#059669",
            emergency: "#d97706",
            flex: "#db2777"
        }

        const allocationRows = allocations.map(a => `
        <tr>
            <td style="padding:10px; text-transform:capitalize; color:#0f172a; font-weight:500;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${walletColors[a.walletType] ?? "#4f46e5"}; margin-right:8px;"></span>
                ${a.walletType} Wallet
            </td>
            <td style="padding:10px; text-align:right; font-weight:bold; color:${walletColors[a.walletType] ?? "#4f46e5"};">
                ₦${a.amount.toLocaleString("en-NG")}
            </td>
        </tr>
    `).join("")

        const emailHtml = `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif;">
    <div style="background:#4f46e5; padding:30px; text-align:center;">
        <h1 style="color:white; margin:0;">Money Landed 💰</h1>
        <p style="color:#eef2ff; margin-top:8px;">₦${formattedTotal} has been split across your wallets</p>
    </div>
    <div style="background:#ffffff; padding:30px;">
        <p>Hey there,</p>
        <p>Your deposit of <strong style="color:#4f46e5;">₦${formattedTotal}</strong> has arrived and been distributed according to your split config.</p>
        <table style="width:100%; border-collapse:collapse; margin-top:20px; background:#f8fafc; border-radius:8px; overflow:hidden;">
            <thead>
                <tr style="background:#eef2ff;">
                    <th style="padding:10px; text-align:left; color:#475569; font-size:13px;">WALLET</th>
                    <th style="padding:10px; text-align:right; color:#475569; font-size:13px;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${allocationRows}
            </tbody>
        </table>
        <p style="color:#475569; margin-top:20px;">Your money is exactly where it should be. Keep it moving. 🚀</p>
    </div>
    <div style="background:#f8fafc; padding:20px; text-align:center;">
        <small style="color:#475569;">PocketWise — Your Smart Finance Partner</small>
    </div>
</div>`

        return this.sendNotification({
            userId,
            title,
            message,
            category: "TRANSACTION",
            subject: title,
            emailHtml
        })
    },

    async notifyTransferReceived(userId: string, amount: number, senderName: string) {
        const formattedAmount = amount.toLocaleString("en-NG")
        const title = "📩 You Just Received Money"
        const message = `₦${formattedAmount} from ${senderName} just landed in your account and has been split across your wallets. Check your breakdown inside the app.`

        const emailHtml = `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif;">
    <div style="background:#4f46e5; padding:30px; text-align:center;">
        <h1 style="color:white; margin:0;">Money Received 📩</h1>
        <p style="color:#eef2ff; margin-top:8px;">₦${formattedAmount} just hit your account</p>
    </div>
    <div style="background:#ffffff; padding:30px;">
        <p>Hey there,</p>
        <p><strong style="color:#4f46e5;">${senderName}</strong> just sent you <strong style="color:#059669;">₦${formattedAmount}</strong>.</p>
        <div style="background:#ecfdf5; border-left:4px solid #059669; padding:15px; margin:20px 0; border-radius:4px;">
            <p style="margin:0; color:#059669; font-weight:bold;">₦${formattedAmount} received and split across your wallets ✅</p>
        </div>
        <p style="color:#475569;">The money has been distributed across your wallets based on your split configuration. Open the app to see the full breakdown.</p>
    </div>
    <div style="background:#f8fafc; padding:20px; text-align:center;">
        <small style="color:#475569;">PocketWise — Your Smart Finance Partner</small>
    </div>
</div>`

        return this.sendNotification({
            userId,
            title,
            message,
            category: "TRANSACTION",
            subject: title,
            emailHtml
        })
    },

    async getNotifications(userId: string) {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        })
        return notifications
    },

    async markOneAsRead(userId: string, notificationId: string) {
        const result = await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId: userId
            },
            data: { isRead: true }
        })

        if (result.count === 0) {
            throw new Error("Notification not found")
        }

        return result
    },

    async markAllAsRead(userId: string) {
        const result = await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false
            },
            data: { isRead: true }
        })
        return result
    }
}