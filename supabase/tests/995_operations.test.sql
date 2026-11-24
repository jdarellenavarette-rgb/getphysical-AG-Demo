\set ON_ERROR_STOP on
begin;

select tests.create_user('0e000000-0000-0000-0000-0000000000a1', 'Owner Olive');
select tests.create_user('0e000000-0000-0000-0000-0000000000a2', 'Desk Dan');
select tests.create_user('0e000000-0000-0000-0000-0000000000a3', 'Maria Member');
select tests.create_user('0e000000-0000-0000-0000-0000000000a4', 'Eve Entrant');
select tests.create_user('0e000000-0000-0000-0000-0000000000a5', 'Sam Stranger');
select tests.create_user('0e000000-0000-0000-0000-0000000000a6', 'Mute Mike');

select tests.act_as('0e000000-0000-0000-0000-0000000000a1');
insert into public.facilities (id, owner_id, name, registry_type, category, business_kind)
values ('fac_ops', auth.uid(), 'Ops Club', 'COMMUNITY', 'Sports club', 'CLUB');
insert into public.facility_automations (facility_id, kind, enabled, body) values
  ('fac_ops', 'WELCOME', true, 'Welcome to {business}, {name}!'),
  ('fac_ops', 'EVENT_REMINDER', true, 'See you soon, {name}: {detail}.'),
  ('fac_ops', 'CLIENT_QUIET', false, 'Checking in, {name}.');
select tests.reset_actor();
insert into public.facility_staff (facility_id, user_id, role)
values ('fac_ops', '0e000000-0000-0000-0000-0000000000a2', 'STAFF');

-- ------------------------------------------------------------------ shifts
select tests.act_as('0e000000-0000-0000-0000-0000000000a2');
insert into public.desk_shifts (facility_id, opening_float) values ('fac_ops', 1000);
select tests.throws(
  $$insert into public.desk_shifts (facility_id, opening_float) values ('fac_ops', 500)$$,
  'desk_shifts_one_open', 'one person has one open shift at a time');
insert into public.desk_payments (facility_id, amount_php, method, kind, payer_name) values
  ('fac_ops', 300, 'CASH', 'OTHER', 'Walk-in'),
  ('fac_ops', 450, 'EWALLET', 'OTHER', 'GCash payer'),
  ('fac_ops', 200, 'CASH', 'OTHER', 'Mistake');
select tests.ok(
  (select count(*) from public.desk_payments where shift_id = (select id from public.desk_shifts)) = 3,
  'payments taken during a shift belong to it');
select tests.throws(
  $$update public.desk_shifts set counted_cash = 1$$, 'permission denied', 'a shift cannot be edited by hand');
select tests.reset_actor();

-- The owner reverses the mistake; the reversal lands in the same shift.
select tests.act_as('0e000000-0000-0000-0000-0000000000a1');
select public.reverse_desk_payment((select id from public.desk_payments where payer_name = 'Mistake' and reverses is null));
select tests.ok((select count(*) from public.desk_shifts) = 1, 'an owner sees the team''s shifts');
select tests.reset_actor();

select tests.act_as('0e000000-0000-0000-0000-0000000000a5');
select tests.ok((select count(*) from public.desk_shifts) = 0, 'outsiders see no shifts');
select tests.throws(
  $$select public.close_desk_shift((select id from public.desk_shifts limit 1), 0)$$, 'FORBIDDEN', 'nor close one');
select tests.reset_actor();

select tests.act_as('0e000000-0000-0000-0000-0000000000a2');
create temp table closed as select public.close_desk_shift((select id from public.desk_shifts), 1250, 'Short by fifty') as r;
grant select on closed to public;
select tests.ok(
  (select (r ->> 'expected')::numeric = 1300 and (r ->> 'difference')::numeric = -50 from closed),
  'closing compares the count with the float plus the cash taken; other methods and reversed entries do not count');
select tests.throws(
  $$select public.close_desk_shift((select id from public.desk_shifts), 1300)$$, 'SHIFT_CLOSED', 'a shift closes once');
insert into public.desk_payments (facility_id, amount_php, method, kind, payer_name) values ('fac_ops', 100, 'CASH', 'OTHER', 'After close');
select tests.ok(
  (select shift_id is null from public.desk_payments where payer_name = 'After close'),
  'a payment taken with no shift open belongs to none');
select tests.reset_actor();

-- --------------------------------------------------------- welcome on join
select tests.act_as('0e000000-0000-0000-0000-0000000000a3');
insert into public.facility_memberships (facility_id, user_id) values ('fac_ops', auth.uid());
select tests.ok(
  (select array_agg(body) from public.messages) = array['Welcome to Ops Club, Maria!'],
  'a new member gets the welcome message, with their name and the business filled in');
select tests.reset_actor();
insert into public.facility_memberships (facility_id, user_id, broadcasts_muted)
values ('fac_ops', '0e000000-0000-0000-0000-0000000000a6', true);

-- ------------------------------------------------------- messages to lists
insert into public.events (id, organizer_id, facility_id, title, starts_at)
values ('0e0e0000-0000-0000-0000-000000000001', '0e000000-0000-0000-0000-0000000000a1', 'fac_ops', 'Friday Open Play',
        now() + interval '5 hours');
select tests.act_as('0e000000-0000-0000-0000-0000000000a4');
insert into public.event_registrations (event_id) values ('0e0e0000-0000-0000-0000-000000000001');
select tests.reset_actor();

select tests.act_as('0e000000-0000-0000-0000-0000000000a2');
select tests.ok(
  public.message_people('fac_ops', array[
    '0e000000-0000-0000-0000-0000000000a3', '0e000000-0000-0000-0000-0000000000a4',
    '0e000000-0000-0000-0000-0000000000a5', '0e000000-0000-0000-0000-0000000000a6']::uuid[], 'Courts reopen at 4.') = 2,
  'a message to a list reaches a member and an event entrant, and skips a stranger and someone who muted the business');
select tests.ok(
  public.message_people('fac_ops', array['0e000000-0000-0000-0000-0000000000a6']::uuid[], 'About your booking.') = 1,
  'a message to one person is delivered even if they muted broadcasts');
select tests.throws(
  $$select public.message_people('fac_ops', array[]::uuid[], 'Nobody')$$, 'INVALID_RECIPIENTS', 'someone must be chosen');
select tests.reset_actor();
select tests.act_as('0e000000-0000-0000-0000-0000000000a5');
select tests.throws(
  $$select public.message_people('fac_ops', array['0e000000-0000-0000-0000-0000000000a3']::uuid[], 'Spam')$$,
  'FORBIDDEN', 'only the team can write as the business');
select tests.ok((select count(*) from public.messages) = 0, 'a stranger received nothing');
select tests.reset_actor();
select tests.act_as('0e000000-0000-0000-0000-0000000000a4');
select tests.ok(
  (select array_agg(body) from public.messages) = array['Courts reopen at 4.'],
  'the entrant can read the message in their thread with the business');
select tests.reset_actor();

-- ------------------------------------------------------------- automations
select tests.act_as('0e000000-0000-0000-0000-0000000000a2');
select tests.ok(public.run_automations('fac_ops') = 1, 'the event reminder goes to the one person signed up');
select tests.ok(public.run_automations('fac_ops') = 0, 'running again sends nothing twice');
update public.facility_automations set enabled = false where facility_id = 'fac_ops';
select tests.ok(
  (select count(*) from public.facility_automations where facility_id = 'fac_ops' and enabled) = 2,
  'front-desk staff cannot change automations');
select tests.reset_actor();
select tests.act_as('0e000000-0000-0000-0000-0000000000a4');
select tests.ok(
  (select count(*) from public.messages where body like 'See you soon, Eve: Friday Open Play,%') = 1,
  'the reminder names the event and when it starts');
select tests.throws($$select public.run_automations('fac_ops')$$, 'FORBIDDEN', 'only the team can run automations');
select tests.throws($$select public.run_all_automations()$$, 'permission denied', 'the scheduler entry point is not open to people');
select tests.reset_actor();
select tests.act_as_service();
select tests.ok(public.run_all_automations() = 0, 'the scheduler can run every business''s automations');
select tests.reset_actor();

-- ---------------------------------------------------------- training plans
insert into public.coach_clients (coach_id, client_id, status, invited_by)
values ('0e000000-0000-0000-0000-0000000000a1', '0e000000-0000-0000-0000-0000000000a3', 'ACTIVE', '0e000000-0000-0000-0000-0000000000a3');
select tests.act_as('0e000000-0000-0000-0000-0000000000a1');
insert into public.coach_plans (client_id, title, days)
values ('0e000000-0000-0000-0000-0000000000a3', 'Strength base', '[{"weekday":1,"focus":"Lower"},{"weekday":4,"focus":"Upper"}]');
select tests.throws(
  $$insert into public.coach_plans (client_id, title, days)
    values ('0e000000-0000-0000-0000-0000000000a3', 'Second plan', '[{"weekday":2,"focus":"Run"}]')$$,
  'coach_plans_one_current', 'a client has one current plan per coach');
select tests.throws(
  $$insert into public.coach_plans (client_id, title, days)
    values ('0e000000-0000-0000-0000-0000000000a5', 'Stranger plan', '[{"weekday":2,"focus":"Run"}]')$$,
  'NOT_A_CLIENT', 'a plan can only be written for someone on the coach''s list');
update public.coach_plans set ended_at = now() where title = 'Strength base';
insert into public.coach_plans (client_id, title, days)
values ('0e000000-0000-0000-0000-0000000000a3', 'Next block', '[{"weekday":2,"focus":"Run"}]');
select tests.ok(true, 'ending a plan makes room for the next');
select tests.reset_actor();
select tests.act_as('0e000000-0000-0000-0000-0000000000a3');
select tests.ok((select count(*) from public.coach_plans) = 2, 'the client can read their plans');
update public.coach_plans set ended_at = now();
select tests.reset_actor();
select tests.ok((select count(*) from public.coach_plans where ended_at is null) = 1, 'but not change them');
select tests.act_as('0e000000-0000-0000-0000-0000000000a3');
select tests.reset_actor();

-- ---------------------------------------------------------------- brackets
select tests.act_as('0e000000-0000-0000-0000-0000000000a2');
update public.events set bracket = '{"format":"SINGLE_ELIMINATION","rounds":[]}' where id = '0e0e0000-0000-0000-0000-000000000001';
select tests.throws(
  $$update public.events set bracket = '[1,2]' where id = '0e0e0000-0000-0000-0000-000000000001'$$,
  'events_bracket_check', 'a bracket must be an object');
select tests.reset_actor();
select tests.act_as_anon();
select tests.ok(
  (select bracket ->> 'format' from public.events where id = '0e0e0000-0000-0000-0000-000000000001') = 'SINGLE_ELIMINATION',
  'the bracket of a published event is public');
select tests.ok(
  (select count(*) from public.class_sessions) >= 0 and (select count(*) from public.business_posts) >= 0,
  'signed-out visitors can read public timetables and posts without an error');
select tests.reset_actor();

rollback;
