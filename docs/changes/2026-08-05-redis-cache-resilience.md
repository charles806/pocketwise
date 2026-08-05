# Redis Cache Resilience & Connection Fix

**Date:** 2026-08-05
**Type:** Infrastructure Fix + Resilience
**Scope:** API

---

## Summary

Fixes the broken Upstash Redis connection (the old instance `blessed-blowfish-147991` no longer resolved via DNS) and makes the cache layer degrade gracefully when Redis is unavailable, so the API stays fully functional — without caching — instead of spamming error logs.

## Why

1. The Upstash Redis instance configured in `apps/api/.env` had been deleted/expired. DNS resolution failed (`getaddrinfo ENOTFOUND blessed-blowfish-147991.upstash.io`), so every cache operation threw.
2. `cache.ts` already caught those errors and returned null (the app worked), but every get/set/del call logged a full stack trace. Requests for wallets, savings goals, and notifications produced multiple stack traces each, flooding the console on every request.
3. There was no signal at startup when Redis was unavailable, and no way to suppress repeated cache logging once it failed.

## Technical Implementation

**Modified: `apps/api/src/lib/redis.ts`**

- Added module-level `redisAvailable` flag (defaults to `true`) and an `isRedisAvailable()` getter.
- Added `checkRedisConnection()` — pings Redis, sets the availability flag, and logs a single warning (with the error detail only outside production) when unreachable. Logs `[Redis] Connection established` on success.

**Modified: `apps/api/src/lib/cache.ts`**

- `get` returns `null` immediately when Redis is unavailable (no error log).
- `set`, `del`, and `delMany` return early when Redis is unavailable (no error log).
- Existing per-key error logging is retained for genuine transient failures while Redis is up.

**Modified: `apps/api/src/server.ts`**

- Imports `checkRedisConnection` and calls it inside the `app.listen` callback. The server starts regardless of Redis status; the single startup log indicates cache health.

**Modified: `apps/api/.env`** (not tracked in git)

- Updated `UPSTASH_REDIS_REST_URL` to the new instance `https://evident-fawn-125264.upstash.io` and the matching `UPSTASH_REDIS_REST_TOKEN`. Do not commit secrets; regenerate the credentials if this file is ever exposed.

## Database Changes

None.

## API Changes

None — behavior is unchanged. When Redis is down the cache layer silently no-ops and all reads fall through to the database.

## Breaking Changes

None.

## Files/Modules Affected

| File                        | Change                                                     |
| --------------------------- | ---------------------------------------------------------- |
| `apps/api/.env`             | Replaced stale Upstash Redis credentials (not tracked)     |
| `apps/api/src/lib/redis.ts` | Availability flag + `checkRedisConnection()` startup check |
| `apps/api/src/lib/cache.ts` | Skip get/set/del/delMany when Redis is unavailable         |
| `apps/api/src/server.ts`    | Startup Redis connectivity check                           |

## Manual Validation

- `npm run dev` starts cleanly: `Server is running on port http://localhost:1000` followed by `[Redis] Connection established`, no cache error spam.
- `tsc --noEmit` passes.
- Direct `redis` consumers outside the cache layer (auth controller/service, rate-limit middleware) work normally with the new instance.

## Known Limitations

- If Redis goes down after startup, the availability flag is not re-checked, so cache calls resume failing individually until the next restart. A periodic health probe would be needed for full self-healing.
- Other direct `redis` usages (`auth.controller.ts`, `auth.service.ts`, `rate-limit.middleware.ts`) do not share the graceful degradation — a mid-session Redis outage still surfaces errors there.
- This change is not a substitute for architecture risk #1 (in-memory rate limiter vs. Redis-based limiting).

## Follow-up Tasks

- Optionally add a periodic Redis health probe (e.g., every 30s) that toggles `redisAvailable` so cache resumes without a restart.
- Consider wrapping the remaining direct `redis` consumers in the availability flag for full resilience.
