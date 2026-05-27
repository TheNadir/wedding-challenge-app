# Step 03 — Vite Project Scaffold

## Goal

Create the React + Vite project, install all dependencies, configure the Supabase client, set up the PWA plugin, and establish the folder structure the rest of the build will follow.

## Prerequisites

- Node.js 18+ installed locally (`node -v` to check)
- Supabase project URL and anon key from Step 01
- Git installed

---

## Prompt for Claude

> I am building a wedding photo challenge PWA using React + Vite and Supabase. Please scaffold the full project for me with the following requirements:
>
> **Dependencies to install:**
> - `@supabase/supabase-js` — Supabase client
> - `react-router-dom` — client-side routing
> - `vite-plugin-pwa` — PWA manifest and service worker generation
>
> **Project structure to create:**
> ```
> src/
>   components/       — shared UI components
>   pages/            — one file per route (Login, Challenges, Upload, Leaderboard)
>   hooks/            — custom React hooks (useAuth, useChallenges, useSubmissions)
>   lib/
>     supabase.js     — Supabase client singleton
>   App.jsx           — router setup
>   main.jsx          — entry point
> public/
>   icons/            — PWA icons (placeholder)
> .env.local          — environment variables (gitignored)
> vite.config.js      — Vite + PWA plugin config
> ```
>
> **Environment variables** (in `.env.local`):
> ```
> VITE_SUPABASE_URL=https://your-project.supabase.co
> VITE_SUPABASE_ANON_KEY=your-anon-key
> ```
>
> **`src/lib/supabase.js`** should export a single Supabase client instance created with `createClient(url, key)`.
>
> **`vite.config.js`** should include `vite-plugin-pwa` configured with:
> - App name: "Wedding Challenges"
> - Short name: "Challenges"
> - `display: standalone`
> - `background_color: #ffffff`
> - `theme_color: #7c3aed` (purple to match the wedding theme)
> - A placeholder 192×192 and 512×512 icon path under `public/icons/`
> - `registerType: 'autoUpdate'`
>
> **`App.jsx`** should set up React Router with four routes:
> - `/` → Login page (public)
> - `/challenges` → Challenge list (protected — redirect to `/` if not signed in)
> - `/upload/:challengeId` → Photo upload (protected)
> - `/leaderboard` → Leaderboard (protected)
>
> Create a `ProtectedRoute` wrapper component that checks Supabase auth state and redirects unauthenticated users.
>
> Please generate all files with placeholder content (e.g. `<h1>Challenges</h1>`) in the page components — the real implementation comes in later steps. Include a README with instructions to run the project locally.

---

## Manual steps after Claude generates the code

1. Run `npm install` in the project root
2. Fill in your real values in `.env.local`
3. Run `npm run dev` — the app should open at `http://localhost:5173`
4. Confirm the app loads without errors in the browser console
5. Initialise a Git repo: `git init && git add . && git commit -m "initial scaffold"`
6. Push to a new GitHub repository (needed for Vercel deployment in Step 09)

---

## Expected file count

After this step you should have approximately 12–15 files including config, source, and env files.

---

## Next Step

→ `04-auth-flow.md` — Implement the Google sign-in flow, session persistence, and the auth context hook.
