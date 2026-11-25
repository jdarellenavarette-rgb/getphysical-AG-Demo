\set ON_ERROR_STOP on
begin;

select tests.create_user('0f000000-0000-0000-0000-0000000000a1', 'Owner Olive');
select tests.create_user('0f000000-0000-0000-0000-0000000000a2', 'Pia Player');
select tests.create_user('0f000000-0000-0000-0000-0000000000a3', 'Rico Rival');

select tests.act_as('0f000000-0000-0000-0000-0000000000a1');
insert into public.facilities (id, owner_id, name, registry_type, category, business_kind)
values ('fac_app', auth.uid(), 'App Club', 'COMMUNITY', 'Sports club', 'CLUB');
select tests.reset_actor();
insert into public.facility_spaces (id, facility_id, name, sport, rate_php) values
  ('0f000000-0000-0000-0000-00000000c001', 'fac_app', 'Main Court', 'Basketball', 600);
insert into public.facility_spaces (id, facility_id, parent_id, name, sport, rate_php) values
  ('0f000000-0000-0000-0000-00000000c002', 'fac_app', '0f000000-0000-0000-0000-00000000c001', 'Half A', 'Pickleball', 300);

-- A slot tomorrow at 10:00 Manila time, well inside the booking window.
create temporary table slot on commit drop as
  select ((current_date + 1)::timestamp + interval '10 hours') at time zone 'Asia/Manila' as at,
         ((now() at time zone 'Asia/Manila')::date + 1) as day;
grant select on slot to authenticated;

-- ------------------------------------------------------------------ closed by default
select tests.act_as('0f000000-0000-0000-0000-0000000000a2');
select tests.ok(
  (public.court_availability('fac_app', (select day from slot)) ->> 'open')::boolean = false,
  'a club does not take app bookings until it says so');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot), 60)$$,
  'APP_BOOKING_CLOSED', 'nobody can book in the app while the club has it switched off');
select tests.ok(
  (select count(*) from public.facility_spaces where facility_id = 'fac_app') = 0,
  'courts of a club that is closed to the app stay hidden');
update public.facilities set app_booking = true where id = 'fac_app';
select tests.reset_actor();

select tests.ok(
  (select not app_booking from public.facilities where id = 'fac_app'), 'a player cannot switch app booking on');

select tests.act_as('0f000000-0000-0000-0000-0000000000a1');
update public.facilities set app_booking = true where id = 'fac_app';
select tests.reset_actor();

-- ------------------------------------------------------------------ booking
select tests.act_as('0f000000-0000-0000-0000-0000000000a2');
select tests.ok(
  jsonb_array_length(public.court_availability('fac_app', (select day from slot)) -> 'courts') = 2,
  'once open, the app sees the courts');
select tests.ok(
  (select count(*) from public.facility_spaces where facility_id = 'fac_app') = 2,
  'and can read their names');
select tests.ok(
  (public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot), 60) ->> 'price_php')::numeric = 600,
  'a booking made in the app is priced by the database');
select tests.ok(
  (select count(*) from public.space_bookings where user_id = auth.uid() and booked_for = 'Pia Player') = 1,
  'the booking is in the player''s name and visible to them');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '10 minutes', 60)$$,
  'INVALID_BOOKING_TIME', 'bookings start on the hour or half hour');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '2 hours', 45)$$,
  'INVALID_BOOKING_LENGTH', 'bookings are in half-hour steps');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '2 hours', 600)$$,
  'INVALID_BOOKING_LENGTH', 'a booking from the app is three hours at most');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', now() - interval '1 hour', 60)$$,
  'INVALID_BOOKING_TIME', 'a booking cannot be in the past');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '60 days', 60)$$,
  'INVALID_BOOKING_TIME', 'a booking is at most thirty days ahead');
select tests.reset_actor();

-- ------------------------------------------------------------------ someone else
select tests.act_as('0f000000-0000-0000-0000-0000000000a3');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot), 60)$$,
  'SPACE_ALREADY_BOOKED', 'a taken slot is refused');
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c002', (select at from slot) + interval '1 hour', 60)$$,
  'SPACE_LAYOUT_CONFLICT', 'half a court needs changeover time after the whole court');
select tests.ok(
  jsonb_array_length(public.court_availability('fac_app', (select day from slot)) #> '{courts,0,taken}') = 1
  and jsonb_array_length(public.court_availability('fac_app', (select day from slot)) #> '{courts,1,taken}') = 1,
  'availability shows the slot as taken on the court and on its other layout');
select tests.ok(
  public.court_availability('fac_app', (select day from slot))::text not like '%Pia%',
  'availability never says who booked');
select tests.ok(
  (select count(*) from public.space_bookings) = 0, 'one player cannot see another''s booking');
select tests.reset_actor();
create temporary table pia_booking on commit drop as select id from public.space_bookings where facility_id = 'fac_app';
grant select on pia_booking to authenticated;
select tests.act_as('0f000000-0000-0000-0000-0000000000a3');
select tests.throws(
  $$select public.cancel_court_booking((select id from pia_booking))$$,
  'BOOKING_NOT_CANCELLABLE', 'a player cannot cancel someone else''s booking');
select tests.reset_actor();

-- ------------------------------------------------------------------ limit and cancel
select tests.act_as('0f000000-0000-0000-0000-0000000000a2');
select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '1 day', 60);
select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '2 days', 60);
select tests.throws(
  $$select public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '3 days', 60)$$,
  'BOOKING_LIMIT_REACHED', 'a person holds three upcoming bookings at most');
select public.cancel_court_booking((select id from public.space_bookings where starts_at = (select at from slot)));
select tests.ok(
  (select status from public.space_bookings where starts_at = (select at from slot)) = 'CANCELLED',
  'a player cancels their own booking');
select tests.ok(
  (public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot) + interval '3 days', 90) ->> 'price_php')::numeric = 900,
  'cancelling frees a place under the limit');
select tests.reset_actor();

-- The freed slot can be taken by someone else.
select tests.act_as('0f000000-0000-0000-0000-0000000000a3');
select tests.ok(
  public.book_court('0f000000-0000-0000-0000-00000000c001', (select at from slot), 60) ? 'id',
  'a cancelled slot can be booked again');
select tests.reset_actor();

-- Staff see app bookings on the calendar like any other.
select tests.act_as('0f000000-0000-0000-0000-0000000000a1');
select tests.ok(
  (select count(*) from public.space_bookings where facility_id = 'fac_app' and note = 'Booked in the app') = 5,
  'the club sees every app booking');
select tests.reset_actor();

select tests.act_as_anon();
select tests.throws(
  $$select public.court_availability('fac_app', current_date)$$, 'permission denied',
  'signed-out visitors cannot query availability');
select tests.reset_actor();

rollback;
