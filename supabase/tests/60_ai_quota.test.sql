\set ON_ERROR_STOP on
begin;

select tests.create_user('11111111-1111-1111-1111-111111111111', 'Athlete');

select tests.act_as('11111111-1111-1111-1111-111111111111');
select tests.ok(public.consume_ai_quota('nutrition', 2), 'first call within quota');
select tests.ok(public.consume_ai_quota('nutrition', 2), 'second call within quota');
select tests.ok(not public.consume_ai_quota('nutrition', 2), 'third call exceeds quota');
select tests.ok(public.consume_ai_quota('other_feature', 2), 'quotas are per feature');
select tests.throws($$update public.ai_usage_daily set request_count = 0$$,
  'permission denied', 'users cannot reset their own quota');
select tests.reset_actor();

select tests.act_as_anon();
select tests.throws($$select public.consume_ai_quota('nutrition', 2)$$,
  'permission denied', 'anon cannot use AI quota');
select tests.reset_actor();

rollback;
