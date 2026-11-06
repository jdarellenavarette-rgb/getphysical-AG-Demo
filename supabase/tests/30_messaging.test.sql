\set ON_ERROR_STOP on
begin;

select tests.create_user('a0000000-0000-0000-0000-00000000000a', 'Gym Owner');
select tests.create_user('b0000000-0000-0000-0000-00000000000b', 'Rival Owner');
select tests.create_user('11111111-1111-1111-1111-111111111111', 'Member One');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'Member Two');
select tests.create_user('33333333-3333-3333-3333-333333333333', 'Not A Member');

insert into public.facilities (id, owner_id, name, registry_type)
values ('fac_a', 'a0000000-0000-0000-0000-00000000000a', 'Gym A', 'COMMERCIAL'),
       ('fac_b', 'b0000000-0000-0000-0000-00000000000b', 'Gym B', 'COMMERCIAL');
insert into public.facility_memberships (facility_id, user_id, source) values
  ('fac_a', '11111111-1111-1111-1111-111111111111', 'PURCHASE'),
  ('fac_a', '22222222-2222-2222-2222-222222222222', 'PURCHASE');
insert into public.facility_segments (id, facility_id, key, label)
values ('5e000000-0000-0000-0000-000000000001', 'fac_a', 'SEGMENT_1', 'VIP');
insert into public.facility_segment_members (segment_id, user_id)
values ('5e000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222');

-- ---------------------------------------------------------------- broadcasts
select tests.act_as('b0000000-0000-0000-0000-00000000000b');
select tests.throws(
  $$select public.send_crm_broadcast('fac_a', 'GYMDASH', 'ALL', 'Fake', 'Phish')$$,
  'FORBIDDEN', 'another tenant cannot broadcast as Gym A');
select tests.reset_actor();

select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.throws(
  $$select public.send_crm_broadcast('fac_a', 'GYMDASH', 'ALL', 'Fake', 'Phish')$$,
  'FORBIDDEN', 'members cannot broadcast');
select tests.throws(
  $$insert into public.crm_broadcasts (facility_id, created_by, suite_mode, audience, title, body)
    values ('fac_a', auth.uid(), 'GYMDASH', 'ALL', 'x', 'y')$$,
  'permission denied', 'broadcast table is not directly writable');
select tests.reset_actor();

select tests.act_as('a0000000-0000-0000-0000-00000000000a');
select tests.ok(
  (public.send_crm_broadcast('fac_a', 'GYMDASH', 'ALL', 'Open House', 'Saturday 10AM', 'metro2026')).recipient_count = 2,
  'ALL broadcast fans out to every active member');
select tests.ok(
  (public.send_crm_broadcast('fac_a', 'GYMDASH', 'SEGMENT', 'VIP night', 'Members only', null, 'SEGMENT_1')).recipient_count = 1,
  'SEGMENT broadcast reaches only segment members');
select tests.throws(
  $$select public.send_crm_broadcast('fac_a', 'GYMDASH', 'USER', 'Hi', 'there', null, null,
      '33333333-3333-3333-3333-333333333333')$$,
  'ATHLETE_NOT_A_MEMBER', 'cannot DM-broadcast to a non-member');
select tests.ok(
  (select promo_code from public.crm_broadcasts where title = 'Open House') = 'METRO2026',
  'promo codes are normalised server-side');
select tests.reset_actor();

-- ---------------------------------------------------------------- inbox isolation
select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.ok((select count(*) from public.messages) = 1, 'member one sees only their broadcast copy');
select tests.ok((select count(*) from public.crm_broadcasts) = 1, 'member sees only broadcasts delivered to them');
select tests.reset_actor();

select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select count(*) from public.messages) = 2, 'member two sees ALL + SEGMENT broadcasts');
select tests.reset_actor();

select tests.act_as('33333333-3333-3333-3333-333333333333');
select tests.ok((select count(*) from public.messages) = 0, 'non-member receives nothing');
select tests.throws($$select public.ensure_facility_conversation('fac_a')$$,
  'NOT_A_MEMBER', 'non-members cannot open a CRM thread');
select tests.reset_actor();

select tests.act_as('b0000000-0000-0000-0000-00000000000b');
select tests.ok((select count(*) from public.conversations) = 0, 'other tenant cannot see Gym A threads');
select tests.reset_actor();

-- ---------------------------------------------------------------- replies & spoofing
select tests.act_as('11111111-1111-1111-1111-111111111111');
insert into public.messages (conversation_id, body)
values (public.ensure_facility_conversation('fac_a'), 'Can I bring a guest?');
select tests.throws(
  $$insert into public.messages (conversation_id, sender_kind, body)
    values (public.ensure_facility_conversation('fac_a'), 'FACILITY', 'Free month for everyone!')$$,
  'row-level security', 'members cannot post as the facility');
select tests.throws(
  $$insert into public.messages (conversation_id, sender_id, body)
    values (public.ensure_facility_conversation('fac_a'), '22222222-2222-2222-2222-222222222222', 'spoof')$$,
  'permission denied', 'sender_id cannot be supplied by the client');
select tests.reset_actor();

select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.throws(
  $$insert into public.messages (conversation_id, body)
    select id from public.conversations c
     where c.athlete_id = '11111111-1111-1111-1111-111111111111'$$,
  null, 'cannot post into another member''s thread');
select tests.reset_actor();

select tests.act_as('a0000000-0000-0000-0000-00000000000a');
insert into public.messages (conversation_id, sender_kind, body)
values (public.ensure_facility_conversation('fac_a', '11111111-1111-1111-1111-111111111111'), 'FACILITY', 'Yes, guests welcome.');
select tests.ok((select count(*) from public.messages m
                   join public.conversations c on c.id = m.conversation_id
                  where c.athlete_id = '11111111-1111-1111-1111-111111111111') = 3,
  'staff see the full thread including the member reply');
select tests.reset_actor();

-- ---------------------------------------------------------------- direct messages
select tests.act_as('11111111-1111-1111-1111-111111111111');
-- Clients open the thread (RPC) and send (insert) as two requests.
select public.open_direct_conversation('22222222-2222-2222-2222-222222222222');
insert into public.messages (conversation_id, body)
values (public.open_direct_conversation('22222222-2222-2222-2222-222222222222'), 'Leg day?');
select tests.ok(
  public.open_direct_conversation('22222222-2222-2222-2222-222222222222')
    = public.open_direct_conversation('22222222-2222-2222-2222-222222222222'),
  'DM thread is reused');
select tests.reset_actor();

select tests.act_as('33333333-3333-3333-3333-333333333333');
select tests.ok((select count(*) from public.messages) = 0, 'third party cannot read a DM');
select tests.reset_actor();

rollback;
