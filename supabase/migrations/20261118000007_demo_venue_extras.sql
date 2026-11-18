-- =============================================================================
-- Demo venue: sample courts and bookings, events with sign-ups, imported
-- records and coach clients, so every section of the suite has something to
-- show. Added to new demo venues, and to an existing one the next time its
-- owner opens it through create_demo_venue().
-- =============================================================================

alter function public.create_demo_venue() set schema private;
alter function private.create_demo_venue() rename to create_demo_venue_base;

create function private.seed_demo_extras(p_fid text, p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day timestamptz := date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila';
  v_court uuid; v_a uuid; v_b uuid; v_studio uuid;
  v_event uuid;
  v_member uuid;
  i integer;
begin
  if p_fid not like 'demo\_%' or exists (select 1 from public.facility_spaces where facility_id = p_fid) then
    return;
  end if;

  -- Courts: one multi-purpose court that divides in two, and a studio.
  insert into public.facility_spaces (facility_id, name, sport) values (p_fid, 'Main Court', 'Basketball')
    returning id into v_court;
  insert into public.facility_spaces (facility_id, parent_id, name, sport) values (p_fid, v_court, 'Pickleball A', 'Pickleball')
    returning id into v_a;
  insert into public.facility_spaces (facility_id, parent_id, name, sport) values (p_fid, v_court, 'Pickleball B', 'Pickleball')
    returning id into v_b;
  insert into public.facility_spaces (facility_id, name, sport) values (p_fid, 'Studio', 'Classes')
    returning id into v_studio;

  insert into public.space_bookings (facility_id, space_id, booked_for, note, starts_at, ends_at, created_by) values
    (p_fid, v_studio, 'Sunrise Yoga', 'Weekly class', v_day + interval '6 hours', v_day + interval '7 hours', p_uid),
    (p_fid, v_a, 'Reyes family', 'Paid at the desk', v_day + interval '8 hours', v_day + interval '9 hours 30 minutes', p_uid),
    (p_fid, v_b, 'Tuesday ladder', null, v_day + interval '8 hours', v_day + interval '10 hours', p_uid),
    (p_fid, v_studio, 'HIIT Express', 'Weekly class', v_day + interval '12 hours', v_day + interval '13 hours', p_uid),
    (p_fid, v_court, 'Barangay league game', 'Whole court', v_day + interval '17 hours', v_day + interval '19 hours', p_uid),
    (p_fid, v_a, 'Santos doubles', null, v_day + interval '19 hours 30 minutes', v_day + interval '21 hours', p_uid),
    (p_fid, v_studio, 'Evening Spin', 'Weekly class', v_day + interval '18 hours', v_day + interval '19 hours', p_uid),
    (p_fid, v_court, 'Corporate shootaround', 'Whole court', v_day + interval '1 day 10 hours', v_day + interval '1 day 12 hours', p_uid),
    (p_fid, v_b, 'Lim and friends', null, v_day + interval '1 day 16 hours', v_day + interval '1 day 17 hours 30 minutes', p_uid);

  -- An upcoming event that is filling up.
  insert into public.events (organizer_id, facility_id, title, description, sport, starts_at, ends_at, capacity)
  values (p_uid, p_fid, 'Saturday Pickleball Open Play', 'All levels. Paddles available at the desk.', 'Pickleball',
          v_day + interval '3 days 9 hours', v_day + interval '3 days 12 hours', 16)
  returning id into v_event;
  for i in 1..11 loop
    insert into public.event_registrations (event_id, user_id, status, registered_at)
    values (v_event, md5('gp-demo-member-' || i)::uuid, case when i = 11 then 'CANCELLED' else 'REGISTERED' end,
            now() - (i || ' hours')::interval);
  end loop;

  insert into public.events (organizer_id, facility_id, title, description, sport, starts_at, ends_at, capacity)
  values (p_uid, p_fid, 'New Year Fun Run 5K', 'Starts and ends at the gym. Bib pick-up from 5 AM.', 'Running',
          v_day + interval '12 days 5 hours 30 minutes', v_day + interval '12 days 8 hours', null)
  returning id into v_event;
  for i in 3..8 loop
    insert into public.event_registrations (event_id, user_id, registered_at)
    values (v_event, md5('gp-demo-member-' || i)::uuid, now() - (i || ' days')::interval);
  end loop;

  -- A finished event with attendance. Sign-ups are taken while it is still open, then it is moved into the past.
  insert into public.events (organizer_id, facility_id, title, description, sport, starts_at, ends_at, capacity)
  values (p_uid, p_fid, 'Members'' Lifting Meet', 'Squat, bench and deadlift. Spotters provided.', 'Powerlifting',
          now() + interval '1 hour', now() + interval '4 hours', 12)
  returning id into v_event;
  for i in 1..12 loop
    insert into public.event_registrations (event_id, user_id, registered_at)
    values (v_event, md5('gp-demo-member-' || i)::uuid, now() - interval '9 days');
  end loop;
  update public.events
     set starts_at = v_day - interval '6 days' + interval '9 hours', ends_at = v_day - interval '6 days' + interval '13 hours'
   where id = v_event;
  update public.event_registrations
     set checked_in_at = v_day - interval '6 days' + interval '8 hours 45 minutes', checked_in_by = p_uid
   where event_id = v_event and user_id <> md5('gp-demo-member-4')::uuid and user_id <> md5('gp-demo-member-9')::uuid;

  -- Records brought over from the gym's old spreadsheet.
  insert into public.facility_imported_members (facility_id, full_name, email, phone, plan_name, expires_on, imported_by) values
    (p_fid, 'Teresa Magno', 'teresa.magno@example.com', '0917 555 0101', 'Annual', current_date + 140, p_uid),
    (p_fid, 'Ramon Ilagan', 'ramon.ilagan@example.com', '0918 555 0102', 'Monthly', current_date + 12, p_uid),
    (p_fid, 'Lourdes Pascual', null, '0919 555 0103', 'Monthly', current_date - 20, p_uid),
    (p_fid, 'Benjie Soriano', 'benjie.soriano@example.com', null, 'Student', current_date + 45, p_uid),
    (p_fid, 'Carmela Yap', 'carmela.yap@example.com', '0920 555 0105', 'Annual', current_date - 3, p_uid),
    (p_fid, 'Dennis Gatchalian', null, '0921 555 0106', 'Day pass bundle', null, p_uid)
  on conflict do nothing;

  -- Coach clients for the owner: three who accepted and one waiting. Each asked by scanning the coach code.
  for i in 1..4 loop
    v_member := md5('gp-demo-member-' || i)::uuid;
    insert into public.coach_clients (coach_id, client_id, status, created_at)
    values (p_uid, v_member, 'PENDING', now() - ((i * 9) || ' days')::interval)
    on conflict (coach_id, client_id) do nothing;
    update public.coach_clients set invited_by = v_member where coach_id = p_uid and client_id = v_member;
    if i <= 3 then
      update public.coach_clients set status = 'ACTIVE'
       where coach_id = p_uid and client_id = v_member and status = 'PENDING';
    end if;
  end loop;

  -- Training logs for those clients: one training steadily, one gone quiet, one who has not started.
  if not exists (select 1 from public.workouts_lift where user_id = md5('gp-demo-member-1')::uuid) then
    insert into public.workouts_lift (user_id, title, duration_seconds, created_at)
    select md5('gp-demo-member-1')::uuid, t.title, 3300, now() - (t.days || ' days')::interval
      from (values ('Upper body', 0), ('Lower body', 2), ('Push day', 4), ('Pull day', 6), ('Leg day', 9),
                   ('Upper body', 12), ('Full body', 16), ('Lower body', 20)) as t(title, days);
    insert into public.workouts_lift (user_id, title, duration_seconds, created_at)
    select md5('gp-demo-member-2')::uuid, t.title, 2700, now() - (t.days || ' days')::interval
      from (values ('Full body', 5), ('Full body', 8), ('Upper body', 13), ('Leg day', 19)) as t(title, days);
  end if;
end;
$$;

create function public.create_demo_venue()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fid text := private.create_demo_venue_base();
begin
  perform private.seed_demo_extras(v_fid, auth.uid());
  return v_fid;
end;
$$;

revoke execute on function private.create_demo_venue_base(), private.seed_demo_extras(text, uuid)
  from public, anon, authenticated;
revoke execute on function public.create_demo_venue() from public, anon;
grant execute on function public.create_demo_venue() to authenticated;
