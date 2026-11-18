\set ON_ERROR_STOP on
begin;

select tests.create_user('b1000000-0000-0000-0000-00000000000b', 'Catalogue Owner');
select tests.create_user('b2000000-0000-0000-0000-00000000000b', 'Desk Staff');
select tests.create_user('b3000000-0000-0000-0000-00000000000b', 'Rival Owner');
select tests.create_user('c1000000-0000-0000-0000-000000000001', 'Buyer');

insert into public.facilities (id, owner_id, name, registry_type)
values ('cat_gym', 'b1000000-0000-0000-0000-00000000000b', 'Catalogue Gym', 'COMMERCIAL'),
       ('cat_rival', 'b3000000-0000-0000-0000-00000000000b', 'Rival Gym', 'COMMERCIAL');
insert into public.facility_staff (facility_id, user_id, role)
values ('cat_gym', 'b2000000-0000-0000-0000-00000000000b', 'STAFF');
insert into public.facility_payout_accounts (facility_id, xendit_sub_account_id, charges_enabled)
values ('cat_gym', 'xnd_sub_cat', true);

-- ------------------------------------------------------------ who can define products
select tests.act_as('b2000000-0000-0000-0000-00000000000b');
select tests.throws(
  $$insert into public.facility_products (facility_id, name, kind, price_php, duration_days)
    values ('cat_gym', 'Staff Special', 'PASS', 100, 1)$$,
  'row-level security', 'front-desk staff cannot create products');
select tests.reset_actor();

select tests.act_as('b3000000-0000-0000-0000-00000000000b');
select tests.throws(
  $$insert into public.facility_products (facility_id, name, kind, price_php, duration_days)
    values ('cat_gym', 'Sabotage', 'PASS', 1, 1)$$,
  'row-level security', 'another venue''s owner cannot create products here');
select tests.reset_actor();

select tests.act_as('b1000000-0000-0000-0000-00000000000b');
insert into public.facility_products (id, facility_id, name, kind, price_php, duration_days, sort_order) values
  ('d1000000-0000-0000-0000-000000000001', 'cat_gym', 'Weekly pass', 'PASS', 900, 7, 2),
  ('d2000000-0000-0000-0000-000000000002', 'cat_gym', 'Annual membership', 'MEMBERSHIP', 20000, 365, 3),
  ('d3000000-0000-0000-0000-000000000003', 'cat_gym', 'Old promo', 'PASS', 50, 1, 9);
update public.facility_products set is_active = false where id = 'd3000000-0000-0000-0000-000000000003';
select tests.throws(
  $$insert into public.facility_products (facility_id, name, kind, price_php, duration_days) values ('cat_gym', 'Free', 'PASS', 0, 1)$$,
  'check constraint', 'a product must have a price');
select tests.throws(
  $$insert into public.facility_products (facility_id, name, kind, price_php, duration_days) values ('cat_gym', 'Forever', 'PASS', 100, 9999)$$,
  'check constraint', 'a product lasts at most 366 days');
select tests.throws(
  $$insert into public.facility_products (facility_id, name, kind, price_php, duration_days, legacy_sku) values ('cat_gym', 'Sneaky', 'PASS', 100, 1, 'DAY_PASS')$$,
  'permission denied', 'the standard-product link is not client-writable');
select tests.throws(
  $$delete from public.facility_products where id = 'd3000000-0000-0000-0000-000000000003'$$,
  'permission denied', 'products are switched off, never deleted');

-- standard products mirror into the original price columns
select public.create_standard_product('cat_gym', 'DAY_PASS', 300);
select public.create_standard_product('cat_gym', 'MONTHLY', 2000);
select tests.throws($$select public.create_standard_product('cat_gym', 'DAY_PASS', 350)$$,
  'duplicate key', 'a venue has one standard day pass');
select tests.reset_actor();

select tests.ok(
  (select day_pass_price_php = 300 and monthly_sub_price_php = 2000 from public.facilities where id = 'cat_gym'),
  'standard product prices are mirrored for app versions that predate the catalogue');

select tests.act_as('b2000000-0000-0000-0000-00000000000b');
select tests.throws($$select public.create_standard_product('cat_gym', 'MONTHLY', 1)$$,
  'FORBIDDEN', 'front-desk staff cannot create standard products');
select tests.ok((select count(*) from public.facility_products where facility_id = 'cat_gym') = 5,
  'staff see every product, including switched-off ones');
select tests.reset_actor();

-- ------------------------------------------------------------ what buyers see
select tests.act_as_anon();
select tests.ok((select count(*) from public.facility_products where facility_id = 'cat_gym') = 4,
  'the public sees only products that are switched on');
select tests.reset_actor();

-- ------------------------------------------------------------ buying a catalogue product
select tests.act_as('c1000000-0000-0000-0000-000000000001');
create temp table week as
  select * from public.create_payment_order('cat_gym', 'd1000000-0000-0000-0000-000000000001', 'key-week-0001');
grant select on week to public;
select tests.ok(
  (select total_php = 915.00 and sku = 'PRODUCT' and product_name = 'Weekly pass' and duration_days = 7 from week),
  'a one-off product is priced server-side: ₱900 + ₱15, and the order remembers what was bought');
select tests.ok(
  (public.create_payment_order('cat_gym', 'd2000000-0000-0000-0000-000000000002', 'key-year-0001')).total_php = 21000.00,
  'a membership product carries the 5% fee');
select tests.throws(
  $$select public.create_payment_order('cat_gym', 'd3000000-0000-0000-0000-000000000003', 'key-off-00001')$$,
  'PRODUCT_NOT_AVAILABLE', 'a switched-off product cannot be bought');
select tests.throws(
  $$select public.create_payment_order('cat_rival', 'd1000000-0000-0000-0000-000000000001', 'key-cross-001')$$,
  'PRODUCT_NOT_AVAILABLE', 'a product cannot be bought through a different venue');
select tests.ok(
  (public.create_payment_order('cat_gym', 'DAY_PASS', 'key-legacy-01')).total_php = 315.00,
  'the original DAY_PASS SKU still works and charges the standard product''s price');
select tests.reset_actor();

-- editing a product does not change an order already placed
select tests.act_as('b1000000-0000-0000-0000-00000000000b');
update public.facility_products set price_php = 950, name = 'Week pass (new)' where id = 'd1000000-0000-0000-0000-000000000001';
select tests.reset_actor();
select tests.ok((select total_php = 915.00 and product_name = 'Weekly pass' from public.payment_orders where id = (select id from week)),
  'a later price or name change does not alter an existing order');

select tests.act_as_service();
select public.attach_payment_checkout((select id from week), 'inv_week', 'https://checkout.example/inv_week');
select tests.ok((public.settle_payment_order((select id from week), 'XENDIT', 'inv_week', 915)).status = 'PAID',
  'the product order settles');
select tests.reset_actor();
select tests.ok(
  (select p.valid_until between now() + interval '6 days 23 hours' and now() + interval '7 days 1 hour'
          and p.pass_type = 'Weekly pass'
     from public.passes p join public.payment_orders o on o.pass_id = p.id where o.id = (select id from week)),
  'the pass lasts as long as the product and carries its name');

-- ------------------------------------------------------------ selling switches
select tests.act_as('b2000000-0000-0000-0000-00000000000b');
update public.facilities set sells_memberships = false where id = 'cat_gym';
select tests.reset_actor();
select tests.ok((select sells_memberships from public.facilities where id = 'cat_gym'),
  'front-desk staff cannot change what the venue sells');

select tests.act_as('b1000000-0000-0000-0000-00000000000b');
update public.facilities set sells_memberships = false where id = 'cat_gym';
select tests.reset_actor();

select tests.act_as('c1000000-0000-0000-0000-000000000001');
select tests.throws(
  $$select public.create_payment_order('cat_gym', 'd2000000-0000-0000-0000-000000000002', 'key-year-0002')$$,
  'PRODUCT_NOT_AVAILABLE', 'a venue that does not offer memberships cannot sell one');
select tests.throws(
  $$select public.create_payment_order('cat_gym', 'MONTHLY', 'key-legacy-02')$$,
  'PRODUCT_NOT_AVAILABLE', 'the original MONTHLY SKU is refused too');
select tests.ok(
  (public.create_payment_order('cat_gym', 'd1000000-0000-0000-0000-000000000001', 'key-week-0002')).total_php = 965.00,
  'passes are still sold, at the new price');
select tests.reset_actor();

-- switching the standard day pass off stops app versions that predate the catalogue from buying it
select tests.act_as('b1000000-0000-0000-0000-00000000000b');
update public.facility_products set is_active = false where facility_id = 'cat_gym' and legacy_sku = 'DAY_PASS';
select tests.reset_actor();
select tests.act_as('c1000000-0000-0000-0000-000000000001');
select tests.throws($$select public.create_payment_order('cat_gym', 'DAY_PASS', 'key-legacy-03')$$,
  'SKU_NOT_FOR_SALE', 'a switched-off standard day pass is not sold through the original SKU either');
select tests.reset_actor();

-- ------------------------------------------------------------ grace period
select tests.create_user('c2000000-0000-0000-0000-000000000002', 'Just Lapsed');
insert into public.facility_memberships (facility_id, user_id, source) values ('cat_gym', 'c2000000-0000-0000-0000-000000000002', 'PURCHASE');
insert into public.passes (owner_id, facility_id, valid_until)
values ('c2000000-0000-0000-0000-000000000002', 'cat_gym', now() - interval '2 days');

select tests.act_as('b1000000-0000-0000-0000-00000000000b');
select tests.ok(
  (select standing from public.facility_member_directory('cat_gym') where user_id = 'c2000000-0000-0000-0000-000000000002') = 'LAPSED',
  'with no grace period a member is lapsed as soon as the pass ends');
update public.facilities set membership_grace_days = 3 where id = 'cat_gym';
select tests.ok(
  (select standing from public.facility_member_directory('cat_gym') where user_id = 'c2000000-0000-0000-0000-000000000002') = 'ACTIVE',
  'within the venue''s grace period the member still counts as active');
select tests.ok(
  (select pass_valid_until is null from public.facility_member_directory('cat_gym') where user_id = 'c2000000-0000-0000-0000-000000000002'),
  'but they hold no valid pass, so the door still refuses them');
select tests.throws($$update public.facilities set membership_grace_days = 90 where id = 'cat_gym'$$,
  'check constraint', 'the grace period is capped at 30 days');
select tests.reset_actor();

rollback;
