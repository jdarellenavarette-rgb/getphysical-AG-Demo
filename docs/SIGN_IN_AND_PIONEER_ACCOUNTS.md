# Sign-in and Pioneer Accounts

How people get into the mobile app, what has to be switched on for it to work, and how to create the first real account of each type.

## Ways in

| Option                 | What happens                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Mobile number and code | A 6-digit code is texted to a Philippine mobile number. The first sign-in creates the account. |
| Continue with Google   | Google sign-in. The first sign-in creates the account.                                         |
| Continue as guest      | Opens the same empty app a new account sees. Nothing is saved and there is no sample data.     |

Email codes and Apple sign-in are no longer offered on the sign-in screen.

A guest can look around. Posting, commenting, liking, following, messaging and buying a pass each ask them to sign in first.

After a first sign-in the app asks once for name, username and date of birth (13+).

## What must be switched on

### Text-message codes (required for mobile-number sign-in)

Supabase does not send text messages itself. It needs an SMS provider with its own paid account. Until one is connected, "Text me a code" answers "Text-message sign-in isn't switched on yet. Use Google for now."

1. Open an account with a provider Supabase supports: Twilio, Twilio Verify, MessageBird, Vonage or Textlocal. Check its price and sender rules for the Philippines before choosing.
2. In the Supabase dashboard: **Authentication → Sign In / Providers → Phone**. Turn it on, choose the provider, and paste the provider's credentials there. Never put them in the repository or in chat.
3. Set the message to: `Your GetPhysical code is {{ .Code }}. It expires in 10 minutes.`
4. Keep the code length at 6 digits. The app expects exactly 6.

`supabase/config.toml` carries the same settings for local development, reading the credentials from environment variables.

**Testing without paying per message.** The same Phone settings page has a "Test phone numbers and OTPs" field. A number listed there always accepts its fixed code and no text is sent. This is the practical way to sign in the pioneer accounts below while the provider is being set up. Remove the test numbers before launch.

### Google

Already wired. Setup steps are in `SOCIAL_SIGN_IN.md` (the Google section).

### Apple, before an App Store release

Apple's review rules require an app that offers Google sign-in to also offer an equivalent privacy-focused option, which in practice means Sign in with Apple. It is hidden for now, and the code for it is still in `apps/mobile/src/services/socialAuth.ts`. Plan to bring the button back before submitting the iOS app, or the submission is likely to be rejected. Android is not affected.

## Pioneer accounts

A pioneer account is an ordinary account that a real person signs in to. Nothing about it is stored in the app's code. What makes it a staff, coach or organizer account is a role granted in the database.

| Account type | What grants it                                                                |
| ------------ | ----------------------------------------------------------------------------- |
| Member       | Nothing. Every new account is a member.                                       |
| Coach        | The `coach` role on the profile.                                              |
| Organizer    | The `organizer` role on the profile.                                          |
| Staff        | The `staff` role on the profile, plus a staff row for the venue they work at. |
| Venue owner  | Same as staff, with the `OWNER` role for that venue.                          |

### Steps

1. **Sign up for real.** On a phone, sign in once with the mobile number or Google account that will own the pioneer account, and finish the profile screen. Do this once per account type, with a different number or Google account each time.
2. **Grant the role.** In the Supabase dashboard open **SQL Editor**, paste the block below, change the two values at the top, and run it. Run it once per account.
3. **Sign out and back in** on the phone so the app picks up the new role. The matching workspace then appears under Settings.

```sql
-- Change these two values, then run.
-- who: the account's Google email, or its mobile number in +639XXXXXXXXX form.
-- new_role: 'coach', 'organizer' or 'staff'.
with input as (
  select 'person@example.com'::text as who, 'coach'::text as new_role
),
target as (
  select u.id
    from auth.users u, input i
   where u.email = i.who or u.phone = ltrim(i.who, '+')
)
update public.profiles p
   set roles      = (select array_agg(distinct r) from unnest(coalesce(p.roles, '{individual}') || i.new_role) r),
       user_roles = (select array_agg(distinct r) from unnest(coalesce(p.user_roles, '{individual}') || i.new_role) r)
  from target t, input i
 where p.id = t.id
returning p.id, p.username, p.roles;
```

The query returns one row with the account's roles. If it returns nothing, the email or number did not match an account: check the spelling and that the person has signed in at least once.

For a **staff** or **venue owner** account, also link it to its venue. Use `'STAFF'` or `'OWNER'`, and the venue's id from the `facilities` table:

```sql
insert into public.facility_staff (facility_id, user_id, role)
select 'the_venue_id', u.id, 'STAFF'
  from auth.users u
 where u.email = 'person@example.com' or u.phone = '639XXXXXXXXX'
on conflict (facility_id, user_id) do update set role = excluded.role;
```

### Removing a role

Same block as step 2 with the last part changed to remove instead of add:

```sql
update public.profiles
   set roles = array_remove(roles, 'coach'), user_roles = array_remove(user_roles, 'coach')
 where id = (select id from auth.users where email = 'person@example.com');
```

## What a new account sees

Everything starts empty and fills from that person's own activity: no posts, no stories, no messages, no notifications, no passes, no workouts, no personal bests, and a profile with their own name and zero counts.

Two areas still show built-in sample content and are next to be connected to the database:

- **Venues, coaches and clubs** on the Venues tab.
- **The coach, staff and organizer workspaces**, which appear only for accounts holding those roles.
