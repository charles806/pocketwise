import prisma from "../lib/prisma.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";

export const transactionService = {
  async getTranactions(userId: string, page: number) {
    const cacheKey = CACHE_KEYS.transactions(userId, page);
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * 10;
    const transaction = await prisma.transaction.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        reason: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      skip,
    });

    const result = {
      transaction,
      currentPage: page,
    };

    await cache.set(cacheKey, result, TTL.TRANSACTIONS);

    return result;
  },
};
