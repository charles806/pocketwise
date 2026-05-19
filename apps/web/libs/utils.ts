export function formatNaira() {
    const localCurrenct = "en-NG";
    return new Intl.NumberFormat(localCurrenct, {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function SplitCacultor(amount: number) {
    const spend = amount * 0.5
    const save = amount * 0.3
    const emergency = amount * 0.1
    const flex = amount * 0.1
    return {
        spend, save, emergency, flex
    }

}

export function Greeting() {
    const hrs = new Date().getHours();

    if (hrs < 12) {
        return "Good Morning"
    }
    if (hrs >= 12 && hrs < 17) {
        return "Good Afternoon"
    }
    if (hrs >= 17) {
        return "Good Evening"
    }
}

export function fullName(fullName: string) {
    if (!fullName) return "User"

    return fullName.trim().split("")[0]
}
