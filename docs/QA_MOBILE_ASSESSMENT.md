# Mobile QA Assessment — Sodia (apps/mobile)

**Date:** 2026-11-17 · **Build assessed:** branch `claude/tender-allen-wallk8` · **Scope:** the consumer mobile app only.

## How this was tested

- Every source file under `apps/mobile/src` (about 16,700 lines) was read line by line, split into four areas: social, tracking, venues and checkout, wallet/profile/role portals.
- The app was built for web and driven in a phone-sized browser as a guest: every tab, the drawer, profile, settings, inbox and activity screens.
- The highest-severity findings were re-checked against the source after the first pass.

**Not tested:** a real iOS or Android device. Camera, GPS, the map (it only renders natively), haptics, keyboard behaviour and Android back-button findings come from reading the code. Items marked _(suspected)_ need a device run to confirm.

## Verdict

**Not ready for a public release. Good enough for a guided demo if the presenter stays on the happy path.**

The visual design is strong and consistent, and the backend behind it is real. The gap is in between: most screens are a polished front over hard-coded content. A first-time user who taps freely hits a dead control, a fake confirmation or a contradiction within the first minute.

| Area                   | Demo-ready | Release-ready | Biggest gap                                                              |
| ---------------------- | ---------- | ------------- | ------------------------------------------------------------------------ |
| Sign-in and onboarding | Yes        | Close         | Date of birth is free text; Terms and Privacy are not links              |
| Feed and stories       | Mostly     | No            | Comments, stories, likes and share are not tied to real posts            |
| Messaging              | Mostly     | No            | Your own messages render as the other person's                           |
| Venues and booking     | Mostly     | No            | Court booking has no date, allows double-booking, loses the time slot    |
| Checkout               | Guest only | No            | Signed-in checkout charges a day pass for whatever was selected          |
| Wallet                 | Partly     | No            | No working QR as a guest; signed-in purchases never appear               |
| Tracking               | Partly     | No            | GPS distance is wrong; nothing is saved; a workout is lost on tab switch |
| Profile                | Yes        | No            | A signed-in user sees the demo persona's stats, photos and badges        |
| Role portals           | Demo only  | No            | Open to every user; content is simulated                                 |

## App-wide findings

These apply to every screen and are the main distance between this app and a big-name app.

| #   | Finding                                                                                                                                                                                                   | Evidence                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| S1  | **Nothing persists.** Posts, likes, workouts, meals, passes, theme and settings live in memory and are gone on restart. No store is saved to disk and no screen reads its data from the backend.          | `store/*.ts` have no persistence; no data-fetching library |
| S2  | **Required libraries are not installed.** No bottom sheets, no gesture or animation library, no data-fetching/offline cache, no haptics, no network detection, no biometrics, no push notifications.      | `apps/mobile/package.json`                                 |
| S3  | **Every list is unvirtualised.** The list library is installed but never used; 34 files render arrays inside a plain scroll view, including the feed with one web view per reel.                          | 0 uses of FlashList                                        |
| S4  | **The 10 required screen states are mostly absent.** The shared state component is used by one screen. There are no loading skeletons, offline banners or retry states. The offline flag is never read.   | `TenStateView` used only by `SodiaFeed.tsx`                |
| S5  | **Accessibility.** 18 of 267 tappable controls have a screen-reader label. Many icon buttons are 20–38pt, under the 44pt minimum.                                                                         | Counts from source                                         |
| S6  | **No haptic feedback anywhere**, and no animated transitions on like, card flip, scan success or checkout.                                                                                                | No haptics import in `src`                                 |
| S7  | **Single-route app.** Everything is one screen with modals. Android back from any tab exits the app, back inside a chat closes the whole inbox, and no screen can be deep-linked. _(suspected on device)_ | `app/index.tsx`, `App.tsx:140`                             |
| S8  | **Theme.** Defaults to light regardless of the phone's setting, is not remembered, and the splash and sign-in are always dark. Many colours are hard-coded and ignore the theme.                          | `theme/theme.ts:71`                                        |
| S9  | **QA tools ship in the product.** The drawer has "QA & Demo Controls"; staff and coach portals have "Simulate" buttons.                                                                                   | `MenuDrawerModal.tsx:170-205`                              |
| S10 | **Internal jargon in user copy.** "Registry A", "GymDash CRM", "TOTP Turnstile", "SOA ledger", "Universal Checkout", "Mobilizing GPS Radar".                                                              | Throughout                                                 |
| S11 | **The profile cannot be edited.** It lives in the hamburger menu by design, which is fine. Once there, there is no edit profile, avatar change or privacy control.                                        | `ProfileHub.tsx`                                           |
| S12 | **Settings switches do nothing.** Apple Health, Garmin/Whoop and "Biometric Pass Authorization" are local toggles that reset when the screen closes.                                                      | `SettingsModal.tsx:40-42`                                  |
| S13 | **Floating tab bar covers content.** The bottom row of each screen (for example a post's like and comment icons) sits under the dock until scrolled.                                                      | Seen in the running app                                    |
| S14 | **Notification dot is always on** and never clears.                                                                                                                                                       | `HeaderBar.tsx:57`                                         |

## Blockers

Each of these either moves money wrongly, shows the user something false, or loses their data.

### Money and access

| #   | Finding                                                                                                                                                                                                                               | Where                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| B1  | **Signed-in checkout sells the wrong product.** Only "day pass" or "monthly" is sent to the server. A court slot, a 10-session pack, a coach session, a tournament entry and a free RSVP all become a day pass at the server's price. | `hooks/useCheckout.ts:29-33`                            |
| B2  | **A signed-in purchase never appears in the wallet.** Nothing reads passes from the backend, so after paying the user lands on "No Active Passes".                                                                                    | `store/ecosystemStore.ts`, `App.tsx:61-68`              |
| B3  | **Free club RSVP is billed to Metro Core Arena.** Clubs pass no venue, and the fallback is a hard-coded gym.                                                                                                                          | `DiscoverView.tsx:273`                                  |
| B4  | **Court booking is not a reservation.** No date picker, past slots are bookable, the slot is marked "Confirmed" before payment and forgotten on reopen (unlimited double-booking), and the time is dropped from the pass.             | `PickleballBookingGrid.tsx:60-66`, `App.tsx:62`         |
| B5  | **A court reservation can be bought with no court or time selected.**                                                                                                                                                                 | `FacilityDetailSheet.tsx:82, 244-253`                   |
| B6  | **Receipts and statements are invented.** Every receipt reads ₱250 + ₱15 = ₱265 whatever was bought, including memberships that should carry 5%. The statement total is the number of passes × 265.                                   | `ReceiptModal.tsx:76-84`, `StatementOfAccountModal.tsx` |
| B7  | **A revoked or expired pass can keep showing a live QR** for the rest of the session, because the old secret is never cleared. The server still rejects it at the gate.                                                               | `hooks/usePassTotp.ts:19-40`                            |
| B8  | **The wallet's QR never works for a guest**, and there is no sign-in button on that screen. "Pay" with no passes spins forever.                                                                                                       | `TurnstileQRModal.tsx`, `usePassTotp.ts:20`             |
| B9  | **Role portals are open to everyone**, guests included. The server does reject non-staff scans, but the screens and their simulated "Gate Unlocked" results are reachable.                                                            | `SettingsModal.tsx:193-222`                             |

### Tracking

| #   | Finding                                                                                                                                                                                             | Where                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| B10 | **GPS distance is wrong by construction.** Distance is rounded to 0.1 km before being compared with a 2.5 m threshold, so it stays at 0.00 and then jumps in 100 m steps. Pace and calories follow. | `locationService.ts:67`, `MoveTrackerView.tsx:73-80` |
| B11 | **An in-progress workout or run is destroyed by switching tab** or segment, with no warning.                                                                                                        | `TrackHub.tsx:120-123`                               |
| B12 | **A lift session tracks one exercise only.** A three-exercise program day opens with the first and drops the rest. There is no "add exercise".                                                      | `LiftTracker.tsx:102-112`                            |
| B13 | **A quick session starts with fake completed sets and saves a fake PR.** Start then Finish records 1,240 kg of volume never lifted. The PR check is a hard-coded 225 kg.                            | `LiftTracker.tsx:19-23, 66-67`                       |
| B14 | **A workout cannot be cancelled or discarded.** Finish only offers two ways to save.                                                                                                                | `LiftTracker.tsx:236-259`                            |
| B15 | **Location denied is hidden.** The app silently uses Bonifacio Global City and shows "GPS Live". Venue distances are computed from there too.                                                       | `locationService.ts:21-23, 49-52`                    |

### Social

| #   | Finding                                                                                                                                                              | Where                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| B16 | **Messages you send appear on the other person's side.**                                                                                                             | `DMChatView.tsx:150`, `crmMessagingStore.ts:150` |
| B17 | **Every chat starts with the same fake history**: "Hey Darelle! Great training session this morning" and a 225 kg PR card — including a real signed-in user's chats. | `DMChatView.tsx:102-118`                         |
| B18 | **Every venue conversation shows an "Official B2B Staff Invitation" card.**                                                                                          | `messagingService.ts:112`                        |
| B19 | **Comments are not tied to a post.** Every post shows the same two comments; the card says "18 comments", the sheet says 2.                                          | `App.tsx:101`, `CommentsBottomSheet.tsx:30-51`   |
| B20 | **Tapping a story never opens that story.** All bubbles open the same sequence, and after one play-through it reopens on the last story and closes.                  | `SodiaFeed.tsx:92`, `StoryViewerModal.tsx:68-86` |
| B21 | **The post composer opens pre-filled** with a stranger's stock photo, a venue tag and a "verified 225 kg deadlift". Tapping Post publishes all of it.                | `CreatePostModal.tsx:41-45`                      |
| B22 | **Stock photos are published as the user's own** whenever the camera or picker fails or permission is missing.                                                       | `InstagramStoryCameraModal.tsx:63-77`            |
| B23 | **Video posts show as a blank tile.**                                                                                                                                | `CreatePostModal.tsx:94-114`                     |
| B24 | **A signed-in user's profile shows the demo persona's** verified tick, trainer badge, follower counts, photos and trophies.                                          | `ProfileHub.tsx:47-62, 129-142`                  |

## Dead ends and dead controls

Controls that do nothing, or that announce a success that did not happen.

| Screen       | Control                                                        | What happens                                                    |
| ------------ | -------------------------------------------------------------- | --------------------------------------------------------------- |
| Feed         | Post "…" menu                                                  | Says "link copied"; nothing is copied. No report, block, delete |
| Feed         | Share                                                          | Says "Shared to direct message"; nothing is sent                |
| Feed         | Join Challenge                                                 | Alert only; can be repeated                                     |
| Feed         | Like                                                           | Single tap on the photo toggles it; lost on tab switch          |
| Feed         | Save                                                           | No saved-posts screen exists                                    |
| Stories      | Reply and emoji reactions                                      | Claim delivery; nothing reaches the inbox                       |
| Story camera | Audio, Boomerang, Layout, Hands-Free, Effects, Post/Story/Reel | Alert or nothing                                                |
| Story camera | Close Friends                                                  | Publishes exactly as public                                     |
| Story camera | "Enable Camera" after a permanent denial                       | Nothing; no link to Settings                                    |
| Inbox        | Compose                                                        | Opens the first thread                                          |
| Inbox        | "Requests (2)" tab, notes tray, per-row camera                 | Nothing                                                         |
| Profile      | Message a person                                               | The thread never appears in the inbox afterwards                |
| Activity     | "Follow Requests" tab, rows                                    | Same list; rows not tappable                                    |
| Venues       | "Open Now Only", price range, "Swimming"                       | Do not filter correctly (see below)                             |
| Venues       | Coach "Book Session"                                           | Goes to payment with no date or time                            |
| Venues       | Directions, call, share, save, reviews, photos, hours          | Not present at all                                              |
| Wallet       | Bell                                                           | No action                                                       |
| Wallet       | Copy ID                                                        | Label flips; nothing copied; the ID is a fixed number           |
| Wallet       | Send (gift a pass)                                             | Says "Pass Gifted!"; nothing transfers; works with zero passes  |
| Wallet       | Statement filter pills                                         | Do not filter                                                   |
| Wallet       | Second pass                                                    | Only the first pass can ever be shown                           |
| Track        | Journey "Active / Recovery" pills                              | Styling only                                                    |
| Track        | Lift history rows                                              | Not tappable; no detail, edit or delete                         |
| Track        | Memory detail                                                  | Same heart rate, location and weather for every item            |
| Profile      | Follower and workout counts, locker rows                       | Not tappable                                                    |
| Profile      | "Message" on your own profile                                  | Opens your inbox                                                |
| Staff portal | Real scan                                                      | Result never reaches the log; only "simulate" buttons do        |
| Coach portal | Add a client                                                   | No such control; the 3-client limit is shown nowhere            |
| Organizer    | Create or edit an event, edit the score                        | Not possible                                                    |
| Settings     | Health, wearable and biometric switches                        | No effect                                                       |

## Functional bugs worth fixing early

**Venues**

- The map reloads on every keystroke, filter change and pin tap, and resets zoom. It is blank offline. `DiscoverMapCanvas.tsx:38-46`
- Price filter boundaries overlap (₱300 matches two ranges); clubs and coaches ignore most ranges. `discoverFilterHelper.ts:35-66`
- No sorting; the nearest venue is not first.
- The list labels a day-pass price as "Court/Hr" (Velocity shows ₱350 where the court is ₱1,800). `DiscoverListSection.tsx:57`
- Venue detail ignores the venue's own data: every gym lists barbells and a ₱2,200 pack, every court venue (pool, climbing gym, football turf) shows a pickleball grid. `FacilityDetailSheet.tsx:41-86, 177-179`
- The sheet shows ₱250; checkout then shows ₱265. The fee appears only at the last step. The fee maths itself is correct.
- Distance in the detail sheet contradicts the list (0.8 km against 0.1 km for the same venue).
- "Reset All Filters" does not clear the search text.
- A guest double-tap on Pay creates two passes. "Confirm & Pay with Biometrics" performs no biometric check.

**Wallet**

- A day pass is valid for 30 days. `ecosystemStore.ts:166`
- Every pass is labelled "Metro Core Arena" whatever venue it was bought at.
- Status is never evaluated; a pass past its date still reads ACTIVE.
- "Screenshots are disabled" is stated but not implemented; there is no screen-brightness boost on the QR.
- The scanner has no manual-entry fallback when the camera is denied.

**Tracking**

- No background or lock-screen tracking; timers count ticks and freeze when the phone is pocketed.
- Calories switch formula mid-session (30 minutes of yoga shows 45 kcal, then 3 kcal).
- The route map reloads on every GPS point.
- Food logging: unknown foods are logged as 220 kcal; "egg whites" logs whole eggs, "almond milk" logs almonds; "200g rice" is read as two cups.
- Weights can only be changed in 5 kg steps; no typing, no 2.5 kg, no pounds.
- Hub totals labelled "today" sum all history; the weekly chart, streak and PR rings are fixed numbers.

**Social**

- Every post reads "2h ago" and "Liked by coach.miguel and N others", including one posted seconds ago.
- Unread counts are not cleared when a chat is opened from a banner, and still increase while the chat is open.
- A failed send removes the bubble silently.
- The status background colour chosen in the composer is never saved.

## Demo account and demo content

### Corrected in this pass

| Issue                                                                               | Change                                                         |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| "₱null/hr Court" on Summit Boulder's card                                           | Falls back to the day-pass price; thousands separator added    |
| Two of the first four feed posts tagged a venue that does not exist (dead button)   | Re-tagged to Nexus Racket & Court Club at its real ₱200 rate   |
| A story used the name and handle of a real professional tennis player               | Replaced with a fictional persona (Bea Santiago)               |
| "Twins Fitness" appeared in the inbox and organizer portal but is not a venue       | Replaced with seeded venues                                    |
| The feed's "Coach Sofia Chen" opened a profile for "Sofia Valdes" at another studio | Roster aligned to the feed and to Aura Reformer & Movement Lab |
| Demo passes were dated October, so they loaded already expired                      | Dates are now relative to launch                               |
| Age 26 against a 1998 date of birth                                                 | 28                                                             |
| "Hello, Darelle," trailing comma                                                    | Removed                                                        |

Format, lint, type checks and both test suites pass after these changes.

### Still to decide or fix

- **One persona for everything.** The demo profile holds all four roles, and its account is dated 31 October alongside a 14-week streak, 540 workouts and 3,820 followers. Recommend a separate demo athlete, demo coach and demo staff account, with an account date that fits the history.
- **Numbers that disagree across screens.** Workouts: 2 (Track strip), 1 (history), 540 (profile). PR stamps: 24, 12 and 2. Streak: 5 days against 14 weeks. Daily target 2,650 kcal against a TDEE of 2,720 on the profile and 3,118 from the app's own calculator; macro targets add up to 2,488.
- **Deadlift story.** The demo user's best is 225 kg, the challenge's "mark to beat" is 225 kg, and Coach Miguel's profile says 275 kg.
- **The feed opens with four posts in a row by the logged-in user.** Interleave other authors.
- **Unknown authors** (Coach Rafael, Metro Core Arena's own account) open a profile filled with the demo user's photos.
- **Inbox previews do not match the chats.** Only the Metro Core thread has messages.
- **Venue data.** Three commercial venues are filed as community clubs, two of them over the 19-free-member cap. A tournament is modelled as a club. Every rating sits between 4.8 and 4.98. All imagery is hot-linked stock photography, with the same photo reused for different people and venues.
- **Third-party names.** IFBB, NASM, Hyrox, DUPR ("scores synced to DUPR"), CSCS, GCash, Strava, Eleiko, Yonex, Lagree and FIFA appear as credentials, features or endorsements. Genericise these or clear them with counsel before any public build.
- **Demo persona is a real person.** The guest demo is the founder's own name and photos. Fine for an internal demo; decide deliberately before external testers see it.

## Recommended order of work

1. **Truthfulness pass (days).** Remove fake confirmations and pre-filled content: composer defaults, stock-photo fallbacks, fake chat history, staff-invite card, fake sets, invented receipts. Hide controls that do nothing rather than faking them.
2. **Money path (about a week).** Sell only what the server can price; fetch passes from the backend; real receipt amounts; court booking with date, availability and a hold that is confirmed on payment.
3. **Data foundation (1–2 weeks).** Add the data-fetching layer and on-device persistence, then move feed, comments, likes, messages, passes and tracking history onto it. This also delivers loading, error and offline states.
4. **Tracking correctness (about a week).** Fix distance, session survival across navigation, multi-exercise sessions, discard, typed weights.
5. **Platform polish (ongoing).** Real navigation and back handling, bottom sheets, virtualised lists, haptics, accessibility labels and 44pt targets, theme following the phone, an edit-profile screen.
6. **Demo content.** Separate demo accounts per role; one consistent set of numbers; local images.

## What already works well

- Sign-in with email code, Google and Apple; first-run profile setup with live username check and age gate.
- Guest flow from venue to pass: browse, open a venue, pick a day pass or monthly, see the correct ₱15 or 5% fee, receive a pass.
- Venue search and category filters update the list, map pins and carousel together.
- QR scanner: permission prompt, Settings fallback, unknown-code error, staff-only rejection, identity preview.
- Signed-in "My QR": show, share, rotate, retry.
- The wallet does not fake a credential for a guest.
- No secrets in the client; no forbidden storage; AI food parsing goes through the backend.
- Visual design: consistent type, spacing, colour and iconography in both themes.
