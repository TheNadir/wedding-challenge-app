# Step 10 — Seed the Challenges

## Goal

Populate the `challenges` table with the actual photo challenges guests will complete during the event. This step is done in the Supabase dashboard and should be completed before the wedding day.

## Prerequisites

- Supabase project set up (Step 01)
- App deployed and working (Step 09)

---

## 1. Clear any test data

If you inserted test rows during development, clear them first:

```sql
truncate table submissions cascade;
truncate table challenges cascade;
```

> **Warning:** `truncate submissions cascade` deletes all submissions too. Only run this before the event, never during.

---

## 2. Insert your challenges

Go to **Supabase → SQL Editor** and run the following. Customise the titles and descriptions for your event:

```sql
insert into challenges (title, description, sort_order) values
  ('Strike a pose with the couple', 'Get a photo with both the bride and groom doing your most dramatic pose.', 1),
  ('Table selfie', 'Get everyone at your table into one photo.', 2),
  ('Find someone in a hat', 'Track down a guest wearing a hat and get a photo together.', 3),
  ('Dance floor action', 'Capture someone showing off their best dance moves.', 4),
  ('The grand entrance', 'Get a photo the moment the couple enters the reception.', 5),
  ('Flower power', 'Find a floral arrangement and photograph it artistically.', 6),
  ('Secret handshake', 'Invent a secret handshake with a guest you just met and photograph the moment.', 7),
  ('Kids'' corner', 'Find the youngest guest at the event and get a photo with them (with parents'' permission).', 8),
  ('Cheers!', 'Capture a toast moment — glasses raised.', 9),
  ('Photobomb a couple', 'Sneakily appear in the background of another couple''s photo. Get evidence.', 10);
```

Feel free to add, remove, or edit any of these. The `sort_order` column controls the display order in the app.

---

## 3. Verify in the app

1. Open the deployed app and sign in
2. Navigate to the challenge list
3. Confirm all challenges appear as `???` cards
4. Confirm the count at the top says "0 of 10 challenges completed" (or however many you added)

---

## 4. Example challenge ideas by category

Use these as inspiration when writing your own list:

**With people**
- Get a photo with someone from every table
- Find a guest who has known the couple for over 10 years
- Get a three-generation family photo (grandparent, parent, child)
- Find someone who travelled more than 100 miles to be here

**At the venue**
- Find the oldest thing in the venue
- Photograph the best view from outside
- Get a photo at the bar holding a drink you've never tried before
- Capture the cake before it's cut

**Silly / fun**
- Do your best impression of the couple — get photographic evidence
- Create a human pyramid (minimum 3 people)
- Find someone with the same colour outfit as you
- Get a photo where everyone is jumping at the same time

**Sentimental**
- Get the couple to write a message to their future selves and photograph it
- Capture a genuine laugh
- Find two guests who don't know each other yet and introduce them — photo of the introduction

---

## 5. On the day — last-minute changes

If you need to add, edit, or remove a challenge during the event, you can do so directly in the **Supabase Table Editor** without redeploying the app. Changes appear immediately for all guests on the next page load.

To temporarily hide a challenge without deleting it, you can add an `is_active boolean default true` column and filter on it — but this is an optional enhancement.

---

## You're ready!

With this step complete, the app is fully set up. Share the QR code or URL with guests and let the challenges begin.

### Quick checklist before the event

- [ ] All challenges seeded and verified in the app
- [ ] App tested end-to-end on an iPhone (Safari) and an Android phone (Chrome)
- [ ] Install-to-home-screen tested on both platforms
- [ ] QR code printed on programs or table cards
- [ ] At least one person has admin access to Supabase in case of issues on the day
- [ ] Test submissions cleared (`truncate table submissions cascade;`) so the leaderboard starts at zero
