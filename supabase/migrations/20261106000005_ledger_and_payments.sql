-- =============================================================================
-- Append-only ledger + payment orders (Xendit xenPlatform / Stripe Connect).
--
-- Money flow:
--   1. Client calls create_payment_order()  -> server prices the SKU, PENDING row
--   2. Edge function payments-checkout      -> creates provider checkout, attach_payment_checkout()
--   3. Provider webhook (edge function)     -> settle_payment_order() (service_role only)
--        - idempotent per provider event and per order
--        - appends ledger row, issues pass (+ TOTP secret), activates membership
--   4. Refund webhook                        -> refund_payment_order(): reversing entry
-- GetPhysical is never Merchant of Record; funds settle to the facility's
-- sub-account / connected account and the platform fee is split by the provider.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Append-only enforcement (applies to every role, including service_role).
-- -----------------------------------------------------------------------------
create function public.forbid_append_only_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only: % is not allowed. Write a reversing entry instead.',
    tg_table_name, tg_op
    using errcode = '42501';
end;
$$;

create trigger ledger_transactions_append_only
  before update or delete on public.ledger_transactions
  for each row execute function public.forbid_append_only_mutation();
create trigger ledger_transactions_no_truncate
  before truncate on public.ledger_transactions
  for each statement execute function public.forbid_append_only_mutation();

create trigger access_scans_append_only
  before update or delete on public.access_scans
  for each row execute function public.forbid_append_only_mutation();
create trigger access_scans_no_truncate
  before truncate on public.access_scans
  for each statement execute function public.forbid_append_only_mutation();

-- -----------------------------------------------------------------------------
-- Fee model (must match calculateHybridServiceFee in sodia-core/constants.ts)
--   one-time pass / court / ticket: fixed ₱15 (₱0 when base is 0)
--   recurring subscription:         5% rounded to centavos
-- -----------------------------------------------------------------------------
create function public.calculate_service_fee(p_base numeric, p_billing_kind text)
returns numeric
language sql
immutable
strict
set search_path = ''
as $$
  select case
    when p_billing_kind = 'recurring_subscription'
      then round(greatest(round(p_base, 2), 0) * 0.05, 2)
    when greatest(round(p_base, 2), 0) > 0 then 15.00
    else 0.00
  end;
$$;

-- -----------------------------------------------------------------------------
-- Payout routing per facility (written by onboarding back-office only).
-- -----------------------------------------------------------------------------
create table public.facility_payout_accounts (
  facility_id text primary key references public.facilities (id) on delete cascade,
  xendit_sub_account_id text,
  stripe_account_id text check (stripe_account_id is null or stripe_account_id ~ '^acct_'),
  charges_enabled boolean not null default false,
  updated_at timestamptz default now()
);

create trigger facility_payout_accounts_set_updated_at
  before update on public.facility_payout_accounts
  for each row execute function public.set_updated_at();

create type public.payment_provider as enum ('XENDIT', 'STRIPE');
create type public.payment_order_status as enum ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED');

create table public.payment_orders (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  facility_id text not null references public.facilities (id) on delete restrict,
  sku text not null check (sku in ('DAY_PASS', 'MONTHLY')),
  billing_kind text not null check (billing_kind in ('one_time_pass', 'recurring_subscription')),
  base_amount_php numeric(12, 2) not null check (base_amount_php > 0),
  service_fee_php numeric(12, 2) not null check (service_fee_php >= 0),
  total_php numeric(12, 2) not null check (total_php > 0),
  currency text not null default 'PHP' check (currency = 'PHP'),
  provider public.payment_provider not null,
  provider_ref text,
  checkout_url text,
  status public.payment_order_status not null default 'PENDING',
  failure_reason text,
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 128),
  pass_id uuid references public.passes (id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, idempotency_key),
  unique (provider, provider_ref)
);

create index payment_orders_user_idx on public.payment_orders (user_id, created_at desc);
create index payment_orders_facility_idx on public.payment_orders (facility_id, created_at desc);

create trigger payment_orders_set_updated_at
  before update on public.payment_orders
  for each row execute function public.set_updated_at();

alter table public.passes
  add constraint passes_payment_order_fk
  foreign key (payment_order_id) references public.payment_orders (id) on delete set null;
alter table public.ledger_transactions
  add constraint ledger_payment_order_fk
  foreign key (payment_order_id) references public.payment_orders (id) on delete restrict;

-- Webhook de-duplication log (providers retry; we process each event once).
create table public.payment_webhook_events (
  id bigint generated always as identity primary key,
  provider public.payment_provider not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz default now(),
  unique (provider, event_id)
);

-- -----------------------------------------------------------------------------
-- RPC (authenticated): price and create a PENDING order. Price comes from the
-- facility row, never from the client.
-- -----------------------------------------------------------------------------
create function public.create_payment_order(
  p_facility_id text,
  p_sku text,
  p_idempotency_key text
)
returns public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_dob date;
  v_facility public.facilities%rowtype;
  v_payout public.facility_payout_accounts%rowtype;
  v_base numeric(12, 2);
  v_kind text;
  v_fee numeric(12, 2);
  v_provider public.payment_provider;
  v_order public.payment_orders;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select * into v_order
    from public.payment_orders
   where user_id = v_uid and idempotency_key = p_idempotency_key;
  if found then
    return v_order;
  end if;

  -- Age gate: under-18 accounts cannot transact (AGENTS.md §3.9).
  select dob into v_dob from public.profiles where id = v_uid;
  if v_dob is null then
    raise exception 'AGE_VERIFICATION_REQUIRED' using errcode = 'P0001';
  end if;
  if v_dob > (current_date - interval '18 years') then
    raise exception 'PAYMENT_BLOCKED_UNDER_18' using errcode = 'P0001';
  end if;

  select * into v_facility from public.facilities where id = p_facility_id;
  if not found then
    raise exception 'FACILITY_NOT_FOUND' using errcode = 'P0002';
  end if;

  if p_sku = 'DAY_PASS' then
    v_base := coalesce(v_facility.day_pass_price_php, v_facility.day_pass_price);
    v_kind := 'one_time_pass';
  elsif p_sku = 'MONTHLY' then
    v_base := coalesce(v_facility.monthly_sub_price_php, v_facility.monthly_sub_price);
    v_kind := 'recurring_subscription';
  else
    raise exception 'UNSUPPORTED_SKU' using errcode = '22023';
  end if;

  if v_base is null or v_base <= 0 then
    raise exception 'SKU_NOT_FOR_SALE' using errcode = 'P0001';
  end if;

  v_provider := case v_facility.registry_type
    when 'COMMERCIAL' then 'XENDIT'::public.payment_provider
    else 'STRIPE'::public.payment_provider
  end;

  select * into v_payout from public.facility_payout_accounts where facility_id = p_facility_id;
  if not found
     or not v_payout.charges_enabled
     or (v_provider = 'XENDIT' and v_payout.xendit_sub_account_id is null)
     or (v_provider = 'STRIPE' and v_payout.stripe_account_id is null) then
    raise exception 'FACILITY_PAYOUTS_NOT_CONFIGURED' using errcode = 'P0001';
  end if;

  v_fee := public.calculate_service_fee(v_base, v_kind);

  insert into public.payment_orders (
    user_id, facility_id, sku, billing_kind, base_amount_php, service_fee_php,
    total_php, provider, idempotency_key
  )
  values (
    v_uid, p_facility_id, p_sku, v_kind, v_base, v_fee, v_base + v_fee, v_provider,
    p_idempotency_key
  )
  returning * into v_order;

  return v_order;
end;
$$;

-- service_role: store the provider checkout reference after creating it.
create function public.attach_payment_checkout(
  p_order_id uuid,
  p_provider_ref text,
  p_checkout_url text
)
returns public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.payment_orders;
begin
  update public.payment_orders
     set provider_ref = p_provider_ref,
         checkout_url = p_checkout_url
   where id = p_order_id
     and status = 'PENDING'
     and (provider_ref is null or provider_ref = p_provider_ref)
  returning * into v_order;
  if not found then
    raise exception 'ORDER_NOT_ATTACHABLE' using errcode = 'P0001';
  end if;
  return v_order;
end;
$$;

-- service_role: record a webhook event once. Returns false for duplicates.
create function public.record_payment_webhook_event(
  p_provider public.payment_provider,
  p_event_id text,
  p_event_type text,
  p_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.payment_webhook_events (provider, event_id, event_type, payload)
  values (p_provider, p_event_id, p_event_type, p_payload);
  return true;
exception when unique_violation then
  return false;
end;
$$;

-- service_role: settle a paid order. Idempotent.
create function public.settle_payment_order(
  p_order_id uuid,
  p_provider public.payment_provider,
  p_provider_ref text,
  p_paid_amount numeric
)
returns public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.payment_orders;
  v_facility public.facilities%rowtype;
  v_buyer text;
  v_pass_id uuid;
  v_valid_until timestamptz;
begin
  select * into v_order
    from public.payment_orders
   where id = p_order_id
   for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_order.provider <> p_provider
     or (v_order.provider_ref is not null and v_order.provider_ref <> p_provider_ref) then
    raise exception 'ORDER_PROVIDER_MISMATCH' using errcode = 'P0001';
  end if;
  if v_order.status = 'PAID' or v_order.status = 'REFUNDED' then
    return v_order;
  end if;

  if round(p_paid_amount, 2) <> v_order.total_php then
    update public.payment_orders
       set status = 'FAILED',
           failure_reason = 'AMOUNT_MISMATCH: paid ' || round(p_paid_amount, 2)::text
                            || ' expected ' || v_order.total_php::text,
           provider_ref = coalesce(provider_ref, p_provider_ref)
     where id = v_order.id
    returning * into v_order;
    return v_order;
  end if;

  select * into v_facility from public.facilities where id = v_order.facility_id;
  select coalesce(nullif(name, ''), username::text) into v_buyer
    from public.profiles where id = v_order.user_id;

  v_valid_until := case v_order.sku
    when 'MONTHLY' then now() + interval '1 month'
    else now() + interval '1 day'
  end;

  insert into public.passes (owner_id, facility_id, sku_id, pass_type, valid_until, payment_order_id)
  values (v_order.user_id, v_order.facility_id, v_order.sku, v_order.sku, v_valid_until, v_order.id)
  returning id into v_pass_id;

  insert into public.ledger_transactions (
    reference_no, idempotency_key, user_id, member_name, buyer_display_name,
    facility_id, facility_name, type, entry_type, amount, gross_amount_php,
    platform_fee_php, net_facility_amount_php, description, method, payment_method,
    payment_order_id, metadata
  )
  values (
    'GP-' || upper(substr(replace(v_order.id::text, '-', ''), 1, 12)),
    'order:' || v_order.id::text,
    v_order.user_id, v_buyer, v_buyer,
    v_order.facility_id, v_facility.name, 'SALE', 'ORIGINAL',
    v_order.total_php, v_order.total_php, v_order.service_fee_php, v_order.base_amount_php,
    v_order.sku || ' — ' || v_facility.name,
    v_order.provider::text, v_order.provider::text,
    v_order.id,
    jsonb_build_object('provider_ref', p_provider_ref, 'pass_id', v_pass_id)
  );

  -- Activate membership. A full free community club must not block a paid pass.
  begin
    insert into public.facility_memberships (facility_id, user_id, status, source)
    values (v_order.facility_id, v_order.user_id, 'ACTIVE', 'PURCHASE')
    on conflict (facility_id, user_id) do update set status = 'ACTIVE';
  exception when raise_exception then
    null;
  end;

  update public.payment_orders
     set status = 'PAID',
         paid_at = now(),
         pass_id = v_pass_id,
         provider_ref = coalesce(provider_ref, p_provider_ref),
         failure_reason = null
   where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

-- service_role: mark an unpaid order EXPIRED / FAILED.
create function public.close_payment_order(
  p_order_id uuid,
  p_status public.payment_order_status,
  p_reason text default null
)
returns public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.payment_orders;
begin
  if p_status not in ('EXPIRED', 'FAILED') then
    raise exception 'INVALID_STATUS' using errcode = '22023';
  end if;
  update public.payment_orders
     set status = p_status, failure_reason = p_reason
   where id = p_order_id and status = 'PENDING'
  returning * into v_order;
  if not found then
    select * into v_order from public.payment_orders where id = p_order_id;
  end if;
  return v_order;
end;
$$;

-- service_role: refund = reversing ledger entry + revoke pass. Idempotent.
create function public.refund_payment_order(p_order_id uuid, p_reason text)
returns public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.payment_orders;
  v_original public.ledger_transactions%rowtype;
begin
  select * into v_order from public.payment_orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_order.status = 'REFUNDED' then
    return v_order;
  end if;
  if v_order.status <> 'PAID' then
    raise exception 'ORDER_NOT_PAID' using errcode = 'P0001';
  end if;

  select * into v_original
    from public.ledger_transactions
   where payment_order_id = v_order.id and entry_type = 'ORIGINAL';

  insert into public.ledger_transactions (
    reference_no, idempotency_key, user_id, member_name, buyer_display_name,
    facility_id, facility_name, type, entry_type, amount, gross_amount_php,
    platform_fee_php, net_facility_amount_php, description, method, payment_method,
    reversing_transaction_id, payment_order_id, metadata
  )
  values (
    v_original.reference_no || '-R',
    'refund:' || v_order.id::text,
    v_original.user_id, v_original.member_name, v_original.buyer_display_name,
    v_original.facility_id, v_original.facility_name, 'REFUND', 'REVERSAL',
    -v_original.amount, -v_original.gross_amount_php, -v_original.platform_fee_php,
    -v_original.net_facility_amount_php,
    'Refund: ' || coalesce(p_reason, 'requested'),
    v_original.method, v_original.payment_method,
    v_original.id, v_order.id,
    jsonb_build_object('reason', p_reason)
  );

  update public.passes set status = 'REVOKED' where id = v_order.pass_id;

  update public.payment_orders set status = 'REFUNDED'
   where id = v_order.id
  returning * into v_order;
  return v_order;
end;
$$;
