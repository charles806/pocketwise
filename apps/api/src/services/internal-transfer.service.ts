import prisma from "../lib/prisma.js"
import type { InternalTransferInput } from "../validators/internal-transfer.validator.js"
import { internalWalletTransferService } from "./wallet.service.js"
import { savingsGoalService } from "./saving-goal.service.js"

export const internalTransferService = {
    async internalTransfer(userId: string, data: InternalTransferInput) {
        const result = await internalWalletTransferService.internalWalletTransfer({
            userId,
            fromType: data.fromType,
            toType: data.toType,
            amount: data.amount,
            type: "internal_transfer",
            reason: data.reason
        })

        // If money moved into savings wallet, update goal progress
        if (data.toType === "savings") {
            savingsGoalService.checkAndUpdateGoal(userId)
        }

        return result
    }
}