-- =============================================================================
-- Depth for each kind of business, and one shared record of money taken in
-- person:
--   1. Desk payments (every workspace): cash and other payments a business took
--      itself. Append-only; a mistake is corrected by a reversing entry.
--   2. Courts (clubs): prices per court, a peak rate, and moving a booking.
--   3. Events (organizers): entry fee and categories.
--   4. Session packs (coaches): N sessions bought, counted down as they are held.
--   5. Classes (gyms, studios): a timetable with capacity and a waitlist.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Desk payments
-- -----------------------------------------------------------------------------
create table public.desk_payments (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  -- Positive for money taken; negative only for the reversal of an earlier entry.
  amount_php numeric(12, 2) not null check (amount_php <> 0 and abs(amount_php) <= 1000000),
  method text not null check (method in ('CASH', 'EWALLET', 'CARD', 'BANK', 'OTHER')),
  kind text not null check (kind in ('BOOKING', 'CLASS', 'PACK', 'EVENT', 'OTHER')),
  -- What was paid for: a booking, a class booking, a pack, or an event (with user_id for whose entry).
  ref_id uuid,
  user_id uuid references public.profiles (id) on delete set null,
  payer_name text check (payer_name is null or char_length(payer_name) <= 120),
  note text check (note is null or char_length(note) <= 300),
  reverses uuid unique references public.desk_payments (id),
  taken_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((reverses is null) = (amount_php > 0))
);

create index desk_payments_facility_idx on public.desk_payments (facility_id, created_at desc);
create index desk_payments_ref_idx on public.desk_payments (facility_id, kind, ref_id);

alter table public.desk_payments enable row level security;
revoke all on table public.desk_payments from anon, authenticated;
-- No update or delete for anyone: the record is append-only.
grant select on public.desk_payments to authenticated;
grant insert (facility_id, amount_php, method, kind, ref_id, user_id, payer_name, note)
  on public.desk_payments to authenticated;

create policy desk_payments_read on public.desk_payments
  for select to authenticated using (public.is_facility_staff(facility_id));
create policy desk_payments_insert on public.desk_payments
  for insert to authenticated
  with check (public.is_facility_staff(facility_id) and amount_php > 0);

-- Undo a payment recorded by mistake. Owners and admins only; once per payment.
create function public.reverse_desk_payment(p_payment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.desk_payments%rowtype;
  v_id uuid;
begin
  select * into v_payment from public.desk_payments where id = p_payment_id;
  if not found or not public.is_facility_admin(v_payment.facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if v_payment.reverses is not null then
    raise exception 'NOT_REVERSIBLE' using errcode = '22023';
  end if;
  if exists (select 1 from public.desk_payments where reverses = p_payment_id) then
    raise exception 'ALREADY_REVERSED' using errcode = 'P0001';
  end if;
  insert into public.desk_payments
    (facility_id, amount_php, method, kind, ref_id, user_id, payer_name, note, reverses, taken_by)
  values
    (v_payment.facility_id, -v_payment.amount_php, v_payment.method, v_payment.kind, v_payment.ref_id,
     v_payment.user_id, v_payment.payer_name, 'Reversal', p_payment_id, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

-- What has been paid at the desk for each thing of one kind, net of reversals.
create function public.desk_paid(p_facility_id text, p_kind text)
returns table (ref_id uuid, user_id uuid, paid_php numeric)
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
  select d.ref_id, d.user_id, sum(d.amount_php)
    from public.desk_payments d
   where d.facility_id = p_facility_id and d.kind = p_kind and d.ref_id is not null
   group by d.ref_id, d.user_id
  having sum(d.amount_php) <> 0;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Courts: prices and moving a booking
-- -----------------------------------------------------------------------------
alter table public.facility_spaces
  add column rate_php numeric(12, 2) check (rate_php is null or (rate_php >= 0 and rate_php <= 100000)),
  add column peak_rate_php numeric(12, 2) check (peak_rate_php is null or (peak_rate_php >= 0 and peak_rate_php <= 100000));

alter table public.facilities
  add column peak_start_hour smallint check (peak_start_hour is null or peak_start_hour between 0 and 23),
  add column peak_end_hour smallint check (peak_end_hour is null or peak_end_hour between 1 and 24),
  add constraint facilities_peak_window check (
    (peak_start_hour is null) = (peak_end_hour is null)
    and (peak_start_hour is null or peak_end_hour > peak_start_hour)
  );

alter table public.space_bookings
  add column price_php numeric(12, 2) check (price_php is null or price_php >= 0);

grant update (rate_php, peak_rate_php) on public.facility_spaces to authenticated;
grant insert (rate_php, peak_rate_php) on public.facility_spaces to authenticated;
grant update (peak_start_hour, peak_end_hour) on public.facilities to authenticated;
-- Moving or renaming a booking. The existing guard re-checks clashes on any change of time or court.
grant update (starts_at, ends_at, space_id, booked_for, note) on public.space_bookings to authenticated;

-- The price is worked out here, never sent by the client: hours × the court's rate, at the
-- peak rate when the booking starts inside the venue's peak hours (Philippine time).
create function public.price_space_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rate numeric;
  v_peak numeric;
  v_from smallint;
  v_to smallint;
  v_hour integer := extract(hour from new.starts_at at time zone 'Asia/Manila');
begin
  select s.rate_php, s.peak_rate_php, f.peak_start_hour, f.peak_end_hour
    into v_rate, v_peak, v_from, v_to
    from public.facility_spaces s
    join public.facilities f on f.id = s.facility_id
   where s.id = new.space_id;
  if v_peak is not null and v_from is not null and v_hour >= v_from and v_hour < v_to then
    v_rate := v_peak;
  end if;
  new.price_php := case
    when v_rate is null then null
    else round(v_rate * extract(epoch from (new.ends_at - new.starts_at)) / 3600, 2)
  end;
  return new;
end;
$$;

create trigger space_bookings_price
  before insert or update of starts_at, ends_at, space_id on public.space_bookings
  for each row execute function public.price_space_booking();

-- -----------------------------------------------------------------------------
-- 3. Events: entry fee and categories
-- -----------------------------------------------------------------------------
alter table public.events
  add column entry_fee_php numeric(12, 2) check (entry_fee_php is null or (entry_fee_php >= 0 and entry_fee_php <= 1000000)),
  add column categories text[] not null default '{}' check (cardinality(categories) <= 20);

alter table public.event_registrations
  add column category text check (category is null or char_length(category) <= 60);

grant insert (entry_fee_php, categories) on public.events to authenticated;
grant update (entry_fee_php, categories) on public.events to authenticated;
grant insert (category) on public.event_registrations to authenticated;

-- A chosen category must be one the event offers.
create function public.guard_registration_category()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category is not null and not exists (
    select 1 from public.events e where e.id = new.event_id and new.category = any (e.categories)
  ) then
    raise exception 'INVALID_CATEGORY' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger event_registrations_category
  before insert or update of category on public.event_registrations
  for each row execute function public.guard_registration_category();

drop function public.event_roster(uuid);
create function public.event_roster(p_event_id uuid)
returns table (
  user_id uuid,
  name text,
  username text,
  status text,
  category text,
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
         r.status, r.category, r.registered_at, r.checked_in_at
    from public.event_registrations r
    join public.profiles p on p.id = r.user_id
   where r.event_id = p_event_id
   order by (r.status = 'REGISTERED') desc, r.registered_at;
end;
$$;

drop function public.facility_events(text);
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
  entry_fee_php numeric,
  categories text[],
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
         e.entry_fee_php, e.categories,
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
-- 4. Session packs for coaches
-- -----------------------------------------------------------------------------
create table public.coach_packs (
  id uuid primary key default extensions.gen_random_uuid(),
  coach_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  -- The coaching business the pack was sold under, for its sales records.
  facility_id text references public.facilities (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  sessions_total integer not null check (sessions_total between 1 and 500),
  price_php numeric(12, 2) check (price_php is null or (price_php >= 0 and price_php <= 1000000)),
  created_at timestamptz not null default now()
);

create index coach_packs_coach_idx on public.coach_packs (coach_id, client_id);

create table public.coach_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  pack_id uuid not null references public.coach_packs (id) on delete cascade,
  held_at timestamptz not null default now(),
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now()
);

create index coach_sessions_pack_idx on public.coach_sessions (pack_id);

-- A pack can only be sold to someone on the coach's list, and never overdrawn.
create function public.guard_coach_pack()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.coach_clients cc
     where cc.coach_id = new.coach_id and cc.client_id = new.client_id and cc.status <> 'CANCELLED'
  ) then
    raise exception 'NOT_A_CLIENT' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger coach_packs_guard
  before insert on public.coach_packs
  for each row execute function public.guard_coach_pack();

create function public.guard_coach_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
  v_used integer;
begin
  select sessions_total into v_total from public.coach_packs where id = new.pack_id for update;
  select count(*) into v_used from public.coach_sessions where pack_id = new.pack_id;
  if v_used >= v_total then
    raise exception 'PACK_USED_UP' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger coach_sessions_guard
  before insert on public.coach_sessions
  for each row execute function public.guard_coach_session();

alter table public.coach_packs enable row level security;
alter table public.coach_sessions enable row level security;
revoke all on table public.coach_packs, public.coach_sessions from anon, authenticated;
grant select on public.coach_packs, public.coach_sessions to authenticated;
grant insert (client_id, facility_id, name, sessions_total, price_php) on public.coach_packs to authenticated;
grant insert (pack_id, held_at, note) on public.coach_sessions to authenticated;
grant delete on public.coach_sessions to authenticated;

-- The coach manages their packs; the client can see their own.
create policy coach_packs_read on public.coach_packs
  for select to authenticated using (coach_id = auth.uid() or client_id = auth.uid());
create policy coach_packs_insert on public.coach_packs
  for insert to authenticated with check (coach_id = auth.uid());
create policy coach_sessions_read on public.coach_sessions
  for select to authenticated
  using (exists (select 1 from public.coach_packs p
                  where p.id = pack_id and (p.coach_id = auth.uid() or p.client_id = auth.uid())));
create policy coach_sessions_insert on public.coach_sessions
  for insert to authenticated
  with check (exists (select 1 from public.coach_packs p where p.id = pack_id and p.coach_id = auth.uid()));
create policy coach_sessions_delete on public.coach_sessions
  for delete to authenticated
  using (exists (select 1 from public.coach_packs p where p.id = pack_id and p.coach_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 5. Classes: a timetable with capacity and a waitlist
-- -----------------------------------------------------------------------------
create table public.class_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 80),
  instructor text check (instructor is null or char_length(instructor) <= 80),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity between 1 and 1000),
  price_php numeric(12, 2) check (price_php is null or (price_php >= 0 and price_php <= 100000)),
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED', 'CANCELLED')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (ends_at - starts_at <= interval '8 hours')
);

create index class_sessions_facility_idx on public.class_sessions (facility_id, starts_at);

create table public.class_bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null references public.class_sessions (id) on delete cascade,
  facility_id text not null references public.facilities (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  contact_id uuid references public.facility_imported_members (id) on delete set null,
  booked_name text not null check (char_length(btrim(booked_name)) between 1 and 120),
  status text not null default 'BOOKED' check (status in ('BOOKED', 'WAITLIST', 'CANCELLED')),
  attended_at timestamptz,
  created_at timestamptz not null default now()
);

create index class_bookings_session_idx on public.class_bookings (session_id, created_at);
-- One live place per account per class.
create unique index class_bookings_one_per_user
  on public.class_bookings (session_id, user_id) where user_id is not null and status <> 'CANCELLED';

alter table public.class_sessions enable row level security;
alter table public.class_bookings enable row level security;
revoke all on table public.class_sessions, public.class_bookings from anon, authenticated;
grant select on public.class_sessions to anon, authenticated;
grant select on public.class_bookings to authenticated;
grant insert (facility_id, title, instructor, starts_at, ends_at, capacity, price_php)
  on public.class_sessions to authenticated;
grant update (title, instructor, starts_at, ends_at, capacity, price_php, status)
  on public.class_sessions to authenticated;

-- The timetable is public, like a venue's opening hours. Bookings are private.
create policy class_sessions_read on public.class_sessions
  for select to anon, authenticated using (status = 'SCHEDULED' or public.is_facility_staff(facility_id));
create policy class_sessions_insert on public.class_sessions
  for insert to authenticated with check (public.is_facility_staff(facility_id));
create policy class_sessions_update on public.class_sessions
  for update to authenticated
  using (public.is_facility_staff(facility_id)) with check (public.is_facility_staff(facility_id));
create policy class_bookings_read on public.class_bookings
  for select to authenticated using (user_id = auth.uid() or public.is_facility_staff(facility_id));

-- Bookings go through these functions so that capacity and the waitlist are decided in one place.
create function private.place_in_class(
  p_session_id uuid, p_user_id uuid, p_contact_id uuid, p_name text
)
returns public.class_bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.class_sessions%rowtype;
  v_taken integer;
  v_booking public.class_bookings%rowtype;
begin
  -- One booking at a time per class, so two people cannot take the last place.
  select * into v_session from public.class_sessions where id = p_session_id for update;
  if not found then
    raise exception 'CLASS_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_session.status <> 'SCHEDULED' or v_session.ends_at < now() then
    raise exception 'CLASS_CLOSED' using errcode = 'P0001';
  end if;
  if p_user_id is not null and exists (
    select 1 from public.class_bookings
     where session_id = p_session_id and user_id = p_user_id and status <> 'CANCELLED'
  ) then
    raise exception 'ALREADY_BOOKED' using errcode = 'P0001';
  end if;
  select count(*) into v_taken from public.class_bookings
   where session_id = p_session_id and status = 'BOOKED';
  insert into public.class_bookings (session_id, facility_id, user_id, contact_id, booked_name, status)
  values (p_session_id, v_session.facility_id, p_user_id, p_contact_id, btrim(p_name),
          case when v_taken < v_session.capacity then 'BOOKED' else 'WAITLIST' end)
  returning * into v_booking;
  return v_booking;
end;
$$;

-- A member books themselves in the app. Returns BOOKED or WAITLIST.
create function public.book_class(p_session_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  select coalesce(nullif(name, ''), '@' || username::text, 'Member') into v_name
    from public.profiles where id = v_uid;
  return (private.place_in_class(p_session_id, v_uid, null, v_name)).status;
end;
$$;

-- Staff book someone at the desk: an account, a contact, or just a name.
create function public.staff_book_class(
  p_session_id uuid, p_name text, p_user_id uuid default null, p_contact_id uuid default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_facility text;
begin
  select facility_id into v_facility from public.class_sessions where id = p_session_id;
  if v_facility is null or not public.is_facility_staff(v_facility) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_contact_id is not null and not exists (
    select 1 from public.facility_imported_members c where c.id = p_contact_id and c.facility_id = v_facility
  ) then
    raise exception 'INVALID_BOOKING_PERSON' using errcode = '22023';
  end if;
  return (private.place_in_class(p_session_id, p_user_id, p_contact_id, p_name)).status;
end;
$$;

-- Cancel a place (the person themselves, or staff). The first person waiting takes it.
create function public.cancel_class_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.class_bookings%rowtype;
  v_capacity integer;
  v_taken integer;
begin
  select * into v_booking from public.class_bookings where id = p_booking_id;
  if not found
     or not (v_booking.user_id = auth.uid() or public.is_facility_staff(v_booking.facility_id)) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if v_booking.status = 'CANCELLED' then
    return;
  end if;
  select capacity into v_capacity from public.class_sessions where id = v_booking.session_id for update;
  update public.class_bookings set status = 'CANCELLED' where id = p_booking_id;
  select count(*) into v_taken from public.class_bookings
   where session_id = v_booking.session_id and status = 'BOOKED';
  if v_taken < v_capacity then
    update public.class_bookings set status = 'BOOKED'
     where id = (
       select id from public.class_bookings
        where session_id = v_booking.session_id and status = 'WAITLIST'
        order by created_at
        limit 1
     );
  end if;
end;
$$;

create function public.set_class_attendance(p_booking_id uuid, p_present boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_facility text;
begin
  select facility_id into v_facility from public.class_bookings where id = p_booking_id and status = 'BOOKED';
  if v_facility is null or not public.is_facility_staff(v_facility) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  update public.class_bookings
     set attended_at = case when p_present then coalesce(attended_at, now()) end
   where id = p_booking_id;
end;
$$;

-- A venue's classes between two times, with how full each one is.
create function public.facility_classes(p_facility_id text, p_from timestamptz, p_to timestamptz)
returns table (
  id uuid,
  title text,
  instructor text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  price_php numeric,
  status text,
  booked integer,
  waitlist integer,
  attended integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.title, s.instructor, s.starts_at, s.ends_at, s.capacity, s.price_php, s.status,
         count(b.id) filter (where b.status = 'BOOKED')::integer,
         count(b.id) filter (where b.status = 'WAITLIST')::integer,
         count(b.id) filter (where b.status = 'BOOKED' and b.attended_at is not null)::integer
    from public.class_sessions s
    left join public.class_bookings b on b.session_id = s.id
   where s.facility_id = p_facility_id and s.starts_at >= p_from and s.starts_at < p_to
     and (s.status = 'SCHEDULED' or public.is_facility_staff(p_facility_id))
   group by s.id
   order by s.starts_at;
$$;

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
revoke execute on function
  public.reverse_desk_payment(uuid), public.desk_paid(text, text), public.price_space_booking(),
  public.guard_registration_category(), public.event_roster(uuid), public.facility_events(text),
  public.guard_coach_pack(), public.guard_coach_session(),
  private.place_in_class(uuid, uuid, uuid, text), public.book_class(uuid),
  public.staff_book_class(uuid, text, uuid, uuid), public.cancel_class_booking(uuid),
  public.set_class_attendance(uuid, boolean), public.facility_classes(text, timestamptz, timestamptz)
  from public, anon, authenticated;

grant execute on function
  public.reverse_desk_payment(uuid), public.desk_paid(text, text),
  public.event_roster(uuid), public.facility_events(text),
  public.book_class(uuid), public.staff_book_class(uuid, text, uuid, uuid),
  public.cancel_class_booking(uuid), public.set_class_attendance(uuid, boolean)
  to authenticated;
grant execute on function public.facility_classes(text, timestamptz, timestamptz) to anon, authenticated;
