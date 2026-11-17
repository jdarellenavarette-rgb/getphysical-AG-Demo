# Pioneer Test Plan

Five real accounts, one per kind of user, walked through everything the product promises. The point is to find out what is true end to end, so every step states what should happen and what is expected today.

Set the accounts up first: see `SIGN_IN_AND_PIONEER_ACCOUNTS.md`.

| Account     | Signs in with        | Role comes from                            |
| ----------- | -------------------- | ------------------------------------------ |
| Member      | Email code or Google | Nothing; every new account is a member     |
| Venue owner | Email code or Google | Creating a venue in the web Business Suite |
| Staff       | Email code or Google | `admin_assign_staff(…, venue, 'STAFF')`    |
| Coach       | Email code or Google | `admin_grant_role(…, 'coach')`             |
| Organizer   | Email code or Google | `admin_grant_role(…, 'organizer')`         |

**Status key.** _Works_: built and verified. _Server only_: the database and server do it, the app screen does not show it yet. _Not yet_: not built.

Record the result of each step when you run it. A step that fails where "Works" is expected is a bug; tell me the step number.

## 1. Getting in (every account)

| #   | Step                                                           | Should happen                                                        | Expected today                                                   |
| --- | -------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1.1 | Open the app and tap "Continue as guest"                       | An empty app: no posts, passes, workouts or sample people            | Works                                                            |
| 1.2 | As a guest, tap +, a like, Messages, and "Proceed to Checkout" | Each asks you to sign in                                             | Works                                                            |
| 1.3 | Sign in with an email address                                  | A code arrives by email; entering it signs you in                    | Works (email sending is set up; not yet tried with a real inbox) |
| 1.4 | Sign in with Google                                            | Google's sheet opens and returns you signed in                       | Not yet: Google is not switched on in Supabase                   |
| 1.5 | First sign-in                                                  | Asked once for name, username and date of birth; under 13 is refused | Works                                                            |
| 1.6 | Sign out, then sign in as a different account                  | Nothing from the first account is visible                            | Works                                                            |
| 1.7 | Settings as the member                                         | No workspaces listed                                                 | Works                                                            |
| 1.8 | Settings as staff, coach and organizer                         | Only that account's own workspace is listed                          | Works                                                            |

## 2. Venue owner

| #   | Step                                                 | Should happen                            | Expected today                                             |
| --- | ---------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| 2.1 | Sign in to the web Business Suite and create a venue | The venue is saved and you are its owner | Works                                                      |
| 2.2 | Open the mobile app as the member and go to Venues   | The new venue is listed                  | Not yet: the Venues tab still shows built-in sample venues |
| 2.3 | Send a broadcast to members from the Business Suite  | It arrives in the member's Messages      | Works for members of that venue                            |
| 2.4 | Reply to a member from the Business Suite inbox      | The reply appears in the member's chat   | Works                                                      |

## 3. Member buys a pass and gets in

| #   | Step                                            | Should happen                                             | Expected today                                                 |
| --- | ----------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| 3.1 | Open a venue, choose a day pass, go to checkout | Subtotal, a ₱15 fee and the total are shown               | Works                                                          |
| 3.2 | Continue to payment                             | The payment provider's page opens with the server's price | Works once payment keys and the venue's payout account are set |
| 3.3 | Pay with a test card                            | The server records the payment and issues the pass        | Server only                                                    |
| 3.4 | Return to the app and open Wallet               | The pass is there with its venue and expiry               | Not yet: the wallet does not load passes from the server       |
| 3.5 | Tap "Show Entry QR"                             | A QR code that changes every 60 seconds                   | Works once 3.4 does                                            |
| 3.6 | Under-18 member tries to buy                    | Refused with a clear message                              | Works (enforced by the server)                                 |

## 4. Staff checks the member in

| #   | Step                                                     | Should happen                            | Expected today                                          |
| --- | -------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| 4.1 | Settings → Staff Check-in Scanner → scan the member's QR | "Access granted" with the member's name  | Works once 3.5 does                                     |
| 4.2 | Scan the same code a minute later (a screenshot)         | Refused: the code has expired            | Works (enforced by the server)                          |
| 4.3 | The member account opens the scanner and scans a pass    | Refused: staff only                      | Works                                                   |
| 4.4 | Look at the scan list on the staff screen                | The check-in from 4.1 is listed          | Not yet: real scans are not added to the on-screen list |
| 4.5 | Camera permission denied                                 | A message with a button to open Settings | Works                                                   |

## 5. Coach

| #   | Step                                   | Should happen                                   | Expected today                               |
| --- | -------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| 5.1 | Profile → My QR → Coach                | A coach QR code that can be shared and replaced | Works                                        |
| 5.2 | The member scans the coach's QR        | The member becomes the coach's client           | Server only                                  |
| 5.3 | A fourth client scans on the free plan | Refused: the free plan allows three clients     | Works (enforced by the server)               |
| 5.4 | Open the Coach Workspace               | The coach's real clients are listed             | Not yet: the workspace does not load clients |

## 6. Organizer

| #   | Step                                      | Should happen                              | Expected today                                      |
| --- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| 6.1 | Profile → My QR → Organizer               | An organizer QR code                       | Works                                               |
| 6.2 | Create an event                           | The event is saved and has its own QR code | Not yet: there is no create-event screen in the app |
| 6.3 | The member scans the event QR             | The member is registered                   | Server only                                         |
| 6.4 | A 20th member joins a free community club | Refused: free clubs hold 19 members        | Works (enforced by the server)                      |

## 7. Social, between two pioneer accounts

| #   | Step                                             | Should happen                                   | Expected today                                                     |
| --- | ------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------ |
| 7.1 | The coach posts a photo                          | It appears in the coach's feed straight away    | Works on that phone                                                |
| 7.2 | The member opens their feed                      | The coach's post is there                       | Not yet: posts are not sent to the server                          |
| 7.3 | The member likes and comments                    | The coach sees the like and the comment         | Not yet: likes and comments stay on the phone                      |
| 7.4 | The member follows the coach                     | The coach's follower count goes up              | Not yet: follows stay on the phone                                 |
| 7.5 | The member messages the venue                    | The message appears in the Business Suite inbox | Works for an existing conversation with the venue                  |
| 7.6 | The member messages the coach from their profile | The coach receives it                           | Not yet: starting a new person-to-person conversation is not built |
| 7.7 | Close and reopen the app                         | Posts, likes and comments are still there       | Not yet: nothing on the feed is saved                              |

## 8. Tracking (any account)

| #   | Step                                             | Should happen                                  | Expected today                              |
| --- | ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------- |
| 8.1 | Start a workout, type 102.5 kg × 8, tick the set | The set is marked done and a rest timer starts | Works                                       |
| 8.2 | Switch to Wallet and back                        | The workout is still running                   | Works                                       |
| 8.3 | Finish with no set ticked                        | Cannot be saved; can be discarded              | Works                                       |
| 8.4 | Finish and save                                  | It appears in History and in the 7-day chart   | Works                                       |
| 8.5 | Beat a previous best on the same exercise        | Marked as a personal best                      | Works                                       |
| 8.6 | Record a 1 km walk outdoors                      | Distance is close to 1.00 km                   | Not yet: distance jumps in 100 m steps      |
| 8.7 | Lock the phone during a run                      | Recording continues                            | Not yet: recording pauses in the background |
| 8.8 | Log "2 eggs and rice" while signed in            | Calories and macros estimated                  | Works once the AI key is set on the server  |
| 8.9 | Close and reopen the app                         | Workouts and meals are still there             | Not yet: tracking is not saved              |

## 9. Getting out of every screen

| #   | Step                                                    | Should happen              | Expected today                         |
| --- | ------------------------------------------------------- | -------------------------- | -------------------------------------- |
| 9.1 | Open any bottom sheet; drag its grab bar down           | It closes                  | Works (needs checking on a real phone) |
| 9.2 | Open any bottom sheet; tap outside it                   | It closes                  | Works                                  |
| 9.3 | Open any full screen; swipe right from the left edge    | It goes back               | Works (needs checking on a real phone) |
| 9.4 | Open a story or a profile photo; swipe down             | It closes                  | Works (needs checking on a real phone) |
| 9.5 | Android: press Back on any screen or sheet              | It closes that screen only | Works                                  |
| 9.6 | Deny the camera permanently, then open the story camera | "Open Settings" is offered | Works                                  |

## Reading the result

The steps marked "Not yet" are the product's remaining distance to being true end to end. In order of how much they block the others:

1. Venues, passes, posts, likes, comments, follows and tracking are not loaded from or saved to the server (2.2, 3.4, 7.2–7.4, 7.7, 8.9).
2. Starting a conversation with another person (7.6).
3. Coach, staff and organizer workspaces showing real data (4.4, 5.4, 6.2).
4. GPS accuracy and background recording (8.6, 8.7).
