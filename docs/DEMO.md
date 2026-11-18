# Demo Guide

How to show the Business Suite and the Sodia app working together. Last verified 2026-11-18 against the staging project (`cmahltbjopkihcfkzzex`).

## What is set up on staging

| Piece          | State                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Database       | All migrations through `20261118000004` applied                                                                      |
| Payments mode  | `sandbox` (test payments; no real money)                                                                             |
| Edge functions | All five deployed from current code                                                                                  |
| Maya           | Sandbox keys set; payment webhooks point at `webhook-maya`                                                           |
| Sign-in        | Google and email; redirects allowed for `localhost:3000`, `getphysical-ag-demo.vercel.app` and its preview addresses |

## Business Suite (web)

1. Open the deployed site (Vercel project `getphysical-ag-demo`) and sign in with Google or email.
2. On the first screen choose **Explore with a demo venue**. You get "Pulse Fitness (Demo)", which you own, with:
   - 18 sample members: 12 active, 4 lapsed, 1 without a pass, 1 cancelled
   - four plans, test payments connected
   - a month of check-ins with morning and evening peaks, 16 sales and five conversations
3. Walk through, in this order:
   - **Overview**: the owner's command centre. Switch the time frame (Today, 7, 30, 90 days) and show:
     needs-attention queue, member growth (joined − lapsed − cancelled), check-ins chart, busy-hours map with
     "Create an off-peak plan", door versus sales, at-risk members with "Message lapsed members", and what sold.
   - **Members**: standing for each member; grant a pass to someone with "No pass"; show the venue code.
   - **Inbox**: reply to a member; send a broadcast to **Lapsed (win-back)** and see it reach four people.
   - **Plans and prices**: add a plan; switch one off; turn "We offer memberships" off and on.
   - **Payouts**: status shows Test mode.
   - **Sales**: orders and **Export CSV**.
   - **Check-in**: scan a member's card from the app (see below).

To start a real venue instead, use **Open your business profile** on the first screen; the Overview then shows a five-step getting-started list.

The Vercel project needs these environment variables (Settings → Environment Variables), for Production and Preview:

| Name                            | Value                                                |
| ------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://cmahltbjopkihcfkzzex.supabase.co`           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the project's `anon` key (Supabase → Settings → API) |

If they are missing, every page answers "Supabase is not configured".

### Coach, organizer and club sections

The demo venue shows every section so they can be explored from one place.

- **My clients** (CoachDash): three accepted clients, one request to accept, and a "Check in on today" list of
  clients who have not logged a workout for three days. Invite a client by username; they join once they accept.
- **Events** (Organizer): two upcoming events with sign-ups and one finished event with attendance. Publish a new
  event, open one, and mark people as arrived.
- **Schedule** (Clubdash): a day view of four courts. "Main Court" divides into "Pickleball A" and "B": booking
  either layout holds the other, with 15 minutes to change over. Try booking Pickleball A at 5:30 PM to see the refusal.
- **Settings → Team**: add front-desk staff, coaches or admins by username; remove them.
- **Members → Import from a spreadsheet**: paste or upload a CSV, match the columns, review and import.

New businesses choose their kind at sign-up (gym, fitness studio, sports club, coaching, event organizer) and see the
sections that apply.

Not built yet: entry fees and court payments, booking from the app, tournament brackets and live scoring, training
plans and form-check video for coaches, the cash till and shift float, staff clock-in, and recurring billing.

## Sodia app (mobile)

Point the app at the same project in `apps/mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://cmahltbjopkihcfkzzex.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<the same anon key>
```

Then, signed in as a different person from the venue owner:

1. **Venues** lists real venues, including the demo gym.
2. Open the demo gym: its **plans** are the ones set in the Business Suite. Change a price on web and reopen the sheet to see it.
3. Buy a plan. Maya's test page opens; pay with a test card from Maya's sandbox credentials page. The **wallet** shows the pass once Maya confirms.
4. In the Business Suite, the buyer appears in **Members** as Active and the order appears in **Sales**.
5. Open the pass QR in the wallet and type or scan its code into **Check-in** on web: entry is allowed, and the scan appears on the Overview.
6. **Settings → My venues** shows the member's standing, with **Mute broadcasts** and **Leave**. Mute, then send a broadcast from web: the count drops by one.
7. **Settings** shows the member's username; type it into **Members → Add a member** on web for a desk-added member, then **Grant pass**: the pass appears in their wallet as "Pass from Pulse Fitness (Demo)".

## Verified, and not

| Step                                                                     | Verified how                                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Web sign-in, demo venue, every page, every action                        | Real suite run against staging in a browser                          |
| Checkout creates a Maya payment page (custom plan and original day pass) | Real call to the deployed function                                   |
| Webhook accepts Maya's token and rejects others                          | Real call                                                            |
| Database rules                                                           | 296 automated assertions                                             |
| Paying on Maya's page and the pass arriving                              | **Not run**: the test environment could not open Maya's page         |
| Mobile screens against staging, on a phone                               | **Not run**: covered by automated tests with a stand-in backend only |
| Google sign-in on the deployed site                                      | **Not run**: needs a person                                          |
| The deployed site's environment variables                                | **Not checked**: previews are behind Vercel sign-in                  |

## Before real customers

Run `select public.admin_set_payments_mode('live');` in the SQL editor. Test payments and demo venues stop working at once. See `docs/BACKEND.md` for live payouts.
