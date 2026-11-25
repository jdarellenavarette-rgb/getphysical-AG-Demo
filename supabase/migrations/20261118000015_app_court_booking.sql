-- =============================================================================
-- Booking a court from the Sodia app.
--
-- Until now only staff could put a booking on the calendar. A club can now open
-- its courts to the app: people see which slots are free, book one, and cancel
-- it. Classes (`book_class`) and events (`event_registrations`) were already
-- bookable from the app; this completes the set.
--
-- Payment is not taken here. A booking made in the app is unpaid until the desk
-- records the money, the same as a booking made at the desk.
-- =============================================================================

-- A club chooses to take bookings from the app. Off by default: a calendar should
-- not start filling with unpaid bookings because of an update.
alter table public.facilities add column app_booking boolean not null default false;
grant update (app_booking) on public.facilities to authenticated;

-- Courts of a club that takes app bookings can be read by signed-in people.
create policy facility_spaces_read_bookable on public.facility_spaces
  for select to authenticated
  using (is_active and exists (
    select 1 from public.facilities f where f.id = facility_id and f.app_booking));

-- How far ahead, how long, and how many at once a person may book from the app.
create function private.app_booking_limits()
returns table (max_days_ahead integer, min_minutes integer, max_minutes integer, max_upcoming integer)
language sql
immutable
set search_path = ''
as $$ select 30, 30, 180, 3 $$;

-- What is free on a day. Returns the courts with their prices and, for each court,
-- the times it cannot be booked: its own bookings, and bookings of the same floor
-- in another layout with the changeover time either side. No names are returned.
create function public.court_availability(p_facility_id text, p_day date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_facility public.facilities%rowtype;
  v_from timestamptz := (p_day::timestamp at time zone 'Asia/Manila');
  v_to timestamptz := ((p_day + 1)::timestamp at time zone 'Asia/Manila');
  v_buffer constant interval := interval '15 minutes';
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  select * into v_facility from public.facilities where id = p_facility_id;
  if not found or not v_facility.app_booking then
    return jsonb_build_object('open', false, 'courts', '[]'::jsonb);
  end if;
  return jsonb_build_object(
    'open', true,
    'day', p_day,
    'peak_start_hour', v_facility.peak_start_hour,
    'peak_end_hour', v_facility.peak_end_hour,
    'limits', (select to_jsonb(l) from private.app_booking_limits() l),
    'courts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'sport', s.sport, 'parent_id', s.parent_id,
        'rate_php', s.rate_php, 'peak_rate_php', s.peak_rate_php,
        'taken', coalesce((
          select jsonb_agg(jsonb_build_object('starts_at', t.starts_at, 'ends_at', t.ends_at) order by t.starts_at)
            from (
              select b.starts_at, b.ends_at
                from public.space_bookings b
               where b.space_id = s.id and b.status = 'CONFIRMED'
                 and b.starts_at < v_to and b.ends_at > v_from
              union all
              select b.starts_at - v_buffer, b.ends_at + v_buffer
                from public.space_bookings b
                join public.facility_spaces o on o.id = b.space_id
               where b.status = 'CONFIRMED' and (o.id = s.parent_id or o.parent_id = s.id)
                 and b.starts_at - v_buffer < v_to and b.ends_at + v_buffer > v_from
            ) t), '[]'::jsonb)
      ) order by s.name)
        from public.facility_spaces s
       where s.facility_id = p_facility_id and s.is_active), '[]'::jsonb));
end;
$$;

-- Book a court for yourself. Starts on the hour or half hour. The existing guard
-- refuses a slot that is taken, and the existing price trigger sets the amount.
create function public.book_court(p_space_id uuid, p_starts_at timestamptz, p_minutes integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_space public.facility_spaces%rowtype;
  v_limits record;
  v_name text;
  v_booking public.space_bookings%rowtype;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  select * into v_space from public.facility_spaces where id = p_space_id and is_active;
  if not found or not exists (
    select 1 from public.facilities f where f.id = v_space.facility_id and f.app_booking
  ) then
    raise exception 'APP_BOOKING_CLOSED' using errcode = 'P0001';
  end if;
  select * into v_limits from private.app_booking_limits();
  if p_minutes is null or p_minutes not between v_limits.min_minutes and v_limits.max_minutes or p_minutes % 30 <> 0 then
    raise exception 'INVALID_BOOKING_LENGTH' using errcode = '22023';
  end if;
  if p_starts_at is null or p_starts_at <= now()
     or p_starts_at > now() + make_interval(days => v_limits.max_days_ahead)
     or extract(epoch from p_starts_at)::bigint % 1800 <> 0 then
    raise exception 'INVALID_BOOKING_TIME' using errcode = '22023';
  end if;

  -- Counted under the venue's lock, so two taps cannot both slip under the limit.
  perform pg_advisory_xact_lock(hashtext('space_bookings:' || v_space.facility_id));
  if (select count(*) from public.space_bookings b
       where b.facility_id = v_space.facility_id and b.user_id = v_uid
         and b.status = 'CONFIRMED' and b.ends_at > now()) >= v_limits.max_upcoming then
    raise exception 'BOOKING_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  select coalesce(nullif(name, ''), '@' || username::text, 'Member') into v_name
    from public.profiles where id = v_uid;
  insert into public.space_bookings (facility_id, space_id, booked_for, user_id, starts_at, ends_at, note, created_by)
  values (v_space.facility_id, v_space.id, left(v_name, 120), v_uid, p_starts_at,
          p_starts_at + make_interval(mins => p_minutes), 'Booked in the app', v_uid)
  returning * into v_booking;
  return jsonb_build_object('id', v_booking.id, 'starts_at', v_booking.starts_at, 'ends_at', v_booking.ends_at,
                            'price_php', v_booking.price_php);
end;
$$;

-- Cancel your own booking, up to the moment it starts.
create function public.cancel_court_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  update public.space_bookings
     set status = 'CANCELLED'
   where id = p_booking_id and user_id = v_uid and status = 'CONFIRMED' and starts_at > now();
  if not found then
    raise exception 'BOOKING_NOT_CANCELLABLE' using errcode = 'P0001';
  end if;
end;
$$;

revoke execute on function
  private.app_booking_limits(), public.court_availability(text, date),
  public.book_court(uuid, timestamptz, integer), public.cancel_court_booking(uuid)
  from public, anon;
grant execute on function
  public.court_availability(text, date), public.book_court(uuid, timestamptz, integer),
  public.cancel_court_booking(uuid)
  to authenticated;
