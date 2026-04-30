import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import { type ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Determine if the schema is a "wrapped" schema (expecting body/query/params) 
      // or a "flat" schema (expecting just the body content).
      // We'll try parsing the body first, then fallback to the wrapped structure.
      
      const bodyResult = schema.safeParse(req.body);
      
      if (bodyResult.success) {
        return next();
      }

      // If body parse failed, try wrapped parse (for schemas that expect body/query/params)
      const wrappedResult = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (wrappedResult.success) {
        return next();
      }

      // If both failed, return the first error (usually body is what we care about)
      const error = bodyResult.error || wrappedResult.error;
      const issues = error?.issues || [];
      const errorMsg = issues[0]?.message || "Invalid request";
      
      console.error(`[Validation Error] Path: ${req.path}, Message: ${errorMsg}`, issues);
      
      return sendError(res, errorMsg, 400);
    } catch (error) {
      console.error("[Validation Middleware Exception]", error);
      sendError(
        res,
        error instanceof Error ? error.message : "Invalid request",
        400,
      );
    }
  };
};
