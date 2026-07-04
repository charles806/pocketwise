# PocketWise Security Audit Report

**Date:** 2026-07-04  
**Scope:** Full-stack audit (apps/api, apps/web, apps/mobile)  
**Methodology:** Manual code review, static analysis  
**Status:** READ-ONLY audit — no files modified  

---

## CRITICAL (fix before launch — real money risk)

### C-1: Webhook HMAC signature verification is broken (double encoding)

- **Location:** `apps/api/src/controller/webhook.controller.ts:11-13`
- **What an attacker could do:** The HMAC is computed as hex (`digest("hex")`), then the hex string is converted to base64, then compared against the `x-anchor-signature` header. Any Anchor webhook signature (which is likely raw hex or raw base64) will fail this comparison. Every legitimate deposit webhook is silently discarded with HTTP 200. Users never get credited, and the system is blind to incoming deposits.
- **Recommended fix:** Remove the double encoding. Compute the HMAC and compare directly:
  ```ts
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  ```
  Verify the exact format Anchor sends (hex vs base64) against their docs.

### C-2: Bank transfer — balance check outside transaction (race condition / double-spend)

- **Location:** `apps/api/src/services/wallet.service.ts:493-520`
- **What an attacker could do:** The balance check at line 505 (`spendWallet.balance.toNumber() < totalDeduction`) runs BEFORE the `$transaction` and `FOR UPDATE` lock at line 512. Two concurrent bank transfers from the same wallet can both pass the balance check, then both acquire the lock sequentially and both decrement, creating an overdraft. There is no `CHECK (balance >= 0)` constraint on the PostgreSQL column.
- **Recommended fix:** Move the balance check INSIDE the `$transaction` block, after the `FOR UPDATE` lock (as done correctly in P2P transfer at line 183 and internal transfer at line 383).

### C-3: `contributeToGoal` — no transaction / row locking (race condition)

- **Location:** `apps/api/src/services/saving-goal.service.ts:221-284`
- **What an attacker could do:** The unallocated savings check at line 243 and the `currentAmount: { increment: amount }` at line 260 are two separate database operations with no transaction or row lock. Two concurrent contributions can both pass the unallocated check, then both increment, causing the goal to exceed available unallocated savings.
- **Recommended fix:** Wrap the check-and-update in `prisma.$transaction` with `FOR UPDATE` on the user's savings wallet, or use an atomic conditional update.

---

## HIGH (fix before launch — trust/data risk)

### H-1: Webhook always returns HTTP 200 on signature failure — combined with C-1, no webhooks ever processed

- **Location:** `apps/api/src/controller/webhook.controller.ts:29`
- **What an attacker could do:** Anchor never retries a webhook that returns 200. Combined with the broken HMAC verification (C-1), every legitimate deposit notification is silently dropped. Users are never credited for deposits. The business is unaware of incoming funds.
- **Recommended fix:** Return 401 on signature failure so Anchor retries. Fix the HMAC verification (C-1) as the root cause.

### H-2: Webhook always returns HTTP 200 on internal processing errors

- **Location:** `apps/api/src/controller/webhook.controller.ts:42-44`
- **What an attacker could do:** Any database failure, crash, or exception during webhook processing is silently swallowed and reported as success. The system has no visibility into failed deposit processing. Monitoring/alerting cannot detect issues.
- **Recommended fix:** Log the error, return 500 to trigger Anchor retry, or implement a dead-letter queue.

### H-3: Login rate limiting is IP-only — no per-account throttling

- **Location:** `apps/api/src/routes/auth.routes.ts:44`
- **What an attacker could do:** 5 req/min per IP with no per-email/account tracking. A distributed brute-force attack (botnet / rotating proxies) can try unlimited passwords against any account. No account lockout after N failures.
- **Recommended fix:** Key rate limiting by both IP AND email/username (use `keyBy: "ip-and-user"`). Implement progressive delays or temporary account lockout after N (e.g., 10) consecutive failed attempts.

### H-4: Prisma queries fetch full User objects (passwordHash + transferPin in memory)

- **Locations:**
  - `apps/api/src/services/auth.service.ts:43` — fetched just to check email existence during signup
  - `apps/api/src/services/auth.service.ts:192` — fetched during token refresh
  - `apps/api/src/services/auth.service.ts:330` — fetched for setupPin user check
  - `apps/api/src/services/auth.service.ts:354` — fetched for changePin user check
  - `apps/api/src/services/auth.service.ts:465` — fetched for profile update
- **What an attacker could do:** These queries bring `passwordHash` and `transferPin` into Node.js heap memory unnecessarily. If a memory dump or heap inspection is ever possible (via deserialization vulnerability, debug endpoint, or compromised dependency), these secrets would be exposed.
- **Recommended fix:** Always specify a `select` clause that includes only the fields needed. For email existence checks, use `select: { id: true }`. For PIN verification, use `select: { transferPin: true }`.

### H-5: Keep-alive/cron secret accepted via query parameter

- **Location:** `apps/api/src/middleware/keep-alive-auth.middleware.ts:17-19`
- **What an attacker could do:** The `KEEP_ALIVE_SECRET` can be passed as a URL query parameter (`?secret=...`). This leaks the secret into: server access logs, reverse proxy logs, Vercel function logs, browser referrer headers, and bookmarks. An attacker with log access can then call any internal cron endpoint (`/api/internal/auto-contribute`, `/api/internal/weekly-summary`, `/api/internal/complete-goals`).
- **Recommended fix:** Only accept the secret via the `x-keep-alive-secret` header. Remove the `req.query.secret` fallback.

---

## MEDIUM (fix soon after launch)

### M-1: Webhook HMAC uses SHA1 (deprecated)

- **Location:** `apps/api/src/controller/webhook.controller.ts:12`
- **Risk:** SHA1 is cryptographically weakened and deprecated by all major standards bodies. If Anchor supports SHA256, SHA1 should not be used.
- **Recommended fix:** Use `crypto.createHmac("sha256", ...)` if Anchor supports it.

### M-2: Webhook idempotency check has TOCTOU race condition

- **Location:** `apps/api/src/services/webhook.service.ts:43-51` (check) vs `:72` (transaction)
- **Risk:** Two identical webhooks could race past the idempotency check before either enters the transaction. Mitigated by database `@unique` constraint on `anchorRef`, but the second write fails silently (catch block returns 200).
- **Recommended fix:** Move the idempotency check inside the `$transaction`, and use the Prisma unique constraint as the primary guard with a try-catch inside the transaction.

### M-3: Rate limit global middleware uses only in-memory fallback

- **Location:** `apps/api/src/middleware/rate-limit.middleware.ts:122-145`
- **Risk:** The `rateLimitMiddleware` (used on internal cron endpoints) uses only an in-process `Map`, not Redis. In multi-instance deployments (Vercel, multiple replicas), each instance has its own counter, making the limit N-times less effective.
- **Recommended fix:** Have the global middleware use the same Redis-backed rate limiter as the per-route middleware.

### M-4: FCM tokens returned in internal weekly-summary response

- **Location:** `apps/api/src/server.ts:189`
- **Risk:** `fcmToken` is a device-specific push notification token. While the endpoint is "internal" (protected by `KEEP_ALIVE_SECRET`), the response body could be logged by cron-job services, stored in Vercel logs, or intercepted if the secret is compromised (H-5).
- **Recommended fix:** Remove `fcmToken` from the select query; it is only needed for the FCM send call which is done server-side.

### M-5: Mobile app web fallback uses localStorage for token storage

- **Location:** `apps/mobile/src/utils/secureStorage.ts:11-18`
- **Risk:** When the Expo app runs in a web browser (or on web platform), tokens are stored in `localStorage` which is accessible to any JavaScript on the same origin. An XSS vulnerability would expose the token.
- **Recommended fix:** Use httpOnly cookies via the API for token refresh on web platform, or use in-memory storage with refresh-token-based recovery.

### M-6: `console.error` leaks server error messages to browser console

- **Location:** `apps/web/app/(auth)/login/page.tsx:90`
- **Risk:** `console.error("[Login] Server error:", dataRes.message)` logs the raw server error response to the browser console. In production, users can open dev tools and see internal error details (field names, error types, possibly stack hints).
- **Recommended fix:** Guard with `process.env.NODE_ENV !== "production"` or remove the console.error for production builds.

### M-7: Webhook endpoint lacks rate limiting

- **Location:** `apps/api/src/routes/webhook.routes.ts:7-10`
- **Risk:** A flood of requests to the webhook endpoint could cause excessive database load, even though HMAC verification protects against unauthorized processing.
- **Recommended fix:** Add rate limiting (e.g., 100 req/min per IP) to the webhook route.

### M-8: `contributeToGoal` controller does not validate amount at controller level

- **Location:** `apps/api/src/controller/savinggoal.controller.ts:237-245`
- **Risk:** The controller only checks `typeof amount !== "number"` and `Number.isNaN(amount)` — no check for negative or zero amounts. The service layer catches this, but this weakens defense-in-depth.
- **Recommended fix:** Add Zod validation schema for the contribute endpoint.

### M-9: Refresh token cookie uses `SameSite=None` in production

- **Location:** `apps/api/src/controller/auth.controller.ts:23,51,84`
- **Risk:** `SameSite=None` allows the refresh token cookie to be sent on cross-site requests. While `httpOnly` and `Secure` mitigate XSS and MitM, there is no CSRF protection (no `state` parameter, no custom header check) on the `/auth/refresh` endpoint.
- **Recommended fix:** Consider `SameSite=Strict` for refresh endpoint, or add a custom header (`X-Requested-By: PocketWise`) check on sensitive cookie-authenticated endpoints.

### M-10: `auth_session` cookie missing `Secure` flag

- **Location:** `apps/web/context/AuthContext.tsx:19`
- **Risk:** The `auth_session` cookie (used by middleware to check if user is logged in) does not have the `Secure` flag. It will be sent over unencrypted HTTP connections, making it susceptible to network sniffing.
- **Recommended fix:** Add `; Secure` to the cookie string, conditionally based on `window.location.protocol === "https:"`.

---

## LOW (good practice, not urgent)

### L-1: JWT uses HMAC-SHA256 (symmetric) — consider RS256

- **Location:** `apps/api/src/middleware/auth.middleware.ts:30`
- **Risk:** With HS256, the signing secret is shared between the issuer and verifier. Any service that can verify tokens can also forge them. RS256 (asymmetric) allows the API to hold only the public key for verification while the private key remains with the auth issuer.
- **Recommended fix:** Consider migrating to RS256 when adding multi-service architecture.

### L-2: No password complexity requirements

- **Location:** `apps/api/src/schemas/auth.schema.ts:11`
- **Risk:** Passwords only require 8+ characters with no uppercase, number, or special character enforcement.
- **Recommended fix:** Add Zod refinements for password strength (min 1 uppercase, 1 number, 1 special char).

### L-3: Image upload size limit uses base64 string length, not decoded byte size

- **Location:** `apps/api/src/controller/auth.controller.ts:317`
- **Risk:** The check `image.length > 2_800_000` measures the base64 string length (~2MB limit effectively), not the decoded image byte size. Acceptable for now but imprecise.
- **Recommended fix:** Decode the base64 string first, then check `Buffer.byteLength`, or calculate `(image.length * 3) / 4`.

### L-4: No decoded content verification for image uploads

- **Location:** `apps/api/src/controller/auth.controller.ts:303-316`
- **Risk:** Only the MIME prefix string is checked (`data:image/jpeg;base64,`). An attacker could embed a non-image payload after a valid prefix. Cloudinary likely validates this on their end.
- **Recommended fix:** Decode the base64 and validate the image header bytes (magic bytes) server-side before sending to Cloudinary.

### L-5: Admin secret in turbo.json env declarations

- **Location:** `turbo.json:17`
- **Risk:** `ADMIN_SECRET` is listed in `turbo.json` `env` array. While this only controls build-time environment variable inclusion, it creates an inventory of secrets in a config file.
- **Recommended fix:** Remove `ADMIN_SECRET` from `turbo.json` env if it is not needed at build time.

### L-6: Numerous Prisma queries missing explicit `select` clauses

- **Locations:** Multiple files throughout `apps/api/src/services/`
- **Risk:** Returns full row objects (including unused fields) to the service layer. Increases memory usage and makes future schema changes more risky.
- **Recommended fix:** Audit all Prisma queries and add explicit `select` clauses with only the needed fields.

### L-7: Goal completion cron job runs every minute

- **Location:** `apps/api/src/jobs/goal-completion.job.ts:6`
- **Risk:** A full DB scan every minute for expired goals is excessive. Not a security vulnerability but represents unnecessary database load.
- **Recommended fix:** Reduce frequency to every 5-15 minutes.

---

## PASSED (confirmed secure)

### Authentication & Session Security

- **JWT secrets stored in env only** — `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are read from `process.env` exclusively. No hardcoded secrets in any `.ts` source file. Verified at `auth.middleware.ts:5` and `auth.service.ts:97-107, 155-165`.
- **Refresh token stored as httpOnly cookie** — Confirmed at `auth.controller.ts:20-25`. `httpOnly: true` prevents JavaScript access.
- **Refresh token rotation** — Old token is blacklisted in Redis and a new token is issued on every `/auth/refresh` call. Verified at `auth.service.ts:206-213`.
- **Logout invalidates refresh token server-side** — Token added to Redis blacklist via `setex` with 7-day TTL. Verified at `auth.controller.ts:110-117`.
- **No endpoint returns `passwordHash` or `transferPin` in responses** — `auth.service.ts` `me()` explicitly sets `transferPin: undefined` before returning. All endpoints that read `transferPin` use it only for `bcrypt.compare()` verification.
- **Passwords hashed with bcrypt (cost factor 12)** — Verified at `auth.service.ts`.
- **PINs hashed with bcrypt (cost factor 10)** — Verified at `auth.service.ts:329`.
- **Helmet security headers configured** — CSP with restricted `scriptSrc`, `frameAncestors: ["'none'"]`, and other headers. Verified at `server.ts:33-52`.
- **Access token expiry (45 minutes)** — Short-lived access tokens limit window of compromise.
- **Refresh token expiry (7 days)** — Reasonable window for session duration.
- **Email normalization** — Emails lowercased before DB lookups. Verified at `auth.service.ts:41`.

### Authorization & IDOR

- **Wallet endpoints** — All wallet operations derive `userId` from `req.user.id`. No client-supplied `userId` accepted. Verified across `wallet.service.ts`.
- **Savings goals** — Ownership verified via `findFirst({ where: { id: goalId, userId: userId } })` pattern before any create/read/update/delete. Verified at `saving-goal.service.ts:96-104, 126-133, 222-229`.
- **Transaction history** — Filtered by `req.user.id` only. No client-supplied `userId`. Verified at `transaction.service.ts:51`.
- **Notifications** — Scoped by `userId` in queries. Mark-as-read uses `updateMany({ where: { id, userId } })` — the safest pattern. Verified at `notification.service.ts:818-823`.
- **Emergency unlock** — Scoped by `req.user.id`. Owner cannot access another user's emergency wallet. Verified at `emergency-unlock.service.ts`.
- **P2P recipients** — Scoped by `req.user.id`. Verified at `p2p-recipient.service.ts:64-67`.
- **Bank recipients** — Scoped by `req.user.id`. Verified at `bank-recipient.service.ts:53-55`.
- **Wallet split config** — All CRUD operations scoped by `userId` from JWT. Verified at `wallet-split.service.ts`.
- **Contribute to goal** — Ownership verified before allowing contribution. Verified at `saving-goal.service.ts:222-229`.
- **No endpoint accepts `userId` from `req.body`** — All controllers uniformly use `req.user?.id` or `(req as any).user.id`.

### Transfer Security

- **PIN verification on ALL transfer types** — Middleware `verify-pin.middleware.ts` is applied to P2P, internal, and bank transfer routes. Verified at route files.
- **Emergency wallet lock server-enforced** — Checked inside the `$transaction` with `FOR UPDATE` at `wallet.service.ts:364-377`. 12-hour cooling-off period enforced via `emergency-unlock.service.ts:27`.
- **Self-transfer prevention in P2P** — `userId === receiverUserId` check at `wallet.service.ts:136-140`.
- **P2P transfer uses `$transaction` + `FOR UPDATE`** — Verified at `wallet.service.ts:166-281`. Balance check inside transaction.
- **Internal transfer uses `$transaction` + `FOR UPDATE` on both wallets** — Verified at `wallet.service.ts:323-455`. Balance check inside transaction.
- **`skipAllocationGuard` NEVER client-controllable** — Not in Zod schema, not passed by service facade. Only set internally by `completeGoal()`. Verified at `internal-transfer.service.ts:8-15` and `internal-transfer.validator.ts:4-43`.
- **Bank transfer fee calculated server-side** — `feeCalculator(data.amount)` at `wallet.service.ts:490`. Not trusted from client input.
- **Cache invalidated after all transfers** — Sender and receiver wallets invalidated. Verified at `wallet.service.ts:290-291, 462, 558`.

### Webhook Security

- **`express.raw()` used on webhook route** — Correctly preserves raw body for signature verification. Verified at `webhook.routes.ts:9`.
- **`express.json()` mounted AFTER webhook route** — Webhooks not parsed by global JSON middleware. Verified at `server.ts:56-57`.
- **HMAC verification attempted** — The function exists and uses `timingSafeEqual`. The implementation has the double-encoding bug (C-1) but the pattern is correct.

### Input Validation

- **Zod validation on all transfer endpoints** — `transferSchema` for P2P, `externalTransferSchema` for bank transfer, `internalTransferSchema` for internal transfer. Verified.
- **Positive amount enforced** — All transfer schemas use `z.number().positive()`. Verified at `transfer.validator.ts:5,14`.
- **Account number validated as exactly 10 digits** — `.length(10).regex(/^\d+$/)` at `transfer.validator.ts:13`.
- **No SQL injection risk** — All `$queryRawUnsafe` calls use parameterized queries (`$1::uuid`). Verified across `wallet.service.ts:168,513` and `keep-alive.service.ts:16`.
- **Image upload validated for format (whitelist) and size (~2MB)** — Verified at `auth.controller.ts:303-317`.
- **PIN validation rejects weak PINs** — Common PINs (1234, 0000, etc.) rejected. Verified at `pin.schema.ts:28-38`.

### Rate Limiting

- **Rate limiting on all auth endpoints** — IP-based for login/signup/refresh/forgot/reset, user-based for PIN/password changes. Verified at `auth.routes.ts`.
- **Rate limiting on transfer endpoints** — 10 req/min per IP-and-user for P2P, internal, and bank transfers. Verified at route files.
- **Rate limiting on PIN setup/change** — 5 req/min per user. Verified at `auth.routes.ts:55-68`.
- **Rate limiting on emergency unlock requests** — 3 req/min per user. Verified at `emergency-unlock.routes.ts:16`.
- **Internal cron endpoints protected by shared secret** — `keepAliveAuthMiddleware` checks `x-keep-alive-secret` header. Verified at `keep-alive-auth.middleware.ts`.

### Data Exposure

- **Anchor API keys stored in env only** — `ANCHOR_KEY` and `ANCHOR_WEBHOOK_SECRET` are env vars. Verified.
- **Firebase service account stored as env var JSON** — `FIREBASE_SERVICE_ACCOUNT_JSON` env var parsed at runtime. Verified at `firebase.ts:5-11`.
- **Database connection string stored in env only** — `DATABASE_URL` and `DIRECT_URL` are env vars. Verified at `prisma.ts:6` and `schema.prisma:7-8`.
- **`.gitignore` properly configured** — `.env`, `.env.*`, and `firebase-service-account.json` excluded. Verified across root, `apps/api/.gitignore`, `apps/web/.gitignore`.

### Caching Security

- **Wallet balances NEVER served from cache during transfers** — `getWallet` caches only `{ id, type }` (no balance). Balance always fetched fresh from DB. Verified at `wallet.service.ts:67-95`.
- **PIN verification NEVER cached** — Each request does a fresh `bcrypt.compare()` against DB. Verified at `verify-pin.middleware.ts`.
- **Cache properly invalidated after transfers** — Both sender and receiver wallets invalidated. Verified at `wallet.service.ts:290-291, 462, 558`.

### Frontend Security

- **No API keys or secrets in `NEXT_PUBLIC_` variables** — All `NEXT_PUBLIC_*` values are intentionally public (Firebase config, API URL). Verified.
- **Access token stored in React state (memory), not localStorage** — `useState<string | null>(null)` in AuthContext. Verified at `AuthContext.tsx:62`.
- **Redirect URL sanitized** — Only same-origin, relative paths allowed for redirect-after-login. Verified at `login/page.tsx:80-84`.
- **No sensitive data leaked in redirect query strings** — Only `from` pathname passed. Verified at `middleware.ts:17`.
- **Firebase Messaging Service Worker has no secrets** — Uses `NEXT_PUBLIC_*` only. Verified at `firebase-messaging-sw/route.ts`.

### Dependency & Configuration

- **CORS configured with strict single origin** — `origin: FRONTEND_URL` (not wildcard), `credentials: true`. Verified at `server.ts:62-67`.
- **No stack traces leaked in API responses** — `error.middleware.ts` returns generic "Internal server error" for unknown errors. Verified.
- **HTTPS used in production config** — No hardcoded `http://` URLs in production configuration. All external API URLs use `https://`. Verified in CSP `connectSrc`.

---

## SUMMARY

| Severity | Count |
|----------|-------|
| **Critical** | 3 |
| **High** | 5 |
| **Medium** | 10 |
| **Low** | 7 |
| **Passed** | 40+ checks confirmed |

**Overall launch readiness: NOT READY**

The three critical findings (broken webhook HMAC verification, bank transfer race condition, and `contributeToGoal` race condition) represent real-money risk. The webhook issue is especially severe — combined with the 200-always response, no deposit webhooks are currently processed. The race conditions in bank transfers and goal contributions allow double-spend scenarios. These must be resolved before any real funds are involved.
