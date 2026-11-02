# Orbit New Tab

![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)

A Chrome extension (Manifest V3) that replaces the new tab page with an animated space background and app tiles.

---

## Features

### Space Background
- Animated starfield — 200 stars drift across the canvas with parallax depth (bigger/closer stars move faster)
- Twinkling stars — each star fades in and out on its own cycle
- Shooting meteors — 2 simultaneous comets with random colours (white, blue, violet, gold), firing every 0.5–1.5 s
- Drifting nebula clouds — 4 blurred gradient layers drift slowly across the background
- Two faint planets — one purple (bottom-right), one blue (top-left) add depth to the scene
- Mouse parallax — stars shift subtly as you move the cursor
- Pauses when the tab is hidden to save battery
- Respects `prefers-reduced-motion`
- Delta-time loop — consistent speed on 60 Hz and 144 Hz screens

### Multi-Page Layout
- 2 rows × 6 columns per page (12 slots)
- 3 pages total, auto-generated from the app list
- Circular scroll — scrolling past the last page wraps to page 1, and vice versa
- Smooth slide transition between pages with a purple warp pulse effect
- Wrap jumps use a fast fade+snap so they don't slide the full 200 vh distance

### Navigation
| Method | Action |
|--------|--------|
| Mouse wheel / touchpad | Scroll between pages |
| Swipe up / down | Touch / tablet support |
| Arrow Up / Down | Previous / next page |
| Page Up / Page Down | Previous / next page |
| Ctrl + 1 / 2 / 3 | Jump directly to a page |

### Page Indicator
- Vertical dots on the right edge — one per page
- Active dot pulses gently
- Click any dot to jump to that page
- Page counter (e.g. "2 / 3") shown below the dots

### App Tiles
- Icon-only display — no labels cluttering the grid
- Hover tooltip — the app name fades in below the icon on hover
- Spring entrance animation with wave stagger — centre tiles animate in first, edges follow
- Idle float — every icon gently bobs on its own timing, making the grid feel alive
- Hover effect — icon tilts 4° and scales up, glow pulses in the app's brand colour
- Idle glow — after 5 seconds of no interaction, a random tile on the current page pulses its glow colour one at a time
- Local bundled icons (PNG/JPG) with Clearbit → gstatic → fallback chain

### Quick Search
- Start typing anything and a search bar slides up from the centre of the screen
- Press **Enter** to search Google
- Press **Esc** or click outside to dismiss

### Settings Panel
Accessible via the gear icon (appears on hover, bottom-right corner):

| Setting | Options | Default |
|---------|---------|---------|
| Tile Size | Medium / Large / X-Large | Large |
| Background Speed | Slow / Normal / Fast | Fast |
| Nebula Colour | Hue slider 0–360° | 0° (purple/blue) |

All settings are saved to `chrome.storage.sync` and sync across Chrome devices.

### First-Run Hint
On first visit a subtle "↕ Scroll to switch pages" hint appears at the bottom for 3 seconds, then disappears permanently.

---

## Pages

| Page | Row 1 | Row 2 |
|------|-------|-------|
| **1** | Google · Gmail · Twitter · ChatGPT · Gemini · Claude | Strava · Speedtest · YouTube · GitHub · Apple Music · Incognito |
| **2** | JioHotstar · Prime Video · Plex · Apple TV+ · SonyLIV · ZEE5 | Netflix · Flipkart · Amazon · AJIO · Decathlon · The Souled Store |
| **3** | PVR · District · Proxy · LinkedIn · *(8 empty)* | |

---

## Project Structure

```
orbit-new-tab/
├── manifest.json             MV3 — newtab override, storage + windows permissions
├── newtab.html               Page shell: canvas, nebula, pages, settings, search bar
├── css/
│   └── styles.css            All styles — background, tiles, pages, dots, search, settings
├── js/
│   ├── stars.js              Canvas starfield — delta-time, parallax, shooting stars
│   └── app.js                Page builder, navigation, settings, search, idle glow
├── app-icons/                Bundled local icons (PNG/JPG/SVG)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png           Extension icon (generated via generate-icons.ps1)
└── generate-icons.ps1        PowerShell script to regenerate PNG extension icons
```

---

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `orbit-new-tab` folder
4. Open a new tab

> To use the **Incognito** tile, open the extension's Details page and enable **Allow in Incognito**.

---

## Tech Stack

- Plain HTML, CSS, JavaScript — no framework, no build step
- Canvas 2D API — starfield animation
- CSS custom properties + `@keyframes` — nebula drift, tile entrance, idle float, idle glow
- `chrome.storage.sync` — settings persistence
- `chrome.windows.create` — incognito window
- Icon sources: local files → Clearbit Logo API → Google gstatic favicon service
