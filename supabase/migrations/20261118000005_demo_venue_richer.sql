-- =============================================================================
-- Richer demo venue: a month of check-ins with morning and evening peaks, a
-- member on a free desk-granted pass, a member who holds a pass but never
-- visits, and passes about to end. This gives the Overview's busy-hours map,
-- door-versus-sales, at-risk list and growth figures something to show.
-- Applies to demo venues created from now on; existing ones are unchanged.
-- =============================================================================

create or replace function public.create_demo_venue()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_fid text;
  v_names text[] := array[
    'Andrea Santos', 'Miguel Reyes', 'Bianca Cruz', 'Paolo Garcia', 'Katrina Lim', 'Rafael Tan',
    'Isabel Mendoza', 'Joaquin Ramos', 'Camille Torres', 'Enzo Villanueva', 'Patricia Aquino',
    'Marco Dela Cruz', 'Sofia Bautista', 'Luis Navarro', 'Hannah Uy', 'Gabriel Castro',
    'Nicole Flores', 'Daniel Ocampo'
  ];
  v_day uuid; v_week uuid; v_month uuid; v_year uuid;
  v_member uuid; v_pass uuid; v_product uuid; v_conversation uuid; v_broadcast uuid; v_segment uuid;
  v_name text; v_price numeric; v_days integer; v_plan text; v_kind text; v_until timestamptz; v_bought timestamptz;
  i integer; d integer;
  v_at timestamptz;
  v_day_start timestamptz := date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila';
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if public.payments_mode() <> 'sandbox' then
    raise exception 'DEMO_DISABLED' using errcode = 'P0001', hint = 'Demo venues are only available in test mode.';
  end if;

  v_fid := 'demo_' || left(md5(v_uid::text), 20);
  if exists (select 1 from public.facilities where id = v_fid) then
    return v_fid;
  end if;

  insert into public.facilities (id, owner_id, name, registry_type, category, address, lat, lng, hours, amenities, max_capacity)
  values (
    v_fid, v_uid, 'Pulse Fitness (Demo)', 'COMMERCIAL', 'Gym',
    'Demo address, Bonifacio Global City, Taguig', 14.5507, 121.0494,
    'Mon–Sun, 5:00 AM – 11:00 PM',
    array['Showers', 'Lockers', 'Free weights', 'Cardio zone', 'Parking'], 120
  );

  insert into public.facility_products (facility_id, name, description, kind, price_php, duration_days, legacy_sku, sort_order)
  values (v_fid, 'Day pass', 'Full access for one day', 'PASS', 350, 1, 'DAY_PASS', 0) returning id into v_day;
  insert into public.facility_products (facility_id, name, description, kind, price_php, duration_days, sort_order)
  values (v_fid, 'Weekly pass', 'Seven days, all areas', 'PASS', 1200, 7, 1) returning id into v_week;
  insert into public.facility_products (facility_id, name, description, kind, price_php, duration_days, legacy_sku, sort_order)
  values (v_fid, 'Monthly membership', 'All areas, all hours', 'MEMBERSHIP', 2499, 30, 'MONTHLY', 2) returning id into v_month;
  insert into public.facility_products (facility_id, name, description, kind, price_php, duration_days, sort_order)
  values (v_fid, 'Annual membership', 'Twelve months for the price of ten', 'MEMBERSHIP', 24990, 365, 3) returning id into v_year;

  insert into public.facility_payout_accounts (facility_id, preferred_provider, maya_merchant_id, charges_enabled, is_sandbox)
  values (v_fid, 'MAYA', 'SANDBOX-DEMO', true, true);

  insert into public.facility_segments (facility_id, key, label)
  values (v_fid, 'SEGMENT_1', 'Morning regulars') returning id into v_segment;

  for i in 1..array_length(v_names, 1) loop
    v_name := v_names[i];
    v_member := md5('gp-demo-member-' || i)::uuid;
    insert into auth.users (id, email, raw_user_meta_data)
    values (v_member, 'demo-member-' || lpad(i::text, 2, '0') || '@demo.getphysical.test', jsonb_build_object('name', v_name))
    on conflict (id) do nothing;
    update public.profiles
       set username = coalesce(username, 'demo_' || lower(split_part(v_name, ' ', 1)) || i),
           name = v_name
     where id = v_member;

    insert into public.facility_memberships (facility_id, user_id, status, source, joined_at, broadcasts_muted)
    values (
      v_fid, v_member,
      case when i = 17 then 'CANCELLED'::public.membership_status else 'ACTIVE' end,
      case when i in (15, 16) then 'STAFF_ADDED' else 'PURCHASE' end,
      now() - make_interval(days => 5 + i * 9),
      i = 18
    );

    -- Member 15 was added at the desk and given a free pass; member 16 has never held one.
    if i = 15 then
      insert into public.passes (owner_id, facility_id, sku_id, pass_type, valid_until, gifted_by_user_id, created_at)
      values (v_member, v_fid, 'COMP_PASS', 'COMP_PASS', now() + interval '5 days', v_uid, now() - interval '2 days')
      returning id into v_pass;
      for d in 0..1 loop
        v_at := now() - make_interval(days => d, hours => 3);
        insert into public.access_scans (facility_id, user_id, pass_id, scanned_by, member_name, status, totp_window, created_at)
        values (v_fid, v_member, v_pass, v_uid, v_name, 'GRANTED', floor(extract(epoch from v_at) / 60)::bigint, v_at);
      end loop;
    end if;
    continue when i in (15, 16);

    -- What they bought: a mix of plans.
    if i % 4 = 0 then v_product := v_year;  v_plan := 'Annual membership';  v_price := 24990; v_days := 365; v_kind := 'recurring_subscription';
    elsif i % 3 = 0 then v_product := v_week;  v_plan := 'Weekly pass';        v_price := 1200;  v_days := 7;   v_kind := 'one_time_pass';
    else                 v_product := v_month; v_plan := 'Monthly membership'; v_price := 2499;  v_days := 30;  v_kind := 'recurring_subscription';
    end if;

    -- 1–10 and 18 hold a valid pass; 11–14 and 17 have lapsed.
    if i <= 10 or i = 18 then
      v_until := now() + make_interval(days => 2 + i * 2);
    else
      v_until := now() - make_interval(days => i - 9);
    end if;
    v_bought := least(v_until - make_interval(days => v_days), now() - make_interval(hours => i));

    insert into public.passes (owner_id, facility_id, sku_id, pass_type, valid_until, created_at)
    values (v_member, v_fid, v_product::text, v_plan, v_until, v_bought)
    returning id into v_pass;

    insert into public.payment_orders (
      user_id, facility_id, sku, billing_kind, base_amount_php, service_fee_php, total_php, provider,
      status, idempotency_key, pass_id, paid_at, created_at, product_id, product_name, duration_days
    )
    values (
      v_member, v_fid, 'PRODUCT', v_kind, v_price, public.calculate_service_fee(v_price, v_kind),
      v_price + public.calculate_service_fee(v_price, v_kind), 'MAYA',
      'PAID', 'demo-' || v_fid || '-' || i, v_pass, v_bought, v_bought, v_product, v_plan, v_days
    );

    -- A month of check-ins with morning and evening peaks. Member 18 holds a pass but never comes.
    if i <= 10 then
      for d in 0..29 loop
        continue when (i * 7 + d * 3) % 5 < 2;
        v_at := v_day_start - make_interval(days => d)
                + make_interval(
                    hours => case (i + d) % 5 when 0 then 6 when 1 then 7 when 2 then 18 when 3 then 19 else 12 end,
                    mins => (i * 13 + d * 7) % 55);
        continue when v_at > now() or v_at < v_bought;
        insert into public.access_scans (facility_id, user_id, pass_id, scanned_by, member_name, status, totp_window, created_at)
        values (v_fid, v_member, v_pass, v_uid, v_name, 'GRANTED', floor(extract(epoch from v_at) / 60)::bigint, v_at);
      end loop;
    elsif i in (11, 12) then
      insert into public.access_scans (facility_id, user_id, pass_id, scanned_by, member_name, status, reason, created_at)
      values (v_fid, v_member, v_pass, v_uid, v_name, 'DENIED', 'PASS_EXPIRED', now() - make_interval(mins => 40 * (i - 10)));
    end if;

    if i <= 5 then
      insert into public.facility_segment_members (segment_id, user_id) values (v_segment, v_member);
    end if;
  end loop;

  -- One broadcast, delivered to four members, and a few conversations.
  insert into public.crm_broadcasts (facility_id, created_by, suite_mode, audience, title, body, recipient_count, created_at)
  values (v_fid, v_uid, 'GYMDASH', 'ALL', 'New 6 AM strength class',
          'Starting Monday we open the floor at 5 and run a coached strength class at 6. Bring a friend for free this week.',
          4, now() - interval '2 days')
  returning id into v_broadcast;

  for i in 1..4 loop
    v_member := md5('gp-demo-member-' || i)::uuid;
    insert into public.conversations (kind, facility_id, athlete_id, created_by)
    values ('FACILITY', v_fid, v_member, v_uid) returning id into v_conversation;
    insert into public.conversation_participants (conversation_id, user_id) values (v_conversation, v_member);
    insert into public.messages (conversation_id, sender_id, sender_kind, body, broadcast_id, created_at)
    values (v_conversation, v_uid, 'FACILITY',
            E'New 6 AM strength class\n\nStarting Monday we open the floor at 5 and run a coached strength class at 6. Bring a friend for free this week.',
            v_broadcast, now() - interval '2 days');
    if i = 1 then
      insert into public.messages (conversation_id, sender_id, sender_kind, body, created_at)
      values (v_conversation, v_member, 'USER', 'Love this. Can I bring my sister on Wednesday?', now() - interval '3 hours');
    elsif i = 2 then
      insert into public.messages (conversation_id, sender_id, sender_kind, body, created_at)
      values (v_conversation, v_member, 'USER', 'Is the class included in the monthly membership?', now() - interval '26 hours');
      insert into public.messages (conversation_id, sender_id, sender_kind, body, created_at)
      values (v_conversation, v_uid, 'FACILITY', 'Yes, it is included. See you Monday!', now() - interval '25 hours');
    end if;
  end loop;

  -- A lapsed member asking about renewing.
  v_member := md5('gp-demo-member-11')::uuid;
  insert into public.conversations (kind, facility_id, athlete_id, created_by)
  values ('FACILITY', v_fid, v_member, v_member) returning id into v_conversation;
  insert into public.conversation_participants (conversation_id, user_id) values (v_conversation, v_member);
  insert into public.messages (conversation_id, sender_id, sender_kind, body, created_at)
  values (v_conversation, v_member, 'USER', 'Hi! My pass ended last week. Is there a promo if I renew for a year?', now() - interval '50 minutes');

  return v_fid;
end;
$$;
