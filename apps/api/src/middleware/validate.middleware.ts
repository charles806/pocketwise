import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import { type ZodTypeAny } from "zod"

export const validate = (
    schema: ZodTypeAny
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params
            })
            next()
        } catch (error) {
            sendError(res, error instanceof Error ? error.message : "Invalid request")
            return
        }
    }
}