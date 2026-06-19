import prisma from "../lib/prisma.js";

export const EmergencyUnlockService = {
    async requestUnlock(userId: string, reason: string) {
        const find = await prisma.wallet.findFirst({
            where: {
                userId: userId,
                type: "emergency"
            }
        })

        if (!find) {
            throw Object.assign(new Error("Emergency wallet not found"), { statusCode: 404 });
        }

        const result = await prisma.emergencyUnlockRequest.findFirst({
            where: {
                walletId: find.id,
                status: "pending"
            }
        })

        if (result) {
            throw Object.assign(new Error("Unlock already requested"), { statusCode: 409 });
        }

        const unlocksAt = new Date();

        const create = await prisma.emergencyUnlockRequest.create({
            data: {
                userId: userId,
                walletId: find.id,
                reason: reason,
                unlocksAt: unlocksAt,
                status: "pending"
            }
        })

        return create
    },

    async checkUnlockStatus(userId: string) {
        const wallet = await prisma.wallet.findFirst({
            where: {
                userId: userId,
                type: "emergency"
            }
        })

        if (!wallet) {
            throw Object.assign(new Error("Emergency wallet not found"), { statusCode: 404 });
        }

        const check = await prisma.emergencyUnlockRequest.findFirst({
            where: {
                walletId: wallet.id,
                status: "pending",
            },
            orderBy: {
                requestedAt: "desc"
            }
        })

        if (!check) {
            return { isUnlocked: false, reason: "no_request" };
        }

        if (check.unlocksAt > new Date()) {
            return { isUnlocked: false, reason: "cooling_down", unlocksAt: check.unlocksAt };
        }

        return { isUnlocked: true, requestId: check.id };
    },

    async markRequestCompleted(requestId: string) {
        const update = await prisma.emergencyUnlockRequest.update({
            where: {
                id: requestId
            },
            data: {
                status: "completed"
            }
        })

        return update
    }


}