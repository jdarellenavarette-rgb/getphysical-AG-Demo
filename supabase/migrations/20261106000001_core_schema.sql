-- =============================================================================
-- GetPhysical core schema
-- Source of truth for every table the apps read or write. Designed for a fresh
-- Supabase project (`supabase db reset` / `supabase db push`).
--
-- Conventions
--   * user ids are uuid and reference auth.users via public.profiles
--   * facility ids are human-readable text slugs (e.g. 'fac_metro_core')
--   * money is numeric(12,2) in PHP
--   * every table gets RLS in 20261106000003_row_level_security.sql
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.registry_type as enum ('COMMERCIAL', 'COMMUNITY');
create type public.subscription_plan as enum ('FREE', 'PRO');
create type public.facility_role as enum ('OWNER', 'ADMIN', 'STAFF', 'COACH');
create type public.pass_status as enum ('ACTIVE', 'EXPIRED', 'REVOKED');
create type public.scan_status as enum ('GRANTED', 'DENIED');
create type public.membership_status as enum ('ACTIVE', 'CANCELLED');

-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext unique
    check (username is null or username::text ~ '^[a-zA-Z0-9_.]{3,24}$'),
  name text not null default '',
  first_name text,
  last_name text,
  avatar text,
  avatar_url text,
  cover_url text,
  bio text check (bio is null or char_length(bio) <= 150),
  dob date,
  home_location text,
  phone_hash text,
  is_private boolean default false,
  roles text[] default array['individual'],
  user_roles text[] default array['individual'],
  active_role text default 'individual',
  coach_plan public.subscription_plan not null default 'FREE',
  default_launch_tab text,
  metrics jsonb,
  weights jsonb,
  streak_goal integer,
  streak_goal_per_week integer default 3,
  streak_weeks integer default 0,
  streak_freeze_available boolean default false,
  soft_deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically for every new auth user.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- Facilities (tenants). One table for both registries.
-- -----------------------------------------------------------------------------
create table public.facilities (
  id text primary key
    default ('fac_' || replace(extensions.gen_random_uuid()::text, '-', '')),
  owner_id uuid references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  registry_type public.registry_type not null,
  registry text not null generated always as (
    case registry_type when 'COMMERCIAL' then 'A' else 'B' end
  ) stored,
  plan public.subscription_plan not null default 'FREE',
  category text not null default '',
  address text not null default '',
  distance text,
  lat double precision check (lat is null or lat between -90 and 90),
  lng double precision check (lng is null or lng between -180 and 180),
  coords jsonb not null default '{}'::jsonb,
  logo text,
  logo_url text,
  cover_image text,
  cover_url text,
  hours text,
  amenities text[],
  is_open boolean default true,
  inside_now_count integer default 0 check (inside_now_count >= 0),
  max_capacity integer check (max_capacity is null or max_capacity > 0),
  live_capacity jsonb not null default '{}'::jsonb,
  day_pass_price numeric(12, 2) check (day_pass_price is null or day_pass_price >= 0),
  day_pass_price_php numeric(12, 2) check (day_pass_price_php is null or day_pass_price_php >= 0),
  monthly_sub_price numeric(12, 2) check (monthly_sub_price is null or monthly_sub_price >= 0),
  monthly_sub_price_php numeric(12, 2) check (monthly_sub_price_php is null or monthly_sub_price_php >= 0),
  court_hourly_price numeric(12, 2) check (court_hourly_price is null or court_hourly_price >= 0),
  court_hourly_price_php numeric(12, 2) check (court_hourly_price_php is null or court_hourly_price_php >= 0),
  free_member_count integer default 0,
  rating numeric(2, 1) check (rating is null or rating between 0 and 5),
  review_count integer default 0,
  has_active_challenge boolean default false,
  challenge_title text,
  spatial_assets jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index facilities_registry_type_idx on public.facilities (registry_type);
create index facilities_owner_id_idx on public.facilities (owner_id);

create trigger facilities_set_updated_at
  before update on public.facilities
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Passes (entitlements). Created by settle_payment_order(), never by clients.
-- -----------------------------------------------------------------------------
create table public.passes (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  facility_id text references public.facilities (id) on delete restrict,
  sku_id text not null default 'DAY_PASS',
  pass_type text not null default 'DAY_PASS',
  status public.pass_status not null default 'ACTIVE',
  valid_until timestamptz not null default (now() + interval '1 day'),
  gifted_by_user_id uuid references public.profiles (id) on delete set null,
  payment_order_id uuid,
  created_at timestamptz default now()
);

create index passes_owner_id_idx on public.passes (owner_id);
create index passes_facility_id_idx on public.passes (facility_id);

-- -----------------------------------------------------------------------------
-- Ledger (append-only; see 20261106000004)
-- -----------------------------------------------------------------------------
create table public.ledger_transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  reference_no text not null unique,
  idempotency_key text unique,
  user_id uuid references public.profiles (id) on delete set null,
  member_name text,
  buyer_display_name text,
  facility_id text references public.facilities (id) on delete restrict,
  facility_name text,
  type text not null check (type in ('SALE', 'REFUND', 'ADJUSTMENT')),
  entry_type text check (entry_type in ('ORIGINAL', 'REVERSAL')),
  amount numeric(12, 2) not null,
  gross_amount_php numeric(12, 2),
  platform_fee_php numeric(12, 2),
  net_facility_amount_php numeric(12, 2),
  description text not null,
  method text not null,
  payment_method text,
  status text not null default 'POSTED' check (status in ('POSTED')),
  reversing_transaction_id uuid unique references public.ledger_transactions (id),
  payment_order_id uuid,
  metadata jsonb,
  "timestamp" timestamptz default now()
);

create index ledger_transactions_facility_id_idx on public.ledger_transactions (facility_id, "timestamp" desc);
create index ledger_transactions_user_id_idx on public.ledger_transactions (user_id, "timestamp" desc);

-- -----------------------------------------------------------------------------
-- Access scans (append-only; written only by verify_pass_code())
-- -----------------------------------------------------------------------------
create table public.access_scans (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text references public.facilities (id) on delete restrict,
  user_id uuid references public.profiles (id) on delete set null,
  pass_id uuid references public.passes (id) on delete set null,
  scanned_by uuid references public.profiles (id) on delete set null,
  member_name text not null,
  avatar text,
  status public.scan_status not null,
  reason text,
  totp_window bigint,
  created_at timestamptz default now()
);

create index access_scans_facility_id_idx on public.access_scans (facility_id, created_at desc);
create index access_scans_pass_id_idx on public.access_scans (pass_id, created_at desc);
-- Replay protection: a code window can open the gate once.
create unique index access_scans_one_grant_per_window
  on public.access_scans (pass_id, totp_window)
  where status = 'GRANTED';

-- -----------------------------------------------------------------------------
-- Challenges & competition
-- -----------------------------------------------------------------------------
create table public.pr_challenges (
  id text primary key
    default ('chall_' || replace(extensions.gen_random_uuid()::text, '-', '')),
  facility_id text references public.facilities (id) on delete cascade,
  title text not null,
  category text not null,
  benchmark text not null,
  expires_in_days integer,
  participants_count integer default 0,
  created_at timestamptz default now()
);

create table public.challenge_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  challenge_id text references public.pr_challenges (id) on delete cascade,
  user_id uuid default auth.uid() references public.profiles (id) on delete cascade,
  user_name text not null,
  value numeric not null check (value >= 0),
  proof_video text,
  status text default 'PENDING' check (status in ('PENDING', 'VERIFIED', 'REJECTED')),
  created_at timestamptz default now()
);

create index challenge_entries_challenge_id_idx on public.challenge_entries (challenge_id);

create table public.tournament_matches (
  id text primary key
    default ('match_' || replace(extensions.gen_random_uuid()::text, '-', '')),
  facility_id text references public.facilities (id) on delete cascade,
  sport text not null,
  round text not null,
  player_a text not null,
  player_b text not null,
  score_a integer,
  score_b integer,
  status text default 'SCHEDULED',
  court_slot text,
  updated_at timestamptz default now()
);

create trigger tournament_matches_set_updated_at
  before update on public.tournament_matches
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Personal tracking (owner-only)
-- -----------------------------------------------------------------------------
create table public.workouts_lift (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null default 'Workout',
  exercises jsonb,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  verified_stamp jsonb,
  created_at timestamptz default now()
);

create table public.workouts_move (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  type text not null default 'RUN',
  distance_km numeric check (distance_km is null or distance_km >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  current_pace text,
  is_court_mode boolean default false,
  opponent_username text,
  match_result text,
  score text,
  verified_stamp jsonb,
  created_at timestamptz default now()
);

create table public.food_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null,
  calories numeric not null check (calories >= 0),
  protein numeric check (protein is null or protein >= 0),
  carbs numeric check (carbs is null or carbs >= 0),
  fat numeric check (fat is null or fat >= 0),
  created_at timestamptz default now()
);

create table public.hydration_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  liters numeric not null check (liters > 0 and liters <= 20),
  logged_date date default current_date,
  created_at timestamptz default now()
);

create index workouts_lift_user_idx on public.workouts_lift (user_id, created_at desc);
create index workouts_move_user_idx on public.workouts_move (user_id, created_at desc);
create index food_logs_user_idx on public.food_logs (user_id, created_at desc);
create index hydration_logs_user_idx on public.hydration_logs (user_id, logged_date desc);

-- -----------------------------------------------------------------------------
-- Social graph & Sodia feed
-- -----------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'ACCEPTED' check (status in ('PENDING', 'ACCEPTED')),
  created_at timestamptz default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index follows_followee_idx on public.follows (followee_id);

create table public.sodia_posts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid default auth.uid() references public.profiles (id) on delete cascade,
  author_name text not null default '',
  author_avatar text,
  author_role text,
  content text not null check (char_length(content) <= 280),
  media_url text,
  likes_count integer default 0,
  comments_count integer default 0,
  facility_tag jsonb,
  stamp jsonb,
  created_at timestamptz default now()
);

create index sodia_posts_created_idx on public.sodia_posts (created_at desc);
create index sodia_posts_user_idx on public.sodia_posts (user_id, created_at desc);

create table public.sodia_post_likes (
  post_id uuid not null references public.sodia_posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table public.sodia_post_comments (
  id uuid primary key default extensions.gen_random_uuid(),
  post_id uuid not null references public.sodia_posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz default now()
);

create index sodia_post_comments_post_idx on public.sodia_post_comments (post_id, created_at);

create table public.sodia_stories (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid default auth.uid() references public.profiles (id) on delete cascade,
  author_name text not null default '',
  author_avatar text,
  caption text check (caption is null or char_length(caption) <= 150),
  media_url text not null,
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now()
);

create index sodia_stories_active_idx on public.sodia_stories (expires_at desc);

-- Author identity is derived server-side; clients cannot spoof names/avatars.
create function public.stamp_author_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
begin
  select * into v_profile from public.profiles where id = new.user_id;
  if not found then
    raise exception 'author profile not found' using errcode = '23503';
  end if;
  new.author_name := coalesce(nullif(v_profile.name, ''), v_profile.username::text, 'Athlete');
  new.author_avatar := coalesce(v_profile.avatar_url, v_profile.avatar);
  if tg_table_name = 'sodia_posts' then
    new.author_role := v_profile.active_role;
    new.likes_count := coalesce(new.likes_count, 0);
    new.comments_count := coalesce(new.comments_count, 0);
    if tg_op = 'INSERT' then
      new.likes_count := 0;
      new.comments_count := 0;
    end if;
  end if;
  return new;
end;
$$;

create trigger sodia_posts_stamp_author
  before insert on public.sodia_posts
  for each row execute function public.stamp_author_identity();

create trigger sodia_stories_stamp_author
  before insert on public.sodia_stories
  for each row execute function public.stamp_author_identity();

-- Denormalised counters maintained by the database, not clients.
create function public.bump_post_counter()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_delta integer := case tg_op when 'INSERT' then 1 else -1 end;
  v_post uuid := case tg_op when 'INSERT' then new.post_id else old.post_id end;
begin
  if tg_table_name = 'sodia_post_likes' then
    update public.sodia_posts
       set likes_count = greatest(0, coalesce(likes_count, 0) + v_delta)
     where id = v_post;
  else
    update public.sodia_posts
       set comments_count = greatest(0, coalesce(comments_count, 0) + v_delta)
     where id = v_post;
  end if;
  return null;
end;
$$;

create trigger sodia_post_likes_count
  after insert or delete on public.sodia_post_likes
  for each row execute function public.bump_post_counter();

create trigger sodia_post_comments_count
  after insert or delete on public.sodia_post_comments
  for each row execute function public.bump_post_counter();
