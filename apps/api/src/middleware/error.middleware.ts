import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { sendError } from "../utils/response.js";

interface AppError extends Error {
  statusCode?: number;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err)
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  sendError(res, message, status);
};
