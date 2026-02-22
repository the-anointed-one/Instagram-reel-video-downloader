# Directive: Download a Single Instagram Reel

## Goal
Accept a public Instagram Reel URL, check for duplicates, scrape the video stream URL using stealth Playwright, extract the final video with `yt-dlp`, save to disk, and log the result to MongoDB.

## Inputs
- `url` (string) — a valid Instagram Reel URL, e.g. `https://www.instagram.com/reel/ABC123/`

## Tools / Scripts
- `execution/check_duplicate.js` — duplicate check
- `execution/download_reel.js` — full pipeline (stealth scrape + yt-dlp)
- Backend services: `dedupService`, `stealthService`, `ytdlpService`

## Steps (Orchestration Layer)
1. Validate the URL format (`/reel/` path required)
2. Call `dedupService.check(url)` → if duplicate, return cached log entry
3. Call `stealthService.getStreamUrl(url)` → returns raw stream URL or null
4. Call `ytdlpService.download(url, outputPath)` → downloads using yt-dlp
5. Save `ReelLog` entry to MongoDB: `{ url, filename, status: 'success' }`
6. Return filename and download path to caller

## Outputs
- Downloaded `.mp4` file in `DOWNLOAD_DIR`
- `ReelLog` document in MongoDB

## Edge Cases
- Private or deleted Reels → `stealthService` will throw; catch and log `status: 'failed'`
- `yt-dlp` not installed → ytdlpService throws `ENOENT`; check PATH and `YTDLP_PATH` env var
- Rate limiting → Playwright may receive a login wall; add random delay and retry once

## Learnings
_(Update this section as you discover new API constraints or edge cases)_
