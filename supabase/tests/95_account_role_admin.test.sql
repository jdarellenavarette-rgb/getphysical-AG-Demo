\set ON_ERROR_STOP on
begin;

-- Three people who signed up the normal way: by email (Google), by mobile number, and one more.
select tests.create_user('aa000000-0000-0000-0000-0000000000a1', 'Owner Olive');
select tests.create_user('aa000000-0000-0000-0000-0000000000a2', 'Coach Carlo');
select tests.create_user('aa000000-0000-0000-0000-0000000000a3', 'Staff Sam');
select tests.create_user('aa000000-0000-0000-0000-0000000000a4', 'Member Mia');
update auth.users set email = 'carlo@example.com' where id = 'aa000000-0000-0000-0000-0000000000a2';
update auth.users set phone = '639171230003' where id = 'aa000000-0000-0000-0000-0000000000a3';
update public.profiles set username = 'mia.moves' where id = 'aa000000-0000-0000-0000-0000000000a4';

-- The owner creates a venue the ordinary way and becomes its OWNER.
select tests.act_as('aa000000-0000-0000-0000-0000000000a1');
insert into public.facilities (id, owner_id, name, registry_type)
values ('fac_pioneer', auth.uid(), 'Pioneer Gym', 'COMMERCIAL');
select tests.reset_actor();
select tests.ok(
  (select role from public.facility_staff where facility_id = 'fac_pioneer'
      and user_id = 'aa000000-0000-0000-0000-0000000000a1') = 'OWNER',
  'creating a venue makes the creator its owner');

-- Nobody can grant themselves a role, and the apps cannot call the operator tools.
select tests.act_as('aa000000-0000-0000-0000-0000000000a4');
select tests.throws(
  $$update public.profiles set roles = array['individual','coach'] where id = auth.uid()$$,
  'permission denied', 'a member cannot write their own roles');
select tests.throws(
  $$select public.admin_grant_role('mia.moves', 'coach')$$,
  'permission denied', 'a signed-in user cannot call admin_grant_role');
select tests.throws(
  $$select public.admin_assign_staff('mia.moves', 'fac_pioneer')$$,
  'permission denied', 'a signed-in user cannot call admin_assign_staff');
select tests.throws(
  $$select * from public.admin_list_role_holders()$$,
  'permission denied', 'a signed-in user cannot list role holders');
select tests.reset_actor();
select tests.act_as_anon();
select tests.throws(
  $$select public.admin_grant_role('mia.moves', 'coach')$$,
  'permission denied', 'a signed-out visitor cannot call admin_grant_role');
select tests.reset_actor();

-- The operator grants roles, finding each person by what they signed up with.
select tests.act_as_service();

select tests.ok(
  (select 'coach' = any (roles) from public.admin_grant_role('Carlo@Example.com', 'coach')),
  'grant by email (case-insensitive) adds the coach role');
select tests.ok(
  (select array_length(roles, 1) from public.admin_grant_role('carlo@example.com', 'coach')) = 2,
  'granting the same role twice does not duplicate it');
select tests.ok(
  (select user_roles = roles from public.profiles where id = 'aa000000-0000-0000-0000-0000000000a2'),
  'both role columns are kept in step');

select tests.ok(
  (select 'organizer' = any (roles) from public.admin_grant_role('mia.moves', 'organizer')),
  'grant by username adds the organizer role');

select tests.ok(
  (select facility_role from public.admin_assign_staff('+63 917 123 0003', 'fac_pioneer')) = 'STAFF',
  'staff are found by mobile number written with a plus sign and spaces');
select tests.ok(
  (select 'staff' = any (roles) from public.admin_assign_staff('09171230003', 'fac_pioneer')),
  'the local 09… form finds the same person, and joining a team grants the staff role');
select tests.ok(
  (select count(*) from public.facility_staff where facility_id = 'fac_pioneer') = 2,
  'assigning twice keeps one staff row');

select tests.ok(
  (select facility_role from public.admin_assign_staff('carlo@example.com', 'fac_pioneer', 'COACH')) = 'COACH',
  'a coach can be attached to a venue');

-- Guard rails.
select tests.throws(
  $$select public.admin_grant_role('nobody@example.com', 'coach')$$,
  'USER_NOT_FOUND', 'an unknown person is reported, not silently ignored');
select tests.throws(
  $$select public.admin_grant_role('mia.moves', 'admin')$$,
  'INVALID_ROLE', 'only coach, organizer and staff can be granted');
select tests.throws(
  $$select public.admin_assign_staff('mia.moves', 'fac_missing')$$,
  'FACILITY_NOT_FOUND', 'an unknown venue is reported');
select tests.throws(
  $$select public.admin_assign_staff('mia.moves', 'fac_pioneer', 'OWNER')$$,
  'INVALID_ROLE', 'ownership cannot be handed out');
select public.admin_assign_staff('aa000000-0000-0000-0000-0000000000a1', 'fac_pioneer', 'STAFF');
select tests.ok(
  (select role from public.facility_staff where facility_id = 'fac_pioneer'
      and user_id = 'aa000000-0000-0000-0000-0000000000a1') = 'OWNER',
  'an owner is never demoted by a staff assignment');

select tests.ok(
  (select count(*) from public.admin_list_role_holders()
    where user_id::text like 'aa000000-%') = 4,
  'the role-holder list shows the owner, coach, staff and organizer');

-- Revoking.
update public.profiles set active_role = 'organizer' where id = 'aa000000-0000-0000-0000-0000000000a4';
select tests.ok(
  (select not ('organizer' = any (roles)) from public.admin_revoke_role('mia.moves', 'organizer')),
  'revoke removes the role');
select tests.ok(
  (select active_role from public.profiles where id = 'aa000000-0000-0000-0000-0000000000a4') = 'individual',
  'an account never keeps acting in a role it no longer holds');
select tests.reset_actor();

-- What the roles unlock for the people themselves.
select tests.act_as('aa000000-0000-0000-0000-0000000000a3');
select tests.ok(public.is_facility_staff('fac_pioneer'), 'the staff account is recognised as staff of its venue');
select tests.reset_actor();
select tests.act_as('aa000000-0000-0000-0000-0000000000a4');
select tests.ok(not public.is_facility_staff('fac_pioneer'), 'a regular member is not staff');
select tests.reset_actor();

rollback;
