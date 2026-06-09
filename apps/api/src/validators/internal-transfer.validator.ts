import { z } from "zod"
import { WalletType } from "@prisma/client"

export const internalTransferSchema = z.object({
    fromType: z.nativeEnum(WalletType),
    toType: z.nativeEnum(WalletType),
    amount: z.number().min(1000, "Minimum transfer amount is ₦1,000"),
    reason: z.string().optional()
}).superRefine((data, ctx) => {
    if (data.fromType === data.toType) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cannot transfer to the same wallet",
            path: ["toType"]
        })
    }

    if (data.fromType === WalletType.savings) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Savings wallet cannot be used for manual transfers",
            path: ["fromType"]
        })
    }

    if (data.fromType === WalletType.emergency && data.toType !== WalletType.spend) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Emergency wallet can only transfer to Spend wallet",
            path: ["toType"]
        })
    }

    if (data.fromType === WalletType.emergency && !data.reason) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A reason is required for Emergency wallet withdrawals",
            path: ["reason"]
        })
    }
})

export type InternalTransferInput = z.infer<typeof internalTransferSchema>