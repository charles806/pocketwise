import { z } from "zod"

export const signupSchema = z.object({
    body: z.object({
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        userName: z.string().min(2, "Username must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phoneNumber: z.string().optional(),
        dateOfBirth: z.string().date("Invalid date format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string()
    })
}).refine((data) => data.body.password === data.body.confirmPassword, {
    message: "Passwords do not match",
    path: ["body", "confirmPassword"]
})

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
})