import prisma from "../lib/prisma.js";
import { sendWaitlistEmail } from "../lib/mail.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";

interface WaitListInput {
  email: string;
}

export const waitListService = {
  async joinWaitList(data: WaitListInput) {
    const { email } = data;

    const existingEmail = await prisma.waitlist.findUnique({
      where: { email },
    });
    if (existingEmail) {
      const error = new Error("You're already on the waitlist.") as any;
      error.statusCode = 409;
      throw error;
    }

    const newEmail = await prisma.waitlist.create({
      data: { email },
    });

    await cache.del(CACHE_KEYS.waitlistCount());
    await cache.del(CACHE_KEYS.waitlistAll());
    sendWaitlistEmail(newEmail.email).catch(console.error);
    return { email: newEmail.email };
  },

  async getCount() {
    const cacheKey = CACHE_KEYS.waitlistCount();
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    const count = await prisma.waitlist.count();
    const result = { count };
    await cache.set(cacheKey, result, TTL.WAITLIST);
    return result;
  },

  async getAll() {
    const cacheKey = CACHE_KEYS.waitlistAll();
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    const waitlist = await prisma.waitlist.findMany({
      orderBy: { createdAt: "desc" },
    });
    await cache.set(cacheKey, waitlist, TTL.WAITLIST);
    return waitlist;
  },
};
