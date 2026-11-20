\set ON_ERROR_STOP on
begin;

select tests.create_user('cc000000-0000-0000-0000-0000000000a1', 'Club Owner');
select tests.create_user('cc000000-0000-0000-0000-0000000000a2', 'Desk Staff');
select tests.create_user('cc000000-0000-0000-0000-0000000000a3', 'Maria Santos');
select tests.create_user('cc000000-0000-0000-0000-0000000000a4', 'Event Guest');
select tests.create_user('cc000000-0000-0000-0000-0000000000a5', 'Unconfirmed Person');
select tests.create_user('cc000000-0000-0000-0000-0000000000a6', 'Second Coach');
update auth.users set email = 'maria@example.test' where id = 'cc000000-0000-0000-0000-0000000000a3';
update auth.users set email = 'nobody@example.test', email_confirmed_at = null
 where id = 'cc000000-0000-0000-0000-0000000000a5';
update public.profiles set username = 'second.coach' where id = 'cc000000-0000-0000-0000-0000000000a6';

select tests.act_as('cc000000-0000-0000-0000-0000000000a1');
insert into public.facilities (id, owner_id, name, registry_type, category, business_kind)
values ('fac_contacts', auth.uid(), 'Contact Club', 'COMMUNITY', 'Sports club', 'CLUB'),
       ('fac_other', auth.uid(), 'Other Club', 'COMMUNITY', 'Sports club', 'CLUB');
select public.add_facility_staff('fac_contacts', 'second.coach', 'COACH');
insert into public.facility_staff (facility_id, user_id, role)
values ('fac_contacts', 'cc000000-0000-0000-0000-0000000000a2', 'STAFF');
select public.import_facility_members('fac_contacts',
  '[{"full_name":"Maria S.","email":"Maria@Example.test","plan_name":"Annual","expires_on":"2027-06-30"},
    {"full_name":"Nobody Yet","email":"nobody@example.test"},
    {"full_name":"Paper Only","phone":"0917 000 0000"}]'::jsonb);
select public.import_facility_members('fac_other', '[{"full_name":"Maria Elsewhere","email":"maria@example.test"}]'::jsonb);
select tests.ok(
  (select count(*) from public.facility_imported_members where user_id is not null) = 0,
  'an imported record is not matched to an account that has no tie to the business');
select tests.reset_actor();

-- ----------------------------------------------------------- desk contacts
select tests.act_as('cc000000-0000-0000-0000-0000000000a2');
insert into public.facility_imported_members (facility_id, full_name, phone, source)
values ('fac_contacts', 'Walk-in Wally', '0918 111 1111', 'DESK');
select tests.ok(true, 'front-desk staff add a walk-in');
select tests.throws(
  $$insert into public.facility_imported_members (facility_id, full_name, source)
    values ('fac_contacts', 'Fake Import', 'IMPORT')$$,
  'row-level security', 'front-desk staff cannot add records as an import');
select tests.reset_actor();

-- ------------------------------------------------------------------ linking
select tests.act_as('cc000000-0000-0000-0000-0000000000a3');
insert into public.facility_memberships (facility_id, user_id) values ('fac_contacts', auth.uid());
select tests.reset_actor();
select tests.ok(
  (select user_id = 'cc000000-0000-0000-0000-0000000000a3' and linked_at is not null
     from public.facility_imported_members where facility_id = 'fac_contacts' and full_name = 'Maria S.'),
  'joining with the same confirmed email links the imported record to the account');
select tests.ok(
  (select user_id is null from public.facility_imported_members where facility_id = 'fac_other'),
  'the same email at another business stays unlinked until she joins there');

select tests.act_as('cc000000-0000-0000-0000-0000000000a5');
insert into public.facility_memberships (facility_id, user_id) values ('fac_contacts', auth.uid());
select tests.reset_actor();
select tests.ok(
  (select user_id is null from public.facility_imported_members where full_name = 'Nobody Yet'),
  'an unconfirmed email never claims a record');

-- A contact added after the person already signed up to an event links at once.
insert into public.events (id, organizer_id, facility_id, title, starts_at)
values ('ce000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-0000000000a1', 'fac_contacts',
        'Open Play', now() + interval '3 days');
update auth.users set email = 'guest@example.test' where id = 'cc000000-0000-0000-0000-0000000000a4';
select tests.act_as('cc000000-0000-0000-0000-0000000000a4');
insert into public.event_registrations (event_id) values ('ce000000-0000-0000-0000-000000000001');
select tests.reset_actor();
select tests.act_as('cc000000-0000-0000-0000-0000000000a2');
insert into public.facility_imported_members (facility_id, full_name, email, source)
values ('fac_contacts', 'Guest G.', 'guest@example.test', 'DESK');
select tests.ok(
  (select user_id = 'cc000000-0000-0000-0000-0000000000a4' from public.facility_imported_members where full_name = 'Guest G.'),
  'a contact added later is matched to someone who already signed up to an event');

-- ---------------------------------------------------------------- bookings
select tests.reset_actor();
insert into public.facility_spaces (id, facility_id, name) values
  ('5c000000-0000-0000-0000-000000000001', 'fac_contacts', 'Court 1');
select tests.act_as('cc000000-0000-0000-0000-0000000000a2');
insert into public.space_bookings (facility_id, space_id, booked_for, contact_id, starts_at, ends_at)
select 'fac_contacts', '5c000000-0000-0000-0000-000000000001', c.full_name, c.id,
       now() + interval '1 day', now() + interval '1 day 1 hour'
  from public.facility_imported_members c where c.full_name = 'Walk-in Wally';
select tests.ok(
  (select count(*) from public.facility_imported_members where facility_id = 'fac_other') = 0,
  'staff cannot see another business''s contacts');
select tests.reset_actor();
select tests.act_as('cc000000-0000-0000-0000-0000000000a1');
select tests.throws(
  $$insert into public.space_bookings (facility_id, space_id, booked_for, contact_id, starts_at, ends_at)
    select 'fac_contacts', '5c000000-0000-0000-0000-000000000001', 'Wrong club', c.id,
           now() + interval '2 days', now() + interval '2 days 1 hour'
      from public.facility_imported_members c where c.facility_id = 'fac_other'$$,
  'INVALID_BOOKING_PERSON', 'a booking cannot point at another business''s contact');
insert into public.space_bookings (facility_id, space_id, booked_for, user_id, starts_at, ends_at)
values ('fac_contacts', '5c000000-0000-0000-0000-000000000001', 'Maria Santos', 'cc000000-0000-0000-0000-0000000000a3',
        now() + interval '4 days', now() + interval '4 days 1 hour');

-- ------------------------------------------------------------------ people
create temp table people as select * from public.facility_people('fac_contacts');
grant select on people to public;
select tests.ok((select count(*) from people) = 6, 'everyone the business knows is listed once');
select tests.ok(
  (select on_app and standing = 'ACTIVE' and plan_name = 'Annual' and bookings_count = 1 and contact_id is not null
     from people where user_id = 'cc000000-0000-0000-0000-0000000000a3'),
  'a member carries her imported plan and her booking on one row');
select tests.ok(
  (select on_app and standing is null and events_count = 1 and contact_id is not null
     from people where user_id = 'cc000000-0000-0000-0000-0000000000a4'),
  'an event sign-up who is not a member is listed with the event');
select tests.ok(
  (select not on_app and bookings_count = 1 and contact_source = 'DESK' from people where name = 'Walk-in Wally'),
  'a walk-in without an account is listed with their booking');
select tests.ok(
  (select count(*) from people where not on_app) = 3,
  'records that are not matched yet stay listed as not on the app');
select tests.reset_actor();

select tests.act_as('cc000000-0000-0000-0000-0000000000a4');
select tests.throws($$select * from public.facility_people('fac_contacts')$$, 'FORBIDDEN', 'only the team can read the list');
select tests.reset_actor();

-- ------------------------------------------------------ shared coach roster
select tests.act_as('cc000000-0000-0000-0000-0000000000a3');
insert into public.workouts_lift (title) values ('Leg day');
select tests.reset_actor();
insert into public.coach_clients (coach_id, client_id, status, invited_by)
values ('cc000000-0000-0000-0000-0000000000a6', 'cc000000-0000-0000-0000-0000000000a3', 'ACTIVE', 'cc000000-0000-0000-0000-0000000000a3');

select tests.act_as('cc000000-0000-0000-0000-0000000000a6');
select tests.ok(
  (select is_mine and workouts_7d = 1 from public.business_coach_roster('fac_contacts')),
  'a coach sees their own client''s training on the business roster');
select tests.reset_actor();
select tests.act_as('cc000000-0000-0000-0000-0000000000a1');
select tests.ok(
  (select not is_mine and coach_name = 'Second Coach' and workouts_7d is null and last_workout_at is null
     from public.business_coach_roster('fac_contacts')),
  'the owner sees who is coached by whom, without that client''s training');
select tests.reset_actor();
select tests.act_as('cc000000-0000-0000-0000-0000000000a4');
select tests.throws($$select * from public.business_coach_roster('fac_contacts')$$, 'FORBIDDEN', 'outsiders cannot read the roster');
select tests.reset_actor();

rollback;
