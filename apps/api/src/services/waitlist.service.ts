import prisma from "../lib/prisma.js";
import { sendWaitlistEmail } from "../lib/mail.js";

interface WaitListInput {
    email: string;
}

export const waitListService = {
    async joinWaitList(data: WaitListInput) {
        const { email } = data;

        const existingEmail = await prisma.waitlist.findUnique({ where: { email } })
        if (existingEmail) {
            const error = new Error("You're already on the waitlist.") as any;
            error.statusCode = 409;
            throw error;
        }

        const newEmail = await prisma.waitlist.create({
            data: { email }
        })

        sendWaitlistEmail(newEmail.email).catch(console.error)
        return { email: newEmail.email }
    },

    async getCount() {
        const count = await prisma.waitlist.count()
        return { count }
    }
}

