# Step 12 — Feature Flags

## Goal

Enable and disable features in production without redeploying the app. A `feature_flags` table in Supabase is the source of truth — toggled from the Supabase Table Editor, read by the app once at startup. App users can never write to this table.

---

## 1. Supabase Setup (manual, one-time)

### Create the table

Go to **SQL Editor** and run:

```sql
create table feature_flags (
  key         text primary key,
  enabled     boolean not null default false,
  description text
);
```

### Enable Row-Level Security

```sql
alter table feature_flags enable row level security;
```

### Add the read policy

```sql
create policy "Authenticated users can read feature flags"
  on feature_flags for select
  to authenticated
  using (true);
```

There is intentionally no INSERT, UPDATE, or DELETE policy for the anon key. Flags are managed exclusively from the Supabase dashboard.

### Insert initial flags

```sql
insert into feature_flags (key, enabled, description) values
  ('camera_roll', true, 'Disposable camera roll — players can upload photos throughout the day');
```

Add one row per feature. Repeat this `INSERT` for each new flag.

### Verify

In **Table Editor → feature_flags** you should see:

| key | enabled | description |
|---|---|---|
| `camera_roll` | `true` | Disposable camera roll… |

In **Authentication → Policies**, the `feature_flags` table should show one SELECT policy.

---

## 2. How to Toggle a Flag

1. Open **Supabase dashboard → Table Editor → feature_flags**
2. Click the row you want to change
3. Toggle the `enabled` column between `true` and `false`
4. Save — takes effect on the next page load for all users

---

## 3. Frontend Architecture

### `src/context/FeatureFlagsContext.jsx`

A React context that fetches all flags once on app load:

- Queries `supabase.from('feature_flags').select('key, enabled')`
- Converts rows into a plain object: `{ camera_roll: true, ... }`
- If the fetch fails, defaults all flags to `false` (hides features rather than crashing)
- Exports `FeatureFlagsProvider` (wraps the app) and `useFeatureFlags()` (hook for consumers)

### `src/App.jsx`

`FeatureFlagsProvider` wraps `BrowserRouter` so flags are available everywhere in the tree.

### Using flags in a component

```jsx
import { useFeatureFlags } from '../context/FeatureFlagsContext'

const { flags, loading } = useFeatureFlags()

// Conditionally render UI:
{flags.camera_roll && <NavLink to="/camera-roll">Disposable Camera</NavLink>}

// Redirect away from a flagged-off page:
useEffect(() => {
  if (!loading && !flags.camera_roll) navigate('/challenges', { replace: true })
}, [loading, flags.camera_roll, navigate])
```

### Files that currently consume flags

| File | What it gates |
|---|---|
| `src/components/NavBar.jsx` | Shows/hides "Disposable Camera" nav link |
| `src/pages/CameraRoll.jsx` | Redirects to /challenges if flag is off |

---

## 4. Adding a New Flag

1. Insert a row in **Table Editor → feature_flags**: `key = 'my_feature'`, `enabled = true/false`
2. In any component: `const { flags } = useFeatureFlags()` → check `flags.my_feature`
3. Toggle from the dashboard — no code change or redeployment needed

---

## 5. Verification

1. Set `camera_roll = true` → confirm "Disposable Camera" appears in the NavBar and `/camera-roll` loads
2. Set `camera_roll = false` → confirm the NavLink disappears and navigating directly to `/camera-roll` redirects to `/challenges`
3. Set back to `true` → confirm it reappears after a page refresh
4. DevTools → Network → confirm the `feature_flags` query fires exactly once on load

---

## Next Step

→ Add new flags as new features are built. Consider adding a `leaderboard` flag if you want to control leaderboard visibility during the event.
