import prisma from "../lib/prisma.js";
import type { WalletSplitConfigInput } from "../validators/wallet-split.validator.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";

export const walletSplitService = {
  async setWalletSplitConfig(userId: string, data: WalletSplitConfigInput) {
    const check = await prisma.walletSplitConfig.findUnique({
      where: {
        userId: userId,
      },
    });

    if (check) {
      throw new Error("Split config already exists. Use update instead");
    }

    const create = await prisma.walletSplitConfig.create({
      data: {
        userId: userId,
        spendPercent: data.spendPercent,
        savingsPercent: data.savingsPercent,
        emergencyPercent: data.emergencyPercent,
        flexPercent: data.flexPercent,
      },
    });

    await cache.del(CACHE_KEYS.splitConfig(userId));
    return create;
  },

  async getWalletSplitConfig(userId: string) {
    const config = await prisma.walletSplitConfig.findUnique({
      where: { userId },
    });
    return config;
  },

  async updateWalletSplitConfig(userId: string, data: WalletSplitConfigInput) {
    const check = await prisma.walletSplitConfig.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!check) {
      throw new Error("Split config not found. Please set your config first");
    }

    const update = await prisma.walletSplitConfig.update({
      where: {
        userId: userId,
      },
      data: {
        spendPercent: data.spendPercent,
        savingsPercent: data.savingsPercent,
        emergencyPercent: data.emergencyPercent,
        flexPercent: data.flexPercent,
      },
    });

    await cache.del(CACHE_KEYS.splitConfig(userId));
    return update;
  },
};
