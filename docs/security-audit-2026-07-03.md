# PocketWise Security Audit Report
**Date:** 2026-07-03
**Scope:** apps/api (Express/Prisma), apps/web (Next.js), apps/mobile (Expo)
**Stack:** Node.js/TypeScript/Express/Prisma/PostgreSQL, Turborepo monorepo, Redis (Upstash), Anchor BaaS (sandbox)
**Auth:** JWT access tokens (15min) + refresh tokens (7d, httpOnly cookie)

---

## CRITICAL (fix before launch — real money risk)

### C-1: Double-spend on P2P transfers — no row-level locking

- **Location:** `apps/api/src/services/wallet.service.ts:170-275`
- **What an attacker could do:** Send two simultaneous P2P transfer requests. Both pass the
  balance check (line 181) before either decrements. Both succeed, resulting in spending
  more than the wallet balance — a classic race condition / double-spend.
- **Recommended fix:** Add `SELECT ... FOR UPDATE` row locking (as already done in
  `internalWalletTransfer` at line 318-324) inside the `$transaction` callback before
  reading sender and receiver wallets.

### C-2: Double-spend on bank transfers — no row-level locking

- **Location:** `apps/api/src/services/wallet.service.ts:510-541`
- **What an attacker could do:** Same as C-1 but via the bank transfer path. Concurrent
  requests can race past the balance check (done earlier via
  `spendWallet.balance.toNumber()` at line 499) and both successfully debit.
- **Recommended fix:** Lock the spend wallet row with `FOR UPDATE` inside the
  `$transaction` callback before performing the debit.

### C-3: Webhook signature verification broken — express.json() runs before express.raw()

- **Location:** `apps/api/src/server.ts:35` (global `express.json()`) and
  `apps/api/src/routes/webhook.routes.ts:9` (`express.raw()`)
- **What an attacker could do:** `express.json()` on line 35 consumes the raw request body
  and sets `req.body` to a parsed JSON object. When the webhook route's `express.raw()`
  runs later (line 9), it is skipped because `req._body` is already set.
  `req.body.toString()` at `webhook.controller.ts:27` produces `"[object Object]"`, so
  every HMAC signature verification always fails. This means the webhook endpoint either
  rejects all legitimate Anchor webhooks (HTTP 400 → Anchor retries → wasted compute)
  or, if processing falls through despite signature failure, processes unauthenticated
  deposit requests — allowing anyone to fake deposits.
- **Recommended fix:** Move `app.use("/api/v1/webhooks", webhookRoutes)` to **before**
  `app.use(express.json())` on line 35, or configure `express.json()` to exclude the
  webhook path.

### C-4: Access token printed to browser console on every page load

- **Location:** `apps/web/src/context/AuthContext.tsx:189-194`
- **What an attacker could do:** Any browser extension, compromised dependency, or XSS can
  read `console.log` output. The raw JWT access token is logged to console on every
  `initAuth()` call (every page load). With the access token, an attacker can impersonate
  the user for 15+ minutes.
- **Recommended fix:** Wrap the `console.log` in
  `if (process.env.NODE_ENV !== 'production')`, or remove it entirely.

### C-5: /api/v1/transfers/bank has no PIN verification middleware and no rate limiting

- **Location:** `apps/api/src/routes/bank-transfer.routes.ts:7`
- **What an attacker could do:** This route (`POST /transfers/bank`) is a duplicate of
  `POST /wallets/` (line 22 of wallet.routes.ts) but lacks both `verifyTransferPin`
  middleware and rate limiting. An attacker can brute-force the PIN at unlimited speed
  through this path. The service layer does verify the PIN (wallet.service.ts:479), but
  with no throttle, an attacker can try thousands of PINs per second.
- **Recommended fix:** Add `verifyTransferPin` middleware and rate limiting to the route.
  Consider removing the redundant route entirely.

---

## HIGH (fix before launch — trust/data risk)

### H-1: Logout does not invalidate refresh token server-side

- **Location:** `apps/api/src/controller/auth.controller.ts:85-92`
- **What an attacker could do:** The logout handler only clears the cookie on the client.
  A stolen/exfiltrated refresh token remains valid for up to 7 days even after the user
  logs out. The attacker can continue issuing new access tokens.
- **Recommended fix:** Implement a server-side refresh token blacklist (e.g., Redis set
  with TTL matching the token expiry) or add a `tokenVersion` column to the User model
  (increment on logout, check during refresh).

### H-2: Emergency unlock cooling period is instant (zero delay)

- **Location:** `apps/api/src/services/emergency-unlock.service.ts:27`
- **What an attacker could do:** `unlocksAt` is set to `new Date()` — the current time —
  meaning the unlock is available immediately. An attacker with access to a locked device
  can bypass the emergency wallet cooling-off intended to give the user time to re-secure
  their account.
- **Recommended fix:** Change to `new Date(Date.now() + 24 * 60 * 60 * 1000)` (or whatever
  cooling period is intended).

### H-3: CORS origin falls back to true (reflects any origin)

- **Location:** `apps/api/src/server.ts:38`
- **What an attacker could do:** If `FRONTEND_URL` env var is unset in production,
  `origin: true` causes the CORS middleware to echo back whatever `Origin` header the
  client sends, with `credentials: true`. Any arbitrary website can make credentialed
  cross-origin API requests.
- **Recommended fix:** Remove `|| true` — require the env var to be explicitly set:
  `origin: FRONTEND_URL`. Add a validation check at startup that crashes if
  `FRONTEND_URL` is not set in production.

### H-4: Raw error messages leaked to API clients

- **Location:** `apps/api/src/middleware/error.middleware.ts:19-23` (and all controllers
  via `sendError`)
- **What an attacker could do:** Unhandled system errors (Prisma connection failures, DB
  constraint violations, file-system errors) send their `.message` verbatim to the
  client, leaking implementation details (DB schema, file paths, internal IPs).
- **Recommended fix:** Never forward `err.message` for errors without a known
  `statusCode`. Use a sanitized "Internal server error" for unexpected errors while
  preserving known application errors.

### H-5: User PII logged to console in frontend production code

- **Location:** `apps/web/src/context/AuthContext.tsx:210` and
  `apps/web/src/app/(auth)/login/page.tsx:73-74`
- **What an attacker could do:** Full user data objects (name, email, account info) are
  logged to browser console on every login and setAuth call. Browser extensions or XSS
  can harvest this PII.
- **Recommended fix:** Remove or guard behind
  `if (process.env.NODE_ENV !== 'production')`.

### H-6: Signup response leaks refreshToken in response body

- **Location:** `apps/api/src/controller/auth.controller.ts:21`
- **What an attacker could do:** The `user: result` nesting includes `refreshToken` inside
  the JSON response body (accessible to client-side JS), even though it's also properly
  set as an httpOnly cookie. XSS on the frontend can extract it.
- **Recommended fix:** Destructure `refreshToken` out of the signup result before nesting
  under `user`:
  ```
  const { refreshToken, ...safeUser } = result;
  ```
  Compare with the `login` controller which correctly separates them.

### H-7: HMAC algorithm likely wrong in webhook verification

- **Location:** `apps/api/src/controller/webhook.controller.ts:12`
- **What an attacker could do:** Anchor typically uses HMAC-SHA1. The code uses
  HMAC-SHA256. If Anchor uses SHA1, every signature verification will fail silently and
  all legitimate webhooks will be rejected. If Anchor actually uses SHA256, this is fine,
  but it must be confirmed.
- **Recommended fix:** Confirm Anchor's signing algorithm and match it. Use
  `crypto.timingSafeEqual` directly on the HMAC output (not on hex-encoded strings) for
  constant-time comparison.

---

## MEDIUM (fix soon after launch)

### M-1: Image upload accepts any data:image/* MIME type (no whitelist)

- **Location:** `apps/api/src/controller/auth.controller.ts:269`
- **What an attacker could do:** SVG uploads with embedded scripts (stored XSS if rendered
  unsafely), or bandwidth amplification via large images sent to Cloudinary.
- **Recommended fix:** Add a MIME type whitelist: `image/jpeg`, `image/png`, `image/webp`
  only. Validate that the base64 string actually decodes to the declared type.

### M-2: Webhook returns 400 on invalid signature (should return 200)

- **Location:** `apps/api/src/controller/webhook.controller.ts:31`
- **What an attacker could do:** Returning 400 tells Anchor to retry the webhook (with
  exponential backoff), creating unnecessary load. If numerous invalid requests arrive,
  retries compound the issue.
- **Recommended fix:** Return 200 for any validation failure to prevent Anchor retries:
  `sendSuccess(res, "Webhook received", {}, 200)`.

### M-3: Internal cron endpoints lack rate limiting

- **Location:** `apps/api/src/server.ts:81-214` (auto-contribute, complete-goals,
  weekly-summary)
- **What an attacker could do:** If the `KEEP_ALIVE_SECRET` is ever leaked, attacker can
  hit these endpoints without throttle. Defense-in-depth issue.
- **Recommended fix:** Add `rateLimitMiddleware` to the three inline cron handlers.

### M-4: Open redirect via `from` query parameter on login

- **Location:** `apps/web/src/app/(auth)/login/page.tsx:76`
- **What an attacker could do:** Phishing link
  `https://pocketwise.app/login?from=https://evil.com` redirects the user to an
  attacker-controlled site after login. Uses `window.location.href` with zero validation.
- **Recommended fix:** Validate the redirect target against an allowlist of known app
  paths. Use `router.push()` instead of `window.location.href`.

### M-5: Idempotency check uses startsWith instead of exact match

- **Location:** `apps/api/src/services/webhook.service.ts:45`
- **What an attacker could do:** A crafted `anchorRef` that happens to share a prefix with
  a legitimate reference could be incorrectly treated as already processed.
- **Recommended fix:** Use `equals` instead of `startsWith` for the idempotency check.

### M-6: No input validation on /auth/lookup query parameters

- **Location:** `apps/api/src/controller/auth.controller.ts:119-128`
- **What an attacker could do:** `type` is destructured without Zod validation — could
  pass arbitrary values beyond the expected enum. While the service layer restricts via a
  switch, there's no upfront format/size validation on either `type` or `value`.
- **Recommended fix:** Add a Zod schema for query params on the lookup endpoint.

### M-7: No input validation on /auth/goal PATCH body

- **Location:** `apps/api/src/controller/auth.controller.ts:145`
- **What an attacker could do:** `req.body.goal` is destructured without any Zod
  validation, type check, or length limit.
- **Recommended fix:** Add a Zod schema for the `goal` field.

### M-8: Admin secret stored in sessionStorage (plaintext)

- **Location:** `apps/web/src/app/admin/page.tsx:52,65`
- **Risk:** `sessionStorage` is readable by any JS on the same origin. If an XSS exists,
  the admin secret can be stolen.
- **Recommended fix:** Use a session-based approach (server-side) or clear the secret on
  logout/navigation away.

### M-9: In-memory rate limiter fallback is unbounded

- **Location:** `apps/api/src/middleware/rate-limit.middleware.ts:17`
- **Risk:** `Map<string, FallbackEntry>` has no LRU eviction or max-size cap. An attacker
  with many distinct IPs could cause memory pressure.
- **Recommended fix:** Cap the in-memory map size with eviction or use a bounded cache.

---

## LOW (good practice, not urgent)

### L-1: No refresh token rotation
- **Location:** `apps/api/src/services/auth.service.ts:183-209`
- **Detail:** Stolen refresh tokens remain valid for 7 days with no rotation or server-side
  tracking.
- **Recommendation:** Implement token rotation (issue new refresh + invalidate old on
  every `/refresh` call) or add a `tokenVersion` to the User model.

### L-2: IP-only rate limiting on auth (weak against distributed attacks)
- **Location:** `apps/api/src/routes/auth.routes.ts`
- **Detail:** Login/signup keyed by IP only. A distributed attack from multiple IPs bypasses
  the limit. No per-email or per-account tracking.
- **Recommendation:** Add per-email rate limiting in addition to per-IP.

### L-3: isLocked schema field is dead code — never enforced
- **Location:** `apps/api/prisma/schema.prisma:73`, `apps/api/src/services/wallet.service.ts:78-96`
- **Detail:** `isLocked` exists on the Wallet model but no transfer service function ever
  checks it. The emergency wallet is protected through other means (spend-only debit),
  but the field is misleading.
- **Recommendation:** Either enforce `isLocked` in all transfer services or remove the
  field.

### L-4: lookupUser cache not invalidated on profile update
- **Location:** `apps/api/src/services/auth.service.ts:480`
- **Detail:** After updating profile, `userProfile` cache is invalidated but
  `userLookup` is not. Other users may see stale name/username for up to 10 minutes.
  Public info only, no security impact.
- **Recommendation:** Also invalidate the lookup cache on profile update.

### L-5: Inconsistent Zod validation pattern
- **Location:** `bank-transfer.routes.ts:7`, `internal-transfer.routes.ts:9-15`,
  `savings-goal.routes.ts:18-23`
- **Detail:** Several routes skip the `validate()` middleware and do Zod parsing inside
  the controller instead. Functional but audit-unfriendly.
- **Recommendation:** Move to consistent middleware-first validation for all routes.

### L-6: Helmet CSP not customized for fintech app
- **Location:** `apps/api/src/server.ts:33`
- **Detail:** Helmet applied with zero configuration — CSP header is permissive
  (no directives set).
- **Recommendation:** Add explicit CSP directives restricting `script-src`,
  `connect-src`, `frame-ancestors`.

### L-7: @types/bcrypt in dependencies instead of devDependencies
- **Location:** `apps/api/package.json:31`
- **Detail:** Build-time only type package incorrectly listed in `dependencies`.
- **Recommendation:** Move to `devDependencies`.

### L-8: No rate limit on low-risk auth endpoints
- **Location:** `apps/api/src/routes/auth.routes.ts:50-53`
- **Detail:** `logout`, `me`, `lookup`, `goal` have no rate limiting. Minor abuse vector
  for log spam.
- **Recommendation:** Add basic rate limiting for consistency.

### L-9: Multiple console.log statements in production TSX files
- **Location:** `GoalModal.tsx:70,91,94`, `useFcmToken.ts:18-20`,
  `RecentTransactions.tsx:88`
- **Detail:** Not sensitive, but should be cleaned up for production.
- **Recommendation:** Remove or guard behind `NODE_ENV !== 'production'`.

### L-10: isLocked never toggled after emergency unlock completes
- **Location:** `apps/api/src/services/emergency-unlock.service.ts`
- **Detail:** Despite having an `isLocked` field on the Wallet model, the emergency unlock
  flow never sets `isLocked: false`.
- **Recommendation:** Set `isLocked: false` when unlock completes and `isLocked: true`
  when a new lock is needed.

---

## PASSED (confirmed secure)

### Authentication & Session
- **JWT secrets in env only:** All JWT operations (`auth.middleware.ts:5`,
  `auth.service.ts:98,104,156,162,187,200`) read from `process.env` only.
  No hardcoded secrets in source. `.env` is gitignored.
- **Refresh token stored as httpOnly cookie:** `auth.controller.ts:9-14,37-42` —
  `httpOnly: true`, `secure: true` in production, `sameSite` configured.
- **/auth/refresh validates token properly:** `auth.service.ts:185-189` verifies JWT with
  `algorithms: ["HS256"]` (algorithm pinned), checks user exists in DB.
- **No endpoint returns passwordHash:** Confirmed across all services — selected only for
  internal bcrypt.compare, never in response objects.
- **/auth/me does not expose sensitive fields:** `auth.service.ts:219-245` — `passwordHash`
  excluded from select; `transferPin` explicitly set to `undefined`.
- **Brute force protection on login:** 5 req/60s per IP via `strictIpLimit`.
- **Brute force protection on PIN setup/change:** 5 req/60s per user.
- **JWT algorithm pinned to HS256:** `auth.middleware.ts:30` — prevents algorithm
  confusion attacks.

### Authorization & IDOR
- **No IDOR vulnerabilities found across all 30+ endpoints.** Every controller derives
  `userId` exclusively from `req.user.id` (JWT auth middleware). No endpoint accepts
  `userId` from body, params, or query string for ownership purposes. Specific verified
  endpoints:
  - Wallet transfers → `wallet.service.ts:147` — sender wallet by
    `{ userId, type: "spend" }`
  - Savings goals (read/update/delete/contribute/complete) → all include `userId` in
    `where` clause alongside `goalId`
  - Transaction history → `transaction.service.ts:41` — filters by JWT userId only
  - Notifications mark-read → `notification.service.ts:819-823` — `updateMany` with both
    `id` and `userId`
  - Emergency unlock → `emergency-unlock.service.ts:6-9` — wallet lookup by JWT userId
  - P2P recipients → `p2p-recipient.service.ts:65-67` — filtered by JWT userId
  - Bank recipients → `bank-recipient.service.ts:53-55` — filtered by JWT userId

### Transfer Security
- **Transfer PIN verified server-side on P2P and internal transfers:**
  `wallet.routes.ts:18`, `internal-transfer.routes.ts:13` — `verifyTransferPin`
  middleware applied.
- **Bank transfer fee calculated server-side:** `wallet.service.ts:484` — uses
  `feeCalculator(data.amount)`; client cannot influence fee.
- **skipAllocationGuard never accepted from client:** `internal-transfer.validator.ts`
  strips unknown keys via Zod. The flag is only set server-side in
  `saving-goal.service.ts:196`.
- **Self-transfer blocked in P2P:** `wallet.service.ts:140-144` — explicit check and
  rejection.
- **Row locking on internal transfers:** `wallet.service.ts:318-324` —
  `SELECT ... FOR UPDATE` used inside `$transaction`.

### Webhook Security
- **Idempotency / replay protection:** `webhook.service.ts:43-51` — checks
  `prisma.transaction.findFirst` against `anchorRef` before processing.
- **Catch block returns 200:** `webhook.controller.ts:45` — internal processing errors
  return 200 to Anchor.

### Input Validation
- **Negative amounts prevented everywhere:** All Zod schemas use `.positive()` or
  `.min(N)` with N > 0. Service layers also double-check.
- **accountNumber validated as exactly 10 digits:** `transfer.validator.ts:13` —
  `.length(10)` + `/^\d+$/` regex.
- **No SQL injection risk:** Both `$queryRaw` uses are parameterized tagged templates
  (`wallet.service.ts:318-324`) or hardcoded strings (`keep-alive.service.ts:16`).
  All Prisma queries use parameterized builders.
- **No endpoint accepts userId from req.body:** Verified across all controllers.

### Rate Limiting
- **Signup rate limited:** 3 req/60s per IP.
- **Forgot-password / OTP / reset-password / change-password all rate limited.**
- **P2P transfers rate limited:** 10 req/60s per IP+user.
- **Internal transfers rate limited:** 10 req/60s per IP+user.
- **KEEP_ALIVE_SECRET is strong:** 64-char lowercase hex string = 256-bit entropy.
- **All /api/internal/* endpoints require keepAliveAuthMiddleware:**
  `server.ts:83,151,157`, `keep-alive-auth.middleware.ts:4-31`.

### Data Exposure
- **FCM token** only returned to its owner during update — no unnecessary exposure.
- **Anchor keys** stored only in `.env`, not hardcoded in source.
- **Firebase service account** loaded from env var (`FIREBASE_SERVICE_ACCOUNT_JSON`) —
  no JSON file on disk or in git.
- **Database connection string** loaded from env var (`DATABASE_URL`) — no hardcoded
  credentials.
- **.gitignore proper** — root `.gitignore` covers `.env`, `.env.*local`; API `.gitignore`
  covers `.env`, `firebase-service-account.json`, `schema.sql`. Verified `git ls-files`
  confirms none tracked.

### Caching
- **Wallet balance never served from cache during transfers:**
  `wallet.service.ts:67-113` — `getWallet()` caches only structural metadata
  (id, type, isLocked); balance always re-fetched fresh from DB. Transfer functions
  read wallets directly from DB inside transactions.
- **Transfer PIN never cached:** `auth.service.ts:245` — `transferPin: undefined`
  explicitly set before caching profile. PIN always read from DB for verification
  (`wallet.service.ts:463-479`).
- **No cache poisoning possible:** Every user-scoped cache key includes `userId` from
  JWT. Attacker cannot forge another user's JWT.
- **Cache properly invalidated after transfers:** Both sender and receiver wallets
  invalidated for P2P (`wallet.service.ts:283-284`); sender only for bank/internal
  (`wallet.service.ts:455,554`). Goals cache invalidated on contribute/complete.

### Frontend
- **Access token stored in React state (in-memory only):** `AuthContext.tsx:62` —
  `useState<string | null>(null)`. No localStorage/sessionStorage for tokens.
  Correct architecture.
- **Firebase keys use NEXT_PUBLIC_ prefix:** Appropriate for Firebase client SDK
  credentials (inherently public).
- **No localStorage usage for sensitive data:** Zero instances across all TSX/TS files.
- **No hardcoded http:// URLs in frontend production code:** All `http://` references
  are localhost (development only).

### Dependencies & Configuration
- **No obviously outdated/packages with known CVEs:** All deps at current 2026 versions.
  `jsonwebtoken` ^9.0.3 (post-fix for CVE-2022-23529). Express 5 stable. Prisma 6.19.3.
- **Helmet applied globally:** `server.ts:33` — provides X-Content-Type-Options,
  X-Frame-Options, Strict-Transport-Security, etc.
- **No http:// production URLs hardcoded:** Only `http://localhost:*` URLs in `.env` files.
- **Cookie secure flag correctly gated on NODE_ENV === "production".**
- **Vercel config is standard** — no security concerns.

---

## SUMMARY

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 7 |
| MEDIUM | 9 |
| LOW | 10 |

**Overall launch readiness: NOT READY** — 5 critical vulnerabilities involving real-money
risk (double-spend race conditions, broken webhook signature verification, bank-transfer
PIN bypass, and access token leakage) must be fixed before any production deployment with
real funds.

---

*Audit performed 2026-07-03. Read-only — no files were modified.*
