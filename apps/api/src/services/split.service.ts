import type { WalletSplitConfig } from "@prisma/client";
import { Prisma, WalletType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

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