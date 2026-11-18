# Web and Mobile Coordination

Read this before starting work in either app. Update it when a shared change lands.

**Last updated:** 2026-11-18 · **Web branch:** `claude/friendly-keller-69beky` · **Mobile:** merged to `main` at `625ef77`

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

## What mobile needs to adjust so the two meet

All are reads or single calls against things that already exist. None needs a schema change.

1. **"My venues" list** from `my_memberships()`, labelled with `describeStanding(standing).forMember`, with two controls per venue: **Leave** (`leave_facility`) and **Mute broadcasts** (`set_venue_broadcasts_muted`). This is the member's half of the relationship and does not exist yet.
2. **Wallet reads `passes` from the backend** (mobile finding B2), including passes with `pass_type = 'COMP_PASS'` granted at the desk; show them as "Pass from <venue>". Until then a granted or purchased pass has no card to show, so the web check-in has nothing real to scan.
3. **Venue sheet lists the venue's plans** from `facility_products` (active rows, ordered by `sort_order`), hidden by kind when `sells_passes` / `sells_memberships` is false, and sends the chosen product's `id` as `sku` to checkout. This replaces the hard-coded day-pass / monthly choice and fixes mobile finding B1 (wrong product sold).
   3b. **Venues tab reads `facilities`** instead of sample venues. Until then a venue's name, hours, amenities and prices edited on web are used at checkout but not displayed.
4. **Show the person's username where they can read it out** (profile or settings), because the front desk adds members by username.
5. **Scanning a venue code** already works (`redeem_qr_code`). The Business Suite now displays that code as `sodia://q/<token>`.

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
