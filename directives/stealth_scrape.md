# Directive: Stealth Scrape (Playwright + Antigravity)

## Goal
Use a headless Chromium browser with stealth fingerprint masking to open an Instagram Reel page and intercept the raw video stream URL without triggering bot detection.

## Inputs
- `url` (string) — Instagram Reel URL

## Tools / Scripts
- `backend/src/services/stealthService.js`
- Dependencies: `playwright-extra`, `puppeteer-extra-plugin-stealth`

## Steps
1. Launch `chromium` via `playwright-extra` with `StealthPlugin` applied
2. Set a realistic `userAgent` (desktop Chrome, latest version)
3. Set `viewport` to `1280x800`, locale `en-US`
4. Intercept network requests: listen for `XHR` or `Fetch` responses matching `*.mp4` or `instagram.com/api/v1/media/`
5. Navigate to the Reel URL and wait for `networkidle`
6. Extract intercepted video URL from response headers or body
7. Close browser and return stream URL

## Outputs
- `streamUrl` (string) — direct video stream URL, or `null` if not found

## Edge Cases
- Login wall / requires auth → return `null`; caller falls back to `yt-dlp` directly on the original URL
- Timeout (>30s) → close browser, throw `ScrapeTimeoutError`
- Detected as bot → randomize delays (`300–800ms`) between actions, rotate `userAgent`

## Stealth Fingerprint Checklist
- `navigator.webdriver` → `false`
- `navigator.plugins` → realistic plugin list
- Canvas/WebGL fingerprint noise → handled by StealthPlugin
- `permissions.query({name:'notifications'})` → `denied`

## Learnings
_(Update this section as you discover new bot detection triggers)_
