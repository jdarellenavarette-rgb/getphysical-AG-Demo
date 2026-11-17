# Web and Mobile Coordination

Read this before starting work in either app. Update it when a shared change lands.

**Last updated:** 2026-11-18 · **Web branch:** `claude/friendly-keller-69beky` · **Mobile:** merged to `main` at `625ef77`

## Lanes

| Lane                               | Owner                                                           | Rule                                                                                                                                          |
| ---------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile`                      | Mobile session                                                  | Not edited from the web session                                                                                                               |
| `apps/web`                         | Web session                                                     | Not edited from the mobile session                                                                                                            |
| `supabase/`, `packages/sodia-core` | One session at a time (currently: nobody has changes in flight) | Additive only. New migration files; never edit an applied one. Lands as its own small pull request with database tests and regenerated types. |

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

## What mobile needs to adjust so the two meet

All three are reads of data that already exists. None needs a schema change, and two were already on the mobile list.

1. **Wallet reads `passes` from the backend** (mobile finding B2). Until then a purchased pass has no card to show, so the web check-in has nothing real to scan.
2. **Venues tab reads `facilities`** instead of sample venues. Until then a venue's name, hours, amenities and prices edited on web are used at checkout but not displayed.
3. **Show the person's username where they can read it out** (profile or settings), because the front desk adds members by username.

Optional: show "member of <venue>" from `facility_memberships`, so a member added at the desk sees it.

## What web will not do without agreement

- Change anything in `supabase/` or `sodia-core`.
- Add the product catalogue, cash sales and shifts, court or class bookings, staff invitations. Each needs one shared change first; see `BUSINESS_SUITE_FEATURE_GAPS.md`, group B.

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
