import prisma from "../lib/prisma.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";

interface UpsertRecipientInterface {
  userId: string;
  recipientUserId: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientUserName: string;
}

export const p2pRecipientService = {
  async upsertRecipient(data: UpsertRecipientInterface) {
    const {
      userId,
      recipientUserId,
      recipientFirstName,
      recipientLastName,
      recipientUserName,
    } = data;

    const check = await prisma.p2PRecipient.findUnique({
      where: {
        userId_recipientUserId: {
          userId,
          recipientUserId,
        },
      },
    });

    if (check) {
      await prisma.p2PRecipient.update({
        where: {
          userId_recipientUserId: {
            userId,
            recipientUserId,
          },
        },
        data: {
          lastSentAt: new Date(),
        },
      });
    } else {
      await prisma.p2PRecipient.create({
        data: {
          userId,
          recipientUserId,
          recipientFirstName,
          recipientLastName,
          recipientUserName,
          lastSentAt: new Date(),
        },
      });
    }

    cache.del(CACHE_KEYS.p2pRecipients(userId));
  },

  async getRecentRecipients(userId: string) {
    const cacheKey = CACHE_KEYS.p2pRecipients(userId);
    const cached = await cache.get<object>(cacheKey);
    if (cached) return cached;

    const recipients = await prisma.p2PRecipient.findMany({
      where: {
        userId,
      },
      select: {
        recipientUserId: true,
        recipientFirstName: true,
        recipientLastName: true,
        recipientUserName: true,
        lastSentAt: true,
      },
      orderBy: {
        lastSentAt: "desc",
      },
      take: 10,
    });

    await cache.set(cacheKey, recipients, TTL.P2P_RECIPIENTS);

    return recipients;
  },
};
