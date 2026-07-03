import z from "zod";
import {
  MIN_GOAL_TARGET_AMOUNT,
  validateDeadline,
} from "../utils/goal.utils.js";

export const createSavingsGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title cannot exceed 100 characters"),
    targetAmount: z
      .number()
      .min(MIN_GOAL_TARGET_AMOUNT, "Target amount must be at least ₦1000"),
    deadline: z.coerce.date().superRefine((value, ctx) => {
      const result = validateDeadline(value);
      if (!result.valid) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
      }
    }),
    autoContribute: z.boolean().optional().default(false),
    weeklyAmount: z
      .number()
      .positive("Weekly amount must be positive")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.autoContribute) {
      if (!data.weeklyAmount || data.weeklyAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Weekly amount is required when auto-contribute is enabled",
          path: ["weeklyAmount"],
        });
      }
    } else {
      data.weeklyAmount = undefined;
    }
  });

export const updateSavingsGoalSchema = z
  .object({
    title: z.string().trim().min(3).max(100).optional(),
    targetAmount: z.number().min(MIN_GOAL_TARGET_AMOUNT).optional(),
    deadline: z.coerce
      .date()
      .superRefine((value, ctx) => {
        const result = validateDeadline(value);

        if (!result.valid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: result.message,
          });
        }
      })
      .optional(),
    autoContribute: z.boolean().optional(),
    weeklyAmount: z
      .number()
      .positive("Weekly amount must be positive")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.autoContribute === true) {
      if (!data.weeklyAmount || data.weeklyAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Weekly amount is required when auto-contribute is enabled",
          path: ["weeklyAmount"],
        });
      }
    }
    if (data.autoContribute === false) {
      data.weeklyAmount = undefined;
    }
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field must be provided for update",
  );
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
