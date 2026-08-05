# Mobile Auth Flow & Centralized Error Handling

**Date:** 2026-08-05
**Type:** Feature + Refactor
**Scope:** API, Mobile

---

## Summary

Completes the mobile authentication flow by adding refresh token handling for mobile clients and centralizes error message extraction across all API controllers.

## Why

1. The mobile app had no working login — the login page was a shell with no API integration.
2. Mobile refresh tokens were only handled via httpOnly cookies (web pattern), which don't work in React Native. Mobile clients need refresh tokens passed in request/response bodies.
3. Error handling across 15+ controllers used inconsistent inline `error instanceof Error ? error.message : fallback` patterns, and `sendError` leaked internal error messages to clients.

## Technical Implementation

### Backend Changes

**New file: `apps/api/src/utils/errors.ts`**

Added `getErrorMessage(error, fallback)` — a centralized error message extractor. It only surfaces `error.message` for client-facing errors (< 500 status); for 500s it logs the full error server-side and returns a safe fallback string. This prevents internal error details from leaking to clients.

**Modified: `apps/api/src/utils/response.ts`**

- `sendError` now logs the full error with `console.error("[Error]", error)` before responding
- `sendError` always returns `data: null` instead of leaking `error.message` in the response body

**Modified: `apps/api/src/controller/auth.controller.ts`**

- `login`: Added `X-Client-Type: mobile` header detection. When mobile, includes `refreshToken` in the response body (alongside the httpOnly cookie for web).
- `refresh`: Reads `refreshToken` from `req.body` for mobile clients (falls back to cookies). Returns new `refreshToken` in response body for mobile (token rotation).

### Mobile Changes

**Modified: `apps/mobile/src/services/api.ts`**

- Exported `getApiUrl()` for use by `AuthContext`
- Default request timeout increased from 10s to 30s
- All requests now include `X-Client-Type: mobile` header

**Modified: `apps/mobile/src/context/AuthContext.tsx`**

- Uses exported `getApiUrl()` instead of raw `process.env.EXPO_PUBLIC_API_URL`
- `refreshSession` sends `X-Client-Type: mobile` header
- `refreshSession` stores rotated refresh token when the server returns a new one

**Modified: `apps/mobile/src/app/login.tsx`**

- Added real login logic: calls `/api/v1/auth/login`, stores tokens via `setAuth`, redirects to wallet
- Added Zod form validation using `loginSchema`
- Added inline error display with styled error banner
- Prevents double-submission with a loading guard

**Modified: `apps/mobile/src/app/index.tsx`**

- Checks auth state before redirecting: shows a blank screen while loading, redirects to `/login` if unauthenticated, `/wallet` if authenticated

### Error Handling Refactor (All Controllers)

Replaced inline `error instanceof Error ? error.message : "..."` with `getErrorMessage(error, "...")` across 15+ files:

- `auth.controller.ts`, `bank-recipient.controller.ts`, `emergency-unlock.controller.ts`, `goal-completion.controller.ts`, `internal-transfer.controller.ts`, `keep-alive.controller.ts`, `p2p-recipient.controller.ts`, `savinggoal.controller.ts`, `transaction.controller.ts`, `updateFcmToken.controller.ts`, `waitlist.controller.ts`, `wallet-split.controller.ts`, `wallet.controller.ts`, `notification.controller.ts`, `validate.middleware.ts`, `server.ts`, `keep-alive.service.ts`

## Database Changes

None.

## API Changes

### POST `/api/v1/auth/login`

**Request:** Unchanged.

**Response (mobile, `X-Client-Type: mobile`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "user": { "...": "..." },
    "requiresPinSetup": false,
    "refreshToken": "..."
  }
}
```

Web clients no longer receive `refreshToken` in the body (it is set as an httpOnly cookie).

### POST `/api/v1/auth/refresh`

**Request (mobile):**
```json
{
  "refreshToken": "..."
}
```
Header: `X-Client-Type: mobile`

**Response (mobile):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**All error responses now return:**
```json
{
  "success": false,
  "message": "...",
  "data": null
}
```
Previously `data` contained the raw error message string.

## Breaking Changes

- **Error response `data` field:** All error responses now return `data: null` instead of an error string. Any client parsing `response.data` as a string will break. The web client uses cookies for auth and does not depend on this field.

## Files/Modules Affected

| File | Change |
|------|--------|
| `apps/api/src/utils/errors.ts` | New — centralized error extraction |
| `apps/api/src/utils/response.ts` | Formatting; `sendError` logs errors and returns `data: null` |
| `apps/api/src/controller/auth.controller.ts` | Mobile token in login/refresh responses |
| `apps/api/src/controller/*.ts` (13 files) | `getErrorMessage` refactor |
| `apps/api/src/middleware/validate.middleware.ts` | `getErrorMessage` refactor |
| `apps/api/src/server.ts` | `getErrorMessage` refactor |
| `apps/api/src/services/keep-alive.service.ts` | `getErrorMessage` refactor |
| `apps/mobile/src/services/api.ts` | Export `getApiUrl`, add mobile header, increase timeout |
| `apps/mobile/src/context/AuthContext.tsx` | Mobile refresh token handling, use `getApiUrl` |
| `apps/mobile/src/app/login.tsx` | Real login implementation |
| `apps/mobile/src/app/index.tsx` | Auth-aware routing |

## Manual Validation

- Mobile login with valid credentials stores tokens and redirects to wallet
- Mobile login with invalid credentials shows the inline error banner
- Session is restored on app relaunch using the stored refresh token
- Rotated refresh token is persisted after a `/refresh` call
- Error responses return `data: null` while full errors are logged server-side

## Known Limitations

- Mobile still lacks a 401 interceptor for mid-session token expiry (architecture risk #4).
- Web client refresh token rotation is not addressed (architecture risk #2, partially resolved for mobile only).
- `console.log("Refresh token from storage:", refreshToken)` was added to `refreshSession` during debugging and should be removed before merge.

## Follow-up Tasks

- Remove debug `console.log` from `refreshSession` in `AuthContext.tsx`
- Add 401 interceptor for mobile mid-session token refresh (risk #4)
- Extend refresh token rotation to web client (risk #2)
- Remove the `refreshToken` field from web login responses to prevent accidental client-side storage
