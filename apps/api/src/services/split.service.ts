import type { Decimal } from "@prisma/client/runtime/library";
import { WalletType } from "@prisma/client";

type WalletSplitConfig = Readonly<Record<WalletType, number>>;

type WalletAllocation = {
    walletType: WalletType;
    amount: number; // in Naira
};
const WALLET_SPLIT_CONFIG: Record<WalletType, number> = {
    spend: 0.5,
    savings: 0.3,
    emergency: 0.1,
    flex: 0.1,
};

// Validate percentages sum to 1
const validateSum = (config: WalletSplitConfig): void => {
    const sum = Object.values(config).reduce((acc, pct) => acc + pct, 0);

    if (Math.abs(sum - 1) > 1e-9) {
        throw new Error(`Percentages must sum to 1 (got ${sum})`);
    }
};

validateSum(WALLET_SPLIT_CONFIG);

export function calculateWalletSplits(amount: Decimal): WalletAllocation[] {
    if (!amount || amount.isNaN()) {
        throw Object.assign(new Error("Invalid amount"), { statusCode: 400 });
    }

    const amountNumber = amount.toNumber();

    if (amountNumber <= 0) {
        throw Object.assign(new Error("Amount must be greater than zero"), {
            statusCode: 400,
        });
    }

    // Convert to kobo for precision safety
    const totalKobo = Math.round(amountNumber * 100);

    const entries = Object.entries(WALLET_SPLIT_CONFIG) as [
        WalletType,
        number
    ][];

    let remainingKobo = totalKobo;

    const allocations: { walletType: WalletType; kobo: number }[] = [];

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry) continue;

        const [walletType, percentage] = entry;
        const isLast = i === entries.length - 1;

        let walletKobo: number;

        if (isLast) {
            walletKobo = remainingKobo;
        } else {
            walletKobo = Math.floor(totalKobo * percentage);
            remainingKobo -= walletKobo;
        }

        allocations.push({
            walletType,
            kobo: walletKobo,
        });
    }

    return allocations.map(({ walletType, kobo }) => ({
        walletType,
        amount: kobo / 100,
    }));
}