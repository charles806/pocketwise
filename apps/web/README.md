# PocketWise 💜

> **Smart Wallet for Nigerian Youth** — *Your money, automatically sorted.*

PocketWise is a fintech application built for Nigerian youth aged 18–25 that automatically splits every deposit into four purpose-driven wallets the moment money arrives — no manual budgeting, no willpower required. It runs on **real money via Anchor BaaS** from day one.

---

## Table of Contents

- [The Core Idea](#the-core-idea)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Anchor BaaS Integration](#anchor-baas-integration)
- [Auto-Split Logic](#auto-split-logic)
- [Environment Variables](#environment-variables)
- [Build Phases](#build-phases)
- [Coding Standards](#coding-standards)
- [Design System](#design-system)
- [Success Metrics](#success-metrics)

---

## The Core Idea

The **Warren Buffett 70/30 Split** — every deposit is automatically divided into four wallets the instant it lands:

| Wallet        | Allocation | Example (₦10,000) | Purpose                        |
|---------------|------------|-------------------|--------------------------------|
| 💸 **Spend**  | 70%        | ₦7,000            | Day-to-day expenses            |
| 💰 **Savings**| 30%        | ₦3,000            | Long-term wealth building      |
| 🚨 **Emergency** | 10%    | ₦1,000            | Safety net, locked by default  |
| ✨ **Flex**   | 10%        | ₦1,000            | Guilt-free treats and extras   |

> Rounding remainders are always assigned to the **Flex** wallet to ensure the total always equals the deposit amount.

---

## Features

### MVP (Core)
- ⚡ **Auto-split on deposit** — every incoming deposit is split 70/30/10/10 atomically
- 📝 **Reason-required transfers** — every spend requires a stated reason, enforced at API level
- 🔒 **Emergency wallet lock** — locked by default; override requires explicit friction
- 🎯 **Savings goals** — create goals with automated weekly contribution tracking from the Savings wallet
- 🤖 **AI Money Coach** — weekly spending analysis, behavioral insights, and celebrations
- 📊 **Weekly financial summary** — delivered via push notification
- 🏦 **Real money** — powered by Anchor BaaS, no simulated balances

### Age Gate
- **18+** — real money features (Anchor BaaS, KYC, transfers)
- **13–17** — simulation/learning mode only (no real funds, no regulatory complexity)

---

## Tech Stack

### Frontend

| Technology       | Version     | Purpose                                      |
|------------------|-------------|----------------------------------------------|
| Next.js          | 15+ (App Router) | Framework — all pages use App Router     |
| TypeScript       | 5+          | Type safety throughout                       |
| Tailwind CSS     | 4+          | Utility-first styling                        |
| Lucide React     | Latest      | All icons — no other icon library            |
| React Hook Form  | Latest      | All form state management                    |
| Zod              | Latest      | Schema validation (shared frontend/backend)  |
| Axios            | Latest      | HTTP client for API calls                    |
| Zustand          | Latest      | Global state (auth, wallet data)             |

### Backend

| Technology    | Version   | Purpose                                   |
|---------------|-----------|-------------------------------------------|
| Node.js       | 20+ LTS   | Runtime                                   |
| Express.js    | 4+        | API framework                             |
| TypeScript    | 5+        | Type safety                               |
| PostgreSQL     | 15+       | Primary database                          |
| Neon          | Serverless | PostgreSQL hosting                       |
| Prisma        | Latest    | ORM and migrations                        |
| jsonwebtoken  | Latest    | JWT auth tokens                           |
| bcryptjs      | Latest    | Password hashing                          |
| Resend        | Latest    | Transactional email                       |
| Termii        | API v3    | SMS and OTP                               |
| Anchor        | BaaS API  | Real banking — deposits, transfers, KYC   |
| Sentry        | Latest    | Error tracking and monitoring             |
| Cloudinary    | Latest    | Profile image uploads                     |

### Infrastructure

| Service   | Usage                                        |
|-----------|----------------------------------------------|
| Vercel    | Frontend hosting (Next.js native)            |
| Railway   | Backend API hosting (Node/Express)           |
| Neon      | PostgreSQL database (serverless, auto-scaling)|
| GitHub    | Version control — `main` + `dev` branches    |

---

## Project Structure

### Frontend (Next.js App Router)

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── (auth)/
│   │   ├── signup/page.tsx         # Signup screen
│   │   ├── login/page.tsx          # Login screen
│   │   ├── onboarding/page.tsx     # Pre-signup slides
│   │   └── setup/page.tsx          # Post-signup wallet init
│   ├── (dashboard)/
│   │   ├── wallet/page.tsx         # Home screen
│   │   ├── goals/page.tsx          # Savings goals
│   │   ├── summary/page.tsx        # Weekly summary
│   │   └── profile/page.tsx        # Profile + settings
│   └── waitlist/page.tsx           # Coming soon page
├── components/
│   ├── ui/                         # Shared UI components
│   ├── layout/                     # Navbar, BottomNav, etc.
│   ├── wallet/                     # WalletCard, BalanceCard, etc.
│   └── forms/                      # SignupForm, LoginForm, etc.
├── lib/
│   ├── api.ts                      # Axios instance + interceptors
│   ├── utils.ts                    # formatNaira, calculateSplit, etc.
│   └── validations.ts              # Zod schemas
└── store/
    ├── auth.store.ts               # User auth state (Zustand)
    └── wallet.store.ts             # Wallet balances state (Zustand)
```

### Backend (Express + TypeScript)

```
src/
├── routes/
│   ├── auth.routes.ts
│   ├── wallet.routes.ts
│   ├── transactions.routes.ts
│   ├── goals.routes.ts
│   └── waitlist.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── wallet.controller.ts
│   └── transactions.controller.ts
├── middleware/
│   ├── auth.middleware.ts          # JWT verification
│   ├── validate.middleware.ts      # Zod request validation
│   ├── rateLimit.middleware.ts     # Rate limiting
│   └── logger.middleware.ts        # Request logging
├── services/
│   ├── anchor.service.ts           # All Anchor BaaS API calls
│   ├── email.service.ts            # Resend email sending
│   ├── sms.service.ts              # Termii OTP
│   ├── split.service.ts            # Auto-split calculation logic
│   └── ai.service.ts               # AI coach insight generation
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Migration files
├── app.ts                          # Express app setup
└── server.ts                       # Entry point
```

---

## Database Schema

> All money fields are `DECIMAL(12,2)`. **Never use `Float` for financial values.**

### Core Tables

| Table           | Key Fields                                                                                             |
|-----------------|--------------------------------------------------------------------------------------------------------|
| `users`         | `id (UUID)`, `name`, `email`, `phone`, `password_hash`, `kyc_tier (1/2/3)`, `date_of_birth`, `is_verified`, `created_at` |
| `wallets`       | `id (UUID)`, `user_id (FK)`, `type (spend/savings/emergency/flex)`, `balance DECIMAL(12,2)`, `is_locked`, `created_at` |
| `transactions`  | `id (UUID)`, `user_id (FK)`, `wallet_id (FK)`, `type (deposit/transfer/split)`, `amount DECIMAL(12,2)`, `reason`, `anchor_ref`, `status`, `created_at` — **IMMUTABLE ROWS** |
| `savings_goals` | `id (UUID)`, `user_id (FK)`, `title`, `target_amount`, `current_amount`, `deadline`, `auto_contribute (bool)`, `created_at` |
| `ai_insights`   | `id (UUID)`, `user_id (FK)`, `week_start (date)`, `summary (text)`, `tips (JSON)`, `warnings (JSON)`, `created_at` |
| `waitlist`      | `id (UUID)`, `email (unique)`, `name (nullable)`, `created_at` |
| `referrals`     | `id (UUID)`, `referrer_id (FK)`, `referee_id (FK)`, `credit_amount DECIMAL(12,2)`, `status`, `created_at` |
| `kyc_records`   | `id (UUID)`, `user_id (FK)`, `tier`, `bvn_hash`, `nin_hash`, `verified_at`, `created_at` |

### Financial Data Rules

- All money stored as `DECIMAL(12,2)` — **never `FLOAT` or `Int`**
- Transaction rows are **IMMUTABLE** — never `UPDATE` a transaction, only `INSERT`
- Every deposit triggers exactly **4 split transaction rows atomically** (wrapped in a DB transaction)
- If any wallet credit fails, the **entire split is rolled back**
- `anchor_ref` stored on every transaction row for reconciliation
- Wallet balance is always derived from the transaction log — never stored independently in business logic

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint               | Description                                                        |
|--------|------------------------|--------------------------------------------------------------------|
| POST   | `/signup`              | Create account, initialize 4 wallets, send verification email     |
| POST   | `/login`               | Return access token (15min) + set refresh token cookie (7d)        |
| POST   | `/logout`              | Clear refresh token cookie                                          |
| POST   | `/refresh`             | Issue new access token from refresh cookie                         |
| GET    | `/me`                  | Return authenticated user profile                                  |
| POST   | `/verify-email`        | Verify email with token from email link                            |

### Wallets — `/api/wallets`

| Method | Endpoint                      | Description                                                          |
|--------|-------------------------------|----------------------------------------------------------------------|
| GET    | `/`                           | All 4 wallets with current balances                                  |
| POST   | `/deposit`                    | Deposit via Anchor, trigger auto-split into 4 wallets                |
| POST   | `/transfer`                   | Transfer between wallets — `reason` field required                   |
| POST   | `/emergency/unlock`           | Request emergency unlock — requires confirmation step                |

### Transactions — `/api/transactions`

| Method | Endpoint              | Description                                            |
|--------|-----------------------|--------------------------------------------------------|
| GET    | `/`                   | All transactions (paginated, 20 per page)              |
| GET    | `/:walletId`          | Transactions for a specific wallet                     |

### Goals — `/api/goals`

| Method | Endpoint    | Description                              |
|--------|-------------|------------------------------------------|
| GET    | `/`         | All savings goals for user               |
| POST   | `/`         | Create new savings goal                  |
| PATCH  | `/:id`      | Update goal title, target, deadline      |
| DELETE | `/:id`      | Delete goal                              |

### Waitlist — `/api/waitlist`

| Method | Endpoint    | Description                                              |
|--------|-------------|----------------------------------------------------------|
| POST   | `/`         | Add email to waitlist, send confirmation email           |
| GET    | `/count`    | Public — returns total waitlist count                    |

### Response Shape

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "error": null
}
```

---

## Authentication

### JWT Strategy

- **Access token** — 15-minute expiry, sent in `Authorization` header as `Bearer <token>`
- **Refresh token** — 7-day expiry, stored in `httpOnly` cookie (not accessible to JavaScript)
- On every protected request: verify access token → if expired, call `/api/auth/refresh` → retry request
- Axios interceptor on the frontend handles token refresh automatically

> ⚠️ Store the access token in **memory (Zustand) or `sessionStorage`** — never `localStorage`. The refresh token stays in `httpOnly` cookie only.

### Password Rules

- Minimum 8 characters
- Hashed with `bcrypt`, `saltRounds: 12`
- Never stored as plain text, never logged
- Forgot password: generate secure random token, store hashed version, email link with raw token

### KYC Tiers

| Tier   | Requirements        | Limit              | Notes                          |
|--------|---------------------|--------------------|--------------------------------|
| Tier 1 | Phone + email       | Basic transactions | Signup only; no transfers above ₦50k |
| Tier 2 | BVN verification    | Up to ₦500k/month  | Required before withdrawals    |
| Tier 3 | BVN + NIN           | Above ₦500k/month  | High-volume users only         |

---

## Anchor BaaS Integration

### What Anchor Handles

- Virtual account creation — every user gets a dedicated Nigerian bank account number
- Deposit detection — webhook fired when money lands
- P2P transfers between accounts
- KYC verification (Tier 1–3)
- CBN regulatory compliance and reporting

### What PocketWise Handles on Top

- **Auto-split logic** — when Anchor deposit webhook fires, PocketWise splits 70/30/10/10
- **Reason enforcement** — transfer endpoint requires a `reason` field before calling Anchor
- **Emergency lock** — check wallet lock status in PocketWise DB before any Anchor call
- **Transaction history UI** — read from PocketWise DB (which mirrors Anchor data)

### Webhook Flow

```
POST /api/webhooks/anchor/deposit
  │
  ├── 1. Verify webhook signature with Anchor secret
  ├── 2. Find user by account number
  ├── 3. Calculate split amounts (70/30/10/10, remainder to Flex)
  ├── 4. Open DB transaction
  ├── 5. Credit all 4 wallet rows atomically
  ├── 6. If any step fails → rollback entire transaction
  └── 7. Send push notification to user
```

> ⚠️ Start all Anchor work in **sandbox mode**. Do not use production credentials until full testing is complete.

---

## Auto-Split Logic

### `calculateSplit(amount)` — Frontend (`lib/utils.ts`)

```typescript
function calculateSplit(amount: number): { spend: number; savings: number; emergency: number; flex: number } {
  const spend = Math.floor(amount * 0.70 * 100) / 100;
  const savings = Math.floor(amount * 0.30 * 100) / 100;
  const emergency = Math.floor(amount * 0.10 * 100) / 100;
  const flex = amount - spend - savings - emergency; // remainder always goes to flex
  return { spend, savings, emergency, flex };
}
```

### `calculateSplit(amount)` — Backend (`services/split.service.ts`)

- Same logic as frontend but using `Decimal` precision (via Prisma's Decimal type)
- **Assert in tests**: the sum of all 4 amounts must always equal the original deposit amount exactly

---

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ANCHOR_API_KEY=
ANCHOR_WEBHOOK_SECRET=
RESEND_API_KEY=
TERMII_API_KEY=
CLOUDINARY_URL=
SENTRY_DSN=
NODE_ENV=development
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Build Phases

### Phase 1 — Auth & Onboarding *(Weeks 1–2)*
- Coming Soon page with waitlist email capture
- Landing page (all 3 breakpoints)
- Onboarding slides (3 screens)
- Signup and Login forms with Zod validation
- Post-signup wallet setup flow
- Wallet home screen with mock data
- Backend: `POST /api/waitlist`, `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- Connect auth screens to real API; JWT middleware on all `/dashboard` routes

### Phase 2 — Core Wallet *(Weeks 3–4)*
- Anchor sandbox account setup
- Virtual account creation on signup
- Deposit webhook handler with auto-split logic
- `GET /api/wallets` endpoint
- Transaction history screen
- Transfer screen with reason requirement
- Emergency wallet lock UI and override flow

### Phase 3 — Goals & Coach *(Weeks 5–6)*
- Savings goals CRUD
- Auto-contribute from Savings wallet to goals
- AI Money Coach — weekly cron job for insight generation
- Weekly summary screen
- Push notifications for deposits and weekly summaries

### Phase 4 — KYC & Live Money *(Weeks 7–8)*
- Anchor KYC integration — Tier 1 on signup, Tier 2 before withdrawals
- Move Anchor from sandbox to production
- Transaction fee logic (0.5–1% above ₦1,000)
- Sentry error monitoring setup
- Performance audit and optimization

### Phase 5 — Beta & Polish *(Weeks 9–10)*
- Beta test with 10–20 real users (UNILAG, UI, FUTO)
- A/B test 70/30/10/10 split ratio with real behavior data
- Bug fixes from beta feedback
- Referral system — `POST /api/referrals`, ₦100 wallet credit per successful referral
- React Native evaluation for mobile app post-MVP

---

## Coding Standards

### General

- TypeScript **strict mode** on both frontend and backend
- No `any` types — define proper interfaces for everything
- All errors handled — no silent failures, no unhandled promises
- Environment variables in `.env` — **never hardcode secrets**
- Git: feature branches off `dev`, PR into `dev`, `dev` merges into `main` for releases

### Frontend

- `'use client'` only when necessary — prefer Server Components where possible
- All forms: **React Hook Form + Zod validation**
- Loading and error states for every async operation — no blank screens
- Mobile-first CSS — base styles for 390px, use `lg:` for desktop overrides
- No inline styles except for dynamic values (progress bar widths, wallet colors)
- All money displayed with `formatNaira()` utility — **never format manually**

### Backend

- All routes have **Zod validation middleware** before hitting the controller
- Controllers are thin — business logic lives in **services**
- All DB operations go through **Prisma** — no raw SQL except for reporting queries
- All financial operations use **DB transactions** for atomicity
- Rate limiting on all auth endpoints — max 5 failed attempts per 15 minutes
- Log all requests with `morgan`, all errors with `Sentry`
- **Never log sensitive data** — no passwords, tokens, BVN, or NIN in logs

---

## Design System

### Color Palette

| Token             | Hex       | Usage                                  |
|-------------------|-----------|----------------------------------------|
| Primary           | `#5B4FCF` | Buttons, links, active states          |
| Primary Light     | `#EDE9FF` | Icon backgrounds, badge fills          |
| Primary Dark      | `#4338A8` | Button hover states                    |
| Background        | `#F9F9FB` | Page background                        |
| Surface           | `#FFFFFF` | Cards, modals, inputs                  |
| Border            | `#E5E7EB` | Dividers, card borders, input borders  |
| Text Primary      | `#0F0F1A` | Headings and body text                 |
| Text Secondary    | `#6B7280` | Labels, captions, placeholders         |
| Spend (Orange)    | `#F97316` | Spend wallet only                      |
| Savings (Green)   | `#22C55E` | Savings wallet only                    |
| Emergency (Red)   | `#EF4444` | Emergency wallet only                  |
| Flex (Blue)       | `#3B82F6` | Flex wallet only                       |
| Warning           | `#F59E0B` | Warnings, low balance alerts           |

### Typography

| Role            | Font             | Weight       | Usage                                  |
|-----------------|------------------|--------------|----------------------------------------|
| Display / Hero  | Plus Jakarta Sans | 700 Bold    | Hero headlines, landing page           |
| Heading 1       | Plus Jakarta Sans | 700 Bold    | Screen titles                          |
| Heading 2       | Plus Jakarta Sans | 600 SemiBold| Section headings                       |
| Body            | Inter            | 400 Regular  | All body text, descriptions            |
| Body Strong     | Inter            | 600 SemiBold | Labels, emphasized text                |
| Caption         | Inter            | 400 Regular  | Timestamps, helper text                |
| Balance Display | Plus Jakarta Sans | 700 Bold    | Large money amounts — 48px, -1px tracking |

### Spacing & Borders

- **8px base grid** — all spacing is multiples of 8: `8, 16, 24, 32, 48, 64, 80`
- Screen padding (mobile): `16px` horizontal
- Border radius: buttons `12px`, cards `16px`, inputs `10px`, modals `20px` (top), pills `9999px`

---

## Success Metrics

### Retention Targets

| Metric                        | Target  | Why It Matters                          |
|-------------------------------|---------|-----------------------------------------|
| Day-7 return rate             | 60%     | Signals habit formation in first week   |
| Week-2 retention              | 40%     | Industry benchmark for fintech apps     |
| Month-1 retention             | 30%     | Threshold for sustainable growth        |
| Deposits per user per week    | 2+      | Active engagement signal                |
| Savings goal completion (90d) | 25%     | Proves behavioral change                |
| Emergency override rate       | < 15%   | Measures discipline effectiveness       |

### Business Targets

- **LTV:CAC ratio** — payback period under 3 months
- **Transaction fee revenue** — positive unit economics by 200 active users
- **Pro conversion rate** — 10% of active users at 500+ user milestone
- **Referral-driven acquisition** — 30% of new users from referral program

---

## Monetization

### Phase 1 — Free *(Launch → 500 users)*
All core features free. Revenue from transaction fees only (0.5–1% above ₦1,000).

### Phase 2 — PocketWise Pro *(500–1,000 active users)*
₦500–₦1,000/month. Pro adds:
- Unlimited savings goals (free tier: 2 max)
- Custom split percentages
- Advanced analytics (6-month trends, category breakdowns)
- Priority AI Coach messages
- Export financial reports as PDF

### Phase 3 — Scale *(Post-1,000 users)*
- Referral program — ₦100 wallet credit per successful referral
- University campus ambassador program (UNILAG, UI, FUTO, ABU)
- Interest-bearing savings via money market fund partnerships

---

## Risks & Contingency

| Risk                       | Likelihood | Mitigation                                                      |
|----------------------------|------------|-----------------------------------------------------------------|
| Anchor integration delay   | Medium     | Start sandbox testing in Week 1; Paystack as fallback           |
| Build timeline slips 2+ weeks | Medium  | Launch waitlist page immediately; delay app, not marketing      |
| Low beta engagement        | Low        | Personal outreach to 20 friends/classmates before public launch |
| Split ratio wrong for users | Medium    | A/B test in beta; Pro users can customize                       |
| CBN regulatory change      | Low        | Anchor absorbs regulatory risk; monitor CBN circulars quarterly |

**Post-launch contingency:**
- If retention < 20% at Week 2 → run user interviews with first 50 users before building anything new
- If transaction fees < ₦50k/month at 500 users → revisit fee structure and Pro tier timing
- If Anchor proves too slow → ship with Paystack virtual accounts as a temporary bridge

---

*PocketWise — Building the financial backbone of Nigerian youth.*

> Document last updated: March 2026 | Version 2.0


## Next.js Frontend Framework

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
