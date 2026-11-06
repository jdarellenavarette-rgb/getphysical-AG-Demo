\set ON_ERROR_STOP on
begin;

select tests.create_user('a0000000-0000-0000-0000-00000000000a', 'Club Owner');
select tests.create_user('c0000000-0000-0000-0000-00000000000c', 'Coach Carla');
select tests.create_user('11111111-1111-1111-1111-111111111111', 'Athlete One');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'Athlete Two');
update public.profiles set roles = array['individual', 'coach'] where id = 'c0000000-0000-0000-0000-00000000000c';
update public.profiles set is_private = true where id = '22222222-2222-2222-2222-222222222222';

insert into public.facilities (id, owner_id, name, registry_type)
values ('fac_club', 'a0000000-0000-0000-0000-00000000000a', 'BGC Pickleball Club', 'COMMUNITY'),
       ('fac_gym', 'a0000000-0000-0000-0000-00000000000a', 'Metro Gym', 'COMMERCIAL');

-- ---------------------------------------------------------------- issuance
select tests.ok((select count(*) from public.qr_codes where kind = 'USER' and status = 'ACTIVE') = 4,
  'every new profile gets a USER code automatically');
select tests.ok((select count(*) from public.qr_codes where kind = 'FACILITY' and facility_id in ('fac_club', 'fac_gym')) = 2,
  'every new facility gets a FACILITY code automatically');
select tests.ok((select bool_and(token ~ '^[A-Za-z0-9_-]{22}$') from public.qr_codes),
  'tokens are 22-char base64url (128 random bits)');
select tests.ok((select count(*) = count(distinct token) from public.qr_codes), 'tokens are unique');

-- 10,000 tokens from the generator never repeat
select tests.ok((select count(distinct public.new_qr_token()) from generate_series(1, 10000)) = 10000,
  '10,000 generated tokens are all distinct');

select tests.throws(
  $$insert into public.qr_codes (token, kind, user_id)
    select token, kind, user_id from public.qr_codes where kind = 'USER' limit 1$$,
  'duplicate key', 'the database rejects a repeated token');
select tests.throws(
  $$insert into public.qr_codes (token, kind, user_id)
    values (public.new_qr_token(), 'USER', '11111111-1111-1111-1111-111111111111')$$,
  'duplicate key', 'only one ACTIVE code per subject');

-- ---------------------------------------------------------------- access control
select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.throws($$select token from public.qr_codes$$, 'permission denied', 'codes are not listable');
create temp table my_code as select public.get_qr_code('USER') ->> 'token' as token;
grant select on my_code to public;
select tests.ok((select token from my_code) is not null, 'a user can fetch their own friend code');
select tests.ok(public.get_qr_code('USER') ->> 'token' = (select token from my_code), 'fetching again returns the same code');
select tests.throws($$select public.get_qr_code('COACH')$$, 'ROLE_NOT_GRANTED', 'only coaches get a COACH code');
select tests.throws($$select public.get_qr_code('FACILITY', 'fac_club')$$, 'FORBIDDEN', 'only staff can fetch a facility code');
select tests.throws($$select public.get_qr_code('USER', '22222222-2222-2222-2222-222222222222')$$, 'FORBIDDEN',
  'cannot fetch someone else''s code');
select tests.reset_actor();

-- ---------------------------------------------------------------- resolve (public preview)
select tests.act_as_anon();
select tests.ok(public.resolve_qr_code((select token from my_code)) #>> '{subject,name}' = 'Athlete One',
  'anyone can preview who a QR belongs to');
select tests.ok(public.resolve_qr_code((select token from my_code)) -> 'subject' ? 'dob' = false,
  'preview exposes no private fields');
select tests.ok(public.resolve_qr_code('AAAAAAAAAAAAAAAAAAAAAA') ->> 'status' = 'NOT_FOUND', 'unknown code resolves to NOT_FOUND');
select tests.throws($$select public.redeem_qr_code('AAAAAAAAAAAAAAAAAAAAAA')$$, 'permission denied', 'anon cannot redeem');
select tests.reset_actor();

-- ---------------------------------------------------------------- redeem: add friend
create temp table codes as
select kind::text as kind, coalesce(user_id::text, facility_id) as subject, token
  from public.qr_codes where status = 'ACTIVE';
grant select on codes to public;

select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.ok(public.redeem_qr_code((select token from my_code)) ->> 'status' = 'SELF', 'scanning your own code does nothing');
select tests.ok(
  public.redeem_qr_code((select token from codes where subject = '22222222-2222-2222-2222-222222222222')) ->> 'status' = 'PENDING',
  'scanning a private account sends a follow request');
select tests.ok(
  public.redeem_qr_code((select token from codes where subject = 'a0000000-0000-0000-0000-00000000000a')) ->> 'status' = 'ACCEPTED',
  'scanning a public account follows immediately');

-- ---------------------------------------------------------------- redeem: facilities
select tests.ok(
  public.redeem_qr_code((select token from codes where subject = 'fac_club')) ->> 'status' = 'JOINED',
  'scanning a community club joins it');
select tests.ok(
  public.redeem_qr_code((select token from codes where subject = 'fac_club')) ->> 'status' = 'ALREADY_MEMBER',
  'scanning again is idempotent');
select tests.ok(
  public.redeem_qr_code((select token from codes where subject = 'fac_gym')) ->> 'status' = 'PURCHASE_REQUIRED',
  'scanning a commercial gym routes to purchase, not free entry');
select tests.reset_actor();

-- ---------------------------------------------------------------- redeem: coach enrolment
select tests.act_as('c0000000-0000-0000-0000-00000000000c');
create temp table coach_code as select public.get_qr_code('COACH') ->> 'token' as token;
grant select on coach_code to public;
select tests.reset_actor();

select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.ok(public.redeem_qr_code((select token from coach_code)) ->> 'status' = 'PENDING',
  'scanning a coach code creates a pending enrolment');
select tests.reset_actor();

select tests.act_as('c0000000-0000-0000-0000-00000000000c');
update public.coach_clients set status = 'ACTIVE' where client_id = '11111111-1111-1111-1111-111111111111';
select tests.ok((select status from public.coach_clients where client_id = '11111111-1111-1111-1111-111111111111') = 'ACTIVE',
  'coach approves the enrolment');
select tests.reset_actor();

-- ---------------------------------------------------------------- rotation
select tests.act_as('a0000000-0000-0000-0000-00000000000a');
create temp table rotated as select public.rotate_qr_code('FACILITY', 'fac_club') ->> 'token' as token;
grant select on rotated to public;
select tests.reset_actor();
select tests.ok((select token from rotated) <> (select token from codes where subject = 'fac_club'), 'rotation issues a new code');
select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok(public.redeem_qr_code((select token from codes where subject = 'fac_club')) ->> 'status' = 'REVOKED',
  'the old (leaked) code stops working immediately');
select tests.ok(public.redeem_qr_code((select token from rotated)) ->> 'status' = 'JOINED', 'the new code works');
select tests.reset_actor();

rollback;
