-- =============================================================================
-- Gate access: per-pass TOTP secrets + server-side verification.
--
-- Algorithm (must match packages/sodia-core/src/totp.ts):
--   RFC 6238 TOTP, HMAC-SHA256, 60-second step, T0 = 0, 6 digits.
-- The secret is random per pass, readable only by the pass owner (so the phone
-- can render codes offline) and rotated whenever the pass changes hands.
-- QR payload: "GP2:<pass_uuid>:<6-digit code>".
-- =============================================================================

create table public.pass_credentials (
  pass_id uuid primary key references public.passes (id) on delete cascade,
  secret bytea not null default extensions.gen_random_bytes(32),
  rotated_at timestamptz not null default now()
);

create function public.provision_pass_credential()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.pass_credentials (pass_id) values (new.id)
    on conflict (pass_id) do nothing;
  elsif new.owner_id is distinct from old.owner_id then
    update public.pass_credentials
       set secret = extensions.gen_random_bytes(32), rotated_at = now()
     where pass_id = new.id;
  end if;
  return null;
end;
$$;

create trigger passes_provision_credential
  after insert or update of owner_id on public.passes
  for each row execute function public.provision_pass_credential();

-- RFC 6238 / RFC 4226 dynamic truncation over HMAC-SHA256.
create function public.totp_code(p_secret bytea, p_counter bigint)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  with mac as (
    select extensions.hmac(int8send(p_counter), p_secret, 'sha256') as h
  ),
  off as (
    select h, get_byte(h, 31) & 15 as o from mac
  )
  select lpad(
    ((((get_byte(h, o) & 127)::bigint << 24)
      | (get_byte(h, o + 1)::bigint << 16)
      | (get_byte(h, o + 2)::bigint << 8)
      | get_byte(h, o + 3)::bigint) % 1000000)::text,
    6, '0')
  from off;
$$;

-- -----------------------------------------------------------------------------
-- verify_pass_code: called by GymDash / Staff scanner. Only staff of the pass's
-- facility may call it. Every attempt is written to the append-only
-- access_scans table. Includes replay protection and brute-force throttling.
-- -----------------------------------------------------------------------------
create function public.verify_pass_code(
  p_pass_id uuid,
  p_code text,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_pass public.passes%rowtype;
  v_secret bytea;
  v_member_name text;
  v_avatar text;
  v_counter bigint;
  v_window bigint;
  v_matched bigint;
  v_recent_denials integer;
  v_reason text;
  v_scan_id uuid;
  v_code text := regexp_replace(coalesce(p_code, ''), '[^0-9]', '', 'g');
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  -- Clock is server time; p_at exists only so tests can pin time.
  if p_at is distinct from now() and coalesce(auth.role(), '') <> 'service_role' then
    p_at := now();
  end if;

  select * into v_pass from public.passes where id = p_pass_id;
  if not found then
    return jsonb_build_object('granted', false, 'reason', 'PASS_NOT_FOUND');
  end if;
  if not public.is_facility_staff(v_pass.facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select coalesce(nullif(p.name, ''), p.username::text, 'Member'), coalesce(p.avatar_url, p.avatar)
    into v_member_name, v_avatar
    from public.profiles p
   where p.id = v_pass.owner_id;
  v_member_name := coalesce(v_member_name, 'Member');

  v_counter := floor(extract(epoch from p_at) / 60)::bigint;

  select count(*) into v_recent_denials
    from public.access_scans
   where pass_id = p_pass_id
     and status = 'DENIED'
     and created_at > p_at - interval '5 minutes';

  if v_recent_denials >= 5 then
    v_reason := 'RATE_LIMITED';
  elsif v_pass.status <> 'ACTIVE' then
    v_reason := 'PASS_' || v_pass.status::text;
  elsif v_pass.valid_until <= p_at then
    v_reason := 'PASS_EXPIRED';
  elsif v_code !~ '^[0-9]{6}$' then
    v_reason := 'INVALID_CODE';
  else
    select secret into v_secret from public.pass_credentials where pass_id = p_pass_id;
    -- Accept one step of clock drift either side (RFC 6238 §5.2).
    foreach v_window in array array[v_counter, v_counter - 1, v_counter + 1] loop
      if public.totp_code(v_secret, v_window) = v_code then
        v_matched := v_window;
        exit;
      end if;
    end loop;
    if v_matched is null then
      v_reason := 'INVALID_CODE';
    end if;
  end if;

  if v_reason is null then
    begin
      insert into public.access_scans (
        facility_id, user_id, pass_id, scanned_by, member_name, avatar, status, totp_window, created_at
      )
      values (
        v_pass.facility_id, v_pass.owner_id, v_pass.id, v_uid, v_member_name, v_avatar,
        'GRANTED', v_matched, p_at
      )
      returning id into v_scan_id;
    exception when unique_violation then
      v_reason := 'CODE_ALREADY_USED';
    end;
  end if;

  if v_reason is not null then
    insert into public.access_scans (
      facility_id, user_id, pass_id, scanned_by, member_name, avatar, status, reason, created_at
    )
    values (
      v_pass.facility_id, v_pass.owner_id, v_pass.id, v_uid, v_member_name, v_avatar,
      'DENIED', v_reason, p_at
    )
    returning id into v_scan_id;
  end if;

  return jsonb_build_object(
    'granted', v_reason is null,
    'reason', v_reason,
    'scan_id', v_scan_id,
    'pass_id', v_pass.id,
    'member_name', v_member_name,
    'valid_until', v_pass.valid_until
  );
end;
$$;
