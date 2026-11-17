# Sign-in and Pioneer Accounts

How people get into the mobile app, what has to be switched on for it to work, and how to create the first real account of each type.

## Ways in

| Option               | What happens                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Email and a code     | A code is emailed to the address. The first sign-in creates the account.                   |
| Continue with Google | Google sign-in. The first sign-in creates the account.                                     |
| Continue as guest    | Opens the same empty app a new account sees. Nothing is saved and there is no sample data. |

Text-message codes and Apple sign-in are not offered.

A guest can look around. Posting, commenting, liking, following, messaging and buying a pass each ask them to sign in first.

After a first sign-in the app asks once for name, username and date of birth (13+).

## What must be switched on

### Email codes

Working on the live project:

- Email sign-in is on, and mail is sent through Resend from `info@contact.getphysical.fitness`.
- Both sign-in emails ("Confirm signup" for a first sign-in, "Magic Link" for later ones) carry the code, `{{ .Token }}`, instead of a link. The app has no screen for a link, so the templates must keep the code.
- Codes are 8 digits and last one hour. The app accepts 6 to 8 digits.

Sending limits and the reasoning behind them are in `EMAIL_AND_AUTH_LIMITS.md`.

### Google

Not switched on yet. It needs a Google Cloud OAuth client, which only the account owner can create. Steps are in `SOCIAL_SIGN_IN.md` (the Google section). The project's redirect list is also empty, so add `sodia://auth/callback` under Authentication → URL Configuration when you set Google up.

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

1. **Sign up for real.** On a phone, sign in once with the email address that will own the pioneer account, and finish the profile screen. Do this once per account type, with a different address each time. One Gmail inbox can serve all five: `you+member@gmail.com`, `you+owner@gmail.com` and so on are separate accounts whose mail all arrives in `you@gmail.com`.
2. **The venue owner creates the venue.** Sign in to the web Business Suite with the owner account and create the venue there. Creating it makes that account the owner; nothing else is needed.
3. **Grant the other roles.** In the Supabase dashboard open **SQL Editor** and run the matching line below, once per account. Identify the person by their email, their username, or their user id.
4. **Sign out and back in** on the phone so the app picks up the new role. The matching workspace then appears under Settings.

```sql
-- Coach or organizer
select * from public.admin_grant_role('person@example.com', 'coach');
select * from public.admin_grant_role('you+organizer@gmail.com', 'organizer');

-- Staff of a venue (use the venue's id from the facilities table).
-- The third value can be 'STAFF', 'COACH' or 'ADMIN'.
select * from public.admin_assign_staff('you+staff@gmail.com', 'the_venue_id', 'STAFF');

-- See every account that holds a role, and at which venues
select * from public.admin_list_role_holders();

-- Take a role away again
select * from public.admin_revoke_role('person@example.com', 'coach');
```

Each call returns the account it changed. If it answers `USER_NOT_FOUND`, the email or username did not match an account: check the spelling and that the person has signed in at least once.

These functions exist only for operators. The mobile and web apps cannot call them, and no one can grant themselves a role; both are covered by the database tests (`supabase/tests/95_account_role_admin.test.sql`).

The scripted walk-through for the five accounts is in `PIONEER_TEST_PLAN.md`.

## What a new account sees

Everything starts empty and fills from that person's own activity: no posts, no stories, no messages, no notifications, no passes, no workouts, no personal bests, and a profile with their own name and zero counts.

Two areas still show built-in sample content and are next to be connected to the database:

- **Venues, coaches and clubs** on the Venues tab.
- **The coach, staff and organizer workspaces**, which appear only for accounts holding those roles.
