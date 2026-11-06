\set ON_ERROR_STOP on
begin;

select tests.create_user('c0000000-0000-0000-0000-00000000000c', 'Club Owner');
insert into public.facilities (id, owner_id, name, registry_type)
values ('fac_club', 'c0000000-0000-0000-0000-00000000000c', 'Free Club', 'COMMUNITY'),
       ('fac_gym', 'c0000000-0000-0000-0000-00000000000c', 'Commercial Gym', 'COMMERCIAL');

-- 20 athletes
select tests.create_user(
  ('d0000000-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid, 'Athlete ' || g)
from generate_series(1, 20) g;

-- 19 athletes self-join the free community club
do $$
declare
  i integer;
begin
  for i in 1..19 loop
    perform tests.act_as(('d0000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid);
    insert into public.facility_memberships (facility_id, user_id)
    values ('fac_club', auth.uid());
    perform tests.reset_actor();
  end loop;
end;
$$;
select tests.ok(
  (select count(*) from public.facility_memberships where facility_id = 'fac_club') = 19,
  '19 members can join a free community club');

select tests.act_as('d0000000-0000-0000-0000-000000000020');
select tests.throws(
  $$insert into public.facility_memberships (facility_id, user_id) values ('fac_club', auth.uid())$$,
  'COMMUNITY_FREE_MEMBER_CAP_REACHED', '20th member is rejected by the database');
select tests.throws(
  $$insert into public.facility_memberships (facility_id, user_id) values ('fac_gym', auth.uid())$$,
  'row-level security', 'cannot self-join a COMMERCIAL gym without buying a pass');
select tests.reset_actor();

-- cancelling frees a seat; re-activating is cap-checked
select tests.act_as('d0000000-0000-0000-0000-000000000001');
update public.facility_memberships set status = 'CANCELLED' where user_id = auth.uid();
select tests.throws($$update public.facility_memberships set status = 'ACTIVE' where user_id = auth.uid()$$,
  'row-level security', 'members cannot re-activate themselves');
select tests.reset_actor();

select tests.act_as('d0000000-0000-0000-0000-000000000020');
insert into public.facility_memberships (facility_id, user_id) values ('fac_club', auth.uid());
select tests.ok(true, 'a freed seat can be taken');
select tests.reset_actor();

select tests.act_as('c0000000-0000-0000-0000-00000000000c');
select tests.throws(
  $$update public.facility_memberships set status = 'ACTIVE'
     where facility_id = 'fac_club' and user_id = 'd0000000-0000-0000-0000-000000000001'$$,
  'COMMUNITY_FREE_MEMBER_CAP_REACHED', 'staff re-activation is also cap-checked');
select tests.reset_actor();

update public.facilities set plan = 'PRO' where id = 'fac_club';
select tests.act_as('c0000000-0000-0000-0000-00000000000c');
update public.facility_memberships set status = 'ACTIVE'
 where facility_id = 'fac_club' and user_id = 'd0000000-0000-0000-0000-000000000001';
select tests.ok(
  (select count(*) from public.facility_memberships where facility_id = 'fac_club' and status = 'ACTIVE') = 20,
  'PRO clubs are uncapped');
select tests.reset_actor();

-- ---------------------------------------------------------------- coach cap
select tests.act_as('c0000000-0000-0000-0000-00000000000c');
insert into public.coach_clients (coach_id, client_id) values
  (auth.uid(), 'd0000000-0000-0000-0000-000000000001'),
  (auth.uid(), 'd0000000-0000-0000-0000-000000000002'),
  (auth.uid(), 'd0000000-0000-0000-0000-000000000003');
select tests.throws(
  $$insert into public.coach_clients (coach_id, client_id)
    values (auth.uid(), 'd0000000-0000-0000-0000-000000000004')$$,
  'COACH_FREE_CLIENT_CAP_REACHED', '4th client rejected for a FREE coach');
select tests.throws(
  $$insert into public.coach_clients (coach_id, client_id)
    values ('d0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000004')$$,
  'row-level security', 'cannot add clients to another coach');
select tests.reset_actor();

update public.profiles set coach_plan = 'PRO' where id = 'c0000000-0000-0000-0000-00000000000c';
select tests.act_as('c0000000-0000-0000-0000-00000000000c');
insert into public.coach_clients (coach_id, client_id)
values (auth.uid(), 'd0000000-0000-0000-0000-000000000004');
select tests.ok(true, 'PRO coach is uncapped');
select tests.reset_actor();

rollback;
