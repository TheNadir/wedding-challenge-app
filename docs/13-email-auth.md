# 13 — Email Auth Setup

Adds email/password sign-in alongside the existing Google OAuth.

---

## Supabase Console Steps

### 1. Enable Email Provider

**Authentication → Providers → Email**

- Toggle **"Enable Email provider"** ON
- Recommended settings for a closed guest list:
  - **Confirm email**: OFF — guests can sign in immediately without checking inbox
  - **Secure email change**: ON
  - **Double confirm email changes**: ON

### 2. Password Policy (optional)

**Authentication → Settings → Password**

- Minimum 8 characters (Supabase default is fine)

### 3. Email Templates (only if "Confirm email" is ON)

**Authentication → Email Templates**

- Customize the "Confirm signup" template with wedding branding
- Set redirect URL to `https://<your-domain>/auth/callback`

### 4. Custom SMTP (optional but recommended for production)

**Project Settings → Auth → SMTP Settings**

Default Supabase SMTP is rate-limited to 4 emails/hour. For production use, configure a transactional provider (SendGrid, Resend, Postmark). Not required if "Confirm email" is OFF.

### 5. Pre-create Guest Accounts (recommended)

**Authentication → Users → Invite user**

Since this is a closed guest list, create accounts for each guest rather than leaving sign-up open. Each guest gets an email + password they can use to log in directly.

---

## Claude Implementation Prompt

Paste the following prompt into a new Claude Code conversation to implement the frontend changes:

```
I have a React + Supabase wedding PWA. I need to add email/password sign-in
alongside the existing Google OAuth. Here is the relevant context:

AUTH HOOK: src/hooks/useAuth.js
- Exports: { session, user, loading, signInWithGoogle, signOut }
- signInWithGoogle calls supabase.auth.signInWithOAuth({ provider: 'google', ... })
- useEffect listens to supabase.auth.onAuthStateChange and sets session state

LOGIN PAGE: src/pages/Login.jsx
- Full-screen gradient card UI (purple theme, #7c3aed accent)
- Currently has only a single "Sign in with Google" button
- Already handles: loading spinner, error display, auto-redirect if authenticated

SUPABASE CLIENT: src/lib/supabase.js
- createClient with persistSession: true, autoRefreshToken: true

AUTH CALLBACK: src/pages/AuthCallback.jsx
- Handles PKCE exchange and navigates to /challenges on SIGNED_IN event
- This file does NOT need changes

TASK: Add email/password sign-in with these requirements:

1. useAuth.js — add three new exported functions:
   - signInWithEmail(email, password): calls supabase.auth.signInWithPassword()
     Returns { error } so the Login page can display errors inline.
   - signUpWithEmail(email, password): calls supabase.auth.signUp()
     (Keep this but don't expose a sign-up button in the UI — only for admin use)
   - resetPassword(email): calls supabase.auth.resetPasswordForEmail()
     with redirectTo: window.location.origin + '/auth/callback'

2. Login.jsx — add an email/password form below the divider "or":
   - Show: email input, password input, "Sign in" button
   - Below that: a small "Forgot password?" link that calls resetPassword()
     and shows a success message "Check your email for a reset link"
   - Inline error display below the form (same style as existing error display)
   - Loading state on the "Sign in" button while request is in flight
   - On success: navigate to /challenges (same as Google flow)
   - Keep the Google button at the top, add a centered "or" divider, then the email form

3. Style constraints:
   - Match the existing purple theme (#7c3aed for buttons, #4c1d95 for headings)
   - Mobile-first (min-height: 52px for buttons, same as Google button)
   - Keep the card layout — do not change the outer container structure
   - No new dependencies — use only what's already installed

4. Do NOT add a sign-up form to the UI. The app is for a closed guest list.
   Guests either use Google sign-in or admin pre-creates their email accounts
   in the Supabase dashboard.

5. Do NOT modify AuthCallback.jsx — it already handles all session exchange
   events including those triggered by email sign-in.

Files to edit: src/hooks/useAuth.js, src/pages/Login.jsx
```

---

## Verification Checklist

After running the implementation:

- [ ] Login page renders the email form below the Google button with an "or" divider
- [ ] Sign in with a test account created in Supabase Dashboard → redirects to `/challenges`
- [ ] Wrong password → inline error message appears
- [ ] "Forgot password?" → success message "Check your email for a reset link"
- [ ] Google sign-in still works (regression)
