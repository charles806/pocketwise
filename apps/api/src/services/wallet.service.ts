import prisma from "../lib/prisma.js";

const walletService = {
    async getWallet(userId: string) {

        // Get all wallets belonging to user
        const wallets = await prisma.wallet.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                type: true,
                balance: true,
                isLocked: true
            }
        });

        // Check if user has wallets
        if (wallets.length === 0) {
            const error = new Error("No wallets found") as any;
            error.statusCode = 404;
            throw error;
        }

        // Calculate total balance
        let totalBalance = 0;

        for (const wallet of wallets) {
            totalBalance += Number(wallet.balance);
        }

        // Return clean result
        return {
            totalBalance,
            wallets,
        };
    },
};

export { walletService };