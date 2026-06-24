import prisma from "../lib/prisma.js"

export const walletHelper = {
    async getUnallocatedSavings(userId: string) {
        const wallet = await prisma.wallet.findUnique({
            where: {
                userId_type: {
                    userId: userId,
                    type: "savings"
                }
            }
        })

        if (!wallet) {
            const error = new Error("No wallets found") as any;
            error.statusCode = 404;
            throw error;
        }

        const result = await prisma.savingsGoal.findMany({
            where: {
                userId: userId,
                status: "ACTIVE",
                deletedAt: null
            }
        })

        const totalAllocated = result.reduce((sum, goal) => {
            return sum + goal.currentAmount.toNumber()
        }, 0)

        return wallet.balance.toNumber() - totalAllocated
    }
}