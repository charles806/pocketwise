import { z } from "zod";

export const emergencyUnlockSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(1000, "Reason too long"),
});
