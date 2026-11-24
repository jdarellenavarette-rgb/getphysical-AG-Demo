-- =============================================================================
-- A business records which version of the Business Terms it accepted, and when,
-- at the moment it is created. Set once; not editable afterwards.
-- =============================================================================
alter table public.facilities
  add column terms_version text check (terms_version is null or char_length(terms_version) <= 40),
  add column terms_accepted_at timestamptz;

grant insert (terms_version, terms_accepted_at) on public.facilities to authenticated;

-- The time is the server's, whatever the client sends.
create function public.stamp_terms_acceptance()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.terms_accepted_at := case when new.terms_version is null then null else now() end;
  return new;
end;
$$;

create trigger facilities_stamp_terms
  before insert on public.facilities
  for each row execute function public.stamp_terms_acceptance();

revoke execute on function public.stamp_terms_acceptance() from public, anon, authenticated;
