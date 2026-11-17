# GetPhysical: The Fitness Super App Ecosystem

**GetPhysical** is a B2B2C fitness ecosystem. We provide enterprise-grade, free operational software to physical gyms and sports clubs (**GymDash**, **Clubdash**, **CoachDash**, and **Organizer Pro**). By powering the facility's front desk, spatial court bookings, and access gates, we drive their consumer base to download the **Sodia** mobile app to gain physical entry, track workouts, and book services.

## Repository Map (Turborepo + pnpm)

This codebase is a strict Monorepo managed by Turborepo and `pnpm`. It separates the consumer mobile app, B2B administrative web dashboards, and shared core TypeScript logic into isolated workspaces.

```text
getphysical-AG-Demo/
├── AGENTS.md               # [CRITICAL] AI coding laws, 10-state rules & tech stack directives
├── README.md               # This map
├── package.json            # Root scripts: pnpm mobile, typecheck, test, db:test …
├── pnpm-workspace.yaml     # Workspaces (apps/*, packages/*) + install-script policy
├── turbo.json              # Turborepo pipeline
├── tsconfig.base.json      # Strict base TypeScript configuration
├── .github/workflows/      # CI: typecheck, unit + launch tests, web build, database tests
│
├── apps/
│   ├── mobile/             # Sodia — Expo (SDK 58) app: sign-in, feed, Discover, Cards, Track, Profile, role portals
│   └── web/                # Business Suite — Next.js: GymDash / Clubdash / CoachDash (deployed on Vercel from apps/web)
│
├── packages/
│   └── sodia-core/         # Shared TypeScript: DB types, column selectors, Zod schemas, 10-state types, TOTP, QR, fees
│
├── supabase/
│   ├── migrations/         # Database schema, multi-tenant RLS, ledger, payments, QR, events, geo
│   ├── functions/          # Edge functions: nutrition-parse, payments-checkout, webhooks (Maya, Xendit, Stripe)
│   ├── tests/              # Database test suites (pnpm db:test)
│   └── seed.sql            # Local development seed
│
└── docs/
    ├── specs/                          # Master architecture & 10-state flow matrices
    ├── BACKEND.md                      # Backend architecture, security model, deploy runbook
    ├── RUN_MOBILE.md                   # Run the app in Expo Go + troubleshooting
    ├── SOCIAL_SIGN_IN.md               # Google & Apple sign-in setup
    ├── EMAIL_AND_AUTH_LIMITS.md        # Resend + Supabase auth limits
    └── QA_PRODUCTION_READINESS_ASSESSMENT.md  # Original audit (2026-11-06 snapshot)
```

## Workspace Linking

Both `apps/mobile` and `apps/web` link directly to `sodia-core` via `"sodia-core": "workspace:*"` in their respective `package.json` files:

```ts
import {
   UIStateKind,
   createAsyncState,
   SODIA_FIELD_LIMITS,
   calculateHybridServiceFee,
} from "sodia-core";
```
