-- =============================================================================
-- Day-to-day operations:
--   1. Shifts: an opening float, and a counted close that is compared with what
--      the desk recorded in cash.
--   2. Brackets: an event's draw and scores, kept as JSON on the event.
--   3. Training plans: what a coach has asked a client to do each week.
--   4. Messages from a list: write to the people signed up to an event, booked
--      into a class, or coached, without them being members.
--   5. Automations: messages a business switches on once and that send
--      themselves (welcome, pass ending, win-back, reminders, quiet clients).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Shifts
-- -----------------------------------------------------------------------------
create table public.desk_shifts (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  opened_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  opened_at timestamptz not null default now(),
  opening_float numeric(12, 2) not null check (opening_float >= 0 and opening_float <= 1000000),
  closed_at timestamptz,
  -- Set at close. Expected is the float plus the cash recorded during the shift.
  counted_cash numeric(12, 2) check (counted_cash is null or counted_cash >= 0),
  expected_cash numeric(12, 2),
  note text check (note is null or char_length(note) <= 300)
);

create index desk_shifts_facility_idx on public.desk_shifts (facility_id, opened_at desc);
-- One open shift per person per business.
create unique index desk_shifts_one_open on public.desk_shifts (facility_id, opened_by) where closed_at is null;

alter table public.desk_payments add column shift_id uuid references public.desk_shifts (id) on delete set null;

-- A payment belongs to the shift its taker has open, if any.
create function public.attach_payment_to_shift()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reverses is null then
    select s.id into new.shift_id
      from public.desk_shifts s
     where s.facility_id = new.facility_id and s.opened_by = auth.uid() and s.closed_at is null;
  else
    -- A reversal undoes the entry in the shift that took it.
    select d.shift_id into new.shift_id from public.desk_payments d where d.id = new.reverses;
  end if;
  return new;
end;
$$;

create trigger desk_payments_attach_shift
  before insert on public.desk_payments
  for each row execute function public.attach_payment_to_shift();

alter table public.desk_shifts enable row level security;
revoke all on table public.desk_shifts from anon, authenticated;
grant select on public.desk_shifts to authenticated;
grant insert (facility_id, opening_float) on public.desk_shifts to authenticated;

create policy desk_shifts_read on public.desk_shifts
  for select to authenticated
  using (opened_by = auth.uid() or public.is_facility_admin(facility_id));
create policy desk_shifts_insert on public.desk_shifts
  for insert to authenticated
  with check (opened_by = auth.uid() and public.is_facility_staff(facility_id));

-- Close a shift with the cash counted in the drawer. The person counting is not shown the
-- expected figure first; it is worked out here and returned with the difference.
create function public.close_desk_shift(p_shift_id uuid, p_counted_cash numeric, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shift public.desk_shifts%rowtype;
  v_cash numeric;
begin
  select * into v_shift from public.desk_shifts where id = p_shift_id for update;
  if not found or not (v_shift.opened_by = auth.uid() or public.is_facility_admin(v_shift.facility_id)) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if v_shift.closed_at is not null then
    raise exception 'SHIFT_CLOSED' using errcode = 'P0001';
  end if;
  if p_counted_cash is null or p_counted_cash < 0 then
    raise exception 'INVALID_COUNT' using errcode = '22023';
  end if;
  select coalesce(sum(amount_php), 0) into v_cash
    from public.desk_payments where shift_id = p_shift_id and method = 'CASH';
  update public.desk_shifts
     set closed_at = now(), counted_cash = p_counted_cash, expected_cash = v_shift.opening_float + v_cash,
         note = nullif(btrim(coalesce(p_note, '')), '')
   where id = p_shift_id;
  return jsonb_build_object(
    'expected', v_shift.opening_float + v_cash,
    'counted', p_counted_cash,
    'difference', p_counted_cash - (v_shift.opening_float + v_cash)
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Brackets. The draw and scores are JSON validated by the app (sodia-core)
--    before it is written; the event is public, so the bracket is too.
-- -----------------------------------------------------------------------------
alter table public.events add column bracket jsonb check (bracket is null or jsonb_typeof(bracket) = 'object');
grant update (bracket) on public.events to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Training plans
-- -----------------------------------------------------------------------------
create table public.coach_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  coach_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  -- The week: [{ "weekday": 1, "focus": "Lower body" }, …], weekday 0 = Sunday.
  days jsonb not null check (jsonb_typeof(days) = 'array' and jsonb_array_length(days) between 1 and 7),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

-- One current plan per client per coach.
create unique index coach_plans_one_current on public.coach_plans (coach_id, client_id) where ended_at is null;

create trigger coach_plans_guard
  before insert on public.coach_plans
  for each row execute function public.guard_coach_pack();

alter table public.coach_plans enable row level security;
revoke all on table public.coach_plans from anon, authenticated;
grant select on public.coach_plans to authenticated;
grant insert (client_id, title, days) on public.coach_plans to authenticated;
grant update (ended_at) on public.coach_plans to authenticated;

create policy coach_plans_read on public.coach_plans
  for select to authenticated using (coach_id = auth.uid() or client_id = auth.uid());
create policy coach_plans_insert on public.coach_plans
  for insert to authenticated with check (coach_id = auth.uid());
create policy coach_plans_update on public.coach_plans
  for update to authenticated using (coach_id = auth.uid()) with check (coach_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. Messages to people a business has a tie with
-- -----------------------------------------------------------------------------
-- Whether this person has come to this business themselves in some way.
create function private.has_tie(p_facility_id text, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.facility_memberships m
                  where m.facility_id = p_facility_id and m.user_id = p_user_id and m.status = 'ACTIVE')
      or exists (select 1 from public.event_registrations r
                   join public.events e on e.id = r.event_id
                  where e.facility_id = p_facility_id and r.user_id = p_user_id and r.status = 'REGISTERED')
      or exists (select 1 from public.class_bookings b
                  where b.facility_id = p_facility_id and b.user_id = p_user_id and b.status <> 'CANCELLED')
      or exists (select 1 from public.space_bookings b
                  where b.facility_id = p_facility_id and b.user_id = p_user_id and b.status = 'CONFIRMED')
      or exists (select 1 from public.coach_clients cc
                   join public.facility_staff s on s.user_id = cc.coach_id and s.facility_id = p_facility_id
                  where cc.client_id = p_user_id and cc.status = 'ACTIVE');
$$;

-- Put one message from the business into the person's thread with it.
create function private.send_facility_message(p_facility_id text, p_user_id uuid, p_sender uuid, p_body text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation uuid;
begin
  select id into v_conversation
    from public.conversations
   where kind = 'FACILITY' and facility_id = p_facility_id and athlete_id = p_user_id;
  if v_conversation is null then
    insert into public.conversations (kind, facility_id, athlete_id, created_by)
    values ('FACILITY', p_facility_id, p_user_id, p_sender)
    returning id into v_conversation;
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conversation, p_user_id);
  end if;
  insert into public.messages (conversation_id, sender_id, sender_kind, body)
  values (v_conversation, p_sender, 'FACILITY', left(p_body, 4000));
  update public.conversations set last_message_at = now() where id = v_conversation;
end;
$$;

-- Staff write to chosen people. Each must have a tie with the business. When writing to several
-- at once, anyone who muted the business's broadcasts is skipped. Returns how many were sent.
create function public.message_people(p_facility_id text, p_user_ids uuid[], p_body text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_user uuid;
  v_count integer := 0;
  v_many boolean := coalesce(cardinality(p_user_ids), 0) > 1;
begin
  if v_uid is null or not public.is_facility_staff(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(p_body, ''))) not between 1 and 2000 then
    raise exception 'INVALID_MESSAGE' using errcode = '22023';
  end if;
  if coalesce(cardinality(p_user_ids), 0) not between 1 and 500 then
    raise exception 'INVALID_RECIPIENTS' using errcode = '22023';
  end if;
  for v_user in select distinct u from unnest(p_user_ids) u loop
    continue when not private.has_tie(p_facility_id, v_user);
    continue when v_many and exists (
      select 1 from public.facility_memberships m
       where m.facility_id = p_facility_id and m.user_id = v_user and m.broadcasts_muted);
    perform private.send_facility_message(p_facility_id, v_user, v_uid, btrim(p_body));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. Automations
-- -----------------------------------------------------------------------------
create table public.facility_automations (
  facility_id text not null references public.facilities (id) on delete cascade,
  kind text not null check (kind in
    ('WELCOME', 'PASS_ENDING', 'WIN_BACK', 'EVENT_REMINDER', 'CLASS_REMINDER', 'CLIENT_QUIET')),
  enabled boolean not null default false,
  -- {name} and {business} are filled in; {detail} is the pass date, event or class.
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  updated_at timestamptz not null default now(),
  primary key (facility_id, kind)
);

-- What has already been sent, so nothing is sent twice for the same reason.
create table public.automation_sends (
  facility_id text not null references public.facilities (id) on delete cascade,
  kind text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject_key text not null,
  sent_at timestamptz not null default now(),
  primary key (facility_id, kind, user_id, subject_key)
);

alter table public.facility_automations enable row level security;
alter table public.automation_sends enable row level security;
revoke all on table public.facility_automations, public.automation_sends from anon, authenticated;
grant select on public.facility_automations, public.automation_sends to authenticated;
grant insert (facility_id, kind, enabled, body) on public.facility_automations to authenticated;
grant update (enabled, body) on public.facility_automations to authenticated;

create trigger facility_automations_set_updated_at
  before update on public.facility_automations
  for each row execute function public.set_updated_at();

create policy facility_automations_read on public.facility_automations
  for select to authenticated using (public.is_facility_staff(facility_id));
create policy facility_automations_insert on public.facility_automations
  for insert to authenticated with check (public.is_facility_admin(facility_id));
create policy facility_automations_update on public.facility_automations
  for update to authenticated
  using (public.is_facility_admin(facility_id)) with check (public.is_facility_admin(facility_id));
create policy automation_sends_read on public.automation_sends
  for select to authenticated using (public.is_facility_staff(facility_id));

-- Send one automated message unless it was already sent for this reason.
create function private.send_automation(
  p_facility_id text, p_kind text, p_user_id uuid, p_subject_key text, p_detail text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rule public.facility_automations%rowtype;
  v_owner uuid;
  v_business text;
  v_name text;
begin
  select * into v_rule from public.facility_automations
   where facility_id = p_facility_id and kind = p_kind and enabled;
  if not found then
    return false;
  end if;
  insert into public.automation_sends (facility_id, kind, user_id, subject_key)
  values (p_facility_id, p_kind, p_user_id, p_subject_key)
  on conflict do nothing;
  if not found then
    return false;
  end if;
  select f.owner_id, f.name into v_owner, v_business from public.facilities f where f.id = p_facility_id;
  if v_owner is null then
    select s.user_id into v_owner from public.facility_staff s
     where s.facility_id = p_facility_id order by (s.role = 'OWNER') desc, s.created_at limit 1;
  end if;
  select coalesce(nullif(split_part(p.name, ' ', 1), ''), 'there') into v_name
    from public.profiles p where p.id = p_user_id;
  perform private.send_facility_message(
    p_facility_id, p_user_id, v_owner,
    replace(replace(replace(v_rule.body, '{name}', v_name), '{business}', v_business), '{detail}', coalesce(p_detail, '')));
  return true;
end;
$$;

-- A welcome goes out the moment someone joins.
create function public.welcome_new_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'ACTIVE' then
    perform private.send_automation(new.facility_id, 'WELCOME', new.user_id, 'once', null);
  end if;
  return new;
end;
$$;

create trigger facility_memberships_welcome
  after insert on public.facility_memberships
  for each row execute function public.welcome_new_member();

-- Everything that depends on the date. Safe to run as often as you like.
create function private.run_automations(p_facility_id text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_sent integer := 0;
begin
  if not exists (select 1 from public.facility_automations where facility_id = p_facility_id and enabled) then
    return 0;
  end if;

  -- A pass that ends within three days; a pass that ended a week or more ago.
  for r in
    select s.user_id, s.standing, s.pass_valid_until, s.last_pass_ended_at
      from private.membership_standing_rows(p_facility_id, null) s
     where s.membership_status = 'ACTIVE' and not s.broadcasts_muted
  loop
    if r.standing = 'ACTIVE' and r.pass_valid_until is not null
       and r.pass_valid_until between now() and now() + interval '3 days' then
      if private.send_automation(p_facility_id, 'PASS_ENDING', r.user_id,
           to_char(r.pass_valid_until at time zone 'Asia/Manila', 'YYYY-MM-DD'),
           to_char(r.pass_valid_until at time zone 'Asia/Manila', 'FMMonth FMDD')) then
        v_sent := v_sent + 1;
      end if;
    elsif r.standing = 'LAPSED' and r.last_pass_ended_at is not null
          and r.last_pass_ended_at between now() - interval '60 days' and now() - interval '7 days' then
      if private.send_automation(p_facility_id, 'WIN_BACK', r.user_id,
           to_char(r.last_pass_ended_at at time zone 'Asia/Manila', 'YYYY-MM-DD'),
           to_char(r.last_pass_ended_at at time zone 'Asia/Manila', 'FMMonth FMDD')) then
        v_sent := v_sent + 1;
      end if;
    end if;
  end loop;

  -- Something they signed up for starts within a day.
  for r in
    select reg.user_id, e.id, e.title, e.starts_at
      from public.events e
      join public.event_registrations reg on reg.event_id = e.id and reg.status = 'REGISTERED'
     where e.facility_id = p_facility_id and e.status = 'PUBLISHED'
       and e.starts_at between now() and now() + interval '24 hours'
  loop
    if private.send_automation(p_facility_id, 'EVENT_REMINDER', r.user_id, r.id::text,
         r.title || ', ' || to_char(r.starts_at at time zone 'Asia/Manila', 'FMDay FMHH12:MI AM')) then
      v_sent := v_sent + 1;
    end if;
  end loop;
  for r in
    select b.user_id, c.id, c.title, c.starts_at
      from public.class_sessions c
      join public.class_bookings b on b.session_id = c.id and b.status = 'BOOKED' and b.user_id is not null
     where c.facility_id = p_facility_id and c.status = 'SCHEDULED'
       and c.starts_at between now() and now() + interval '24 hours'
  loop
    if private.send_automation(p_facility_id, 'CLASS_REMINDER', r.user_id, r.id::text,
         r.title || ', ' || to_char(r.starts_at at time zone 'Asia/Manila', 'FMDay FMHH12:MI AM')) then
      v_sent := v_sent + 1;
    end if;
  end loop;

  -- A coached client with nothing logged for three days. At most once a week each.
  for r in
    select cc.client_id
      from public.coach_clients cc
      join public.facility_staff s on s.user_id = cc.coach_id and s.facility_id = p_facility_id
     where cc.status = 'ACTIVE'
       and not exists (select 1 from public.workouts_lift w
                        where w.user_id = cc.client_id and w.created_at > now() - interval '3 days')
       and not exists (select 1 from public.workouts_move w
                        where w.user_id = cc.client_id and w.created_at > now() - interval '3 days')
  loop
    if private.send_automation(p_facility_id, 'CLIENT_QUIET', r.client_id, to_char(now(), 'IYYY-IW'), null) then
      v_sent := v_sent + 1;
    end if;
  end loop;
  return v_sent;
end;
$$;

-- For the team: run this business's automations now.
create function public.run_automations(p_facility_id text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_facility_staff(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return private.run_automations(p_facility_id);
end;
$$;

-- For a scheduler: run every business's automations. Service role only.
create function public.run_all_automations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_sent integer := 0;
begin
  for r in select distinct facility_id from public.facility_automations where enabled loop
    v_sent := v_sent + private.run_automations(r.facility_id);
  end loop;
  return v_sent;
end;
$$;

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
revoke execute on function
  public.attach_payment_to_shift(), public.close_desk_shift(uuid, numeric, text),
  private.has_tie(text, uuid), private.send_facility_message(text, uuid, uuid, text),
  public.message_people(text, uuid[], text),
  private.send_automation(text, text, uuid, text, text), public.welcome_new_member(),
  private.run_automations(text), public.run_automations(text), public.run_all_automations()
  from public, anon, authenticated;

grant execute on function
  public.close_desk_shift(uuid, numeric, text), public.message_people(text, uuid[], text),
  public.run_automations(text)
  to authenticated;
grant execute on function public.run_all_automations() to service_role;

-- Signed-out visitors read published events, timetables and posts. Those tables' read rules
-- mention the staff check, and the database may evaluate it even when the row is public, which
-- failed with "permission denied". The check simply answers no for someone who is not signed in.
grant execute on function public.is_facility_staff(text) to anon;
