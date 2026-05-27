# Step 01 — Supabase Project Setup

## Goal

Create the Supabase project, design the database schema, configure Row-Level Security (RLS) policies, and create the photo storage bucket. By the end of this step you will have a fully configured backend ready for the app to connect to.

## Prerequisites

- A free account at https://supabase.com
- No code written yet — this is infrastructure only

---

## 1. Create the Supabase Project

1. Log in to https://supabase.com and click **New project**
2. Choose your organisation (or create one)
3. Set the following:
   - **Name:** `wedding-challenge-app` (or your preferred name)
   - **Database password:** generate a strong password and save it somewhere safe
   - **Region:** choose the region closest to where the wedding will be held
4. Click **Create new project** and wait ~2 minutes for provisioning

Once ready, go to **Project Settings → API** and note down:
- `Project URL` (looks like `https://xxxx.supabase.co`)
- `anon public` key

You will need both of these as environment variables in Step 03.

---

## 2. Create the Database Tables

Go to **SQL Editor** in the Supabase dashboard and run the following SQL in order.

### profiles table

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
```

### challenges table

```sql
create table challenges (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);
```

### submissions table

```sql
create table submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  challenge_id uuid references challenges(id) on delete cascade not null,
  photo_url text not null,
  created_at timestamptz default now(),
  unique(user_id, challenge_id)
);
```

The `unique(user_id, challenge_id)` constraint prevents a player from submitting the same challenge twice.

---

## 3. Auto-create a Profile on Sign-up

This trigger automatically inserts a row into `profiles` whenever a new user signs in via Google OAuth for the first time.

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

## 4. Enable Row-Level Security

Run this to turn on RLS for all three tables:

```sql
alter table profiles enable row level security;
alter table challenges enable row level security;
alter table submissions enable row level security;
```

---

## 5. Create RLS Policies

### profiles

```sql
-- Users can read any profile (needed for leaderboard)
create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
```

### challenges

```sql
-- Anyone authenticated can read challenges
create policy "Challenges are readable by authenticated users"
  on challenges for select
  to authenticated
  using (true);
```

### submissions

```sql
-- Users can read all submissions (needed for leaderboard)
create policy "Submissions are publicly readable"
  on submissions for select
  to authenticated
  using (true);

-- Users can only insert their own submissions
create policy "Users can insert own submissions"
  on submissions for insert
  to authenticated
  with check (auth.uid() = user_id);
```

---

## 6. Create the Photo Storage Bucket

1. Go to **Storage** in the Supabase sidebar
2. Click **New bucket**
3. Name it `photos`
4. Set **Public bucket** to ON (so uploaded photo URLs can be displayed in the app without extra auth headers)
5. Click **Create bucket**

### Storage RLS policies

Go to **Storage → Policies** and add these policies for the `photos` bucket:

```sql
-- Anyone can view photos (bucket is public, but policy adds a belt-and-suspenders check)
create policy "Photos are publicly viewable"
  on storage.objects for select
  using ( bucket_id = 'photos' );

-- Authenticated users can upload to their own folder only
create policy "Users can upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own photos
create policy "Users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 7. Verify Everything

In the Supabase **Table Editor**, confirm you can see:
- `profiles` table
- `challenges` table
- `submissions` table

In **Storage**, confirm the `photos` bucket exists.

In **Authentication → Providers**, confirm Email is enabled by default (Google OAuth is configured in the next step).

---

## Outputs from this step

The following values are needed in later steps — save them now:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |

---

## Next Step

→ `02-google-oauth-setup.md` — Configure Google OAuth so players can sign in with their Google account.
