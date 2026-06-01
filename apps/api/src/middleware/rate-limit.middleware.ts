import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 30_000);

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    sendError(res, "Too many requests. Please try again later.", 429);
    return;
  }

  next();
};
