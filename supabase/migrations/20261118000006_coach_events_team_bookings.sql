-- =============================================================================
-- Coach clients, event attendance, team management, legacy member import and
-- court bookings. One migration because the Business Suite screens for these
-- ship together; each section stands alone.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Coach and client: both sides must agree before a coach can read training
--    logs. Until now a coach could insert an ACTIVE link to any account.
--    A link starts PENDING; the side that did not start it accepts.
-- -----------------------------------------------------------------------------
alter table public.coach_clients
  add column invited_by uuid references public.profiles (id) on delete set null;

-- Links that already exist came from a client scanning the coach's code.
update public.coach_clients set invited_by = client_id where invited_by is null;

create function public.guard_coach_client_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  -- Service role and migrations act without a signed-in user.
  if v_uid is null then
    if tg_op = 'INSERT' and new.invited_by is null then
      new.invited_by := new.client_id;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.invited_by := v_uid;
    if new.status = 'ACTIVE' then
      raise exception 'COACH_LINK_NEEDS_CONSENT' using errcode = 'P0001',
        hint = 'Invite the other person; the link becomes active when they accept.';
    end if;
    return new;
  end if;

  if new.status = old.status then
    return new;
  end if;
  if new.status = 'PENDING' then
    -- Whoever reopens the link is the one asking this time.
    new.invited_by := v_uid;
  elsif new.status = 'ACTIVE' then
    if old.status <> 'PENDING' or v_uid = coalesce(old.invited_by, old.client_id) then
      raise exception 'COACH_LINK_NEEDS_CONSENT' using errcode = 'P0001',
        hint = 'Only the person who was invited can accept.';
    end if;
  end if;
  return new;
end;
$$;

-- Runs before the cap trigger (alphabetical order), so consent is checked first.
create trigger coach_clients_a_consent
  before insert or update of status on public.coach_clients
  for each row execute function public.guard_coach_client_consent();

-- A coach invites a client by username. Returns the resulting status.
create function public.invite_coach_client(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_client uuid;
  v_name text;
  v_status public.membership_status;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  select p.id, coalesce(nullif(p.name, ''), '@' || p.username::text) into v_client, v_name
    from public.profiles p
   where p.username = btrim(coalesce(p_username, ''), ' @')::extensions.citext
     and p.soft_deleted_at is null;
  if v_client is null then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_client = v_uid then
    raise exception 'CANNOT_COACH_SELF' using errcode = '22023';
  end if;

  select status into v_status from public.coach_clients where coach_id = v_uid and client_id = v_client;
  if v_status is null then
    insert into public.coach_clients (coach_id, client_id, status) values (v_uid, v_client, 'PENDING');
    v_status := 'PENDING';
  elsif v_status = 'CANCELLED' then
    update public.coach_clients set status = 'PENDING' where coach_id = v_uid and client_id = v_client;
    v_status := 'PENDING';
  end if;
  return jsonb_build_object('client_id', v_client, 'name', v_name, 'status', v_status);
end;
$$;

-- The invited client accepts or declines. Used by the Sodia app.
create function public.respond_coach_invite(p_coach_id uuid, p_accept boolean)
returns public.membership_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_status public.membership_status := case when p_accept then 'ACTIVE' else 'CANCELLED' end;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  update public.coach_clients
     set status = v_status
   where coach_id = p_coach_id and client_id = v_uid and status = 'PENDING' and invited_by = p_coach_id;
  if not found then
    raise exception 'INVITE_NOT_FOUND' using errcode = 'P0002';
  end if;
  return v_status;
end;
$$;

-- The coach's roster with how recently each active client trained. Training
-- figures are returned for ACTIVE links only.
create function public.coach_roster()
returns table (
  client_id uuid,
  name text,
  username text,
  avatar_url text,
  status public.membership_status,
  awaiting text,
  since timestamptz,
  last_workout_at timestamptz,
  workouts_7d integer,
  workouts_28d integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    cc.client_id,
    coalesce(nullif(p.name, ''), '@' || p.username::text, 'Member'),
    p.username::text,
    p.avatar_url,
    cc.status,
    case when cc.status <> 'PENDING' then null
         when cc.invited_by = cc.coach_id then 'CLIENT' else 'COACH' end,
    cc.created_at,
    case when cc.status = 'ACTIVE' then w.last_at end,
    case when cc.status = 'ACTIVE' then coalesce(w.n7, 0)::integer end,
    case when cc.status = 'ACTIVE' then coalesce(w.n28, 0)::integer end
  from public.coach_clients cc
  join public.profiles p on p.id = cc.client_id
  left join lateral (
    select max(l.created_at) as last_at,
           count(*) filter (where l.created_at >= now() - interval '7 days') as n7,
           count(*) filter (where l.created_at >= now() - interval '28 days') as n28
      from (
        select created_at from public.workouts_lift where user_id = cc.client_id
        union all
        select created_at from public.workouts_move where user_id = cc.client_id
      ) l
  ) w on true
  where cc.coach_id = auth.uid()
  order by (cc.status = 'PENDING') desc, w.last_at asc nulls first, cc.created_at;
$$;

-- -----------------------------------------------------------------------------
-- 2. Events: attendance on the day, and a roster organisers can read.
-- -----------------------------------------------------------------------------
alter table public.event_registrations
  add column checked_in_at timestamptz,
  add column checked_in_by uuid references public.profiles (id) on delete set null;

create function public.event_roster(p_event_id uuid)
returns table (
  user_id uuid,
  name text,
  username text,
  status text,
  registered_at timestamptz,
  checked_in_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_event(p_event_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return query
  select r.user_id, coalesce(nullif(p.name, ''), '@' || p.username::text, 'Member'), p.username::text,
         r.status, r.registered_at, r.checked_in_at
    from public.event_registrations r
    join public.profiles p on p.id = r.user_id
   where r.event_id = p_event_id
   order by (r.status = 'REGISTERED') desc, r.registered_at;
end;
$$;

create function public.set_event_attendance(p_event_id uuid, p_user_id uuid, p_present boolean)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_at timestamptz;
begin
  if not public.can_manage_event(p_event_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  update public.event_registrations
     set checked_in_at = case when p_present then coalesce(checked_in_at, now()) end,
         checked_in_by = case when p_present then auth.uid() end
   where event_id = p_event_id and user_id = p_user_id and status = 'REGISTERED'
  returning checked_in_at into v_at;
  if not found then
    raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0002';
  end if;
  return v_at;
end;
$$;

-- Every event a venue runs, with how full it is. Staff only.
create function public.facility_events(p_facility_id text)
returns table (
  id uuid,
  title text,
  description text,
  sport text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  status public.event_status,
  registered integer,
  checked_in integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_facility_staff(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return query
  select e.id, e.title, e.description, e.sport, e.starts_at, e.ends_at, e.capacity, e.status,
         count(r.user_id) filter (where r.status = 'REGISTERED')::integer,
         count(r.user_id) filter (where r.status = 'REGISTERED' and r.checked_in_at is not null)::integer
    from public.events e
    left join public.event_registrations r on r.event_id = e.id
   where e.facility_id = p_facility_id
   group by e.id
   order by e.starts_at desc;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. Team: owners and admins add and remove their own staff.
-- -----------------------------------------------------------------------------
create function public.facility_team(p_facility_id text)
returns table (user_id uuid, name text, username text, role public.facility_role, added_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_facility_staff(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return query
  select s.user_id, coalesce(nullif(p.name, ''), '@' || p.username::text, 'Team member'), p.username::text,
         s.role, s.created_at
    from public.facility_staff s
    join public.profiles p on p.id = s.user_id
   where s.facility_id = p_facility_id
   order by array_position(array['OWNER', 'ADMIN', 'STAFF', 'COACH']::public.facility_role[], s.role), s.created_at;
end;
$$;

create function public.add_facility_staff(p_facility_id text, p_username text, p_role public.facility_role)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_name text;
begin
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_role = 'OWNER' then
    raise exception 'INVALID_ROLE' using errcode = '22023';
  end if;
  select p.id, coalesce(nullif(p.name, ''), '@' || p.username::text) into v_user, v_name
    from public.profiles p
   where p.username = btrim(coalesce(p_username, ''), ' @')::extensions.citext
     and p.soft_deleted_at is null;
  if v_user is null then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.facility_staff
              where facility_id = p_facility_id and user_id = v_user and role = 'OWNER') then
    raise exception 'OWNER_ROLE_FIXED' using errcode = '22023';
  end if;

  insert into public.facility_staff (facility_id, user_id, role)
  values (p_facility_id, v_user, p_role)
  on conflict on constraint facility_staff_pkey do update set role = excluded.role;

  -- The app shows its staff tools from the account role.
  perform public.admin_grant_role(v_user::text, case when p_role = 'COACH' then 'coach' else 'staff' end);

  return jsonb_build_object('user_id', v_user, 'name', v_name, 'role', p_role);
end;
$$;

create function public.remove_facility_staff(p_facility_id text, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  delete from public.facility_staff
   where facility_id = p_facility_id and user_id = p_user_id and role <> 'OWNER';
  if not found then
    raise exception 'STAFF_NOT_FOUND' using errcode = 'P0002';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. Legacy member import: records brought over from a spreadsheet. They are
--    not app accounts and carry no door access.
-- -----------------------------------------------------------------------------
create table public.facility_imported_members (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 32),
  plan_name text check (plan_name is null or char_length(plan_name) <= 80),
  expires_on date,
  notes text check (notes is null or char_length(notes) <= 500),
  imported_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index facility_imported_members_dedupe
  on public.facility_imported_members (facility_id, lower(full_name), coalesce(lower(email), ''), coalesce(phone, ''));

alter table public.facility_imported_members enable row level security;
revoke all on table public.facility_imported_members from anon, authenticated;
grant select, delete on public.facility_imported_members to authenticated;
grant insert (facility_id, full_name, email, phone, plan_name, expires_on, notes)
  on public.facility_imported_members to authenticated;

create policy facility_imported_members_read on public.facility_imported_members
  for select to authenticated using (public.is_facility_staff(facility_id));
create policy facility_imported_members_insert on public.facility_imported_members
  for insert to authenticated with check (public.is_facility_admin(facility_id));
create policy facility_imported_members_delete on public.facility_imported_members
  for delete to authenticated using (public.is_facility_admin(facility_id));

-- -----------------------------------------------------------------------------
-- 5. Courts and bookings. A court can be divided into smaller courts: booking
--    the whole court blocks its parts and the reverse, with a 15-minute
--    changeover between the two layouts.
-- -----------------------------------------------------------------------------
create table public.facility_spaces (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  parent_id uuid references public.facility_spaces (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  sport text check (sport is null or char_length(sport) <= 40),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (facility_id, name)
);

create index facility_spaces_facility_idx on public.facility_spaces (facility_id);

create function public.guard_facility_space()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent public.facility_spaces%rowtype;
begin
  if new.parent_id is null then
    return new;
  end if;
  select * into v_parent from public.facility_spaces where id = new.parent_id;
  if v_parent.facility_id <> new.facility_id or v_parent.parent_id is not null or new.parent_id = new.id then
    raise exception 'INVALID_PARENT_SPACE' using errcode = '22023',
      hint = 'A court can be divided once, into courts of the same venue.';
  end if;
  return new;
end;
$$;

create trigger facility_spaces_guard
  before insert or update of parent_id, facility_id on public.facility_spaces
  for each row execute function public.guard_facility_space();

create type public.booking_status as enum ('CONFIRMED', 'CANCELLED');

create table public.space_bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  space_id uuid not null references public.facility_spaces (id) on delete cascade,
  booked_for text not null check (char_length(booked_for) between 1 and 120),
  user_id uuid references public.profiles (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'CONFIRMED',
  note text check (note is null or char_length(note) <= 300),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (ends_at - starts_at <= interval '12 hours')
);

create index space_bookings_space_time_idx on public.space_bookings (space_id, starts_at);
create index space_bookings_facility_time_idx on public.space_bookings (facility_id, starts_at);

create function public.guard_space_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_space public.facility_spaces%rowtype;
  v_buffer constant interval := interval '15 minutes';
begin
  if new.status <> 'CONFIRMED' then
    return new;
  end if;
  select * into v_space from public.facility_spaces where id = new.space_id;
  if v_space.facility_id is distinct from new.facility_id then
    raise exception 'INVALID_SPACE' using errcode = '22023';
  end if;
  if not v_space.is_active then
    raise exception 'SPACE_INACTIVE' using errcode = 'P0001';
  end if;

  -- One writer per venue at a time, so two desks cannot take the same slot.
  perform pg_advisory_xact_lock(hashtext('space_bookings:' || new.facility_id));

  if exists (
    select 1 from public.space_bookings b
     where b.space_id = new.space_id and b.status = 'CONFIRMED' and b.id <> new.id
       and b.starts_at < new.ends_at and b.ends_at > new.starts_at
  ) then
    raise exception 'SPACE_ALREADY_BOOKED' using errcode = 'P0001';
  end if;

  -- The whole court against its parts, in either direction, needs changeover time.
  if exists (
    select 1 from public.space_bookings b
      join public.facility_spaces s on s.id = b.space_id
     where b.status = 'CONFIRMED' and b.id <> new.id
       and (s.id = v_space.parent_id or s.parent_id = v_space.id)
       and b.starts_at < new.ends_at + v_buffer and b.ends_at > new.starts_at - v_buffer
  ) then
    raise exception 'SPACE_LAYOUT_CONFLICT' using errcode = 'P0001',
      hint = 'The court is in use in a different layout; allow 15 minutes to change over.';
  end if;
  return new;
end;
$$;

create trigger space_bookings_guard
  before insert or update of status, starts_at, ends_at, space_id on public.space_bookings
  for each row execute function public.guard_space_booking();

alter table public.facility_spaces enable row level security;
alter table public.space_bookings enable row level security;
revoke all on table public.facility_spaces, public.space_bookings from anon, authenticated;

grant select on public.facility_spaces, public.space_bookings to authenticated;
grant insert (facility_id, parent_id, name, sport) on public.facility_spaces to authenticated;
grant update (name, sport, is_active) on public.facility_spaces to authenticated;
grant insert (facility_id, space_id, booked_for, user_id, starts_at, ends_at, note)
  on public.space_bookings to authenticated;
grant update (status) on public.space_bookings to authenticated;

create policy facility_spaces_read on public.facility_spaces
  for select to authenticated using (public.is_facility_staff(facility_id));
create policy facility_spaces_insert on public.facility_spaces
  for insert to authenticated with check (public.is_facility_admin(facility_id));
create policy facility_spaces_update on public.facility_spaces
  for update to authenticated
  using (public.is_facility_admin(facility_id)) with check (public.is_facility_admin(facility_id));

create policy space_bookings_read on public.space_bookings
  for select to authenticated using (public.is_facility_staff(facility_id) or user_id = auth.uid());
create policy space_bookings_insert on public.space_bookings
  for insert to authenticated with check (public.is_facility_staff(facility_id));
create policy space_bookings_update on public.space_bookings
  for update to authenticated
  using (public.is_facility_staff(facility_id)) with check (public.is_facility_staff(facility_id));

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
revoke execute on function
  public.guard_coach_client_consent(), public.guard_facility_space(), public.guard_space_booking(),
  public.invite_coach_client(text), public.respond_coach_invite(uuid, boolean), public.coach_roster(),
  public.event_roster(uuid), public.set_event_attendance(uuid, uuid, boolean), public.facility_events(text),
  public.facility_team(text), public.add_facility_staff(text, text, public.facility_role),
  public.remove_facility_staff(text, uuid)
  from public, anon, authenticated;

grant execute on function
  public.invite_coach_client(text), public.respond_coach_invite(uuid, boolean), public.coach_roster(),
  public.event_roster(uuid), public.set_event_attendance(uuid, uuid, boolean), public.facility_events(text),
  public.facility_team(text), public.add_facility_staff(text, text, public.facility_role),
  public.remove_facility_staff(text, uuid)
  to authenticated;

-- Bulk import for the spreadsheet wizard. Runs as the caller, so the table's
-- own rules decide who may import; rows already present are skipped.
create function public.import_facility_members(p_facility_id text, p_rows jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 2000 then
    raise exception 'INVALID_IMPORT' using errcode = '22023', hint = 'Send between 1 and 2000 rows.';
  end if;
  insert into public.facility_imported_members (facility_id, full_name, email, phone, plan_name, expires_on, notes)
  select p_facility_id, btrim(r.full_name), nullif(btrim(r.email), ''), nullif(btrim(r.phone), ''),
         nullif(btrim(r.plan_name), ''), r.expires_on, nullif(btrim(r.notes), '')
    from jsonb_to_recordset(p_rows)
      as r(full_name text, email text, phone text, plan_name text, expires_on date, notes text)
  on conflict do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.import_facility_members(text, jsonb) from public, anon;
grant execute on function public.import_facility_members(text, jsonb) to authenticated;
