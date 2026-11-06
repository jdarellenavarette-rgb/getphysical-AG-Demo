# GetPhysical — Feature Benchmark & QA Acceptance Matrix

**Owner:** Lead Fullstack / QA · **Applies to:** `apps/mobile` (Sodia), `apps/web` (GymDash / Clubdash / CoachDash / Organizer Web OS), `packages/sodia-core`
**Source of truth for behaviour:** `docs/specs/MASTER_ARCHITECTURE_AND_FLOWS.md` · **Engineering rules:** `AGENTS.md`

Each feature is benchmarked against the market leader users already know. A feature counts as **delivered** only when
every acceptance criterion in its row passes *and* the global gates (§1) pass. Benchmarks set the bar for interaction
quality; they are never a licence to copy another product's branding, art or copy.

---

## 1. Global release gates (every screen, both apps)

| # | Gate | How QA verifies |
|---|------|-----------------|
| G1 | All **10 canonical states** reachable and rendered via `TenStateEnvelope` (`sodia-core/states.ts` factories) | Toggle each state from seed data / devtools; screenshot each |
| G2 | Loading = **layout-matched skeletons**, never a blank screen or full-screen spinner | Throttle network; first paint shows skeleton geometry |
| G3 | Errors show human copy + **correlation code** (`createCorrelationCode`) + Retry | Force a failure; code is visible and copyable |
| G4 | **Contrast ≥ 4.5:1** for body text in light and dark (tokens in `sodia-core/design-tokens.ts`) | Automated contrast check on token pairs; spot-check screens |
| G5 | **No text below 11 pt/px** (`MIN_FONT_SIZE`) | `grep` for `fontSize` < 11 returns nothing |
| G6 | Touch targets ≥ **44 pt** (`MIN_TOUCH_TARGET`), via size or `hitSlop` | Accessibility inspector |
| G7 | Every icon-only control has an accessible name and role | VoiceOver / TalkBack / axe sweep |
| G8 | Back navigation works: Android hardware back (mobile), browser back + deep links (web) | Manual nav pass |
| G9 | Type-safety: zero `any`, zero `select('*')` | `tsc --noEmit` + grep in CI |
| G10 | Mobile lists use FlashList; animations run on the UI thread (Reanimated) | Code review + grep |
| G11 | Web: responsive at 390 / 768 / 1440 px, no horizontal page overflow; visible `:focus-visible` ring | Playwright viewport sweep + keyboard Tab pass |
| G12 | Non-destructive feedback uses toast + haptic; blocking `Alert` only for destructive confirms | Code review |

---

## 2. Mobile — Sodia consumer app

| Feature | Counterpart (bar to meet) | Must-have behaviours | Acceptance criteria |
|---|---|---|---|
| **Sodia feed & stories** | Instagram | Stories tray header, infinite feed, double-tap like with heart burst, optimistic counts, pull-to-refresh, tap facility tag → bottom sheet (never a route push) | FlashList with stories as header; like toggles instantly and survives scroll; facility tag opens sheet over the feed; empty feed shows "Follow athletes & clubs near you" + CTA; 3 post skeletons on load |
| **Comments** | Instagram comments sheet | Draggable sheet, keyboard-aware input, reply threading | `@gorhom/bottom-sheet` with snap points + pan-to-close; empty "Be the first to comment"; failed send shows "Failed • Tap to retry" |
| **Post composer** | Instagram / Threads | Live character counter, media attach, draft preserve | `postCaptionSchema` (280c) inline error + counter turns red; Post disabled while invalid; draft survives sheet close |
| **Inbox & DMs** | Instagram DMs / WhatsApp | Unread badges, search, message bubbles, send states | FlashList for threads and messages; search with zero matches → `no_search_results`; offline shows cached threads with banner |
| **Discover map** | Google Maps / ClassPass | Category pills, search, pin → sheet, list view, "Search this area" | Location denied → blurred map + "Enable Location" (`Linking.openSettings`) + City/Zip fallback input (Spec Phase 3); zero results → "Reset filters" + suggestions |
| **Facility sheet & checkout** | ClassPass booking / Apple Pay sheet | Pass options, single fee line, secure-pay lock, confirmation with next action | One consolidated **"Service Fee"** line (₱15 one-time / 5% recurring); sheet non-dismissible while "Securing your slot…"; success → "You're in!" + "Show QR" / "Share to Sodia"; `<18` payment hard-block |
| **Cards (VIP wallet)** | Apple Wallet | Card stack, tap to flip to QR, offline code | QR rotates every 60 s from local TOTP (`sodia-core/totp.ts`), no server ping; offline flip shows 6-digit code + countdown ring; empty "Add your first pass" |
| **Fitness SOA ledger** | Bank / GCash statement | Searchable ledger, receipt detail | FlashList rows; search miss → `no_search_results`; ledger is read-only (append-only rule) |
| **Lift tracker** | Hevy / Strong | Set grid, check-off, floating rest timer, PR flag | Rest timer with +15 s / −15 s / Skip; haptic on set check; numeric bounds validated (`workoutSetSchema`); in-progress workout never interrupted by session expiry |
| **Move tracker** | Strava | Live GPS trail, pace/distance, pause/resume | Background-location denied → warning + Settings link; manual entries flagged `is_manual` (ineligible for challenges) |
| **Food tracker** | MyFitnessPal | Macro rings, search/NLP log, barcode, manual entry | Search/barcode miss routes to **"Add it manually"**; Nutritionix failure falls back to recents without blocking logging |
| **Profile & role portals** | Strava profile / Instagram professional dashboard | Trophy case, role switch to Staff/Coach/Organizer | Role shell mounts instantly from cached roles; Trophy case entries immutable (hide only) |
| **Settings & theme** | iOS Settings | Grouped settings, theme switch | Theme switch re-renders all tokens with AA contrast in both modes |

---

## 3. Web — Business Suite (GymDash / Clubdash / CoachDash / Organizer)

| Feature | Counterpart (bar to meet) | Must-have behaviours | Acceptance criteria |
|---|---|---|---|
| **Shell & navigation** | Linear / Stripe Dashboard | URL per view, collapsible nav, theme persistence | Each tab is an App Router route (back/forward + bookmarks work); dock → collapsed (768–1023) → bottom bar (<768); theme persists and honours `prefers-color-scheme` |
| **GymDash front desk** | Mindbody / Glofox / PushPress | Live "Inside Now", check-in feed, turnstile status, shift float open/close | Live counter via `supabase.channel()` with `removeChannel` cleanup; shift PIN + cash count zod-validated inline; close-out shows variance |
| **Athletic CRM inbox** | Intercom / Front | Channel filters, search, unread counts, keyboard triage | Debounced search; `j`/`k` thread nav, `/` focuses search; empty / no-results / error states; broadcast composer modal is an accessible dialog (Esc, focus trap, focus return) |
| **Spatial calendar (courts)** | Playtomic / Google Calendar | Court × time grid, booking create, conflicts | Bookings violating the **15-min changeover buffer** (`REGISTRY_HARD_LIMITS.COURT_CHANGEOVER_BUFFER_MINUTES`) are blocked with inline reason; empty day state |
| **Performance & engagement** | Stripe / Amplitude | KPI tiles, trend charts, sortable tables | Tables scroll inside their card on narrow screens; skeletons on load; charts labelled for screen readers |
| **Daily dash & triage** | Front-desk task queue / Zendesk views | Prioritised task list, status chips | Empty "All caught up"; error boundary with correlation code + Retry |
| **Sodia mobile preview** | Figma prototype frame | Device-framed preview of the consumer app | Must mirror mobile behaviour; tracked as drift risk (see §5) |

---

## 4. QA execution checklist (per release)

1. `pnpm install` → `pnpm --filter @getphysical/mobile typecheck` → `pnpm --filter @getphysical/web typecheck` → `pnpm --filter sodia-core exec tsc --noEmit` all green.
2. `npx expo export --platform android` (mobile bundle resolves, Reanimated/Gesture Handler config valid).
3. `npx next build` (web compiles all routes).
4. Playwright sweep of every web route at 390 / 768 / 1440 px: no console errors, no horizontal overflow, focus ring visible on Tab.
5. Grep gates: `: any|as any`, `select\(['"]\*`, `<FlatList`, `<svg` (icons), `fontSize` < 11, bare `outline: none`.
6. Manual device pass (iOS + Android): G1–G8 for each row in §2, light and dark mode, VoiceOver/TalkBack on BottomBar, HeaderBar, post actions, sheets.
7. Record results in the PR description with screenshots of each state.

---

## 5. Known gaps & follow-ups (tracked, not yet delivered)

- **Device runtime not yet verified:** mobile passes `tsc` and `expo export --platform android` (Hermes bundle), but the
  bottom-sheet v5 + gesture-handler 3 + Reanimated 4 combination has not been exercised on a physical device/simulator.
  First QA pass on device must cover sheets, double-tap like, card flip, toasts and Android back.
- **Data layer:** TanStack Query is wired on mobile (feed query, checkout mutation, offline-first client) and web uses
  Server Components + Server Actions, but data is still seeded locally. Supabase queries with explicit column selectors
  and SQLite offline persistence are the next milestone. Web "Inside Now" is a local counter, not yet a realtime channel.
- **Live state detection:** `slow_network` (RTT measurement) and `session_expired` (biometric re-auth; needs
  `expo-local-authentication`) render correctly when fed, but no screen detects them yet.
- **Cards QR:** TOTP code is generated locally and shown on flip, but no QR renderer is installed, and the TOTP seed is
  derived from IDs rather than the Secure Enclave JWT.
- **Auth & onboarding:** onboarding/OTP/biometric flow (Spec Phase 1) is not implemented in the demo.
- **Web styling system:** Tailwind + Shadcn (AGENTS.md §2) not yet adopted; current web styles are inline objects + `globals.css`. Migration should be its own PR.
- **Maps:** Discover uses a Leaflet WebView, not `@rnmapbox/maps` (AGENTS.md §2).
- **Web CRM REST routes** (`apps/web/src/app/api/crm/*`) are kept because the mobile app calls them over the network; Server Actions cannot be called from React Native. Revisit once Supabase Realtime carries CRM messages end-to-end.
- **Duplicate UI:** `apps/web/src/components/mobile-app` + `figma` re-implement the mobile app for the web preview and will drift; consider React Native Web or screenshots instead.
- **Web charts** use hand-written SVG sparklines/gauges; AGENTS.md bans inline SVG for icons — charts are acceptable but should move to a charting component when the styling system lands.
