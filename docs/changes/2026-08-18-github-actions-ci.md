# GitHub Actions — Monorepo CI

**Date:** 2026-08-18
**Type:** CI / Tooling
**Scope:** All apps (api, web, mobile)

---

## Summary

Adds a GitHub Actions workflow that runs lint, typecheck, and production builds for
every PR and for every push to `main`. Deployment is intentionally **not** handled
here — it continues to go through Vercel's Git integration, which auto-deploys on
push to `main`.

## Why

There was no CI. Nothing prevented broken/type-unsafe/lint-failing code from
landing on `main` and being auto-deployed to production by Vercel. The workflow is
the gate before merge (pair with branch protection requiring the `ci` job to pass).

## Technical Implementation

**New: `.github/workflows/ci.yml`**

- Triggers on `pull_request` and `push` to `main`; `concurrency` cancels stale runs
  for the same ref.
- `ubuntu-latest`, Node 22, `npm ci` (npm-bundled cache).
- Runs the three root scripts, which turbo scatters across the workspaces:
  - `npm run lint` → `turbo run lint` → **web** (`eslint --max-warnings 0`), **mobile** (`expo lint`) — run with `continue-on-error: true` (advisory, see below)
  - `npm run check-types` → `turbo run check-types` → **web** (`next typegen && tsc --noEmit`), **api**, **mobile** (`tsc --noEmit`)
  - `npm run build` → `turbo run build` → **web** (`next build`), **api** (`prisma generate && tsc`)
- Provides the public `NEXT_PUBLIC_FIREBASE_*` client values consumed by the
  Next.js build, and `NEXT_PUBLIC_BACKEND_URL` (secret-overridable, defaults to
  `https://api.pocketwise.xyz`). `SENTRY_AUTH_TOKEN` is passed from repository
  secrets for the Sentry webpack plugin.
- `timeout-minutes: 20` caps runaway builds.

### Lint is advisory (for now)

The committed codebase has pre-existing lint findings (web: 40 warnings under
`--max-warnings 0`; mobile: 10 errors + 16 warnings from `expo lint`), none caused
by this change. The lint step therefore uses `continue-on-error: true`: findings
are printed to the job log but do **not** fail the run. The hard CI gates are
`check-types` and `build`. Drop `continue-on-error` once the findings are fixed.

**Modified: `apps/api/package.json`**

- Added `"check-types": "tsc --noEmit"` so the API is typechecked as a first-class
  turbo task (previously `tsc` ran inside `build` only).

**Modified: `apps/mobile/package.json`**

- Added `"check-types": "tsc --noEmit"` — the Expo app previously had no
  typecheck at all (only `expo lint`). TypeScript is already a dev dependency.

## Required Setup (one-time)

1. Add `SENTRY_AUTH_TOKEN` to GitHub → Repository → Settings → **Secrets and
   variables → Actions** (value in `apps/web/.env`). Optionally add
   `NEXT_PUBLIC_BACKEND_URL` to override the default API URL.
2. (Recommended) Enable branch protection on `main` requiring the `ci` job to pass
   before merge.

## Database Changes

None.

## API Changes

None — scripts only.

## Breaking Changes

None. Developers publishing branches before this commit do not hit the workflow.

## Files/Modules Affected

| File                                | Change                                              |
| ----------------------------------- | --------------------------------------------------- |
| `.github/workflows/ci.yml`          | New CI workflow (lint, typecheck, build)            |
| `apps/api/package.json`             | Added `check-types` script                          |
| `apps/mobile/package.json`          | Added `check-types` script                          |
| `docs/changes/2026-08-18-internal-cron-jobs-fix.md` | Related earlier change (cron fix) |

## Manual Validation

- `npm run check-types` and `npm run build` pass locally (verified end-to-end).
- `npm run lint` is known to fail on pre-existing findings → lint is advisory in CI.
- After push, Actions page shows the `ci` job green on the commit.

## Known Limitations

- **Lint is advisory**, not a gate, until the pre-existing findings are cleaned up
  (web `--max-warnings 0` warnings + mobile `expo lint` errors). See "Lint is
  advisory" above.
- No remote turbo cache yet — each run rebuilds from scratch (add
  `TURBO_TOKEN`/`TURBO_TEAM` secrets for Vercel remote caching to speed this up).
- No unit/integration tests run (none exist in the repo).
- The workflow bakes in the Firebase project's public client identifiers; if the
  project keys rotate, the workflow must be updated (or moved to secrets).

## Follow-up Tasks

- Resolve the web + mobile lint findings, then drop `continue-on-error` from the
  lint step so it gates merges again.
- Turn on branch protection requiring `ci`.
- Optional: Vercel remote cache for turbo (`TURBO_TOKEN` + `TURBO_TEAM` secrets).