# Admin Console

An admin-only page at `/admin` that shows challenge completion stats — who has completed which challenges and a ranked leaderboard overview.

---

## Database Changes

Run the following in the Supabase SQL Editor.

### 1. Add `is_admin` to `profiles`

```sql
alter table profiles
  add column if not exists is_admin boolean not null default false;
```

Grant admin access to specific users:

```sql
update profiles set is_admin = true where id = '<your-user-uuid>';
```

### 2. Create `get_admin_dashboard()` RPC

This single function returns all data the admin page needs and enforces the admin check server-side. Non-admins calling it directly receive an exception.

```sql
create or replace function get_admin_dashboard()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  select is_admin into v_is_admin from profiles where id = auth.uid();
  if not found or not v_is_admin then
    raise exception 'Access denied: admin only' using errcode = 'PGRST301';
  end if;

  return json_build_object(
    'leaderboard', (select json_agg(row_to_json(lb)) from get_leaderboard() lb),
    'submissions', (select json_agg(row_to_json(s)) from submissions s),
    'challenges',  (select json_agg(row_to_json(c) order by c.sort_order) from challenges c),
    'profiles',    (
      select json_agg(json_build_object('id', p.id, 'display_name', p.display_name, 'avatar_url', p.avatar_url))
      from profiles p
    )
  );
end;
$$;
```

The existing `get_leaderboard()` RPC is reused inside this function. No new RLS policies are needed — `security definer` bypasses RLS.

---

## Access Control

Two layers:

1. **Client-side** — `AdminRoute` component redirects non-admins to `/challenges` and unauthenticated users to `/`.
2. **Database-side** — `get_admin_dashboard()` verifies `is_admin` before returning any data, so direct Supabase client calls from non-admins also fail.

---

## New Files

| File | Purpose |
|------|---------|
| `src/hooks/useIsAdmin.js` | Reads `profiles.is_admin` for the current user |
| `src/components/AdminRoute.jsx` | Route guard: auth + admin check |
| `src/hooks/useAdminData.js` | Fetches all admin dashboard data via RPC |
| `src/pages/Admin.jsx` | Admin console page component |
| `src/pages/Admin.module.css` | Styles for admin page |

## Modified Files

| File | Change |
|------|--------|
| `src/App.jsx` | Add `/admin` route wrapped in `AdminRoute` |
| `src/components/NavBar.jsx` | Show "Admin" nav link only for admin users |

---

## UI Layout

**Section 1 — Leaderboard Overview**
Table: Rank | Name (avatar + display name) | Completed (X / total)

**Section 2 — Per-Challenge Breakdown**
One card per challenge showing the challenge title, number of submissions, and a list of who submitted with a "View photo" link.

---

## Verification

1. Run `select get_admin_dashboard()` in Supabase SQL Editor as your admin user — should return JSON with `leaderboard`, `submissions`, `challenges`, `profiles` keys.
2. Visit `/admin` as a non-admin user → redirected to `/challenges`.
3. Visit `/admin` while logged out → redirected to `/`.
4. As admin user → admin console renders with correct data.
5. "Admin" nav link is absent for non-admin users, visible for admin.
6. Per-challenge submission counts match what's in the `submissions` table.
