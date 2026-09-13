-- AlterTable
-- New transaction type for the one-time waitlist signup bonus. Distinct from
-- `deposit`/`transfer` so it can be settled in full to the Spend wallet
-- without ever touching the 50/30/10/10 split logic.
ALTER TYPE "TransactionType" ADD VALUE 'promo_credit';