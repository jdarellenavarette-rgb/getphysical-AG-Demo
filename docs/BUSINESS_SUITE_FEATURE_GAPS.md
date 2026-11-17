# Business Suite — Functional Audit and Feature Gaps

**Date:** 2026-11-17 · **Scope:** `apps/web` on branch `claude/friendly-keller-69beky` · **Companion to:** `QA_BUSINESS_SUITE_ASSESSMENT.md`

**How the comparison was made.** The benchmark is the feature set that gym-management products (Mindbody, Glofox, ABC Fitness, PushPress, Gymdesk, and franchise member apps such as Anytime Fitness), court and club booking products (Playtomic Manager, CourtReserve, ClubSpark, MATCHi) and their built-in CRM, reporting and point-of-sale modules have in common. It is drawn from general knowledge of those products, not from a fresh review of each one, so treat individual vendor details as approximate and the common feature set as reliable.

---

## 1. Where the suite stands

One part of the suite is a working product: member messaging (inbox, replies, broadcasts). Everything else on screen is a labelled sample. The backend, however, already supports far more than the screens use: memberships, segments, door-pass verification, scan history, an append-only sales ledger, payment orders, events with registration, QR codes, staff roles and editable venue details all exist and are tested, with no screen in front of them.

So the gap to industry standard is in two parts: screens that can be built now on the existing backend, and capabilities that need new backend work shared with the mobile app.

---

## 2. Functional audit of what exists

### Fixed in this pass

| Finding                                                                                                             | Type                         | Fix                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Inbox filters "Turnstile / Coach Reviews / At-Risk" never matched any thread                                        | Dead use case                | Replaced with filters on real data: waiting for reply, active members, not active                                 |
| "1-Click Approve Pass" and "Verify 1RM Stamp" could never appear; the second had no action at all                   | Dead control                 | Removed. A "Send renewal reminder" action now shows for members without an active pass                            |
| Broadcast segments ("VIP Pass", "Class Enrollees", …) were invented and always failed with "segment not configured" | Dead use case                | Composer lists only segments the facility has; shows the real number of members reached; blocks sending to nobody |
| Dashboard timeframe selector changed nothing                                                                        | Dead control                 | Removed                                                                                                           |
| "View all" on the performance table opened the court schedule                                                       | Wrong destination            | Removed                                                                                                           |
| Court calendar appeared twice for clubs (dashboard and its own tab)                                                 | Duplicate                    | Removed from the dashboard                                                                                        |
| Court allocator shown to gyms, coaches and organizers; turnstile and till shown to coaches and organizers           | Irrelevant screen            | Each workspace now shows only the sections that apply                                                             |
| Court bookings could not be undone; messages claimed a booking was confirmed                                        | Dead end, false confirmation | Reset control; messages state nothing was created                                                                 |
| Member phone always "—"; thread status and channel fields never set                                                 | Dead data                    | Removed                                                                                                           |
| Notification bell with a permanent red dot and no action                                                            | Dead control                 | Removed                                                                                                           |

### Dead ends that remain because the feature behind them does not exist yet

| Dead end                                                                                           | What is missing                        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| "Ask the owner to add you as staff" on the first-run screen, but an owner has no way to add anyone | Staff management (§3, item 12)         |
| Broadcast segments can be used but not created or filled                                           | Segment manager (item 6)               |
| A member can be messaged but not looked up, added, or viewed                                       | Member directory (item 1)              |
| Settings shows facility details but cannot change them                                             | Venue profile editor (item 3)          |
| Only one facility can ever be created per account from the suite                                   | "Add another facility" (small; item 3) |
| Inbox thread has no read state shared between staff                                                | Read receipts and assignment (item 14) |

---

## 3. Feature comparison

"Backend" says whether the database already supports the feature.

### Members and memberships

| #   | Industry standard                                                                 | GetPhysical today                       | Backend                                |
| --- | --------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------- |
| 1   | Searchable member directory with profile, status, visit history, purchases, notes | None                                    | **Ready** (memberships, scans, ledger) |
| 2   | Add a member at the desk; link an existing app user                               | None                                    | **Ready** (staff can add)              |
| —   | Membership plans with start, end, freeze, cancel, upgrade                         | Day pass and monthly only, no lifecycle | Needs work                             |
| —   | Recurring billing with failed-payment retries                                     | Monthly is a one-off charge             | Needs work                             |
| —   | Waivers and contracts with e-signature                                            | None                                    | Needs work                             |
| —   | Family and corporate accounts                                                     | None                                    | Needs work                             |

### Door and attendance

| #   | Industry standard                                                                  | GetPhysical today | Backend                            |
| --- | ---------------------------------------------------------------------------------- | ----------------- | ---------------------------------- |
| 4   | Check-in by QR, keyfob or manual lookup, with instant allow or deny and the reason | Sample screen     | **Ready** (`verify_pass_code`)     |
| 5   | Live "who is in" count and attendance feed                                         | Sample numbers    | **Ready** (scan history, realtime) |
| —   | Offline fallback at the desk                                                       | None              | Needs work                         |
| —   | Guest and trial check-in                                                           | None              | Needs work                         |

### Scheduling and bookings

| #   | Industry standard                                               | GetPhysical today                            | Backend                               |
| --- | --------------------------------------------------------------- | -------------------------------------------- | ------------------------------------- |
| —   | Day and week calendar per court or room, with drag to book      | Eight fixed time slots, one day, sample only | Needs work                            |
| —   | Pricing rules: peak and off-peak, member and guest rates        | One hourly price                             | Needs work                            |
| —   | Booking rules: advance window, cancellation policy, no-show fee | None                                         | Needs work                            |
| —   | Recurring bookings, waitlists, open matches                     | None                                         | Needs work                            |
| —   | Class timetable with capacity, booking and waitlist             | None (gyms have no schedule at all)          | Needs work                            |
| —   | Personal-training sessions and packs                            | None                                         | Needs work                            |
| 7   | Events and tournaments: create, register, check in              | None                                         | **Ready** (events, registrations, QR) |

### Point of sale and money

| #   | Industry standard                                 | GetPhysical today               | Backend                               |
| --- | ------------------------------------------------- | ------------------------------- | ------------------------------------- |
| 8   | Sales history and settlement view, with export    | None                            | **Ready** (ledger, orders; read-only) |
| —   | Product catalogue with prices, stock and barcodes | Four hard-coded items           | Needs work                            |
| —   | Cash sales, shift open and close, cash-up report  | Removed (was a fake PIN)        | Needs work                            |
| —   | Refunds, discounts, promo-code redemption         | Promo code is display text only | Partly (Stripe refunds only)          |
| —   | Receipts by email or in the app                   | None                            | Needs work                            |
| —   | Tax handling and official receipts                | None                            | Needs work                            |

### CRM and communication

| #   | Industry standard                                                                        | GetPhysical today       | Backend                               |
| --- | ---------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------- |
| ✅  | Two-way member inbox                                                                     | **Working**             | Ready                                 |
| ✅  | Broadcast to all or to a segment                                                         | **Working**             | Ready                                 |
| 6   | Create and maintain segments; rule-based segments (inactive 14 days, expiring this week) | Cannot create segments  | **Ready** for manual; rules need work |
| 9   | Broadcast history with delivered count                                                   | None                    | **Ready**                             |
| —   | Lead capture and sales pipeline (enquiry, trial, joined)                                 | None                    | Needs work                            |
| —   | Automations (welcome, expiry reminder, win-back)                                         | None                    | Needs work                            |
| —   | Email and SMS channels, opt-out handling                                                 | In-app only, no opt-out | Needs work                            |
| 14  | Notes, tags, assignment and read state on a conversation                                 | None                    | Needs work (small)                    |

### Analytics

| #   | Industry standard                                                | GetPhysical today | Backend                       |
| --- | ---------------------------------------------------------------- | ----------------- | ----------------------------- |
| 10  | Attendance by day and hour, active members, new and lost members | Sample numbers    | **Ready**                     |
| 11  | Revenue by day, product and method                               | Sample numbers    | **Ready**                     |
| —   | Retention and churn cohorts, at-risk scoring                     | Sample list       | Computable from existing data |
| —   | Court or class utilisation                                       | Sample            | Needs bookings first          |
| —   | CSV export, scheduled reports                                    | None              | Web only                      |

### Administration

| #   | Industry standard                                                             | GetPhysical today                      | Backend                                                     |
| --- | ----------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| 3   | Edit venue profile: name, address, hours, amenities, prices, capacity, photos | Read-only                              | **Ready**                                                   |
| 12  | Invite staff, set roles, remove access                                        | None in product (database script only) | Needs a small shared change so the mobile app sees the role |
| 13  | Permissions by role (front desk cannot see revenue or broadcast)              | Role loaded, not enforced in screens   | Web only                                                    |
| —   | Audit log of staff actions                                                    | None                                   | Needs work                                                  |
| —   | Two-step sign-in for owners                                                   | None                                   | Configuration plus web                                      |
| —   | Multi-location roll-up                                                        | Switcher only                          | Web only once data is real                                  |
| —   | Payout onboarding and status                                                  | None                                   | Partly                                                      |

---

## 4. Design and usability findings

| Area             | Finding                                                                                                       | Recommendation                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Structure        | All sections live at one address; refresh returns to the dashboard; nothing can be bookmarked or shared       | One address per section                                           |
| Layout           | Fixed-width grids; unusable on a tablet at the front desk                                                     | Responsive layout, tablet first for desk screens                  |
| Consistency      | Front desk and attention screens are hard-coded dark inside a light app; the theme toggle does not reach them | One theme system for every screen                                 |
| Readability      | Much text at 10–11 px; 11 contrast failures remain on the dashboard                                           | 13 px minimum for body text; fix contrast                         |
| Tables           | No search, sort, filter or paging anywhere                                                                    | Standard data table for members, sales, scans                     |
| Feedback         | Loading, empty, error and offline states exist only in the inbox                                              | Apply the 10-state pattern to every data screen                   |
| Front desk speed | No keyboard path; scanning needs a mouse                                                                      | Scanner field always focused; keyboard shortcuts                  |
| Styling approach | Every style is written inline, against the project rule (Tailwind and Shadcn)                                 | Adopt the mandated component library before building new screens  |
| Preferences      | Theme choice is lost on reload                                                                                | Remember it; follow the system setting by default, as mobile does |
| Formatting       | Dates and currency formatted ad hoc                                                                           | One shared formatter for pesos, dates and times                   |

---

## 5. Recommended build order

**Group A — build now on the existing backend (web only, no collision with mobile)**

1. Member directory and member profile
2. Add member at the desk
3. Venue profile editor, and "add another facility"
4. Door check-in with real pass verification
5. Live attendance feed and "inside now"
6. Segment manager
7. Events: create, registrations, check-in
8. Sales and settlement history with CSV export
9. Broadcast history
10. Real attendance analytics on the dashboard
11. Real revenue analytics on the dashboard
12. Role-based visibility inside the suite

Alongside these: one address per section, the component library, the shared data table, responsive layout and the 10-state pattern, since every new screen depends on them.

**Group B — needs shared backend work agreed with the mobile app first**

- Product and plan catalogue, then the real point of sale (cash, shifts, refunds, receipts)
- Membership lifecycle and recurring billing
- Court and class booking with pricing and booking rules
- Staff invitations (item 12)
- Conversation notes, assignment and read state (item 14)
- Waivers, lead pipeline, automations, opt-out handling

**Group C — later**

- Multi-location roll-up, audit log, two-step sign-in, tax receipts, door hardware integration, payroll and commissions

Finishing Group A puts the suite on par with the industry for member management, door access, messaging and reporting. Parity on scheduling, point of sale and billing depends on Group B.
