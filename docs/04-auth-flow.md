# Step 04 — Auth Flow

## Goal

Implement Google sign-in using Supabase Auth. Players tap one button, are redirected through Google's OAuth flow, and land back in the app as authenticated users. Their display name and avatar are stored automatically via the trigger created in Step 01.

## Prerequisites

- Scaffold from Step 03 running locally
- Google OAuth configured in Supabase (Step 02)

---

## Prompt for Claude

> I have a React + Vite app with Supabase already scaffolded. The Supabase client is exported from `src/lib/supabase.js`. I need you to build the complete authentication flow with the following requirements:
>
> **`src/hooks/useAuth.js`** — a custom hook that:
> - Calls `supabase.auth.getSession()` on mount to check for an existing session
> - Subscribes to `supabase.auth.onAuthStateChange` to keep session state up to date
> - Exposes `{ user, session, loading, signInWithGoogle, signOut }`
> - `signInWithGoogle` calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })`
> - `signOut` calls `supabase.auth.signOut()` and navigates to `/`
>
> **`src/pages/AuthCallback.jsx`** — a page at route `/auth/callback` that:
> - Handles the OAuth redirect by calling `supabase.auth.exchangeCodeForSession()`
> - Redirects to `/challenges` on success
> - Redirects to `/` with an error message on failure
>
> Add the `/auth/callback` route to `App.jsx`.
>
> **`src/pages/Login.jsx`** — the login page that:
> - Shows the app name "Wedding Challenges" as a heading
> - Shows a short tagline like "Sign in to start completing challenges"
> - Has a single "Sign in with Google" button that calls `signInWithGoogle` from the `useAuth` hook
> - If the user is already signed in, redirects to `/challenges`
> - Shows a loading spinner while the auth state is being determined
>
> **`src/components/ProtectedRoute.jsx`** — update this to use the `useAuth` hook:
> - While `loading` is true, show a full-screen spinner
> - If `user` is null, redirect to `/`
> - Otherwise render `children`
>
> **`src/components/NavBar.jsx`** — a simple top navigation bar that:
> - Shows the app name on the left
> - Shows the user's avatar (from `user.user_metadata.avatar_url`) and display name on the right
> - Has a sign-out button/link
> - Is shown on all protected pages (Challenges, Upload, Leaderboard)
>
> Style everything with plain CSS modules (one `.module.css` file per component). Keep the design clean and mobile-first — large tap targets, readable font sizes, nothing smaller than 16px.

---

## Testing this step

1. Run `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click "Sign in with Google" — you should be redirected to Google's OAuth screen
4. Complete sign-in — you should land on `/challenges` (placeholder page for now)
5. In the Supabase dashboard → **Authentication → Users**, confirm your user appears
6. In **Table Editor → profiles**, confirm a row was inserted by the trigger
7. Refresh the page — you should stay signed in (session is persisted)
8. Click sign out — you should return to the login page

---

## Common issues

| Issue | Fix |
|---|---|
| Redirect URI mismatch error | Double-check `http://localhost:5173/auth/callback` is in both Google Cloud Console and Supabase Auth URL Configuration |
| Profile row not created | Check the trigger was created correctly in Step 01 — run `select * from profiles` in SQL Editor |
| Infinite redirect loop | Make sure `ProtectedRoute` waits for `loading: false` before redirecting |

---

## Next Step

→ `05-challenge-list.md` — Fetch challenges and submissions from Supabase and display the list with ??? masking.
