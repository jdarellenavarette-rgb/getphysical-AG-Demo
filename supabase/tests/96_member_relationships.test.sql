\set ON_ERROR_STOP on
begin;

-- Cast: one gym and one club owned by the same person, a front-desk staff
-- member, and members in every standing.
select tests.create_user('a1000000-0000-0000-0000-00000000000a', 'Venue Owner');
select tests.create_user('a2000000-0000-0000-0000-00000000000a', 'Desk Staff');
select tests.create_user('a3000000-0000-0000-0000-00000000000a', 'Outsider');
select tests.create_user('e1000000-0000-0000-0000-000000000001', 'Paid Member');
select tests.create_user('e2000000-0000-0000-0000-000000000002', 'Desk Added');
select tests.create_user('e3000000-0000-0000-0000-000000000003', 'Lapsed Member');
select tests.create_user('e4000000-0000-0000-0000-000000000004', 'Cancelled Member');
select tests.create_user('e5000000-0000-0000-0000-000000000005', 'Club Member');

insert into public.facilities (id, owner_id, name, registry_type)
values ('rel_gym', 'a1000000-0000-0000-0000-00000000000a', 'Relationship Gym', 'COMMERCIAL'),
       ('rel_club', 'a1000000-0000-0000-0000-00000000000a', 'Relationship Club', 'COMMUNITY');
insert into public.facility_staff (facility_id, user_id, role)
values ('rel_gym', 'a2000000-0000-0000-0000-00000000000a', 'STAFF');

insert into public.facility_memberships (facility_id, user_id, source, status) values
  ('rel_gym', 'e1000000-0000-0000-0000-000000000001', 'PURCHASE', 'ACTIVE'),
  ('rel_gym', 'e2000000-0000-0000-0000-000000000002', 'STAFF_ADDED', 'ACTIVE'),
  ('rel_gym', 'e3000000-0000-0000-0000-000000000003', 'PURCHASE', 'ACTIVE'),
  ('rel_gym', 'e4000000-0000-0000-0000-000000000004', 'PURCHASE', 'CANCELLED'),
  ('rel_club', 'e5000000-0000-0000-0000-000000000005', 'JOIN', 'ACTIVE');
insert into public.passes (id, owner_id, facility_id, valid_until) values
  ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'rel_gym', now() + interval '10 days'),
  ('f3000000-0000-0000-0000-000000000003', 'e3000000-0000-0000-0000-000000000003', 'rel_gym', now() - interval '3 days');

create function pg_temp.standing_of(p_facility text, p_user uuid) returns text
language sql as $$
  select standing from public.facility_member_directory(p_facility) where user_id = p_user;
$$;

-- ------------------------------------------------------------ directory
select tests.act_as('a3000000-0000-0000-0000-00000000000a');
select tests.throws($$select * from public.facility_member_directory('rel_gym')$$,
  'FORBIDDEN', 'someone who does not staff the venue cannot read its member directory');
select tests.reset_actor();

select tests.act_as('e1000000-0000-0000-0000-000000000001');
select tests.throws($$select * from public.facility_member_directory('rel_gym')$$,
  'FORBIDDEN', 'a member cannot read the member directory');
select tests.reset_actor();

select tests.act_as('a2000000-0000-0000-0000-00000000000a');
select tests.ok(pg_temp.standing_of('rel_gym', 'e1000000-0000-0000-0000-000000000001') = 'ACTIVE',
  'a gym member with a valid pass is ACTIVE');
select tests.ok(pg_temp.standing_of('rel_gym', 'e2000000-0000-0000-0000-000000000002') = 'NO_PASS',
  'a gym member added at the desk with no pass is NO_PASS');
select tests.ok(pg_temp.standing_of('rel_gym', 'e3000000-0000-0000-0000-000000000003') = 'LAPSED',
  'a gym member whose pass has ended is LAPSED');
select tests.ok(pg_temp.standing_of('rel_gym', 'e4000000-0000-0000-0000-000000000004') = 'CANCELLED',
  'a cancelled membership is CANCELLED');
select tests.ok((select count(*) from public.facility_member_directory('rel_gym')) = 4,
  'the directory lists every member of the venue, and only that venue');
select tests.ok(
  (select name from public.facility_member_directory('rel_gym') where user_id = 'e1000000-0000-0000-0000-000000000001') = 'Paid Member',
  'the directory carries the member''s name');
select tests.throws($$select * from public.facility_member_directory('rel_club')$$,
  'FORBIDDEN', 'staff of one venue cannot read another venue''s directory');
select tests.reset_actor();

select tests.act_as('a1000000-0000-0000-0000-00000000000a');
select tests.ok(pg_temp.standing_of('rel_club', 'e5000000-0000-0000-0000-000000000005') = 'ACTIVE',
  'a community club member is ACTIVE without a pass');
select tests.reset_actor();

-- ------------------------------------------------------------ member side
select tests.act_as('e3000000-0000-0000-0000-000000000003');
select tests.ok(
  (select standing from public.my_memberships() where facility_id = 'rel_gym') = 'LAPSED'
  and (select count(*) from public.my_memberships()) = 1,
  'a member sees their own venues and standing, nobody else''s');
select tests.reset_actor();

select tests.act_as('e4000000-0000-0000-0000-000000000004');
select tests.ok((select count(*) from public.my_memberships()) = 0, 'cancelled memberships are not listed');
select tests.reset_actor();

select tests.act_as_anon();
select tests.throws($$select * from public.my_memberships()$$, 'permission denied', 'signed-out visitors cannot call my_memberships');
select tests.reset_actor();

-- ------------------------------------------------------------ mute + audiences
select tests.act_as('a3000000-0000-0000-0000-00000000000a');
select tests.throws($$select public.set_venue_broadcasts_muted('rel_gym', true)$$,
  'NOT_A_MEMBER', 'only a member can mute a venue');
select tests.reset_actor();

select tests.act_as('a1000000-0000-0000-0000-00000000000a');
select tests.ok((public.send_crm_broadcast('rel_gym', 'GYMDASH', 'ALL', 'Hello', 'Everyone')).recipient_count = 3,
  'ALL reaches every member whose membership is not cancelled');
select tests.ok((public.send_crm_broadcast('rel_gym', 'GYMDASH', 'ACTIVE', 'Hello', 'Active')).recipient_count = 1,
  'ACTIVE reaches only members who hold a valid pass');
select tests.ok((public.send_crm_broadcast('rel_gym', 'GYMDASH', 'LAPSED', 'Come back', 'We miss you')).recipient_count = 1,
  'LAPSED reaches only members whose pass has ended');
select tests.throws($$select public.send_crm_broadcast('rel_gym', 'GYMDASH', 'EVERYONE', 'x', 'y')$$,
  'INVALID_AUDIENCE', 'unknown audiences are rejected');
select tests.reset_actor();

select tests.act_as('e1000000-0000-0000-0000-000000000001');
select public.set_venue_broadcasts_muted('rel_gym', true);
select tests.ok((select broadcasts_muted from public.my_memberships() where facility_id = 'rel_gym'),
  'a member can mute a venue and sees that they did');
select tests.throws($$update public.facility_memberships set broadcasts_muted = false where user_id = auth.uid()$$,
  'permission denied', 'the mute flag is only changed through the function');
select tests.reset_actor();

select tests.act_as('a1000000-0000-0000-0000-00000000000a');
select tests.ok((public.send_crm_broadcast('rel_gym', 'GYMDASH', 'ALL', 'Hello', 'Again')).recipient_count = 2,
  'a member who muted the venue is left out of broadcasts');
select tests.ok(
  (public.send_crm_broadcast('rel_gym', 'GYMDASH', 'USER', 'Hi', 'Just you', null, null, 'e1000000-0000-0000-0000-000000000001')).recipient_count = 1,
  'a direct message still reaches a member who muted broadcasts');
select tests.ok(
  (select broadcasts_muted from public.facility_member_directory('rel_gym') where user_id = 'e1000000-0000-0000-0000-000000000001'),
  'staff can see that a member muted broadcasts');
select tests.reset_actor();

-- ------------------------------------------------------------ complimentary pass
select tests.act_as('a2000000-0000-0000-0000-00000000000a');
select tests.throws(
  $$select public.grant_complimentary_pass('rel_gym', 'e2000000-0000-0000-0000-000000000002', 7)$$,
  'FORBIDDEN', 'front-desk staff cannot grant passes');
select tests.reset_actor();

select tests.act_as('a1000000-0000-0000-0000-00000000000a');
select tests.throws(
  $$select public.grant_complimentary_pass('rel_gym', 'e2000000-0000-0000-0000-000000000002', 0)$$,
  'INVALID_DURATION', 'a pass must last at least one day');
select tests.throws(
  $$select public.grant_complimentary_pass('rel_gym', 'e2000000-0000-0000-0000-000000000002', 367)$$,
  'INVALID_DURATION', 'a pass cannot exceed 366 days');
select public.grant_complimentary_pass('rel_gym', 'e2000000-0000-0000-0000-000000000002', 7);
select tests.ok(pg_temp.standing_of('rel_gym', 'e2000000-0000-0000-0000-000000000002') = 'ACTIVE',
  'granting a pass makes a desk-added member ACTIVE');
select public.grant_complimentary_pass('rel_gym', 'e4000000-0000-0000-0000-000000000004', 1);
select tests.ok(pg_temp.standing_of('rel_gym', 'e4000000-0000-0000-0000-000000000004') = 'ACTIVE',
  'granting a pass reactivates a cancelled membership');
select tests.reset_actor();

select tests.ok(
  (select count(*) from public.passes p join public.pass_credentials c on c.pass_id = p.id
    where p.owner_id = 'e2000000-0000-0000-0000-000000000002' and p.sku_id = 'COMP_PASS'
      and p.gifted_by_user_id = 'a1000000-0000-0000-0000-00000000000a') = 1,
  'the granted pass has a door credential and records who granted it');
select tests.ok(
  (select count(*) from public.ledger_transactions where facility_id = 'rel_gym') = 0,
  'a complimentary pass is not recorded as a sale');

-- ------------------------------------------------------------ access follows the pass
update public.passes set status = 'REVOKED' where id = 'f1000000-0000-0000-0000-000000000001';
select tests.act_as('a1000000-0000-0000-0000-00000000000a');
select tests.ok(pg_temp.standing_of('rel_gym', 'e1000000-0000-0000-0000-000000000001') = 'LAPSED',
  'when a pass is revoked (as a refund does) the member becomes LAPSED with no other change');
select tests.reset_actor();

-- ------------------------------------------------------------ ending a membership
select tests.act_as('a2000000-0000-0000-0000-00000000000a');
select tests.throws($$select public.end_membership('rel_gym', 'e2000000-0000-0000-0000-000000000002')$$,
  'FORBIDDEN', 'front-desk staff cannot end a membership');
select tests.reset_actor();

select tests.act_as('a1000000-0000-0000-0000-00000000000a');
select tests.ok(
  (public.end_membership('rel_gym', 'e2000000-0000-0000-0000-000000000002') ->> 'revoked_passes')::int = 1,
  'ending a membership revokes the member''s valid passes');
select tests.ok(pg_temp.standing_of('rel_gym', 'e2000000-0000-0000-0000-000000000002') = 'CANCELLED',
  'the member is then CANCELLED');
select tests.throws($$select public.end_membership('rel_gym', 'a3000000-0000-0000-0000-00000000000a')$$,
  'NOT_A_MEMBER', 'ending a membership that does not exist is reported');
select tests.reset_actor();

select tests.ok(
  (select status from public.passes where owner_id = 'e2000000-0000-0000-0000-000000000002' and sku_id = 'COMP_PASS') = 'REVOKED',
  'the revoked pass can no longer open the door');

-- ------------------------------------------------------------ leaving
select tests.act_as('e5000000-0000-0000-0000-000000000005');
select public.leave_facility('rel_club');
select tests.ok((select count(*) from public.my_memberships()) = 0, 'a member can leave a venue');
select tests.throws($$select public.leave_facility('rel_club')$$, 'NOT_A_MEMBER', 'leaving twice is reported');
select tests.reset_actor();

select tests.act_as('e3000000-0000-0000-0000-000000000003');
select public.leave_facility('rel_gym');
select tests.reset_actor();
select tests.ok(
  (select status from public.passes where id = 'f3000000-0000-0000-0000-000000000003') = 'ACTIVE',
  'leaving does not touch the member''s own passes');

rollback;
