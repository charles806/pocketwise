import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import { type ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const input =
        req.body.email !== undefined
          ? req.body
          : { body: req.body, query: req.query, params: req.params };

      const result = schema.safeParse(input);

      if (!result.success) {
        const zodError = result.error as unknown as {
          errors: Array<{ message: string }>;
        };
        const errorMsg = zodError.errors?.[0]?.message || "Invalid request";
        return sendError(res, errorMsg, 400);
      }

      next();
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : "Invalid request",
        400,
      );
    }
  };
};
