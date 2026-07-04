import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import { redis } from "../lib/redis.js";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyBy: "ip" | "user" | "ip-and-user";
  keyFn?: (req: Request) => string | undefined;
  message?: string;
}

interface FallbackEntry {
  count: number;
  resetAt: number;
}

const FALLBACK_MAX_SIZE = 10_000;
const fallbackStore = new Map<string, FallbackEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of fallbackStore.entries()) {
    if (entry.resetAt <= now) fallbackStore.delete(key);
  }
}, 30_000);

function formatRetryAfter(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0 && seconds > 0) return `${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

async function redisCheck(
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; resetIn: number }> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, Math.ceil(config.windowMs / 1000));
  }

  if (count > config.max) {
    const ttl = await redis.ttl(key);
    return { allowed: false, resetIn: Math.max(ttl, 0) * 1000 };
  }

  return { allowed: true, resetIn: 0 };
}

function memoryCheck(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; resetIn: number } {
  const now = Date.now();
  const entry = fallbackStore.get(key);

  if (!entry || entry.resetAt <= now) {
    if (fallbackStore.size >= FALLBACK_MAX_SIZE) {
      const entriesToDelete = Math.min(1000, fallbackStore.size);
      const keysToDelete = [...fallbackStore.keys()].slice(0, entriesToDelete);
      for (const k of keysToDelete) fallbackStore.delete(k);
    }
    fallbackStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, resetIn: 0 };
  }

  entry.count += 1;

  if (entry.count > config.max) {
    return { allowed: false, resetIn: entry.resetAt - now };
  }

  return { allowed: true, resetIn: 0 };
}

export const rateLimit = (config: RateLimitConfig) => {
  const instanceId = crypto.randomUUID();

  return async (req: Request, res: Response, next: NextFunction) => {
    const identifiers: string[] = [];

    if (config.keyBy === "ip" || config.keyBy === "ip-and-user") {
      identifiers.push(`ip:${req.ip ?? "unknown"}`);
    }
    if (config.keyBy === "user" || config.keyBy === "ip-and-user") {
      if (req.user?.id) {
        identifiers.push(`user:${req.user.id}`);
      }
    }
    if (config.keyFn) {
      const customKey = config.keyFn(req);
      if (customKey) {
        identifiers.push(customKey);
      }
    }

    if (identifiers.length === 0) {
      return next();
    }

    for (const identifier of identifiers) {
      const key = `rl:${instanceId}:${identifier}`;

      let result: { allowed: boolean; resetIn: number };
      try {
        result = await redisCheck(key, config);
      } catch {
        result = memoryCheck(key, config);
      }

      if (!result.allowed) {
        const retryAfter = Math.ceil(result.resetIn / 1000);
        res.set("Retry-After", String(retryAfter));
        const message =
          config.message ||
          `Too many requests. Try again in ${formatRetryAfter(result.resetIn)}.`;
        return sendError(res, message, 429);
      }
    }

    next();
  };
};

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const key = req.ip ?? "unknown";
  const redisKey = `rl:global:${key}`;

  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, 60);
    }

    if (count > 10) {
      const ttl = await redis.ttl(redisKey);
      res.set("Retry-After", String(Math.max(ttl, 0)));
      sendError(res, "Too many requests. Please try again later.", 429);
      return;
    }
  } catch {
    const now = Date.now();
    const entry = fallbackStore.get(key);

    if (!entry || entry.resetAt <= now) {
      fallbackStore.set(key, { count: 1, resetAt: now + 60_000 });
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > 10) {
      sendError(res, "Too many requests. Please try again later.", 429);
      return;
    }
  }

  next();
};
