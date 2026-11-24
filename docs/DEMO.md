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

### Four workspaces, one per kind of business

"Open a demo venue" now gives you four demo businesses. Switch between them with the selector at the top left.
Each has its own menu, words and home screen; a page that belongs to another workspace is not found.

| Demo business         | Workspace     | Home opens on                          | Sections                                              |
| --------------------- | ------------- | -------------------------------------- | ----------------------------------------------------- |
| Pulse Fitness         | GymDash       | The door and the till: command centre  | Members, Check-in, Inbox, Plans, Payouts, Sales       |
| Baseline Courts       | Clubdash      | The courts: what is on now and next    | Courts, Players, Events, Inbox, Plans, Payouts, Sales |
| Strong Start Coaching | CoachDash     | People: who went quiet, who is waiting | Clients, Inbox, Packages, Payouts, Sales              |
| Open Play Events      | Organizer Pro | The next event and how full it is      | Events, Participants, Inbox, Payouts, Sales           |

Things to show:

- **Clubdash → Courts**: "Main Court" divides into "Pickleball A" and "B". Booking either layout holds the other,
  with 15 minutes to change over. Try booking Pickleball A at 5:30 PM to see the refusal.
- **CoachDash → Today**: accept the waiting request; see the two clients flagged for a check-in.
- **Organizer Pro → Events**: open an event, mark people as arrived, show the event code.
- **One list of people.** Members, Players and Participants now show everyone the business knows: members,
  people who are not on the app yet (imported or added at the desk), and guests who signed up to an event or hold
  a booking. In Clubdash → Players, three walk-ins appear with their court bookings; in Organizer Pro →
  Participants, everyone who signed up; in GymDash → Members, the six imported records.
- **Add someone who is not on the app** on that page, then book a court for them under Courts ("Who is it for").
  If they later join with the same confirmed email, their record is matched to their account automatically.
- **Posts** (every workspace): write as the business, point the post at an event or a plan, post now or schedule
  it. Each demo business has followers, a live post and a scheduled one. Tick "Also send to members' inboxes" to
  deliver it in the app today; the profile and feed in the app arrive with the app's next update.
- **Classes** (GymDash): a week of classes with places taken. Open one with a waitlist, remove someone, and watch
  the first person waiting move up. Add a class and repeat it weekly.
- **Courts → Prices** (Clubdash): hourly and peak rates per court. A new booking is priced automatically; "Record
  payment" marks it paid; "Move" changes its time or court and reprices it.
- **Events** (Organizer Pro): an entry fee and categories; each entrant shows their category and whether they have
  paid; "Edit event" changes the details.
- **Clients → Session packs** (CoachDash): a client part-way through a 10-session pack. "Log session" counts one
  down; "Undo last" takes it back.
- **Sales → Taken at the desk** (every workspace): the money recorded in person, by kind, with "Reverse" for mistakes.
- **Payouts**: in the demo gym, test payments are connected. In the other three demo businesses the page shows
  "Under construction" with how split payments will work and a "Tell me when payments are ready" button.
- **Terms and policies** at `/legal`, linked from sign-in and Settings. They are drafts. Opening a business requires
  agreeing to the Business Terms; the accepted version is recorded.
- **Settings → Team → Make owner** hands the business to a teammate; the previous owner stays as admin.
- **Settings → Team** and **Open another business**; **Members → Import from a spreadsheet** (GymDash).

The demo's sample bookings and events were dated when the demo was created, so on a later day the court calendar
for "today" can be empty and an event may have passed. Use the day arrows, or add new ones.

Not built yet: collecting money online for anything but gym plans, booking from the app, tournament brackets and
live scoring, training plans and form-check video for coaches, shifts and cash float, staff clock-in, and recurring
billing.
Payments work for gyms only (Maya test mode); clubs, coaches and organizers are routed to Stripe, which is not set up.

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
