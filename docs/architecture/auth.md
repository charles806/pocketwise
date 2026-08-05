# Authentication Architecture

**Last updated:** 2026-08-05

---

## Overview

PocketWise uses JWT-based authentication with short-lived access tokens and long-lived refresh tokens. The web and mobile clients handle token storage differently.

## Token Flow

### Web

1. **Login** → API sets `refreshToken` as an httpOnly cookie (7-day expiry). Client receives `accessToken` in the response body.
2. **Refresh** → Client calls `/api/v1/auth/refresh`. API reads `refreshToken` from cookies and issues a new `accessToken` (and a new `refreshToken` cookie via rotation).
3. **Logout** → API clears the cookie and blacklists the refresh token in Redis (7-day TTL).

### Mobile

1. **Login** → Client sends `X-Client-Type: mobile` header. API returns both `accessToken` and `refreshToken` in the response body.
2. **Refresh** → Client sends `refreshToken` in the request body with `X-Client-Type: mobile` header. API returns a new `accessToken` and `refreshToken` (rotation).
3. **Storage** → Refresh token stored in `expo-secure-store` (native) or `localStorage` (web fallback via `apps/mobile/src/utils/secureStorage.ts`).
4. **Logout** → Client deletes tokens from storage and calls `/api/v1/auth/logout`.

## Token Details

| Token | Lifetime | Storage | Rotation |
|-------|----------|---------|----------|
| Access token | 45 minutes | In-memory (state) | No |
| Refresh token | 7 days | Cookie (web) / secureStorage (mobile) | Yes (mobile only) |

## Session Management

- **Inactivity timeout:** 45 minutes. Mobile tracks `AppState` changes and compares timestamps stored in secure storage.
- **App backgrounded:** Timestamp saved. On foreground, if elapsed > 45 minutes, the user is logged out.
- **Session restore:** On app launch, `refreshSession()` attempts to restore the session using the stored refresh token.
- **Routing:** The mobile index route checks auth state before redirecting — `/login` if unauthenticated, `/wallet` if authenticated.

## Security Properties

- `refreshToken` cookie is `httpOnly`, `secure` (production), `sameSite: lax`
- Refresh tokens are blacklisted in Redis on logout (7-day TTL matches token expiry)
- `getErrorMessage()` only surfaces error messages for client errors (< 500 status); 500 errors log server-side and return a safe fallback
- `sendError` always returns `data: null` — no internal error details leak to clients

## Known Risks

See `docs/architecture-risk-register.md` for the full risk register.

| Risk | Status |
|------|--------|
| No refresh token rotation (risk #2) | **Partially addressed** — mobile now rotates; web does not yet |
| Mobile doesn't auto-refresh on 401 mid-session (risk #4) | Open |
| No structured logging (risk #5) | Open |
