export const MIN_GOAL_DEADLINE_DAYS = 7

export const MAX_GOAL_DEADLINE_DAYS = 365

export const MIN_GOAL_TARGET_AMOUNT: number = 1000;

export const validateDeadline = (deadline: Date) => {

    const now = new Date()

    const diff = deadline.getTime() - now.getTime()

    const daysFromNow = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (daysFromNow < 0) {
        return { valid: false, message: "Deadline cannot be in the past" }
    }

    if (daysFromNow < MIN_GOAL_DEADLINE_DAYS) {
        return { valid: false, message: "Deadline must be at least 7 days from today" }
    }

    if (daysFromNow > MAX_GOAL_DEADLINE_DAYS) {
        return { valid: false, message: "Deadline cannot be more than 365 days from today" }
    }

    return { valid: true, daysFromNow }

}

export const calculateDaysRemaining = (deadline: Date) => {
    const now = new Date()

    const diff_in_milliseconds = deadline.getTime() - now.getTime()

    const daysRemaining = Math.ceil(diff_in_milliseconds / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) {
        return 0
    } else {
        return daysRemaining
    }
}

export const calculateProgress = (currentBalance: number, targetAmount: number) => {
    if (targetAmount <= 0) {
        return 0
    }

    const caculate = (currentBalance / targetAmount) * 100

    const min = Math.min(caculate, 100)

    const result = parseFloat(min.toFixed(2))


    return result
}
