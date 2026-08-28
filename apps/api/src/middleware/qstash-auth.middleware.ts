import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import {
  isQstashConfigured,
  qstashReceiver,
} from "../features/queue/qstash.js";

/**
 * Verifies that a request genuinely came from QStash by validating the
 * Upstash-Signature JWT against the raw request body.
 *
 * NOTE: routes using this MUST be mounted before express.json() and parse the
 * body with express.raw(), otherwise the body digest will not match.
 */
export const qstashAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!isQstashConfigured()) {
    sendError(res, "Server misconfigured: QStash keys missing", 500);
    return;
  }

  const signature = req.headers["upstash-signature"] as string | undefined;

  if (!signature) {
    sendError(res, "Unauthorized: Missing Upstash-Signature", 401);
    return;
  }

  const body = Buffer.isBuffer(req.body)
    ? req.body.toString()
    : JSON.stringify(req.body ?? "");

  const url = `${process.env.APP_BASE_URL ?? ""}${req.originalUrl}`;

  try {
    await qstashReceiver.verify({ body, signature, url });
    next();
  } catch (error) {
    console.error("[QStashAuth] Signature verification failed:", error);
    sendError(res, "Unauthorized: Invalid signature", 401);
    return;
  }
};
