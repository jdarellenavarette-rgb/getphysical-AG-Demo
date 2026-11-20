-- =============================================================================
-- Contacts: one record for a person at a business, whether or not they have a
-- Sodia account yet. `facility_imported_members` already held spreadsheet rows;
-- it now also holds people added at the desk, and each record can be linked to
-- an account. Bookings can point at a person, and one function lists everyone
-- a business knows: members, contacts, event sign-ups and people with bookings.
-- (The table keeps its name; it is the contacts table.)
-- =============================================================================

alter table public.facility_imported_members
  add column user_id uuid references public.profiles (id) on delete set null,
  add column linked_at timestamptz,
  add column source text not null default 'IMPORT' check (source in ('IMPORT', 'DESK'));

comment on table public.facility_imported_members is
  'Contacts: people a business knows who may not have an account. user_id is set once they are matched to one.';

-- One contact per account per business.
create unique index facility_contacts_user_idx
  on public.facility_imported_members (facility_id, user_id) where user_id is not null;

-- Front-desk staff can add a walk-in; bulk imports stay with owners and admins.
grant insert (source) on public.facility_imported_members to authenticated;
drop policy facility_imported_members_insert on public.facility_imported_members;
create policy facility_imported_members_insert on public.facility_imported_members
  for insert to authenticated
  with check (
    public.is_facility_admin(facility_id)
    or (source = 'DESK' and public.is_facility_staff(facility_id))
  );

-- -----------------------------------------------------------------------------
-- Linking. A contact is matched to an account only when that account already
-- has a relationship with the same business (member, event sign-up) and its
-- confirmed email equals the contact's. Nothing is revealed to a business
-- about people who have not come to it themselves.
-- -----------------------------------------------------------------------------
create function private.link_contact_for_user(p_facility_id text, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  if p_facility_id is null or p_user_id is null
     or exists (select 1 from public.facility_imported_members
                 where facility_id = p_facility_id and user_id = p_user_id) then
    return;
  end if;
  select lower(u.email) into v_email
    from auth.users u
   where u.id = p_user_id and u.email_confirmed_at is not null;
  if v_email is null then
    return;
  end if;
  update public.facility_imported_members c
     set user_id = p_user_id, linked_at = now()
   where c.id = (
     select c2.id from public.facility_imported_members c2
      where c2.facility_id = p_facility_id and c2.user_id is null and lower(c2.email) = v_email
      order by c2.created_at
      limit 1
   );
end;
$$;

create function public.link_contact_on_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.link_contact_for_user(new.facility_id, new.user_id);
  return new;
end;
$$;

create trigger facility_memberships_link_contact
  after insert on public.facility_memberships
  for each row execute function public.link_contact_on_membership();

create function public.link_contact_on_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.link_contact_for_user(
    (select e.facility_id from public.events e where e.id = new.event_id), new.user_id);
  return new;
end;
$$;

create trigger event_registrations_link_contact
  after insert on public.event_registrations
  for each row execute function public.link_contact_on_registration();

-- A contact added after the person already joined is matched straight away.
create function public.link_contact_on_create()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if new.email is null or new.user_id is not null then
    return new;
  end if;
  select u.id into v_user
    from auth.users u
   where lower(u.email) = lower(new.email) and u.email_confirmed_at is not null
     and (
       exists (select 1 from public.facility_memberships m
                where m.facility_id = new.facility_id and m.user_id = u.id)
       or exists (select 1 from public.event_registrations r
                    join public.events e on e.id = r.event_id
                   where e.facility_id = new.facility_id and r.user_id = u.id)
     )
     and not exists (select 1 from public.facility_imported_members c
                      where c.facility_id = new.facility_id and c.user_id = u.id)
   limit 1;
  if v_user is not null then
    new.user_id := v_user;
    new.linked_at := now();
  end if;
  return new;
end;
$$;

create trigger facility_contacts_link_on_create
  before insert on public.facility_imported_members
  for each row execute function public.link_contact_on_create();

-- -----------------------------------------------------------------------------
-- Bookings point at a person: an account, a contact, or (as before) just a name.
-- -----------------------------------------------------------------------------
alter table public.space_bookings
  add column contact_id uuid references public.facility_imported_members (id) on delete set null;

grant insert (contact_id) on public.space_bookings to authenticated;

create function public.guard_booking_person()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.contact_id is not null and not exists (
    select 1 from public.facility_imported_members c
     where c.id = new.contact_id and c.facility_id = new.facility_id
  ) then
    raise exception 'INVALID_BOOKING_PERSON' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger space_bookings_person_guard
  before insert on public.space_bookings
  for each row execute function public.guard_booking_person();

-- -----------------------------------------------------------------------------
-- Everyone a business knows, one row per person.
-- -----------------------------------------------------------------------------
create function public.facility_people(p_facility_id text)
returns table (
  person_key text,
  user_id uuid,
  contact_id uuid,
  name text,
  username text,
  email text,
  phone text,
  on_app boolean,
  standing text,
  contact_source text,
  plan_name text,
  plan_expires_on date,
  events_count integer,
  last_event_at timestamptz,
  bookings_count integer,
  next_booking_at timestamptz,
  first_seen_at timestamptz
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
  with members as (
    select d.user_id, d.name, d.username, d.standing, d.joined_at
      from public.facility_member_directory(p_facility_id) d
  ),
  contacts as (
    select c.* from public.facility_imported_members c where c.facility_id = p_facility_id
  ),
  regs as (
    select r.user_id,
           count(*) filter (where r.status = 'REGISTERED')::integer as n,
           max(e.starts_at) filter (where r.status = 'REGISTERED') as last_at,
           min(r.registered_at) as first_at
      from public.event_registrations r
      join public.events e on e.id = r.event_id
     where e.facility_id = p_facility_id
     group by r.user_id
  ),
  books as (
    select b.user_id, b.contact_id, count(*)::integer as n,
           min(b.starts_at) filter (where b.starts_at > now()) as next_at,
           min(b.created_at) as first_at
      from public.space_bookings b
     where b.facility_id = p_facility_id and b.status = 'CONFIRMED'
       and (b.user_id is not null or b.contact_id is not null)
     group by b.user_id, b.contact_id
  ),
  user_books as (
    -- Bookings made for the account directly, or for the contact linked to it.
    select coalesce(b.user_id, c.user_id) as user_id, sum(b.n)::integer as n,
           min(b.next_at) as next_at, min(b.first_at) as first_at
      from books b
      left join contacts c on c.id = b.contact_id
     where coalesce(b.user_id, c.user_id) is not null
     group by 1
  ),
  known as (
    select m.user_id from members m
    union select r.user_id from regs r
    union select ub.user_id from user_books ub
    union select c.user_id from contacts c where c.user_id is not null
  )
  select 'u:' || k.user_id::text, k.user_id, c.id,
         coalesce(m.name, nullif(p.name, ''), '@' || p.username::text, c.full_name, 'Member'),
         coalesce(m.username, p.username::text), c.email, c.phone, true,
         m.standing, c.source, c.plan_name, c.expires_on,
         coalesce(r.n, 0), r.last_at, coalesce(ub.n, 0), ub.next_at,
         least(m.joined_at, r.first_at, ub.first_at, c.created_at)
    from known k
    join public.profiles p on p.id = k.user_id
    left join members m on m.user_id = k.user_id
    left join contacts c on c.user_id = k.user_id
    left join regs r on r.user_id = k.user_id
    left join user_books ub on ub.user_id = k.user_id
  union all
  select 'c:' || c.id::text, null::uuid, c.id, c.full_name, null::text, c.email, c.phone, false,
         null::text, c.source, c.plan_name, c.expires_on,
         0, null::timestamptz, coalesce(b.n, 0), b.next_at, least(c.created_at, b.first_at)
    from contacts c
    left join books b on b.contact_id = c.id and b.user_id is null
   where c.user_id is null
   order by 4;
end;
$$;

-- -----------------------------------------------------------------------------
-- A coaching business sees one client list across its coaches. Training
-- figures stay with the coach the client agreed to: other team members see
-- who is coached by whom, not how they are training.
-- -----------------------------------------------------------------------------
create function public.business_coach_roster(p_facility_id text)
returns table (
  coach_id uuid,
  coach_name text,
  client_id uuid,
  name text,
  username text,
  status public.membership_status,
  awaiting text,
  since timestamptz,
  is_mine boolean,
  last_workout_at timestamptz,
  workouts_7d integer,
  workouts_28d integer
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
  select cc.coach_id,
         coalesce(nullif(cp.name, ''), '@' || cp.username::text, 'Coach'),
         cc.client_id,
         coalesce(nullif(p.name, ''), '@' || p.username::text, 'Member'),
         p.username::text,
         cc.status,
         case when cc.status <> 'PENDING' then null
              when cc.invited_by = cc.coach_id then 'CLIENT' else 'COACH' end,
         cc.created_at,
         cc.coach_id = auth.uid(),
         case when mine.ok then w.last_at end,
         case when mine.ok then coalesce(w.n7, 0)::integer end,
         case when mine.ok then coalesce(w.n28, 0)::integer end
    from public.coach_clients cc
    join public.facility_staff s on s.facility_id = p_facility_id and s.user_id = cc.coach_id
    join public.profiles cp on cp.id = cc.coach_id
    join public.profiles p on p.id = cc.client_id
    cross join lateral (select cc.coach_id = auth.uid() and cc.status = 'ACTIVE' as ok) mine
    left join lateral (
      select max(l.created_at) as last_at,
             count(*) filter (where l.created_at >= now() - interval '7 days') as n7,
             count(*) filter (where l.created_at >= now() - interval '28 days') as n28
        from (
          select wl.created_at from public.workouts_lift wl where wl.user_id = cc.client_id and mine.ok
          union all
          select wm.created_at from public.workouts_move wm where wm.user_id = cc.client_id and mine.ok
        ) l
    ) w on true
   where cc.status <> 'CANCELLED'
   order by (cc.coach_id = auth.uid()) desc, (cc.status = 'PENDING') desc, w.last_at asc nulls first, cc.created_at;
end;
$$;

revoke execute on function
  private.link_contact_for_user(text, uuid), public.link_contact_on_membership(),
  public.link_contact_on_registration(), public.link_contact_on_create(), public.guard_booking_person(),
  public.facility_people(text), public.business_coach_roster(text)
  from public, anon, authenticated;
grant execute on function public.facility_people(text), public.business_coach_roster(text) to authenticated;

-- -----------------------------------------------------------------------------
-- Demo: the demo club's desk bookings belong to people, two of them walk-ins
-- who are not on the app.
-- -----------------------------------------------------------------------------
create function private.seed_demo_contacts(p_fid text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contact uuid;
  r record;
begin
  if not exists (select 1 from public.facilities where id = p_fid)
     or exists (select 1 from public.facility_imported_members where facility_id = p_fid) then
    return;
  end if;
  for r in
    select * from (values
      ('Reyes family', 'Ana Reyes', '0917 555 0201', null),
      ('Santos doubles', 'Jun Santos', '0918 555 0202', 'jun.santos@example.com'),
      ('Lim and friends', 'Kevin Lim', null, 'kevin.lim@example.com')
    ) as t(booking, full_name, phone, email)
  loop
    insert into public.facility_imported_members (facility_id, full_name, phone, email, source)
    values (p_fid, r.full_name, r.phone, r.email, 'DESK')
    returning id into v_contact;
    update public.space_bookings set contact_id = v_contact where facility_id = p_fid and booked_for = r.booking;
  end loop;
  -- Two members with a booking of their own.
  update public.space_bookings set user_id = md5('gp-demo-member-3')::uuid
   where facility_id = p_fid and booked_for = 'Tuesday ladder';
  update public.space_bookings set user_id = md5('gp-demo-member-7')::uuid
   where facility_id = p_fid and booked_for = 'Beginner clinic';
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
  return v_fid;
end;
$$;

do $$
declare
  r record;
begin
  for r in select id from public.facilities where id like 'demo\_club\_%' loop
    perform private.seed_demo_contacts(r.id);
  end loop;
end;
$$;

revoke execute on function private.seed_demo_contacts(text) from public, anon, authenticated;
