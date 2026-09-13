-- AlterTable
-- Precomputed "first 100" flag on waitlist signups. Default FALSE; a one-time
-- script (scripts/flag-waitlist-eligible.ts) flips exactly the 100 earliest
-- rows to TRUE once the business locks in the cohort. Frozen snapshot, not a
-- live count — see the script's comments for why.
ALTER TABLE "waitlist" ADD COLUMN "is_eligible_for_bonus" BOOLEAN NOT NULL DEFAULT FALSE;