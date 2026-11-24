\set ON_ERROR_STOP on
begin;

select tests.create_user('dd100000-0000-0000-0000-0000000000a1', 'Owner');
select tests.create_user('dd100000-0000-0000-0000-0000000000a2', 'Desk');
select tests.create_user('dd100000-0000-0000-0000-0000000000a3', 'Ana');
select tests.create_user('dd100000-0000-0000-0000-0000000000a4', 'Ben');
select tests.create_user('dd100000-0000-0000-0000-0000000000a5', 'Cara');
select tests.create_user('dd100000-0000-0000-0000-0000000000a6', 'Outsider');

select tests.act_as('dd100000-0000-0000-0000-0000000000a1');
insert into public.facilities (id, owner_id, name, registry_type, category, business_kind)
values ('fac_depth', auth.uid(), 'Depth Club', 'COMMUNITY', 'Sports club', 'CLUB');
update public.facilities set peak_start_hour = 17, peak_end_hour = 21 where id = 'fac_depth';
select tests.throws(
  $$update public.facilities set peak_start_hour = 20, peak_end_hour = 18 where id = 'fac_depth'$$,
  'facilities_peak_window', 'peak hours must end after they start');
select tests.reset_actor();
insert into public.facility_staff (facility_id, user_id, role)
values ('fac_depth', 'dd100000-0000-0000-0000-0000000000a2', 'STAFF');
insert into public.facility_spaces (id, facility_id, name, rate_php, peak_rate_php) values
  ('5d000000-0000-0000-0000-000000000001', 'fac_depth', 'Court 1', 300, 450),
  ('5d000000-0000-0000-0000-000000000002', 'fac_depth', 'Court 2', null, null);

-- ------------------------------------------------------------ court prices
select tests.act_as('dd100000-0000-0000-0000-0000000000a2');
insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
  ('fac_depth', '5d000000-0000-0000-0000-000000000001', 'Morning',
   (current_date + 3 + time '09:00') at time zone 'Asia/Manila', (current_date + 3 + time '10:30') at time zone 'Asia/Manila'),
  ('fac_depth', '5d000000-0000-0000-0000-000000000001', 'Evening',
   (current_date + 3 + time '18:00') at time zone 'Asia/Manila', (current_date + 3 + time '19:00') at time zone 'Asia/Manila'),
  ('fac_depth', '5d000000-0000-0000-0000-000000000002', 'Free court',
   (current_date + 3 + time '09:00') at time zone 'Asia/Manila', (current_date + 3 + time '10:00') at time zone 'Asia/Manila');
select tests.ok(
  (select array_agg(coalesce(price_php::text, 'none') order by booked_for) from public.space_bookings where facility_id = 'fac_depth')
  = array['450.00', 'none', '450.00'],
  'a booking is priced by its length and the court''s rate, at the peak rate in peak hours; no rate means no price');
-- Moving the morning booking into the evening reprices it.
update public.space_bookings
   set starts_at = (current_date + 3 + time '19:30') at time zone 'Asia/Manila',
       ends_at = (current_date + 3 + time '20:30') at time zone 'Asia/Manila'
 where booked_for = 'Morning';
select tests.ok(
  (select price_php = 450 from public.space_bookings where booked_for = 'Morning'),
  'moving a booking into peak hours reprices it');
select tests.throws(
  $$update public.space_bookings set starts_at = (current_date + 3 + time '18:30') at time zone 'Asia/Manila',
           ends_at = (current_date + 3 + time '19:30') at time zone 'Asia/Manila' where booked_for = 'Morning'$$,
  'SPACE_ALREADY_BOOKED', 'a booking cannot be moved onto another one');
select tests.throws(
  $$update public.space_bookings set price_php = 1 where booked_for = 'Evening'$$,
  'permission denied', 'nobody can type in their own price');

-- ----------------------------------------------------------- desk payments
insert into public.desk_payments (facility_id, amount_php, method, kind, ref_id, payer_name)
select 'fac_depth', 450, 'CASH', 'BOOKING', id, 'Evening' from public.space_bookings where booked_for = 'Evening';
select tests.ok(
  (select paid_php = 450 from public.desk_paid('fac_depth', 'BOOKING')),
  'front-desk staff record a cash payment against a booking');
select tests.throws(
  $$insert into public.desk_payments (facility_id, amount_php, method, kind) values ('fac_depth', -50, 'CASH', 'OTHER')$$,
  'row-level security', 'a negative amount cannot be entered by hand');
select tests.throws(
  $$update public.desk_payments set amount_php = 1$$, 'permission denied', 'a payment cannot be edited');
select tests.throws(
  $$delete from public.desk_payments$$, 'permission denied', 'a payment cannot be deleted');
select tests.throws(
  $$select public.reverse_desk_payment((select id from public.desk_payments limit 1))$$,
  'FORBIDDEN', 'front-desk staff cannot reverse a payment');
select tests.reset_actor();

select tests.act_as('dd100000-0000-0000-0000-0000000000a1');
select public.reverse_desk_payment((select id from public.desk_payments where reverses is null limit 1));
select tests.ok(
  (select count(*) from public.desk_payments where facility_id = 'fac_depth') = 2
  and (select sum(amount_php) from public.desk_payments where facility_id = 'fac_depth') = 0
  and (select count(*) from public.desk_paid('fac_depth', 'BOOKING')) = 0,
  'an owner reverses it with a second entry; the first one stays on the record');
select tests.throws(
  $$select public.reverse_desk_payment((select id from public.desk_payments where reverses is null limit 1))$$,
  'ALREADY_REVERSED', 'a payment is reversed only once');
select tests.reset_actor();

select tests.act_as('dd100000-0000-0000-0000-0000000000a6');
select tests.ok((select count(*) from public.desk_payments) = 0, 'outsiders see no payments');
select tests.throws($$select * from public.desk_paid('fac_depth', 'BOOKING')$$, 'FORBIDDEN', 'nor the totals');
select tests.reset_actor();

-- ------------------------------------------------------------------ events
insert into public.events (id, organizer_id, facility_id, title, starts_at, entry_fee_php, categories)
values ('de000000-0000-0000-0000-000000000001', 'dd100000-0000-0000-0000-0000000000a1', 'fac_depth', 'Club Open',
        now() + interval '5 days', 350, array['Beginner', 'Open']);
select tests.act_as('dd100000-0000-0000-0000-0000000000a3');
insert into public.event_registrations (event_id, category) values ('de000000-0000-0000-0000-000000000001', 'Open');
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a4');
select tests.throws(
  $$insert into public.event_registrations (event_id, category) values ('de000000-0000-0000-0000-000000000001', 'Masters')$$,
  'INVALID_CATEGORY', 'an entrant can only choose a category the event offers');
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a1');
select tests.ok(
  (select entry_fee_php = 350 and categories = array['Beginner', 'Open'] and registered = 1 from public.facility_events('fac_depth'))
  and (select category = 'Open' from public.event_roster('de000000-0000-0000-0000-000000000001')),
  'the event carries its fee and categories, and the roster shows each entrant''s category');
select tests.reset_actor();

-- ------------------------------------------------------------ session packs
insert into public.coach_clients (coach_id, client_id, status, invited_by)
values ('dd100000-0000-0000-0000-0000000000a1', 'dd100000-0000-0000-0000-0000000000a3', 'ACTIVE', 'dd100000-0000-0000-0000-0000000000a3');
select tests.act_as('dd100000-0000-0000-0000-0000000000a1');
insert into public.coach_packs (client_id, facility_id, name, sessions_total, price_php)
values ('dd100000-0000-0000-0000-0000000000a3', 'fac_depth', 'Starter', 2, 3000);
select tests.throws(
  $$insert into public.coach_packs (client_id, name, sessions_total) values ('dd100000-0000-0000-0000-0000000000a6', 'Stranger pack', 5)$$,
  'NOT_A_CLIENT', 'a pack can only be sold to someone on the coach''s list');
insert into public.coach_sessions (pack_id) select id from public.coach_packs;
insert into public.coach_sessions (pack_id) select id from public.coach_packs;
select tests.throws(
  $$insert into public.coach_sessions (pack_id) select id from public.coach_packs$$,
  'PACK_USED_UP', 'a pack cannot be overdrawn');
delete from public.coach_sessions where id = (select id from public.coach_sessions order by created_at desc, id limit 1);
select tests.ok(
  (select count(*) from public.coach_sessions) = 1, 'a session logged by mistake can be removed');
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a3');
select tests.ok(
  (select count(*) from public.coach_packs) = 1 and (select count(*) from public.coach_sessions) = 1,
  'the client sees their own pack and sessions');
select tests.throws(
  $$insert into public.coach_sessions (pack_id) select id from public.coach_packs$$,
  'row-level security', 'a client cannot log sessions');
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a6');
select tests.ok((select count(*) from public.coach_packs) = 0, 'nobody else sees the pack');
select tests.reset_actor();

-- ----------------------------------------------------------------- classes
select tests.act_as('dd100000-0000-0000-0000-0000000000a2');
insert into public.class_sessions (facility_id, title, instructor, starts_at, ends_at, capacity)
values ('fac_depth', 'Spin', 'Coach Jo', now() + interval '2 days', now() + interval '2 days 1 hour', 2);
select tests.reset_actor();
create temp table spin as select id from public.class_sessions where title = 'Spin';
grant select on spin to public;

select tests.act_as_anon();
select tests.ok(
  (select count(*) from public.facility_classes('fac_depth', now(), now() + interval '7 days')) = 1,
  'the timetable is public');
select tests.reset_actor();

select tests.act_as('dd100000-0000-0000-0000-0000000000a3');
select tests.ok(public.book_class((select id from spin)) = 'BOOKED', 'a member books a place');
select tests.throws($$select public.book_class((select id from spin))$$, 'ALREADY_BOOKED', 'but only one');
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a2');
select tests.ok(
  public.staff_book_class((select id from spin), 'Walk-in Wendy') = 'BOOKED',
  'staff book a walk-in by name, taking the last place');
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a4');
select tests.ok(public.book_class((select id from spin)) = 'WAITLIST', 'the next person joins the waitlist');
select tests.ok((select count(*) from public.class_bookings) = 1, 'a member sees only their own booking');
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a5');
select tests.throws(
  $$select public.cancel_class_booking((select id from public.class_bookings limit 1))$$,
  'FORBIDDEN', 'nobody can cancel someone else''s place');
select tests.throws(
  $$insert into public.class_bookings (session_id, facility_id, booked_name) select id, 'fac_depth', 'Sneak' from spin$$,
  'permission denied', 'places cannot be taken around the booking rules');
select tests.reset_actor();

select tests.act_as('dd100000-0000-0000-0000-0000000000a3');
select public.cancel_class_booking((select id from public.class_bookings where user_id = auth.uid()));
select tests.reset_actor();
select tests.ok(
  (select status = 'BOOKED' from public.class_bookings where user_id = 'dd100000-0000-0000-0000-0000000000a4'),
  'when a place is given up, the first person waiting gets it');
select tests.act_as('dd100000-0000-0000-0000-0000000000a2');
select public.set_class_attendance((select id from public.class_bookings where booked_name = 'Walk-in Wendy'), true);
select tests.ok(
  (select booked = 2 and waitlist = 0 and attended = 1
     from public.facility_classes('fac_depth', now(), now() + interval '7 days')),
  'the class shows how full it is and who turned up');
update public.class_sessions set status = 'CANCELLED' where id = (select id from spin);
select tests.reset_actor();
select tests.act_as('dd100000-0000-0000-0000-0000000000a5');
select tests.throws($$select public.book_class((select id from spin))$$, 'CLASS_CLOSED', 'a cancelled class takes no bookings');
select tests.reset_actor();

rollback;
