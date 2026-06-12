// src/lib/cache.ts
import { redis } from "./redis.js";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data as T | null;
  },

  async set(key: string, value: unknown, ttlSeconds: number) {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },

  async del(key: string) {
    await redis.del(key);
  },

  async delMany(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Cache keys — keep them consistent
export const CACHE_KEYS = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  userWallets: (userId: string) => `user:wallets:${userId}`,
  splitConfig: (userId: string) => `user:split:${userId}`,
  aiInsights: (userId: string) => `user:insights:${userId}`,
  userLookup: (type: string, value: string) => `lookup:${type}:${value}`,
  transactions: (userId: string, page: number) => `txns:${userId}:page:${page}`,
  savingsGoals: (userId: string) => `goals:${userId}`,
  notifications: (userId: string) => `notifs:${userId}`,
  waitlistCount: () => `waitlist:count`,
  waitlistAll: () => `waitlist:all`,
};

// TTLs in seconds
export const TTL = {
  USER_PROFILE: 600, // 10 minutes
  WALLET_BALANCE: 30, // 30 seconds
  SPLIT_CONFIG: 3600, // 1 hour
  AI_INSIGHTS: 604800, // 7 days
  LOOKUP: 600, // 10 minutes
  TRANSACTIONS: 120, // 2 minutes
  SAVINGS_GOALS: 300, // 5 minutes
  NOTIFICATIONS: 60, // 1 minute
  WAITLIST: 600, // 10 minutes
  WALLETS_NO_BALANCE: 600, // 10 minutes (wallet structure without balance)
};
