# Run the Sodia app in Expo Go

The app targets **Expo SDK 58**. Expo Go only runs the SDK it was built for, so keep the Expo Go app updated.

## Every time you pull new code

```bash
git pull
pnpm install
```

Skipping `pnpm install` after a pull is the most common reason the app won't open: new packages are
missing and Metro shows **"Unable to resolve module …"**.

## Start it

From the repo root:

```bash
pnpm mobile
```

Scan the QR code with the iPhone Camera app (iOS) or from inside Expo Go (Android). `--clear` is built into the
script, so stale Metro caches are wiped on every start.

Don't use `pnpm dev` from the root for the phone: it starts web and mobile together in Turbo's split view,
which hides Expo's QR code and interactive keys.

## Supabase settings (optional for a quick look)

`apps/mobile/.env` (copy from `apps/mobile/.env.example`):

The app always opens with the splash screen, then the **sign-in screen** (Sign In / Sign Up, Google, Apple, email).
**Explore as Guest** on that screen opens the demo without an account.

- **No Supabase values** → only the guest demo works (sign-in buttons can't reach a backend).
- **With** `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` → real sign-in works.
  Email codes need the Supabase email template to contain `{{ .Token }}` (see `docs/EMAIL_AND_AUTH_LIMITS.md`).

Restart `pnpm mobile` after editing `.env`.

## In Expo Go vs. a development build

| Works in Expo Go | Needs a development build (EAS) |
|---|---|
| Guest demo, sign-in with email code, profile setup, QR codes and scanner, cards, inbox | Continue with Google, Continue with Apple (they return to the app via `sodia://`, which Expo Go can't receive) |

## Troubleshooting

| What you see | Fix |
|---|---|
| "Unable to resolve module …" | `pnpm install` at the repo root, then `pnpm mobile` |
| "Project is incompatible with this version of Expo Go" | Update Expo Go from the App Store / Play Store (needs SDK 58) |
| Phone stuck on "Opening project…" / can't connect | Phone and computer on the same Wi-Fi, or run `pnpm mobile:tunnel` |
| App opens on the sign-in screen but no code arrives | Check the Supabase email template and Resend setup (`docs/EMAIL_AND_AUTH_LIMITS.md`) |
| Red error screen | Send the first lines of the error (the message and the file name) |

## Automated launch check

`pnpm --filter @getphysical/mobile test` renders the app the way Expo Go starts it (splash → sign-in → guest demo, and
splash → sign-in with Supabase configured) and fails if launch crashes. It runs in CI on every pull request.
