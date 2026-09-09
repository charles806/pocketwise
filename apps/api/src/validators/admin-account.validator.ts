import { z } from "zod";

export const freezeAccountSchema = z.object({
  freezeReason: z.enum([
    "FRAUD",
    "SUSPICIOUS_ACTIVITY",
    "REQUEST_OF_REGULATORY_AUTHORITY",
    "USER_REQUEST",
    "OTHER",
  ]),
  freezeDescription: z
    .string()
    .min(1, "Freeze description is required")
    .max(500, "Freeze description too long"),
});

export const unfreezeAccountSchema = z.object({
  id: z.string().min(1, "Account ID is required"),
  type: z.literal("DepositAccount"),
  attributes: z.object({}).default({}),
});

export const updateAccountMetadataSchema = z.object({
  metadata: z.record(z.string(), z.string()),
});

export type FreezeAccountInput = z.infer<typeof freezeAccountSchema>;
export type UnfreezeAccountInput = z.infer<typeof unfreezeAccountSchema>;
export type UpdateAccountMetadataInput = z.infer<typeof updateAccountMetadataSchema>;
