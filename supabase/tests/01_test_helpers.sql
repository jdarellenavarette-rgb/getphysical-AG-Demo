-- Test helpers (loaded after migrations; test databases only).
\set ON_ERROR_STOP on

create schema tests;
grant usage on schema tests to anon, authenticated, service_role;

-- Create an auth user (profile is created by the on_auth_user_created trigger).
create function tests.create_user(p_id uuid, p_name text, p_dob date default '1990-01-01')
returns uuid
language plpgsql
as $$
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (p_id, p_id::text || '@test.local', jsonb_build_object('name', p_name));
  update public.profiles set dob = p_dob where id = p_id;
  return p_id;
end;
$$;

-- Switch the current transaction to act as a signed-in user (or anon / service).
create function tests.act_as(p_user uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end;
$$;

create function tests.act_as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
end;
$$;

create function tests.act_as_service()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  execute 'set local role service_role';
end;
$$;

create function tests.reset_actor()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '', true);
  execute 'reset role';
end;
$$;

create function tests.ok(p_condition boolean, p_description text)
returns void
language plpgsql
as $$
begin
  if p_condition is distinct from true then
    raise exception 'FAIL: %', p_description;
  end if;
  raise notice 'ok - %', p_description;
end;
$$;

-- Assert that a statement raises, optionally matching a message fragment.
create function tests.throws(p_sql text, p_message_like text, p_description text)
returns void
language plpgsql
as $$
declare
  v_message text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_message = message_text;
    if p_message_like is not null and v_message not ilike '%' || p_message_like || '%' then
      raise exception 'FAIL: % (raised "%", expected "%")', p_description, v_message, p_message_like;
    end if;
    raise notice 'ok - %', p_description;
    return;
  end;
  raise exception 'FAIL: % (statement did not raise)', p_description;
end;
$$;

grant execute on all functions in schema tests to anon, authenticated, service_role;
