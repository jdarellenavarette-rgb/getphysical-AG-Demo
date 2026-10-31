# GetPhysical: The Fitness Super App Ecosystem

**GetPhysical** is a B2B2C fitness ecosystem. We provide enterprise-grade, free operational software to physical gyms and sports clubs (**GymDash**, **Clubdash**, **CoachDash**, and **Organizer Pro**). By powering the facility's front desk, spatial court bookings, and access gates, we drive their consumer base to download the **Sodia** mobile app to gain physical entry, track workouts, and book services.

## Repository Map (Turborepo + pnpm)

This codebase is a strict Monorepo managed by Turborepo and `pnpm`. It separates the consumer mobile app, B2B administrative web dashboards, and shared core TypeScript logic into isolated workspaces.

```text
getphysical-AG-Demo/
├── AGENTS.md               # [CRITICAL] Absolute AI coding laws, 10-state rules & tech stack directives
├── README.md               # Project architecture map
├── package.json            # Root Turborepo & pnpm scripts
├── pnpm-workspace.yaml     # Workspace definitions (apps/*, packages/*)
├── turbo.json              # Turborepo build, dev, lint & typecheck pipeline
├── tsconfig.base.json      # Strict base TypeScript configuration
│
├── apps/
│   ├── mobile/             # (Sodia) - Expo React Native app (B2C feed, Discover, Cards, Track, Profile + B2B Role Portals)
│   └── web/                # (GymDash / Clubdash / CoachDash) - Next.js App Router B2B administrative Web OS
│
├── packages/
│   └── sodia-core/         # Shared TypeScript package: DB schemas, explicit column selectors, 10-State machine types, Zod validators & constants
│
└── docs/
    └── specs/              # Consolidated Master Architecture, Resolved Open Decisions & 10-State User Flow Matrices
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
