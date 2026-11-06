\set ON_ERROR_STOP on
begin;

select tests.create_user('a0000000-0000-0000-0000-00000000000a', 'Owner A');
select tests.create_user('b0000000-0000-0000-0000-00000000000b', 'Owner B');
select tests.create_user('50000000-0000-0000-0000-000000000005', 'Staff S');
select tests.create_user('11111111-1111-1111-1111-111111111111', 'Athlete One');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'Athlete Two');

-- ---------------------------------------------------------------- facilities
select tests.act_as('a0000000-0000-0000-0000-00000000000a');
insert into public.facilities (id, owner_id, name, registry_type)
values ('fac_a', 'a0000000-0000-0000-0000-00000000000a', 'Gym A', 'COMMERCIAL');
select tests.ok(public.is_facility_admin('fac_a'), 'creator becomes OWNER/admin of their facility');
select tests.throws(
  $$insert into public.facilities (id, owner_id, name, registry_type)
    values ('fac_spoof', 'b0000000-0000-0000-0000-00000000000b', 'Spoof', 'COMMERCIAL')$$,
  'row-level security', 'cannot create a facility owned by someone else');
select tests.throws($$update public.facilities set plan = 'PRO' where id = 'fac_a'$$,
  'permission denied', 'admins cannot self-upgrade the plan');
select tests.throws($$update public.facilities set registry_type = 'COMMUNITY' where id = 'fac_a'$$,
  'permission denied', 'admins cannot switch registry');
select tests.reset_actor();

select tests.act_as('b0000000-0000-0000-0000-00000000000b');
insert into public.facilities (id, owner_id, name, registry_type)
values ('fac_b', 'b0000000-0000-0000-0000-00000000000b', 'Club B', 'COMMUNITY');
with u as (update public.facilities set name = 'Hijacked' where id = 'fac_a' returning 1)
select tests.ok((select count(*) from u) = 0, 'tenant B cannot modify tenant A facility');
select tests.ok(not public.is_facility_staff('fac_a'), 'tenant B is not staff of tenant A');
select tests.reset_actor();

-- ---------------------------------------------------------------- staff roster
select tests.act_as('a0000000-0000-0000-0000-00000000000a');
insert into public.facility_staff (facility_id, user_id, role)
values ('fac_a', '50000000-0000-0000-0000-000000000005', 'STAFF');
select tests.throws(
  $$insert into public.facility_staff (facility_id, user_id, role)
    values ('fac_a', '11111111-1111-1111-1111-111111111111', 'OWNER')$$,
  'row-level security', 'admins cannot mint additional OWNERs');
select tests.reset_actor();

select tests.act_as('50000000-0000-0000-0000-000000000005');
select tests.ok(public.is_facility_staff('fac_a'), 'staff membership recognised');
select tests.ok(not public.is_facility_admin('fac_a'), 'STAFF is not an admin');
select tests.throws(
  $$insert into public.facility_staff (facility_id, user_id, role)
    values ('fac_a', '11111111-1111-1111-1111-111111111111', 'STAFF')$$,
  'row-level security', 'plain staff cannot add staff');
select tests.reset_actor();

select tests.act_as('b0000000-0000-0000-0000-00000000000b');
select tests.ok((select count(*) from public.facility_staff where facility_id = 'fac_a') = 0,
  'tenant B cannot list tenant A staff');
select tests.reset_actor();

-- ---------------------------------------------------------------- anon
select tests.act_as_anon();
select tests.ok((select count(*) from public.facilities) >= 2, 'anon can browse the facility directory');
select tests.throws($$select id from public.profiles$$, 'permission denied', 'anon cannot read profiles');
select tests.throws($$select id from public.ledger_transactions$$, 'permission denied', 'anon cannot read ledger');
select tests.reset_actor();

-- ---------------------------------------------------------------- profiles
select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select name from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'Athlete One',
  'signed-in users can read public profile fields');
select tests.throws($$select dob from public.profiles where id = '11111111-1111-1111-1111-111111111111'$$,
  'permission denied', 'dob is not readable through the table');
select tests.ok((public.get_my_profile()).dob = '1990-01-01', 'get_my_profile returns own private fields');
select tests.throws($$update public.profiles set dob = '2015-01-01' where id = auth.uid()$$,
  'DOB_LOCKED', 'dob is write-once');
select tests.throws($$update public.profiles set active_role = 'facility_owner' where id = auth.uid()$$,
  'ROLE_NOT_GRANTED', 'cannot switch to a role you do not hold');
select tests.throws($$update public.profiles set roles = array['facility_owner'] where id = auth.uid()$$,
  'permission denied', 'cannot grant yourself roles');
select tests.throws($$update public.profiles set coach_plan = 'PRO' where id = auth.uid()$$,
  'permission denied', 'cannot self-upgrade coach plan');
with u as (update public.profiles set bio = 'hacked' where id = '11111111-1111-1111-1111-111111111111' returning 1)
select tests.ok((select count(*) from u) = 0, 'cannot edit another user profile');
select tests.reset_actor();

-- ---------------------------------------------------------------- personal logs
select tests.act_as('11111111-1111-1111-1111-111111111111');
insert into public.food_logs (name, calories) values ('Adobo', 380);
insert into public.workouts_lift (title, exercises) values ('Pull day', '[]');
select tests.reset_actor();

select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select count(*) from public.food_logs) = 0, 'food logs are private to their owner');
select tests.ok((select count(*) from public.workouts_lift) = 0, 'lift logs are private to their owner');
select tests.throws(
  $$insert into public.food_logs (user_id, name, calories)
    values ('11111111-1111-1111-1111-111111111111', 'Spoof', 1)$$,
  'row-level security', 'cannot write logs into another account');
select tests.reset_actor();

-- coach visibility of client lift logs
insert into public.coach_clients (coach_id, client_id)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');
select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select count(*) from public.workouts_lift) = 1, 'active coach can read client lift logs');
select tests.ok((select count(*) from public.food_logs) = 0, 'coach cannot read client food logs');
select tests.reset_actor();

-- ---------------------------------------------------------------- feed
select tests.act_as('11111111-1111-1111-1111-111111111111');
insert into public.sodia_posts (content) values ('New deadlift PR');
select tests.throws($$insert into public.sodia_posts (content, author_name) values ('x', 'Coach Miguel')$$,
  'permission denied', 'clients cannot set author_name');
select tests.throws($$insert into public.sodia_posts (content, likes_count) values ('x', 9999)$$,
  'permission denied', 'clients cannot set counters');
select tests.ok((select author_name from public.sodia_posts limit 1) = 'Athlete One',
  'author identity is stamped by the database');
select tests.reset_actor();

select tests.act_as('22222222-2222-2222-2222-222222222222');
insert into public.sodia_post_likes (post_id) select id from public.sodia_posts limit 1;
select tests.ok((select likes_count from public.sodia_posts limit 1) = 1, 'likes counter maintained by trigger');
select tests.reset_actor();

update public.profiles set is_private = true where id = '11111111-1111-1111-1111-111111111111';
select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select count(*) from public.sodia_posts) = 0, 'private account posts hidden from non-followers');
insert into public.follows (follower_id, followee_id, status)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'PENDING');
select tests.ok((select count(*) from public.sodia_posts) = 0, 'pending follow does not grant access');
select tests.reset_actor();

select tests.act_as('11111111-1111-1111-1111-111111111111');
update public.follows set status = 'ACCEPTED'
 where follower_id = '22222222-2222-2222-2222-222222222222';
select tests.reset_actor();

select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select count(*) from public.sodia_posts) = 1, 'accepted follower sees private posts');
select tests.reset_actor();

rollback;
