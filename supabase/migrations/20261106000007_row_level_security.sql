-- =============================================================================
-- Row-Level Security + explicit grants for every table.
--
-- Two layers:
--   1. GRANTs decide which *operations/columns* a role may attempt at all.
--   2. RLS policies decide which *rows* the caller may touch.
-- Supabase grants ALL on new tables to anon/authenticated by default, so we
-- revoke first and grant back only what each table needs.
-- =============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'facilities', 'facility_staff', 'facility_memberships',
    'facility_segments', 'facility_segment_members', 'coach_clients',
    'passes', 'pass_credentials', 'ledger_transactions', 'access_scans',
    'pr_challenges', 'challenge_entries', 'tournament_matches',
    'workouts_lift', 'workouts_move', 'food_logs', 'hydration_logs',
    'follows', 'sodia_posts', 'sodia_post_likes', 'sodia_post_comments', 'sodia_stories',
    'conversations', 'conversation_participants', 'messages', 'crm_broadcasts',
    'facility_payout_accounts', 'payment_orders', 'payment_webhook_events',
    'ai_usage_daily'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end;
$$;

-- Append-only tables: nobody (not even service_role) may UPDATE/DELETE/TRUNCATE.
revoke update, delete, truncate on public.ledger_transactions from service_role;
revoke update, delete, truncate on public.access_scans from service_role;

-- -----------------------------------------------------------------------------
-- profiles: public card readable by signed-in users; sensitive columns only
-- through get_my_profile(). Users may edit a safe subset of their own row.
-- -----------------------------------------------------------------------------
grant select (
  id, username, name, first_name, last_name, avatar, avatar_url, cover_url, bio,
  home_location, is_private, roles, user_roles, active_role, streak_goal_per_week,
  streak_weeks, default_launch_tab, soft_deleted_at, created_at, updated_at
) on public.profiles to authenticated;
grant update (
  username, name, first_name, last_name, avatar, avatar_url, cover_url, bio, dob,
  home_location, is_private, active_role, default_launch_tab, metrics, weights,
  streak_goal, streak_goal_per_week
) on public.profiles to authenticated;

create policy profiles_read on public.profiles
  for select to authenticated
  using (soft_deleted_at is null or id = auth.uid());
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- dob is write-once (age gate integrity); active_role must be a granted role.
create function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.dob is not null and new.dob is distinct from old.dob
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'DOB_LOCKED' using errcode = '42501',
      hint = 'Date of birth can only be changed by support.';
  end if;
  if new.active_role is not null
     and not (new.active_role = any (coalesce(new.roles, array['individual']))) then
    raise exception 'ROLE_NOT_GRANTED' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

create function public.get_my_profile()
returns public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.profiles where id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- facilities: public directory (Discover works signed-out). Any signed-in user
-- can register a facility they own; admins edit operational fields. Plan,
-- registry and ownership are not client-editable.
-- -----------------------------------------------------------------------------
grant select on public.facilities to anon, authenticated;
grant insert (
  id, owner_id, name, registry_type, category, address, lat, lng, coords, logo, logo_url,
  cover_image, cover_url, hours, amenities, max_capacity, day_pass_price_php,
  monthly_sub_price_php, court_hourly_price_php
) on public.facilities to authenticated;
grant update (
  name, category, address, lat, lng, coords, logo, logo_url, cover_image, cover_url, hours,
  amenities, is_open, max_capacity, live_capacity, day_pass_price, day_pass_price_php,
  monthly_sub_price, monthly_sub_price_php, court_hourly_price, court_hourly_price_php,
  has_active_challenge, challenge_title, spatial_assets
) on public.facilities to authenticated;

create policy facilities_read on public.facilities
  for select to anon, authenticated using (true);
create policy facilities_insert_owner on public.facilities
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy facilities_update_admin on public.facilities
  for update to authenticated
  using (public.is_facility_admin(id))
  with check (public.is_facility_admin(id));

-- -----------------------------------------------------------------------------
-- facility_staff: staff see their roster; admins manage non-owner staff.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.facility_staff to authenticated;

create policy facility_staff_read on public.facility_staff
  for select to authenticated
  using (user_id = auth.uid() or public.is_facility_staff(facility_id));
create policy facility_staff_admin_insert on public.facility_staff
  for insert to authenticated
  with check (public.is_facility_admin(facility_id) and role <> 'OWNER');
create policy facility_staff_admin_update on public.facility_staff
  for update to authenticated
  using (public.is_facility_admin(facility_id) and role <> 'OWNER')
  with check (public.is_facility_admin(facility_id) and role <> 'OWNER');
create policy facility_staff_admin_delete on public.facility_staff
  for delete to authenticated
  using (public.is_facility_admin(facility_id) and role <> 'OWNER');

-- -----------------------------------------------------------------------------
-- facility_memberships: athletes self-join COMMUNITY clubs (cap enforced by
-- trigger); staff add members; either side can cancel.
-- -----------------------------------------------------------------------------
grant select, insert on public.facility_memberships to authenticated;
grant update (status) on public.facility_memberships to authenticated;

create policy memberships_read on public.facility_memberships
  for select to authenticated
  using (user_id = auth.uid() or public.is_facility_staff(facility_id));
create policy memberships_self_join_community on public.facility_memberships
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and source = 'JOIN'
    and exists (
      select 1 from public.facilities f
       where f.id = facility_id and f.registry_type = 'COMMUNITY'
    )
  );
create policy memberships_staff_add on public.facility_memberships
  for insert to authenticated
  with check (public.is_facility_staff(facility_id) and source = 'STAFF_ADDED');
create policy memberships_update on public.facility_memberships
  for update to authenticated
  using (user_id = auth.uid() or public.is_facility_staff(facility_id))
  with check (
    public.is_facility_staff(facility_id)
    or (user_id = auth.uid() and status = 'CANCELLED')
  );

-- -----------------------------------------------------------------------------
-- segments: staff-managed.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.facility_segments to authenticated;
grant select, insert, delete on public.facility_segment_members to authenticated;

create policy segments_staff_all on public.facility_segments
  for all to authenticated
  using (public.is_facility_staff(facility_id))
  with check (public.is_facility_staff(facility_id));
create policy segment_members_staff_all on public.facility_segment_members
  for all to authenticated
  using (exists (
    select 1 from public.facility_segments s
     where s.id = segment_id and public.is_facility_staff(s.facility_id)))
  with check (exists (
    select 1 from public.facility_segments s
     where s.id = segment_id and public.is_facility_staff(s.facility_id)));

-- -----------------------------------------------------------------------------
-- coach_clients: coach manages roster (cap enforced by trigger); client reads
-- and may end the relationship.
-- -----------------------------------------------------------------------------
grant select, insert on public.coach_clients to authenticated;
grant update (status) on public.coach_clients to authenticated;

create policy coach_clients_read on public.coach_clients
  for select to authenticated
  using (coach_id = auth.uid() or client_id = auth.uid());
create policy coach_clients_coach_insert on public.coach_clients
  for insert to authenticated
  with check (coach_id = auth.uid());
create policy coach_clients_update on public.coach_clients
  for update to authenticated
  using (coach_id = auth.uid() or client_id = auth.uid())
  with check (coach_id = auth.uid() or (client_id = auth.uid() and status = 'CANCELLED'));

-- -----------------------------------------------------------------------------
-- passes & credentials: owners read their own; staff read their facility's.
-- Passes are issued only by settle_payment_order() (service_role).
-- -----------------------------------------------------------------------------
grant select on public.passes to authenticated;
grant select on public.pass_credentials to authenticated;

create policy passes_read on public.passes
  for select to authenticated
  using (owner_id = auth.uid() or public.is_facility_staff(facility_id));
create policy pass_credentials_owner_read on public.pass_credentials
  for select to authenticated
  using (exists (
    select 1 from public.passes p
     where p.id = pass_id and p.owner_id = auth.uid() and p.status = 'ACTIVE'));

-- -----------------------------------------------------------------------------
-- ledger & scans: read-only for clients; rows written by SECURITY DEFINER fns.
-- -----------------------------------------------------------------------------
grant select on public.ledger_transactions to authenticated;
grant select on public.access_scans to authenticated;

create policy ledger_read on public.ledger_transactions
  for select to authenticated
  using (user_id = auth.uid() or public.is_facility_admin(facility_id));
create policy access_scans_read on public.access_scans
  for select to authenticated
  using (user_id = auth.uid() or public.is_facility_staff(facility_id));

-- -----------------------------------------------------------------------------
-- challenges & tournaments: public to signed-in users; facility staff manage.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.pr_challenges to authenticated;
grant select, insert on public.challenge_entries to authenticated;
grant update (status) on public.challenge_entries to authenticated;
grant select, insert, update, delete on public.tournament_matches to authenticated;

create policy pr_challenges_read on public.pr_challenges
  for select to authenticated using (true);
create policy pr_challenges_staff_write on public.pr_challenges
  for insert to authenticated with check (public.is_facility_staff(facility_id));
create policy pr_challenges_staff_update on public.pr_challenges
  for update to authenticated
  using (public.is_facility_staff(facility_id)) with check (public.is_facility_staff(facility_id));
create policy pr_challenges_staff_delete on public.pr_challenges
  for delete to authenticated using (public.is_facility_staff(facility_id));

create policy challenge_entries_read on public.challenge_entries
  for select to authenticated using (true);
create policy challenge_entries_insert_self on public.challenge_entries
  for insert to authenticated
  with check (user_id = auth.uid() and coalesce(status, 'PENDING') = 'PENDING');
create policy challenge_entries_staff_verify on public.challenge_entries
  for update to authenticated
  using (exists (
    select 1 from public.pr_challenges c
     where c.id = challenge_id and public.is_facility_staff(c.facility_id)))
  with check (exists (
    select 1 from public.pr_challenges c
     where c.id = challenge_id and public.is_facility_staff(c.facility_id)));

create policy tournament_matches_read on public.tournament_matches
  for select to authenticated using (true);
create policy tournament_matches_staff_insert on public.tournament_matches
  for insert to authenticated with check (public.is_facility_staff(facility_id));
create policy tournament_matches_staff_update on public.tournament_matches
  for update to authenticated
  using (public.is_facility_staff(facility_id)) with check (public.is_facility_staff(facility_id));
create policy tournament_matches_staff_delete on public.tournament_matches
  for delete to authenticated using (public.is_facility_staff(facility_id));

-- -----------------------------------------------------------------------------
-- personal tracking: strictly owner-only.
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['workouts_lift', 'workouts_move', 'food_logs', 'hydration_logs']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t || '_owner_all', t);
  end loop;
end;
$$;

-- Coaches can read (not write) their active clients' training logs.
create policy workouts_lift_coach_read on public.workouts_lift
  for select to authenticated
  using (exists (
    select 1 from public.coach_clients cc
     where cc.coach_id = auth.uid() and cc.client_id = user_id and cc.status = 'ACTIVE'));
create policy workouts_move_coach_read on public.workouts_move
  for select to authenticated
  using (exists (
    select 1 from public.coach_clients cc
     where cc.coach_id = auth.uid() and cc.client_id = user_id and cc.status = 'ACTIVE'));

-- -----------------------------------------------------------------------------
-- Social graph & feed. Private profiles are visible only to accepted followers.
-- -----------------------------------------------------------------------------
create function public.can_view_user_content(p_author uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_author = auth.uid()
      or exists (
        select 1 from public.profiles p
         where p.id = p_author
           and p.soft_deleted_at is null
           and (
             coalesce(p.is_private, false) = false
             or exists (
               select 1 from public.follows f
                where f.follower_id = auth.uid()
                  and f.followee_id = p_author
                  and f.status = 'ACCEPTED')
           )
      );
$$;

grant select, insert, delete on public.follows to authenticated;
grant update (status) on public.follows to authenticated;

create policy follows_read on public.follows
  for select to authenticated
  using (follower_id = auth.uid() or followee_id = auth.uid() or status = 'ACCEPTED');
create policy follows_insert_self on public.follows
  for insert to authenticated
  with check (
    follower_id = auth.uid()
    and status = case
      when exists (select 1 from public.profiles p where p.id = followee_id and coalesce(p.is_private, false))
        then 'PENDING' else 'ACCEPTED' end
  );
create policy follows_followee_accepts on public.follows
  for update to authenticated
  using (followee_id = auth.uid()) with check (followee_id = auth.uid());
create policy follows_delete_either on public.follows
  for delete to authenticated
  using (follower_id = auth.uid() or followee_id = auth.uid());

grant select on public.sodia_posts to authenticated;
grant insert (content, media_url, facility_tag, stamp) on public.sodia_posts to authenticated;
grant update (content, media_url, facility_tag) on public.sodia_posts to authenticated;
grant delete on public.sodia_posts to authenticated;

create policy sodia_posts_read on public.sodia_posts
  for select to authenticated using (public.can_view_user_content(user_id));
create policy sodia_posts_insert_self on public.sodia_posts
  for insert to authenticated with check (user_id = auth.uid());
create policy sodia_posts_update_self on public.sodia_posts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sodia_posts_delete_self on public.sodia_posts
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, delete on public.sodia_post_likes to authenticated;
create policy sodia_post_likes_read on public.sodia_post_likes
  for select to authenticated
  using (exists (select 1 from public.sodia_posts p where p.id = post_id));
create policy sodia_post_likes_insert_self on public.sodia_post_likes
  for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.sodia_posts p where p.id = post_id));
create policy sodia_post_likes_delete_self on public.sodia_post_likes
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, delete on public.sodia_post_comments to authenticated;
create policy sodia_post_comments_read on public.sodia_post_comments
  for select to authenticated
  using (exists (select 1 from public.sodia_posts p where p.id = post_id));
create policy sodia_post_comments_insert_self on public.sodia_post_comments
  for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.sodia_posts p where p.id = post_id));
create policy sodia_post_comments_delete on public.sodia_post_comments
  for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.sodia_posts p where p.id = post_id and p.user_id = auth.uid())
  );

grant select, delete on public.sodia_stories to authenticated;
grant insert (caption, media_url) on public.sodia_stories to authenticated;
create policy sodia_stories_read on public.sodia_stories
  for select to authenticated
  using (expires_at > now() and public.can_view_user_content(user_id));
create policy sodia_stories_insert_self on public.sodia_stories
  for insert to authenticated with check (user_id = auth.uid());
create policy sodia_stories_delete_self on public.sodia_stories
  for delete to authenticated using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Messaging. Conversations are created through RPCs; messages are inserted
-- directly (Realtime-friendly) with sender identity bound to auth.uid().
-- -----------------------------------------------------------------------------
grant select on public.conversations to authenticated;
grant select on public.conversation_participants to authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, sender_kind, body) on public.messages to authenticated;
grant select on public.crm_broadcasts to authenticated;

create policy conversations_read on public.conversations
  for select to authenticated using (public.can_access_conversation(id));
create policy conversation_participants_read on public.conversation_participants
  for select to authenticated using (public.can_access_conversation(conversation_id));
create policy messages_read on public.messages
  for select to authenticated using (public.can_access_conversation(conversation_id));
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and broadcast_id is null
    and (
      (sender_kind = 'USER' and public.is_conversation_participant(conversation_id))
      or (sender_kind = 'FACILITY'
          and public.is_facility_staff(public.conversation_facility_id(conversation_id)))
    )
  );
create policy crm_broadcasts_read on public.crm_broadcasts
  for select to authenticated
  using (
    public.is_facility_staff(facility_id)
    or exists (
      select 1 from public.messages m
        join public.conversation_participants cp
          on cp.conversation_id = m.conversation_id and cp.user_id = auth.uid()
       where m.broadcast_id = crm_broadcasts.id)
  );

-- -----------------------------------------------------------------------------
-- Payments: buyers read their orders; facility admins read their facility's.
-- No client writes (RPCs + service_role only).
-- -----------------------------------------------------------------------------
grant select on public.payment_orders to authenticated;
grant select on public.facility_payout_accounts to authenticated;

create policy payment_orders_read on public.payment_orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_facility_admin(facility_id));
create policy payout_accounts_admin_read on public.facility_payout_accounts
  for select to authenticated using (public.is_facility_admin(facility_id));
-- payment_webhook_events: no policies => invisible to clients.

grant select on public.ai_usage_daily to authenticated;
create policy ai_usage_read_self on public.ai_usage_daily
  for select to authenticated using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Function privileges. Postgres grants EXECUTE to PUBLIC by default.
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function
  public.get_my_profile(),
  public.has_facility_role(text, public.facility_role[]),
  public.is_facility_staff(text),
  public.is_facility_admin(text),
  public.is_facility_member(text),
  public.is_conversation_participant(uuid),
  public.conversation_facility_id(uuid),
  public.can_access_conversation(uuid),
  public.can_view_user_content(uuid),
  public.ensure_facility_conversation(text, uuid),
  public.open_direct_conversation(uuid),
  public.send_crm_broadcast(text, text, text, text, text, text, text, uuid, text),
  public.mark_conversation_read(uuid),
  public.verify_pass_code(uuid, text, timestamptz),
  public.create_payment_order(text, text, text),
  public.calculate_service_fee(numeric, text),
  public.consume_ai_quota(text, integer)
to authenticated;

grant execute on function public.calculate_service_fee(numeric, text) to anon;

grant execute on function
  public.attach_payment_checkout(uuid, text, text),
  public.record_payment_webhook_event(public.payment_provider, text, text, jsonb),
  public.settle_payment_order(uuid, public.payment_provider, text, numeric),
  public.close_payment_order(uuid, public.payment_order_status, text),
  public.refund_payment_order(uuid, text)
to service_role;

-- Trigger functions run as table owner; keep them non-callable.
alter default privileges in schema public revoke execute on functions from public;
