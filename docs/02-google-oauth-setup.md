# Step 02 — Google OAuth Setup

## Goal

Configure Google Cloud Console to issue OAuth credentials, then connect those credentials to Supabase Auth so players can sign in with their Google account.

## Prerequisites

- Supabase project created (Step 01)
- A Google account to create a Google Cloud project (the same account you use for Gmail is fine)

---

## 1. Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click the project dropdown at the top → **New Project**
3. Name it `wedding-challenge-app` and click **Create**
4. Make sure the new project is selected in the top dropdown

---

## 2. Configure the OAuth Consent Screen

1. In the left sidebar go to **APIs & Services → OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in the required fields:
   - **App name:** Wedding Challenge App (or your event name)
   - **User support email:** your email address
   - **Developer contact email:** your email address
4. Click **Save and Continue** through the Scopes and Test Users screens (no changes needed)
5. Click **Back to Dashboard**

---

## 3. Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Set **Application type** to **Web application**
4. Name it `Supabase Wedding App`
5. Under **Authorised redirect URIs**, click **Add URI** and enter:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

Replace `<your-project-ref>` with the subdomain from your Supabase Project URL (e.g. if your URL is `https://abcdefgh.supabase.co` then use `abcdefgh`).

6. Click **Create**
7. A dialog appears with your **Client ID** and **Client Secret** — copy both and save them somewhere safe

---

## 4. Add Google as a Provider in Supabase

1. In your Supabase dashboard go to **Authentication → Providers**
2. Find **Google** in the list and click to expand it
3. Toggle **Enable Sign in with Google** to ON
4. Paste in your **Client ID** and **Client Secret** from the previous step
5. Click **Save**

---

## 5. Add Localhost as an Authorised Redirect URI (for development)

While you are in Google Cloud Console, you need to add a localhost redirect so sign-in works during local development.

1. Go back to **APIs & Services → Credentials**
2. Click on the OAuth client you just created
3. Under **Authorised redirect URIs** add a second entry:

```
http://localhost:5173/auth/callback
```

4. Click **Save**

Also add your future Vercel production URL here once you know it (Step 09). It will look like `https://your-app-name.vercel.app/auth/callback`.

---

## 6. Add Allowed Redirect URLs in Supabase

1. In Supabase go to **Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:5173` for now (update to your Vercel URL after deployment)
3. Under **Redirect URLs** add:

```
http://localhost:5173/auth/callback
```

4. Click **Save**

---

## Verify

You cannot fully test sign-in until the React app is running (Step 04), but you can confirm everything looks right:

- Supabase **Authentication → Providers → Google** shows as enabled with your credentials saved
- Google Cloud Console shows one OAuth client with two redirect URIs (Supabase callback + localhost)

---

## Outputs from this step

No new environment variables — the Client ID and Secret live only inside Supabase (never in your frontend code).

---

## Next Step

→ `03-vite-project-scaffold.md` — Scaffold the React + Vite app, install Supabase and PWA dependencies, and wire up environment variables.
