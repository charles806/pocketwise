import prisma from "../lib/prisma.js"
import type { InternalTransferInput } from "../validators/internal-transfer.validator.js"
import { internalWalletTransferService } from "./wallet.service.js"


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

 

        return result
    }
}