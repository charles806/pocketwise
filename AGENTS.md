# AGENTS.md

This file provides context for agents working in this repository.

## Project Overview

- **Name**: Pocketwise
- **Type**: Monorepo with Turbo
- **Node**: >=18, npm@11.7.0
- **Apps**: `apps/web` (Next.js), `apps/api` (Express)

## Commands

### Root (run from project root)

```bash
npm run build        # Build all apps/packages
npm run dev          # Run all apps in dev mode
npm run lint         # Lint all apps
npm run format       # Format code with Prettier
npm run check-types  # Type-check all apps
```

### Web App (`apps/web/`)

```bash
npm run dev          # Next.js dev on port 3000
npm run build        # Next.js build
npm run lint         # ESLint with max-warnings 0
npm run check-types  # Run next typegen && tsc --noEmit
```

### API (`apps/api/`)

```bash
npm run dev          # nodemon + tsx (watch mode)
npm run build        # TypeScript compile to dist/
npm run start        # Run compiled server
```

### Testing

- No test framework currently configured
- No `.test.ts`, `.spec.ts`, or `__tests__/` directories exist
- To add tests, consider: Vitest, Jest, or React Testing Library

## Code Style

### TypeScript

- Strict mode enabled (`strict: true` in tsconfig)
- `noUncheckedIndexedAccess: true` - array access returns `T | undefined`
- `exactOptionalPropertyTypes: true` - optional props must be explicitly set to `undefined`
- Use explicit types over `any`; use `unknown` for generic fallbacks

### Imports

- ESM throughout (package.json has `"type": "module"`)
- Local imports require `.js` extension: `import { foo } from "./bar.js"`
- External imports omit extension: `import { NextResponse } from "next/server"`

### React Components

- Named exports only (no default exports)
- Props via interface/type, e.g.:
  ```tsx
  interface ButtonProps { title: string; onClick: () => void }
  export const Button = ({ title, onClick }: ButtonProps) => ...
  ```
- Use `function` declarations for pages/routes

### Express Controllers

- Use try/catch in handlers; delegate errors to middleware
- Extract status code from error: `(error as any)?.statusCode || 500`
- Use response utilities:
  ```ts
  sendSuccess(res, "message", data, statusCode);
  sendError(res, "message", statusCode);
  ```

### Naming

- **Files**: kebab-case or PascalCase (components: `Button.tsx`, utils: `auth.service.ts`)
- **Variables**: camelCase (`userId`, `isLoading`)
- **Types/Interfaces**: PascalCase (`UserResponse`, `AuthRequest`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)

### Formatting

- Prettier config: `prettier --write "**/*.{ts,tsx,md}"`
- Run `npm run format` before commits

### Linting

- ESLint flat config with typescript-eslint
- Web app uses `@repo/eslint-config/next-js`
- Run `npm run lint` (root) or `npm run lint` (per app)

### Error Handling

- Create custom error classes with `statusCode` property
- Use global error middleware for unhandled errors
- Always check `error instanceof Error` before accessing `.message`

## Directory Structure

```
apps/
├── web/                    # Next.js 16 (React 19)
│   ├── app/               # App router pages
│   │   ├── (auth)/        # Route group
│   │   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/        # React components
│   │   ├── UI/            # Reusable UI (Button, etc.)
│   │   ├── Layout/        # Header, Footer
│   │   └── Sections/      # Page sections
│   └── ...
└── api/                   # Express + Prisma + Zod
    └── src/
        ├── controller/    # Route handlers
        ├── routes/        # Express routers
        ├── services/      # Business logic
        ├── middleware/   # auth, validate, error
        ├── schemas/      # Zod validation schemas
        ├── lib/          # Prisma client, mail
        ├── types/        # TypeScript declarations
        └── utils/        # Response helpers

packages/
├── ui/                    # Shared UI components
├── eslint-config/         # ESLint configs
├── tailwind-config/      # Tailwind config
└── typescript-config/     # tsconfig bases
```

## Available Agent Skills

Custom skills exist in `.agents/skills/`. Load them when relevant:

- **emil-design-engineering** - UI polish, animations, design details
- **refactoring-ui** - Tailwind + shadcn/ui best practices
- **anthropic-frontend-design** - Production-grade frontend
- **web-design-guidelines** - Accessibility, best practices
- **hooked-ux** - Habit formation, engagement loops

Use the `skill` tool to load: `/skill emil-design-eng`, etc.

## Key Patterns

### API Response Helpers (`apps/api/src/utils/response.ts`)

```ts
sendSuccess(res, "Success", data, 200);
sendError(res, "Error message", 400);
```

### Auth Middleware

- Extracts `req.user` from JWT
- Returns 401 if unauthorized
- User ID available at `req.user.id`

### Zod Validation

- Use in routes: `validate(schema)` middleware
- Schemas in `src/schemas/`

## Gotchas

1. **API imports**: Add `.js` extension for local imports
2. **Array access**: Returns `T | undefined` due to `noUncheckedIndexedAccess`
3. **Optional props**: Must set to `undefined` explicitly, not omit
4. **Next.js**: Uses React 19, watch for strict mode issues
5. **Prisma**: Generate client before building API: `npx prisma generate`
