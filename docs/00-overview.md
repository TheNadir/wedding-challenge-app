# Wedding Challenge App — Build Plan

## Overview

A mobile-first Progressive Web App (PWA) for a wedding event where guests complete photo challenges throughout the day. Built with React + Vite on the frontend, Supabase for auth/database/storage, and Vercel for hosting.

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React + Vite (PWA) | Free |
| Hosting | Vercel (Hobby plan) | Free |
| Auth | Supabase Auth + Google OAuth | Free |
| Database | Supabase Postgres | Free (500 MB) |
| File storage | Supabase Storage | Free (1 GB) |

## App Features

- Google sign-in via OAuth
- Challenge list — titles hidden as `???` until the player submits a photo
- Native camera or photo library upload on mobile
- Real-time reveal of challenge title after submission
- Leaderboard showing completion counts per player

## Build Steps

Work through these files in order. Each file is a self-contained prompt for Claude.

| File | Stage | Description |
|---|---|---|
| `01-supabase-setup.md` | Supabase | Create project, tables, RLS policies, storage bucket |
| `02-google-oauth-setup.md` | Auth | Configure Google Cloud Console + Supabase Auth provider |
| `03-vite-project-scaffold.md` | Frontend | Scaffold React/Vite app, install dependencies, PWA config |
| `04-auth-flow.md` | Frontend | Google sign-in, session handling, protected routes |
| `05-challenge-list.md` | Frontend | Fetch and display challenges with ??? masking |
| `06-photo-upload.md` | Frontend | Camera/file input, upload to Storage, write submission |
| `07-leaderboard.md` | Frontend | Completion counts, leaderboard screen |
| `08-pwa-polish.md` | PWA | Manifest, icons, offline shell, install prompt |
| `09-vercel-deploy.md` | Deploy | Connect GitHub repo, set env vars, deploy to Vercel |
| `10-seed-challenges.md` | Data | SQL to seed the challenges table before the event |

## Key Decisions

- **Supabase over Firebase** — real Postgres SQL, more expressive Row-Level Security, same developer experience
- **Vite PWA plugin** — generates service worker and manifest so guests can install the app to their home screen from Safari or Chrome with no app store required
- **Client-side ??? masking** — challenges and submissions are fetched separately and cross-referenced in the React component; no server logic needed
- **Storage path convention** — photos are stored at `{user_id}/{challenge_id}/{filename}` so RLS policies can enforce per-user upload permissions cleanly
