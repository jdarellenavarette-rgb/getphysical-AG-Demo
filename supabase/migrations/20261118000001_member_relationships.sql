-- =============================================================================
-- Member ↔ business relationships: one definition of a member's standing.
--
-- Two records describe a member at a venue:
--   * facility_memberships — the relationship (how they joined, whether they
--     or the venue ended it, whether they muted broadcasts);
--   * passes               — time-limited door access.
-- Until now each screen read one of them and drew its own conclusion. This
-- migration derives a single STANDING from both, in one place, for both apps:
--
--   CANCELLED  the membership was ended by the member or the venue
--   PENDING    awaiting approval
--   ACTIVE     holds a valid pass, or belongs to a community club (no pass needed)
--   LAPSED     commercial gym member whose last pass has ended
--   NO_PASS    commercial gym member who has never held a pass (e.g. added at the desk)
--
-- Standing is computed, never stored, so pass expiry and refunds change it
-- immediately with no scheduled job.
-- =============================================================================

alter table public.facility_memberships
  add column broadcasts_muted boolean not null default false;

comment on column public.facility_memberships.broadcasts_muted is
  'Member opted out of this venue''s broadcasts. Direct replies are still delivered.';

-- Broadcasts can now target members by standing (active only, or lapsed for win-back).
alter table public.crm_broadcasts drop constraint crm_broadcasts_audience_check;
alter table public.crm_broadcasts
  add constraint crm_broadcasts_audience_check check (audience in ('ALL', 'ACTIVE', 'LAPSED', 'SEGMENT', 'USER'));

-- -----------------------------------------------------------------------------
-- Internal: membership rows with standing. No authorization here; callers check.
-- Either filter may be null (all members of a venue, or all venues of a person).
-- -----------------------------------------------------------------------------
create function private.membership_standing_rows(p_facility_id text, p_user_id uuid)
returns table (
  facility_id text,
  user_id uuid,
  membership_status public.membership_status,
  source text,
  joined_at timestamptz,
  broadcasts_muted boolean,
  registry_type public.registry_type,
  pass_valid_until timestamptz,
  last_pass_ended_at timestamptz,
  standing text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.facility_id,
    m.user_id,
    m.status,
    m.source,
    m.joined_at,
    m.broadcasts_muted,
    f.registry_type,
    p.valid_until,
    p.ended_at,
    case
      when m.status = 'CANCELLED' then 'CANCELLED'
      when m.status = 'PENDING' then 'PENDING'
      when p.valid_until is not null then 'ACTIVE'
      when f.registry_type = 'COMMUNITY' then 'ACTIVE'
      when p.ended_at is not null then 'LAPSED'
      else 'NO_PASS'
    end
  from public.facility_memberships m
  join public.facilities f on f.id = m.facility_id
  left join lateral (
    select
      max(ps.valid_until) filter (where ps.status = 'ACTIVE' and ps.valid_until > now()) as valid_until,
      -- When access last ended: an expired pass's end date, or the creation date of a revoked one.
      max(case when ps.status = 'ACTIVE' then ps.valid_until else ps.created_at end)
        filter (where ps.status <> 'ACTIVE' or ps.valid_until <= now()) as ended_at
    from public.passes ps
    where ps.facility_id = m.facility_id and ps.owner_id = m.user_id
  ) p on true
  where (p_facility_id is null or m.facility_id = p_facility_id)
    and (p_user_id is null or m.user_id = p_user_id);
$$;

revoke all on function private.membership_standing_rows(text, uuid) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Business side: the venue's member directory (staff only).
-- -----------------------------------------------------------------------------
create function public.facility_member_directory(p_facility_id text)
returns table (
  user_id uuid,
  name text,
  username text,
  avatar_url text,
  membership_status public.membership_status,
  source text,
  joined_at timestamptz,
  standing text,
  pass_valid_until timestamptz,
  last_pass_ended_at timestamptz,
  last_visit_at timestamptz,
  broadcasts_muted boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_staff(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  return query
    select
      r.user_id,
      coalesce(nullif(pr.name, ''), pr.username::text, 'Member'),
      pr.username::text,
      coalesce(pr.avatar_url, pr.avatar),
      r.membership_status,
      r.source,
      r.joined_at,
      r.standing,
      r.pass_valid_until,
      r.last_pass_ended_at,
      (select max(s.created_at) from public.access_scans s
        where s.facility_id = r.facility_id and s.user_id = r.user_id and s.status = 'GRANTED'),
      r.broadcasts_muted
    from private.membership_standing_rows(p_facility_id, null) r
    join public.profiles pr on pr.id = r.user_id
    order by r.joined_at desc nulls last;
end;
$$;

-- -----------------------------------------------------------------------------
-- Member side: the venues I belong to, with my standing at each.
-- -----------------------------------------------------------------------------
create function public.my_memberships()
returns table (
  facility_id text,
  facility_name text,
  slug text,
  logo_url text,
  registry_type public.registry_type,
  standing text,
  pass_valid_until timestamptz,
  broadcasts_muted boolean,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.facility_id,
    f.name,
    f.slug,
    coalesce(f.logo_url, f.logo),
    r.registry_type,
    r.standing,
    r.pass_valid_until,
    r.broadcasts_muted,
    r.joined_at
  from private.membership_standing_rows(null, auth.uid()) r
  join public.facilities f on f.id = r.facility_id
  where auth.uid() is not null
    and r.standing <> 'CANCELLED'
  order by r.joined_at desc nulls last;
$$;

-- Member leaves a venue. A pass they paid for stays valid until it ends; only a
-- refund or the venue revokes it.
create function public.leave_facility(p_facility_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  update public.facility_memberships
     set status = 'CANCELLED'
   where facility_id = p_facility_id and user_id = auth.uid() and status <> 'CANCELLED';
  if not found then
    raise exception 'NOT_A_MEMBER' using errcode = 'P0002';
  end if;
end;
$$;

-- Member mutes or unmutes a venue's broadcasts.
create function public.set_venue_broadcasts_muted(p_facility_id text, p_muted boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  update public.facility_memberships
     set broadcasts_muted = coalesce(p_muted, false)
   where facility_id = p_facility_id and user_id = auth.uid();
  if not found then
    raise exception 'NOT_A_MEMBER' using errcode = 'P0002';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Venue ends a membership: the relationship is cancelled AND door access stops.
-- Owners and admins only, because it takes away something a member may have paid for.
-- -----------------------------------------------------------------------------
create function public.end_membership(p_facility_id text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_revoked integer;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.facility_memberships
     set status = 'CANCELLED'
   where facility_id = p_facility_id and user_id = p_user_id;
  if not found then
    raise exception 'NOT_A_MEMBER' using errcode = 'P0002';
  end if;

  update public.passes
     set status = 'REVOKED'
   where facility_id = p_facility_id and owner_id = p_user_id
     and status = 'ACTIVE' and valid_until > now();
  get diagnostics v_revoked = row_count;

  return jsonb_build_object('revoked_passes', v_revoked);
end;
$$;

-- -----------------------------------------------------------------------------
-- Venue gives a member door access without an app purchase (a guest, a trial,
-- or someone who paid at the desk). Owners and admins only; 1–366 days. The
-- pass records who granted it. It is not a sale and writes no ledger entry.
-- -----------------------------------------------------------------------------
create function public.grant_complimentary_pass(p_facility_id text, p_user_id uuid, p_days integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pass public.passes;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_admin(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_days is null or p_days < 1 or p_days > 366 then
    raise exception 'INVALID_DURATION' using errcode = '22023', hint = 'Choose between 1 and 366 days.';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id and soft_deleted_at is null) then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.facility_memberships (facility_id, user_id, status, source)
  values (p_facility_id, p_user_id, 'ACTIVE', 'STAFF_ADDED')
  on conflict (facility_id, user_id) do update set status = 'ACTIVE';

  insert into public.passes (owner_id, facility_id, sku_id, pass_type, valid_until, gifted_by_user_id)
  values (p_user_id, p_facility_id, 'COMP_PASS', 'COMP_PASS', now() + make_interval(days => p_days), auth.uid())
  returning * into v_pass;

  return jsonb_build_object('pass_id', v_pass.id, 'valid_until', v_pass.valid_until);
end;
$$;

-- -----------------------------------------------------------------------------
-- Broadcasts follow standing and respect the member's mute.
--   ALL      every member whose membership has not been cancelled (unchanged)
--   ACTIVE   members in ACTIVE standing (they can get in today)
--   LAPSED   members in LAPSED standing (win-back)
--   SEGMENT  segment members whose membership has not been cancelled
--   USER     one named member (a direct message, so mute does not apply)
-- -----------------------------------------------------------------------------
create or replace function public.send_crm_broadcast(
  p_facility_id text,
  p_suite_mode text,
  p_audience text,
  p_title text,
  p_body text,
  p_promo_code text default null,
  p_segment_key text default null,
  p_target_user_id uuid default null,
  p_badge_text text default null
)
returns public.crm_broadcasts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_segment uuid;
  v_broadcast public.crm_broadcasts;
  v_recipient uuid;
  v_conversation uuid;
  v_count integer := 0;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not public.is_facility_staff(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_audience = 'SEGMENT' then
    select id into v_segment
      from public.facility_segments
     where facility_id = p_facility_id and key = p_segment_key;
    if v_segment is null then
      raise exception 'SEGMENT_NOT_FOUND' using errcode = 'P0002';
    end if;
  elsif p_audience = 'USER' then
    if p_target_user_id is null or not exists (
      select 1 from public.facility_memberships
       where facility_id = p_facility_id and user_id = p_target_user_id and status = 'ACTIVE'
    ) then
      raise exception 'ATHLETE_NOT_A_MEMBER' using errcode = 'P0001';
    end if;
  elsif p_audience not in ('ALL', 'ACTIVE', 'LAPSED') then
    raise exception 'INVALID_AUDIENCE' using errcode = '22023';
  end if;

  insert into public.crm_broadcasts (
    facility_id, created_by, suite_mode, audience, segment_id, target_user_id,
    title, body, promo_code, badge_text
  )
  values (
    p_facility_id, v_uid, p_suite_mode, p_audience, v_segment,
    case when p_audience = 'USER' then p_target_user_id end,
    btrim(p_title), btrim(p_body), nullif(upper(btrim(coalesce(p_promo_code, ''))), ''),
    nullif(btrim(coalesce(p_badge_text, '')), '')
  )
  returning * into v_broadcast;

  for v_recipient in
    select r.user_id
      from private.membership_standing_rows(p_facility_id, null) r
     where (p_audience = 'ALL' and r.membership_status = 'ACTIVE' and not r.broadcasts_muted)
        or (p_audience = 'ACTIVE' and r.standing = 'ACTIVE' and not r.broadcasts_muted)
        or (p_audience = 'LAPSED' and r.standing = 'LAPSED' and not r.broadcasts_muted)
        or (p_audience = 'USER' and r.user_id = p_target_user_id and r.membership_status = 'ACTIVE')
        or (p_audience = 'SEGMENT' and r.membership_status = 'ACTIVE' and not r.broadcasts_muted
            and exists (
              select 1 from public.facility_segment_members sm
               where sm.segment_id = v_segment and sm.user_id = r.user_id))
  loop
    select id into v_conversation
      from public.conversations
     where kind = 'FACILITY' and facility_id = p_facility_id and athlete_id = v_recipient;

    if v_conversation is null then
      insert into public.conversations (kind, facility_id, athlete_id, created_by)
      values ('FACILITY', p_facility_id, v_recipient, v_uid)
      returning id into v_conversation;
      insert into public.conversation_participants (conversation_id, user_id)
      values (v_conversation, v_recipient);
    end if;

    insert into public.messages (conversation_id, sender_id, sender_kind, body, broadcast_id)
    values (
      v_conversation, v_uid, 'FACILITY',
      v_broadcast.title || E'\n\n' || v_broadcast.body
        || coalesce(E'\n\nPromo code: ' || v_broadcast.promo_code, ''),
      v_broadcast.id
    );
    v_count := v_count + 1;
  end loop;

  update public.crm_broadcasts set recipient_count = v_count where id = v_broadcast.id
  returning * into v_broadcast;

  return v_broadcast;
end;
$$;

-- -----------------------------------------------------------------------------
-- Privileges. New functions are not executable until granted.
-- -----------------------------------------------------------------------------
revoke execute on function
  public.facility_member_directory(text),
  public.my_memberships(),
  public.leave_facility(text),
  public.set_venue_broadcasts_muted(text, boolean),
  public.end_membership(text, uuid),
  public.grant_complimentary_pass(text, uuid, integer)
from public, anon;

grant execute on function
  public.facility_member_directory(text),
  public.my_memberships(),
  public.leave_facility(text),
  public.set_venue_broadcasts_muted(text, boolean),
  public.end_membership(text, uuid),
  public.grant_complimentary_pass(text, uuid, integer)
to authenticated;
