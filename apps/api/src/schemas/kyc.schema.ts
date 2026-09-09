import { z } from "zod";

export const kycVerifySchema = z.object({
  bvn: z
    .string()
    .regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
  gender: z.enum(["Male", "Female"]),
});

export type KycVerifyInput = z.infer<typeof kycVerifySchema>;
