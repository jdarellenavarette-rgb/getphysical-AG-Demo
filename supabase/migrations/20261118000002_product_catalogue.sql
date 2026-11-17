-- =============================================================================
-- Venue-defined catalogue and selling settings.
--
-- Until now every venue sold exactly two fixed things (a day pass and a monthly
-- membership) at two fixed price columns. Venues now define their own products:
-- any name, price and length, as a one-off PASS or a MEMBERSHIP, switched on or
-- off individually. Two venue-wide switches say whether the venue sells passes
-- or memberships at all (many gyms sell only walk-in passes), and a grace period
-- says how long a member still counts as active after a pass ends.
--
-- Backwards compatible: app versions that send the original 'DAY_PASS' /
-- 'MONTHLY' SKUs keep working. Each venue's standard day pass and standard
-- monthly membership are catalogue products linked to those SKUs, and their
-- price is mirrored into the original price columns.
-- =============================================================================

alter table public.facilities
  add column sells_passes boolean not null default true,
  add column sells_memberships boolean not null default true,
  add column membership_grace_days smallint not null default 0
    check (membership_grace_days between 0 and 30);

grant update (sells_passes, sells_memberships, membership_grace_days) on public.facilities to authenticated;

create table public.facility_products (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  description text not null default '' check (char_length(description) <= 200),
  -- PASS: one-off access (fixed ₱15 service fee). MEMBERSHIP: membership pricing (5% service fee).
  kind text not null check (kind in ('PASS', 'MEMBERSHIP')),
  price_php numeric(12, 2) not null check (price_php > 0 and price_php <= 1000000),
  duration_days integer not null check (duration_days between 1 and 366),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  -- Set on the venue's standard day pass / monthly membership only.
  legacy_sku text check (legacy_sku in ('DAY_PASS', 'MONTHLY')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (facility_id, legacy_sku),
  check (legacy_sku is null
         or (legacy_sku = 'DAY_PASS' and kind = 'PASS' and duration_days = 1)
         or (legacy_sku = 'MONTHLY' and kind = 'MEMBERSHIP'))
);

create index facility_products_facility_idx on public.facility_products (facility_id, sort_order, created_at);

create trigger facility_products_set_updated_at
  before update on public.facility_products
  for each row execute function public.set_updated_at();

-- Products are never deleted (orders refer to them); they are switched off.
alter table public.facility_products enable row level security;
revoke all on table public.facility_products from anon, authenticated;
grant select on public.facility_products to anon, authenticated;
grant insert (id, facility_id, name, description, kind, price_php, duration_days, is_active, sort_order)
  on public.facility_products to authenticated;
grant update (name, description, price_php, duration_days, is_active, sort_order)
  on public.facility_products to authenticated;

-- Anyone can see what a venue currently sells; its staff also see what is switched off.
create policy facility_products_read_active on public.facility_products
  for select to anon, authenticated
  using (is_active);
create policy facility_products_read_staff on public.facility_products
  for select to authenticated
  using (public.is_facility_staff(facility_id));
create policy facility_products_admin_insert on public.facility_products
  for insert to authenticated
  with check (public.is_facility_admin(facility_id));
create policy facility_products_admin_update on public.facility_products
  for update to authenticated
  using (public.is_facility_admin(facility_id))
  with check (public.is_facility_admin(facility_id));

-- Keep the original price columns in step with the two standard products, so
-- app versions that still send 'DAY_PASS' / 'MONTHLY' charge the catalogue price
-- (and cannot buy a standard product that has been switched off).
create function public.mirror_standard_product_price()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_price numeric := case when new.is_active then new.price_php end;
begin
  if new.legacy_sku = 'DAY_PASS' then
    update public.facilities
       set day_pass_price_php = v_price, day_pass_price = v_price
     where id = new.facility_id;
  elsif new.legacy_sku = 'MONTHLY' then
    update public.facilities
       set monthly_sub_price_php = v_price, monthly_sub_price = v_price
     where id = new.facility_id;
  end if;
  return null;
end;
$$;

create trigger facility_products_mirror_price
  after insert or update of price_php, is_active on public.facility_products
  for each row
  when (new.legacy_sku is not null)
  execute function public.mirror_standard_product_price();

-- Existing venues: turn their current prices into their two standard products.
insert into public.facility_products (facility_id, name, kind, price_php, duration_days, legacy_sku, sort_order)
select id, 'Day pass', 'PASS', coalesce(day_pass_price_php, day_pass_price), 1, 'DAY_PASS', 0
  from public.facilities
 where coalesce(day_pass_price_php, day_pass_price) > 0;
insert into public.facility_products (facility_id, name, kind, price_php, duration_days, legacy_sku, sort_order)
select id, 'Monthly membership', 'MEMBERSHIP', coalesce(monthly_sub_price_php, monthly_sub_price), 30, 'MONTHLY', 1
  from public.facilities
 where coalesce(monthly_sub_price_php, monthly_sub_price) > 0;

-- Orders remember what was bought, so later edits to a product never change a past sale.
alter table public.payment_orders
  add column product_id uuid references public.facility_products (id) on delete restrict,
  add column product_name text,
  add column duration_days integer check (duration_days is null or duration_days between 1 and 366);
alter table public.payment_orders drop constraint payment_orders_sku_check;
alter table public.payment_orders
  add constraint payment_orders_sku_check check (sku in ('DAY_PASS', 'MONTHLY', 'PRODUCT'));

-- Venue creates one of its two standard products (admins only; the unique
-- constraint allows one of each). Needed because legacy_sku is not client-writable.
create function public.create_standard_product(p_facility_id text, p_legacy_sku text, p_price_php numeric)
returns public.facility_products
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product public.facility_products;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_legacy_sku not in ('DAY_PASS', 'MONTHLY') then
    raise exception 'UNSUPPORTED_SKU' using errcode = '22023';
  end if;
  insert into public.facility_products (facility_id, name, kind, price_php, duration_days, legacy_sku, sort_order)
  values (
    p_facility_id,
    case p_legacy_sku when 'DAY_PASS' then 'Day pass' else 'Monthly membership' end,
    case p_legacy_sku when 'DAY_PASS' then 'PASS' else 'MEMBERSHIP' end,
    p_price_php,
    case p_legacy_sku when 'DAY_PASS' then 1 else 30 end,
    p_legacy_sku,
    case p_legacy_sku when 'DAY_PASS' then 0 else 1 end
  )
  returning * into v_product;
  return v_product;
end;
$$;

revoke execute on function public.create_standard_product(text, text, numeric) from public, anon;
grant execute on function public.create_standard_product(text, text, numeric) to authenticated;

-- -----------------------------------------------------------------------------
-- Checkout: price a catalogue product, and honour the venue's selling switches.
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

-- -----------------------------------------------------------------------------
-- Settlement: the pass lasts as long as the product that was bought.
-- -----------------------------------------------------------------------------
create or replace function public.settle_payment_order(
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

  v_valid_until := case
    when v_order.duration_days is not null then now() + make_interval(days => v_order.duration_days)
    when v_order.sku = 'MONTHLY' then now() + interval '1 month'
    else now() + interval '1 day'
  end;

  insert into public.passes (owner_id, facility_id, sku_id, pass_type, valid_until, payment_order_id)
  values (
    v_order.user_id, v_order.facility_id,
    coalesce(v_order.product_id::text, v_order.sku), coalesce(v_order.product_name, v_order.sku),
    v_valid_until, v_order.id
  )
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
    coalesce(v_order.product_name, v_order.sku) || ' — ' || v_facility.name,
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

-- -----------------------------------------------------------------------------
-- Member standing honours the venue's grace period.
-- -----------------------------------------------------------------------------
create or replace function private.membership_standing_rows(p_facility_id text, p_user_id uuid)
returns table (
  facility_id text,
  user_id uuid,
  membership_status public.membership_status,
  source text,
  joined_at timestamptz,
  broadcasts_muted boolean,
  registry_type public.registry_type,
  pass_valid_until timestamptz,
  last_pass_ended_at timestamptz,
  standing text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.facility_id,
    m.user_id,
    m.status,
    m.source,
    m.joined_at,
    m.broadcasts_muted,
    f.registry_type,
    p.valid_until,
    p.ended_at,
    case
      when m.status = 'CANCELLED' then 'CANCELLED'
      when m.status = 'PENDING' then 'PENDING'
      when p.valid_until is not null then 'ACTIVE'
      when f.registry_type = 'COMMUNITY' then 'ACTIVE'
      -- Grace period: still counted as active for a few days after a pass ends.
      -- Door access is unaffected: verify_pass_code only accepts a valid pass.
      when p.ended_at > now() - make_interval(days => f.membership_grace_days) then 'ACTIVE'
      when p.ended_at is not null then 'LAPSED'
      else 'NO_PASS'
    end
  from public.facility_memberships m
  join public.facilities f on f.id = m.facility_id
  left join lateral (
    select
      max(ps.valid_until) filter (where ps.status = 'ACTIVE' and ps.valid_until > now()) as valid_until,
      -- When access last ended: an expired pass's end date, or the creation date of a revoked one.
      max(case when ps.status = 'ACTIVE' then ps.valid_until else ps.created_at end)
        filter (where ps.status <> 'ACTIVE' or ps.valid_until <= now()) as ended_at
    from public.passes ps
    where ps.facility_id = m.facility_id and ps.owner_id = m.user_id
  ) p on true
  where (p_facility_id is null or m.facility_id = p_facility_id)
    and (p_user_id is null or m.user_id = p_user_id);
$$;
