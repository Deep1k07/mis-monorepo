# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MIS (Management Information System) is a full-stack monorepo for managing certification bodies, business associates, entities, and certificate generation workflows. It uses **pnpm workspaces** + **Turborepo** for orchestration.

## Monorepo Structure

- **apps/backend** — NestJS 11 REST API (port 3003), MongoDB via Mongoose, JWT auth
- **apps/web** — Next.js 16 frontend (port 3002), React 19, App Router
- **packages/eslint-config** — Shared ESLint flat configs (base, next-js, react-internal)
- **packages/typescript-config** — Shared tsconfig presets
- **packages/ui** — Shared React component library (shadcn/ui based)

## Commands

```bash
# Root (runs across all packages via Turborepo)
pnpm dev                          # Start all apps in watch mode
pnpm build                        # Build all apps/packages
pnpm lint                         # Lint all
pnpm format                       # Prettier on all TS/TSX/MD files
pnpm check-types                  # TypeScript check all

# Backend
pnpm --filter backend dev         # NestJS watch mode
pnpm --filter backend test        # Run Jest tests
pnpm --filter backend test:watch  # Jest in watch mode
pnpm --filter backend test:cov    # Jest with coverage
pnpm --filter backend test:e2e    # E2E tests (test/jest-e2e.json config)
pnpm --filter backend seed:permissions  # Seed RBAC permissions

# Web
pnpm --filter web dev             # Next.js dev server on :3002
pnpm --filter web build           # Production build
pnpm --filter web lint            # ESLint (zero warnings enforced)
pnpm --filter web check-types     # next typegen && tsc --noEmit
```

### Running a single backend test file

```bash
cd apps/backend && npx jest --testPathPattern='auth.service' --no-coverage
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend framework | NestJS 11 (Express) |
| Database | MongoDB (Mongoose 9) |
| Auth | JWT (`@nestjs/jwt`) + OTP (otplib) + bcryptjs |
| Email | Resend SDK |
| PDF generation | Puppeteer (HTML templates -> PDF) |
| API docs | Swagger at `/api-docs` |
| Frontend framework | Next.js 16 (App Router, React 19) |
| State management | Zustand (persisted to localStorage) |
| Data fetching | SWR (reads) + Axios (mutations) |
| Forms | react-hook-form + Zod validation |
| UI components | shadcn/ui (Radix UI + Tailwind CSS 4) |
| Tables | TanStack React Table |

## Architecture

### Backend (NestJS)

Each feature is a self-contained NestJS module: `controller -> service -> schema/dto`. Modules include: auth, user, entity, application, permission, role, ba (Business Associate), certificationbody, certificate, email, country.

- **Validation**: Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` — unknown fields are rejected
- **Auth guard**: `JwtAuthGuard` reads JWT from cookies or Authorization header. Apply with `@UseGuards(JwtAuthGuard)`
- **Events**: `EventEmitterModule` used for OTP email triggers (e.g., `user:login` event)
- **Swagger**: All endpoints decorated with `@ApiTags`, `@ApiCookieAuth`, `@ApiOperation`
- **Prettier**: singleQuote, trailingComma: all, tabWidth: 2

### Frontend (Next.js App Router)

- **Route groups**: `(auth)` for login, `(home)` for protected dashboard pages
- **Auth store**: `app/store/auth-store.ts` — Zustand with `persist` middleware, provides `hasPermission()` for RBAC checks
- **API calls**: `lib/api-fetch.ts` wraps `fetch` with `credentials: "include"` and auto-logout on 401. SWR hooks in `utils/apis.ts`, mutation functions in `utils/mutations.ts`
- **UI pattern**: Pages use `"use client"` directive, compose shadcn components from `@repo/ui` and local `app/components/`
- **Path aliases**: `@/*` maps to `apps/web/*`

### Permissions (RBAC)

Users have a role (ref to UserRole), roles have a `permissions[]` string array. Backend checks permissions in guards/services. Frontend checks via `useAuthStore().hasPermission('permission_name')`.

## Environment Variables

**Backend** (`apps/backend/.env`): `MONGO_URI`, `JWT_SECRET`, `PORT` (3003), `CLIENT_URL`, `NODE_ENV`, `EMAIL_DEV`, `EMAIL_PROD`, `RESEND_API_KEY`

**Web** (`apps/web/.env.local`): `NEXT_PUBLIC_BACKEND_URL` (default http://localhost:3003) — baked at build time

## Docker

`docker compose up --build` starts MongoDB (27017), backend (3003), and web (3002). See `DOCKER.md` for details. After first run, seed permissions: `docker compose exec backend node dist/permission/seed-permissions.js`

## Pre-commit Hooks

Husky + lint-staged runs on commit: ESLint `--fix` and Prettier on `*.{ts,tsx}`, Prettier on `*.{md,json}`.

## Testing

Backend uses Jest with ts-jest. Test files: `**/*.spec.ts` under `apps/backend/src/`. Module alias `src/*` is mapped in Jest config. Frontend has no test runner configured — verify with type checking and manual browser testing.
