# Architecture Risk Register

Medium-term risks flagged during architecture review (June 2026).

---

## 1. In-memory rate limiter

- **File:** `apps/api/src/middleware/rate-limit.middleware.ts`
- **Risk:** Uses a `Map<string, ...>` in process memory. Resets on every server restart and doesn't work across multiple instances.
- **Fix:** Swap to Redis-based rate limiting (Upstash Redis is already a dependency).
- **Window:** Year 2-3 (when scaling beyond 1 instance).

---

## 2. No refresh token rotation

- **File:** `apps/api/src/services/auth.service.ts:182-208`
- **Risk:** The refresh token is valid for 7 days and never rotated. A leaked token works for the full week.
- **Fix:** Issue a new refresh token on each `/refresh` call and invalidate the old one. Consider refresh token versioning in the database.
- **Window:** Year 1-2.

---

## 3. Next.js middleware session cookie workaround

- **File:** `apps/web/middleware.ts`
- **Risk:** Middleware checks a lightweight `auth_session` cookie instead of the actual JWT, because the httpOnly refresh cookie is on the API domain. If the frontend and API share a domain in production this is fine; otherwise SSR route protection is unreliable.
- **Fix:** Proxy auth through Next.js API routes or colocate the API and frontend on the same domain.
- **Window:** Year 1-2 (if SSR features are added).

---

## 4. Mobile doesn't auto-refresh on 401 mid-session

- **File:** `apps/mobile/src/context/AuthContext.tsx`
- **Risk:** Access token expires (45m) during active mobile use. No interceptor retries with the refresh token — API calls silently fail.
- **Fix:** Add an Axios/fetch interceptor that catches 401, calls `/refresh`, retries the original request, and only logs out if refresh fails.
- **Window:** Year 1 (immediate UX gap).

---

## 5. No structured logging

- **File:** `apps/api/src/middleware/error.middleware.ts:19`
- **Risk:** `console.error(err)` provides no request context (request ID, userId, path, latency). Debugging production issues requires log scraping and guesswork.
- **Fix:** Add `pino` or `winston` with request-ID middleware. Structured JSON logs with correlation IDs.
- **Window:** Year 1-2 (first production incident will be painful).

---

## 6. Flat service layer won't scale past ~30 services

- **File:** `apps/api/src/services/`
- **Risk:** All business logic lives in a single `services/` directory. Currently ~13 files, manageable. At 30+ files, cross-service dependencies become tangled.
- **Fix:** Extract domains into feature modules (like `features/notifications/`) with self-contained routes, controllers, and services.
- **Window:** Year 2-3.

---

## 7. No zero-downtime migration strategy

- **File:** `apps/api/prisma/schema.prisma`
- **Risk:** Prisma migrations lock tables. No strategy for safe schema changes on a live production database with active users.
- **Fix:** Adopt the expand-migrate-contract pattern. Use careful deploy ordering. Plan for read-replica fallbacks if needed.
- **Window:** Year 2+ (when you have production users who can't tolerate downtime).
