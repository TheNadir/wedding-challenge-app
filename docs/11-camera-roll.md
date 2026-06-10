# Step 11 — Disposable Camera Roll

## Goal

Add a private per-player photo gallery — inspired by disposable cameras at wedding events. Players can take photos in-app or upload from their camera roll at any time, independent of the challenge system. Photos are only visible to the player who uploaded them.

## Prerequisites

- Steps 01–03 complete (Supabase project, auth, env vars wired up)
- The `camera_roll` storage bucket already exists in Supabase

---

## 1. Configure the `camera_roll` Bucket

### 1a — Ensure the bucket is private

1. Go to **Storage** in the Supabase sidebar
2. Click the `camera_roll` bucket → **Edit bucket** (gear or "…" menu)
3. Confirm **Public bucket** is **OFF**
4. Save

A private bucket means direct unauthenticated URL access is blocked. The app uses signed URLs (time-limited tokens) to display photos securely.

### 1b — Add Storage RLS policies

Go to **SQL Editor** and run:

```sql
-- Users can only upload to their own folder
create policy "camera_roll: users can upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'camera_roll' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only view files in their own folder
create policy "camera_roll: users can view own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'camera_roll' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
create policy "camera_roll: users can delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'camera_roll' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**Why `(storage.foldername(name))[1]`?** Files are stored at `{userId}/{timestamp}-{filename}`. `storage.foldername(name)` returns an array of path segments; `[1]` is the first segment — the user's UUID. This ensures each user can only read/write files inside their own folder.

### 1c — Verify

In **Storage → Policies**, confirm the three new `camera_roll` policies are listed. No new DB table is needed — storage is the source of truth for this feature.

---

## 2. New Files

### `src/hooks/useCameraRoll.js`

Manages all data logic for the camera roll:

- **Upload**: XHR POST to `${VITE_SUPABASE_URL}/storage/v1/object/camera_roll/{userId}/{timestamp}-{filename}` with `Authorization: Bearer {accessToken}` header. Uses `xhr.upload.addEventListener('progress', ...)` for real-time progress (0–100%). No DB insert needed.
- **Gallery fetch**: `supabase.storage.from('camera_roll').list(userId)` → batch `createSignedUrls(paths, 3600)` for 1-hour signed URLs → sort newest-first.
- After a successful upload, automatically re-fetches the gallery so the new photo appears immediately.

### `src/pages/CameraRoll.jsx`

Protected page at `/camera-roll`:

- **Upload panel**: hidden file inputs for camera capture and library picker (same pattern as `Upload.jsx`), image preview, progress bar, and error display. On success: shows "Photo saved!" for 2 seconds then resets the form — the player stays on the page and can add another photo immediately.
- **Gallery**: 3-column square thumbnail grid. Skeleton tiles while loading, empty state when no photos yet.
- **Lightbox**: full-screen overlay when a thumbnail is tapped — prev/next arrows, close button, keyboard navigation (Escape, ArrowLeft, ArrowRight).

### `src/pages/CameraRoll.module.css`

Page styles. Copies shared token classes (buttons, progress bar, error box, hidden file input) from `Upload.module.css`. Adds gallery grid, square thumbnails, photo count badge, and lightbox overlay styles.

---

## 3. Changes to Existing Files

### `src/App.jsx`

Add the import and a new protected route before the fallback:

```jsx
import CameraRoll from './pages/CameraRoll'

// inside <Routes>, before the * fallback:
<Route
  path="/camera-roll"
  element={<ProtectedRoute><CameraRoll /></ProtectedRoute>}
/>
```

### `src/components/NavBar.jsx`

Add a third nav link after "Leaderboard", using the same `styles.navLink` / `styles.navLinkActive` pattern:

```jsx
<NavLink
  to="/camera-roll"
  className={({ isActive }) =>
    [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
  }
>
  Photos
</NavLink>
```

---

## 4. How Privacy Works

| Layer | Mechanism |
|---|---|
| Bucket setting | Private — no unauthenticated URL access |
| Storage RLS | Server-side: users can only read/write their own `{userId}/` folder |
| Frontend URLs | Signed URLs with 1-hour TTL — not permanent public links |
| Gallery fetch | `list()` is scoped to `{userId}/` prefix — other users' paths are never fetched |

---

## 5. Verify Everything

1. Sign in as User A, upload 3 photos — they should appear in the gallery grid
2. Sign in as User B — should see the empty state (0 photos)
3. Confirm User B's `list()` call on User A's folder is blocked (check Supabase Storage logs)
4. Test the lightbox: open, prev/next, Escape key, close button
5. Test upload progress on a throttled connection (Chrome DevTools → Network → Slow 3G)
6. Test on mobile: "Take photo" should open the device camera, "Choose from library" the photo picker
7. Check NavBar at 320px viewport — all three links should be visible without overflow

---

## Next Step

→ The feature is self-contained. Consider `12-admin-panel.md` for viewing all players' camera rolls after the event.
