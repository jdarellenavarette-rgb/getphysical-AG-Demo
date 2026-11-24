# Production Roadmap

**Written:** 2026-11-21 · **Scope:** the Business Suite (`apps/web`), its database, and what it needs from the Sodia app · **Companion to:** `COORDINATION.md`, `DEMO.md`, `PIONEER_TEST_PLAN.md`

This is the map from "demo on staging" to "real businesses taking real money". It says what exists, what blocks launch, the order to do it in, who does each part, and the decisions only the owner can make.

**Sizes** are relative, not dates: **S** is about one working session, **M** two or three, **L** four or more. **Owner** is who does the work: _Suite_ (this chat), _Mobile_ (the mobile chat), or _You_ (accounts, contracts, legal and decisions that cannot be done from code).

---

## 1. Where we are

| Area                                    | GymDash                                  | Clubdash                           | CoachDash                   | Organizer Pro                       |
| --------------------------------------- | ---------------------------------------- | ---------------------------------- | --------------------------- | ----------------------------------- |
| Own workspace, home, setup steps        | Done                                     | Done                               | Done                        | Done                                |
| People list (members, contacts, guests) | Done                                     | Done                               | Clients only                | Done                                |
| Core tool                               | Check-in: done                           | Court calendar: desk bookings only | Client list: done; no plans | Events: publish, sign-ups, arrivals |
| Inbox and broadcasts                    | Done                                     | Done                               | Done                        | Done                                |
| Posts and followers                     | Suite done; app not yet                  | Same                               | Same                        | Same                                |
| Selling                                 | Plans and checkout work in **test mode** | Not connected                      | Not connected               | Not connected                       |
| Getting paid                            | Test mode only                           | No                                 | No                          | No                                  |
| Team and hand-over                      | Done                                     | Done                               | Done                        | Done                                |

Shared foundations: sign-in, roles enforced in the database, append-only sales and scan records, contact records, 389 database tests, CI on every pull request.

**Not production-ready today because:** there is no production database, payments are test-only, nothing watches for errors, the suite has no automated browser tests, migrations are applied by hand, and the legal documents a business and its members must accept do not exist.

---

## 2. Launch strategy

**All four workspaces launch together** (decision 4). GymDash is the furthest along: it is the only one where the whole loop exists (join → buy → pay → check in → message). The other three need their core tool finished and payments connected before they are at the same level, so those items move onto the launch path.

Two gates:

- **Pilot launch:** a few businesses of each kind that you know personally, real money, you on call. Needs Phases A, B and C, plus the launch-path items of Phase F marked below.
- **Public launch:** anyone can sign up. Adds Phases D and E, and a support process.

The alternative, launching GymDash alone first, would reach real money sooner; it remains available if the provider's approval or the mobile work runs long.

---

## 3. Decisions

Recorded on 2026-11-23.

| #   | Decision                          | Answer                                                                                                                                                                                                                                                             |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Who receives the customer's money | **Split payments.** Each business is paid into its own account with the provider at the moment of payment; GetPhysical receives only its fee and is never the merchant of record.                                                                                  |
| 2   | Payment provider                  | **Not chosen yet.** Until it is, payments are shown as "under construction" in every workspace. Test mode stays available for demos.                                                                                                                               |
| 3   | How GetPhysical earns             | See section 3a. To be confirmed after the pilot.                                                                                                                                                                                                                   |
| 4   | Launch scope                      | **All four workspaces together**, not GymDash first. This makes Phase F (depth per trade) and payments for every kind part of the launch path; see section 5.                                                                                                      |
| 5   | Legal documents                   | **Drafts are in the product** at `/legal` (terms, privacy notice, business terms, refunds, community rules), marked as drafts. A business accepts the Business Terms when it is opened and the version is recorded. A lawyer must review them before launch.       |
| 6   | The suite's production address    | **Open.** The web address businesses will type to reach the suite, for example `business.getphysical.fitness`. Sign-in emails, Google sign-in and the links inside the app all have to be set to it, so it should be fixed before production accounts are created. |

### 3a. Pricing recommendation

What comparable products charge (figures are from vendor and comparison pages checked on 2026-11-23; confirm each with the vendor before relying on it):

| Kind of product                       | How they charge                                                                                                                                                                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gym management software               | A monthly subscription, most between US$50 and US$300. Gymdesk prices by member count (US$75 up to 50 members, US$200 up to 250). PushPress has a free tier, then US$159 and US$229. Mindbody starts around US$79 per location and is quote-based. Card processing is charged to the gym on top. |
| Court booking marketplaces            | Playtomic takes a percentage of each online booking, deducted before the club is paid, and on some bookings also charges the player a service fee. Its rate is set per contract; a competitor quotes 4%, which is unverified.                                                                    |
| Coaching apps                         | A monthly subscription in steps by number of active clients: TrueCoach around US$20–30 for 5 clients, US$64–70 for 20, US$107–165 for 50.                                                                                                                                                        |
| Payment processing in the Philippines | Roughly 3.5% + ₱10–15 for cards, 2.2–2.5% for GCash, 1.5% for QR Ph and Maya QR, before VAT. Xendit does not publish its rates. Nothing was found on what a provider charges for the split itself.                                                                                               |

Recommendation: **free to start, a small fee on each online sale, and a paid plan for businesses that outgrow the free limits.** This is how PushPress (free tier plus fees) and Playtomic (percentage per booking) lower the barrier for small businesses, and it suits owners who will not pay a subscription before they have seen a sale.

1. **Keep the customer-paid service fee, but make it a percentage with a floor and a cap** in place of ₱15 on passes and 5% on memberships. Today ₱15 on a ₱100 day pass is 15%, and 5% on a ₱3,000 membership is ₱150; both ends look wrong to the person paying. A starting point to test: 5%, never less than ₱10, never more than ₱75.
2. **The business pays the payment provider's processing cost out of its share**, as gyms do with every product in the table. This matters: a card payment on a ₱150 pass costs about ₱20 to process, which is more than GetPhysical's whole fee. If GetPhysical absorbed processing it would lose money on every small sale.
3. **Steer customers to the cheaper ways to pay** (QR Ph and e-wallets at 1.5–2.5%) by listing them first at checkout.
4. **Pro plans by workspace, priced for the Philippine market rather than converted from US prices.** Hypotheses to test in the pilot: Coach Pro for more than 3 clients; Club Pro for more than 19 players; a gym plan for more than one location or team seats; organizers pay per event entry only. The amounts should come from pilot conversations, not from this document.
5. **No fee when no money moves through the app.** Desk sales, free events and free bookings stay free.

Nothing in the code changes until this is confirmed; the fees are in one place (`packages/sodia-core/src/payments.ts` and the checkout function).

---

## 4. Phases

### Phase A — Production foundation · blocks pilot

Make it safe to run with real data.

| #   | Work                                                                                                                                                                                                | Owner                            | Size |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---- |
| A1  | Production Supabase project, separate from staging; migrations applied by CI on merge, never by hand                                                                                                | Suite + You (create the project) | M    |
| A2  | Secrets and environment variables per environment; rotate the Maya test key that appeared in a screenshot                                                                                           | You + Suite                      | S    |
| A3  | Error monitoring and alerts on the suite and the server functions                                                                                                                                   | Suite + You (account)            | S    |
| A4  | Automated browser tests for each workspace's main path, run in CI                                                                                                                                   | Suite                            | M    |
| A5  | Move the gym Overview totals into the database (today a venue with over 1,000 scans in the period gets wrong numbers)                                                                               | Suite                            | S    |
| A6  | Rate limits on username lookups and sign-in; an audit log of staff actions                                                                                                                          | Suite                            | M    |
| A7  | Invite staff by email (today they must already have an account and tell you their username)                                                                                                         | Suite                            | S    |
| A8  | Production sign-in: Google and Apple configured for the production domain; email sending plan raised from the free tier                                                                             | You + Suite                      | S    |
| A9  | Database backups and a tested restore                                                                                                                                                               | You + Suite                      | S    |
| A10 | ~~Find the cause of in-place page updates failing after a save~~ **Done 2026-11-24:** a route-level loading placeholder was the cause; it is removed and saves and navigation update in place again | Suite                            | S    |

**Done when:** a merge deploys code and database together, a thrown error pages someone, and CI fails if a workspace's main path breaks.

### Phase B — Real money · blocks pilot

Starts as soon as decisions 1 and 2 are made. The provider's approval is the longest wait in the whole plan.

| #   | Work                                                                                                         | Owner                | Size          |
| --- | ------------------------------------------------------------------------------------------------------------ | -------------------- | ------------- |
| B1  | Provider account, documents, approval                                                                        | You                  | Calendar time |
| B2  | Each gym connects its own payout account in the suite (replaces the test-mode button)                        | Suite                | M             |
| B3  | Live checkout end to end with a real card and a real e-wallet: pass issued, sale recorded, fee split correct | Suite + Mobile + You | M             |
| B4  | Refunds from the suite, as reversing entries                                                                 | Suite                | M             |
| B5  | Receipts to the member; a payout and reconciliation report for the gym                                       | Suite                | M             |
| B6  | Failure handling: abandoned checkouts, duplicate webhooks, provider downtime                                 | Suite                | S             |

**Done when:** a stranger can buy a pass at a pilot gym, the gym can see when it will be paid, and a refund works.

### Phase C — Pilot · the first real users

| #   | Work                                                                                             | Owner                | Size |
| --- | ------------------------------------------------------------------------------------------------ | -------------------- | ---- |
| C1  | Terms of service, privacy notice, merchant agreement, refund policy; consent recorded at sign-up | You (lawyer) + Suite | M    |
| C2  | Run `PIONEER_TEST_PLAN.md` on real phones against production                                     | You + Mobile         | M    |
| C3  | Sodia app in the app stores (or TestFlight and internal testing for the pilot)                   | Mobile + You         | L    |
| C4  | Onboard two or three gyms: import their members, set up plans, train the front desk              | You + Suite          | M    |
| C5  | A way for a gym to reach you, and a place where you see problems first                           | You                  | S    |

**Done when:** a pilot gym has run a full week of real check-ins and sales without you fixing data by hand.

### Phase D — The activity spine · blocks public launch

This was "Phase 3" of the earlier plan. It can run in parallel with B and C.

| #   | Work                                                                                 | Owner | Size |
| --- | ------------------------------------------------------------------------------------ | ----- | ---- |
| D1  | One activity log: joined, lapsed, signed up, booked, cancelled, went quiet           | Suite | M    |
| D2  | "Needs attention" on every workspace's home, fed by the log                          | Suite | S    |
| D3  | Message event sign-ups, a quiet client, or anyone on a list, from where you see them | Suite | M    |
| D4  | Automations: welcome, pass ending soon, win-back, event reminder                     | Suite | M    |
| D5  | Edit a booking, an event or a contact after creating it                              | Suite | S    |

### Phase E — Close the loops in the app · blocks public launch

The suite side of each exists. Until the app does these, the feature is half a feature.

| #   | Work                                                                                              | Owner          | Size |
| --- | ------------------------------------------------------------------------------------------------- | -------------- | ---- |
| E1  | Business profile and Follow button; posts in the Sodia feed (`business_profile`, `business_feed`) | Mobile         | L    |
| E2  | Events list and sign-up without scanning a code                                                   | Mobile         | M    |
| E3  | Accept or decline a coach's invitation (`respond_coach_invite`)                                   | Mobile         | S    |
| E4  | Role portals follow the four workspaces (`WORKSPACES` in `sodia-core`)                            | Mobile         | M    |
| E5  | "Is this you?" for a contact record, replacing email-only matching                                | Mobile + Suite | M    |

### Phase F — Depth per trade · F6, F7 and F8 are on the launch path now that all four launch together

| #   | Work                                                                                              | For           | Size |
| --- | ------------------------------------------------------------------------------------------------- | ------------- | ---- |
| F1  | Class timetable with capacity, booking and a waitlist                                             | Gyms, studios | L    |
| F2  | Trials and lead capture, tracked through to joined                                                | All           | M    |
| F3  | Cash till, shifts and blind count                                                                 | Gyms          | L    |
| F4  | Membership freeze and upgrade; recurring billing                                                  | Gyms          | L    |
| F5  | Waivers signed in the app                                                                         | All           | M    |
| F6  | Court prices (peak, off-peak, member, guest), recurring bookings, booking and paying from the app | Clubs         | L    |
| F7  | Session packs, session calendar, training plans                                                   | Coaches       | L    |
| F8  | Entry fees, categories, refunds; brackets and live scoring                                        | Organizers    | L    |
| F9  | Reviews, referrals                                                                                | All           | M    |

**Built on 2026-11-24** (suite side; money is recorded at the desk, not collected online):

- F1 class timetable with capacity and a waitlist. Booking from the app is a mobile item.
- F6 court prices with a peak rate, moving a booking, and weekly repeat bookings. App booking is still to do.
- F7 session packs, sessions booked ahead, and training plans compared with logged workouts.
- F8 entry fees and categories, editing an event, single-elimination brackets with scoring. Refunds are still to do.
- F3 desk payments with reversals, shifts, and a blind cash count with variance, for every workspace.
- D4 automations (welcome, pass ending, win-back, event and class reminders, quiet client) and messaging the people on
  a list. Date-based ones are checked when a team member opens Home. For production, schedule
  `public.run_all_automations()` (service role) hourly so they do not depend on someone opening the suite.

Still open in phase A: A3 error monitoring needs an account with a monitoring service, and A4 browser tests in CI
need `@playwright/test` added as a development dependency. Both wait on the owner's approval.

### Phase G — The ecosystem · after the workspaces have payments

| #   | Work                                                                        | Size |
| --- | --------------------------------------------------------------------------- | ---- |
| G1  | Payments for clubs, coaches and organizers                                  | L    |
| G2  | Coach working at a gym (floor fee split); organizer holding a club's courts | L    |
| G3  | Pro plan billing; an organization that owns several businesses              | M    |
| G4  | Staff clock-in, plan versioning, offline mode at the desk                   | L    |

---

## 5. Order of work

Three lanes can move at once.

| Lane       | Now                                                          | Next                                                   | Then                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------- |
| **You**    | Decisions 1–6; start the provider application and the lawyer | Create production accounts (A1, A3, A8)                | Recruit pilot gyms (C4)      |
| **Suite**  | A1–A7                                                        | B2–B6 as soon as the provider is chosen; D in the gaps | C1, C4; then F by demand     |
| **Mobile** | Device verification against staging (C2)                     | E1–E3                                                  | Store submission (C3), E4–E5 |

The critical path to the pilot is **decision 1 → provider approval → B3**. Everything on the Suite lane in Phase A fits inside that wait.

---

## 6. Risks

| Risk                                                | Effect                                 | What reduces it                                                      |
| --------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Provider approval is slow or refused                | Pilot cannot take money                | Apply to two providers; decide the fallback (decision 1c) in advance |
| GetPhysical ends up holding other businesses' money | Regulatory exposure                    | Settle decision 1 with a lawyer before any live transaction          |
| The app is not on real devices yet                  | Unknown problems at the pilot          | Run C2 on staging now, not after production exists                   |
| Migrations applied by hand                          | Staging and production drift apart     | A1 before any production data                                        |
| No browser tests                                    | A change breaks a workspace unnoticed  | A4                                                                   |
| In-place updates fail after a save                  | Extra page reloads; root cause unknown | A10                                                                  |
| One person's account owns a business                | Lost access if they leave              | Hand-over is built; an organization layer is G3                      |

---

## 7. What is deliberately not in this plan

Advertising and paid reach; door hardware integration; payroll and commissions; multi-country support (times, currency and tax assume the Philippines); tax receipts. Each is a real need for some business, and none belongs before the pilot.
