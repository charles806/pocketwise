import type { WalletSplitConfig } from "@prisma/client";
import { Prisma, WalletType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../lib/prisma.js";
import { cache, CACHE_KEYS, TTL } from "../lib/cache.js";

type WalletAllocation = {
    walletType: WalletType;
    amount: number;
};

export const DEFAULT_WALLET_SPLIT_CONFIG = {
    spendPercent: 50,
    savingsPercent: 30,
    emergencyPercent: 10,
    flexPercent: 10,
} as const;

type WalletSplitConfigInput = Pick<
    WalletSplitConfig,
    | "spendPercent"
    | "savingsPercent"
    | "emergencyPercent"
    | "flexPercent"
>;

type SplitConfigNumbers = {
    spendPercent: number;
    savingsPercent: number;
    emergencyPercent: number;
    flexPercent: number;
};

const toNumbers = (config: WalletSplitConfigInput): SplitConfigNumbers => ({
    spendPercent: config.spendPercent.toNumber(),
    savingsPercent: config.savingsPercent.toNumber(),
    emergencyPercent: config.emergencyPercent.toNumber(),
    flexPercent: config.flexPercent.toNumber(),
});

const toPrismaDecimals = (config: SplitConfigNumbers): WalletSplitConfigInput => ({
    spendPercent: new Prisma.Decimal(config.spendPercent),
    savingsPercent: new Prisma.Decimal(config.savingsPercent),
    emergencyPercent: new Prisma.Decimal(config.emergencyPercent),
    flexPercent: new Prisma.Decimal(config.flexPercent),
});

/**
 * Resolves the user's configured wallet split, falling back to the default
 * 50/30/10/10 when they have never set one. This is the SINGLE source of truth
 * for how real-money inflows are split (deposit webhook + deposit recovery
 * sweep), so a user's saved split governs every wallet credit they receive.
 */
export async function getUserSplitConfig(userId: string): Promise<WalletSplitConfigInput> {
    const cacheKey = CACHE_KEYS.splitConfig(userId);
    const cached = await cache.get<SplitConfigNumbers>(cacheKey);
    if (cached) return toPrismaDecimals(cached);

    const config = await prisma.walletSplitConfig.findUnique({
        where: { userId },
    });

    const resolved = config ?? {
        spendPercent: new Prisma.Decimal(DEFAULT_WALLET_SPLIT_CONFIG.spendPercent),
        savingsPercent: new Prisma.Decimal(DEFAULT_WALLET_SPLIT_CONFIG.savingsPercent),
        emergencyPercent: new Prisma.Decimal(DEFAULT_WALLET_SPLIT_CONFIG.emergencyPercent),
        flexPercent: new Prisma.Decimal(DEFAULT_WALLET_SPLIT_CONFIG.flexPercent),
    };

    await cache.set(cacheKey, toNumbers(resolved), TTL.SPLIT_CONFIG);
    return resolved;
}

export function calculateWalletSplits(
    amount: Prisma.Decimal,
    config: WalletSplitConfigInput
): WalletAllocation[] {
    if (amount.lte(0)) {
        throw Object.assign(
            new Error("Amount must be greater than zero"),
            { statusCode: 400 }
        );
    }

    // Convert Naira to Kobo for precision-safe calculations
    const totalKobo = amount
        .mul(100)
        .toDecimalPlaces(0)
        .toNumber();

    const entries = [
        {
            walletType: WalletType.spend,
            percentage: config.spendPercent.toNumber() / 100,
        },
        {
            walletType: WalletType.savings,
            percentage: config.savingsPercent.toNumber() / 100,
        },
        {
            walletType: WalletType.emergency,
            percentage: config.emergencyPercent.toNumber() / 100,
        },
        {
            walletType: WalletType.flex,
            percentage: config.flexPercent.toNumber() / 100,
        },
    ] as const;

    let remainingKobo = totalKobo;

    const allocations: {
        walletType: WalletType;
        kobo: number;
    }[] = [];

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!;

        const isLast = i === entries.length - 1;

        let walletKobo: number;

        if (isLast) {
            // Assign any remainder to the last wallet
            walletKobo = remainingKobo;
        } else {
            walletKobo = Math.floor(
                totalKobo * entry.percentage
            );

            remainingKobo -= walletKobo;
        }

        allocations.push({
            walletType: entry.walletType,
            kobo: walletKobo,
        });
    }

    return allocations.map(({ walletType, kobo }) => ({
        walletType,
        amount: kobo / 100,
    }));
}