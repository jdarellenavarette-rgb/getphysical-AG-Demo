-- =============================================================================
-- A business's public face in the Sodia app: a profile people follow, and posts
-- written in the Business Suite that reach followers and members. Also lets an
-- owner hand a business over, so it does not depend on one person's account.
-- =============================================================================

alter table public.facilities
  add column about text check (about is null or char_length(about) <= 500);
grant update (about) on public.facilities to authenticated;

-- -----------------------------------------------------------------------------
-- Follows. Anyone signed in can follow a business; members reach its posts
-- without following.
-- -----------------------------------------------------------------------------
create table public.business_follows (
  facility_id text not null references public.facilities (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (facility_id, user_id)
);

create index business_follows_user_idx on public.business_follows (user_id);

alter table public.business_follows enable row level security;
revoke all on table public.business_follows from anon, authenticated;
grant select, delete on public.business_follows to authenticated;
grant insert (facility_id) on public.business_follows to authenticated;

create policy business_follows_read on public.business_follows
  for select to authenticated using (user_id = auth.uid() or public.is_facility_staff(facility_id));
create policy business_follows_insert_self on public.business_follows
  for insert to authenticated with check (user_id = auth.uid());
create policy business_follows_delete_self on public.business_follows
  for delete to authenticated using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Posts. A post is live when it is published, or scheduled and its time has
-- come, so scheduling needs no background job.
-- -----------------------------------------------------------------------------
create type public.business_post_status as enum ('SCHEDULED', 'PUBLISHED', 'ARCHIVED');

create table public.business_posts (
  id uuid primary key default extensions.gen_random_uuid(),
  facility_id text not null references public.facilities (id) on delete cascade,
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  -- What the post invites people to do, if anything.
  event_id uuid references public.events (id) on delete set null,
  product_id uuid references public.facility_products (id) on delete set null,
  status public.business_post_status not null default 'PUBLISHED',
  publish_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (event_id is null or product_id is null)
);

create index business_posts_facility_idx on public.business_posts (facility_id, publish_at desc);

create trigger business_posts_set_updated_at
  before update on public.business_posts
  for each row execute function public.set_updated_at();

create function public.guard_business_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.event_id is not null and not exists (
    select 1 from public.events e where e.id = new.event_id and e.facility_id = new.facility_id
  ) then
    raise exception 'INVALID_POST_LINK' using errcode = '22023';
  end if;
  if new.product_id is not null and not exists (
    select 1 from public.facility_products p where p.id = new.product_id and p.facility_id = new.facility_id
  ) then
    raise exception 'INVALID_POST_LINK' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger business_posts_guard
  before insert or update of event_id, product_id, facility_id on public.business_posts
  for each row execute function public.guard_business_post();

alter table public.business_posts enable row level security;
revoke all on table public.business_posts from anon, authenticated;
grant select on public.business_posts to anon, authenticated;
grant insert (facility_id, body, event_id, product_id, status, publish_at) on public.business_posts to authenticated;
grant update (body, event_id, product_id, status, publish_at) on public.business_posts to authenticated;

create policy business_posts_read on public.business_posts
  for select to anon, authenticated
  using (
    status = 'PUBLISHED'
    or (status = 'SCHEDULED' and publish_at <= now())
    or public.is_facility_staff(facility_id)
  );
create policy business_posts_insert on public.business_posts
  for insert to authenticated
  with check (public.is_facility_staff(facility_id) and status <> 'ARCHIVED');
create policy business_posts_update on public.business_posts
  for update to authenticated
  using (public.is_facility_staff(facility_id)) with check (public.is_facility_staff(facility_id));

-- -----------------------------------------------------------------------------
-- What the Sodia app reads.
-- -----------------------------------------------------------------------------
-- Posts from the businesses the signed-in person follows or belongs to.
create function public.business_feed(p_limit integer default 30, p_before timestamptz default null)
returns table (
  post_id uuid,
  facility_id text,
  business_name text,
  business_kind public.business_kind,
  logo_url text,
  body text,
  published_at timestamptz,
  event_id uuid,
  event_title text,
  event_starts_at timestamptz,
  product_id uuid,
  product_name text,
  product_price_php numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, f.id, f.name, f.business_kind, f.logo_url, p.body, p.publish_at,
         e.id, e.title, e.starts_at, pr.id, pr.name, pr.price_php
    from public.business_posts p
    join public.facilities f on f.id = p.facility_id
    left join public.events e on e.id = p.event_id and e.status = 'PUBLISHED'
    left join public.facility_products pr on pr.id = p.product_id and pr.is_active
   where (p.status = 'PUBLISHED' or (p.status = 'SCHEDULED' and p.publish_at <= now()))
     and (p_before is null or p.publish_at < p_before)
     and (
       exists (select 1 from public.business_follows bf
                where bf.facility_id = p.facility_id and bf.user_id = auth.uid())
       or exists (select 1 from public.facility_memberships m
                   where m.facility_id = p.facility_id and m.user_id = auth.uid() and m.status = 'ACTIVE')
     )
   order by p.publish_at desc
   limit least(greatest(p_limit, 1), 100);
$$;

-- A business's public profile: who it is, how many follow it, and whether the caller does.
create function public.business_profile(p_facility_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', f.id, 'slug', f.slug, 'name', f.name, 'business_kind', f.business_kind, 'category', f.category,
    'about', f.about, 'address', f.address, 'hours', f.hours, 'amenities', f.amenities,
    'logo_url', f.logo_url, 'cover_url', f.cover_url,
    'followers', (select count(*) from public.business_follows bf where bf.facility_id = f.id),
    'is_following', exists (select 1 from public.business_follows bf
                             where bf.facility_id = f.id and bf.user_id = auth.uid()),
    'is_member', exists (select 1 from public.facility_memberships m
                          where m.facility_id = f.id and m.user_id = auth.uid() and m.status = 'ACTIVE'),
    'live_posts', (select count(*) from public.business_posts p
                    where p.facility_id = f.id
                      and (p.status = 'PUBLISHED' or (p.status = 'SCHEDULED' and p.publish_at <= now())))
  )
  from public.facilities f
  where f.id = p_facility_id;
$$;

-- For the suite: how many people a post reaches. Followers and active members, counted once each.
create function public.business_audience(p_facility_id text)
returns table (followers integer, members integer, reach integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_facility_staff(p_facility_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return query
  select
    (select count(*) from public.business_follows bf where bf.facility_id = p_facility_id)::integer,
    (select count(*) from public.facility_memberships m
      where m.facility_id = p_facility_id and m.status = 'ACTIVE')::integer,
    (select count(*) from (
       select bf.user_id from public.business_follows bf where bf.facility_id = p_facility_id
       union
       select m.user_id from public.facility_memberships m
        where m.facility_id = p_facility_id and m.status = 'ACTIVE'
     ) u)::integer;
end;
$$;

-- -----------------------------------------------------------------------------
-- Handing a business over. The new owner must already be on the team; the
-- previous owner stays on as an admin.
-- -----------------------------------------------------------------------------
create function public.transfer_facility_ownership(p_facility_id text, p_new_owner uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if not public.has_facility_role(p_facility_id, array['OWNER']::public.facility_role[]) then
    raise exception 'FORBIDDEN' using errcode = '42501', hint = 'Only the owner can hand the business over.';
  end if;
  if p_new_owner = v_uid then
    raise exception 'ALREADY_OWNER' using errcode = '22023';
  end if;
  if not exists (select 1 from public.facility_staff
                  where facility_id = p_facility_id and user_id = p_new_owner) then
    raise exception 'STAFF_NOT_FOUND' using errcode = 'P0002', hint = 'Add them to the team first.';
  end if;
  update public.facility_staff set role = 'ADMIN' where facility_id = p_facility_id and role = 'OWNER';
  update public.facility_staff set role = 'OWNER' where facility_id = p_facility_id and user_id = p_new_owner;
  update public.facilities set owner_id = p_new_owner where id = p_facility_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Demo: each demo business has followers and a few posts.
-- -----------------------------------------------------------------------------
create function private.seed_demo_posts(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := left(md5(p_uid::text), 14);
  v_gym text := 'demo_' || left(md5(p_uid::text), 20);
  v_club text := 'demo_club_' || v_key;
  v_coach text := 'demo_coach_' || v_key;
  v_org text := 'demo_org_' || v_key;
  v_fid text;
  i integer;
begin
  foreach v_fid in array array[v_gym, v_club, v_coach, v_org] loop
    if not exists (select 1 from public.facilities where id = v_fid)
       or exists (select 1 from public.business_posts where facility_id = v_fid) then
      continue;
    end if;
    for i in 10..18 loop
      insert into public.business_follows (facility_id, user_id)
      values (v_fid, md5('gp-demo-member-' || i)::uuid) on conflict do nothing;
    end loop;
  end loop;

  if exists (select 1 from public.facilities where id = v_gym)
     and not exists (select 1 from public.business_posts where facility_id = v_gym) then
    insert into public.business_posts (facility_id, author_id, body, product_id, status, publish_at) values
      (v_gym, p_uid, 'New squat racks are in. Come break them in this week.', null, 'PUBLISHED', now() - interval '3 days'),
      (v_gym, p_uid, 'Bring a friend this weekend: day passes are on us for anyone training with a member.',
       (select id from public.facility_products where facility_id = v_gym and kind = 'PASS' order by sort_order limit 1),
       'PUBLISHED', now() - interval '20 hours'),
      (v_gym, p_uid, 'We open at 5 AM from Monday. Early birds, this one is for you.', null, 'SCHEDULED', now() + interval '2 days');
  end if;
  if exists (select 1 from public.facilities where id = v_club)
     and not exists (select 1 from public.business_posts where facility_id = v_club) then
    insert into public.business_posts (facility_id, author_id, body, status, publish_at) values
      (v_club, p_uid, 'Court 2 has fresh lines and a new net. Evening slots are open all week.', 'PUBLISHED', now() - interval '2 days'),
      (v_club, p_uid, 'Beginner pickleball clinic every Tuesday at 2 PM. Paddles provided.', 'SCHEDULED', now() + interval '1 day');
  end if;
  if exists (select 1 from public.facilities where id = v_coach)
     and not exists (select 1 from public.business_posts where facility_id = v_coach) then
    insert into public.business_posts (facility_id, author_id, body, status, publish_at) values
      (v_coach, p_uid, 'Tip of the week: log your warm-up sets too. Seeing the ramp tells me more than the top set.',
       'PUBLISHED', now() - interval '1 day');
  end if;
  if exists (select 1 from public.facilities where id = v_org)
     and not exists (select 1 from public.business_posts where facility_id = v_org) then
    insert into public.business_posts (facility_id, author_id, body, event_id, status, publish_at) values
      (v_org, p_uid, 'Six places left for Saturday. All levels welcome, paddles at the desk.',
       (select id from public.events where facility_id = v_org and title = 'Saturday Pickleball Open Play' limit 1),
       'PUBLISHED', now() - interval '5 hours'),
      (v_org, p_uid, 'Fun Run bibs can be collected from 5 AM at the start line. See you there.',
       (select id from public.events where facility_id = v_org and title = 'New Year Fun Run 5K' limit 1),
       'SCHEDULED', now() + interval '3 days');
  end if;
end;
$$;

create or replace function public.create_demo_venue()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fid text := private.create_demo_venue_base();
begin
  perform private.seed_demo_extras(v_fid, auth.uid());
  perform private.create_demo_workspaces(auth.uid());
  perform private.seed_demo_contacts('demo_club_' || left(md5(auth.uid()::text), 14));
  perform private.seed_demo_posts(auth.uid());
  return v_fid;
end;
$$;

do $$
declare
  r record;
begin
  for r in select owner_id from public.facilities where id like 'demo\_%' and business_kind = 'GYM' loop
    perform private.seed_demo_posts(r.owner_id);
  end loop;
end;
$$;

revoke execute on function
  public.guard_business_post(), private.seed_demo_posts(uuid),
  public.business_feed(integer, timestamptz), public.business_profile(text),
  public.business_audience(text), public.transfer_facility_ownership(text, uuid)
  from public, anon, authenticated;
grant execute on function public.business_profile(text) to anon, authenticated;
grant execute on function
  public.business_feed(integer, timestamptz), public.business_audience(text),
  public.transfer_facility_ownership(text, uuid)
  to authenticated;
