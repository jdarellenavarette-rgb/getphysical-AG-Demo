\set ON_ERROR_STOP on
begin;

-- RFC 6238 Appendix B, SHA-256 seed, truncated to 6 digits. Our step is 60s,
-- so feed the RFC's 30s counters directly.
select tests.ok(public.totp_code(convert_to('12345678901234567890123456789012', 'UTF8'), 1) = '119246',
  'RFC 6238 vector T=59');
select tests.ok(public.totp_code(convert_to('12345678901234567890123456789012', 'UTF8'), 37037036) = '084774',
  'RFC 6238 vector T=1111111109');
select tests.ok(public.totp_code(convert_to('12345678901234567890123456789012', 'UTF8'), 41152263) = '819424',
  'RFC 6238 vector T=1234567890');
select tests.ok(public.totp_code(convert_to('12345678901234567890123456789012', 'UTF8'), 666666666) = '737706',
  'RFC 6238 vector T=20000000000');

select tests.create_user('a0000000-0000-0000-0000-00000000000a', 'Gym Owner');
select tests.create_user('50000000-0000-0000-0000-000000000005', 'Desk Staff');
select tests.create_user('b0000000-0000-0000-0000-00000000000b', 'Rival Staff');
select tests.create_user('11111111-1111-1111-1111-111111111111', 'Member One');
select tests.create_user('22222222-2222-2222-2222-222222222222', 'Member Two');

insert into public.facilities (id, owner_id, name, registry_type)
values ('fac_a', 'a0000000-0000-0000-0000-00000000000a', 'Gym A', 'COMMERCIAL'),
       ('fac_b', 'b0000000-0000-0000-0000-00000000000b', 'Gym B', 'COMMERCIAL');
insert into public.facility_staff (facility_id, user_id, role)
values ('fac_a', '50000000-0000-0000-0000-000000000005', 'STAFF');

insert into public.passes (id, owner_id, facility_id)
values ('9a000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'fac_a');

select tests.ok(
  (select octet_length(secret) from public.pass_credentials where pass_id = '9a000000-0000-0000-0000-000000000001') = 32,
  'a 256-bit secret is provisioned for every new pass');

-- ---------------------------------------------------------------- secret access
select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.ok((select count(*) from public.pass_credentials) = 1, 'owner can read their pass secret');
select tests.throws($$insert into public.passes (owner_id, facility_id) values (auth.uid(), 'fac_a')$$,
  'permission denied', 'clients cannot mint passes');
select tests.reset_actor();

select tests.act_as('22222222-2222-2222-2222-222222222222');
select tests.ok((select count(*) from public.pass_credentials) = 0, 'other users cannot read the secret');
select tests.reset_actor();

select tests.act_as('50000000-0000-0000-0000-000000000005');
select tests.ok((select count(*) from public.pass_credentials) = 0, 'staff cannot read the secret either');
select tests.ok((select count(*) from public.passes) = 1, 'staff can see passes for their facility');
select tests.reset_actor();

-- ---------------------------------------------------------------- verification
create temp table current_code as
select public.totp_code(secret, floor(extract(epoch from now()) / 60)::bigint) as code
  from public.pass_credentials where pass_id = '9a000000-0000-0000-0000-000000000001';
grant select on current_code to authenticated;

select tests.act_as('b0000000-0000-0000-0000-00000000000b');
select tests.throws(
  $$select public.verify_pass_code('9a000000-0000-0000-0000-000000000001', (select code from current_code))$$,
  'FORBIDDEN', 'staff of another facility cannot verify this pass');
select tests.reset_actor();

select tests.act_as('50000000-0000-0000-0000-000000000005');
select tests.ok(
  (public.verify_pass_code('9a000000-0000-0000-0000-000000000001', (select code from current_code)) ->> 'granted')::boolean,
  'valid code opens the gate');
select tests.ok(
  public.verify_pass_code('9a000000-0000-0000-0000-000000000001', (select code from current_code)) ->> 'reason'
    = 'CODE_ALREADY_USED',
  'replaying the same code is rejected');
select tests.ok(
  public.verify_pass_code('9a000000-0000-0000-0000-000000000001',
    case (select code from current_code) when '000000' then '000001' else '000000' end) ->> 'reason' = 'INVALID_CODE',
  'wrong code is rejected');
select tests.ok(
  public.verify_pass_code('9a000000-0000-0000-0000-000000000099', '123456') ->> 'reason' = 'PASS_NOT_FOUND',
  'unknown pass is rejected');
select tests.ok(
  (select count(*) from public.access_scans where pass_id = '9a000000-0000-0000-0000-000000000001') = 3,
  'every attempt is audited in access_scans');
select tests.reset_actor();

-- brute force throttle: 5 denials in 5 minutes locks the pass
select tests.act_as('50000000-0000-0000-0000-000000000005');
select public.verify_pass_code('9a000000-0000-0000-0000-000000000001', 'abc') from generate_series(1, 4);
select tests.ok(
  public.verify_pass_code('9a000000-0000-0000-0000-000000000001', (select code from current_code)) ->> 'reason'
    = 'RATE_LIMITED',
  'pass is throttled after repeated failures');
select tests.reset_actor();

-- expired and revoked passes
insert into public.passes (id, owner_id, facility_id, valid_until)
values ('9a000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'fac_a', now() - interval '1 minute');
select tests.act_as('50000000-0000-0000-0000-000000000005');
select tests.ok(
  public.verify_pass_code('9a000000-0000-0000-0000-000000000002', '123456') ->> 'reason' = 'PASS_EXPIRED',
  'expired pass is rejected');
select tests.reset_actor();

-- gifting rotates the secret so the previous owner's device stops working
create temp table old_secret as
select secret from public.pass_credentials where pass_id = '9a000000-0000-0000-0000-000000000002';
update public.passes set owner_id = '11111111-1111-1111-1111-111111111111'
 where id = '9a000000-0000-0000-0000-000000000002';
select tests.ok(
  (select secret from public.pass_credentials where pass_id = '9a000000-0000-0000-0000-000000000002')
    <> (select secret from old_secret),
  'secret rotates when a pass changes owner');

-- ---------------------------------------------------------------- append-only
select tests.throws($$update public.access_scans set status = 'GRANTED'$$,
  'append-only', 'access_scans cannot be updated (even by the owner role)');
select tests.throws($$delete from public.access_scans$$,
  'append-only', 'access_scans cannot be deleted');
select tests.act_as_service();
select tests.throws($$update public.access_scans set reason = null$$,
  'permission denied', 'service_role cannot update access_scans');
select tests.reset_actor();

rollback;
