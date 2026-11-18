\set ON_ERROR_STOP on
begin;

select tests.create_user('dd000000-0000-0000-0000-0000000000d1', 'Demo Explorer');
select tests.create_user('dd000000-0000-0000-0000-0000000000d2', 'Other Person');

select tests.act_as('dd000000-0000-0000-0000-0000000000d1');
select tests.throws($$select public.create_demo_venue()$$, 'DEMO_DISABLED', 'a demo venue cannot be created on a live platform');
select tests.reset_actor();

select tests.act_as_service();
select public.admin_set_payments_mode('sandbox');
select tests.reset_actor();

select tests.act_as_anon();
select tests.throws($$select public.create_demo_venue()$$, 'permission denied', 'signed-out visitors cannot create a demo venue');
select tests.reset_actor();

select tests.act_as('dd000000-0000-0000-0000-0000000000d1');
create temp table demo as select public.create_demo_venue() as id;
grant select on demo to public;
select tests.ok((select id from demo) = public.create_demo_venue(), 'asking again returns the same demo venue');
select tests.ok(
  (select count(*) from public.facility_staff where facility_id = (select id from demo) and user_id = auth.uid() and role = 'OWNER') = 1,
  'the person who asked owns the demo venue');
select tests.ok(
  (select array_agg(standing || ':' || n order by standing)
     from (select standing, count(*) as n from public.facility_member_directory((select id from demo)) group by standing) s)
  = array['ACTIVE:11', 'CANCELLED:1', 'LAPSED:4', 'NO_PASS:2'],
  'demo members cover every standing: 11 active, 4 lapsed, 2 without a pass, 1 cancelled');
select tests.ok(
  (select count(*) from public.facility_products where facility_id = (select id from demo) and is_active) = 4,
  'the demo venue sells four plans');
select tests.ok(
  (select state_ok from (select charges_enabled and is_sandbox as state_ok
     from public.facility_payout_accounts where facility_id = (select id from demo)) p),
  'test payments are connected');
select tests.ok(
  (select count(*) from public.access_scans where facility_id = (select id from demo) and status = 'GRANTED') > 30,
  'there is a week of check-ins');
select tests.ok(
  (select count(*) from public.payment_orders where facility_id = (select id from demo) and status = 'PAID') = 16,
  'there are sales to show');
select tests.ok(
  (select count(*) from public.conversations where facility_id = (select id from demo)) = 5,
  'there are conversations in the inbox');
select tests.ok(
  (public.send_crm_broadcast((select id from demo), 'GYMDASH', 'LAPSED', 'Come back', 'We miss you')).recipient_count = 4,
  'a win-back broadcast reaches the lapsed demo members');
select tests.reset_actor();

select tests.act_as('dd000000-0000-0000-0000-0000000000d2');
select tests.throws(
  format($$select * from public.facility_member_directory(%L)$$, (select id from demo)),
  'FORBIDDEN', 'someone else cannot read another person''s demo venue');
select tests.ok(public.create_demo_venue() <> (select id from demo), 'each person gets their own demo venue');
select tests.reset_actor();

rollback;
