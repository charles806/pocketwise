import z from "zod";


export const waitListSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
    })
})