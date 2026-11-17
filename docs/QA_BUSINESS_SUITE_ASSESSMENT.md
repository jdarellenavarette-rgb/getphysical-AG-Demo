# GetPhysical Business Suite — QA & Production-Readiness Assessment

**Date:** 2026-11-17 · **Scope:** `apps/web` (GymDash, Clubdash, CoachDash, OrganizerDash) and the parts of `supabase/` and `packages/sodia-core` it depends on · **Commit audited:** `76b6166`
**Baseline:** `docs/QA_PRODUCTION_READINESS_ASSESSMENT.md` (2026-11-06, commit `504c617`). The mobile app is assessed separately.
**Benchmark:** what a multi-tenant B2B operations product that handles member data, door access and money needs before a paying gym uses it.

---

## 1. Verdict

**Not production-ready, but the reason has changed.** On 6 November the suite had no login, open write APIs and no database. Those launch blockers are fixed: there is real authentication, a tenant model enforced in Postgres, and a tested backend for messaging, door access and payments.

What remains is that **the product on screen is still mostly a demo.** Of the six tabs, only the Inbox (and the broadcast composer) talks to the backend. Dashboard, Schedule, POS/Ledgers, Triage and Settings show hard-coded numbers and keep changes in browser memory. An operator who signs in to their own facility sees "Metro Core Arena", 883 members and ₱1.48M cashflow that are not theirs.

The backend is now ahead of the front end. Most of the work to production is wiring existing, tested server capability into the screens.

| Area | Nov 6 | Now | Bar | Status |
|---|---|---|---|---|
| Authentication | 0 | 3.5 | 5 | ⚠️ Solid base; no MFA, sign-out or onboarding controls |
| Multi-tenant isolation (database) | 0.5 | 4.5 | 5 | ✅ RLS on every table, tested |
| Multi-tenant experience (UI) | 0 | 1.5 | 5 | ❌ Tenant resolved, then ignored outside the Inbox |
| Real data in the suite | 1 | 1.5 | 4 | ❌ 1 of 6 tabs live |
| Security (app layer) | 1 | 3.5 | 5 | ⚠️ No blockers found; hardening missing |
| Payments in the suite | 0 | 0.5 | 5 | ❌ Backend exists; POS is simulated |
| Door access in the suite | 0 | 0.5 | 5 | ❌ `verify_pass_code` exists; scanner is simulated |
| Reliability (10 states, errors) | 1 | 1.5 | 4 | ❌ Inbox only; no error boundaries |
| Testing & CI | 0 | 3 | 4 | ⚠️ Backend well covered; zero web tests |
| Accessibility | 0.5 | 1 | 4 | ❌ Automated checks fail on every screen |
| Responsive layout | — | 1 | 3 | ❌ Unusable below about 1024 px |
| Observability | 0 | 0 | 4 | ❌ None |
| Compliance with `AGENTS.md` (web rules) | 1.5 | 2.5 | 5 | ❌ See §6 |

---

## 2. What was run

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ Pass |
| `tsc --noEmit` — `sodia-core`, `apps/web` | ✅ Pass |
| `sodia-core` unit tests | ✅ 62 of 62 pass (7 files) |
| Database suite (`pnpm db:test`, local Postgres 16 + PostGIS) | ✅ All 12 migrations apply; 176 assertions pass across 9 test files (RLS, caps, messaging, door access, ledger, QR, geo, social sign-in) |
| `next build` | ✅ Pass. `/` is 253 kB route JS, 355 kB first load (was 246 / 348). `/login` is 104 kB. |
| Web tests | ❌ None exist |
| Lint | ⚠️ Still `tsc --noEmit` only; no ESLint |
| Browser run (headless Chromium, production build) | Done against a local stand-in for Supabase Auth and the data API, so the signed-in shell could be exercised. See §8 for what this does and does not prove. |
| Automated accessibility scan (axe, WCAG 2 A/AA) | ❌ Violations on login, dashboard and inbox |

---

## 3. Fixed since the 6 November assessment

| Earlier finding | Now |
|---|---|
| No authentication | Supabase Auth with cookie sessions; middleware validates the token with the auth server on every request and redirects signed-out visitors to `/login?next=…`. Password, magic link, Google and Apple. |
| Unauthenticated, spoofable `/api/crm/*` routes | Removed. Replaced by Server Actions with Zod validation; the sender is bound to the signed-in user in the database. |
| Public realtime broadcast bus | Removed. Inbox uses `postgres_changes`, which respects RLS, and the channel is removed on unmount. |
| No migrations, no RLS | 12 migrations in version control; RLS enabled on every table with explicit grants; append-only ledger and scan tables; 19-member and 3-client caps enforced by triggers. |
| No tenant concept | `facility_staff` roles; the server resolves which facilities the user staffs and passes the active one to the shell. |
| Deployment config mismatch | `vercel.json` now builds the Next.js app normally. |
| No CI | Workflow runs typecheck, unit tests, type-drift check, web build and the database suite on every PR. |
| Open redirect risk on `next` | Checked in the browser: `next=/\example.org/x` stays on the same origin. |

---

## 4. Launch blockers (P0)

### 4.1 Five of six tabs show fabricated data for every tenant
Verified in the browser with a facility named "QA Real Facility Name": that name appears nowhere in the dashboard. The header reads "GymDash · BGC High Street Arena · Turnstiles Live · Shift Float ₱2,500" for any account.

| Tab | Source of what is shown |
|---|---|
| Dashboard | Constants in `ActivityPerformanceSection`, `PerformanceTableCard`, `EngagementGaugeCard`, `CoachAvailabilityCard` |
| Schedule | `INITIAL_SCHEDULE` in `SpatialCalendar.tsx`; bookings live in `useState` |
| POS / Ledgers | `INITIAL_SCANS` and a local cart in `DailyDash.tsx` |
| Triage | `INITIAL_TRIAGE`, `INITIAL_AT_RISK` in `TriageDashboard.tsx` |
| Settings | Read-only literals, including a "Maya Merchant Partner ID" |
| **Inbox** | **Live** (`loadFacilityInbox`, `sendCrmReply`, `sendCrmBroadcast`) |

A real operator would make decisions from numbers that are not theirs. The suite should not be shown to a customer without either real data or a visible "sample data" label on each of these screens.

### 4.2 The POS records nothing
`handleTender` in `DailyDash.tsx:59` clears the cart and shows "Tendered ₱…". No payment order, no ledger row, no receipt. The backend already has `create_payment_order`, `payments-checkout` and three webhook handlers; none is called from the web app. Cash takings and the shift float are not persisted, so the "blind count" reconciliation compares against a hard-coded `+ 820` (`BusinessSuiteShell.tsx:47`).

### 4.3 The door scanner is a simulation
The gate panel has "Simulate Valid Pass / Offline TOTP / Squatter" buttons that invent a member name with `Math.random()` (`DailyDash.tsx:38`). The "Inside Now" counter is local state. `verify_pass_code()` and the `access_scans` realtime publication exist and are tested, but the suite never calls or subscribes to them. `AGENTS.md §6` requires the capacity counter to be driven by a Supabase channel.

### 4.4 The manager PIN is `1234`, checked in the browser
`BusinessSuiteShell.tsx:33` compares the PIN to a literal and the error message tells the user the PIN. The placeholder repeats it. Shift identity is hard-coded to "Jane D." (`st_882`). This is a cash-control feature; it needs a per-staff credential verified on the server and an audit row.

### 4.5 No way to sign out or switch facility once inside
`signOut` is only rendered on the "create your first facility" screen. Inside the shell there is no sign-out control (browser check: 0 matches). `facilities` and `operatorName` are passed to `BusinessSuiteShell` and never used; `selectFacility` has no caller. A staff member on a shared front-desk computer cannot end their session, and a user who staffs two facilities is locked to the first.

### 4.6 Anyone with a Google account can publish a commercial gym
OAuth sign-in creates an account, and `createFacility` lets any signed-in user register a `COMMERCIAL` facility. `facilities` is readable by signed-out users for Discover. There is no business verification, review queue or "unlisted until approved" state, so fake or impersonating venues can appear in the consumer app. Payouts are gated separately (`charges_enabled`), so this is a trust and brand issue more than a money one, but it is cheap to abuse.

---

## 5. High priority (P1)

1. **Role is cosmetic.** "Change Role" lets any user flip between GymDash, Clubdash, CoachDash and OrganizerDash regardless of the facility's registry type, and the chosen `suiteMode` is sent to `send_crm_broadcast` unchecked. The user's `facility_staff.role` (OWNER/ADMIN/STAFF/COACH) is loaded and never used to gate any screen.
2. **Broadcast has no guard rails.** Any staff role can message every active member; there is no rate limit, confirmation step, member opt-out or audit view. Segment labels in the composer show invented counts ("All Active (883)", "At-Risk (42)"). Fan-out is a row-by-row loop in one transaction, which will be slow for large facilities.
3. **Inbox loads the oldest messages, not the newest.** `loadFacilityInbox` orders messages ascending with `limit(50 × threads)` (`crm.ts:134-139`). Once a facility has more than that, recent messages are cut off. The scan lookup (`limit(500)`) has the same shape. Needs a per-thread "latest N" query and pagination; the thread list is capped at 100 with no "load more".
4. **Inbox realtime is unfiltered.** The subscription has no `filter`, so the operator's personal DMs and other facilities' messages (all permitted by RLS) arrive on the channel and each triggers a full inbox reload (`useFacilityInbox.ts:98-99`).
5. **`selectFacility` will fail for any facility with two or more staff.** It queries `facility_staff` by `facility_id` only and uses `maybeSingle()`; RLS lets staff see co-workers' rows, so multiple rows come back and the cookie is never set (`facility.ts:62`). Add `.eq("user_id", …)`.
6. **No error, loading or not-found boundaries.** `apps/web/src/app` has no `error.tsx`, `global-error.tsx`, `loading.tsx` or `not-found.tsx`. `getSuiteSession` ignores query errors, so a database outage shows "Set up your first facility" instead of an error. Only the Inbox models loading / empty / error / session-expired / permission-denied; `no_internet` and `slow_network` are not handled anywhere.
7. **No security headers.** Responses carry no Content-Security-Policy, `X-Frame-Options` / `frame-ancestors`, HSTS, `Referrer-Policy` or `X-Content-Type-Options`, and `X-Powered-By: Next.js` is exposed. The suite can be framed by another site (click-jacking on broadcast and, later, payouts).
8. **Account controls expected of a B2B admin tool are missing:** MFA, password reset screen, session/device list, staff invitation and removal UI, and an audit trail of who did what. Raw database error text is returned to the browser as a "ref" code (`crm.ts:27-31`).
9. **Accessibility.** axe reports `select-name` (critical) on the branch and timeframe selects and `color-contrast` (serious) on 13 dashboard elements, 8 inbox elements and 2 login elements. The broadcast dialog has no `role="dialog"`, no focus trap and does not close on Escape. Role cards and the logo are clickable `div`s with no keyboard access. Dock buttons rely on `title` for their name.
10. **Not responsive.** Fixed grids (`320px 1fr`, `1fr 340px`, 380 px inbox column). At 768 px and 390 px content is clipped at about 896 px with no way to scroll to it; the header controls are unreachable. The dock also stops at 464 px tall on a 900 px viewport.
11. **No web tests and no observability.** No component, action or end-to-end tests; no error reporting, analytics or structured logs. The "correlation code" the spec requires on error states does not exist.
12. **Web sign-up path is undefined.** Password and magic-link sign-in only work for existing accounts (`shouldCreateUser: false`), while Google/Apple silently create one. There is no explicit "create a business account" step, terms acceptance or privacy notice.

---

## 6. Compliance with `AGENTS.md` (web rules)

| Rule | Status |
|---|---|
| §2 Tailwind CSS + Shadcn UI | ❌ Neither installed; everything is inline `style={{…}}` objects |
| §2 TanStack Query / Zustand | ❌ Not installed on web; `useState` + effects |
| §2 `react-hook-form` + `zod` | ⚠️ Zod on the server; forms use `useActionState` |
| §2 Lucide only, no inline `<svg>` | ❌ 4 inline SVG charts (`EngagementGaugeCard`, `ActivityPerformanceSection`) |
| §3 Ten states on every screen | ❌ Inbox models 6; other tabs none |
| §4 No `UPDATE`/`DELETE` on ledger tables | ✅ Enforced by trigger and revoked grants; tested |
| §4 Supavisor pooler (6543) for Server Actions | ⚠️ Not applicable as built: actions use the HTTPS data API, not direct Postgres. The rule or the code comment should be reconciled. |
| §4 Dual registry, caps enforced by RLS | ✅ Database; UI copy mentions the 19-member cap |
| §4 No `any` | ❌ 3 (`BusinessSuiteShell:207`, `NavigationDock:16`, `TrackTabScreen:47`) |
| §4 No `select('*')`, typed queries | ✅ |
| §6 Server Components by default | ⚠️ `page.tsx` and `login/page.tsx` are server components; the entire suite below them is one client tree (32 `"use client"` files) |
| §6 Server Actions, no REST routes | ✅ Only the two auth callback handlers remain |
| §6 Realtime drives ambient UI ("Inside Now") | ❌ Counter is local state |
| §7 `removeChannel` in cleanup | ✅ |
| §7 Payments via server webhooks | ✅ Backend / ❌ not reachable from the suite |
| §7 No `service_role` exposure, `NEXT_PUBLIC_` prefixes | ✅ Config helper rejects service keys and non-HTTPS URLs |

---

## 7. Lower priority (P2)

- **Single URL.** All tabs live at `/` in `useState`; a refresh returns to the Dashboard, and nothing is linkable or bookmarkable. No per-tab code splitting.
- **Bundle weight.** `three` is loaded for the decorative knot on the dashboard hero; it accounts for a large share of the 253 kB route.
- **Dead code.** `components/mobile-app`, `components/figma` and `components/sodia-preview` (about 1,640 lines) are not reachable from any route. `core-link.ts` is unused.
- **Large files.** `BusinessSuiteShell.tsx` 623 lines, `AthleticInboxCRMView.tsx` 418, `ActivityPerformanceSection.tsx` 366.
- **Demo copy in product UI.** "Dark Mockup / Light App" theme labels, "Explain Architecture Differences", a `window.alert` for the mixed-cart rule that cites "Spec law", and the founder's name and photo in the inbox and tables.
- **Cookies.** `gp_active_facility` is set `secure: true`, which Safari drops on `http://localhost`. The Supabase session cookie is readable by page scripts (library default); a CSP matters more because of that.
- **Page metadata.** One static title for every state; no favicon set.
- **Docs drift.** `docs/BACKEND.md` says 126 assertions and migrations 0001–0011; the repo has 176 and 12.

---

## 8. What this assessment does not cover

- **No run against a real Supabase project.** The browser pass used a local stand-in for auth and the data API. It proves the app's own routing, validation, rendering and error handling. It does not prove Google/Apple sign-in, email delivery, realtime delivery or RLS behaviour through the live API. RLS itself was tested directly in Postgres.
- **Edge functions were not executed in Deno**, only type-checked and unit-tested under Node (unchanged from the backend runbook).
- **No load, penetration or manual screen-reader testing.**
- **Staging was not touched.** No users or data were created in the staging project.

---

## 9. Recommended order

**Step 1 — make it honest and safe to demo to a customer (days)**
1. Add sign-out and the facility switcher to the shell; fix `selectFacility`.
2. Show the real facility name, registry type and operator; lock the suite mode to the facility's registry and the user's role.
3. Label every non-live screen as sample data, or hide it behind a flag.
4. Remove the `1234` PIN path and "Simulate" buttons from production builds.
5. Add security headers and `error.tsx` / `not-found.tsx`; surface query failures in `getSuiteSession`.

**Step 2 — wire the screens to the backend that already exists (2–4 weeks)**
6. Door: scanner input → `verify_pass_code`; live feed and "Inside Now" from `access_scans` over realtime.
7. POS: cart → `create_payment_order` / `payments-checkout`; cash sales and shift open/close as append-only rows with server-verified staff identity.
8. Dashboard and Triage: server-rendered queries over memberships, scans and ledger; real segment counts in the broadcast composer.
9. Inbox: latest-N per thread, pagination, filtered realtime, read state.
10. Move each tab to its own route segment so data loads in Server Components.

**Step 3 — operate it (2–4 weeks, overlapping)**
11. Staff invites and role management; MFA for owners and admins; audit log.
12. Facility verification before public listing.
13. Playwright tests for sign-in, tenant switch, reply, broadcast, scan and tender; ESLint with rules for the `AGENTS.md` bans.
14. Error reporting with correlation IDs; accessibility pass on dialogs, selects, contrast and keyboard access; a tablet layout for front-desk use.
15. Decide on Tailwind/Shadcn before more screens are built on inline styles.

---

*Method: full read of `apps/web/src` (app, actions, lib, suite components), targeted review of RLS and messaging migrations, greps for each `AGENTS.md` web rule, `pnpm install`, `tsc`, unit tests, the database suite on local Postgres 16 with PostGIS, `next build`, and a headless Chromium pass with axe at 1440, 1024, 768 and 390 px.*
