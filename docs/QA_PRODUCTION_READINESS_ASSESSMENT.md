# GetPhysical — QA & Production-Readiness Assessment

**Date:** 2026-11-06 · **Scope:** `apps/mobile` (Sodia, Expo), `apps/web` (Business Suite, Next.js), `packages/sodia-core` · **Commit audited:** `504c617`
**Benchmark:** what a large consumer "super app" operator (Meta, Grab, Gojek-class) requires before shipping a multi-tenant B2B suite + B2C app to real users and real money.

---

## 1. Verdict

**Not production-ready. This is a high-fidelity, clickable demo, not a production system.** It is a strong UX prototype — broad feature surface, consistent visual language, a sensible monorepo layout, and a well-thought-out spec (`AGENTS.md`, 10-state model, append-only ledger). But the runtime behind the UI is almost entirely seed data, there is no authentication, no tenant isolation in code, no tests, no CI, and several security issues would be launch-blocking at any large company.

| Area | Score (0–5) | Industry bar | Status |
|---|---|---|---|
| UX / visual design & feature breadth | 4 | 4 | ✅ Meets demo bar |
| Architecture (monorepo, shared core) | 3 | 4 | ⚠️ Good skeleton, not enforced |
| Data layer / real backend integration | 1 | 4 | ❌ Mostly seed data |
| Authentication & authorization | 0 | 5 | ❌ None |
| Multi-tenancy isolation | 0.5 | 5 | ❌ Schema hints only |
| Security (secrets, crypto, API) | 1 | 5 | ❌ Launch blockers |
| Payments (Xendit / Stripe Connect) | 0 | 5 | ❌ UI only |
| Reliability (10-state, offline, errors) | 1 | 4 | ❌ 1 of 78 components uses 10-state view |
| Testing & CI/CD | 0 | 4 | ❌ No tests, no CI |
| Observability (logs, crash, analytics) | 0 | 4 | ❌ None |
| Accessibility | 0.5 | 4 | ❌ 2 a11y attributes in whole repo |
| Compliance w/ own `AGENTS.md` | 1.5 | 5 | ❌ Most laws violated (see §6) |

---

## 2. What I actually ran

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ Pass (557 packages) |
| `tsc --noEmit` — `packages/sodia-core` | ✅ Pass |
| `tsc --noEmit` — `apps/web` | ✅ Pass |
| `tsc --noEmit` — `apps/mobile` | ❌ **Fail** — `src/store/crmMessagingStore.ts(2,23): Cannot find module 'expo-constants'` (used but not declared in `apps/mobile/package.json`). `turbo run build`/`typecheck` therefore fail for the monorepo. |
| `next build` — `apps/web` | ✅ Pass. `/` is 246 kB route JS / 348 kB first load (heavy: whole suite is one client bundle incl. `three`). |
| Automated tests | ❌ None exist (no Jest/Vitest/Playwright/Detox config, no `*.test.*`). |
| Lint | ⚠️ `lint` script is just `tsc --noEmit`; no ESLint, no rule enforcement of `AGENTS.md`. |
| CI | ❌ No `.github/workflows`. |

---

## 3. Launch blockers (P0)

### 3.1 No authentication anywhere
- No sign-in, sign-up, session, or token handling in either app. `expo-secure-store` is installed but never imported. "Biometrics" in `SettingsModal.tsx` is a local `useState` toggle.
- The current user ("Darelle Navarette") is hard-coded in seed data and API defaults (`apps/web/src/app/api/crm/reply/route.ts:26-27`).
- **Industry bar:** OAuth/OIDC or Supabase Auth with short-lived access tokens, refresh token in Keychain/Keystore, device binding, MFA for business admins, step-up auth for payouts.

### 3.2 Unauthenticated, spoofable write APIs
`apps/web/src/app/api/crm/broadcast/route.ts` and `.../reply/route.ts`:
- Anyone on the internet can `POST` a broadcast and choose **any** `senderName`, `senderAvatar`, `suiteMode`, `promoCode` — i.e. impersonate any gym/coach to every user.
- No input validation (no Zod), no size limits, no rate limiting, no CSRF/origin check.
- State lives in `global.__GLOBAL_CRM_*` arrays — lost on restart and **not shared across serverless instances** (on Vercel each lambda has its own copy), unbounded memory growth.
- Also violates `AGENTS.md §6` ("Do NOT create API REST routes; use Server Actions").

### 3.3 Realtime channel is a public broadcast bus
Both routes and the mobile store send/subscribe on `sodia_crm_broadcasts` using the **anon key**. Supabase Realtime *broadcast* on a public channel is not covered by table RLS — any client holding the anon key (which ships in the app) can inject fake "facility broadcasts" into every user's inbox. Needs private channels with Realtime Authorization, or persist rows to a table with RLS and use `postgres_changes`.

### 3.4 Entry-pass "TOTP" is forgeable
- `packages/sodia-core/src/totp.ts` seeds the code with `userId:passId:facilityId:epoch` — **all non-secret identifiers** — hashed with FNV-1a (a non-cryptographic hash). Anyone who knows/guesses those IDs (they are embedded in the QR itself: `GP:${facilityId}:${passId}:${userId}:...`) can mint valid codes for any member forever. This is physical access control to gyms.
- `apps/mobile/src/components/cards/TurnstileQRModal.tsx:25` doesn't even use that module — it displays `Math.random()` digits.
- **Fix:** RFC 6238 TOTP (HMAC-SHA256) with a per-pass secret provisioned server-side and stored in SecureStore; verify server-side or with a signed offline allow-list at the desk; replay protection (one scan per window).

### 3.5 Secrets / keys committed and shipped in bundles
| Location | Item |
|---|---|
| `packages/sodia-core/src/supabase.ts:5-9`, `qa-verify.ts:14-16` | Supabase URL, publishable + anon JWT hard-coded (anon is "public" by design, but hard-coding prevents env separation and key rotation; safe **only** if every table has correct RLS — none is in the repo to verify). |
| `apps/mobile/app.json:48`, `mapHtmlBuilder.ts:24` | Geoapify maps key committed as fallback. |
| `oracleNutritionService.ts:100-111` | Gemini key read from `EXPO_PUBLIC_GEMINI_API_KEY` / user input and sent **from the device** in the URL query string. Any `EXPO_PUBLIC_` value is extractable from the JS bundle → quota theft / bill shock. Must be proxied through a server function. |

**Action:** rotate the Geoapify key, move all third-party AI/maps calls behind a backend proxy with per-user rate limits, load Supabase config from env per environment (dev/staging/prod).

### 3.6 No multi-tenant isolation in code
- No SQL migrations or RLS policies are in the repo (`find -name '*.sql'` → none), so tenant isolation cannot be reviewed or reproduced.
- `facilities.registry_type` is typed `string | null`, not the `COMMERCIAL | COMMUNITY` enum the spec mandates; `profiles.roles` is `string[]`.
- Business Suite has no notion of "which tenant am I acting for" — the suite mode is a client toggle; there is no org membership check.
- The 19-member / 3-client caps (`AGENTS.md §4`) are not implemented anywhere.
- **Industry bar:** `tenant_id` on every row, RLS policies keyed on `auth.jwt()` claims, migrations in VCS, automated RLS tests per role (owner/staff/coach/member/anonymous), audit log of cross-tenant admin access.

### 3.7 Payments are UI-only
No Xendit or Stripe SDK/webhook code exists (`grep` hits only a label in `MobileOrganizerQuickdash.tsx`). `UniversalCheckoutModal` / `provisionPass` mutate local Zustand state. No idempotency keys, no webhook signature verification, no reconciliation. `appendLedgerTransaction` exists in core but is never called.

### 3.8 Mobile build does not resolve / has dev-only networking
- Missing `expo-constants` dependency (typecheck fails).
- `crmMessagingStore.ts:6-13` derives the API host from the Expo dev server and falls back to `http://192.168.1.3:3000` — **cleartext HTTP to a LAN IP**. A store build has no backend at all. (The last 3 commits on `main` were churning this IP.)
- No `eas.json`, no environment profiles, no OTA/update channel config.
- Android requests deprecated `READ/WRITE_EXTERNAL_STORAGE`; `expo-location` plugin has no iOS `NSLocationWhenInUseUsageDescription` → App Store rejection risk.

### 3.9 Deployment config is inconsistent
`vercel.json` expects static output in `apps/web/out`, but `next.config.mjs` has no `output: 'export'` (and static export would drop the API routes). The deploy either fails or serves nothing.

---

## 4. High-priority gaps (P1)

1. **Data layer is seed data.** `SodiaQueries` (core) is never called by either app. Discover, feed, cards, track, CRM all read from `src/data/*.ts`, `seed-data.ts`, and Zustand initial state. No TanStack Query anywhere (mandated). No caching, pagination, or invalidation.
2. **10-state contract not implemented.** `TenStateView` is imported by **1 of 78** components (`SodiaFeed.tsx`). No `no_internet` detection, no offline queue, no `slow_network` handling, no error boundaries (`error.tsx`/`ErrorBoundary` absent) on web or mobile. Any thrown render error white-screens the app.
3. **Web is a single giant client app.** `app/page.tsx` is `'use client'` wrapping `BusinessSuiteShell` (614 lines) — zero React Server Components, no routing per dashboard (one URL `/` for GymDash/Clubdash/CoachDash), no deep links, no per-route code splitting, no middleware/auth guard.
4. **Mobile navigation is a single screen with 18 `useState` flags** in `App.tsx` toggling `Modal`s. Expo Router is installed but only `index` exists — no deep links (push notifications, shared posts, pass links), no back-stack, Android back button behaviour undefined.
5. **No observability.** No crash reporting (Sentry/Crashlytics), no product analytics, no structured logging, no correlation IDs (which the spec's `error` state requires). 13 stray `console.*` calls.
6. **No tests / CI.** At the bar of large app companies: unit tests on `sodia-core` (fee math, TOTP, validation), RLS tests, API contract tests, E2E (Playwright web, Detox/Maestro mobile), and CI gates on typecheck/lint/test/build per PR.
7. **Accessibility.** Only 2 `accessibilityLabel`/`aria-*` attributes in the codebase. Icon-only buttons, custom tabs and modals are unlabeled; no dynamic type/font scaling checks; colour contrast unverified. Fails WCAG 2.1 AA / Apple & Google review expectations, and is a legal risk for B2B customers.
8. **Privacy & compliance.** App handles health/biometric data (NASM biometrics, nutrition, location, camera) with no privacy policy, consent flow, data-deletion path, or age gate implementation — required by App Store / Play, Philippine Data Privacy Act (RA 10173), and GDPR if EU users (Supabase region is `eu-north-1`).

---

## 5. P2 — quality & maintainability

- `any` usage: 30 occurrences across 15 files (e.g. `crmMessagingStore.ts:107 realtimeChannelRef: any`).
- Lists: 37 `FlatList`/`ScrollView` usages vs. FlashList mandate; FlashList is installed but barely used.
- No `@gorhom/bottom-sheet`, no Reanimated (RN `Animated` API used), no `react-hook-form` — all mandated in `AGENTS.md`.
- Inline `<svg>` in `EngagementGaugeCard.tsx`, `ActivityPerformanceSection.tsx` (forbidden by spec; acceptable for charts if the rule is relaxed).
- 11 files exceed the 250-line limit (largest: `AthleticInboxCRMView.tsx` 616, `BusinessSuiteShell.tsx` 614).
- Repo hygiene: `legacy/` (8.9 MB Vite prototype) and `.aistudio/` (3.5 MB tool artifacts) committed; C# logo scripts in `apps/mobile/scripts`; `.env.example` documents AI Studio vars, not the real app vars (`EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`, Supabase).
- `packageManager: pnpm@12.16.1` with TS `~6.0.3` on mobile vs `^5.8.2` elsewhere — version drift across workspaces.
- Images hot-linked from Unsplash in seed data and API defaults (licensing, availability, and privacy — third-party request on every render).

---

## 6. Compliance against the project's own `AGENTS.md`

| Rule | Status |
|---|---|
| §3 10 canonical states on every screen | ❌ 1/78 components |
| §4 No `UPDATE/DELETE` on ledger | ✅ Core helper is append-only (but unused) |
| §4 Supavisor pooler (6543) for server actions | ❌ No server actions; port is a constant only |
| §4 RLS-enforced caps (19 members / 3 clients) | ❌ Not present |
| §4 No `any` | ❌ 30 hits |
| §4 No `select('*')` | ✅ Explicit column selectors in core |
| §4 Zod-validated JSONB | ⚠️ Schemas exist in `validation.ts`, unused by API routes |
| §5 FlashList for all lists | ❌ 37 FlatList/ScrollView usages |
| §5 Bottom-sheet for actionable objects | ❌ `@gorhom/bottom-sheet` not installed |
| §5 Reanimated UI-thread animations | ❌ Not installed |
| §5 TanStack Query + optimistic/offline | ❌ Not installed |
| §5 Refresh token in `expo-secure-store` | ❌ Never imported |
| §6 RSC by default, `"use client"` only at leaves | ❌ Root page is a client component |
| §6 Server Actions, no API routes | ❌ Two REST routes |
| §7 Xendit / Stripe Connect via webhooks | ❌ Not implemented |
| §7 `removeChannel` in effect cleanup | ❌ 0 calls; mobile subscription never torn down |
| §7 TOTP seeded by secure JWT | ❌ Seeded by public IDs; mobile uses `Math.random` |
| §7 Env var prefixes | ⚠️ Prefixes used, but secrets hard-coded as fallbacks |

---

## 7. What's genuinely good

- Clear product vision and a detailed spec (`docs/specs/MASTER_ARCHITECTURE_AND_FLOWS.md`, `AGENTS.md`) — better than most early-stage codebases.
- Sensible monorepo split (mobile / web / shared core) with Turborepo + pnpm; web and core type-check and build cleanly.
- `sodia-core` is the right idea: typed DB rows, explicit column selectors, fee calculator, 10-state envelope types, Zod schemas.
- Rich, cohesive UI covering feed, stories, DMs, discover map, pass wallet, lift/move/food tracking, and three B2B portals — an excellent investor/customer demo.

---

## 8. Path to production (recommended order)

**Phase 0 — Make it safe to expose (1–2 wks)**
1. Delete or lock down `/api/crm/*` (auth + Zod + rate limit), switch Realtime to private channels.
2. Rotate the Geoapify key; move Gemini/maps calls behind a server proxy; remove hard-coded Supabase config in favour of per-env variables.
3. Fix mobile build (`expo-constants`), add `eas.json` with dev/staging/prod profiles and a real API base URL over HTTPS.
4. Fix `vercel.json` / Next output mismatch.

**Phase 1 — Foundations (3–6 wks)**
5. Supabase Auth (email/phone OTP + Apple/Google), SecureStore refresh tokens, Next.js middleware route guards.
6. Commit SQL migrations + RLS policies with `tenant_id`/`facility_id` scoping and role claims; add pgTAP or integration tests per role. Implement the caps in RLS.
7. Replace seed data with TanStack Query hooks over `SodiaQueries`; route web dashboards into App Router segments (`/[tenant]/gymdash/...`) with RSC data loading and Server Actions.
8. CI: typecheck, ESLint (with custom rules for `any`, `select('*')`, FlatList), unit tests, build, on every PR.

**Phase 2 — Money & access (4–6 wks)**
9. RFC 6238 TOTP with server-provisioned secrets; desk verification with replay protection.
10. Xendit xenPlatform + Stripe Connect with webhook signature verification, idempotency keys, ledger reconciliation jobs.

**Phase 3 — Scale & polish (ongoing)**
11. Sentry + analytics + structured logs with correlation IDs; SLOs and alerting.
12. Implement 10 states + offline queue + error boundaries across screens; accessibility pass; privacy policy, consent, account deletion, age gate.
13. E2E suites (Playwright, Maestro/Detox), performance budgets (web first-load JS < 200 kB per route), load tests on Realtime and pooler.

---

*Method: static review of all workspaces, targeted greps for each `AGENTS.md` rule, `pnpm install`, per-workspace `tsc --noEmit`, and `next build`. Mobile app was not run on a device/simulator (no simulator available in this environment); runtime UX findings are from code inspection.*
