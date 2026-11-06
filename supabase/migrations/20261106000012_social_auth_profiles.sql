-- =============================================================================
-- Social sign-in (Google / Apple): seed profiles from provider metadata.
--   Google sends full_name / name / avatar_url (or picture).
--   Apple sends no name in the token; the app writes first_name / last_name
--   into user metadata after the first sign-in, so we also sync on UPDATE —
--   but only into fields the user hasn't filled in themselves.
-- =============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_full text := nullif(btrim(coalesce(v_meta ->> 'name', v_meta ->> 'full_name', '')), '');
begin
  insert into public.profiles (id, name, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(v_full, ''),
    nullif(btrim(coalesce(v_meta ->> 'first_name', v_meta ->> 'given_name', '')), ''),
    nullif(btrim(coalesce(v_meta ->> 'last_name', v_meta ->> 'family_name', '')), ''),
    nullif(btrim(coalesce(v_meta ->> 'avatar_url', v_meta ->> 'picture', '')), '')
  );
  return new;
end;
$$;

create function public.sync_profile_from_auth_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  update public.profiles p
     set first_name = coalesce(p.first_name, nullif(btrim(v_meta ->> 'first_name'), '')),
         last_name  = coalesce(p.last_name,  nullif(btrim(v_meta ->> 'last_name'), '')),
         name       = case when coalesce(p.name, '') = ''
                           then coalesce(nullif(btrim(v_meta ->> 'name'), ''), '') else p.name end,
         avatar_url = coalesce(p.avatar_url, nullif(btrim(coalesce(v_meta ->> 'avatar_url', v_meta ->> 'picture', '')), ''))
   where p.id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_metadata_updated
  after update of raw_user_meta_data on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function public.sync_profile_from_auth_metadata();

revoke execute on function public.sync_profile_from_auth_metadata() from public, anon, authenticated;
