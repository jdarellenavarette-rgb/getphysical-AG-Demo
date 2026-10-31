# GETPHYSICAL: ENTERPRISE AI MASTER DIRECTIVE (AGENTS.md)

**CRITICAL INSTRUCTION FOR ALL AI AGENTS:** You are operating within a strictly bootstrapped Turborepo Monorepo with a fixed token budget. Do not guess. Do not mock APIs. Do not write placeholder code (`// TODO`). If a requirement is missing from the specific `/docs/specs/*.md` file provided in your prompt, consult `/docs/specs/MASTER_ARCHITECTURE_AND_FLOWS.md` first, or STOP and ask for clarification.

## 1. ARCHITECTURE & MONOREPO ROUTING
You must strictly place code in the correct Turborepo workspaces. Do not mix web and mobile logic.
*   `/apps/mobile`: B2C React Native application (Expo Router strictly) — Sodia consumer harness & mobile role portals (Staff Selfie DTR/Scanner, CoachDash, Organizer Pro).
*   `/apps/web`: B2B/B2B2C Next.js 14+ dashboards (App Router strictly) — GymDash (Registry A), Clubdash (Registry B), and CoachDash Web OS.
*   `/packages/sodia-core`: Shared TypeScript core package containing Supabase database types, explicit column selectors, Zod schemas, 10-State flow contracts, WRE scoring types, TOTP/QR utilities, and cross-platform business rules.

## 2. STRICT TECH STACK & APPROVED LIBRARIES
Do not install unapproved dependencies. Use `pnpm` exclusively.
*   **Mobile (B2C):** React Native (Expo), Expo Router, NativeWind.
*   **Web (B2B):** Next.js 14+ (React Server Components), Tailwind CSS, Shadcn UI.
*   **State & Fetching:** TanStack Query (Server/Async state), Zustand (Ephemeral client state).
*   **Forms:** `react-hook-form` paired with `zod`.
*   **Icons:** Lucide Icons (`lucide-react-native`, `lucide-react`). **STRICTLY FORBIDDEN:** Do not generate inline `<svg>` blobs.
*   **Mobile UI/UX Primitives:** `@gorhom/bottom-sheet` (mandatory for all facility/coach CTAs). `react-native-reanimated` and `react-native-gesture-handler`. `@shopify/flash-list` (mandatory for all lists).
*   **Sensors & APIs:** `@rnmapbox/maps`, `expo-location`, `expo-camera`, `react-native-health` / `react-native-health-connect`.
*   **Gateways:** Xendit xenPlatform (B2C/GymDash split routing), Stripe Connect (Clubdash/CoachDash split ledgers), Nutritionix (NLP food logging).

## 3. MANDATORY 10-STATE FRONTEND-BACKEND ARCHITECTURE
Every screen, bottom sheet, query, and mutation across `/apps/mobile` and `/apps/web` MUST deterministically handle and transition across the **10 Canonical States** defined in `sodia-core`:
1.  `empty`: Zero-data state with illustration, 1-line explanation, and 1 primary CTA (e.g., Sodia feed -> "Find Friends", Cards -> "Add your first pass").
2.  `loading`: Skeleton placeholders matching exact layout geometry; never render blank screens or blocking full-screen spinners on initial load.
3.  `error`: Friendly actionable error message with a `"Retry"` trigger and correlation code; distinguishes 5xx server faults from client faults.
4.  `no_internet`: Offline mode banner + fallback execution (read-only cached Sodia feed, local SQLite/TanStack offline queue for Lift/Move/Food logs, 60s local TOTP fallback code on VIP Cards, local SQLite active pass verification on GymDash Quickdash).
5.  `slow_network`: Degraded latency indicator (>2500ms threshold); triggers optimistic UI updates, disables duplicate non-idempotent taps, and downgrades media prefetch to low-res thumbnails.
6.  `no_search_results`: Query returned zero matches; displays clear query reset plus WRE-seeded suggested alternatives or manual entry fallback (e.g., unrecognized UPC barcode or food search -> `"Add it manually"`).
7.  `permission_denied`: OS permission blocked (Location, Camera, Contacts, Health, Biometrics); renders contextual fallback UI (e.g., blurred Discover map with City/Zip seed input, manual lookup keyboard on scanner, username search on Find Friends) + deep link to OS Settings.
8.  `session_expired`: Access token stale/locked; triggers native biometric prompt (FaceID/TouchID) to refresh via Secure Enclave refresh token while preserving all in-progress workout/post drafts, falling back to Auth Landing only on failure.
9.  `form_validation`: Inline, real-time `react-hook-form` + `zod` field-level validation (e.g., OTP shake + red border, live username uniqueness with 3 suggestions, Age Gate <13 hard block / <18 payment block, caption char limits 280c/150c).
10. `success`: Optimistic or confirmed completion state (haptic feedback, ledger/pass injection, confetti/PR flags, or `"Share to Sodia"` harness trigger).

## 4. DATABASE TRUTH & CONNECTION SCALING
You are writing against a single, optimized PostgreSQL schema.
*   **The Append-Only Ledger:** Financial/attendance records are immutable. `DELETE` and `UPDATE` SQL queries are **STRICTLY FORBIDDEN** on transaction tables (`ledger_transactions`, `wallet_transactions`, `access_scans`). Write reversing entries for voids/refunds.
*   **Connection Pooling (Web):** Next.js Server Actions MUST use the Supavisor connection pooler URL (port 6543) to prevent connection exhaustion.
*   **The Dual-Registry Rule:** Organizations are stored in ONE `facilities` table. Isolate them using the `registry_type` enum (`COMMERCIAL` / Registry A or `COMMUNITY` / Registry B).
*   **Hard Limits (Enforced via RLS):** `COMMUNITY` clubs are capped at 19 free members. `COACH` profiles are capped at 3 free clients. Rely on Supabase Row-Level Security (RLS) to reject inserts. Do not write client-side logic to hide these caps.
*   **Query Optimization:** NEVER use `any`. Every query must use types from `sodia-core`. **STRICTLY FORBIDDEN:** You must never write `select('*')`. You must explicitly define exact columns.
*   **JSONB Payloads:** Use `jsonb` columns for sport-agnostic data (e.g., varied workout sets, tournament brackets, sticker overlay coordinates). Validate payloads with Zod before inserting.

## 5. MOBILE EXECUTION RULES (Expo / Sodia App)
*   **Component Limits:** No file may exceed 250 lines. Abstract logic into custom hooks.
*   **List Performance:** You are **STRICTLY FORBIDDEN** from using React Native's `<FlatList>` or `<ScrollView>` for arrays. You must use `@shopify/flash-list` with an accurate `estimatedItemSize`.
*   **Actionable-Object Principle:** Tapping a facility tag, coach widget, or challenge **MUST NOT** trigger `router.push()`. It must trigger a `@gorhom/bottom-sheet` to preserve feed context.
*   **UI Thread Animations:** All animations must execute on the UI thread using Reanimated `useAnimatedStyle` and `withSpring`/`withTiming`. Do not block the JS thread.
*   **Optimistic UI & Offline:** Wrap critical mutations in TanStack Query offline caches. Use optimistic updates.
*   **Secure Enclave:** The two-token JWT architecture requires storing the refresh token in the Secure Enclave. You must strictly use `expo-secure-store`. Do not use `AsyncStorage`.

## 6. WEB EXECUTION RULES (Next.js / GymDash / Clubdash / CoachDash)
*   **React Server Components (RSC):** All components must be server-side by default. The `"use client"` directive is only permitted at the lowest possible leaf node.
*   **Mutations:** Use Next.js **Server Actions** for all database mutations. Do NOT create `/pages/api` REST routes.
*   **Ambient UI State:** Use Supabase WebSockets (`supabase.channel()`) to drive live ambient updates (e.g., the "Inside Now" capacity counter).

## 7. INFRASTRUCTURE & INTEGRATION RULES
*   **Payments:** GetPhysical is never the Merchant of Record. Use Xendit xenPlatform for Gyms (Hybrid Fee: fixed ₱15 on one-time passes, flat 5% on recurring memberships), and Stripe Connect for Organizers/Coaches. Handle success/failure via server-side webhooks.
*   **Real-Time Cleanup:** When using `supabase.channel()`, you MUST return `supabase.removeChannel()` in the `useEffect` cleanup to prevent memory leaks.
*   **QR Generation:** The Cards QR is a dynamic hash of `user_id + timestamp` expiring every 60s. Do not ping the server; use a local TOTP algorithm seeded by the secure JWT.
*   **Secret Management:** Never expose `service_role` keys. Mobile variables must use `EXPO_PUBLIC_`; Web variables must use `NEXT_PUBLIC_`.

## 8. PRE-COMMIT ENFORCEMENT
Before offering a complete solution, silently verify:
1. Is there any `any` typing? (If yes, fix it).
2. Is there a `select('*')` query? (If yes, explicitly name the columns).
3. Are all mobile lists using FlashList? (If no, rewrite).
4. Is data fetching using React Query (Mobile) or Server Components (Web)? (If no, rewrite).
5. Are all SVG icons using Lucide? (If no, remove inline SVGs).
6. Are all 10 states accounted for in the flow? (If no, add missing state handlers).
