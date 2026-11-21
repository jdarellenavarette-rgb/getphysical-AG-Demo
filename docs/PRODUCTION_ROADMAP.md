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

**Launch one product first: GymDash with the Sodia member app, to a small number of pilot gyms.** It is the only workspace where the whole loop exists (join → buy → pay → check in → message), and the only one with a payment path. Clubdash, CoachDash and Organizer Pro stay available as free tools without payments, labelled as early access, and get payments in a later phase.

Two gates:

- **Pilot launch:** two or three gyms you know personally, real money, you on call. Needs Phases A, B and C.
- **Public launch:** anyone can sign up. Adds Phases D and E, and a support process.

Everything else improves the product but does not block either gate.

---

## 3. Decisions only you can make

These block Phase B. Nothing else in the plan should wait on them, so they are listed first.

| #   | Decision                                 | Why it matters                                                                                                                                                                                             | Options                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Who receives the member's money?**     | Today every payment would land in one Maya account: yours. That makes GetPhysical the merchant of record, which the spec says it must never be, and it means you hold and forward other businesses' money. | (a) A split-payment provider where each gym is a sub-merchant (the spec names Xendit xenPlatform; the code path exists but is untested). (b) Maya with each gym onboarded as its own merchant. (c) Accept being merchant of record for the pilot only, with a written agreement and manual payouts. |
| 2   | **Which payment provider for the pilot** | Each needs a business account, documents and approval, which takes calendar time outside our control. Start this first.                                                                                    | Maya (already integrated in test mode), Xendit, or both.                                                                                                                                                                                                                                            |
| 3   | **How GetPhysical earns**                | The fee rules are coded (₱15 per pass, 5% on memberships) and the Free / Pro plans exist as caps (19 club members, 3 coach clients), but there is no way to buy Pro.                                       | Fees only for the pilot; add Pro billing before public launch.                                                                                                                                                                                                                                      |
| 4   | **Launch scope**                         | Confirms section 2.                                                                                                                                                                                        | GymDash first (recommended), or wait for all four.                                                                                                                                                                                                                                                  |
| 5   | **Legal entity and documents**           | Terms, privacy notice and a merchant agreement must name a registered entity. Member data falls under the Philippine Data Privacy Act.                                                                     | Engage a lawyer now; it runs in parallel.                                                                                                                                                                                                                                                           |
| 6   | **Production domain**                    | Sign-in emails, the suite address and app links all use it. `getphysical.fitness` is already used for email.                                                                                               | Confirm the suite's address (for example `business.getphysical.fitness`).                                                                                                                                                                                                                           |

---

## 4. Phases

### Phase A — Production foundation · blocks pilot

Make it safe to run with real data.

| #   | Work                                                                                                                    | Owner                            | Size |
| --- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---- |
| A1  | Production Supabase project, separate from staging; migrations applied by CI on merge, never by hand                    | Suite + You (create the project) | M    |
| A2  | Secrets and environment variables per environment; rotate the Maya test key that appeared in a screenshot               | You + Suite                      | S    |
| A3  | Error monitoring and alerts on the suite and the server functions                                                       | Suite + You (account)            | S    |
| A4  | Automated browser tests for each workspace's main path, run in CI                                                       | Suite                            | M    |
| A5  | Move the gym Overview totals into the database (today a venue with over 1,000 scans in the period gets wrong numbers)   | Suite                            | S    |
| A6  | Rate limits on username lookups and sign-in; an audit log of staff actions                                              | Suite                            | M    |
| A7  | Invite staff by email (today they must already have an account and tell you their username)                             | Suite                            | S    |
| A8  | Production sign-in: Google and Apple configured for the production domain; email sending plan raised from the free tier | You + Suite                      | S    |
| A9  | Database backups and a tested restore                                                                                   | You + Suite                      | S    |
| A10 | Find the cause of in-place page updates failing after a save, or confirm the reload approach on production              | Suite                            | S    |

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

### Phase F — Depth per trade · after pilot, ordered by demand

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
