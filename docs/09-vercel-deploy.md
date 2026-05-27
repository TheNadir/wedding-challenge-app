# Step 09 — Vercel Deployment

## Goal

Deploy the app to a public Vercel URL so guests can access it on their phones at the wedding. Configure environment variables securely and update OAuth redirect URLs to point to the production domain.

## Prerequisites

- App pushed to a GitHub repository
- All features tested locally (Steps 04–08)
- Vercel account at https://vercel.com (free Hobby plan)

---

## 1. Connect GitHub to Vercel

1. Log in to https://vercel.com and click **Add New → Project**
2. Click **Import Git Repository** and connect your GitHub account if you haven't already
3. Find your `wedding-challenge-app` repository and click **Import**
4. Vercel will auto-detect it as a Vite project — confirm the settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

## 2. Add Environment Variables

Before clicking Deploy, scroll down to **Environment Variables** and add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://abcdefgh.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

These must match exactly what you have in your local `.env.local` file. Do NOT commit `.env.local` to Git.

Click **Deploy** and wait ~1 minute for the first build.

---

## 3. Note your Production URL

Once deployed, Vercel gives you a URL like `https://wedding-challenge-app.vercel.app` (or a custom subdomain). Copy this URL.

---

## 4. Update Google Cloud Console

1. Go to https://console.cloud.google.com → **APIs & Services → Credentials**
2. Click your OAuth client
3. Under **Authorised redirect URIs** add:

```
https://your-app-name.vercel.app/auth/callback
```

4. Click **Save**

---

## 5. Update Supabase Auth URL Configuration

1. In Supabase go to **Authentication → URL Configuration**
2. Change **Site URL** to your Vercel production URL: `https://your-app-name.vercel.app`
3. Under **Redirect URLs** add: `https://your-app-name.vercel.app/auth/callback`
4. Keep the localhost entries — you still need them for local development
5. Click **Save**

---

## 6. Test Production Sign-in

1. Open your Vercel URL on your phone
2. Tap "Sign in with Google" and complete the flow
3. Confirm you land on the challenges page
4. Test photo upload end-to-end

---

## 7. Custom Domain (optional but recommended)

If you want a memorable URL for guests (e.g. `challenges.youreventname.com`):

1. In Vercel → your project → **Settings → Domains**
2. Add your custom domain
3. Follow Vercel's instructions to add a DNS CNAME record with your domain registrar
4. Once propagated, also add the custom domain to the Google OAuth redirect URIs and Supabase Auth redirect URLs

---

## 8. Automatic Deploys

After this setup, every `git push` to your main branch automatically triggers a new Vercel deployment. This means you can fix bugs right up until the event and deploy in under a minute.

---

## Sharing the app with guests

Recommended ways to get guests to the app on the day:

- **QR code** on the wedding program or table cards — link to your Vercel URL
- **Short URL** using a free service like Bit.ly if the Vercel URL is long
- Encourage guests to **install to home screen** once they open it (the install prompt from Step 08 will help)

Generate a QR code at https://qr-code-generator.com by pasting your app URL.

---

## Next Step

→ `10-seed-challenges.md` — Insert the actual challenge content into the database before the event.
