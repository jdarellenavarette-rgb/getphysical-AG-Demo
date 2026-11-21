\set ON_ERROR_STOP on
begin;

select tests.create_user('bb000000-0000-0000-0000-0000000000a1', 'Gym Owner');
select tests.create_user('bb000000-0000-0000-0000-0000000000a2', 'Trusted Admin');
select tests.create_user('bb000000-0000-0000-0000-0000000000a3', 'Follower');
select tests.create_user('bb000000-0000-0000-0000-0000000000a4', 'Member');
select tests.create_user('bb000000-0000-0000-0000-0000000000a5', 'Stranger');
update public.profiles set username = 'trusted.admin' where id = 'bb000000-0000-0000-0000-0000000000a2';

select tests.act_as('bb000000-0000-0000-0000-0000000000a1');
insert into public.facilities (id, owner_id, name, registry_type, category, business_kind)
values ('fac_posts', auth.uid(), 'Post Gym', 'COMMERCIAL', 'Gym', 'GYM'),
       ('fac_posts_2', auth.uid(), 'Second Gym', 'COMMERCIAL', 'Gym', 'GYM');
select public.add_facility_staff('fac_posts', 'trusted.admin', 'ADMIN');
update public.facilities set about = 'Open early, lift heavy.' where id = 'fac_posts';
select tests.reset_actor();
insert into public.events (id, organizer_id, facility_id, title, starts_at)
values ('be000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-0000000000a1', 'fac_posts_2',
        'Other gym event', now() + interval '3 days');
insert into public.facility_memberships (facility_id, user_id)
values ('fac_posts', 'bb000000-0000-0000-0000-0000000000a4');

-- ------------------------------------------------------------------ posting
select tests.act_as('bb000000-0000-0000-0000-0000000000a2');
insert into public.business_posts (facility_id, body) values ('fac_posts', 'New racks are in.');
insert into public.business_posts (facility_id, body, status, publish_at)
values ('fac_posts', 'Opening at 5 AM from Monday.', 'SCHEDULED', now() + interval '2 days');
select tests.ok(true, 'a team member publishes one post and schedules another');
select tests.throws(
  $$insert into public.business_posts (facility_id, body, event_id)
    values ('fac_posts', 'Wrong link', 'be000000-0000-0000-0000-000000000001')$$,
  'INVALID_POST_LINK', 'a post cannot link to another business''s event');
select tests.ok(
  (select followers = 0 and members = 1 and reach = 1 from public.business_audience('fac_posts')),
  'the audience counts members before anyone follows');
select tests.reset_actor();

select tests.act_as('bb000000-0000-0000-0000-0000000000a5');
select tests.throws(
  $$insert into public.business_posts (facility_id, body) values ('fac_posts', 'Spam')$$,
  'row-level security', 'someone outside the team cannot post as the business');
select tests.ok(
  (select count(*) from public.business_posts where facility_id = 'fac_posts') = 1,
  'the public sees the live post and not the scheduled one');
select tests.throws($$select * from public.business_audience('fac_posts')$$, 'FORBIDDEN', 'audience figures are for the team');
select tests.reset_actor();

select tests.act_as_anon();
select tests.ok(
  (select (public.business_profile('fac_posts') ->> 'about') = 'Open early, lift heavy.'
      and (public.business_profile('fac_posts') ->> 'live_posts')::int = 1),
  'the profile is public and counts only live posts');
select tests.reset_actor();

-- ---------------------------------------------------------------- following
select tests.act_as('bb000000-0000-0000-0000-0000000000a3');
select tests.ok((select count(*) from public.business_feed()) = 0, 'the feed is empty before following');
insert into public.business_follows (facility_id) values ('fac_posts');
select tests.ok(
  (select array_agg(body) from public.business_feed()) = array['New racks are in.'],
  'a follower gets the business''s live posts');
select tests.ok(
  (public.business_profile('fac_posts') ->> 'is_following')::boolean
  and (public.business_profile('fac_posts') ->> 'followers')::int = 1,
  'the profile shows the follow');
select tests.throws(
  $$insert into public.business_follows (facility_id, user_id) values ('fac_posts', 'bb000000-0000-0000-0000-0000000000a5')$$,
  'permission denied', 'nobody can follow on someone else''s behalf');
select tests.reset_actor();

select tests.act_as('bb000000-0000-0000-0000-0000000000a4');
select tests.ok((select count(*) from public.business_feed()) = 1, 'a member gets posts without following');
select tests.reset_actor();

-- A scheduled post goes live when its time comes.
update public.business_posts set publish_at = now() - interval '1 minute' where status = 'SCHEDULED';
select tests.act_as('bb000000-0000-0000-0000-0000000000a3');
select tests.ok((select count(*) from public.business_feed()) = 2, 'a scheduled post appears once its time has passed');
delete from public.business_follows where facility_id = 'fac_posts';
select tests.ok((select count(*) from public.business_feed()) = 0, 'unfollowing empties the feed');
select tests.reset_actor();

select tests.act_as('bb000000-0000-0000-0000-0000000000a2');
update public.business_posts set status = 'ARCHIVED' where body = 'New racks are in.';
select tests.reset_actor();
select tests.act_as('bb000000-0000-0000-0000-0000000000a4');
select tests.ok(
  (select array_agg(body) from public.business_feed()) = array['Opening at 5 AM from Monday.'],
  'an archived post leaves the feed');
select tests.reset_actor();

-- ---------------------------------------------------------------- ownership
select tests.act_as('bb000000-0000-0000-0000-0000000000a2');
select tests.throws(
  $$select public.transfer_facility_ownership('fac_posts', 'bb000000-0000-0000-0000-0000000000a2')$$,
  'FORBIDDEN', 'an admin cannot take the business');
select tests.reset_actor();
select tests.act_as('bb000000-0000-0000-0000-0000000000a1');
select tests.throws(
  $$select public.transfer_facility_ownership('fac_posts', 'bb000000-0000-0000-0000-0000000000a5')$$,
  'STAFF_NOT_FOUND', 'the business can only go to someone on the team');
select public.transfer_facility_ownership('fac_posts', 'bb000000-0000-0000-0000-0000000000a2');
select tests.reset_actor();
select tests.ok(
  (select owner_id = 'bb000000-0000-0000-0000-0000000000a2' from public.facilities where id = 'fac_posts')
  and (select array_agg(role::text order by role) from public.facility_staff where facility_id = 'fac_posts')
      = array['OWNER', 'ADMIN']
  and (select role = 'ADMIN' from public.facility_staff
        where facility_id = 'fac_posts' and user_id = 'bb000000-0000-0000-0000-0000000000a1'),
  'ownership moves to the new owner and the previous owner stays on as an admin');

rollback;
