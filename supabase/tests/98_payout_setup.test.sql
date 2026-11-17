\set ON_ERROR_STOP on
begin;

select tests.create_user('f1000000-0000-0000-0000-00000000000f', 'Payout Owner');
select tests.create_user('f2000000-0000-0000-0000-00000000000f', 'Desk Staff');
select tests.create_user('f3000000-0000-0000-0000-00000000000f', 'Buyer');
insert into public.facilities (id, owner_id, name, registry_type)
values ('pay_gym', 'f1000000-0000-0000-0000-00000000000f', 'Payout Gym', 'COMMERCIAL'),
       ('pay_live', 'f1000000-0000-0000-0000-00000000000f', 'Live Gym', 'COMMERCIAL');
insert into public.facility_staff (facility_id, user_id, role)
values ('pay_gym', 'f2000000-0000-0000-0000-00000000000f', 'STAFF');
insert into public.facility_payout_accounts (facility_id, xendit_sub_account_id, charges_enabled)
values ('pay_live', 'xnd_live_1', true);

select tests.act_as('f1000000-0000-0000-0000-00000000000f');
select public.create_standard_product('pay_gym', 'DAY_PASS', 200);
select tests.ok(public.payments_mode() = 'live', 'the platform is live unless an operator says otherwise');
select tests.throws($$select public.connect_sandbox_payouts('pay_gym')$$,
  'SANDBOX_DISABLED', 'a venue cannot switch on test payments on a live platform');
select tests.throws($$select public.admin_set_payments_mode('sandbox')$$,
  'permission denied', 'a venue owner cannot change the platform''s payments mode');
select tests.reset_actor();

select tests.act_as_service();
select public.admin_set_payments_mode('sandbox');
select tests.throws($$select public.admin_set_payments_mode('free-for-all')$$, 'INVALID_MODE', 'only sandbox or live are accepted');
select tests.reset_actor();

select tests.act_as('f2000000-0000-0000-0000-00000000000f');
select tests.throws($$select public.connect_sandbox_payouts('pay_gym')$$,
  'FORBIDDEN', 'front-desk staff cannot connect payouts');
select tests.throws($$select public.request_live_payouts('pay_gym')$$,
  'FORBIDDEN', 'front-desk staff cannot request live payouts');
select tests.reset_actor();

select tests.act_as('f3000000-0000-0000-0000-00000000000f');
select tests.throws($$select public.create_payment_order('pay_gym', 'DAY_PASS', 'key-pay-0001')$$,
  'FACILITY_PAYOUTS_NOT_CONFIGURED', 'nothing can be bought before payouts are connected');
select tests.reset_actor();

select tests.act_as('f1000000-0000-0000-0000-00000000000f');
select tests.ok(
  (select charges_enabled and is_sandbox and preferred_provider = 'MAYA' and maya_merchant_id like 'SANDBOX-%'
     from public.connect_sandbox_payouts('pay_gym')),
  'in sandbox mode an owner connects Maya test payments themselves');
select tests.throws($$select public.connect_sandbox_payouts('pay_live')$$,
  'ALREADY_LIVE', 'a venue with live payouts is never downgraded to test mode');
select tests.ok(public.request_live_payouts('pay_gym') is not null, 'an owner can ask to be set up for real payouts');
select tests.ok(
  public.request_live_payouts('pay_gym') = (select live_requested_at from public.facility_payout_accounts where facility_id = 'pay_gym'),
  'asking twice keeps the original request date');
select tests.throws(
  $$update public.facility_payout_accounts set charges_enabled = true where facility_id = 'pay_gym'$$,
  'permission denied', 'the payout account is not directly writable');
select tests.reset_actor();

select tests.act_as('f3000000-0000-0000-0000-00000000000f');
select tests.ok(
  (select provider = 'MAYA' and total_php = 215.00 from public.create_payment_order('pay_gym', 'DAY_PASS', 'key-pay-0002')),
  'once connected, a purchase is routed to Maya');
select tests.reset_actor();

-- going live switches every test-mode connection off
select tests.act_as_service();
select public.admin_set_payments_mode('live');
select tests.reset_actor();
select tests.act_as('f3000000-0000-0000-0000-00000000000f');
select tests.throws($$select public.create_payment_order('pay_gym', 'DAY_PASS', 'key-pay-0003')$$,
  'FACILITY_PAYOUTS_NOT_CONFIGURED', 'a test-mode connection cannot sell once the platform is live');
select tests.reset_actor();

select tests.act_as_service();
select public.admin_set_payments_mode('sandbox');
select tests.reset_actor();
select tests.act_as('f1000000-0000-0000-0000-00000000000f');
select public.disconnect_sandbox_payouts('pay_gym');
select tests.ok(
  (select not charges_enabled and not is_sandbox and live_requested_at is not null
     from public.facility_payout_accounts where facility_id = 'pay_gym'),
  'disconnecting turns test payments off and keeps the live request');
select tests.throws($$select public.disconnect_sandbox_payouts('pay_live')$$,
  'NOT_IN_TEST_MODE', 'a live payout account cannot be disconnected here');
select tests.reset_actor();

rollback;
