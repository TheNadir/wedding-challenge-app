# 💍 Wedding Challenges — PWA

A mobile-first Progressive Web App for wedding guests to complete photo challenges throughout the day.

Built with **React + Vite**, **Supabase** (auth / Postgres / storage), and deployable to **Vercel** for free.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment variables

Create `.env.local` in the project root (already gitignored):

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these in your Supabase dashboard → **Settings → API**.

Google OAuth credentials live in Supabase's dashboard (Auth → Providers → Google) and don't need to be in `.env.local` unless you're using them directly in client code.

---

## Project structure

```
didi-wedding-app/
├── public/
│   └── icons/            # PWA icons (192×192 and 512×512)
├── src/
│   ├── components/
│   │   ├── NavBar.jsx       # Top nav (sign-out, links)
│   │   └── ProtectedRoute.jsx  # Auth guard — redirects to / if signed out
│   ├── hooks/
│   │   ├── useAuth.js        # Supabase session + onAuthStateChange
│   │   ├── useChallenges.js  # Fetch all challenges
│   │   └── useSubmissions.js # Fetch user submissions + upload helper
│   ├── lib/
│   │   └── supabase.js       # Singleton Supabase client
│   ├── pages/
│   │   ├── Login.jsx         # Public landing — Google sign-in
│   │   ├── Challenges.jsx    # Challenge list (??? masking)
│   │   ├── Upload.jsx        # Camera / file upload
│   │   └── Leaderboard.jsx   # Completion counts
│   ├── App.jsx               # Router setup
│   ├── index.css             # Global reset + base styles
│   └── main.jsx              # React entry point
├── .env.local                # Secret env vars (gitignored)
├── vite.config.js            # Vite + PWA plugin config
└── index.html                # HTML shell
```

---

## Routes

| Path | Page | Auth required |
|------|------|:---:|
| `/` | Login | ✗ |
| `/challenges` | Challenge list | ✓ |
| `/upload/:challengeId` | Photo upload | ✓ |
| `/leaderboard` | Leaderboard | ✓ |

Unauthenticated requests to protected routes redirect to `/`.

---

## Build for production

```bash
npm run build
# output in dist/
```

The build generates a service worker (`sw.js`) and PWA manifest automatically via `vite-plugin-pwa`.

---

## PWA install

On mobile:

- **iOS Safari** → Share → "Add to Home Screen"
- **Android Chrome** → menu → "Install app" (or the install banner)

---

## Build steps

Work through the docs in order — each file is a self-contained implementation prompt:

| File | Stage |
|------|-------|
| `docs/01-supabase-setup.md` | Database tables + RLS + storage bucket |
| `docs/02-google-oauth-setup.md` | Google Cloud Console + Supabase auth provider |
| `docs/03-vite-project-scaffold.md` | ← **you are here** |
| `docs/04-auth-flow.md` | Real Google sign-in + session handling |
| `docs/05-challenge-list.md` | Challenge cards with ??? masking |
| `docs/06-photo-upload.md` | Camera input + Storage upload |
| `docs/07-leaderboard.md` | Completion counts UI |
| `docs/08-pwa-polish.md` | Icons, offline shell, install prompt |
| `docs/09-vercel-deploy.md` | Vercel + env vars |
| `docs/10-seed-challenges.md` | SQL seed data |
