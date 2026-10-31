# GetPhysical Master Ecosystem Specification & 10-State User Flow Matrix

**Version:** 4.1.0 (Consolidated End-to-End Blueprint — All Gaps Resolved & Locked)  
**Scope:** Sodia B2C (`apps/mobile`), Mobile Role Portals (`apps/mobile`), GymDash / Clubdash / CoachDash Web OS (`apps/web`), and Shared Core (`packages/sodia-core`).

---

## 1. Gap Closures & Resolved `[OPEN]` Decisions (Locked Truth)

To eliminate ambiguity across earlier draft documents, the following architectural decisions are permanently **LOCKED**:

| # | Domain | Resolved Specification (Locked) |
| :--- | :--- | :--- |
| **1** | **Fee Model & Stacking** | **Hybrid Consumer Fee:** Fixed **₱15** on one-time passes, court bookings, and event tickets; flat **5%** on recurring memberships. Displayed as a single consolidated `"Service Fee"` line in the Universal Checkout sheet. Platform B2B commission (if applicable per facility tier) is settled net inside the Xendit/Stripe split ledger without adding a second consumer line item. |
| **2** | **Payment Gateways** | **Xendit xenPlatform** for Registry A (Commercial Gyms) and B2C pass/subscription checkouts. **Stripe Connect Split Ledgers** for Registry B (Tournament/Event splits between Organizer + Facility) and Registry C (Coach session packs + automatic ₱150/session Gym Floor Fee deductions). GetPhysical is never the Merchant of Record. |
| **3** | **Minors & Age Gate Policy** | **13+ to join:** Users under 13 are hard-blocked at Screen 4 (`DOB` validation). **13–17 (Minor Tier):** Restricted to social feed, workout/food logging, and free Community Clubs; payments/paid subscriptions are hard-blocked at checkout, public location tags are disabled, and DMs default to `"Followers Only"`. |
| **4** | **Sponsored / Boosted Cards** | Deferred to Phase 2. Schema includes `is_sponsored BOOLEAN DEFAULT false` on WRE Discovery Cards; when enabled later, UI must render a mandatory `"Sponsored"` badge. |
| **5** | **Coach Programs vs. Templates** | No paid standalone program packages in v1. Coaches share custom workout templates (`allow_client_share` toggle: `true` for general templates, `false` for personalized client plans) and push live macrocycles via `planned_track`. |
| **6** | **Duplicate Challenge Entries** | **Replace Best Attempt:** Submitting a superior verified attempt overwrites the user's previous active leaderboard row (preserving historical logs in `workout_logs`) to keep leaderboards clean. |
| **7** | **Challenge Types at Launch** | **Lift** (requires video + verified set log) and **Move** (auto-synced GPS/wearable log) are active at Day 1. Court-sport challenges use rivalry match verification (`@opponent` confirmation) and are excluded from automated PR leaderboards in v1. |
| **8** | **Offline QR Fallback (TOTP)** | When `apps/mobile` has no network, tapping the center VIP Card flips 180° to a deterministic **6-digit TOTP code** (seeded by the Secure Enclave JWT secret + 60s epoch window) alongside a ticking 60s ring. Front-desk staff enter the 6-digit TOTP into the offline GymDash Quickdash tablet, which validates against its shift-start SQLite `active_passes` cache and queues the scan in `local_sqlite_queue` with an idempotency key. |
| **9** | **Stories Audience** | Close Friends list is retired for launch. Users control visibility via the account-level `is_private` toggle (`Followers` vs `Public`) and per-story `allow_replies` toggle. |
| **10** | **Repost Attribution** | `sodia_posts` includes `source_repost_id UUID NULL` and `wallet_transactions` includes `attributed_post_id UUID NULL` to silently record conversion attribution in the database; affiliate payout UI is deferred. |
| **11** | **Anti-Cheat Threshold** | Any submitted Lift challenge entry exceeding **+15%** over the user's historical verified Epley 1RM (or missing tracker-origin / failing Location Lock geofence or active VIP check-in window) is auto-flagged `status = 'under_review'` and hidden from public leaderboards pending admin/host review. |
| **12** | **Trophy Case & Account Deletion** | Verified entries in Profile Tab 2 (Trophy Case) are **immutable** (deletion blocked); users may toggle `hidden_from_public = true` (eye icon). Account deletion requires FaceID/Biometrics, checks `passes` for active subscriptions (hard-blocking deletion until cancelled/expired while offering `"Deactivate Instead"`), and enforces a **30-day soft-delete grace period**. On Day 31, PII in `public.profiles` is wiped while `ledger_transactions` are anonymized to `"Anonymous / Deleted User"` to keep B2B financial reports 100% intact. |
| **13** | **GP+ Subscription Perks** | **GetPhysical+ (₱149/mo)** unlocks: unlimited Headstart Program Wizard runs (non-members get 1 free run), the Periodization Programmer (4/6/8/12-week Linear or %-based auto-load progression), 1 automatic Monthly Streak Freeze, and the black `"GetPhysical+"` Active Roster badge. |
| **14** | **Streaks & Timezone** | Weekly streak increments when a user logs `N` verified activities (default `N = 3`, configurable `1–7` in Settings; includes Lift logs, GPS/Court Move logs, and QR gym check-ins; excludes manual Move entries). Week boundary is **Monday 00:00 `Asia/Manila` (UTC+8)**. `"Streak at risk"` push fires Saturday 18:00 `Asia/Manila` if below goal. |
| **15** | **Gift Pass Rules** | Purchase-direct flow (`"Gift"` button on Cards Hub or `"Buy as gift"` toggle in Universal Checkout). Valid for Day Passes and Event Tickets (recurring memberships and base VIP cards are non-giftable). Unused gift passes carry a **30-day validity window**; sender may cancel for a full reversing-entry refund prior to recipient's first QR scan. |

---

## 2. Strategic Application of the 10 States (Global Contract)

Every screen, bottom sheet, and data flow across `apps/mobile` and `apps/web` must implement all **10 Canonical States** using `TenStateEnvelope<T>` from `sodia-core`:

1. **`empty`**: Zero-record state with contextual illustration, single-line explanation, and 1 primary CTA.
2. **`loading`**: Layout-accurate shimmer skeletons (never blank white/black screens).
3. **`error`**: Structured error card/toast with human-readable cause, correlation code, and `"Retry"` action.
4. **`no_internet`**: Persistent offline banner + local cache hydration (TanStack Query persistence / SQLite queue / 60s TOTP fallback).
5. **`slow_network`**: Triggered when RTT exceeds `2500ms`; engages optimistic UI mutations, debounces duplicate taps, and pauses high-bitrate video prefetching.
6. **`no_search_results`**: Triggered when debounced search/filter yields `0` rows; offers `"Clear Filters"`, WRE-ranked nearby suggestions, or `"Add Manually"` fallback.
7. **`permission_denied`**: Triggered when OS permission (Location, Camera, Contacts, HealthKit/Garmin, Biometrics) is denied; renders non-breaking fallback UI + `"Open Settings"` deep link.
8. **`session_expired`**: Triggered when access JWT is stale/locked; invokes native Biometric prompt to refresh via Secure Enclave token without losing unsaved form/workout drafts.
9. **`form_validation`**: Real-time `react-hook-form` + `zod` field-level validation (inline error copy, border highlight, shake animation, and character counters).
10. **`success`**: Confirmed or optimistic state transition with haptic feedback, ledger/cache invalidation, and contextual next-step CTA (`"Share to Sodia"`, `"Show QR"`).

---

## 3. End-to-End Frontend-Backend 10-State User Flow Matrices

### Phase 1: Identity, Auth & Onboarding (`apps/mobile`)
* **Screens:** Splash, Force-Update, Auth Landing (+63 Phone / Apple / Google SSO), 6-Box OTP Verification, Basic Info (Avatar, Name, `@username`, DOB Age Gate), Preferences (Home Location, 1–5 Fitness Goals), Find Friends & OS Permission Primers.

| State | Frontend Behavior & UX | Backend / System Operation |
| :--- | :--- | :--- |
| **`empty`** | New profile setup screens start with clean guided inputs; Find Friends with zero contact matches displays `"No contacts found on GetPhysical yet"` + WRE local suggested athletes. | Queries `public.profiles` by `home_location` when contact hash intersection returns `[]`. |
| **`loading`** | Splash renders branded emblem pulse while reading Secure Enclave; OTP & Username checks show inline spinner inside input suffix. | Asynchronous read from `expo-secure-store`; debounced RPC `check_username_available`. |
| **`error`** | Rate-limit banner (`"Too many OTP attempts. Try again in Xm"`) or SSO handshake failure toast with `"Retry"`. | Supabase Auth rate-limit `429` or RPC exception mapped to `TenStateEnvelope` error state. |
| **`no_internet`** | If valid token exists in Secure Enclave on launch, opens Sodia in read-only cached mode with top `"Offline Mode"` banner. On Auth screens, disables `"Send OTP"` with offline retry banner. | Hydrates TanStack Query cache from device storage; queues profile preference edits locally. |
| **`slow_network`** | Shows `"Verifying code, connection is slow..."` helper text after `2.5s`; locks OTP boxes to prevent double-submit. | Extends RPC timeout to `15s` with idempotency key on `public.profiles` upsert. |
| **`no_search_results`** | Home Location city/neighborhood autocomplete returns `"City not found — select nearest metro area"`. | Queries PostGIS gazetteer index; falls back to macro region coordinates. |
| **`permission_denied`** | Contacts denied -> switches Find Friends to `"Search by @username"`. Camera/Photos denied on Avatar -> falls back to default monogram avatar picker. | Skips contact SHA-256 hashing; logs permission state locally to avoid nagging OS prompts. |
| **`session_expired`** | Splash Condition B (token stale/locked) -> triggers native FaceID/Biometric prompt. Failure routes to Auth Landing. | Exchanges Secure Enclave refresh token for fresh short-lived access JWT. |
| **`form_validation`** | Invalid +63 phone (inline error); wrong 6-digit OTP (horizontal shake + red border); `@username` taken (red badge + 3 live available suggestions); `DOB < 13` (`"You must be 13 or older"`, Next disabled); Goals `<1` or `>5` blocked. | Enforced via Zod schema in `sodia-core` and Postgres `CHECK` constraints on `public.profiles`. |
| **`success`** | Valid OTP auto-advances; `"Complete Profile"` seeds WRE cold-start weights and transitions to Sodia Main Feed. | Writes `public.profiles` and `user_preferences` JSONB; initializes `user_weights`. |

---

### Phase 2: Sodia Social Engine, Stories, PR Challenges & Inbox (`apps/mobile`)
* **Screens:** Sodia Main Feed (WRE Discovery Card every 4th/5th slot + Streak Chip), Story Creator & Viewer (24h expiry, Location Tags, Draggable Stamps, `"Post As"` Toggle), Post Creator & Viewer, Comments & Live Leaderboard, Repost/Quote Sheet, Create/Submit Verified PR Challenge, Activity (Heart), Inbox & DM Threads (with B2B Staff Handshake Cards & Coach Raw Data Bubbles), User/Facility/Coach Profiles, Albums (Before/After Compare), Bookmarks.

| State | Frontend Behavior & UX | Backend / System Operation |
| :--- | :--- | :--- |
| **`empty`** | New user feed -> `"Follow athletes & clubs near you"` + suggested roster. Empty Activity -> `"Nothing yet. Post or accept a challenge."` Empty Bookmarks -> `"No saved items yet"` + `"Explore Discover"`. | WRE view `wre_feed_view` falls back to geo-proximate public posts when `follows` count is `0`. |
| **`loading`** | `@shopify/flash-list` renders 3 post card skeletons and 6 circular story ring skeletons. | Fetches paginated cursor using explicit column selector (zero `select('*')`). |
| **`error`** | Feed/Comment/Upload failure shows inline retry banner; failed DM bubble displays red `"Failed to send • Tap to retry"`. | Failed FFmpeg/Storage upload preserves local temp media URI and coordinate JSON for 1-tap retry. |
| **`no_internet`** | Renders cached Sodia feed and cached DM threads;Likes/Bookmarks queue optimistically; Story/Post creation saves to `"Offline Drafts"`. | TanStack Query mutation queue persists likes/bookmarks and flushes on reconnect. |
| **`slow_network`** | Autoplay videos downgrade to static poster + tap-to-load; `"Posting..."` progress bar stays pinned at top of feed while background upload completes. | Multipart chunked upload to Supabase Storage with 720p H.264 compression. |
| **`no_search_results`** | Inbox thread search, `@mention` lookup, or Facility tag picker shows `"No matching users or facilities"`. | Indexed prefix query on `profiles.username` and `facilities.name`. |
| **`permission_denied`** | Story/Lift Challenge camera or mic denied -> shows Permission Primer with `"Enable Camera & Mic in Settings"` button + gallery picker fallback where allowed. | Blocks live viewfinder mount; prevents unhandled native camera crash. |
| **`session_expired`** | Attempting to post, accept a B2B Staff Handshake, or submit a challenge entry with a stale token triggers biometric re-auth while keeping caption/media intact. | Preserves draft state in Zustand + local storage across token refresh. |
| **`form_validation`** | Post caption `>280c`, Challenge entry/Bio `>150c` blocked with live character counter; Challenge entry rejected if manual log, outside date window, or Location Lock geofence/check-in mismatch (`"This lift must be logged at [Facility]"`). | Server RPC verifies `workout_logs.is_manual = false`, timestamp window, PostGIS geofence / `access_scans`, and `>15%` 1RM jump anti-cheat rule. |
| **`success`** | Double-tap heart animates on UI thread; Challenge accept injects Bounty into Track tab; `"Post to Story"` composites stamp and auto-pins verified stamp to Profile Tab 2 (Trophy Case). | Inserts `sodia_posts` / `user_bounties`; replaces previous best attempt on leaderboard if duplicate user entry. |

---

### Phase 3: Discover Mapbox Engine (`apps/mobile`)
* **Screens:** Full-screen Mapbox Canvas with Dynamic Pins (Standard Logo, Glowing Fire Challenge Pin, 24h Coach Pin, Zoom Clusters), Top Search Overlay, Category Filter Pills (`All`, `Gyms`, `Pickleball`, `Basketball`, `Run Clubs`, `Padel`, `Coaches`, `Challenges`, `Open Now`), Map Pin `@gorhom/bottom-sheet`, Sortable List View, Location Denied Fallback.

| State | Frontend Behavior & UX | Backend / System Operation |
| :--- | :--- | :--- |
| **`empty`** | `"No clubs or active challenges in this area yet"` in current map viewport with `"Expand Search Radius (25km)"` CTA. | PostGIS `ST_DWithin` query returns `0` facilities in bounding box; expands radius on CTA tap. |
| **`loading`** | Map tiles render with translucent pill shimmer and bottom-sheet placeholder cards. | Parallel fetch of viewport pins and live capacity counts (`inside_now_count / max_capacity`). |
| **`error`** | Mapbox tile or PostGIS query error renders non-blocking top pill `"Couldn't refresh map pins • Retry"`. | Retains last-known pin array in memory; retries RPC with exponential backoff. |
| **`no_internet`** | Displays cached map tiles and last-cached facility directory; live capacity badge shows `"Capacity: Offline"`. | Reads persisted facility list from local cache. |
| **`slow_network`** | Disables real-time pan-to-fetch; shows `"Search this area"` manual trigger button to conserve bandwidth. | Throttles bounding-box RPC queries and suspends high-res cover image prefetching. |
| **`no_search_results`** | Typing `"Pickleball"` with strict filters yielding 0 matches shows `"No exact matches"` + WRE-ranked `"Trending Near You"` alternatives and `"Reset Filters"`. | Clears secondary amenity/price filters while preserving sport category intent. |
| **`permission_denied`** | **Locked Spec 3.6:** Applies `blurView` over map canvas with message `"We need your location to find nearby clubs and challenges"`, primary `"Enable Location Services"` (OS Settings deep link), and secondary manual `"Search by City or Zip Code"` input. | Hard-blocks GPS telemetry until OS permission is granted or a manual City/Zip coordinate seed is established. |
| **`session_expired`** | Tapping `"Accept Challenge"` or `"Book Court"` from a Map Pin bottom sheet triggers biometric refresh without closing the bottom sheet. | Re-authenticates session in-place and resumes bottom-sheet action. |
| **`form_validation`** | Manual Zip/City fallback validates Philippine postal codes / valid city names; custom price/distance filter validates numeric bounds. | Zod schema validates coordinate seed and filter range parameters. |
| **`success`** | Tapping a search result smoothly pans/zooms camera to pin and snaps open the Facility `@gorhom/bottom-sheet` with social proof (`"3 friends checked in"`). | Subscribes to facility's live capacity WebSocket channel; cleans up via `supabase.removeChannel()` on sheet dismiss. |

---

### Phase 4: Cards (3D VIP Wallet), Fitness SOA & Universal Checkout (`apps/mobile`)
* **Screens:** 3D Vertical Card Stack (Front face + 180° flip to 60s Dynamic QR & TOTP fallback + auto max brightness), Scan & Gift Action Row (`Scan`, `Gift`, `+ Add Pass`), Fitness SOA Scrolling Bottom-Sheet Ledger (with Search, Date Filter, PDF Export, Receipt Detail Sheet & `"Get Help"`), Universal Checkout Bottom Sheet (Day Pass, Monthly Sub, Court Booking, Event Ticket, Buy as Gift).

| State | Frontend Behavior & UX | Backend / System Operation |
| :--- | :--- | :--- |
| **`empty`** | Cards Hub shows illustration `"Add your first pass"` with `"Scan QR"` and `"Find a Gym"` CTAs. SOA Ledger shows `"No transactions yet"`. | Queries `passes` (`status IN ('active', 'expiring_soon', 'paused', 'used_today')`) and `ledger_transactions`. |
| **`loading`** | 3D card stack shimmer + 5 single-line SOA ledger row skeletons. | Fetches passes and paginated SOA rows using `EXPLICIT_COLUMNS.PASSES` and `EXPLICIT_COLUMNS.LEDGER_TRANSACTIONS`. |
| **`error`** | Payment declined, gateway timeout, or `"Slot just taken! [Join Waitlist]"` when a concurrent DB lock blocks court checkout. | **Deep Dive 24:** 3-minute pessimistic lock on inventory row; never double-charges; shows pending state until Xendit/Stripe webhook confirms. |
| **`no_internet`** | **Deep Dive 17:** Owned cards remain accessible; flipping center card generates a local **6-digit TOTP fallback code** (`e.g. 482-911`) with 60s countdown ring. Checkout buttons show `"Connect to internet to purchase"`. | Local HMAC-TOTP calculation seeded by Secure Enclave token; zero server ping required for gate entry. |
| **`slow_network`** | During `"Confirm & Pay"`, locks sheet dismissal and displays `"Securing your slot — please do not close..."` to prevent race-condition abandonment. | Holds idempotency key across Xendit xenPlatform / Stripe Connect split payment request. |
| **`no_search_results`** | SOA Ledger search/date filter or Gift recipient `@username` search returns `"No matching transactions or users"`. | Filtered query on `ledger_transactions` or `profiles.username`. |
| **`permission_denied`** | Camera denied on `"Scan"` (Join Facility standee) -> switches modal to manual Facility Code / Directory Search input. Biometric denied on `"Confirm & Pay"` -> prompts device PIN/passcode fallback or blocks high-friction checkout. | Enforces high-friction auth rule on checkout while keeping QR generation zero-friction. |
| **`session_expired`** | High-friction biometric prompt refreshes stale session directly inside the Universal Checkout sheet before executing payment hold. | Refreshes JWT prior to invoking checkout Edge Function / Server Action. |
| **`form_validation`** | Validates Court Booking extras (date, time slot, duration, player count within court cap), Promo Code validity, Gift recipient eligibility (existing user, non-membership SKU), and Minor Age Gate (`<18` payment hard-block). | Validates via Zod + Postgres RLS and inventory capacity constraints. |
| **`success`** | Pass injects into 3D stack with spring animation; SOA logs `"Day Pass • Twins Fitness"` (or `"Gift Sent"` / `"Gift Received"`); confirmation sheet displays `"You're in!"` with `"Show QR"` and `"Share to Sodia"`. | Writes immutable row to `ledger_transactions`, provisions `passes` row, and routes split payout via webhook. |

---

### Phase 5 & 8: Track (Trinity Engine: Lift, Move, Food), Headstart, Journey, Streaks & Badges (`apps/mobile`)
* **Screens:** Track Top Toggle (`Lift | Move | Food`) + `"Today"` Summary Strip, Lift Dashboard & Active Workout Grid (Set Types, Floating Rest Timer `+15s/-15s/Skip`, 1RM Calculator, Template Builder, Periodization Programmer, Headstart Exercise Bank & GP+ Program Wizard), Move Dashboard & Live Tracker (GPS Mapbox Trail, Multisport `T1/T2`, Court Mode with `@opponent` Rivalry Verification, Wearables Sync), Food Dashboard (4 Macro Widgets, Hydration Counter, Nutritionix NLP Search, Barcode Scanner, Manual Log, My Meals, NASM Target Calculator, Monthly Calendar), Universal Share Harness & Stamp Editor, Journey Hub, Streaks, Achievement Badges (12 Launch Set), Personal Bests.

| State | Frontend Behavior & UX | Backend / System Operation |
| :--- | :--- | :--- |
| **`empty`** | First-run Food Tracker prompts `"Calculate your NASM Macro Targets"`. Empty Lift Templates prompts `"Use Headstart Wizard or Create Template"`. Journey with 0 weigh-ins/photos prompts `"Log first weigh-in"`. | Checks `user_targets`, `workout_templates`, and `weigh_ins` tables. |
| **`loading`** | Skeleton rings for Macros and Weekly Mileage; shimmer rows for Exercise Bank and Workout History. | Hydrates local SQLite / TanStack Query cache first, then background-fetches delta from Supabase. |
| **`error`** | Nutritionix API failure or wearable OAuth error falls back to cached `"Recent & Favorites"` food list and manual macro entry with `"Retry Sync"`. | Catches third-party API errors gracefully without blocking food/workout logging. |
| **`no_internet`** | **Deep Dive 6 & 28:** Full offline logging for Lift sets, GPS Move runs, and Food items. If battery dies or app force-quits mid-run, local SQLite `active_run` / workout draft persists and prompts `"Resume active workout/run?"` on reboot. | Writes every checked set and GPS coordinate breadcrumb to local SQLite with idempotency keys; syncs to `workout_logs` / `actual_track` upon reconnection. |
| **`slow_network`** | Checking off a Lift set or tapping a `"My Meals"` pill updates UI and starts Rest Timer in `<16ms` on the UI thread while background sync queues silently. | Optimistic cache update; WRE `user_weights` cron recalculates asynchronously on the backend. |
| **`no_search_results`** | **Deep Dive 7:** Unrecognized UPC barcode scan or NLP food search (`0` matches) routes immediately to Manual Log Modal (`"Item not found. Enter macros manually"`); unlisted exercise search offers `"+ Custom Exercise"`. | Fallback route from barcode/NLP parser to manual `user_nutrition_logs` / custom exercise creation. |
| **`permission_denied`** | Background Location denied in GPS Move mode -> warns `"Background tracking disabled; screen must stay on"` with Settings deep link. Barcode camera denied -> opens text search. HealthKit/Garmin denied -> shows manual sync instructions. | Degrades GPS tracker to foreground-only watcher or indoor Manual Entry mode (marked `is_manual = true`, ineligible for PR Challenges). |
| **`session_expired`** | Never interrupts an active workout or live GPS run! Session refresh is deferred until workout completion (`"Finish"`) before cloud sync. | Local SQLite stores completed session first, then triggers biometric token refresh to upload. |
| **`form_validation`** | Validates NASM Calculator inputs (Age, Weight, Height), 1RM Calculator inputs, Set Weight/Reps numeric bounds, and Court Post-Match Score + `@opponent` tag. | Zod validation schemas in `sodia-core`; Epley 1RM math calculated deterministically. |
| **`success`** | Workout Finish triggers confetti modal, flags new PRs against `personal_bests`, updates weekly Streak & 12 Achievement Badges, syncs `actual_track` with CoachDash, and launches Stamp Editor (`Pinch/Drag/Tap-to-Invert`) for Sodia sharing. | Commits `workout_logs`, recalculates `personal_bests`, evaluates badge unlock triggers, and updates WRE `user_weights`. |

---

### Phase 6 & 7: Settings, Safety, Moderation & Role Switching (`apps/mobile`)
* **Screens:** Business & Operations (`Switch to Business Mode`, `Switch to Coach Dash`, Identity Chooser), Account (Payment Methods, Subscriptions & GP+, Personal Info, Privacy, Account Actions: Download Data / Deactivate / Delete Account), App Settings (Theme, Default Launch Screen `Sodia | Cards`, Streak Goal `1–7`, Notifications, Wearable Integrations, Permissions Overview), Support & Legal (Contextual Support Chat with `transaction_id` pre-attached), Report/Block/Mute Sheets.

| State | Frontend Behavior & UX | Backend / System Operation |
| :--- | :--- | :--- |
| **`empty`** | Blocked Users list -> `"You haven't blocked anyone"`. Subscriptions -> `"No active subscriptions — Explore GP+"`. | Queries `blocked_users` and `subscriptions` tables. |
| **`loading`** | Settings groups render immediate static labels with skeleton badges for dynamic subscription/integration statuses. | Fetches user role array (`public.user_roles`) and linked payment methods. |
| **`error`** | Subscription cancellation or wearable disconnect failure displays actionable retry alert without corrupting local state. | Rolls back optimistic toggle if Xendit recurring schedule update fails. |
| **`no_internet`** | Device-local settings (Theme, Default Launch Screen) update offline; account-critical actions (Change Phone, Cancel Sub, Delete Account) show `"Requires internet connection"`. | Persists local preferences; guards destructive mutations behind network check. |
| **`slow_network`** | `"Switch to Business Mode"` / `"Switch to Coach Dash"` mounts role shell immediately from cached role claims while live roster/scanner hydrates in background. | Uses cached `user_roles` array from verified profile state. |
| **`no_search_results`** | Help Center / FAQ search returns `"No articles found"` + `"Contact Support"` button. | Routes user directly to Support ticket creation. |
| **`permission_denied`** | Permissions Overview screen highlights any denied OS permission in amber with 1-tap deep links to OS Settings; FaceID denied on `"Delete Account"` blocks deletion until biometric/passcode is verified. | Enforces high-friction biometric check on destructive account actions. |
| **`session_expired`** | Opening Payment Methods, Personal Info, or Account Deletion prompts biometric re-authentication. | Requires fresh JWT within 5-minute security window for sensitive account mutations. |
| **`form_validation`** | **Deep Dive 15:** Tapping `"Delete Account"` queries `passes` for active entitlements; if active subscriptions exist, triggers a **Hard Block Modal** (`"You have active gym passes. Please cancel subscriptions or wait for expiry before deleting"`) and offers `"Deactivate Instead"`. | Server Action / RPC verifies `COUNT(*) = 0` on active recurring `passes` before starting 30-day soft-delete timer. |
| **`success`** | Role switch tears down B2C nav stack and mounts Staff QR Scanner / CoachDash; Block removes mutual visibility immediately; Report submits with follow-up Block/Mute options. | Writes to `reports` / `blocked_users`; nullifies mutual social graph visibility via RLS. |

---

### B2B & B2B2C Ecosystem: GymDash (Registry A), Clubdash & Organizer Pro (Registry B), and CoachDash (Registry C) (`apps/web` & `apps/mobile` Role Portals)
* **Interfaces:**
  * **GymDash (`apps/web` & Tablet):** Staff Mobile Selfie Clock-In (HR geofenced), Register Float Gate (PIN + Opening Cash Float + Mid-Shift/End-Shift Blind Count), Daily Dash (Left: Live QR/TOTP Scanner & Shift KPIs; Right: Bifurcated `[Access] | [Store]` POS Till with Data Gate & Mixed-Cart Tendering lock), SKU Engine (Immutable Versioning V1 -> V2 & Archiving), Owner Command Center (Time-Frame Dropdown, Growth Net Equation, `"Needs Attention"` Triage Queue, Predictive Attrition CRM `"At-Risk"` Win-Back, Gate-vs-Till Gap, Hourly Heatmap Off-Peak SKU generator, Legacy CSV Data Import Wizard).
  * **Clubdash & Organizer Pro (`apps/web` & `apps/mobile`):** Spatial Sub-Division Engine (Parent Basketball Court <-> Child Pickleball Courts A/B/C + 15-min auto changeover buffer), Dual-Membership Identity Matrix (Tier 0 Base Waivers), Mobile Funnel Builder (3-Step Wizard + Dynamic Scarcity Pricing), JSON Universal Bracket Engine, Game-Day Command Center (Live Score -> Global Bracket Update -> Stripe Connect Split Settlement), Cascading Refund & Void Clawback, Squatter Detection (`quickdash_scans` vs `booking_capacity`).
  * **CoachDash (`apps/web` & `apps/mobile`):** Morning Compliance Triage (`planned_track` vs `actual_track` 3-day negative delta -> auto check-in nudge), Live Floor Roster (`Expected` -> `[IN BUILDING]` via Dual-Authorization QR scan + ₱150 Floor Fee split), Video Form-Check Comms Hub, Agnostic Cycle Builder (`JSONB`), 3-Client Free Cap (enforced via RLS).

| State | Frontend Behavior & UX | Backend / System Operation |
| :--- | :--- | :--- |
| **`empty`** | `"Needs Attention"` Triage Queue -> `"All clear! Zero operational alerts."` Dormant/At-Risk CRM Queue -> `"0 at-risk members/organizers."` | Server Components query aggregated triage views and nightly cron caches. |
| **`loading`** | React Server Components stream dashboard shells with Shadcn skeleton cards for Growth Net Equation, Master Calendar Grid, and POS Till. | Uses Supavisor connection pooler (port `6543`) for parallel RSC queries. |
| **`error`** | **Deep Dive 28:** Tablet camera hardware failure -> Staff taps `"Manual Lookup / Keyboard"` to check in member by Phone/Name (logged as `manual_staff_override`). Cascading tournament refund failure -> Stripe issues negative balance fallback on organizer wallet. | Logs all manual overrides and blind-count discrepancies outside branch tolerance to Manager's `"Needs Attention"` queue. |
| **`no_internet`** | **Deep Dive 1 & 17:** GymDash Quickdash tablet flashes `"OFFLINE"` badge in Top Command Bar; scanner verifies member QRs/6-digit TOTPs against local SQLite `active_passes` cache; Cash POS sales queue locally with idempotency keys and sync automatically via WebSocket on reconnect. | Local SQLite cache downloaded at shift start; flushes `local_sqlite_queue` to `ledger_transactions` upon reconnection. |
| **`slow_network`** | Live `"Inside Now"` counter and Game-Day Bracket scores update optimistically on local terminal while Supabase Realtime broadcast propagates; POS locks `"Provision"` button during tender to prevent duplicate ledger rows. | Idempotent Next.js Server Actions backed by `idempotency_key` unique constraint on `ledger_transactions`. |
| **`no_search_results`** | Walk-in phone lookup on POS Data Gate returns `"No Sodia profile found"` -> offers `"New Offline Walk-In"` (prints receipt with Claim QR for later OTP digitization). | Queries `public.profiles` and `offline_members` (from Legacy CSV Import). |
| **`permission_denied`** | Staff Mobile Selfie Clock-In outside facility geofence or with Camera/GPS denied -> hard-blocks HR Clock-In (`"Must be on-site with camera & location enabled"`). | Validates Haversine distance against `facilities.lat/lng` before inserting attendance record. |
| **`session_expired`** | POS Register Float Gate and Manager Override / Void actions require active Staff/Manager 4-digit PIN (or remote Manager biometric push approval) independent of browser session. | Decouples HR attendance from Cash Drawer liability; binds every till transaction to `active_shift_id`. |
| **`form_validation`** | **POS Mixed Cart Rule:** Adding an `[Access]` SKU + `[Store]` SKU dynamically disables `[Pay via App]` to protect platform split routing, forcing unified Cash/External Terminal tender. **SKU Engine:** Blocks hard deletes and overwrites (creates `V2` row and sets `V1` to `hidden_from_new_sales`). **RLS Caps:** Rejects 20th free Community Club member or 4th free Coach client. | Enforced via Postgres triggers (append-only ledger immutability), spatial parent/child lock constraints, and Supabase RLS policies. |
| **`success`** | Valid gate scan flashes **GREEN** (`+1 Inside Now`) or **BLUE** (Dual-Authorization Coach Client -> flips CoachDash status to `[IN BUILDING]`); capacity breach (`14/10` scans) flashes **RED** on Web OS with 1-tap `"Force Upsell to Organizer"` or `"Enforce Tier 0 Base Waiver"`. | Broadcasts via `supabase.channel()` (cleaned up via `supabase.removeChannel()`); executes Stripe Connect / Xendit split settlements automatically. |
