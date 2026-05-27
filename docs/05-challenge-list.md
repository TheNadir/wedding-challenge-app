# Step 05 — Challenge List

## Goal

Fetch all challenges and the current player's submissions from Supabase, then display them as a list. Challenges the player has not yet completed show `???` as the title. Completed challenges show the real title, description, and a thumbnail of the submitted photo.

## Prerequisites

- Auth flow working (Step 04)
- At least a few rows in the `challenges` table (run Step 10 to seed data, or insert a couple of rows manually in the Supabase Table Editor first for testing)

---

## Prompt for Claude

> I have a React + Vite app with Supabase auth working. The Supabase client is at `src/lib/supabase.js` and the `useAuth` hook at `src/hooks/useAuth.js` exposes `{ user }`. I need you to build the challenge list feature.
>
> **`src/hooks/useChallenges.js`** — a custom hook that:
> - Fetches all rows from the `challenges` table ordered by `sort_order` ascending
> - Fetches all rows from the `submissions` table where `user_id = user.id`
> - Returns `{ challenges, submissions, loading, error, refetch }`
> - Uses `Promise.all` to fetch both in parallel
> - Re-fetches when the `user` object changes
>
> **`src/pages/Challenges.jsx`** — the main challenge list page that:
> - Uses `useChallenges()` and `useAuth()` hooks
> - While loading, shows a skeleton list of 6 placeholder cards
> - On error, shows a friendly error message with a retry button
> - Renders a `ChallengeCard` component for each challenge, passing:
>   - The challenge object
>   - A boolean `isCompleted` (true if a matching submission exists for this challenge)
>   - The submission object (or null) so the card can show the photo thumbnail
> - Shows a progress indicator at the top: "X of Y challenges completed"
> - Includes the `NavBar` component at the top
>
> **`src/components/ChallengeCard.jsx`** — a card component that:
> - When `isCompleted` is FALSE:
>   - Shows `???` as the title in a large, slightly mysterious style
>   - Shows a camera icon and the text "Tap to complete this challenge"
>   - The entire card is tappable and navigates to `/upload/:challengeId`
>   - Uses a neutral/muted visual style
> - When `isCompleted` is TRUE:
>   - Shows the real challenge title
>   - Shows the challenge description
>   - Shows a thumbnail of the submitted photo (from `submission.photo_url`)
>   - Shows a green checkmark badge
>   - The card is NOT tappable (challenge is done)
>   - Uses a visually distinct "completed" style (e.g. slight green tint or checkmark overlay)
> - Both states show the challenge number (based on `sort_order`) in a small badge
>
> Style with CSS modules, mobile-first. Cards should be large and easy to tap on a phone screen. The ??? title should feel intriguing, not broken — consider a slightly larger font or a subtle animation.

---

## Testing this step

1. Insert 3–4 test challenges in Supabase Table Editor (or run Step 10)
2. Load `/challenges` — all cards should show `???`
3. Manually insert a row into `submissions` in the Table Editor with your user ID and one challenge ID, with any placeholder `photo_url`
4. Reload — that one challenge should now show its real title and your photo URL thumbnail
5. Confirm the progress counter updates correctly

---

## Data shapes to be aware of

```js
// Challenge row
{
  id: 'uuid',
  title: 'Strike a pose with the bride',
  description: 'Get a photo with the bride doing your best pose',
  sort_order: 1
}

// Submission row
{
  id: 'uuid',
  user_id: 'uuid',
  challenge_id: 'uuid',
  photo_url: 'https://xxxx.supabase.co/storage/v1/object/public/photos/...',
  created_at: '2024-...'
}
```

---

## Next Step

→ `06-photo-upload.md` — Build the camera/file picker, upload to Supabase Storage, and write the submission row.
