import type { NotificationCategory } from "@prisma/client"
import prisma from "../../lib/prisma.js"


interface NotificationInterface {
    userId: string
    title: string
    message: string
    category: NotificationCategory
    emailHtml: string
}

export const notificationService = {
    async sendNotification(data: NotificationInterface) {
        const { userId, title, message, category, emailHtml } = data

        await Promise.all([
            prisma.notification.create({
                data: {
                    userId: userId,
                    title: title,
                    message: message,
                    category: category
                }
            }),
        ])
    }
}