# Step 07 — Leaderboard

## Goal

Build a leaderboard screen showing all players and how many challenges each has completed. This gives the event a competitive, social energy — guests can see who's ahead during the day.

## Prerequisites

- Photo upload working (Step 06)
- Multiple test submissions in the database (or at least a couple of users with different submission counts)

---

## Prompt for Claude

> I have a React + Vite + Supabase app with auth, challenge list, and photo upload all working. Now I need a leaderboard screen at `/leaderboard`.
>
> **Supabase query approach:**
> Rather than fetching all submissions and grouping in JavaScript, use a Supabase RPC (Postgres function) for efficiency. Please generate the SQL for this function and the React code to call it.
>
> **SQL — create this function in Supabase SQL Editor:**
> ```sql
> create or replace function get_leaderboard()
> returns table (
>   user_id uuid,
>   display_name text,
>   avatar_url text,
>   completed_count bigint
> )
> language sql
> security definer
> as $$
>   select
>     p.id as user_id,
>     p.display_name,
>     p.avatar_url,
>     count(s.id) as completed_count
>   from profiles p
>   left join submissions s on s.user_id = p.id
>   group by p.id, p.display_name, p.avatar_url
>   order by completed_count desc, p.display_name asc;
> $$;
> ```
>
> **`src/hooks/useLeaderboard.js`** — a custom hook that:
> - Calls `supabase.rpc('get_leaderboard')` on mount
> - Returns `{ players, totalChallenges, loading, error, refetch }`
> - Also fetches the total challenge count from the `challenges` table so the UI can show "X / Y" per player
> - Polls for updates every 30 seconds so the leaderboard stays live during the event (use `setInterval` with cleanup in `useEffect`)
>
> **`src/pages/Leaderboard.jsx`** — the leaderboard page that:
> - Shows the `NavBar` at the top
> - Shows a heading "Leaderboard"
> - Shows a last-updated timestamp that refreshes with each poll
> - Renders a ranked list of players:
>   - Rank number (1, 2, 3 with trophy/medal styling for top 3)
>   - Player avatar (small circle, falls back to initials if no avatar)
>   - Player display name
>   - Completion count: "X / Y challenges" with a small progress bar
> - Highlights the current user's row in a subtle way (e.g. slightly different background)
> - Shows a "Refresh" button to manually trigger a refetch
> - Handles the empty state gracefully ("No one has completed a challenge yet — be the first!")
>
> **Add a leaderboard link to `NavBar.jsx`** so players can reach it from the challenge list.
>
> Style with CSS modules, mobile-first. Top 3 ranks should feel celebratory — use gold/silver/bronze colours for rank badges. Keep the list items tall enough to tap comfortably even though tapping them does nothing.

---

## Testing this step

1. Sign in with your test account and complete 1–2 challenges
2. Open a second browser profile or incognito window, sign in as a different Google account, complete a different number of challenges
3. Navigate to `/leaderboard`
4. Confirm both players appear with the correct counts
5. Confirm the ranking is correct (most completions first)
6. Complete another challenge in one window and wait 30 seconds — the leaderboard in the other window should update automatically
7. Confirm your own row is visually highlighted

---

## Optional enhancement (save for later)

If you want guests to be able to see each other's submitted photos, you can add a modal on each leaderboard row that shows a grid of the player's completed challenge photos. This requires fetching `submissions` filtered by `user_id`. Hold this for after the core app is working.

---

## Next Step

→ `08-pwa-polish.md` — Finalize the PWA manifest, add app icons, test installability on iOS and Android.
