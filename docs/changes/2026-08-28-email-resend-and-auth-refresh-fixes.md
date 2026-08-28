# Email → Resend (deliverability) & Auth Refresh 401 Fix

**Date:** 2026-08-28
**Type:** Bug Fix + Infrastructure
**Scope:** API + Web

---

## Summary

Two production errors were reported:

1. **`Error sending welcome email: Error: Unexpected socket close`** from nodemailer's SMTP transport (Gmail).
2. **`POST /api/v1/auth/refresh 401 (Unauthorized)`** logged on the web client mid-session.

This change (a) migrates transactional email delivery from Gmail SMTP (nodemailer) to Resend and hardens the email templates for inbox deliverability, and (b) fixes the refresh flow so transient infrastructure failures no longer surface as a `401` and cascade into a full logout.

## Root Cause

### Email — nodemailer + Gmail SMTP

`apps/api/src/lib/mail.ts` used `nodemailer.createTransport({ service: "gmail", ... })` with **no timeouts or pooling**. The `Unexpected socket close` is Gmail's SMTP server dropping the connection mid-transfer (transient throttling/network). Additionally:

- The welcome email body contained **malformed HTML** — `background:['#f8fafc;` (a stray `[` and unclosed quote) — a classic spam-filter signal.
- Emails were **HTML-only** (no plain-text alternative) and missing reply-to / unsubscribe / list headers, further hurting deliverability.

### Auth refresh — every error becomes a 401

`apps/api/src/services/auth.service.ts` wrapped the entire `refresh` body in a blanket `try/catch` that mapped **any** thrown error — including Redis or Prisma failures — to `401 Invalid or expired refresh token`. The web global fetch interceptor (`apps/web/context/AuthContext.tsx`) then called `logout()` on **any** 401 from the API, including to `/auth/refresh` itself. A transient Redis/DB hiccup during refresh therefore looked identical to an expired token and force-logged the user out.

## Fix

### Email — Resend migration + deliverability

**Migrated:** `transporter.sendMail(...)` → `resend.emails.send(...)` using `new Resend(process.env.RESEND_API_KEY)` with sender `"PocketWise" <onboarding@pocketwise.xyz>`. (`resend` was already a dependency but previously unused.) Removed `nodemailer` and `@types/nodemailer` from `apps/api/package.json`.

For **all four** senders (`sendWelcomeEmail`, `sendWaitlistEmail`, `sendOtpEmail`, `sendSavingsNotificationEmail`):

- Added a plain-text `text` alternative (HTML-only sends are a spam trigger).
- Added `replyTo: "support@pocketwise.xyz"` (Zoho Mail mailbox).
- Fixed the malformed `background:['#f8fafc` opening tag → `background:#f8fafc`.

For the **human-readable** senders (welcome, waitlist, savings notifications):

- Added a footer + visible `Unsubscribe` link (`https://pocketwise.xyz/unsubscribe`).
- Added the `List-Unsubscribe` header for delivery classification.

**OTP email** stays intentionally lean — no footer/unsubscribe, to avoid tripping spam filters on the one email whose loss locks users out of password reset.

### Auth refresh — differentiate infra vs auth failures

**`apps/api/src/services/auth.service.ts`** — Restructured `refresh` so only genuine auth failures throw `401`:

- `jwt.verify` failure → `401 Invalid or expired refresh token`
- user not found → `401`
- refresh token blacklisted → `401`

Redis and Prisma errors now **propagate as-is** (resulting in `500`), so a transient infrastructure outage no longer destroys a valid session. The controller (`auth.controller.ts`) already only clears the refresh cookie on `status === 401`, so infra failures now preserve the session.

**`apps/web/context/AuthContext.tsx`** — The global 401 interceptor now **skips `logout()`** for requests to `/api/v1/auth/refresh` and `/api/v1/auth/me`. Recovery is left to `refreshSession`/`initAuth`, which handle their own logout on genuine failure, preventing a single refresh failure from cascading into a full logout.

## Breaking Changes

None — the email and auth endpoint contracts are unchanged.

## Files/Modules Affected

| File                                   | Change                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `apps/api/src/lib/mail.ts`             | Nodemailer → Resend; `text` + `replyTo` + `List-Unsubscribe` + footer/unsubscribe; fixed malformed HTML |
| `apps/api/src/services/auth.service.ts`| `refresh` distinguishes 401 (auth) from 500 (infra) failures            |
| `apps/web/context/AuthContext.tsx`     | 401 interceptor excludes `/auth/refresh` and `/auth/me`                 |
| `apps/api/package.json`                | Removed `nodemailer`, `@types/nodemailer`                               |
| `package-lock.json`                    | Removed nodemailer packages                                            |
| `apps/api/.env`                        | Uses `RESEND_API_KEY` (git-ignored, not committed)                      |

## Configuration

Add/confirm in `apps/api/.env` (not committed):

```
RESEND_API_KEY=...
```

Email is sent from the verified `pocketwise.xyz` domain; replies route to `support@pocketwise.xyz` (Zoho Mail).

## Manual Validation

- `npm run build` (prisma generate + `tsc`) passes in `apps/api`.
- `npm run check-types` passes in `apps/api`.
- `tsc --noEmit` passes in `apps/web`.
- Test send via `POST https://api.resend.com/emails` returns a valid email `id` and delivered successfully (recorded in Resend logs).
- Welcome email previously landed in Gmail **spam**; after the HTML fix + text alternative it should land in the inbox (confirm via Resend delivery status and Gmail inbox).

## Known Limitations

- Requires a **redeploy from `main`** for both changes to take effect in production.
- The `https://pocketwise.xyz/unsubscribe` page **does not yet exist**; the link/header is wired but not backed by a route.
- Savings-notification `.hbs` templates currently render only the tagline footer; the `List-Unsubscribe` header is set, but no **visible** unsubscribe link is in those templates yet.
- Sender reputation on a freshly unwarmed domain may still route some mail to spam; mark test mail as "Not spam" and warm up send volume gradually.

## Follow-up Tasks

- Create the `/unsubscribe` page/endpoint and back it with a suppression list.
- Add a visible unsubscribe link to the savings-notification `.hbs` templates.
- Optionally add a startup Resend self-check (ping `resend.domains` / test send) to surface config issues early.
- Monitor Resend logs after deploy to confirm welcome/OTP/notification emails reach `Delivered`.
