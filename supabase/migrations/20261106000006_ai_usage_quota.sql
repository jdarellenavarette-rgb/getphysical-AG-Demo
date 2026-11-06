-- =============================================================================
-- Per-user daily quota for server-side AI calls (nutrition-parse edge function).
-- The Gemini key lives only in the edge function's secrets; this table stops a
-- single account from running up the bill.
-- =============================================================================

create table public.ai_usage_daily (
  user_id uuid not null references public.profiles (id) on delete cascade,
  usage_date date not null default (now() at time zone 'Asia/Manila')::date,
  feature text not null,
  request_count integer not null default 0,
  primary key (user_id, usage_date, feature)
);

-- Atomically consume one unit of quota. Returns false once the limit is hit.
create function public.consume_ai_quota(p_feature text, p_daily_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  insert into public.ai_usage_daily (user_id, feature, request_count)
  values (v_uid, p_feature, 1)
  on conflict (user_id, usage_date, feature)
  do update set request_count = public.ai_usage_daily.request_count + 1
  returning request_count into v_count;
  return v_count <= p_daily_limit;
end;
$$;
