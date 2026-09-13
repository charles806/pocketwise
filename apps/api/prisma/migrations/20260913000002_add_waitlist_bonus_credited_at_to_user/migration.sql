-- AlterTable
-- One-time-per-user waitlist bonus guard. NULL = not yet claimed. Set
-- atomically (`UPDATE ... WHERE waitlist_bonus_credited_at IS NULL`) on the
-- user's first successful inbound deposit so concurrent/retried webhook
-- deliveries can never double-pay.
ALTER TABLE "users" ADD COLUMN "waitlist_bonus_credited_at" TIMESTAMPTZ;