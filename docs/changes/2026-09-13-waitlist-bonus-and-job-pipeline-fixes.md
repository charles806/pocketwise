# Waitlist ₦1,000 Bonus (Anchor Rewards) + Transfer Reconciliation Jobs + Infra Fixes

**Date:** 2026-09-13
**Type:** Feature + Bug Fix + Infrastructure
**Scope:** API + Ops (QStash schedules, Neon DB connection)

---

## Summary

This release bundles four things into one deploy:

1. **Waitlist signup bonus (₦1,000) via Anchor Rewards** — the first `BONUS_LIMIT` (100) waitlist signups get ₦1,000 credited in full to their Spend wallet once they complete their first successful inbound deposit.
2. **Outbound transfer reconciliation** — a scheduled job plus a shared settlement core so NIP *and* book transfers settle once, exactly, from both webhooks and the scheduled sweep.
3. **Infra fixes** — the Neon interactive-transaction failure (`P2028`) that broke every multi-statement DB flow, and the two internal tool crashes.
4. **KYC gate on transfers** — wallet and internal transfers now require identity verification.

## Root Cause

### Waitlist bonus design constraints

- Anchor exposes **no reward webhook events**, so completion must be observed by **polling** `GET /api/v1/rewards/{id}` (~every 5 minutes via QStash).
- The bonus must be **one-time per user** and tied to a specific snapshot of the waitlist ("first 100 by signup order"), which cannot be safely derived with a live count once the waitlist is public.
- The deposit flow already splits money 50/30/10/10 across wallets, so the bonus needs to **bypass the split** and land 100% in Spend.

### Neon pooled connection (`P2028`)

`apps/api/.env` had both `DATABASE_URL` and `DIRECT_URL` pointed at Neon's **pooled** endpoint (`…-pooler…`). Prisma **interactive transactions** (`prisma.$transaction(async (tx) => …)`) cannot hold a session across statements over that connection, failing with `PrismaClientKnownRequestError P2028: Transaction not found…`. This blocked:
- `scripts/flag-waitlist-eligible.ts` (flags the first-100 cohort),
- and would equally break the bonus claim, the settlement core, and every `FOR UPDATE` lock in the app (wallet transfers, reconciliation sweeps).

Note: this app uses Prisma **driver adapters** (`@prisma/adapter-pg` over a `pg.Pool`), which ignore the schema-level `directUrl` at runtime — so the pool itself must use the direct connection.

### Production schedule failure (red QStash dashboard)

The QStash schedule `transfer-reconciliation-dispatch` (created unlabeled, every 5 min) was calling `https://api.pocketwise.xyz/api/internal/jobs/transfer-reconciliation/dispatch`, which returned **404 `Cannot GET`**. The route only exists in **uncommitted** code, so the live deployment never had it. QStash retried ×3, then failed — visible as a permanently red dashboard. (Verified by direct `curl`: `/weekly-summary/dispatch` → 401 route-exists, `/transfer-reconciliation/dispatch` → 404.)

### Internal tool crashes

- `scripts/create-qstash-schedules.ts` crashed on `schedule.label.includes(…)` because `schedules.list()` returns entries with `label: undefined`.
- `scripts/flag-waitlist-eligible.ts` crashed with `P2028` (interactive transaction — see above).

## Fix

### 1. Waitlist bonus

- **Schema** (`prisma/schema.prisma` + migrations `20260913000001/2/3`):
  - `Waitlist.isEligibleForBonus` — precomputed flag frozen by the one-time flag script (exact "first 100" snapshot, no live counting).
  - `User.waitlistBonusCreditedAt` — one-time claim sentinel.
  - `TransactionType.promo_credit` — new transaction type.
- **Anchor integration** (`src/lib/baas.ts`): `createReward(sourceAccountId, reference, amountInKobo, title)` → `POST /api/v1/rewards` and `getReward(rewardId)` → `GET /api/v1/rewards/{id}`.
- **Claim + reward creation** (`src/services/webhook.service.ts`, in `nip.inbound.completed`):
  - Gate = first successful inbound deposit **and** an eligible, case-insensitively-matched waitlist row **and** `waitlistBonusCreditedAt IS NULL`.
  - Atomic claim via `updateMany(… where waitlistBonusCreditedAt IS NULL)`, proceeding only if exactly 1 row was updated (double-spend safe).
  - After the deposit splits, `createReward` runs **after commit** and writes a pending `promo_credit` transaction with `baasRef = reward id`. Reward creation failure → claim released (`waitlistBonusCreditedAt` cleared) so a later retry can re-award.
- **Polling / settlement** (`src/features/queue/jobs/reward-reconciliation.ts`, dispatch POST `/api/internal/jobs/reward-reconciliation/dispatch` every 5 min → run post `/…/run`):
  - `PENDING` → ignore. `COMPLETED` → `FOR UPDATE` re-check that the pending row still exists → credit **Spend only** (split bypass) → bust wallet cache → `notifyWaitlistBonus` (template `templates/waitlist-bonus.hbs`). `FAILED` → mark the pending row failed + Sentry (nothing to reverse).

### 2. Transfer reconciliation

- **`src/services/transfer-settlement.service.ts`** (new): `settleOutboundTransfer` (once-only, `FOR UPDATE` + pending re-check) and `sweepStalePendingTransfers` (claims + settles stale pending debits).
- **`src/features/queue/jobs/transfer-reconciliation.ts`** (new): 5-minute dispatch → run sweep. Deduplicated to a 5-minute bucket so overlapping dispatches are harmless.
- **`src/controller/webhook.controller.ts`**: outbound-credit/refund logic now delegates to the shared settlement core (handles NIP **and** Book transfers); notifications use the bank-reported amount.

### 3. Infra fixes

- **Neon direct connection**:
  - `apps/api/.env`: `DIRECT_URL` now points at the **direct** (non-`-pooler`) Neon endpoint.
  - `src/lib/prisma.ts`: pool connects via `process.env.DIRECT_URL ?? process.env.DATABASE_URL`.
  - `prisma/schema.prisma`: `directUrl = env("DIRECT_URL")` so `prisma migrate`/`db pull` also bypass the pooler.
- **`scripts/flag-waitlist-eligible.ts`**: replaced the interactive-transaction loop with a single `updateMany({ where: { id: { in: … } } })` — one atomic statement survives the pooled connection and is still idempotent (top-up by remaining slots).
- **`scripts/create-qstash-schedules.ts`**:
  - Null-safe dedup: `(schedule.label ?? "").includes(…)`.
  - Re-asserts each spec against existing schedules via `schedules.create(…, scheduleId)` (the SDK’s update mechanism) because `schedules.list()` never returns headers — this repairs the unlabeled, keep-alive-header-less `transfer-reconciliation-dispatch` schedule and creates `reward-reconciliation-dispatch`.

### 4. KYC gate

- **`src/middleware/require-verified.middleware.ts`** + **`src/utils/verification.ts`**: block transfers unless `kycTier >= 1` and `baasAccountId` is set. Wired into `POST /wallets/transfer` and `POST /wallets/internal-transfer`.

## Breaking Changes

- **API behavior:** wallet and internal transfers now fail with `400` unless the user has completed KYC tier 1 and has a BaaS account. Intended, but a client-visible behavior change.
- No endpoint contracts changed otherwise; Deposit/Bonus do not alter the public webhook shape.

## Files/Modules Affected

| File | Change |
| --- | --- |
| `apps/api/prisma/schema.prisma` | `Waitlist.isEligibleForBonus`, `User.waitlistBonusCreditedAt`, `TransactionType.promo_credit`; `directUrl = env("DIRECT_URL")` |
| `apps/api/prisma/migrations/20260913000001..03/` | New migrations (3) |
| `apps/api/src/lib/baas.ts` | `createReward`, `getReward` (`/api/v1/rewards`) |
| `apps/api/src/services/webhook.service.ts` | Deposit split + waitlist-bonus gate, atomic claim, post-commit `createReward`, pending `promo_credit` row |
| `apps/api/src/services/transfer-settlement.service.ts` | New: once-only outbound settlement core (`settleOutboundTransfer`, `sweepStalePendingTransfers`) |
| `apps/api/src/features/queue/jobs/transfer-reconciliation.ts` | New: 5-min dispatch + sweep run |
| `apps/api/src/features/queue/jobs/reward-reconciliation.ts` | New: 5-min reward polling + settlement sweep |
| `apps/api/src/routes/jobs.routes.ts` | Register transfer + reward reconciliation dispatch/run under `/api/internal/jobs` |
| `apps/api/src/controller/webhook.controller.ts` | Outbound webhook delegates to settlement core; NIP + Book handling |
| `apps/api/src/features/notifications/notification.service.ts` + `templates/waitlist-bonus.hbs` | `notifyWaitlistBonus` |
| `apps/api/src/middleware/require-verified.middleware.ts` + `src/utils/verification.ts` | New: KYC gate |
| `apps/api/src/routes/wallet.routes.ts`, `apps/api/src/routes/internal-transfer.routes.ts` | Wire `requireVerified` |
| `apps/api/src/lib/prisma.ts` | Pool uses `DIRECT_URL` |
| `apps/api/package.json` | Added `test:sweep` script |
| `apps/api/scripts/flag-waitlist-eligible.ts` | Single `updateMany` (no interactive tx) — git-ignored |
| `apps/api/scripts/create-qstash-schedules.ts` | Null-safe dedup + re-assert/repair schedules — git-ignored |
| `apps/api/.env` | `DIRECT_URL` → direct (non-pooler) Neon URL — git-ignored |

## Configuration

- **`apps/api/.env`** (not committed):
  - `DIRECT_URL` – must be the **direct** Neon endpoint (host without `-pooler`).
  - `ANCHOR_REWARDS_SOURCE_ACCOUNT_ID` – Anchor org **MASTER** deposit account id, used as the reward source; must be funded ≥ ₦1,000.
  - `ANCHOR_BASE_URL` – sandbox for testing (`https://api.sandbox.getanchor.co`).
- **Deployment env** (`api.pocketwise.xyz`, Vercel):
  - `APP_BASE_URL` must be `https://api.pocketwise.xyz` so dispatched `run` messages and failure callbacks point at prod, not `localhost`.
  - `KEEP_ALIVE_SECRET` must match the value used by `scripts/create-qstash-schedules.ts` (it sets the `x-keep-alive-secret` header on every schedule).
- **QStash schedules** (created via the script): `reward-reconciliation-dispatch` `*/5 * * * *`; transfer-reconciliation schedule repaired with label + keep-alive header.

## Manual Validation

- `npm run check-types` passes in `apps/api`.
- `npm run build` passes in `apps/api` (`prisma generate && tsc`).
- Monorepo `npm run check-types` passes (4/4) and `npm run build` passes (2/2, api + web) with the CI env.
- Live route probes: `/api/internal/jobs/transfer-reconciliation/dispatch` returns 401 (was 404) after deploy; with `x-keep-alive-secret` returns 200.
- Pending (sandbox E2E, after confirmations): `prisma migrate deploy`, run `flag-waitlist-eligible.ts`, `create-qstash-schedules.ts`, `test-reward-flow.ts` + Anchor "Simulate Transfer ₦5,000".

## Known Limitations

- Bonus confirmation is **polling-based** (~5 min worst case) because Anchor has no reward webhook.
- `scripts/` directory is **git-ignored** — the operator scripts and `.env` do not ship with the commit; they must be run from the workspace locally.
- The first-100 cohort is a **frozen flag**; it does not auto-update if new signups arrive after the flag run.
- `FAILED` rewards surface via Sentry; there is no automatic retry of a permanently failed reward.

## Follow-up Tasks

- Apply migrations to prod: `prisma migrate deploy` (required before deploy for the new columns).
- Confirm prod `KEEP_ALIVE_SECRET` matches `apps/api/.env`.
- Confirm `ANCHOR_REWARDS_SOURCE_ACCOUNT_ID` is a real, funded MASTER account in Anchor sandbox.
- Run `BONUS_LIMIT=100 npx tsx scripts/flag-waitlist-eligible.ts` to freeze the cohort.
- Run sandbox end-to-end `test-reward-flow.ts`; verify one bonus per user and no award for non-eligible first deposits.