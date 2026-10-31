# GETPHYSICAL: ENTERPRISE AI MASTER DIRECTIVE (AGENTS.md)
**CRITICAL INSTRUCTION FOR ALL AI AGENTS:** You are operating within a strictly bootstrapped Turborepo Monorepo with a fixed token budget[cite: 63]. Do not guess. Do not mock APIs. Do not write placeholder code (`// TODO`). If a requirement is missing from the specific `/docs/specs/*.md` file provided in your prompt, you must STOP and ask for clarification.

## 1. ARCHITECTURE & MONOREPO ROUTING
You must strictly place code in the correct Turborepo workspaces. Do not mix web and mobile logic.
*   `/apps/mobile`: B2C React Native application (Expo Router strictly)[cite: 24, 26, 61].
*   `/apps/web`: B2B/B2B2C Next.js 14+ dashboards (App Router strictly)[cite: 61, 67].
*   `/packages/db`: Supabase client, migrations, generated TypeScript types, and RPCs[cite: 61, 67].
*   `/packages/ui`: Shared UI components (Tailwind, Shadcn).
*   `/packages/utils`: Shared logic, Zod schemas, date formatting.

## 2. STRICT TECH STACK & APPROVED LIBRARIES
Do not install unapproved dependencies. Use `pnpm` exclusively.
*   **Mobile (B2C):** React Native (Expo), Expo Router, NativeWind[cite: 24, 26].
*   **Web (B2B):** Next.js 14+ (React Server Components), Tailwind CSS, Shadcn UI[cite: 61, 67].
*   **State & Fetching:** TanStack Query (Server/Async state), Zustand (Ephemeral client state).
*   **Forms:** `react-hook-form` paired with `zod`[cite: 1, 67].
*   **Icons:** Lucide Icons (`lucide-react-native`, `lucide-react`). **STRICTLY FORBIDDEN:** Do not generate inline `<svg>` blobs.
*   **Mobile UI/UX Primitives:** `@gorhom/bottom-sheet` (mandatory for all facility/coach CTAs)[cite: 24, 28]. `react-native-reanimated` and `react-native-gesture-handler`[cite: 30, 38]. `@shopify/flash-list` (mandatory for all lists).
*   **Sensors & APIs:** `@rnmapbox/maps`[cite: 37, 43, 61], `expo-location`[cite: 43], `expo-camera`[cite: 30, 32], `react-native-health` / `react-native-health-connect`[cite: 46, 52].
*   **Gateways:** Xendit xenPlatform[cite: 25, 50, 60], Stripe Connect[cite: 17, 21], Nutritionix[cite: 40, 52].

## 3. DATABASE TRUTH & CONNECTION SCALING
You are writing against a single, optimized PostgreSQL schema[cite: 50].
*   **The Append-Only Ledger:** Financial/attendance records are immutable[cite: 11, 53]. `DELETE` and `UPDATE` SQL queries are **STRICTLY FORBIDDEN** on transaction tables. Write reversing entries for voids/refunds[cite: 11, 53].
*   **Connection Pooling (Web):** Next.js Server Actions MUST use the Supavisor connection pooler URL (port 6543) to prevent connection exhaustion.
*   **The Dual-Registry Rule:** Organizations are stored in ONE table[cite: 55, 64]. Isolate them using the `registry_type` enum (`COMMERCIAL` or `COMMUNITY`)[cite: 55, 61, 67].
*   **Hard Limits (Enforced via RLS):** `COMMUNITY` clubs are capped at 19 free members[cite: 57, 65]. `COACH` profiles are capped at 3 free clients[cite: 58, 66]. Rely on Supabase Row-Level Security (RLS) to reject inserts[cite: 61, 67]. Do not write client-side logic to hide these caps.
*   **Query Optimization:** NEVER use `any`. Every query must use types from `/packages/db/types.ts`. **STRICTLY FORBIDDEN:** You must never write `select('*')`. You must explicitly define exact columns.
*   **JSONB Payloads:** Use `jsonb` columns for sport-agnostic data (e.g., varied workout sets)[cite: 17, 20]. Validate payloads with Zod before inserting.

## 4. MOBILE EXECUTION RULES (Expo / Sodia App)
*   **Component Limits:** No file may exceed 250 lines. Abstract logic into custom hooks.
*   **List Performance:** You are **STRICTLY FORBIDDEN** from using React Native's `<FlatList>` or `<ScrollView>` for arrays. You must use `@shopify/flash-list` with an accurate `estimatedItemSize`.
*   **Actionable-Object Principle:** Tapping a facility tag, coach widget, or challenge **MUST NOT** trigger `router.push()`[cite: 1, 31, 50]. It must trigger a `@gorhom/bottom-sheet` to preserve feed context[cite: 1, 24, 28, 50].
*   **UI Thread Animations:** All animations must execute on the UI thread using Reanimated `useAnimatedStyle` and `withSpring`/`withTiming`. Do not block the JS thread[cite: 28, 30, 38, 44].
*   **Optimistic UI & Offline:** Wrap critical mutations in TanStack Query offline caches. Use optimistic updates (e.g., UI instantly updates a Like button while the mutation pings the server).
*   **Secure Enclave:** The two-token JWT architecture requires storing the refresh token in the Secure Enclave[cite: 1, 24, 28, 50]. You must strictly use `expo-secure-store`. Do not use `AsyncStorage`.

## 5. WEB EXECUTION RULES (Next.js / GymDash / CoachDash)
*   **React Server Components (RSC):** All components must be server-side by default. The `"use client"` directive is only permitted at the lowest possible leaf node.
*   **Mutations:** Use Next.js **Server Actions** for all database mutations. Do NOT create `/pages/api` REST routes.
*   **Ambient UI State:** Use Supabase WebSockets (`supabase.channel()`) to drive live ambient updates (e.g., the "Inside Now" capacity counter)[cite: 11, 24, 50].

## 6. INFRASTRUCTURE & INTEGRATION RULES
*   **Payments:** GetPhysical is never the Merchant of Record[cite: 26, 59, 64]. Use Xendit xenPlatform for Gyms[cite: 59, 60, 64], and Stripe Connect for Coaches[cite: 17, 21]. Handle success/failure via server-side webhooks.
*   **Real-Time Cleanup:** When using `supabase.channel()`, you MUST return `supabase.removeChannel()` in the `useEffect` cleanup to prevent memory leaks.
*   **QR Generation:** The Wallet QR is a dynamic hash of `user_id + timestamp` expiring every 60s[cite: 1, 6, 25, 38, 51]. Do not ping the server; use a local TOTP algorithm seeded by the secure JWT[cite: 24, 51].
*   **Secret Management:** Never expose `service_role` keys. Mobile variables must use `EXPO_PUBLIC_`; Web variables must use `NEXT_PUBLIC_`.

## 7. PRE-COMMIT ENFORCEMENT
Before offering a complete solution, silently verify:
1. Is there any `any` typing? (If yes, fix it).
2. Is there a `select('*')` query? (If yes, explicitly name the columns).
3. Are all mobile lists using FlashList? (If no, rewrite).
4. Is data fetching using React Query (Mobile) or Server Components (Web)? (If no, rewrite).
5. Are all SVG icons using Lucide? (If no, remove inline SVGs).260677.md…]()
