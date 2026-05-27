# Step 06 — Photo Upload

## Goal

Build the upload page where a player completes a challenge. They tap the page from the challenge list, see the challenge revealed for the first time, take a photo or pick one from their library, and submit it. The submission is uploaded to Supabase Storage and a row is written to the `submissions` table.

## Prerequisites

- Challenge list working (Step 05)
- Supabase Storage `photos` bucket created with RLS policies (Step 01)

---

## Prompt for Claude

> I have a React + Vite + Supabase app. Auth works, the challenge list works. Now I need to build the photo upload page at `/upload/:challengeId`.
>
> **`src/hooks/useSubmission.js`** — a custom hook that handles the upload flow:
> - Accepts `challengeId` and `userId` as arguments
> - Exposes `{ submit, uploading, progress, error, success }`
> - `submit(file)` does the following in order:
>   1. Validates the file is an image and under 10 MB
>   2. Generates a unique file path: `{userId}/{challengeId}/{Date.now()}-{file.name}`
>   3. Calls `supabase.storage.from('photos').upload(path, file)` with `upsert: false`
>   4. Gets the public URL via `supabase.storage.from('photos').getPublicUrl(path)`
>   5. Inserts a row into `submissions` with `user_id`, `challenge_id`, and `photo_url`
>   6. Sets `success: true` on completion
> - Tracks upload progress via the `onUploadProgress` option if available
> - Sets `error` with a friendly message on any failure
>
> **`src/pages/Upload.jsx`** — the upload page that:
> - Gets `challengeId` from `useParams()`
> - Fetches the single challenge row from Supabase to show the player what they need to do
> - Checks if a submission already exists for this user + challenge — if so, redirect to `/challenges`
> - Shows the challenge title and description prominently (this is the first time the player sees it)
> - Shows a large upload area with two options:
>   - "Take a photo" button — `<input type="file" accept="image/*" capture="environment">` (opens camera)
>   - "Choose from library" button — `<input type="file" accept="image/*">` (opens file picker)
> - After the player selects a file:
>   - Shows a preview of the selected image
>   - Shows a "Submit" button and a "Choose a different photo" link
> - During upload:
>   - Shows a progress indicator (spinner or progress bar)
>   - Disables the submit button to prevent double-submission
> - On success:
>   - Shows a brief success message ("Challenge complete!")
>   - Navigates back to `/challenges` after 1.5 seconds
> - On error:
>   - Shows the error message with a "Try again" option
>
> **Important mobile behaviour:**
> - The file inputs should be visually hidden — style custom buttons that trigger `.click()` on the hidden inputs
> - Image preview should use `URL.createObjectURL(file)` and be revoked on unmount
> - Keep the layout single-column, large tap targets throughout
>
> Style with CSS modules. The reveal of the challenge title should feel rewarding — consider a simple fade-in or scale animation when the page loads.

---

## Testing this step

1. Navigate to a challenge card with `???` and tap it
2. Confirm the challenge title and description are shown
3. Tap "Take a photo" — on mobile this should open the camera; on desktop it opens a file dialog
4. Select or take a photo
5. Confirm the image preview appears
6. Tap Submit
7. Confirm in Supabase **Storage → photos** that the file was uploaded to `{userId}/{challengeId}/`
8. Confirm in **Table Editor → submissions** that a row was inserted
9. Confirm you are redirected back to `/challenges` and the card now shows as completed with the photo thumbnail

---

## File size and format notes

- 10 MB limit is a safe default for phone camera photos compressed by the browser
- `accept="image/*"` covers JPEG, PNG, HEIC (iOS), and WebP
- HEIC files from iPhones are typically converted by the browser before the File object is handed to JS — no special handling needed in most cases
- Supabase Storage accepts any binary file — no server-side image processing is set up at this stage

---

## Common issues

| Issue | Fix |
|---|---|
| Upload fails with 403 | Check the Storage RLS policy — the folder path must start with the user's UUID |
| File input does not open camera on iOS | Ensure `capture="environment"` is on the input element; iOS Safari requires this |
| Double submission on fast taps | Ensure `uploading` state disables the submit button immediately on first tap |
| `getPublicUrl` returns a URL that 404s | Confirm the bucket is set to Public in Step 01 |

---

## Next Step

→ `07-leaderboard.md` — Build the leaderboard showing how many challenges each player has completed.
