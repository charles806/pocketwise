import type { TransactionType, WalletType } from "@prisma/client";
import prisma from "../lib/prisma.js";


interface TransferInterface {
    userId: string,
    receiverWalletId: string,
    amount: number
}

interface internalWalletTransferInterface {
    userId: string,
    fromType: WalletType,
    toType: WalletType,
    amount: number,
    type: TransactionType
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

const internalWalletTransferService = {
    async internalWalletTransfer(data: internalWalletTransferInterface) {
        const { userId, fromType, toType, amount, type } = data

        if (!amount || Number.isNaN(amount) || amount <= 0) {
            const error = new Error("Transfer amount must be greater than zero") as any;
            error.statusCode = 400;
            throw error;
        }

        const reference = crypto.randomUUID()

        const result = await prisma.$transaction(async (tx) => {
            // Lock both wallet rows
            await tx.$queryRaw`
        SELECT id
        FROM wallets
        WHERE user_id = ${userId}::uuid
          AND type IN (${fromType}, ${toType})
        FOR UPDATE
    `;

            const wallets = await tx.wallet.findMany({
                where: {
                    userId: data.userId,
                    type: {
                        in: [data.fromType, data.toType]
                    }
                }
            });

            const fromWallet = wallets.find(
                wallets => wallets.type === data.fromType
            )


            const toWallet = wallets.find(
                wallets => wallets.type === data.toType
            )

            if (!fromWallet) {
                throw new Error(`${data.fromType} wallet not found`);
            }

            if (!toWallet) {
                throw new Error(`${data.toType} wallet not found`);
            }

            if (fromWallet.balance.toNumber() < amount) {
                throw new Error("Insufficient funds")
            }

            const deductWallet = await tx.wallet.update({
                where: {
                    id: fromWallet.id
                },
                data: {
                    balance: { decrement: amount }
                }
            })

            const addWallet = await tx.wallet.update({
                where: {
                    id: toWallet.id
                },
                data: {
                    balance: { increment: amount }
                }
            })

            // Create Sender DEBIT transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: fromWallet.id,
                    type: type,
                    amount: -amount,
                    status: 'success',
                    reference: reference,
                    senderWalletId: deductWallet.id,
                    receiverWalletId: addWallet.id,
                }
            });

            // Create Receiver CREDIT transaction
            await tx.transaction.create({
                data: {
                    userId: addWallet.userId,
                    walletId: addWallet.id,
                    type: type,
                    amount: amount,
                    status: 'success',
                    reference: `${reference}-rx`,
                    senderWalletId: deductWallet.id,
                    receiverWalletId: addWallet.id,
                }
            });

            return {
                reference,
                fromWalletBalance: deductWallet.balance,
                toWalletBalance: addWallet.balance
            }


        });

        return result


    }
}

export { walletService, transferService, internalWalletTransferService };