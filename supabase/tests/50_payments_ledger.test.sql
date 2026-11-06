\set ON_ERROR_STOP on
begin;

-- Fee parity with sodia-core calculateHybridServiceFee
select tests.ok(public.calculate_service_fee(250, 'one_time_pass') = 15.00, 'one-time pass: fixed ₱15');
select tests.ok(public.calculate_service_fee(0, 'one_time_pass') = 0, 'free item: no fee');
select tests.ok(public.calculate_service_fee(1500, 'recurring_subscription') = 75.00, 'subscription: 5%');
select tests.ok(public.calculate_service_fee(999.99, 'recurring_subscription') = 50.00, 'subscription: rounded to centavos');

select tests.create_user('a0000000-0000-0000-0000-00000000000a', 'Gym Owner');
select tests.create_user('11111111-1111-1111-1111-111111111111', 'Adult Buyer');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'Teen Buyer', (current_date - interval '16 years')::date);
select tests.create_user('33333333-3333-3333-3333-333333333333', 'No DOB', null);

insert into public.facilities (id, owner_id, name, registry_type, day_pass_price_php, monthly_sub_price_php)
values ('fac_a', 'a0000000-0000-0000-0000-00000000000a', 'Gym A', 'COMMERCIAL', 250, 1500);

-- ---------------------------------------------------------------- order creation
select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.throws($$select public.create_payment_order('fac_a', 'DAY_PASS', 'key-0000001')$$,
  'FACILITY_PAYOUTS_NOT_CONFIGURED', 'cannot sell before the facility finishes payout onboarding');
select tests.reset_actor();

insert into public.facility_payout_accounts (facility_id, xendit_sub_account_id, charges_enabled)
values ('fac_a', 'xnd_sub_123', true);

select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.throws($$select public.create_payment_order('fac_a', 'DAY_PASS', 'key-0000002')$$,
  'PAYMENT_BLOCKED_UNDER_18', 'minors cannot transact');
select tests.reset_actor();

select tests.act_as('33333333-3333-3333-3333-333333333333');
select tests.throws($$select public.create_payment_order('fac_a', 'DAY_PASS', 'key-0000003')$$,
  'AGE_VERIFICATION_REQUIRED', 'buyers must provide a date of birth');
select tests.reset_actor();

select tests.act_as('11111111-1111-1111-1111-111111111111');
create temp table o1 as select * from public.create_payment_order('fac_a', 'DAY_PASS', 'key-day-0001');
grant select on o1 to public;
select tests.ok((select total_php from o1) = 265.00 and (select provider from o1) = 'XENDIT',
  'day pass priced server-side: ₱250 + ₱15 via Xendit');
select tests.ok(
  (public.create_payment_order('fac_a', 'DAY_PASS', 'key-day-0001')).id = (select id from o1),
  'same idempotency key returns the same order');
select tests.throws($$update public.payment_orders set total_php = 1$$,
  'permission denied', 'buyers cannot edit orders');
select tests.throws(
  $$select public.settle_payment_order((select id from o1), 'XENDIT', 'inv_1', 265)$$,
  'permission denied', 'clients cannot settle orders');
select tests.reset_actor();

-- ---------------------------------------------------------------- settlement
select tests.act_as_service();
select public.attach_payment_checkout((select id from o1), 'inv_1', 'https://checkout.xendit.co/inv_1');
select tests.ok(public.record_payment_webhook_event('XENDIT', 'inv_1:PAID', 'invoice.paid', '{}'),
  'first webhook delivery is recorded');
select tests.ok(not public.record_payment_webhook_event('XENDIT', 'inv_1:PAID', 'invoice.paid', '{}'),
  'duplicate webhook delivery is detected');
select tests.ok(
  (public.settle_payment_order((select id from o1), 'XENDIT', 'inv_1', 265)).status = 'PAID',
  'paid webhook settles the order');
select tests.ok(
  (public.settle_payment_order((select id from o1), 'XENDIT', 'inv_1', 265)).status = 'PAID',
  'settling twice is a no-op');
select tests.throws(
  $$select public.settle_payment_order((select id from o1), 'STRIPE', 'cs_1', 265)$$,
  'ORDER_PROVIDER_MISMATCH', 'cannot settle through the wrong provider');
select tests.reset_actor();

select tests.ok((select count(*) from public.ledger_transactions where payment_order_id = (select id from o1)) = 1,
  'exactly one ledger entry per settled order');
select tests.ok(
  (select platform_fee_php = 15 and net_facility_amount_php = 250 and gross_amount_php = 265
     from public.ledger_transactions where payment_order_id = (select id from o1)),
  'ledger records the gross / platform fee / facility net split');
select tests.ok(
  exists (select 1 from public.passes p
            join public.payment_orders o on o.pass_id = p.id
           where o.id = (select id from o1) and p.status = 'ACTIVE'),
  'settlement issues an active pass');
select tests.ok(
  exists (select 1 from public.facility_memberships
           where facility_id = 'fac_a' and user_id = '11111111-1111-1111-1111-111111111111'),
  'settlement activates facility membership (enables CRM)');

-- underpayment is not honoured
select tests.act_as('11111111-1111-1111-1111-111111111111');
create temp table o2 as select * from public.create_payment_order('fac_a', 'MONTHLY', 'key-month-001');
grant select on o2 to public;
select tests.ok((select total_php from o2) = 1575.00, 'monthly priced at ₱1500 + 5%');
select tests.reset_actor();

select tests.act_as_service();
select public.attach_payment_checkout((select id from o2), 'inv_2', 'https://checkout.xendit.co/inv_2');
select tests.ok(
  (public.settle_payment_order((select id from o2), 'XENDIT', 'inv_2', 100)).status = 'FAILED',
  'amount mismatch fails the order instead of issuing a pass');
select tests.reset_actor();
select tests.ok((select count(*) from public.ledger_transactions where payment_order_id = (select id from o2)) = 0,
  'no ledger entry for a failed order');

-- ---------------------------------------------------------------- refunds
select tests.act_as_service();
select tests.ok((public.refund_payment_order((select id from o1), 'duplicate charge')).status = 'REFUNDED',
  'refund marks the order REFUNDED');
select tests.ok((public.refund_payment_order((select id from o1), 'again')).status = 'REFUNDED',
  'refund is idempotent');
select tests.reset_actor();

select tests.ok(
  (select sum(amount) from public.ledger_transactions where payment_order_id = (select id from o1)) = 0,
  'reversing entry nets the original to zero');
select tests.ok(
  (select count(*) from public.ledger_transactions where payment_order_id = (select id from o1)) = 2,
  'refund appends rather than edits');
select tests.ok(
  (select p.status from public.passes p join public.payment_orders o on o.pass_id = p.id
    where o.id = (select id from o1)) = 'REVOKED',
  'refund revokes the pass');

-- ---------------------------------------------------------------- visibility
select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select count(*) from public.ledger_transactions) = 0, 'other buyers cannot see the ledger');
select tests.ok((select count(*) from public.payment_orders) = 0, 'other buyers cannot see orders');
select tests.reset_actor();

select tests.act_as('a0000000-0000-0000-0000-00000000000a');
select tests.ok((select count(*) from public.ledger_transactions) = 2, 'facility admin sees their ledger');
select tests.reset_actor();

-- ---------------------------------------------------------------- append-only
select tests.throws($$update public.ledger_transactions set amount = 0$$,
  'append-only', 'ledger rows cannot be updated, even by the owner role');
select tests.throws($$delete from public.ledger_transactions$$, 'append-only', 'ledger rows cannot be deleted');
select tests.throws($$truncate public.ledger_transactions cascade$$, 'append-only', 'ledger cannot be truncated');
select tests.act_as_service();
select tests.throws($$delete from public.ledger_transactions$$, 'permission denied',
  'service_role has no DELETE privilege on the ledger');
select tests.reset_actor();

rollback;
