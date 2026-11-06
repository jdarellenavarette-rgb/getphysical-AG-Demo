-- =============================================================================
-- Messaging (Sodia DMs + facility CRM threads) and CRM broadcasts.
--
-- Replaces the old in-memory /api/crm routes and the public Realtime
-- "broadcast" channel. Every message is a row protected by RLS, so Realtime
-- postgres_changes only delivers rows the subscriber is allowed to read, and
-- sender identity is always auth.uid() — it cannot be spoofed by a client.
-- =============================================================================

create type public.conversation_kind as enum ('DIRECT', 'GROUP', 'FACILITY');
create type public.sender_kind as enum ('USER', 'FACILITY');

create table public.conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  kind public.conversation_kind not null,
  facility_id text references public.facilities (id) on delete cascade,
  athlete_id uuid references public.profiles (id) on delete cascade,
  title text check (title is null or char_length(title) <= 120),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz default now(),
  last_message_at timestamptz default now(),
  check (
    (kind = 'FACILITY' and facility_id is not null and athlete_id is not null)
    or (kind <> 'FACILITY' and facility_id is null and athlete_id is null)
  )
);

create unique index conversations_one_facility_thread_per_athlete
  on public.conversations (facility_id, athlete_id)
  where kind = 'FACILITY';
create index conversations_facility_idx on public.conversations (facility_id, last_message_at desc);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

create index conversation_participants_user_idx on public.conversation_participants (user_id);

create table public.crm_broadcasts (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  suite_mode text not null check (suite_mode in ('GYMDASH', 'CLUBDASH', 'COACHDASH', 'ORGANIZERDASH')),
  audience text not null check (audience in ('ALL', 'SEGMENT', 'USER')),
  segment_id uuid references public.facility_segments (id) on delete set null,
  target_user_id uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 2000),
  promo_code text check (promo_code is null or promo_code ~ '^[A-Z0-9_-]{1,32}$'),
  badge_text text check (badge_text is null or char_length(badge_text) <= 40),
  recipient_count integer not null default 0,
  created_at timestamptz default now()
);

create index crm_broadcasts_facility_idx on public.crm_broadcasts (facility_id, created_at desc);

create table public.messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  sender_kind public.sender_kind not null default 'USER',
  body text not null check (char_length(body) between 1 and 4000),
  broadcast_id uuid references public.crm_broadcasts (id) on delete set null,
  created_at timestamptz default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

create function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return null;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- -----------------------------------------------------------------------------
-- Access helpers
-- -----------------------------------------------------------------------------
create function public.is_conversation_participant(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.conversation_participants p
     where p.conversation_id = p_conversation_id
       and p.user_id = auth.uid()
  );
$$;

create function public.conversation_facility_id(p_conversation_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select facility_id from public.conversations where id = p_conversation_id;
$$;

create function public.can_access_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_conversation_participant(p_conversation_id)
      or coalesce(public.is_facility_staff(public.conversation_facility_id(p_conversation_id)), false);
$$;

-- -----------------------------------------------------------------------------
-- RPC: get-or-create the CRM thread between a facility and an athlete.
--   * athletes call it with only p_facility_id (they must be a member)
--   * staff call it with p_athlete_id (the athlete must be a member)
-- -----------------------------------------------------------------------------
create function public.ensure_facility_conversation(
  p_facility_id text,
  p_athlete_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_athlete uuid;
  v_conversation uuid;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if p_athlete_id is null or p_athlete_id = v_uid then
    v_athlete := v_uid;
    if not public.is_facility_member(p_facility_id) then
      raise exception 'NOT_A_MEMBER' using errcode = '42501';
    end if;
  else
    if not public.is_facility_staff(p_facility_id) then
      raise exception 'FORBIDDEN' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.facility_memberships
       where facility_id = p_facility_id and user_id = p_athlete_id and status = 'ACTIVE'
    ) then
      raise exception 'ATHLETE_NOT_A_MEMBER' using errcode = 'P0001';
    end if;
    v_athlete := p_athlete_id;
  end if;

  select id into v_conversation
    from public.conversations
   where kind = 'FACILITY' and facility_id = p_facility_id and athlete_id = v_athlete;

  if v_conversation is null then
    insert into public.conversations (kind, facility_id, athlete_id, created_by)
    values ('FACILITY', p_facility_id, v_athlete, v_uid)
    on conflict do nothing
    returning id into v_conversation;

    if v_conversation is null then
      select id into v_conversation
        from public.conversations
       where kind = 'FACILITY' and facility_id = p_facility_id and athlete_id = v_athlete;
    end if;

    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conversation, v_athlete)
    on conflict do nothing;
  end if;

  return v_conversation;
end;
$$;

-- RPC: get-or-create a 1:1 DM with another user.
create function public.open_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_conversation uuid;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_other_user_id = v_uid then
    raise exception 'CANNOT_DM_SELF' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.profiles where id = p_other_user_id and soft_deleted_at is null) then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;

  select c.id into v_conversation
    from public.conversations c
    join public.conversation_participants a on a.conversation_id = c.id and a.user_id = v_uid
    join public.conversation_participants b on b.conversation_id = c.id and b.user_id = p_other_user_id
   where c.kind = 'DIRECT'
   limit 1;

  if v_conversation is null then
    insert into public.conversations (kind, created_by)
    values ('DIRECT', v_uid)
    returning id into v_conversation;
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conversation, v_uid), (v_conversation, p_other_user_id);
  end if;

  return v_conversation;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: send a CRM broadcast. Validates the caller is staff of the facility,
-- resolves recipients server-side and fans out one message per recipient.
-- -----------------------------------------------------------------------------
create function public.send_crm_broadcast(
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
  elsif p_audience <> 'ALL' then
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
    select m.user_id
      from public.facility_memberships m
     where m.facility_id = p_facility_id
       and m.status = 'ACTIVE'
       and (
         p_audience = 'ALL'
         or (p_audience = 'USER' and m.user_id = p_target_user_id)
         or (p_audience = 'SEGMENT' and exists (
               select 1 from public.facility_segment_members sm
                where sm.segment_id = v_segment and sm.user_id = m.user_id))
       )
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

-- Mark a conversation read for the caller.
create function public.mark_conversation_read(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.conversation_participants
     set last_read_at = now()
   where conversation_id = p_conversation_id
     and user_id = auth.uid();
$$;
