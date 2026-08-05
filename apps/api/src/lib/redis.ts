import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

let redisAvailable = true;

export const isRedisAvailable = () => redisAvailable;

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
