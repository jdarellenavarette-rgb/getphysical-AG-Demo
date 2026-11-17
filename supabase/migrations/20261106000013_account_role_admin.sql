-- =============================================================================
-- 0013: Operator tools for granting account roles
-- =============================================================================
-- Nobody can make themselves a coach, an organizer or a venue's staff: the
-- `roles` columns are not client-writable. Until there is an in-product
-- application flow, an operator grants these with the functions below.
--
-- They are callable only by `service_role` (the Supabase dashboard SQL editor,
-- or a server-side script). The apps never call them.
--
-- A person is identified by something they signed up with or chose:
--   their email, their mobile number (+639…, 639… or 09…), their username,
--   or their user id.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Resolve "who" to exactly one user id, or fail with a clear message.
create function private.resolve_user(p_who text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_who text := btrim(coalesce(p_who, ''));
  v_digits text := regexp_replace(v_who, '\D', '', 'g');
  v_phone text;
  v_ids uuid[];
begin
  if v_who = '' then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002', hint = 'No identifier given.';
  end if;

  -- Philippine numbers are stored without the plus sign: 639XXXXXXXXX.
  if v_who !~ '@' and length(v_digits) between 10 and 12 then
    v_phone := '63' || right(v_digits, 10);
  end if;

  select array_agg(distinct id) into v_ids
    from (
      select u.id from auth.users u where lower(u.email) = lower(v_who)
      union all
      select u.id from auth.users u where v_phone is not null and u.phone = v_phone
      union all
      select p.id from public.profiles p where p.username = v_who
      union all
      select u.id from auth.users u where u.id::text = lower(v_who)
    ) matches;

  if v_ids is null then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002',
      hint = 'No account matches that email, mobile number, username or id. Has the person signed in at least once?';
  end if;
  if array_length(v_ids, 1) > 1 then
    raise exception 'USER_AMBIGUOUS' using errcode = '22023',
      hint = 'More than one account matches. Use the user id instead.';
  end if;
  return v_ids[1];
end;
$$;

-- Add an account role ('coach', 'organizer' or 'staff'). Safe to repeat.
create function public.admin_grant_role(p_who text, p_role text)
returns table (user_id uuid, username text, roles text[])
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := private.resolve_user(p_who);
  v_role text := lower(btrim(coalesce(p_role, '')));
begin
  if v_role not in ('coach', 'organizer', 'staff') then
    raise exception 'INVALID_ROLE' using errcode = '22023',
      hint = 'Role must be coach, organizer or staff.';
  end if;

  return query
  update public.profiles p
     set roles = (select array_agg(distinct r order by r)
                    from unnest(coalesce(p.roles, array['individual']) || v_role) r),
         user_roles = (select array_agg(distinct r order by r)
                         from unnest(coalesce(p.user_roles, array['individual']) || v_role) r)
   where p.id = v_user
  returning p.id, p.username::text, p.roles;
end;
$$;

-- Remove an account role. The base 'individual' role cannot be removed.
create function public.admin_revoke_role(p_who text, p_role text)
returns table (user_id uuid, username text, roles text[])
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := private.resolve_user(p_who);
  v_role text := lower(btrim(coalesce(p_role, '')));
begin
  if v_role not in ('coach', 'organizer', 'staff') then
    raise exception 'INVALID_ROLE' using errcode = '22023',
      hint = 'Role must be coach, organizer or staff.';
  end if;

  return query
  update public.profiles p
     set roles = array_remove(coalesce(p.roles, array['individual']), v_role),
         user_roles = array_remove(coalesce(p.user_roles, array['individual']), v_role),
         -- Never leave the account acting in a role it no longer holds.
         active_role = case when p.active_role = v_role then 'individual' else p.active_role end
   where p.id = v_user
  returning p.id, p.username::text, p.roles;
end;
$$;

-- Put an account on a venue's team (STAFF, COACH or ADMIN) and give it the
-- matching account role. Ownership is not assigned here: the owner is whoever
-- created the venue.
create function public.admin_assign_staff(
  p_who text,
  p_facility_id text,
  p_role public.facility_role default 'STAFF'
)
returns table (user_id uuid, facility_id text, facility_role public.facility_role, roles text[])
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := private.resolve_user(p_who);
  v_account_role text := case when p_role = 'COACH' then 'coach' else 'staff' end;
begin
  if p_role = 'OWNER' then
    raise exception 'INVALID_ROLE' using errcode = '22023',
      hint = 'The owner is the account that created the venue.';
  end if;
  if not exists (select 1 from public.facilities f where f.id = p_facility_id) then
    raise exception 'FACILITY_NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.facility_staff (facility_id, user_id, role)
  values (p_facility_id, v_user, p_role)
  on conflict on constraint facility_staff_pkey do update
     set role = excluded.role
   where public.facility_staff.role <> 'OWNER';

  perform public.admin_grant_role(v_user::text, v_account_role);

  return query
  select s.user_id, s.facility_id, s.role, p.roles
    from public.facility_staff s
    join public.profiles p on p.id = s.user_id
   where s.facility_id = p_facility_id and s.user_id = v_user;
end;
$$;

-- One row per account that holds a role beyond a regular member: who the
-- pioneers are, and what each one can do.
create function public.admin_list_role_holders()
returns table (user_id uuid, username text, name text, roles text[], venues jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.username::text, p.name, p.roles,
         coalesce(
           (select jsonb_agg(jsonb_build_object('facility_id', s.facility_id, 'name', f.name, 'role', s.role)
                             order by f.name)
              from public.facility_staff s
              join public.facilities f on f.id = s.facility_id
             where s.user_id = p.id),
           '[]'::jsonb)
    from public.profiles p
   where coalesce(array_length(array_remove(p.roles, 'individual'), 1), 0) > 0
      or exists (select 1 from public.facility_staff s where s.user_id = p.id)
   order by p.name;
$$;

-- Operator-only: never reachable from the apps.
revoke execute on function private.resolve_user(text) from public, anon, authenticated;
revoke execute on function public.admin_grant_role(text, text) from public, anon, authenticated;
revoke execute on function public.admin_revoke_role(text, text) from public, anon, authenticated;
revoke execute on function public.admin_assign_staff(text, text, public.facility_role) from public, anon, authenticated;
revoke execute on function public.admin_list_role_holders() from public, anon, authenticated;

grant execute on function public.admin_grant_role(text, text) to service_role;
grant execute on function public.admin_revoke_role(text, text) to service_role;
grant execute on function public.admin_assign_staff(text, text, public.facility_role) to service_role;
grant execute on function public.admin_list_role_holders() to service_role;
