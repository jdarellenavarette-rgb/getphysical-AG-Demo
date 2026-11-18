\set ON_ERROR_STOP on
begin;

select tests.create_user('ee000000-0000-0000-0000-0000000000a1', 'Venue Owner');
select tests.create_user('ee000000-0000-0000-0000-0000000000a2', 'Front Desk');
select tests.create_user('ee000000-0000-0000-0000-0000000000a3', 'Athlete One');
select tests.create_user('ee000000-0000-0000-0000-0000000000a4', 'Outsider');
update public.profiles set username = 'frontdesk' where id = 'ee000000-0000-0000-0000-0000000000a2';
update public.profiles set username = 'athlete.one' where id = 'ee000000-0000-0000-0000-0000000000a3';

select tests.act_as('ee000000-0000-0000-0000-0000000000a1');
insert into public.facilities (id, owner_id, name, registry_type, category)
values ('fac_e2e', auth.uid(), 'Court House', 'COMMUNITY', 'Sports club');

-- ------------------------------------------------------------------- team
select tests.ok(
  (public.add_facility_staff('fac_e2e', '@frontdesk', 'STAFF') ->> 'role') = 'STAFF',
  'an owner adds a team member by username');
select tests.throws($$select public.add_facility_staff('fac_e2e', 'nobody.here', 'STAFF')$$,
  'USER_NOT_FOUND', 'an unknown username is reported');
select tests.throws($$select public.add_facility_staff('fac_e2e', 'frontdesk', 'OWNER')$$,
  'INVALID_ROLE', 'ownership cannot be handed out');
select tests.ok(
  (select business_kind from public.facilities where id = 'fac_e2e') = 'CLUB',
  'a business created without a kind gets one from its registry and category');
select tests.throws(
  $$insert into public.facilities (id, owner_id, name, registry_type, category, business_kind)
    values ('fac_bad', auth.uid(), 'Mismatch', 'COMMERCIAL', 'Gym', 'COACH')$$,
  'facilities_kind_matches_registry', 'a kind must match its registry');
insert into public.facilities (id, owner_id, name, registry_type, category, business_kind, lat, lng)
values ('fac_coach', auth.uid(), 'Coach Profile', 'COMMUNITY', 'Coaching', 'COACH', 14.55, 121.02);
update public.facilities set lat = 14.55, lng = 121.02 where id = 'fac_e2e';
select tests.ok(
  (select array_agg(id order by id) from public.facilities_nearby(14.55, 121.02, 1) where id in ('fac_e2e', 'fac_coach'))
  = array['fac_e2e'],
  'Discover lists the club and leaves the coaching business out');
select tests.ok((select count(*) from public.facility_team('fac_e2e')) = 2, 'the team lists the owner and the new member');
select tests.reset_actor();

select tests.ok(
  (select 'staff' = any (roles) from public.profiles where id = 'ee000000-0000-0000-0000-0000000000a2'),
  'the new team member gets the staff account role the app reads');

select tests.act_as('ee000000-0000-0000-0000-0000000000a2');
select tests.throws($$select public.add_facility_staff('fac_e2e', 'athlete.one', 'STAFF')$$,
  'FORBIDDEN', 'front-desk staff cannot add team members');
select tests.throws(
  $$select public.remove_facility_staff('fac_e2e', 'ee000000-0000-0000-0000-0000000000a1')$$,
  'FORBIDDEN', 'front-desk staff cannot remove anyone');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a4');
select tests.throws($$select * from public.facility_team('fac_e2e')$$, 'FORBIDDEN', 'outsiders cannot read the team');
select tests.reset_actor();

-- ----------------------------------------------------------------- events
insert into public.events (id, organizer_id, facility_id, title, starts_at, capacity)
values ('e0e00000-0000-0000-0000-000000000001', 'ee000000-0000-0000-0000-0000000000a2', 'fac_e2e', 'Friday Open Play',
        now() + interval '2 days', 1);

select tests.act_as('ee000000-0000-0000-0000-0000000000a3');
insert into public.event_registrations (event_id) values ('e0e00000-0000-0000-0000-000000000001');
select tests.throws(
  $$select public.set_event_attendance('e0e00000-0000-0000-0000-000000000001', auth.uid(), true)$$,
  'FORBIDDEN', 'an attendee cannot mark themselves present');
select tests.throws($$select * from public.event_roster('e0e00000-0000-0000-0000-000000000001')$$,
  'FORBIDDEN', 'an attendee cannot read the roster');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a1');
select tests.ok(
  (select registered from public.facility_events('fac_e2e')) = 1,
  'the venue sees how many people registered');
select tests.ok(
  public.set_event_attendance('e0e00000-0000-0000-0000-000000000001', 'ee000000-0000-0000-0000-0000000000a3', true) is not null,
  'staff mark an attendee present');
select tests.ok(
  (select checked_in from public.facility_events('fac_e2e')) = 1
  and (select checked_in_at is not null from public.event_roster('e0e00000-0000-0000-0000-000000000001')),
  'attendance shows on the roster and the event summary');
select tests.ok(
  public.set_event_attendance('e0e00000-0000-0000-0000-000000000001', 'ee000000-0000-0000-0000-0000000000a3', false) is null,
  'attendance can be undone');
select tests.throws(
  $$select public.set_event_attendance('e0e00000-0000-0000-0000-000000000001', 'ee000000-0000-0000-0000-0000000000a4', true)$$,
  'REGISTRATION_NOT_FOUND', 'only registered people can be marked present');
select tests.reset_actor();

-- ------------------------------------------------------------------ coach
select tests.act_as('ee000000-0000-0000-0000-0000000000a3');
insert into public.workouts_lift (title) values ('Leg day');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a1');
select tests.ok((public.invite_coach_client('athlete.one') ->> 'status') = 'PENDING', 'a coach invites a client by username');
select tests.throws($$select public.invite_coach_client('frontdesk.typo')$$, 'USER_NOT_FOUND', 'an unknown client is reported');
select tests.ok((select count(*) from public.workouts_lift) = 0, 'an invitation alone does not open training logs');
select tests.ok(
  (select awaiting = 'CLIENT' and last_workout_at is null from public.coach_roster()),
  'the roster shows the invitation without training data');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a4');
select tests.throws(
  $$select public.respond_coach_invite('ee000000-0000-0000-0000-0000000000a1', true)$$,
  'INVITE_NOT_FOUND', 'only the invited person can accept');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a3');
select tests.ok(public.respond_coach_invite('ee000000-0000-0000-0000-0000000000a1', true) = 'ACTIVE', 'the client accepts');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a1');
select tests.ok(
  (select status = 'ACTIVE' and workouts_7d = 1 and last_workout_at is not null from public.coach_roster()),
  'after acceptance the coach sees how recently the client trained');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a3');
update public.coach_clients set status = 'CANCELLED' where client_id = auth.uid();
select tests.reset_actor();
select tests.act_as('ee000000-0000-0000-0000-0000000000a1');
select tests.throws(
  $$update public.coach_clients set status = 'ACTIVE' where client_id = 'ee000000-0000-0000-0000-0000000000a3'$$,
  'COACH_LINK_NEEDS_CONSENT', 'a coach cannot reopen a link the client ended');
update public.coach_clients set status = 'PENDING' where client_id = 'ee000000-0000-0000-0000-0000000000a3';
select tests.throws(
  $$update public.coach_clients set status = 'ACTIVE' where client_id = 'ee000000-0000-0000-0000-0000000000a3'$$,
  'COACH_LINK_NEEDS_CONSENT', 'nor by re-inviting and accepting on the client''s behalf');
select tests.reset_actor();

-- ----------------------------------------------------------------- import
select tests.act_as('ee000000-0000-0000-0000-0000000000a1');
insert into public.facility_imported_members (facility_id, full_name, email, plan_name, expires_on)
values ('fac_e2e', 'Maria Santos', 'maria@example.test', 'Monthly', current_date + 20);
select tests.throws(
  $$insert into public.facility_imported_members (facility_id, full_name, email)
    values ('fac_e2e', 'MARIA SANTOS', 'Maria@Example.test')$$,
  'duplicate key', 'the same person is not imported twice');
select tests.ok(
  public.import_facility_members('fac_e2e',
    '[{"full_name":"Maria Santos","email":"maria@example.test"},{"full_name":" Jun Cruz ","phone":"09171234567","expires_on":"2027-01-31"}]'::jsonb) = 1,
  'a bulk import adds new people and skips those already there');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a2');
select tests.ok((select count(*) from public.facility_imported_members) = 2, 'staff can read imported records');
select tests.throws(
  $$select public.import_facility_members('fac_e2e', '[{"full_name":"Sneaky Bulk"}]'::jsonb)$$,
  'row-level security', 'a bulk import follows the same rule');
select tests.throws(
  $$insert into public.facility_imported_members (facility_id, full_name) values ('fac_e2e', 'Sneaky Row')$$,
  'row-level security', 'only owners and admins import');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a4');
select tests.ok((select count(*) from public.facility_imported_members) = 0, 'outsiders see no imported records');
select tests.reset_actor();

-- --------------------------------------------------------------- bookings
insert into public.facility_spaces (id, facility_id, name, sport) values
  ('5a000000-0000-0000-0000-000000000001', 'fac_e2e', 'Main Court', 'Basketball');
insert into public.facility_spaces (id, facility_id, parent_id, name, sport) values
  ('5a000000-0000-0000-0000-00000000000a', 'fac_e2e', '5a000000-0000-0000-0000-000000000001', 'Pickleball A', 'Pickleball'),
  ('5a000000-0000-0000-0000-00000000000b', 'fac_e2e', '5a000000-0000-0000-0000-000000000001', 'Pickleball B', 'Pickleball');
insert into public.space_bookings (id, facility_id, space_id, booked_for, starts_at, ends_at) values
  ('b0000000-0000-0000-0000-000000000001', 'fac_e2e', '5a000000-0000-0000-0000-00000000000a', 'Reyes family',
   date_trunc('day', now()) + interval '2 days 10 hours', date_trunc('day', now()) + interval '2 days 11 hours');

select tests.act_as('ee000000-0000-0000-0000-0000000000a1');
insert into public.facility_spaces (facility_id, name, sport) values ('fac_e2e', 'Court 2', 'Badminton');
select tests.ok(true, 'an owner adds a court');
select tests.throws(
  $$insert into public.facility_spaces (facility_id, parent_id, name)
    values ('fac_e2e', '5a000000-0000-0000-0000-00000000000a', 'Too deep')$$,
  'INVALID_PARENT_SPACE', 'a divided court cannot be divided again');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a2');
insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
  ('fac_e2e', '5a000000-0000-0000-0000-00000000000b', 'Tuesday ladder',
   date_trunc('day', now()) + interval '2 days 10 hours', date_trunc('day', now()) + interval '2 days 11 hours');
select tests.ok(true, 'two parts of a court can be booked at the same time');
select tests.throws(
  $$insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
    ('fac_e2e', '5a000000-0000-0000-0000-00000000000a', 'Double', date_trunc('day', now()) + interval '2 days 10 hours 30 minutes',
     date_trunc('day', now()) + interval '2 days 11 hours 30 minutes')$$,
  'SPACE_ALREADY_BOOKED', 'the same court cannot be booked twice');
select tests.throws(
  $$insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
    ('fac_e2e', '5a000000-0000-0000-0000-000000000001', 'League game', date_trunc('day', now()) + interval '2 days 10 hours',
     date_trunc('day', now()) + interval '2 days 12 hours')$$,
  'SPACE_LAYOUT_CONFLICT', 'the whole court is blocked while a part is in use');
select tests.throws(
  $$insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
    ('fac_e2e', '5a000000-0000-0000-0000-000000000001', 'League game', date_trunc('day', now()) + interval '2 days 11 hours',
     date_trunc('day', now()) + interval '2 days 12 hours')$$,
  'SPACE_LAYOUT_CONFLICT', 'changing layout needs 15 minutes');
insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
  ('fac_e2e', '5a000000-0000-0000-0000-000000000001', 'League game', date_trunc('day', now()) + interval '2 days 11 hours 15 minutes',
   date_trunc('day', now()) + interval '2 days 12 hours 15 minutes');
select tests.ok(true, 'the whole court can be booked after the changeover');
insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
  ('fac_e2e', '5a000000-0000-0000-0000-00000000000a', 'Back to back', date_trunc('day', now()) + interval '2 days 9 hours',
   date_trunc('day', now()) + interval '2 days 10 hours');
select tests.ok(true, 'back-to-back bookings on the same court need no gap');
update public.space_bookings set status = 'CANCELLED' where id = 'b0000000-0000-0000-0000-000000000001';
insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
  ('fac_e2e', '5a000000-0000-0000-0000-00000000000a', 'Replacement', date_trunc('day', now()) + interval '2 days 10 hours',
   date_trunc('day', now()) + interval '2 days 11 hours');
select tests.ok(true, 'a cancelled booking frees the slot');
select tests.throws(
  $$insert into public.facility_spaces (facility_id, name) values ('fac_e2e', 'Staff-made court')$$,
  'row-level security', 'only owners and admins add courts');
select tests.reset_actor();

select tests.act_as('ee000000-0000-0000-0000-0000000000a4');
select tests.ok((select count(*) from public.space_bookings) = 0, 'outsiders see no bookings');
select tests.throws(
  $$insert into public.space_bookings (facility_id, space_id, booked_for, starts_at, ends_at) values
    ('fac_e2e', '5a000000-0000-0000-0000-00000000000b', 'Gatecrasher', now() + interval '5 days', now() + interval '5 days 1 hour')$$,
  'row-level security', 'outsiders cannot book');
select tests.reset_actor();

rollback;
