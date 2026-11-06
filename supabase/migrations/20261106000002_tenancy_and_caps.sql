-- =============================================================================
-- Multi-tenancy: who works at a facility, who belongs to it, coach rosters,
-- and the registry hard caps (AGENTS.md §4) enforced inside the database.
-- =============================================================================

-- Staff / operators of a facility (the B2B tenant users).
create table public.facility_staff (
  facility_id text not null references public.facilities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.facility_role not null,
  created_at timestamptz default now(),
  primary key (facility_id, user_id)
);

create index facility_staff_user_idx on public.facility_staff (user_id);

-- Athletes that belong to a facility (gym members / club members).
create table public.facility_memberships (
  facility_id text not null references public.facilities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.membership_status not null default 'ACTIVE',
  source text not null default 'JOIN' check (source in ('JOIN', 'PURCHASE', 'STAFF_ADDED')),
  joined_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (facility_id, user_id)
);

create index facility_memberships_user_idx on public.facility_memberships (user_id);

create trigger facility_memberships_set_updated_at
  before update on public.facility_memberships
  for each row execute function public.set_updated_at();

-- CRM audience segments (e.g. "At-Risk", "VIP Pass").
create table public.facility_segments (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  key text not null check (key ~ '^[A-Z0-9_]{1,40}$'),
  label text not null,
  created_at timestamptz default now(),
  unique (facility_id, key)
);

create table public.facility_segment_members (
  segment_id uuid not null references public.facility_segments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  added_at timestamptz default now(),
  primary key (segment_id, user_id)
);

-- Coach ⇄ client relationships (CoachDash).
create table public.coach_clients (
  coach_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  facility_id text references public.facilities (id) on delete set null,
  status public.membership_status not null default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (coach_id, client_id),
  check (coach_id <> client_id)
);

create index coach_clients_client_idx on public.coach_clients (client_id);

create trigger coach_clients_set_updated_at
  before update on public.coach_clients
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Authorization helpers. SECURITY DEFINER so policies can call them without
-- recursive RLS evaluation. All are STABLE and pin search_path.
-- -----------------------------------------------------------------------------
create function public.has_facility_role(p_facility_id text, p_roles public.facility_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.facility_staff s
     where s.facility_id = p_facility_id
       and s.user_id = auth.uid()
       and s.role = any (p_roles)
  );
$$;

create function public.is_facility_staff(p_facility_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_facility_role(
    p_facility_id,
    array['OWNER', 'ADMIN', 'STAFF', 'COACH']::public.facility_role[]
  );
$$;

create function public.is_facility_admin(p_facility_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_facility_role(
    p_facility_id,
    array['OWNER', 'ADMIN']::public.facility_role[]
  );
$$;

create function public.is_facility_member(p_facility_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.facility_memberships m
     where m.facility_id = p_facility_id
       and m.user_id = auth.uid()
       and m.status = 'ACTIVE'
  );
$$;

-- The creator of a facility becomes its OWNER.
create function public.handle_new_facility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_id is not null then
    insert into public.facility_staff (facility_id, user_id, role)
    values (new.id, new.owner_id, 'OWNER')
    on conflict (facility_id, user_id) do update set role = 'OWNER';
  end if;
  return new;
end;
$$;

create trigger on_facility_created
  after insert on public.facilities
  for each row execute function public.handle_new_facility();

-- -----------------------------------------------------------------------------
-- Hard caps (AGENTS.md §4):
--   * COMMUNITY facilities on the FREE plan: max 19 ACTIVE members
--   * Coaches on the FREE plan: max 3 ACTIVE clients
-- Enforced with a row lock on the parent so concurrent inserts cannot race
-- past the cap. Clients never see or implement the cap themselves.
-- -----------------------------------------------------------------------------
create function public.enforce_community_member_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type public.registry_type;
  v_plan public.subscription_plan;
  v_active integer;
begin
  if new.status <> 'ACTIVE' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'ACTIVE' then
    return new;
  end if;

  select registry_type, plan into v_type, v_plan
    from public.facilities
   where id = new.facility_id
   for update;

  if v_type = 'COMMUNITY' and v_plan = 'FREE' then
    select count(*) into v_active
      from public.facility_memberships
     where facility_id = new.facility_id
       and status = 'ACTIVE'
       and user_id <> new.user_id;
    if v_active >= 19 then
      raise exception 'COMMUNITY_FREE_MEMBER_CAP_REACHED'
        using errcode = 'P0001',
              hint = 'Free community clubs are limited to 19 members. Upgrade the club to PRO.';
    end if;
  end if;
  return new;
end;
$$;

create trigger facility_memberships_cap
  before insert or update of status on public.facility_memberships
  for each row execute function public.enforce_community_member_cap();

create function public.enforce_coach_client_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.subscription_plan;
  v_active integer;
begin
  if new.status <> 'ACTIVE' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'ACTIVE' then
    return new;
  end if;

  select coach_plan into v_plan
    from public.profiles
   where id = new.coach_id
   for update;

  if v_plan = 'FREE' then
    select count(*) into v_active
      from public.coach_clients
     where coach_id = new.coach_id
       and status = 'ACTIVE'
       and client_id <> new.client_id;
    if v_active >= 3 then
      raise exception 'COACH_FREE_CLIENT_CAP_REACHED'
        using errcode = 'P0001',
              hint = 'Free coach profiles are limited to 3 clients. Upgrade to PRO.';
    end if;
  end if;
  return new;
end;
$$;

create trigger coach_clients_cap
  before insert or update of status on public.coach_clients
  for each row execute function public.enforce_coach_client_cap();
