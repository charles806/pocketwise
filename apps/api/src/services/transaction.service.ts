import prisma from "../lib/prisma.js";

export const transactionService = {
    async getTranactions(userId: string, page: number) {
        const skip = (page - 1) * 10
        const transaction = await prisma.transaction.findMany({
            where: {
                userId,
            }, select: {
                id: true,
                type: true,
                amount: true,
                reason: true,
                status: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 10,
            skip
        })


        if (transaction.length === 0) {
            return {
                transaction: [],
                currentPage: page
            }
        }

        return {
            transaction,
            currentPage: page
        }


    }
}