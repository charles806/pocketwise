export function feeCalculator(amount: number) {
    if (amount <= 10000) {
        return 0
    }

    if (amount <= 50000) {
        return Math.round(amount * 0.01)
    }

    if (amount <= 200000) {
        return Math.round(amount * 0.0075)
    }

    return Math.round(amount * 0.005)
}

