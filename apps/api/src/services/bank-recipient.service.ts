import prisma from "../lib/prisma.js";

interface upsertRecipientInterface {
    userId: string,
    bankCode: string,
    bankName: string,
    accountNumber: string,
    accountName: string,
    counterPartyId?: string
}

export const bankRecipientService = {
    async upsertRecipient(userId: string, data: upsertRecipientInterface) {
        const { bankCode, bankName, accountNumber, accountName, counterPartyId } = data

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
                    lastSentAt: new Date(),
                    ...(counterPartyId ? { counterPartyId } : {})
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
                    ...(counterPartyId ? { counterPartyId } : {}),
                    lastSentAt: new Date()
                }
            });
        }
    },

    async getByAccount(userId: string, accountNumber: string) {
        return prisma.bankRecipient.findUnique({
            where: {
                userId_accountNumber: {
                    userId,
                    accountNumber
                }
            },
            select: {
                counterPartyId: true,
                accountNumber: true,
                accountName: true,
            }
        });
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