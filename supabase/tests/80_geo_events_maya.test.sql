\set ON_ERROR_STOP on
begin;

select tests.create_user('a0000000-0000-0000-0000-00000000000a', 'Owner');
select tests.create_user('0a000000-0000-0000-0000-0000000000a0', 'Organizer Olive');
select tests.create_user('11111111-1111-1111-1111-111111111111', 'Runner One');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'Runner Two');
update public.profiles set roles = array['individual', 'organizer'] where id = '0a000000-0000-0000-0000-0000000000a0';

-- ---------------------------------------------------------------- slugs & nearby
insert into public.facilities (id, owner_id, name, registry_type, lat, lng, day_pass_price_php) values
  ('fac_bgc', 'a0000000-0000-0000-0000-00000000000a', 'Taguig Lift Lab!', 'COMMERCIAL', 14.5490, 121.0500, 250),
  ('fac_bgc2', 'a0000000-0000-0000-0000-00000000000a', 'Taguig Lift Lab', 'COMMERCIAL', 14.5510, 121.0480, 250),
  ('fac_qc', 'a0000000-0000-0000-0000-00000000000a', 'QC Court Club', 'COMMUNITY', 14.6760, 121.0437, null);

select tests.ok((select slug from public.facilities where id = 'fac_bgc') = 'taguig-lift-lab', 'slug generated from name');
select tests.ok((select slug from public.facilities where id = 'fac_bgc2') ~ '^taguig-lift-lab-[0-9a-f]{5}$',
  'duplicate names get a unique slug');
select tests.throws($$update public.facilities set slug = 'Bad Slug!' where id = 'fac_bgc'$$, 'check constraint',
  'slugs must be URL-safe');

select tests.act_as_anon();
select tests.ok((select count(*) from public.facilities_nearby(14.5500, 121.0490, 2) where id like 'fac_bgc%') = 2
  and (select count(*) from public.facilities_nearby(14.5500, 121.0490, 2) where id = 'fac_qc') = 0,
  'nearby search (signed-out) finds the two BGC gyms within 2 km');
select tests.ok((select array_agg(id order by distance_km) = array_agg(id) from public.facilities_nearby(14.5500, 121.0490, 50)),
  'results are ordered nearest first');
select tests.ok((select bool_and(registry_type = 'COMMUNITY') and bool_or(id = 'fac_qc') from public.facilities_nearby(14.5500, 121.0490, 50, 'COMMUNITY')),
  'nearby search can filter by registry');
select tests.ok(
  (select distance_km from public.facilities_nearby(14.5500, 121.0490, 50, 'COMMUNITY') where id = 'fac_qc') between 13 and 15,
  'distance BGC→QC is ~14 km');
select tests.reset_actor();

-- ---------------------------------------------------------------- GPS routes
select tests.act_as('11111111-1111-1111-1111-111111111111');
insert into public.workouts_move (type, route_geojson, distance_km)
values ('RUN', '{"type":"LineString","coordinates":[[121.0500,14.5490],[121.0500,14.5580]]}', 42);
select tests.ok((select distance_km from public.workouts_move) between 0.99 and 1.0,
  'distance is computed from the GPS route (client-sent 42 km ignored)');
select tests.throws(
  $$insert into public.workouts_move (type, route_geojson) values ('RUN', '{"type":"Point","coordinates":[121,14]}')$$,
  'ROUTE_MUST_BE_GEOJSON_LINESTRING', 'only LineString routes are accepted');
select tests.throws(
  $$insert into public.workouts_move (type, route_geojson) values ('RUN', '{"type":"LineString","coordinates":[[121,14]]}')$$,
  'ROUTE_POINT_COUNT_OUT_OF_RANGE', 'a route needs at least two points');
select tests.reset_actor();

-- ---------------------------------------------------------------- events
select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.throws(
  $$insert into public.events (title, starts_at) values ('Rogue meetup', now() + interval '1 day')$$,
  'row-level security', 'plain users cannot create events');
select tests.reset_actor();

select tests.act_as('0a000000-0000-0000-0000-0000000000a0');
create temp table ev as
  with ins as (insert into public.events (title, starts_at, capacity)
               values ('BGC 5K Fun Run', now() + interval '1 day', 1) returning id)
  select id from ins;
create temp table ev_code as select public.get_qr_code('EVENT', (select id::text from ev)) ->> 'token' as token;
grant select on ev_code to public;
select tests.ok((select token from ev_code) is not null, 'events get their own QR code');
select tests.reset_actor();

select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.ok(public.redeem_qr_code((select token from ev_code)) ->> 'status' = 'REGISTERED', 'scan-to-register works');
select tests.reset_actor();
select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok(public.redeem_qr_code((select token from ev_code)) ->> 'status' = 'EVENT_FULL', 'capacity is enforced');
select tests.ok(public.resolve_qr_code((select token from ev_code)) #>> '{subject,spots_left}' = '0', 'preview shows spots left');
select tests.reset_actor();

-- ---------------------------------------------------------------- Maya routing
insert into public.facility_payout_accounts (facility_id, charges_enabled, preferred_provider)
values ('fac_bgc', true, 'MAYA');
select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.ok((public.create_payment_order('fac_bgc', 'DAY_PASS', 'maya-test-0001')).provider = 'MAYA',
  'a facility can be routed to Maya');
select tests.ok((public.create_payment_order('fac_bgc', 'DAY_PASS', 'maya-test-0001')).total_php = 265,
  'Maya orders use the same server-side price + fee');
select tests.reset_actor();

rollback;
