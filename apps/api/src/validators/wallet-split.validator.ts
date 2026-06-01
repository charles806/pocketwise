import { z } from "zod";

export const walletSplitConfigSchema = z
  .object({
    spendPercent: z
      .number()
      .min(50, "Spend must be at least 50%")
      .max(75, "Spend cannot exceed 75%"),

    savingsPercent: z
      .number()
      .min(10, "Savings must be at least 10%")
      .max(30, "Savings cannot exceed 30%"),

    emergencyPercent: z
      .number()
      .min(0.01, "Emergency cannot be zero")
      .max(10, "Emergency cannot exceed 10%"),

    flexPercent: z
      .number()
      .min(0, "Flex cannot be negative")
      .max(10, "Flex cannot exceed 10%"),
  })
  .superRefine((data, ctx) => {
    const total =
      data.spendPercent +
      data.savingsPercent +
      data.emergencyPercent +
      data.flexPercent;

    if (Math.abs(total - 100) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wallet split percentages must add up to 100%",
        path: [],
      });
    }
  });

  export type WalletSplitConfigInput = z.infer<typeof walletSplitConfigSchema>