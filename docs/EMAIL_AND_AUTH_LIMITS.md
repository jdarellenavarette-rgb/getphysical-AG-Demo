# Email & Auth Limits — Reference

How sign-in emails are sent, and the limits to set. Update this file whenever a value changes.

_Last reviewed: 2026-11-06._

## Setup at a glance

| Item | Value |
|---|---|
| Email provider | Resend (connected to Supabase as custom SMTP) |
| Sending domain | `contact.getphysical.fitness` — **verified** in Resend |
| Root domain | `getphysical.fitness` — not verified in Resend (not used for sending) |
| Sender address | `no-reply@contact.getphysical.fitness` |
| Sender name | `GetPhysical` |
| Supabase project | `cmahltbjopkihcfkzzex` (staging) |

### Supabase SMTP settings (Authentication → Emails → SMTP Settings)

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API key (sending access only, restricted to the domain). Never commit or paste it in chat. |

## Resend plan limits (current: Free)

| Limit | Free plan (checked 2026-11-06) |
|---|---|
| Emails per day | 100 |
| Emails per month | 3,000 |
| API rate | 10 requests / second |
| Domains | 3 |

Each sign-in uses one email. Users stay signed in for weeks (refresh tokens), so normal usage is low.
**Upgrade to a paid Resend plan before public launch** — the 100/day cap can be hit by one busy hour.

## Supabase rate limits (Authentication → Rate Limits)

| Setting | Testing (Resend Free) | Launch (paid Resend) |
|---|---|---|
| Emails sent per hour (whole project) | **30** | **300** — raise temporarily for promos / launch events |
| Minimum interval between codes for the same address | **60 seconds** | **60 seconds** |
| Token (code) verifications per IP / 5 min | default (30) | default (30) |

Why:
- **30/hour** covers team testing while stopping a single burst from burning the whole daily quota.
  Resend still enforces its own 100/day cap independently.
- **300/hour** absorbs a busy launch hour (hundreds of sign-ups at once).
- **60 s per address** is the standard anti-spam interval. The app's "Resend code" button should show a
  matching countdown.
- Rate limits protect **cost** and **sender reputation**: bots entering random addresses cause bounces,
  which can get the domain flagged as spam.

## Sign-in code settings (Authentication → Providers → Email)

| Setting | Value |
|---|---|
| Email OTP length | 6 digits (matches `SODIA_FIELD_LIMITS.OTP_CODE_LENGTH`; the app also accepts 6–8) |
| Email OTP expiration | 600 seconds (10 minutes) |
| Minimum password length | 8 (web Business Suite) |

Email templates (Authentication → Email Templates): **Magic Link** and **Confirm signup** must contain
`{{ .Token }}` so the email shows the 6-digit code the app asks for.

Redirect URLs (Authentication → URL Configuration): `http://localhost:3000/auth/confirm`,
`sodia://auth/callback`, plus the production web domain's `/auth/confirm`.

## Before launch checklist

- [ ] Upgrade Resend from Free to a paid plan.
- [ ] Raise "Emails sent per hour" from 30 to 300.
- [ ] Turn on bot protection (Authentication → Bot Protection; Cloudflare Turnstile is free).
- [ ] Keep Resend **open and click tracking off** for auth emails (click tracking rewrites links and can
      break sign-in links).
- [ ] Add the production web domain to the redirect URLs.
- [ ] Re-check the Resend plan limits table above and update this file.
