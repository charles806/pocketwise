import prisma from "../lib/prisma.js";


interface TransferInterface {
    userId: string,
    receiverWalletId: string,
    amount: number
}

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

const transferService = {
    async transfer(data: TransferInterface) {
        const { userId, receiverWalletId, amount } = data;

        if (!amount || Number.isNaN(amount) || amount <= 0) {
            const error = new Error("Enter a valid amount") as any;
            error.statusCode = 400;
            throw error;
        }

        if (!receiverWalletId) {
            const error = new Error("Receiver wallet not provided") as any;
            error.statusCode = 400;
            throw error;
        }

        // Pre-fetch sender's spend wallet ID to validate self-transfer outside transaction
        const senderWalletCheck = await prisma.wallet.findUnique({
            where: {
                userId_type: {
                    userId,
                    type: 'spend'
                }
            },
            select: { id: true }
        });

        if (!senderWalletCheck) {
            const error = new Error("Sender spend wallet not found") as any;
            error.statusCode = 404;
            throw error;
        }

        if (senderWalletCheck.id === receiverWalletId) {
            const error = new Error("Self transfer not supported") as any;
            error.statusCode = 400;
            throw error;
        }

        // Generate the unique transfer reference outside of the transaction block
        const transferReference = crypto.randomUUID();

        const result = await prisma.$transaction(async (tx) => {
            // Find Sender Wallet of type 'spend'
            const senderWallet = await tx.wallet.findUnique({
                where: {
                    userId_type: {
                        userId,
                        type: 'spend'
                    }
                }
            });

            if (!senderWallet) {
                const error = new Error("Sender spend wallet not found") as any;
                error.statusCode = 404;
                throw error;
            }

            // Find Receiver Wallet
            const receiverWallet = await tx.wallet.findUnique({ 
                where: { id: receiverWalletId } 
            });

            if (!receiverWallet) {
                const error = new Error("Receiver wallet not found") as any;
                error.statusCode = 404;
                throw error;
            }

            const senderBalanceNum = senderWallet.balance.toNumber();

            if (amount > senderBalanceNum) {
                const error = new Error("Insufficient funds") as any;
                error.statusCode = 400;
                throw error;
            }

            // Debit sender
            const updatedSenderWallet = await tx.wallet.update({
                where: { id: senderWallet.id },
                data: { balance: { decrement: amount } }
            });

            // Credit receiver
            const updatedReceiverWallet = await tx.wallet.update({
                where: { id: receiverWalletId },
                data: { balance: { increment: amount } }
            });

            // Create Sender DEBIT transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: senderWallet.id,
                    type: 'transfer',
                    amount: -amount,
                    status: 'success',
                    reference: transferReference,
                    senderWalletId: senderWallet.id,
                    receiverWalletId: receiverWallet.id,
                }
            });

            // Create Receiver CREDIT transaction
            await tx.transaction.create({
                data: {
                    userId: receiverWallet.userId,
                    walletId: receiverWallet.id,
                    type: 'transfer',
                    amount: amount,
                    status: 'success',
                    reference: `${transferReference}-rx`,
                    senderWalletId: senderWallet.id,
                    receiverWalletId: receiverWallet.id,
                }
            });

            return {
                reference: transferReference,
                senderBalance: updatedSenderWallet.balance,
                receiverBalance: updatedReceiverWallet.balance
            };
        });

        return result;
    }
}

export { walletService, transferService };