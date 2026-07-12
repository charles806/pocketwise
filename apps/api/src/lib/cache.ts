import { redis } from "./redis.js";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error(`Cache get error for key "${key}":`, error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key "${key}":`, error);
    }
  },

  async del(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache del error for key "${key}":`, error);
    }
  },

  async delMany(pattern: string) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delMany error for pattern "${pattern}":`, error);
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
  otpReset: (email: string) => `otp:reset:${email.toLowerCase()}`,
  resetToken: (email: string) => `resetToken:${email.toLowerCase()}`,
  pinOtpReset: (phone: string) => `pin:otp:reset:${phone}`,
  pinResetToken: (phone: string) => `pin:resetToken:${phone}`,
  p2pRecipients: (userId: string) => `p2p:recipients:${userId}`,
  waitlistCount: () => `waitlist:count`,
  waitlistAll: () => `waitlist:all`,
};

// TTLs in seconds
export const TTL = {
  USER_PROFILE: 600, // 10 minutes
  OTP: 600, // 10 minutes
  RESET_TOKEN: 300, // 5 minutes
  WALLET_BALANCE: 30, // 30 seconds
  SPLIT_CONFIG: 3600, // 1 hour
  AI_INSIGHTS: 604800, // 7 days
  LOOKUP: 600, // 10 minutes
  TRANSACTIONS: 120, // 2 minutes
  P2P_RECIPIENTS: 120, // 2 minutes
  SAVINGS_GOALS: 300, // 5 minutes
  NOTIFICATIONS: 60, // 1 minute
  WAITLIST: 600, // 10 minutes
  WALLETS_NO_BALANCE: 600, // 10 minutes (wallet structure without balance)
};
