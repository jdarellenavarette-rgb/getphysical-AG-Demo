# GetPhysical Backend — Architecture & Runbook

Everything server-side lives in `supabase/` and is the source of truth for both apps.

```text
supabase/
├── config.toml                 # CLI config (auth, realtime, per-function JWT settings)
├── migrations/                 # Schema, tenancy, RLS, ledger, payments (apply in order)
├── seed.sql                    # Local dev facilities only
├── functions/                  # Deno edge functions
│   ├── nutrition-parse/        # Gemini proxy (key stays server-side, per-user quota)
│   ├── payments-checkout/      # Server-priced order → Xendit invoice / Stripe Checkout
│   ├── webhook-xendit/         # Callback-token verified, invoice re-fetched, idempotent settle
│   ├── webhook-stripe/         # Signature verified, idempotent settle / refund
│   └── _shared/                # HTTP, auth, provider clients, signature checks, generated DB types
└── tests/                      # Plain-Postgres harness: 126 assertions over RLS, caps, ledger, gate, payments
```

## Security model

| Concern | How it is enforced |
|---|---|
| Authentication | Supabase Auth. Web: cookie session via `@supabase/ssr` + middleware guard. Mobile: session in Keychain/Keystore (`expo-secure-store`, chunked). |
| Tenant isolation | `facility_staff` (OWNER/ADMIN/STAFF/COACH) + `facility_memberships`. Every table has RLS; helper functions `is_facility_staff/admin/member()` are `SECURITY DEFINER`, `search_path=''`. |
| Column-level safety | Explicit `GRANT`s: e.g. users cannot set their own `roles`, `coach_plan`, facility `plan`/`registry_type`, post `author_name` or counters. `profiles.dob` is unreadable by others and write-once. |
| Registry caps | `COMMUNITY`+`FREE` ≤ 19 active members, `FREE` coach ≤ 3 clients — DB triggers with row locks (race-safe). |
| Append-only ledger | `ledger_transactions` and `access_scans`: triggers block UPDATE/DELETE/TRUNCATE for every role; privileges revoked even from `service_role`. Refunds append a reversing row. |
| Money | Prices computed in `create_payment_order()` from the facility row; age gate (18+); payouts must be onboarded; settlement only via `service_role` webhooks; idempotent per order and per event. |
| Gate access | RFC 6238 TOTP (HMAC-SHA256, 60 s) with a random 256-bit secret per pass, owner-only read, rotated on transfer. `verify_pass_code()` checks staff-of-facility, ±1 step drift, replay (unique grant per window) and throttles after 5 failures / 5 min. |
| Messaging | Rows in `messages` with sender bound to `auth.uid()`; facility-voice messages only by staff; broadcasts fan out server-side to members/segments. Realtime uses `postgres_changes`, which honours RLS. |
| Secrets | No keys in source. Apps get only the anon/publishable key; `assertClientSupabaseConfig` refuses `service_role` keys and non-HTTPS URLs. AI/payment keys live in edge-function secrets. |

## Local development

Prerequisites: Supabase CLI and Docker.

```bash
supabase start                       # Postgres, Auth, Realtime, Storage, Studio
supabase db reset                    # applies migrations/ + seed.sql
cp apps/web/.env.example apps/web/.env.local       # fill from `supabase status`
cp apps/mobile/.env.example apps/mobile/.env
cp supabase/functions/.env.example supabase/functions/.env
supabase functions serve --env-file supabase/functions/.env
pnpm --filter @getphysical/web dev
```

Make your user an owner of a seeded facility (Studio → SQL):

```sql
insert into public.facility_staff (facility_id, user_id, role)
values ('fac_metro_core', '<your auth user id>', 'OWNER');
```

## Tests

```bash
pnpm db:test                 # needs PG* env vars pointing at any Postgres 15+ superuser
pnpm --filter sodia-core test
pnpm typecheck:functions
pnpm db:types:check          # generated types copy in functions/_shared must match
```

CI (`.github/workflows/ci.yml`) runs all of the above plus the web production build on every PR.

After changing a migration, regenerate types and copy them to the functions:

```bash
supabase gen types typescript --local > packages/sodia-core/src/database.types.ts
cp packages/sodia-core/src/database.types.ts supabase/functions/_shared/database.types.ts
```

## Deploying

**Staging project:** `cmahltbjopkihcfkzzex` (ap-southeast-1, Postgres 17). Migrations 0001–0008 applied
2026-11-06 and recorded in `supabase_migrations.schema_migrations`; all six DB test suites passed
against it (run in rolled-back transactions). Edge functions not yet deployed.

1. **Use a new Supabase project** (or reset staging). The existing demo project's schema
   was never in version control and cannot be verified, so do not `db push` onto it blindly.
2. `supabase link --project-ref <ref>` then `supabase db push`.
3. `supabase secrets set --env-file supabase/functions/.env` then `supabase functions deploy`.
4. Auth → URL configuration: add `https://<web-domain>/auth/confirm` and `sodia://auth/callback`.
5. Vercel: set the project **Root Directory** to `apps/web` (uses `apps/web/vercel.json`), and set
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
6. Mobile (EAS): set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MAPS_API_KEY`.

### Payment providers

- **Xendit (gyms):** create one sub-account per gym (xenPlatform), two fee rules (fixed ₱15; 5%),
  set the invoice callback URL to `https://<ref>.supabase.co/functions/v1/webhook-xendit`, and store
  the sub-account id in `facility_payout_accounts` (`charges_enabled = true`).
- **Stripe Connect (clubs/coaches):** onboard connected accounts, store `acct_…` in
  `facility_payout_accounts`, and point a platform webhook at `/functions/v1/webhook-stripe` with events
  `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.

## Rotate now

These were committed to git history and must be treated as public:

- Geoapify key `d797ff…` (rotate, then restrict the new key to your bundle IDs/domains).
- Supabase anon key for project `brctciqhsyjqxfoqyuoz` (anon keys are public by design, but that
  project's RLS is unknown — move to the new project above).

## Known gaps (next steps)

- **Mobile sign-in UI** is not built yet. The client, secure session storage, inbox, gate codes,
  nutrition and checkout all switch to live data as soon as a session exists; signed-out users see
  the existing preview content.
- **QR rendering:** the Cards screen shows the 6-digit code; drawing the `GP2:<pass>:<code>` payload
  as a scannable QR needs a QR component library (not on the approved list yet).
- **Staff scanner** UI should call `verify_pass_code` (RPC is ready and tested).
- **Recurring billing:** `MONTHLY` is charged as a one-month purchase; move to Xendit recurring
  plans / Stripe subscriptions for auto-renewal. Court bookings need slot inventory before sale.
- **Xendit refunds** are not wired to a webhook yet (Stripe refunds are).
- **Edge functions were type-checked and unit-tested under Node**, not executed in Deno here
  (no Deno/Docker in the build sandbox). Run `supabase functions serve` before first deploy.
