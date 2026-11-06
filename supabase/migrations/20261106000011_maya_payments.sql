-- =============================================================================
-- Maya Checkout as a selectable provider (test provider for now).
--
-- facility_payout_accounts.preferred_provider overrides the registry default
-- (COMMERCIAL -> Xendit, COMMUNITY -> Stripe). For Maya, each facility will
-- eventually need its own Maya merchant account (so GetPhysical is not the
-- Merchant of Record); in sandbox a single platform test account is used.
-- =============================================================================

alter table public.facility_payout_accounts
  add column preferred_provider public.payment_provider,
  add column maya_merchant_id text;

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

  select * into v_payout from public.facility_payout_accounts where facility_id = p_facility_id;
  if not found or not v_payout.charges_enabled then
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

revoke execute on function public.create_payment_order(text, text, text) from public, anon;
grant execute on function public.create_payment_order(text, text, text) to authenticated;
