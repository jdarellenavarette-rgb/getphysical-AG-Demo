-- =============================================================================
-- Payout setup a venue can do itself, for test mode.
--
-- A venue can only sell once its payout account is ready. Until now only the
-- back office could set that. This adds:
--   * a platform-wide payments mode ('live' by default, 'sandbox' for demo and
--     staging), changed only by an operator;
--   * in sandbox mode, a venue owner or admin can connect Maya test payments
--     themselves. Sales run through Maya's sandbox: no real money moves;
--   * a "request live payouts" marker for the real path, which Maya handles
--     with the venue directly (identity and bank checks). Nothing here stores
--     bank, GCash or card details.
-- A test-mode connection stops selling the moment the platform is switched to live.
-- =============================================================================

create table private.platform_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
revoke all on table private.platform_settings from public, anon, authenticated;

create function public.payments_mode()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select value from private.platform_settings where key = 'payments_mode'), 'live');
$$;

-- Operator only (dashboard SQL editor or a server-side script).
create function public.admin_set_payments_mode(p_mode text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_mode not in ('sandbox', 'live') then
    raise exception 'INVALID_MODE' using errcode = '22023', hint = 'Use sandbox or live.';
  end if;
  insert into private.platform_settings (key, value) values ('payments_mode', p_mode)
  on conflict (key) do update set value = excluded.value, updated_at = now();
  return p_mode;
end;
$$;

alter table public.facility_payout_accounts
  add column is_sandbox boolean not null default false,
  add column live_requested_at timestamptz;

-- Owner or admin connects Maya test payments for their venue (sandbox mode only).
create function public.connect_sandbox_payouts(p_facility_id text)
returns public.facility_payout_accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account public.facility_payout_accounts;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if public.payments_mode() <> 'sandbox' then
    raise exception 'SANDBOX_DISABLED' using errcode = 'P0001',
      hint = 'Test payments are not available on this platform.';
  end if;

  insert into public.facility_payout_accounts (facility_id, preferred_provider, maya_merchant_id, charges_enabled, is_sandbox)
  values (p_facility_id, 'MAYA', 'SANDBOX-' || upper(left(md5(p_facility_id), 10)), true, true)
  on conflict (facility_id) do update
    set preferred_provider = 'MAYA',
        maya_merchant_id = excluded.maya_merchant_id,
        charges_enabled = true,
        is_sandbox = true
    -- Never downgrade a venue that is already live.
    where public.facility_payout_accounts.is_sandbox or not public.facility_payout_accounts.charges_enabled
  returning * into v_account;
  if v_account.facility_id is null then
    raise exception 'ALREADY_LIVE' using errcode = 'P0001';
  end if;
  return v_account;
end;
$$;

-- Owner or admin turns test payments off again. A live account cannot be turned off here.
create function public.disconnect_sandbox_payouts(p_facility_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  update public.facility_payout_accounts
     set charges_enabled = false, is_sandbox = false, preferred_provider = null, maya_merchant_id = null
   where facility_id = p_facility_id and is_sandbox;
  if not found then
    raise exception 'NOT_IN_TEST_MODE' using errcode = 'P0002';
  end if;
end;
$$;

-- Owner or admin asks to be set up for real payouts. Records the request for the back office.
create function public.request_live_payouts(p_facility_id text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  insert into public.facility_payout_accounts (facility_id, live_requested_at)
  values (p_facility_id, now())
  on conflict (facility_id) do update
    set live_requested_at = coalesce(public.facility_payout_accounts.live_requested_at, now())
  returning live_requested_at into v_at;
  return v_at;
end;
$$;

revoke execute on function
  public.payments_mode(),
  public.admin_set_payments_mode(text),
  public.connect_sandbox_payouts(text),
  public.disconnect_sandbox_payouts(text),
  public.request_live_payouts(text)
from public, anon, authenticated;

grant execute on function
  public.payments_mode(),
  public.connect_sandbox_payouts(text),
  public.disconnect_sandbox_payouts(text),
  public.request_live_payouts(text)
to authenticated;
grant execute on function public.payments_mode() to anon;
grant execute on function public.admin_set_payments_mode(text) to service_role;

-- -----------------------------------------------------------------------------
-- Checkout: a test-mode connection only sells while the platform is in test mode.
-- -----------------------------------------------------------------------------
create or replace function public.create_payment_order(
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
  v_product public.facility_products%rowtype;
  v_sku text := p_sku;
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

  -- p_sku is either a catalogue product id, or one of the two original SKUs
  -- (still sent by app versions that predate the catalogue).
  if p_sku ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select * into v_product
      from public.facility_products
     where id = p_sku::uuid and facility_id = p_facility_id;
    if not found or not v_product.is_active then
      raise exception 'PRODUCT_NOT_AVAILABLE' using errcode = 'P0001';
    end if;
    v_base := v_product.price_php;
    v_kind := case v_product.kind when 'MEMBERSHIP' then 'recurring_subscription' else 'one_time_pass' end;
    v_sku := 'PRODUCT';
  elsif p_sku = 'DAY_PASS' then
    v_base := coalesce(v_facility.day_pass_price_php, v_facility.day_pass_price);
    v_kind := 'one_time_pass';
  elsif p_sku = 'MONTHLY' then
    v_base := coalesce(v_facility.monthly_sub_price_php, v_facility.monthly_sub_price);
    v_kind := 'recurring_subscription';
  else
    raise exception 'UNSUPPORTED_SKU' using errcode = '22023';
  end if;

  -- The venue decides what it sells at all.
  if (v_kind = 'one_time_pass' and not v_facility.sells_passes)
     or (v_kind = 'recurring_subscription' and not v_facility.sells_memberships) then
    raise exception 'PRODUCT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if v_base is null or v_base <= 0 then
    raise exception 'SKU_NOT_FOR_SALE' using errcode = 'P0001';
  end if;

  select * into v_payout from public.facility_payout_accounts where facility_id = p_facility_id;
  if not found or not v_payout.charges_enabled then
    raise exception 'FACILITY_PAYOUTS_NOT_CONFIGURED' using errcode = 'P0001';
  end if;
  -- A test-mode connection only sells while the platform itself is in test mode.
  if v_payout.is_sandbox and public.payments_mode() <> 'sandbox' then
    raise exception 'FACILITY_PAYOUTS_NOT_CONFIGURED' using errcode = 'P0001';
  end if;

  v_provider := coalesce(
    v_payout.preferred_provider,
    case v_facility.registry_type
      when 'COMMERCIAL' then 'XENDIT'::public.payment_provider
      else 'STRIPE'::public.payment_provider
    end
  );

  if (v_provider = 'XENDIT' and v_payout.xendit_sub_account_id is null)
     or (v_provider = 'STRIPE' and v_payout.stripe_account_id is null) then
    raise exception 'FACILITY_PAYOUTS_NOT_CONFIGURED' using errcode = 'P0001';
  end if;

  v_fee := public.calculate_service_fee(v_base, v_kind);

  insert into public.payment_orders (
    user_id, facility_id, sku, billing_kind, base_amount_php, service_fee_php,
    total_php, provider, idempotency_key, product_id, product_name, duration_days
  )
  values (
    v_uid, p_facility_id, v_sku, v_kind, v_base, v_fee, v_base + v_fee, v_provider,
    p_idempotency_key, v_product.id, v_product.name, v_product.duration_days
  )
  returning * into v_order;

  return v_order;
end;
$$;
