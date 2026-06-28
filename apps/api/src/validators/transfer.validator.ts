import { z } from "zod";

export const transferSchema = z.object({
  receiverUserId: z.string().uuid("Invalid receiver ID format"),
  amount: z.number().positive("Amount must be greater than zero"),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});
