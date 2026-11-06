# Sign in with Google & Apple — Setup

The code is done (mobile + web + database). These console steps connect it to real Google and Apple
accounts. Never paste client secrets or `.p8` keys into chat or commit them.

Supabase project: `cmahltbjopkihcfkzzex`
Supabase callback URL (used by both providers):
`https://cmahltbjopkihcfkzzex.supabase.co/auth/v1/callback`

## How it works

| Where | Apple | Google |
|---|---|---|
| iPhone app | Native Apple sheet (Face ID) → ID token → Supabase | Secure browser sheet → Supabase OAuth (PKCE) |
| Android app | Secure browser sheet → Supabase OAuth | Secure browser sheet → Supabase OAuth |
| Web Business Suite | Redirect → `/auth/callback` | Redirect → `/auth/callback` |

Every route ends in a normal Supabase session, then the same profile setup (username + date of birth with the
13+ gate). Email one-time codes stay available as a fallback.

App Store rule: because the app offers Google sign-in, iOS must also offer Sign in with Apple.

## 1. Google (free, ~10 minutes)

1. Open https://console.cloud.google.com and create a project (e.g. "GetPhysical").
2. **Google Auth Platform → Branding** (OAuth consent screen): app name `GetPhysical`, support email,
   authorized domains `getphysical.fitness` and `supabase.co`. Scopes: `openid`, `email`, `profile`.
3. **Clients → Create client → Web application**:
   - Authorized redirect URI: `https://cmahltbjopkihcfkzzex.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client secret**.
4. **Supabase → Authentication → Sign In / Providers → Google**: enable, paste the Client ID and secret, save.
5. Publish the consent screen (Audience → Publish) before inviting the public; in "Testing" only listed
   test users can sign in.

The mobile app uses the browser flow, so no separate iOS/Android Google client IDs are needed.

## 2. Apple (requires the Apple Developer Program, US$99/year)

1. **Certificates, IDs & Profiles → Identifiers → App IDs**: open (or create) `com.getphysical.sodia` and
   enable **Sign in with Apple**.
2. **Identifiers → Services IDs → +**: e.g. `fitness.getphysical.signin`. Enable **Sign in with Apple** →
   Configure:
   - Primary App ID: `com.getphysical.sodia`
   - Domains: `cmahltbjopkihcfkzzex.supabase.co`
   - Return URL: `https://cmahltbjopkihcfkzzex.supabase.co/auth/v1/callback`
3. **Keys → +**: enable **Sign in with Apple**, download the `.p8` file (only downloadable once). Note the
   **Key ID** and your **Team ID** (top-right of the developer portal).
4. **Supabase → Authentication → Sign In / Providers → Apple**: enable, then
   - Client IDs: `fitness.getphysical.signin,com.getphysical.sodia` (Services ID for web, bundle ID for native iOS)
   - Secret key: generate it from the `.p8`, Key ID, Team ID and Services ID (Supabase's Apple provider
     docs link a generator). **This secret expires after at most 6 months — set a calendar reminder to rotate it.**
5. **Private-relay emails**: users who choose "Hide My Email" get an `@privaterelay.appleid.com` address.
   For our emails to reach them, go to **Services → Sign in with Apple for Email Communication** and register
   `contact.getphysical.fitness` and `no-reply@contact.getphysical.fitness`.

## 3. Supabase redirect URLs

**Authentication → URL Configuration → Redirect URLs** must include:

- `sodia://auth/callback` (mobile)
- `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/confirm` (local web)
- `https://<production web domain>/auth/callback` and `/auth/confirm`

## 4. Testing

- **Google in the app** and **Apple on Android** need a development build (`eas build --profile development`):
  Expo Go cannot receive the `sodia://` redirect.
- **Native Apple** needs an iOS development build signed with the team that owns the App ID.
- The web Business Suite works locally at `http://localhost:3000/login` once the providers are enabled.

## Account linking

Supabase links identities that share the same **verified** email automatically (e.g. email code + Google with
the same Gmail). Apple "Hide My Email" addresses are different addresses, so they become separate accounts.
