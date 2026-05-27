# Step 08 — PWA Polish

## Goal

Finalize the Progressive Web App configuration so guests can install the app to their phone's home screen directly from the browser — no App Store required. This gives the app a native feel and keeps it one tap away during the event.

## Prerequisites

- All core features working (Steps 04–07)
- App deployed to Vercel (or testable via `npm run build && npm run preview` locally)

---

## Prompt for Claude

> My React + Vite wedding challenge app is functionally complete. I now need to finalize it as a proper PWA. The `vite-plugin-pwa` is already installed and has basic config in `vite.config.js`. Please help me complete the PWA setup.
>
> **1. Update `vite.config.js`** with a complete PWA manifest:
> ```js
> VitePWA({
>   registerType: 'autoUpdate',
>   includeAssets: ['icons/*.png'],
>   manifest: {
>     name: 'Wedding Challenges',
>     short_name: 'Challenges',
>     description: 'Complete photo challenges at the wedding!',
>     theme_color: '#7c3aed',
>     background_color: '#ffffff',
>     display: 'standalone',
>     orientation: 'portrait',
>     scope: '/',
>     start_url: '/',
>     icons: [
>       { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
>       { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
>       { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
>     ]
>   },
>   workbox: {
>     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
>     runtimeCaching: [
>       {
>         urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
>         handler: 'NetworkFirst',
>         options: {
>           cacheName: 'supabase-cache',
>           expiration: { maxEntries: 50, maxAgeSeconds: 300 }
>         }
>       }
>     ]
>   }
> })
> ```
>
> **2. Create placeholder icons** — generate simple SVG-based placeholder icons at `public/icons/icon-192.png` and `public/icons/icon-512.png`. Use a purple circle with a white camera icon (or the letter "W") as the design. Provide instructions on how to replace these with real icons using a tool like https://realfavicongenerator.net.
>
> **3. Add an install prompt component** `src/components/InstallPrompt.jsx`:
> - Listens for the browser's `beforeinstallprompt` event
> - When the event fires, shows a dismissible banner at the bottom of the screen: "Add to home screen for the best experience" with an "Install" button
> - Tapping Install calls `prompt()` on the deferred event
> - If the user dismisses, stores a flag in `sessionStorage` so it does not appear again this session
> - On iOS (where `beforeinstallprompt` does not fire), shows a different message: "Tap the Share button then 'Add to Home Screen'" with the appropriate iOS share icon
> - Detect iOS with `navigator.userAgent` check
>
> **4. Add an offline fallback page** `public/offline.html`:
> - A simple static HTML page (no React) that says "You're offline — reconnect to keep completing challenges"
> - Register this in the Workbox config as the offline fallback
>
> **5. Update the `<head>` in `index.html`**:
> - Add `<meta name="apple-mobile-web-app-capable" content="yes">`
> - Add `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
> - Add `<meta name="apple-mobile-web-app-title" content="Challenges">`
> - Add `<link rel="apple-touch-icon" href="/icons/icon-192.png">`
> - Add the theme color meta tag: `<meta name="theme-color" content="#7c3aed">`

---

## Testing installability

### Android (Chrome)
1. Open the deployed app in Chrome on Android
2. After a few seconds the install banner should appear (or tap the three-dot menu → "Add to Home screen")
3. Install — the app should appear on the home screen and open without browser chrome

### iOS (Safari)
1. Open the deployed app in Safari on iPhone
2. Tap the Share button (box with arrow)
3. Scroll down to "Add to Home Screen"
4. Tap Add — the app should appear on the home screen and open in standalone mode

### Desktop (Chrome / Edge)
1. An install icon should appear in the address bar
2. Clicking it should install the app as a standalone window

---

## Icon generation (do this before the event)

1. Create a 1024×1024 PNG icon for your wedding (something with the couple's initials, a ring, flowers, etc.)
2. Go to https://realfavicongenerator.net and upload it
3. Download the generated icons
4. Replace `public/icons/icon-192.png` and `public/icons/icon-512.png` with the generated files
5. Redeploy to Vercel

---

## Next Step

→ `09-vercel-deploy.md` — Connect the GitHub repo to Vercel, configure environment variables, and deploy to production.
