\set ON_ERROR_STOP on
begin;

-- Google-style sign-up: full name + picture in metadata.
insert into auth.users (id, email, raw_user_meta_data)
values ('6a000000-0000-0000-0000-00000000006a', 'g@test.local',
        '{"full_name":"Maria Santos","name":"Maria Santos","picture":"https://lh3.example/p.jpg","email_verified":true}');
select tests.ok((select name from public.profiles where id = '6a000000-0000-0000-0000-00000000006a') = 'Maria Santos',
  'Google full name seeds the profile');
select tests.ok((select avatar_url from public.profiles where id = '6a000000-0000-0000-0000-00000000006a') = 'https://lh3.example/p.jpg',
  'Google picture seeds the avatar');
select tests.ok((select count(*) from public.qr_codes where user_id = '6a000000-0000-0000-0000-00000000006a') = 1,
  'social sign-ups get their friend QR code too');

-- Apple-style sign-up: no name in the token; the app sends it afterwards.
insert into auth.users (id, email, raw_user_meta_data)
values ('a9000000-0000-0000-0000-0000000000a9', 'x@privaterelay.appleid.com', '{}');
update auth.users
   set raw_user_meta_data = '{"first_name":"Jose","last_name":"Rizal","name":"Jose Rizal"}'
 where id = 'a9000000-0000-0000-0000-0000000000a9';
select tests.ok(
  (select first_name || ' ' || last_name || ' / ' || name from public.profiles where id = 'a9000000-0000-0000-0000-0000000000a9')
    = 'Jose Rizal / Jose Rizal',
  'Apple name arriving after sign-up fills the profile');

-- A later metadata change never overwrites what the user set themselves.
update public.profiles set first_name = 'Pepe' where id = 'a9000000-0000-0000-0000-0000000000a9';
update auth.users set raw_user_meta_data = '{"first_name":"Someone Else"}' where id = 'a9000000-0000-0000-0000-0000000000a9';
select tests.ok((select first_name from public.profiles where id = 'a9000000-0000-0000-0000-0000000000a9') = 'Pepe',
  'user-edited names are kept');

rollback;
