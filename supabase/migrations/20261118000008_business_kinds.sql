-- =============================================================================
-- Business kinds. Each kind of business gets its own workspace in the Business
-- Suite (GymDash, Clubdash, CoachDash, Organizer Pro), so the kind is stored as
-- a real column instead of being guessed from the free-text category.
-- =============================================================================

create type public.business_kind as enum ('GYM', 'STUDIO', 'CLUB', 'COACH', 'ORGANIZER');

alter table public.facilities add column business_kind public.business_kind;

create function public.derive_business_kind(p_category text, p_registry public.registry_type)
returns public.business_kind
language sql
immutable
set search_path = ''
as $$
  select case
    when p_registry = 'COMMERCIAL' then
      case when p_category = 'Fitness studio' then 'STUDIO' else 'GYM' end
    when p_category = 'Coaching' then 'COACH'
    when p_category = 'Event organizer' then 'ORGANIZER'
    else 'CLUB'
  end::public.business_kind;
$$;

update public.facilities set business_kind = public.derive_business_kind(category, registry_type);

-- Rows created without a kind (the app, older clients) get one from their registry and category.
create function public.assign_business_kind()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.business_kind is null then
    new.business_kind := public.derive_business_kind(new.category, new.registry_type);
  end if;
  return new;
end;
$$;

create trigger facilities_assign_business_kind
  before insert on public.facilities
  for each row execute function public.assign_business_kind();

alter table public.facilities
  alter column business_kind set not null,
  add constraint facilities_kind_matches_registry
    check ((business_kind in ('GYM', 'STUDIO')) = (registry_type = 'COMMERCIAL'));

-- Set once at creation, like the registry.
grant insert (business_kind) on public.facilities to authenticated;

-- Discover lists places people can visit. Coaches and organizers are not places.
create or replace function public.facilities_nearby(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 10,
  p_registry public.registry_type default null,
  p_limit integer default 50
)
returns table (
  id text, slug text, name text, registry_type public.registry_type, category text,
  lat double precision, lng double precision, logo_url text, is_open boolean,
  inside_now_count integer, max_capacity integer, rating numeric, distance_km double precision
)
language sql
stable
set search_path = ''
as $$
  with origin as (
    select extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography as g
  )
  select f.id, f.slug, f.name, f.registry_type, f.category, f.lat, f.lng, f.logo_url, f.is_open,
         f.inside_now_count, f.max_capacity, f.rating,
         round((extensions.st_distance(f.location, o.g) / 1000)::numeric, 2)::double precision
    from public.facilities f, origin o
   where f.location is not null
     and f.business_kind in ('GYM', 'STUDIO', 'CLUB')
     and extensions.st_dwithin(f.location, o.g, least(greatest(p_radius_km, 0.1), 100) * 1000)
     and (p_registry is null or f.registry_type = p_registry)
   order by f.location operator(extensions.<->) o.g
   limit least(greatest(p_limit, 1), 200);
$$;

-- -----------------------------------------------------------------------------
-- Demo: one sample business per workspace, so each can be explored on its own.
-- The demo gym keeps members, plans, check-ins and sales; courts move to a demo
-- club and events to a demo organizer.
-- -----------------------------------------------------------------------------
delete from public.events where facility_id like 'demo\_%';
delete from public.facility_spaces where facility_id like 'demo\_%';

create function private.seed_demo_courts(p_fid text, p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day timestamptz := date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila';
  v_court uuid; v_a uuid; v_b uuid; v_two uuid;
begin
  if exists (select 1 from public.facility_spaces where facility_id = p_fid) then
    return;
  end if;
  insert into public.facility_spaces (facility_id, name, sport) values (p_fid, 'Main Court', 'Basketball')
    returning id into v_court;
  insert into public.facility_spaces (facility_id, parent_id, name, sport) values (p_fid, v_court, 'Pickleball A', 'Pickleball')
    returning id into v_a;
  insert into public.facility_spaces (facility_id, parent_id, name, sport) values (p_fid, v_court, 'Pickleball B', 'Pickleball')
    returning id into v_b;
  insert into public.facility_spaces (facility_id, name, sport) values (p_fid, 'Court 2', 'Badminton')
    returning id into v_two;

  insert into public.space_bookings (facility_id, space_id, booked_for, note, starts_at, ends_at, created_by) values
    (p_fid, v_two, 'Morning badminton group', 'Weekly', v_day + interval '6 hours', v_day + interval '8 hours', p_uid),
    (p_fid, v_a, 'Reyes family', 'Paid at the desk', v_day + interval '8 hours', v_day + interval '9 hours 30 minutes', p_uid),
    (p_fid, v_b, 'Tuesday ladder', null, v_day + interval '8 hours', v_day + interval '10 hours', p_uid),
    (p_fid, v_two, 'Lunchtime doubles', null, v_day + interval '12 hours', v_day + interval '13 hours', p_uid),
    (p_fid, v_a, 'Beginner clinic', 'Coach-led', v_day + interval '14 hours', v_day + interval '15 hours 30 minutes', p_uid),
    (p_fid, v_court, 'Barangay league game', 'Whole court', v_day + interval '17 hours', v_day + interval '19 hours', p_uid),
    (p_fid, v_two, 'Evening badminton', null, v_day + interval '18 hours', v_day + interval '20 hours', p_uid),
    (p_fid, v_a, 'Santos doubles', null, v_day + interval '19 hours 30 minutes', v_day + interval '21 hours', p_uid),
    (p_fid, v_court, 'Corporate shootaround', 'Whole court', v_day + interval '1 day 10 hours', v_day + interval '1 day 12 hours', p_uid),
    (p_fid, v_b, 'Lim and friends', null, v_day + interval '1 day 16 hours', v_day + interval '1 day 17 hours 30 minutes', p_uid);
end;
$$;

create function private.seed_demo_events(p_fid text, p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_day timestamptz := date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila';
  v_event uuid;
  i integer;
begin
  if exists (select 1 from public.events where facility_id = p_fid) then
    return;
  end if;

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
  values (p_uid, p_fid, 'New Year Fun Run 5K', 'Bib pick-up from 5 AM at the start line.', 'Running',
          v_day + interval '12 days 5 hours 30 minutes', v_day + interval '12 days 8 hours', null)
  returning id into v_event;
  for i in 3..8 loop
    insert into public.event_registrations (event_id, user_id, registered_at)
    values (v_event, md5('gp-demo-member-' || i)::uuid, now() - (i || ' days')::interval);
  end loop;

  -- A finished event with attendance. Sign-ups are taken while it is open, then it is moved into the past.
  insert into public.events (organizer_id, facility_id, title, description, sport, starts_at, ends_at, capacity)
  values (p_uid, p_fid, 'Doubles Ladder Finals', 'Round robin into a knockout final.', 'Badminton',
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
end;
$$;

-- The gym keeps its imported records; the owner's coach clients belong to the owner, not a venue.
create or replace function private.seed_demo_extras(p_fid text, p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member uuid;
  i integer;
begin
  if p_fid not like 'demo\_%'
     or exists (select 1 from public.facility_imported_members where facility_id = p_fid) then
    return;
  end if;

  insert into public.facility_imported_members (facility_id, full_name, email, phone, plan_name, expires_on, imported_by) values
    (p_fid, 'Teresa Magno', 'teresa.magno@example.com', '0917 555 0101', 'Annual', current_date + 140, p_uid),
    (p_fid, 'Ramon Ilagan', 'ramon.ilagan@example.com', '0918 555 0102', 'Monthly', current_date + 12, p_uid),
    (p_fid, 'Lourdes Pascual', null, '0919 555 0103', 'Monthly', current_date - 20, p_uid),
    (p_fid, 'Benjie Soriano', 'benjie.soriano@example.com', null, 'Student', current_date + 45, p_uid),
    (p_fid, 'Carmela Yap', 'carmela.yap@example.com', '0920 555 0105', 'Annual', current_date - 3, p_uid),
    (p_fid, 'Dennis Gatchalian', null, '0921 555 0106', 'Day pass bundle', null, p_uid)
  on conflict do nothing;

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

-- A demo club, coaching business and organizer for the person who owns a demo gym.
create function private.create_demo_workspaces(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := left(md5(p_uid::text), 14);
  v_club text := 'demo_club_' || v_key;
  v_coach text := 'demo_coach_' || v_key;
  v_org text := 'demo_org_' || v_key;
  i integer;
begin
  if not exists (select 1 from public.facilities where id = v_club) then
    insert into public.facilities (id, owner_id, name, registry_type, category, business_kind, address, hours, amenities)
    values (v_club, p_uid, 'Baseline Courts (Demo)', 'COMMUNITY', 'Sports club', 'CLUB',
            'Demo address, Kapitolyo, Pasig', 'Mon–Sun, 6:00 AM – 10:00 PM', array['Showers', 'Pro shop', 'Parking']);
    for i in 1..14 loop
      insert into public.facility_memberships (facility_id, user_id, source, joined_at)
      values (v_club, md5('gp-demo-member-' || i)::uuid, 'JOIN', now() - ((i * 5) || ' days')::interval)
      on conflict do nothing;
    end loop;
  end if;
  perform private.seed_demo_courts(v_club, p_uid);

  if not exists (select 1 from public.facilities where id = v_coach) then
    insert into public.facilities (id, owner_id, name, registry_type, category, business_kind, address)
    values (v_coach, p_uid, 'Strong Start Coaching (Demo)', 'COMMUNITY', 'Coaching', 'COACH', 'Online and in person');
  end if;

  if not exists (select 1 from public.facilities where id = v_org) then
    insert into public.facilities (id, owner_id, name, registry_type, category, business_kind, address)
    values (v_org, p_uid, 'Open Play Events (Demo)', 'COMMUNITY', 'Event organizer', 'ORGANIZER', 'Metro Manila');
  end if;
  perform private.seed_demo_events(v_org, p_uid);
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
  return v_fid;
end;
$$;

-- People who already have a demo gym get the other three workspaces too.
do $$
declare
  r record;
begin
  for r in select owner_id from public.facilities where id like 'demo\_%' and business_kind = 'GYM' loop
    perform private.create_demo_workspaces(r.owner_id);
  end loop;
end;
$$;

revoke execute on function
  private.seed_demo_courts(text, uuid), private.seed_demo_events(text, uuid), private.create_demo_workspaces(uuid)
  from public, anon, authenticated;
revoke execute on function public.assign_business_kind() from public, anon, authenticated;
grant execute on function public.derive_business_kind(text, public.registry_type) to anon, authenticated;
