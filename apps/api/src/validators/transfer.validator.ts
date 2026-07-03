import { z } from "zod";

export const transferSchema = z.object({
  receiverUserId: z.string().uuid("Invalid receiver ID format"),
  amount: z.number().positive("Amount must be greater than zero"),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});



export const externalTransferSchema = z.object({
  bankCode: z.string().min(1, "Bank code is required"),
  accountNumber: z.string().length(10, "Account number must be exactly 10 digits").regex(/^\d+$/, "Account number must contain only digits"),
  amount: z.number().positive("Amount must be greater than zero"),
  accountName: z.string().min(1, "Account name is required"),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
  pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d+$/, "PIN must be numeric"),
})


