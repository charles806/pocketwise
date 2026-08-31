import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

let redisAvailable = true;

export const isRedisAvailable = () => redisAvailable;

function markUnavailable(error: unknown) {
  if (redisAvailable) {
    console.error("[Redis] Unavailable:", error);
  }
  redisAvailable = false;
}

//// Fail-open wrappers — infra hiccups must never crash a request.
//// When Redis is down they return null/undefined instead of throwing.

export const safeRedis = {
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      markUnavailable(error);
      return null;
    }
  },

  async setex(key: string, ttlSeconds: number, value: string) {
    try {
      await redis.setex(key, ttlSeconds, value);
      return true;
    } catch (error) {
      markUnavailable(error);
      return undefined;
    }
  },

  async del(...keys: string[]) {
    try {
      return await redis.del(...keys);
    } catch (error) {
      markUnavailable(error);
      return undefined;
    }
  },

  async incr(key: string): Promise<number | null> {
    try {
      return await redis.incr(key);
    } catch (error) {
      markUnavailable(error);
      return null;
    }
  },
};

export async function checkRedisConnection(): Promise<void> {
  try {
    await redis.ping();
    redisAvailable = true;
    console.log("[Redis] Connection established");
  } catch (error) {
    redisAvailable = false;
    console.warn(
      "[Redis] Connection failed — running without cache. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Redis] Detail:", error);
    }
  }
}
