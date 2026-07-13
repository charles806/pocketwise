# PocketWise Web

Next.js 16 frontend for PocketWise — the user-facing wallet dashboard, onboarding, and account management.

---

## Tech Stack

| Technology           | Purpose                       |
| -------------------- | ----------------------------- |
| Next.js 16           | App Router, server components |
| React 19             | UI library                    |
| TypeScript 5         | Type safety                   |
| Tailwind CSS v4      | Utility-first styling         |
| Framer Motion        | Animations                    |
| Lucide React         | Icons (only icon library)     |
| TanStack React Query | Server state & caching        |
| Zustand              | Global state (auth)           |
| Firebase SDK         | Push notifications (FCM)      |

---

## Routes

| Route                     | Description                            |
| ------------------------- | -------------------------------------- |
| `/`                       | Landing page                           |
| `/login`                  | Sign in                                |
| `/register`               | Create account                         |
| `/onboarding`             | Multi-step pre-signup wizard           |
| `/forgot-password`        | Password reset                         |
| `/wallet`                 | Dashboard — 4 wallet balances, actions |
| `/wallet/transfer`        | Transfer hub                           |
| `/wallet/transfer/bank`   | Bank transfer                          |
| `/wallet/transfer/p2p`    | Peer-to-peer transfer                  |
| `/wallet/transfer/wallet` | Internal wallet-to-wallet transfer     |
| `/transactions`           | Transaction history                    |
| `/goals`                  | Savings goals list                     |
| `/goals/create`           | Create a new savings goal              |
| `/notifications`          | In-app notification history            |
| `/profile`                | Profile & settings                     |
| `/profile/change-pin`     | Change transfer PIN                    |
| `/profile/forgot-pin`     | Reset transfer PIN                     |
| `/admin`                  | Admin panel                            |
| `/waitlist`               | Coming soon email signup               |

---

## Project Structure

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/    # Password reset flow
│   │   ├── login/              # Sign-in page
│   │   ├── onboarding/         # Pre-signup slides + setup
│   │   └── register/           # Sign-up page
│   ├── (dashboard)/
│   │   ├── goals/              # Savings goals CRUD
│   │   ├── notifications/      # In-app notifications
│   │   ├── profile/            # Profile, PIN, settings
│   │   ├── transactions/       # Transaction history
│   │   └── wallet/             # Wallet dashboard + transfers
│   ├── admin/                  # Admin panel
│   ├── waitlist/               # Coming soon
│   ├── firebase-messaging-sw/  # FCM service worker
│   ├── layout.tsx              # Root layout (SEO, metadata, providers)
│   ├── providers.tsx           # Query client, theme providers
│   └── globals.css             # Global Tailwind styles
├── components/
│   ├── UI/                     # Reusable UI primitives
│   ├── Layout/                 # Navbar, BottomNav, etc.
│   ├── Sections/               # Page-specific sections
│   ├── AutoContributeModal.tsx
│   ├── ConfirmCompleteModal.tsx
│   ├── ContributeToGoalModal.tsx
│   └── TransactionDetailModal.tsx
├── context/
│   ├── AuthContext.tsx          # Auth state (React Context)
│   └── ToastContext.tsx         # Toast notifications
├── hooks/
│   ├── useFcmToken.ts           # FCM token registration
│   └── useWallet.ts             # Wallet data fetching
├── libs/
│   ├── utils.ts                 # formatNaira, helpers
│   ├── validation.ts            # Zod schemas
│   ├── animations.ts            # Framer Motion variants
│   ├── firebase-client.ts       # Firebase client init
│   └── navLinks.ts              # Navigation config
└── public/                      # Static assets (images, manifest)
```

---

## Key Flows

### Onboarding → Auth → Wallet

1. User lands on `/onboarding` (3-step intro)
2. Signs up at `/register` → API creates user + 4 wallets
3. Sets up transfer PIN
4. Redirected to `/wallet` dashboard

### Auto-Split

Every deposit triggers the default **50/30/10/10** split (configurable per user in settings). Each wallet shows its balance, allocation percentage, and a progress bar.

### Reason-Required Transfers

Any transfer between wallets requires a text reason — enforced at the API level. The UI shows a reason input before confirming.

### Emergency Unlock

The Emergency wallet is locked by default. Tapping it opens a request flow with a reason prompt and cooldown timer.

---

## Local Development

```bash
npm run dev
```

Opens at http://localhost:3000. Requires the API running on port 1000.

---

## Environment Variables

| Variable                  | Description            |
| ------------------------- | ---------------------- |
| `NEXT_PUBLIC_BACKEND_URL` | API base URL           |
| `NEXT_PUBLIC_SENTRY_DSN`  | Error monitoring       |
| `NEXT_PUBLIC_FIREBASE_*`  | Firebase client config |
