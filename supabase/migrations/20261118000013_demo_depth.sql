-- =============================================================================
-- Demo: sample data for court prices, classes, event fees, session packs and
-- desk payments, so each workspace's new tools have something to show.
-- =============================================================================
create function private.seed_demo_depth(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := left(md5(p_uid::text), 14);
  v_gym text := 'demo_' || left(md5(p_uid::text), 20);
  v_club text := 'demo_club_' || v_key;
  v_coach text := 'demo_coach_' || v_key;
  v_org text := 'demo_org_' || v_key;
  v_day timestamptz := date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila';
  v_class uuid;
  v_pack uuid;
  r record;
  i integer;
  d integer;
begin
  -- Club: court rates with an evening peak; existing bookings are priced from them.
  if exists (select 1 from public.facilities where id = v_club and peak_start_hour is null) then
    update public.facilities set peak_start_hour = 17, peak_end_hour = 21 where id = v_club;
    update public.facility_spaces set rate_php = 600, peak_rate_php = 900 where facility_id = v_club and name = 'Main Court';
    update public.facility_spaces set rate_php = 300, peak_rate_php = 450
     where facility_id = v_club and name in ('Pickleball A', 'Pickleball B');
    update public.facility_spaces set rate_php = 250, peak_rate_php = 350 where facility_id = v_club and name = 'Court 2';
    -- Touching the time makes the price trigger run.
    update public.space_bookings set starts_at = starts_at where facility_id = v_club;
    for r in
      select id, booked_for, price_php from public.space_bookings
       where facility_id = v_club and booked_for in ('Reyes family', 'Morning badminton group', 'Tuesday ladder')
    loop
      insert into public.desk_payments (facility_id, amount_php, method, kind, ref_id, payer_name, taken_by, created_at)
      values (v_club, r.price_php, case when r.booked_for = 'Tuesday ladder' then 'EWALLET' else 'CASH' end,
              'BOOKING', r.id, r.booked_for, p_uid, now() - interval '2 hours');
    end loop;
  end if;

  -- Organizer: an entry fee and categories on the open-play event, with some entrants paid.
  if exists (select 1 from public.events where facility_id = v_org and title = 'Saturday Pickleball Open Play'
                and entry_fee_php is null) then
    update public.events set entry_fee_php = 350, categories = array['Beginner', 'Intermediate', 'Open']
     where facility_id = v_org and title = 'Saturday Pickleball Open Play';
    update public.events set entry_fee_php = 600, categories = array['5K', '5K Under 18']
     where facility_id = v_org and title = 'New Year Fun Run 5K';
    for r in
      select e.id as event_id, reg.user_id, row_number() over (order by reg.registered_at) as n
        from public.events e
        join public.event_registrations reg on reg.event_id = e.id and reg.status = 'REGISTERED'
       where e.facility_id = v_org and e.title = 'Saturday Pickleball Open Play'
    loop
      update public.event_registrations
         set category = (array['Beginner', 'Intermediate', 'Open'])[1 + (r.n % 3)]
       where event_id = r.event_id and user_id = r.user_id;
      if r.n <= 6 then
        insert into public.desk_payments (facility_id, amount_php, method, kind, ref_id, user_id, payer_name, taken_by, created_at)
        select v_org, 350, case when r.n % 2 = 0 then 'EWALLET' else 'CASH' end, 'EVENT', r.event_id, r.user_id,
               coalesce(nullif(p.name, ''), 'Entrant'), p_uid, now() - (r.n || ' hours')::interval
          from public.profiles p where p.id = r.user_id;
      end if;
    end loop;
  end if;

  -- Coach: one client part-way through a pack, another with a new one.
  if exists (select 1 from public.facilities where id = v_coach)
     and not exists (select 1 from public.coach_packs where coach_id = p_uid) then
    insert into public.coach_packs (coach_id, client_id, facility_id, name, sessions_total, price_php, created_at)
    values (p_uid, md5('gp-demo-member-1')::uuid, v_coach, '10-session pack', 10, 12000, now() - interval '30 days')
    returning id into v_pack;
    for i in 1..6 loop
      insert into public.coach_sessions (pack_id, held_at) values (v_pack, now() - ((i * 4) || ' days')::interval);
    end loop;
    insert into public.desk_payments (facility_id, amount_php, method, kind, ref_id, user_id, payer_name, taken_by, created_at)
    values (v_coach, 12000, 'BANK', 'PACK', v_pack, md5('gp-demo-member-1')::uuid, 'Andrea Santos', p_uid, now() - interval '30 days');
    insert into public.coach_packs (coach_id, client_id, facility_id, name, sessions_total, price_php, created_at)
    values (p_uid, md5('gp-demo-member-2')::uuid, v_coach, '5-session starter', 5, 6500, now() - interval '3 days');
  end if;

  -- Gym: a week of classes, some nearly full, one with a waitlist.
  if exists (select 1 from public.facilities where id = v_gym)
     and not exists (select 1 from public.class_sessions where facility_id = v_gym) then
    for d in 0..6 loop
      for r in
        select * from (values
          ('Sunrise Yoga', 'Coach Bea', interval '6 hours', 60, 12, 4),
          ('HIIT Express', 'Coach Marco', interval '12 hours', 45, 10, 6),
          ('Evening Spin', 'Coach Jo', interval '18 hours 30 minutes', 45, 8, 9)
        ) as t(title, instructor, at, minutes, capacity, wanting)
      loop
        insert into public.class_sessions (facility_id, title, instructor, starts_at, ends_at, capacity, created_by)
        values (v_gym, r.title, r.instructor, v_day + (d || ' days')::interval + r.at,
                v_day + (d || ' days')::interval + r.at + (r.minutes || ' minutes')::interval, r.capacity, p_uid)
        returning id into v_class;
        -- Only the next two days have bookings; later classes are open.
        if d <= 1 then
          for i in 1..(r.wanting + d) loop
            insert into public.class_bookings (session_id, facility_id, user_id, booked_name, status, created_at)
            select v_class, v_gym, p.id, coalesce(nullif(p.name, ''), 'Member'),
                   case when i <= r.capacity then 'BOOKED' else 'WAITLIST' end, now() - ((20 - i) || ' hours')::interval
              from public.profiles p where p.id = md5('gp-demo-member-' || i)::uuid;
          end loop;
        end if;
      end loop;
    end loop;
  end if;
end;
$$;

create or replace function public.create_demo_venue()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fid text := private.create_demo_venue_base();
begin
  perform private.seed_demo_extras(v_fid, auth.uid());
  perform private.create_demo_workspaces(auth.uid());
  perform private.seed_demo_contacts('demo_club_' || left(md5(auth.uid()::text), 14));
  perform private.seed_demo_posts(auth.uid());
  perform private.seed_demo_depth(auth.uid());
  return v_fid;
end;
$$;

do $$
declare
  r record;
begin
  for r in select owner_id from public.facilities where id like 'demo\_%' and business_kind = 'GYM' loop
    perform private.seed_demo_depth(r.owner_id);
  end loop;
end;
$$;

revoke execute on function private.seed_demo_depth(uuid) from public, anon, authenticated;
