import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

const KEEP_ALIVE_SECRET = process.env.KEEP_ALIVE_SECRET;

export const keepAliveAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!KEEP_ALIVE_SECRET) {
    console.error("[KeepAliveAuth] KEEP_ALIVE_SECRET is not configured");
    sendError(res, "Server configuration error", 500);
    return;
  }

  const secret =
    (req.headers["x-keep-alive-secret"] as string | undefined) ??
    (req.query.secret as string | undefined);

  if (!secret) {
    sendError(res, "Unauthorized: Missing keep-alive secret", 401);
    return;
  }

  if (secret !== KEEP_ALIVE_SECRET) {
    sendError(res, "Unauthorized: Invalid keep-alive secret", 401);
    return;
  }

  next();
};
