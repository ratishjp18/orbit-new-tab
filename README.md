# Orbit New Tab

A Chrome extension (Manifest V3) that replaces the new tab page with a beautiful animated space background and app tiles.

---

## Features

- **Animated space background** — drifting nebula clouds, twinkling stars with parallax depth, and occasional shooting stars
- **Multi-page layout** — 2 rows × 6 columns per page, scroll between pages with the mouse wheel, keyboard (↑ ↓ / PgUp PgDn), or touchpad swipe
- **Page indicator** — vertical dots on the right edge; click any dot to jump to that page
- **App tiles** — icon-only, no labels; hover lifts the tile with a per-app colour glow
- **Incognito shortcut** — one-click tile that opens a new incognito window
- **Settings panel** — gear icon (appears on hover, bottom-right); change tile size and background speed, saved to `chrome.storage.sync`
- **Battery friendly** — animation pauses when the tab is hidden; respects `prefers-reduced-motion`
- **Frame-rate independent** — delta-time animation loop runs correctly on 60 Hz and 144 Hz screens

---

## Pages

| Page | Row 1 | Row 2 |
|------|-------|-------|
| **1** | Google · Gmail · Twitter · ChatGPT · Gemini · Claude | Strava · Speedtest · YouTube · GitHub · Apple Music · Incognito |
| **2** | JioHotstar · Prime Video · Plex · Apple TV+ · SonyLIV · ZEE5 | Netflix · Flipkart · Amazon · AJIO · Decathlon · The Souled Store |
| **3** | PVR · District · Proxy · *(9 empty)* | |

---

## Project Structure

```
orbit-new-tab/
├── manifest.json          MV3 — newtab override, storage + windows permissions
├── newtab.html            Page shell: canvas, nebula, pages container, settings panel
├── css/
│   └── styles.css         All styles — background, tiles, pages, dots, settings
├── js/
│   ├── stars.js           Canvas starfield — delta-time, parallax, shooting stars
│   └── app.js             Page builder, navigation, settings, storage
├── app-icons/             Bundled local icons (PNG/JPG/SVG)
└── icons/
    └── icon.svg           Extension icon
```

---

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `orbit-new-tab` folder
4. Open a new tab

To use the **Incognito** tile, go to the extension's Details page and enable **Allow in Incognito**.

---

## Settings

Open the gear icon (hover bottom-right corner):

| Setting | Options | Default |
|---------|---------|---------|
| Tile Size | Medium / Large / X-Large | Large |
| Background Speed | Slow / Normal / Fast | Fast |

---

## Tech Stack

- Plain HTML, CSS, JavaScript — no framework, no build step
- Canvas 2D API for the starfield
- CSS custom properties + `@keyframes` for nebula animation
- `chrome.storage.sync` for settings persistence
- `chrome.windows.create` for incognito window
- External icon sources: Clearbit Logo API + Google gstatic favicon service (with local PNG/JPG fallbacks)

---

## Browser Support

Chrome only (Manifest V3). Requires Chrome 88+.
