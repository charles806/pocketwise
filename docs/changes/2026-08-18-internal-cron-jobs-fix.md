# Internal Cron Jobs Fix: complete-goals 401 & weekly-summary timeout

**Date:** 2026-08-18
**Type:** Bug Fix + Performance
**Scope:** API

---

## Summary

Two cron-job.org jobs were failing in production:

1. **`POST /api/internal/complete-goals`** — failed with an **HTTP error (401)**.
2. **`GET /api/internal/weekly-summary`** — failed with **timeout**.

The `complete-goals` failure is fixed by reconfiguring the cron job (no code change);
the `weekly-summary` timeout is fixed by parallelizing the per-user processing loop in code.

## Root Cause

### complete-goals — `?secret=` is no longer accepted

The internal cron endpoints authenticate via the `x-keep-alive-secret` **header**
(`apps/api/src/middleware/keep-alive-auth.middleware.ts`). The `req.query.secret`
fallback was removed in commit `42c369e` ("Dangerous", 2026-07-04) as part of the
July security hardening (secret leaks into logs when passed as a URL query parameter).

The "Complete Goal" cron still sent the secret as `?secret=<KEEP_ALIVE_SECRET>` in the
URL. The middleware now only reads the header, so the request returned
`401 Unauthorized: Missing keep-alive secret`.

Verified live:

```
POST /api/internal/complete-goals?secret=<secret>      → HTTP 401
POST /api/internal/complete-goals (x-keep-alive-secret header) → HTTP 200 (~6.7s)
```

### weekly-summary — serial processing exceeds the timeout ceiling

The handler looped over **every user serially**. Per user it ran ~5 database queries
(4 transaction aggregates + savings-goal progress), an FCM push, and
`notifyWeeklySummary` (in-app notification insert + email + cache clear). All
sequential → a live call took **59.4s**, right at the Vercel/cron-job.org timeout
limit, so cron-job.org reported "Failed (timeout)".

## Fix

### complete-goals — cron-job.org configuration (no code change)

The secret already matched `KEEP_ALIVE_SECRET`; it was only sent in the wrong place.
In cron-job.org **"Complete Goal"** job:

- Remove `?secret=dce42dd3e30c081b820e2c36737b3c42423240589b39f4dcf2062bf50a69a543` from the URL.
- Add header `x-keep-alive-secret: dce42dd3e30c081b820e2c36737b3c42423240589b39f4dcf2062bf50a69a543`.
- Keep method `POST`.

### weekly-summary — bounded concurrency

**Modified: `apps/api/src/server.ts`** — `/api/internal/weekly-summary` handler now
processes users in batches of `10`, awaiting each batch with `Promise.all` and
summing the notified count across results. Wall time drops from ~60s to a few
seconds. Per-user behavior is unchanged (weekly summary, skip when spent+saved = 0,
FCM push, in-app notification/email).

## Database Changes

None.

## API Changes

None — endpoint, request shape, and response shape are unchanged.

## Breaking Changes

None.

## Files/Modules Affected

| File                          | Change                                                                 |
| ----------------------------- | ---------------------------------------------------------------------- |
| `apps/api/src/server.ts`      | Parallelized weekly-summary user loop (concurrency 10)                 |
| `apps/api/README.md`          | Documented header-only auth + `x-keep-alive-secret` cron setup example |

## Manual Validation

- `npm run build` (prisma generate + `tsc`) passes in `apps/api`.
- Live check before the fix confirmed the diagnosis:
  - `?secret=` query → `401`; header → `200` for `complete-goals`.
  - `weekly-summary` with a valid header returned `200` but took `59.4s`.
- Post-fix, the deployed weekly-summary should finish in a few seconds; the
  cron-job.org jobs should mark as "Success" on their next run.

## Known Limitations

- The fix ships with a deploy: Vercel must be redeployed from `main` for the
  parallelized `weekly-summary` to take effect.
- Heroku/other schedulers using `?secret=` for any internal endpoint must switch
  to the `x-keep-alive-secret` header; the header-only requirement is intentional
  (see security audits `docs/security-audit-2026-07-03.md`, `-07-04.md`).

## Follow-up Tasks

- Confirm both cron-job.org jobs report "Success" on the next schedule after deploy.
- A live timing smoke-test of `weekly-summary` on the deployed endpoint (optional;
  beware it dispatches real user notifications on each run).