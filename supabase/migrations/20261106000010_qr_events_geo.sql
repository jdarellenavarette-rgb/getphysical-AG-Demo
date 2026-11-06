-- =============================================================================
-- 1. Geo: facility pins, "near me" search, shareable facility links (slugs)
-- 2. GPS routes for Move/Run tracking (server-computed distance)
-- 3. Events + registrations (capacity enforced)
-- 4. QR identity codes: one unique, unguessable, revocable code per user /
--    coach / organizer / facility / event — "scan to add / join / enrol".
--    (Membership-card entry QRs stay dynamic: see pass_credentials / TOTP.)
-- =============================================================================

create extension if not exists postgis with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. Facilities: location + slug
-- -----------------------------------------------------------------------------
alter table public.facilities
  add column location extensions.geography(Point, 4326) generated always as (
    case when lat is not null and lng is not null
      then extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography
    end
  ) stored,
  add column slug text unique
    check (slug is null or slug ~ '^[a-z0-9]([a-z0-9-]{0,58}[a-z0-9])?$');

create index facilities_location_gix on public.facilities using gist (location);

create function public.slugify(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(nullif(trim(both '-' from left(
    regexp_replace(lower(coalesce(p_text, '')), '[^a-z0-9]+', '-', 'g'), 50)), ''), 'facility');
$$;

create function public.assign_facility_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_candidate text;
begin
  if new.slug is not null then
    return new;
  end if;
  v_base := public.slugify(new.name);
  v_candidate := v_base;
  while exists (select 1 from public.facilities where slug = v_candidate) loop
    v_candidate := v_base || '-' || substr(md5(extensions.gen_random_uuid()::text), 1, 5);
  end loop;
  new.slug := v_candidate;
  return new;
end;
$$;

create trigger facilities_assign_slug
  before insert on public.facilities
  for each row execute function public.assign_facility_slug();

update public.facilities set slug = public.slugify(name) || '-' || substr(md5(id), 1, 5) where slug is null;

grant update (slug) on public.facilities to authenticated;

-- "Near me": public (works signed-out for Discover). Distance in km.
create function public.facilities_nearby(
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
     and extensions.st_dwithin(f.location, o.g, least(greatest(p_radius_km, 0.1), 100) * 1000)
     and (p_registry is null or f.registry_type = p_registry)
   order by f.location operator(extensions.<->) o.g
   limit least(greatest(p_limit, 1), 200);
$$;

-- -----------------------------------------------------------------------------
-- 2. GPS routes (Strava-style). Clients upload GeoJSON; the database builds the
--    geography and computes distance itself (clients cannot inflate it).
-- -----------------------------------------------------------------------------
alter table public.workouts_move
  add column route_geojson jsonb,
  add column route extensions.geography(LineString, 4326),
  add column started_at timestamptz,
  add column ended_at timestamptz,
  add constraint workouts_move_time_order check (ended_at is null or started_at is null or ended_at >= started_at);

create function public.process_move_route()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_points integer;
begin
  if new.route_geojson is null then
    new.route := null;
    return new;
  end if;
  if new.route_geojson ->> 'type' is distinct from 'LineString'
     or jsonb_typeof(new.route_geojson -> 'coordinates') <> 'array' then
    raise exception 'ROUTE_MUST_BE_GEOJSON_LINESTRING' using errcode = '22023';
  end if;
  v_points := jsonb_array_length(new.route_geojson -> 'coordinates');
  if v_points < 2 or v_points > 50000 then
    raise exception 'ROUTE_POINT_COUNT_OUT_OF_RANGE' using errcode = '22023';
  end if;
  new.route := extensions.st_geomfromgeojson(new.route_geojson::text)::extensions.geography;
  new.distance_km := round((extensions.st_length(new.route) / 1000)::numeric, 3);
  return new;
end;
$$;

create trigger workouts_move_process_route
  before insert or update of route_geojson on public.workouts_move
  for each row execute function public.process_move_route();

create index workouts_move_route_gix on public.workouts_move using gist (route);

-- -----------------------------------------------------------------------------
-- 3. Events
-- -----------------------------------------------------------------------------
create type public.event_status as enum ('DRAFT', 'PUBLISHED', 'CANCELLED');

create table public.events (
  id uuid primary key default extensions.gen_random_uuid(),
  organizer_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  facility_id text references public.facilities (id) on delete set null,
  title text not null check (char_length(title) between 2 and 120),
  description text check (description is null or char_length(description) <= 2000),
  sport text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  status public.event_status not null default 'PUBLISHED',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index events_starts_at_idx on public.events (starts_at);
create index events_facility_idx on public.events (facility_id);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create table public.event_registrations (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  status text not null default 'REGISTERED' check (status in ('REGISTERED', 'CANCELLED')),
  registered_at timestamptz default now(),
  primary key (event_id, user_id)
);

create function public.enforce_event_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_taken integer;
begin
  if new.status <> 'REGISTERED' or (tg_op = 'UPDATE' and old.status = 'REGISTERED') then
    return new;
  end if;
  select * into v_event from public.events where id = new.event_id for update;
  if v_event.status <> 'PUBLISHED' or coalesce(v_event.ends_at, v_event.starts_at) < now() then
    raise exception 'EVENT_CLOSED' using errcode = 'P0001';
  end if;
  if v_event.capacity is not null then
    select count(*) into v_taken from public.event_registrations
     where event_id = new.event_id and status = 'REGISTERED' and user_id <> new.user_id;
    if v_taken >= v_event.capacity then
      raise exception 'EVENT_FULL' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger event_registrations_enforce
  before insert or update of status on public.event_registrations
  for each row execute function public.enforce_event_registration();

create function public.can_manage_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.events e
     where e.id = p_event_id
       and (e.organizer_id = auth.uid()
            or (e.facility_id is not null and public.is_facility_staff(e.facility_id)))
  );
$$;

-- -----------------------------------------------------------------------------
-- 4. QR identity codes
--   token: 128 random bits, base64url (22 chars). Primary key => can never
--   repeat; issuing retries on the (astronomically unlikely) collision.
--   One ACTIVE code per subject; rotating revokes the old one immediately.
--   QR payload the apps encode: https://<app-domain>/q/<token>
-- -----------------------------------------------------------------------------
create type public.qr_kind as enum ('USER', 'COACH', 'ORGANIZER', 'FACILITY', 'EVENT');

create table public.qr_codes (
  token text primary key check (token ~ '^[A-Za-z0-9_-]{22}$'),
  kind public.qr_kind not null,
  user_id uuid references public.profiles (id) on delete cascade,
  facility_id text references public.facilities (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'REVOKED')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  check (
    (kind in ('USER', 'COACH', 'ORGANIZER') and user_id is not null and facility_id is null and event_id is null)
    or (kind = 'FACILITY' and facility_id is not null and user_id is null and event_id is null)
    or (kind = 'EVENT' and event_id is not null and user_id is null and facility_id is null)
  )
);

create unique index qr_codes_one_active_user on public.qr_codes (kind, user_id) where status = 'ACTIVE' and user_id is not null;
create unique index qr_codes_one_active_facility on public.qr_codes (facility_id) where status = 'ACTIVE' and facility_id is not null;
create unique index qr_codes_one_active_event on public.qr_codes (event_id) where status = 'ACTIVE' and event_id is not null;

create function public.new_qr_token()
returns text
language sql
volatile
set search_path = ''
as $$
  select rtrim(translate(encode(extensions.gen_random_bytes(16), 'base64'), '+/', '-_'), '=');
$$;

-- Internal: return the subject's active code, issuing one if missing.
create function public.issue_qr_code(
  p_kind public.qr_kind,
  p_user_id uuid default null,
  p_facility_id text default null,
  p_event_id uuid default null
)
returns public.qr_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code public.qr_codes;
  v_attempt integer := 0;
begin
  loop
    select * into v_code from public.qr_codes
     where kind = p_kind and status = 'ACTIVE'
       and user_id is not distinct from p_user_id
       and facility_id is not distinct from p_facility_id
       and event_id is not distinct from p_event_id;
    if found then
      return v_code;
    end if;

    insert into public.qr_codes (token, kind, user_id, facility_id, event_id)
    values (public.new_qr_token(), p_kind, p_user_id, p_facility_id, p_event_id)
    on conflict do nothing
    returning * into v_code;
    if found then
      return v_code;
    end if;

    v_attempt := v_attempt + 1;
    if v_attempt > 5 then
      raise exception 'QR_ISSUE_FAILED' using errcode = 'P0001';
    end if;
  end loop;
end;
$$;

create function public.auto_issue_qr_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  case tg_table_name
    when 'profiles' then perform public.issue_qr_code('USER', new.id);
    when 'facilities' then perform public.issue_qr_code('FACILITY', null, new.id);
    when 'events' then perform public.issue_qr_code('EVENT', null, null, new.id);
  end case;
  return null;
end;
$$;

create trigger profiles_issue_qr after insert on public.profiles
  for each row execute function public.auto_issue_qr_code();
create trigger facilities_issue_qr after insert on public.facilities
  for each row execute function public.auto_issue_qr_code();
create trigger events_issue_qr after insert on public.events
  for each row execute function public.auto_issue_qr_code();

-- Back-fill existing rows.
do $$
begin
  perform public.issue_qr_code('USER', id) from public.profiles;
  perform public.issue_qr_code('FACILITY', null, id) from public.facilities;
end;
$$;

-- Authorisation for reading / rotating a subject's code.
create function public.assert_can_manage_qr(p_kind public.qr_kind, p_target text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_roles text[];
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_kind in ('USER', 'COACH', 'ORGANIZER') then
    if p_target is not null and p_target <> v_uid::text then
      raise exception 'FORBIDDEN' using errcode = '42501';
    end if;
    select roles into v_roles from public.profiles where id = v_uid;
    if p_kind = 'COACH' and not ('coach' = any (coalesce(v_roles, '{}'))) then
      raise exception 'ROLE_NOT_GRANTED' using errcode = '42501';
    end if;
    if p_kind = 'ORGANIZER' and not ('organizer' = any (coalesce(v_roles, '{}'))) then
      raise exception 'ROLE_NOT_GRANTED' using errcode = '42501';
    end if;
  elsif p_kind = 'FACILITY' then
    if not public.is_facility_staff(p_target) then
      raise exception 'FORBIDDEN' using errcode = '42501';
    end if;
  elsif p_kind = 'EVENT' then
    if not public.can_manage_event(p_target::uuid) then
      raise exception 'FORBIDDEN' using errcode = '42501';
    end if;
  end if;
end;
$$;

create function public.get_qr_code(p_kind public.qr_kind, p_target text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code public.qr_codes;
begin
  perform public.assert_can_manage_qr(p_kind, p_target);
  v_code := case
    when p_kind in ('USER', 'COACH', 'ORGANIZER') then public.issue_qr_code(p_kind, auth.uid())
    when p_kind = 'FACILITY' then public.issue_qr_code(p_kind, null, p_target)
    else public.issue_qr_code(p_kind, null, null, p_target::uuid)
  end;
  return jsonb_build_object('token', v_code.token, 'kind', v_code.kind, 'created_at', v_code.created_at);
end;
$$;

-- Rotate (e.g. a printed poster leaked): old code stops working immediately.
create function public.rotate_qr_code(p_kind public.qr_kind, p_target text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_can_manage_qr(p_kind, p_target);
  update public.qr_codes
     set status = 'REVOKED', revoked_at = now()
   where kind = p_kind and status = 'ACTIVE'
     and (
       (p_kind in ('USER', 'COACH', 'ORGANIZER') and user_id = auth.uid())
       or (p_kind = 'FACILITY' and facility_id = p_target)
       or (p_kind = 'EVENT' and event_id = p_target::uuid)
     );
  return public.get_qr_code(p_kind, p_target);
end;
$$;

-- Public preview of what a QR points to (safe fields only). Works signed-out.
create function public.resolve_qr_code(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_code public.qr_codes;
  v_result jsonb;
begin
  select * into v_code from public.qr_codes where token = p_token;
  if not found then
    return jsonb_build_object('status', 'NOT_FOUND');
  end if;
  if v_code.status <> 'ACTIVE' then
    return jsonb_build_object('status', 'REVOKED');
  end if;

  if v_code.kind in ('USER', 'COACH', 'ORGANIZER') then
    select jsonb_build_object('id', p.id, 'name', p.name, 'username', p.username,
                              'avatar_url', coalesce(p.avatar_url, p.avatar), 'is_private', coalesce(p.is_private, false))
      into v_result
      from public.profiles p where p.id = v_code.user_id and p.soft_deleted_at is null;
  elsif v_code.kind = 'FACILITY' then
    select jsonb_build_object('id', f.id, 'name', f.name, 'slug', f.slug, 'registry_type', f.registry_type,
                              'logo_url', f.logo_url, 'address', f.address)
      into v_result
      from public.facilities f where f.id = v_code.facility_id;
  else
    select jsonb_build_object('id', e.id, 'title', e.title, 'starts_at', e.starts_at, 'status', e.status,
                              'facility_name', f.name,
                              'spots_left', case when e.capacity is null then null else e.capacity - (
                                select count(*) from public.event_registrations r
                                 where r.event_id = e.id and r.status = 'REGISTERED') end)
      into v_result
      from public.events e left join public.facilities f on f.id = e.facility_id
     where e.id = v_code.event_id and e.status <> 'DRAFT';
  end if;

  if v_result is null then
    return jsonb_build_object('status', 'NOT_FOUND');
  end if;
  return jsonb_build_object('status', 'ACTIVE', 'kind', v_code.kind, 'subject', v_result);
end;
$$;

-- Perform the scan action for the signed-in user.
create function public.redeem_qr_code(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code public.qr_codes;
  v_private boolean;
  v_registry public.registry_type;
  v_slug text;
  v_status text;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  select * into v_code from public.qr_codes where token = p_token;
  if not found or v_code.status <> 'ACTIVE' then
    return jsonb_build_object('action', 'NONE', 'status', case when found then 'REVOKED' else 'NOT_FOUND' end);
  end if;

  if v_code.kind in ('USER', 'ORGANIZER') then
    if v_code.user_id = v_uid then
      return jsonb_build_object('action', 'NONE', 'status', 'SELF');
    end if;
    select coalesce(is_private, false) into v_private from public.profiles where id = v_code.user_id;
    v_status := case when v_private then 'PENDING' else 'ACCEPTED' end;
    insert into public.follows (follower_id, followee_id, status)
    values (v_uid, v_code.user_id, v_status)
    on conflict (follower_id, followee_id) do nothing;
    select status into v_status from public.follows where follower_id = v_uid and followee_id = v_code.user_id;
    return jsonb_build_object('action', 'FOLLOW', 'status', v_status, 'user_id', v_code.user_id);

  elsif v_code.kind = 'COACH' then
    if v_code.user_id = v_uid then
      return jsonb_build_object('action', 'NONE', 'status', 'SELF');
    end if;
    insert into public.coach_clients (coach_id, client_id, status)
    values (v_code.user_id, v_uid, 'PENDING')
    on conflict (coach_id, client_id) do nothing;
    select status::text into v_status from public.coach_clients where coach_id = v_code.user_id and client_id = v_uid;
    return jsonb_build_object('action', 'ENROLL_COACH', 'status', v_status, 'coach_id', v_code.user_id);

  elsif v_code.kind = 'FACILITY' then
    select registry_type, slug into v_registry, v_slug from public.facilities where id = v_code.facility_id;
    if exists (select 1 from public.facility_memberships
                where facility_id = v_code.facility_id and user_id = v_uid and status = 'ACTIVE') then
      v_status := 'ALREADY_MEMBER';
    elsif v_registry = 'COMMERCIAL' then
      v_status := 'PURCHASE_REQUIRED';
    else
      begin
        insert into public.facility_memberships (facility_id, user_id, status, source)
        values (v_code.facility_id, v_uid, 'ACTIVE', 'JOIN')
        on conflict (facility_id, user_id) do update set status = 'ACTIVE';
        v_status := 'JOINED';
      exception when raise_exception then
        v_status := 'CAPACITY_REACHED';
      end;
    end if;
    return jsonb_build_object('action', 'JOIN_FACILITY', 'status', v_status,
                              'facility_id', v_code.facility_id, 'slug', v_slug);

  else
    begin
      insert into public.event_registrations (event_id, user_id)
      values (v_code.event_id, v_uid)
      on conflict (event_id, user_id) do update set status = 'REGISTERED';
      v_status := 'REGISTERED';
    exception when raise_exception then
      get stacked diagnostics v_status = message_text;
    end;
    return jsonb_build_object('action', 'REGISTER_EVENT', 'status', v_status, 'event_id', v_code.event_id);
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS + grants for the new tables
-- -----------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.qr_codes enable row level security;
revoke all on table public.events, public.event_registrations, public.qr_codes from anon, authenticated;

grant select on public.events to anon, authenticated;
grant insert (organizer_id, facility_id, title, description, sport, starts_at, ends_at, capacity, status)
  on public.events to authenticated;
grant update (facility_id, title, description, sport, starts_at, ends_at, capacity, status)
  on public.events to authenticated;
grant delete on public.events to authenticated;

create policy events_read on public.events
  for select to anon, authenticated
  using (status = 'PUBLISHED' or organizer_id = auth.uid()
         or (facility_id is not null and public.is_facility_staff(facility_id)));
create policy events_insert on public.events
  for insert to authenticated
  with check (
    organizer_id = auth.uid()
    and (
      (facility_id is not null and public.is_facility_staff(facility_id))
      or exists (select 1 from public.profiles p where p.id = auth.uid() and 'organizer' = any (coalesce(p.roles, '{}')))
    )
  );
create policy events_update on public.events
  for update to authenticated
  using (public.can_manage_event(id)) with check (public.can_manage_event(id));
create policy events_delete on public.events
  for delete to authenticated using (organizer_id = auth.uid());

grant select, insert on public.event_registrations to authenticated;
grant update (status) on public.event_registrations to authenticated;
create policy event_registrations_read on public.event_registrations
  for select to authenticated
  using (user_id = auth.uid() or public.can_manage_event(event_id));
create policy event_registrations_insert_self on public.event_registrations
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'REGISTERED');
create policy event_registrations_update on public.event_registrations
  for update to authenticated
  using (user_id = auth.uid() or public.can_manage_event(event_id))
  with check ((user_id = auth.uid() and status = 'CANCELLED') or public.can_manage_event(event_id));
-- qr_codes: no table access; only through the RPCs above.

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.get_my_profile(), public.has_facility_role(text, public.facility_role[]),
  public.is_facility_staff(text), public.is_facility_admin(text), public.is_facility_member(text),
  public.is_conversation_participant(uuid), public.conversation_facility_id(uuid),
  public.can_access_conversation(uuid), public.can_view_user_content(uuid),
  public.ensure_facility_conversation(text, uuid), public.open_direct_conversation(uuid),
  public.send_crm_broadcast(text, text, text, text, text, text, text, uuid, text),
  public.mark_conversation_read(uuid), public.verify_pass_code(uuid, text, timestamptz),
  public.create_payment_order(text, text, text), public.calculate_service_fee(numeric, text),
  public.consume_ai_quota(text, integer),
  public.can_manage_event(uuid), public.get_qr_code(public.qr_kind, text),
  public.rotate_qr_code(public.qr_kind, text), public.redeem_qr_code(text),
  public.resolve_qr_code(text), public.facilities_nearby(double precision, double precision, double precision, public.registry_type, integer)
to authenticated;
grant execute on function
  public.calculate_service_fee(numeric, text), public.resolve_qr_code(text),
  public.facilities_nearby(double precision, double precision, double precision, public.registry_type, integer)
to anon;

alter publication supabase_realtime add table public.event_registrations;
