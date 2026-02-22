# Directive: yt-dlp Video Extraction

## Goal
Use `yt-dlp` via Node.js `child_process.spawn` to download the final video file from an Instagram Reel URL. This is the primary extraction method — more resilient than JS-only scrapers.

## Inputs
- `url` (string) — Instagram Reel URL (or direct stream URL from stealthService)
- `outputPath` (string) — absolute path for the output file (e.g. `./downloads/ABC123.mp4`)

## Tools / Scripts
- `backend/src/services/ytdlpService.js`
- Binary: `yt-dlp` (installed on host, path set via `YTDLP_PATH` env var)

## Steps
1. Resolve `YTDLP_PATH` from env (fallback: `yt-dlp` on PATH)
2. Construct args:
   ```
   yt-dlp
     --output <outputPath>
     --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
     --merge-output-format mp4
     --no-playlist
     --quiet --progress
     <url>
   ```
3. Spawn process, pipe `stdout`/`stderr` to caller via event emitter
4. On `close` with code `0` → resolve with `{ success: true, filename }`
5. On non-zero exit → reject with `{ success: false, error: stderr }`

## Outputs
- `.mp4` file written to `DOWNLOAD_DIR`
- `{ success: boolean, filename: string, error?: string }`

## Edge Cases
- `yt-dlp` not found → `ENOENT` error; instruct user: `brew install yt-dlp`
- Private Reel → yt-dlp exits non-zero with "login required" in stderr
- Geo-block → retry with `--proxy` arg if proxy URL is configured
- Large file timeout → spawn with no timeout; stream progress events to frontend via SSE

## Learnings
_(Update this section when you discover new yt-dlp flags or constraints)_
