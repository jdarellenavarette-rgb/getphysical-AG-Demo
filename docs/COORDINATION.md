# Web and Mobile Coordination

Read this before starting work in either app. Update it when a shared change lands.

**Last updated:** 2026-11-18 · Both apps are on `main`. Demo walkthrough: `docs/DEMO.md`.

## Lanes

| Lane                               | Owner                                                                                                                                                               | Rule                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile`                      | Mobile session                                                                                                                                                      | Not edited from the web session                                                                                                               |
| `apps/web`                         | Web session                                                                                                                                                         | Not edited from the mobile session                                                                                                            |
| `supabase/`, `packages/sodia-core` | One session at a time (currently: web session; migrations `20261118000001` member relationships, `20261118000002` product catalogue, `20261118000003` payout setup) | Additive only. New migration files; never edit an applied one. Lands as its own small pull request with database tests and regenerated types. |

## Contracts both apps rely on today

Do not rename or change the shape of these without updating both apps in the same change.

| Contract                                                                                         | Mobile uses it for                                                   | Web uses it for                                           |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------- |
| Pass QR payload `GP2:<pass_id>:<6 digits>` (`buildPassQrPayload`, `parseQrScan` in `sodia-core`) | Showing the membership card; staff scanner                           | Front-desk check-in                                       |
| `verify_pass_code(p_pass_id, p_code)` and `passVerifyResultSchema`, `describeDeniedScan`         | Staff scanner                                                        | Front-desk check-in, recent scans list                    |
| `access_scans` (insert only, via `verify_pass_code`)                                             | —                                                                    | Overview and check-in counts, last visit per member       |
| `conversations`, `messages`, `mark_conversation_read`                                            | Inbox and chat                                                       | Member inbox                                              |
| `send_crm_broadcast`                                                                             | Receives the resulting messages                                      | Broadcast composer                                        |
| `facility_memberships` (`status`, `source`)                                                      | —                                                                    | Members list, add, cancel, reactivate; broadcast audience |
| `facilities.day_pass_price_php`, `monthly_sub_price_php`                                         | Checkout price, through `payments-checkout` → `create_payment_order` | Editable in Settings                                      |
| `facilities` name, address, hours, amenities, capacity                                           | Not read yet (Venues tab is sample data)                             | Editable in Settings                                      |
| `profiles.username`                                                                              | Chosen at sign-up                                                    | Staff add a member by username                            |
| `profiles.roles`, `facility_staff.role`                                                          | Which workspaces appear                                              | Which facility and role the operator has                  |

## Member ↔ venue relationship (added 2026-11-18)

One rule, decided in the database and labelled by `sodia-core`, so a member and a venue always see the same thing.

**Standing** is derived from the membership and the member's passes; it is never stored:

| Standing    | Meaning                                                               |
| ----------- | --------------------------------------------------------------------- |
| `ACTIVE`    | Holds a valid pass, or belongs to a community club (no pass needed)   |
| `LAPSED`    | Gym member whose last pass has ended                                  |
| `NO_PASS`   | Gym member who has never held a pass (for example, added at the desk) |
| `PENDING`   | Awaiting approval                                                     |
| `CANCELLED` | Ended by the member or the venue                                      |

| Function                                                     | Who calls it        | What it does                                                                                        |
| ------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------- |
| `facility_member_directory(p_facility_id)`                   | Web (staff)         | Members with standing, pass end date, last visit, mute flag                                         |
| `my_memberships()`                                           | **Mobile (member)** | The member's venues with standing, pass end date, mute flag                                         |
| `leave_facility(p_facility_id)`                              | **Mobile (member)** | Leaves the venue. A paid pass stays valid until it ends.                                            |
| `set_venue_broadcasts_muted(p_facility_id, p_muted)`         | **Mobile (member)** | Stops or resumes the venue's broadcasts. Direct replies still arrive.                               |
| `grant_complimentary_pass(p_facility_id, p_user_id, p_days)` | Web (owner, admin)  | Door access without an app purchase. Creates a pass with `sku_id = 'COMP_PASS'`.                    |
| `end_membership(p_facility_id, p_user_id)`                   | Web (owner, admin)  | Cancels the membership and revokes valid passes                                                     |
| `send_crm_broadcast(…)`                                      | Web (staff)         | New audiences `ACTIVE` and `LAPSED`; every audience except a direct message skips members who muted |

Shared helpers in `sodia-core` (`memberships.ts`): `memberStandingSchema`, `myMembershipRowSchema`, `memberDirectoryRowSchema`, `describeStanding()` (the same badge text and one-line explanation for both apps), `standingAllowsEntry()`.

## Venue catalogue and selling settings (added 2026-11-18)

Venues define what they sell. Nothing is hard-coded to "day pass" and "monthly" any more.

| Piece                                          | What it is                                                                                                                                                                                                                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `facility_products`                            | One row per plan: `name`, `description`, `kind` (`PASS` one-off, ₱15 fee; `MEMBERSHIP`, 5% fee), `price_php`, `duration_days` (1–366), `is_active`. Readable by anyone when active; owners and admins write. Never deleted, only switched off.                                          |
| `facilities.sells_passes`, `sells_memberships` | Venue-wide switches. A venue that doesn't offer memberships turns the second one off and no membership can be bought, whatever the catalogue holds.                                                                                                                                     |
| `facilities.membership_grace_days`             | 0–30. How long a member still counts as `ACTIVE` after a pass ends. Door access is unaffected.                                                                                                                                                                                          |
| Checkout                                       | `payments-checkout` and `create_payment_order` accept **a product id** as `sku`, as well as the original `DAY_PASS` / `MONTHLY`. The order stores the product's name, price and length at the time of sale. The pass lasts `duration_days` and carries the product name in `pass_type`. |
| Errors                                         | `PRODUCT_NOT_AVAILABLE` (switched off, wrong venue, or the venue doesn't sell that kind); `SKU_NOT_FOR_SALE` unchanged.                                                                                                                                                                 |

**Backwards compatible.** The current mobile build sends `DAY_PASS` / `MONTHLY` and keeps working: each venue's standard day pass and standard monthly membership are catalogue rows (`legacy_sku`), and their price is mirrored into the original price columns. Switching one off stops it being sold through the original SKU too.

Shared helpers in `sodia-core` (`payments.ts`): `facilityProductSchema`, `productInputSchema`, `describeProductLength()`, and `checkoutRequestSchema` now accepting a product id.

## Payout setup (added 2026-11-18)

- `payments_mode()` returns `sandbox` or `live` for the whole platform (operator-set; `live` by default).
- In `sandbox`, a venue owner connects Maya test payments from the Business Suite. Checkout is unchanged for
  mobile: the same `payments-checkout` call returns a Maya sandbox checkout link.
- A venue that has not connected payouts still answers `FACILITY_PAYOUTS_NOT_CONFIGURED` at checkout. Mobile
  should show that as "This venue isn't taking payments yet", not as a generic error.

## Coach, events, team and bookings (added 2026-11-18)

Migration `20261118000006`. Web uses all of these; mobile uses none yet.

| Contract                                     | What it does                                                                                                                                                                                                     | What mobile needs to do                                                                                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coach link consent                           | **Behaviour change.** `coach_clients` rows can no longer be inserted as `ACTIVE`. A link starts `PENDING` and only the invited side can accept. Scanning a coach code is unchanged (client asks, coach accepts). | Nothing if the app only scans coach codes.                                                                                                                                                     |
| `respond_coach_invite(p_coach_id, p_accept)` | The client accepts or declines an invitation a coach sent by username.                                                                                                                                           | Show pending invitations (`coach_clients` where `client_id = me`, `status = PENDING`, `invited_by = coach_id`) and call this. Until then, username invitations stay pending; coach codes work. |
| `invite_coach_client`, `coach_roster`        | Coach side, used by the web Clients page.                                                                                                                                                                        | Optional: reuse for a mobile coach view.                                                                                                                                                       |
| `event_registrations.checked_in_at`          | Set by staff with `set_event_attendance`.                                                                                                                                                                        | Optional: show "You're checked in". Sign-up is unchanged.                                                                                                                                      |
| `facility_spaces`, `space_bookings`          | Courts and desk bookings. Staff only.                                                                                                                                                                            | None. Booking from the app needs a new contract (availability read, payment).                                                                                                                  |
| `add_facility_staff`                         | Owners add staff; grants the `staff` or `coach` account role.                                                                                                                                                    | None: the app already reads the account role.                                                                                                                                                  |
| Business kinds                               | `facilities.category` may now be `Coaching` or `Event organizer` (both `COMMUNITY`).                                                                                                                             | Discover may want to hide or label these; they are not venues to visit.                                                                                                                        |

## Mobile status against these contracts (2026-11-18)

Built and covered by automated tests with a stand-in backend; not yet run on a phone against staging.

| Item                                                                       | State | Where                                                                        |
| -------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------- |
| Wallet reads `passes`, including desk-granted `COMP_PASS`                  | Done  | `apps/mobile/src/services/memberService.ts`, `components/cards/`             |
| Venue sheet lists `facility_products` and sends the product id to checkout | Done  | `services/venueService.ts`, `hooks/useVenuePlans.ts`, `hooks/useCheckout.ts` |
| "My venues" with standing, Leave and Mute                                  | Done  | `components/profile/MyVenuesModal.tsx`                                       |
| Discover reads `facilities`                                                | Done  | `hooks/useDiscoverVenues.ts`                                                 |
| Username shown with copy or share                                          | Done  | `components/common/SettingsMemberCard.tsx`                                   |
| Friendly checkout errors                                                   | Done  | `services/paymentService.ts`                                                 |

Still open on mobile:

- No signal for "payment confirmed": the wallet polls for about three minutes after checkout opens. A realtime subscription on `passes` would be more direct.
- One-tap copy of the username needs `expo-clipboard`, which is not on the approved list.
- Sample coaches, clubs and the court grid are hidden when a backend is configured, because nothing behind them can be sold yet.
- After joining by venue code, "View passes" opens the web link instead of the in-app venue sheet.

## Demo venue

`create_demo_venue()` (test mode only) gives the signed-in person a sample gym they own. The Business Suite offers it on first run. Sample members use `@demo.getphysical.test` addresses and cannot sign in.

## What web will not do without agreement

- Change anything further in `supabase/` or `sodia-core` beyond the member-relationship migration above.
- Add cash sales and shifts, court or class bookings, staff invitations. Each needs one shared change first; see `BUSINESS_SUITE_FEATURE_GAPS.md`, group B.

## Checks that prove neither side broke the other

Run on any branch before merging:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm --filter @getphysical/web exec tsc --noEmit
pnpm --filter @getphysical/mobile exec tsc --noEmit
pnpm --filter @getphysical/mobile test
pnpm --filter sodia-core test
pnpm typecheck:functions
pnpm db:types:check
pnpm db:test
```

## Changes made in the other lane

- 2026-11-18, web session → `apps/mobile/src/data/discoverData.ts`: added `membership_grace_days`, `sells_memberships`, `sells_passes` to the eight sample venues. The venue row type gained these three required columns, and the mobile app would not compile without them. No behaviour change.
