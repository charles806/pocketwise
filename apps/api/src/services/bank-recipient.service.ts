import prisma from "../lib/prisma.js";

interface upsertRecipientInterface {
    userId: string,
    bankCode: string,
    bankName: string,
    accountNumber: string,
    accountName: string
}

export const bankRecipientService = {
    async upsertRecipient(userId: string, data: upsertRecipientInterface) {
        const { bankCode, bankName, accountNumber, accountName } = data

        const check = await prisma.bankRecipient.findUnique({
            where: {
                userId_accountNumber: {
                    userId,
                    accountNumber
                }
            },

        })

        if (check) {
            await prisma.bankRecipient.update({
                where: {
                    userId_accountNumber: {
                        userId,
                        accountNumber
                    }
                },
                data: {
                    lastSentAt: new Date()
                }
            })
        } else {
            await prisma.bankRecipient.create({
                data: {
                    userId,
                    bankCode,
                    bankName,
                    accountNumber,
                    accountName,
                    lastSentAt: new Date()
                }
            });
        }
    },

    async getRecentRecipients(userId: string) {
        const recipients = await prisma.bankRecipient.findMany({
            where: {
                userId
            },
            select: {
                bankCode: true,
                bankName: true,
                accountNumber: true,
                accountName: true,
                lastSentAt: true
            },
            orderBy: {
                lastSentAt: "desc"
            },
            take: 10,

        })



        return recipients
    }
}