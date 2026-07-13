# PocketWise API

Express 5 REST API powering PocketWise — handles auth, wallet management, transactions, savings goals, Anchor BaaS webhooks, and internal cron jobs.

Base URL: `http://localhost:1000` (dev) | `https://[your-domain].vercel.app` (prod)

---

## Tech Stack

| Technology        | Purpose                                    |
| ----------------- | ------------------------------------------ |
| Express 5         | API framework                              |
| TypeScript 5      | Type safety                                |
| Prisma 6          | ORM + migrations                           |
| PostgreSQL (Neon) | Primary database                           |
| Upstash Redis     | Rate limiting / cache                      |
| JWT               | Access + refresh token auth                |
| bcrypt            | Password hashing                           |
| Zod               | Request validation                         |
| Helmet            | Security headers                           |
| Sentry            | Error monitoring                           |
| Cloudinary        | Profile image uploads                      |
| Resend            | Transactional email                        |
| BulkSMS Nigeria   | SMS (OTP, alerts)                          |
| Firebase Admin    | Push notifications (FCM)                   |
| Anchor BaaS       | Virtual accounts, deposits, transfers, KYC |

---

## API Reference

All responses follow this shape:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "error": null
}
```

### Auth — `/api/v1/auth`

| Method | Endpoint           | Auth   | Rate Limit     | Description                                 |
| ------ | ------------------ | ------ | -------------- | ------------------------------------------- |
| POST   | `/signup`          | No     | 3/min per IP   | Create account, initialize 4 wallets        |
| POST   | `/login`           | No     | 5/min per IP   | Return access token (15m) + refresh cookie  |
| POST   | `/refresh`         | Cookie | 10/min per IP  | Issue new access token from refresh cookie  |
| POST   | `/logout`          | Cookie | 30/min per IP  | Clear refresh cookie                        |
| GET    | `/me`              | JWT    | 30/min per IP  | Authenticated user profile                  |
| GET    | `/lookup`          | JWT    | 30/min per IP  | Lookup user by email/username               |
| PATCH  | `/goal`            | JWT    | 30/min per IP  | Update primary financial goal               |
| POST   | `/setup-pin`       | JWT    | 5/min per user | Set transfer PIN                            |
| POST   | `/change-pin`      | JWT    | 5/min per user | Change transfer PIN                         |
| POST   | `/fcm-token`       | JWT    | —              | Register Firebase Cloud Messaging token     |
| POST   | `/forgot-password` | No     | 3/min per IP   | Send OTP for password reset                 |
| POST   | `/verify-otp`      | No     | 5/min per IP   | Verify OTP and get reset token              |
| POST   | `/reset-password`  | No     | 3/min per IP   | Reset password with verified token          |
| POST   | `/forgot-pin`      | JWT    | 3/min per IP   | Send OTP for PIN reset                      |
| POST   | `/verify-pin-otp`  | JWT    | 5/min per IP   | Verify OTP for PIN reset                    |
| POST   | `/reset-pin`       | JWT    | 3/min per IP   | Reset transfer PIN with verified token      |
| PATCH  | `/profile`         | JWT    | —              | Update profile (name, phone, etc.)          |
| POST   | `/change-password` | JWT    | 5/min per user | Change password (requires current password) |
| POST   | `/upload-avatar`   | JWT    | 5/min per user | Upload profile image to Cloudinary          |

### Wallets — `/api/v1/wallets`

| Method | Endpoint    | Auth | Rate Limit      | Description                                       |
| ------ | ----------- | ---- | --------------- | ------------------------------------------------- |
| GET    | `/`         | JWT  | —               | All 4 wallets with balances                       |
| POST   | `/transfer` | JWT  | 10/min per user | Wallet-to-wallet transfer (reason + PIN required) |
| POST   | `/`         | JWT  | 10/min per user | Bank transfer (PIN required)                      |

### Internal Transfers — `/api/v1/wallets/internal-transfer`

| Method | Endpoint | Auth | Rate Limit      | Description                                 |
| ------ | -------- | ---- | --------------- | ------------------------------------------- |
| POST   | `/`      | JWT  | 10/min per user | Transfer between own wallets (PIN required) |

### Bank Transfers — `/api/v1/transfers/bank`

| Method | Endpoint | Auth | Rate Limit      | Description                                      |
| ------ | -------- | ---- | --------------- | ------------------------------------------------ |
| POST   | `/`      | JWT  | 10/min per user | Transfer to external bank account (PIN required) |

### Bank Recipients — `/api/v1/wallets/recent-recipients`

| Method | Endpoint | Auth | Description                          |
| ------ | -------- | ---- | ------------------------------------ |
| GET    | `/`      | JWT  | List recent bank transfer recipients |
| POST   | `/`      | JWT  | Save a new bank recipient            |

### P2P Recipients — `/api/v1/wallets/recent-p2p-recipients`

| Method | Endpoint | Auth | Description                |
| ------ | -------- | ---- | -------------------------- |
| GET    | `/`      | JWT  | List recent P2P recipients |
| POST   | `/`      | JWT  | Save a new P2P recipient   |

### Emergency Unlock — `/api/v1/wallets/emergency-unlock`

| Method | Endpoint   | Auth | Rate Limit     | Description                                             |
| ------ | ---------- | ---- | -------------- | ------------------------------------------------------- |
| POST   | `/request` | JWT  | 3/min per user | Request emergency wallet unlock (reason + 24h cooldown) |
| GET    | `/status`  | JWT  | —              | Check emergency unlock request status                   |

### Webhooks — `/api/v1/webhooks`

| Method | Endpoint          | Auth      | Rate Limit     | Description                              |
| ------ | ----------------- | --------- | -------------- | ---------------------------------------- |
| POST   | `/anchor/deposit` | Signature | 100/min per IP | Anchor deposit notification → auto-split |

### Transactions — `/api/v1/transactions`

| Method | Endpoint | Auth | Description                             |
| ------ | -------- | ---- | --------------------------------------- |
| GET    | `/`      | JWT  | Paginated transaction history (20/page) |

### Savings Goals — `/api/v1/savings-goals`

| Method | Endpoint          | Auth | Rate Limit      | Description                            |
| ------ | ----------------- | ---- | --------------- | -------------------------------------- |
| POST   | `/`               | JWT  | 10/min per user | Create new savings goal                |
| GET    | `/`               | JWT  | —               | List all active goals                  |
| PATCH  | `/:goalId`        | JWT  | —               | Update goal (title, target, deadline)  |
| DELETE | `/:goalId`        | JWT  | —               | Soft-delete a goal                     |
| GET    | `/unallocated`    | JWT  | —               | Unallocated savings balance            |
| POST   | `/:id/contribute` | JWT  | 10/min per user | Contribute from savings wallet to goal |
| POST   | `/:id/complete`   | JWT  | —               | Mark goal as completed                 |

### Wallet Split Config — `/api/v1/wallet-split`

| Method | Endpoint | Auth | Description                   |
| ------ | -------- | ---- | ----------------------------- |
| GET    | `/`      | JWT  | Get current split percentages |
| POST   | `/`      | JWT  | Set custom split percentages  |
| PATCH  | `/`      | JWT  | Update split percentages      |

### Notifications — `/api/v1/notifications`

| Method | Endpoint    | Auth | Description                    |
| ------ | ----------- | ---- | ------------------------------ |
| GET    | `/`         | JWT  | List notifications (paginated) |
| PATCH  | `/:id/read` | JWT  | Mark notification as read      |

### Waitlist — `/api/v1/waitlist`

| Method | Endpoint | Description                   |
| ------ | -------- | ----------------------------- |
| POST   | `/`      | Add email to waitlist         |
| GET    | `/count` | Public — total waitlist count |

### Health

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | `/`              | Welcome message |
| GET    | `/api/v1/health` | Health check    |

### Internal Cron Endpoints — `/api/internal`

These are protected by `Keep-Alive-Auth` header (matching `KEEP_ALIVE_SECRET` env var) and rate-limited.

| Method | Endpoint           | Schedule     | Description                                      |
| ------ | ------------------ | ------------ | ------------------------------------------------ |
| GET    | `/keep-alive`      | Every 14 min | Prevent Vercel cold starts                       |
| GET    | `/auto-contribute` | Weekly       | Move weeklyAmount from savings into active goals |
| POST   | `/complete-goals`  | Weekly       | Auto-complete goals past deadline                |
| GET    | `/weekly-summary`  | Weekly       | Generate + push weekly summaries via FCM         |

---

## Project Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma        # Database schema (14 models)
│   └── migrations/          # Migration files
├── src/
│   ├── server.ts            # Entry point — Express app setup
│   ├── routes/              # Route definitions (13 files)
│   ├── controller/          # Request handlers (14 files)
│   ├── services/            # Business logic (13 files)
│   ├── middleware/           # Auth, validation, rate-limit, error, PIN
│   ├── schemas/             # Zod validation schemas
│   ├── validators/          # Transfer, emergency unlock validators
│   ├── features/
│   │   └── notifications/   # Notification service + routes
│   ├── helper/              # Wallet helpers, summary builders
│   ├── lib/                 # Prisma client, Firebase, Cloudinary
│   ├── config/              # App configuration
│   ├── types/               # TypeScript types
│   ├── utils/               # Response helpers, utilities
│   └── generated/           # Generated types
├── api/
│   └── index.ts             # Vercel serverless entry point
├── tsconfig.json
└── vercel.json
```

---

## Database Schema

14 models managed via Prisma ORM. Key tables:

| Table                       | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `users`                     | Core user data, KYC tier, auth fields             |
| `wallets`                   | 4 wallets per user (spend/savings/emergency/flex) |
| `transactions`              | Immutable transaction log                         |
| `savings_goals`             | Goals with target, deadline, auto-contribute      |
| `ai_insights`               | Weekly AI coach summaries                         |
| `referrals`                 | Referral tracking with credit                     |
| `kyc_records`               | KYC verification (BVN, NIN hashes)                |
| `wallet_split_configs`      | Per-user custom split percentages                 |
| `notifications`             | In-app notification history                       |
| `bank_recipients`           | Saved external bank accounts                      |
| `p2p_recipients`            | Saved P2P recipients                              |
| `emergency_unlock_requests` | Emergency wallet unlock requests                  |
| `waitlist`                  | Pre-launch email signups                          |

**Financial data rules:**

- All money stored as `DECIMAL(12,2)` — never `Float` or `Int`
- Transaction rows are **IMMUTABLE** — never `UPDATE`, only `INSERT`
- Every deposit triggers exactly 4 split transaction rows atomically (wrapped in a DB transaction)
- Wallet balance is always derived from the transaction log

---

## Auto-Split Logic

Default split: **50% Spend / 30% Savings / 10% Emergency / 10% Flex**.

Each wallet percentage is rounded down to 2 decimal places; the remainder (due to rounding) is always assigned to Flex so the total equals the deposit amount exactly.

Users can customize their split percentages via `POST /api/v1/wallet-split` (stored in `wallet_split_configs`).

---

## Auth Flow

- **Access token** — 15-minute expiry, sent in `Authorization: Bearer <token>`
- **Refresh token** — 7-day expiry, stored in `httpOnly` cookie (not JS-accessible)
- **Token refresh** — Axios interceptor on frontend automatically calls `/refresh` when access token expires
- **Passwords** — hashed with bcrypt, `saltRounds: 12`
- **Rate limiting** — strict limits on auth endpoints (3–5 attempts per window)

### KYC Tiers

| Tier   | Requirements     | Notes                       |
| ------ | ---------------- | --------------------------- |
| Tier 1 | Phone + email    | Signup default              |
| Tier 2 | NIN verification | Required before withdrawals |
| Tier 3 | BVN + NIN        | High-volume users           |

---

## Anchor BaaS Integration

Anchor handles virtual account creation, deposit detection, P2P transfers, and KYC.

### Webhook Flow

```
POST /api/v1/webhooks/anchor/deposit
  │
  ├── 1. Verify webhook signature (Anchor secret)
  ├── 2. Find user by account number
  ├── 3. Calculate split amounts (50/30/10/10 or custom)
  ├── 4. Open DB transaction
  ├── 5. Credit all 4 wallets atomically
  ├── 6. If any step fails → rollback entire transaction
  └── 7. Send push notification
```

> ⚠️ Start all Anchor work in **sandbox mode**. Do not use production credentials until full testing is complete.

---

## Cron Jobs

These endpoints are designed to be called by [cron-job.org](https://cron-job.org) (or any scheduler) and are protected by the `Keep-Alive-Auth` header.

| Endpoint                        | Recommended Schedule           | Purpose                                                                                    |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `/api/internal/keep-alive`      | Every 14 minutes               | Prevents Vercel cold starts                                                                |
| `/api/internal/auto-contribute` | Weekly (before weekly-summary) | Moves weeklyAmount from unallocated savings into each goal where autoContribute is enabled |
| `/api/internal/complete-goals`  | Weekly                         | Checks and auto-completes goals past their deadline                                        |
| `/api/internal/weekly-summary`  | Weekly                         | Generates spending summary per user and pushes via FCM                                     |

---

## Local Development

```bash
# Terminal 1 — start the API
cd apps/api
npm run dev
# → http://localhost:1000 (hot reload via tsx)
```

```bash
# Build for production
npm run build
# → compiles TypeScript to dist/
```

---

## Environment Variables

| Variable                | Required | Description                          |
| ----------------------- | -------- | ------------------------------------ |
| `PORT`                  | Yes      | Server port (default: 1000)          |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string         |
| `DIRECT_URL`            | No       | Direct DB URL (bypasses pgBouncer)   |
| `JWT_ACCESS_SECRET`     | Yes      | Access token signing secret          |
| `JWT_REFRESH_SECRET`    | Yes      | Refresh token signing secret         |
| `ANCHOR_API_KEY`        | Yes      | Anchor BaaS API key                  |
| `ANCHOR_WEBHOOK_SECRET` | Yes      | Anchor webhook signature secret      |
| `RESEND_API_KEY`        | Yes      | Transactional email API key          |
| `BULKSMS_API_KEY`       | Yes      | SMS API key                          |
| `BULKSMS_SENDER_ID`     | Yes      | SMS sender ID                        |
| `CLOUDINARY_URL`        | No       | Image upload cloud                   |
| `SENTRY_DSN`            | No       | Error monitoring                     |
| `FRONTEND_URL`          | Yes      | CORS origin for frontend             |
| `MOBILE_URL`            | No       | CORS origin for mobile app           |
| `FIREBASE_TYPE`         | Yes      | Firebase Admin SDK (service account) |
| `FIREBASE_PROJECT_ID`   | Yes      | Firebase project ID                  |
| `FIREBASE_PRIVATE_KEY`  | Yes      | Firebase private key                 |
| `FIREBASE_CLIENT_EMAIL` | Yes      | Firebase client email                |
| `UPSTASH_REDIS_URL`     | No       | Redis connection for rate limiting   |
| `KEEP_ALIVE_SECRET`     | Yes      | Auth for internal cron endpoints     |
| `NODE_ENV`              | No       | Environment (development/production) |
