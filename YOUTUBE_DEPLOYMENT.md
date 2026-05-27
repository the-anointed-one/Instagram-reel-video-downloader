# YouTube Extraction Deployment Guide

> **TL;DR:** YouTube blocking on live site? Add `YTDLP_PATH=./bin/yt-dlp` to your `.env` and configure YouTube authentication.

## Problem

YouTube extraction works locally but fails on production with:
```
Extraction Failed
Could not extract YouTube video.
```

## Root Causes

1. **Missing YTDLP_PATH**: The build script installs yt-dlp to `bin/yt-dlp`, but the code tries to run just `yt-dlp` from system PATH
2. **YouTube bot detection**: YouTube blocks requests from servers without valid authentication
3. **No fallback configured**: Cobalt API fallback not set up

## Solution

### Step 1: Fix YTDLP_PATH (Critical for Render/production)

Add to your `.env`:
```bash
YTDLP_PATH=./bin/yt-dlp
```

This tells the app where yt-dlp is located after the build script installs it.

### Step 2: Set Up YouTube Authentication (Required)

YouTube requires one of these:

#### Option A: Use Browser Cookies (Recommended for Render/Vercel)

1. **Export cookies from your browser:**
   - Install Chrome extension: [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/)
   - Go to https://www.youtube.com/
   - Click the extension, select YouTube domain, download `cookies.txt`

2. **Encode as base64 and set environment variable:**
   ```bash
   cat cookies.txt | base64 | pbcopy  # macOS
   cat cookies.txt | base64 -w0       # Linux
   ```

3. **Add to your `.env`:**
   ```bash
   YTDLP_COOKIES_CONTENT=base64:YOUR_BASE64_ENCODED_COOKIES_HERE
   ```
   Or paste raw content directly:
   ```bash
   YTDLP_COOKIES_CONTENT=domain .youtube.com	TRUE	/	FALSE	...
   ```

#### Option B: Upload cookies file (for traditional servers)

```bash
YTDLP_COOKIES_FILE=/absolute/path/to/cookies.txt
```

### Step 3: Set Up Cobalt API Fallback (Optional but recommended)

If yt-dlp still fails, use Cobalt as a backup:

1. **Deploy Cobalt on Railway (free):**
   - Go to https://railway.app/
   - Create new project → Deploy from GitHub
   - Repository: `https://github.com/imputnet/cobalt`
   - Click Deploy

2. **Add to your `.env`:**
   ```bash
   COBALT_API_URL=https://your-railway-instance.up.railway.app
   ```

## Deployment Checklist for Render

- [ ] Add `YTDLP_PATH=./bin/yt-dlp` to environment variables
- [ ] Add `YTDLP_COOKIES_CONTENT` with base64-encoded cookies
- [ ] (Optional) Add `COBALT_API_URL` for fallback
- [ ] Run build command: `bash backend/build.sh`
- [ ] Deploy and test with a YouTube short URL

## Troubleshooting

### Check yt-dlp installation
```bash
./bin/yt-dlp --version
```

### Test YouTube extraction locally
```bash
npm run dev
# Then POST to /api/download with YouTube URL
```

### Check extraction logs on Render
- Go to Render dashboard → Your service → Logs
- Filter for `[extractor]` logs to see detailed extraction steps

### YouTube still failing?

Try these debug steps:

1. **Test yt-dlp directly:**
   ```bash
   ./bin/yt-dlp --get-url "https://www.youtube.com/shorts/5XmQ2h2c5uQ"
   ```

2. **Check if cookies are loaded:**
   ```bash
   ./bin/yt-dlp --dump-json "https://www.youtube.com/shorts/5XmQ2h2c5uQ" | head -20
   ```

3. **Try android client:**
   ```bash
   ./bin/yt-dlp --get-url --extractor-args "youtube:player_client=android" "https://www.youtube.com/shorts/5XmQ2h2c5uQ"
   ```

## How Extraction Works Now

The app tries these strategies in order:

1. **Android client** → Often bypasses bot detection
2. **Web client + cookies** → If you have YTDLP_COOKIES_FILE/CONTENT set
3. **Browser cookies fallback** → Attempts to use Chrome cookies locally
4. **Cobalt API fallback** → If COBALT_API_URL is configured

If all fail, you get a helpful error message telling you to set up authentication.

## Advanced: Refresh Cookies Regularly

YouTube may require periodic cookie refresh. To automate:

1. Create a script that updates cookies weekly
2. Store the latest base64-encoded version in your `.env`
3. Redeploy when cookies expire

## References

- [yt-dlp FAQ: How to pass cookies](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp)
- [YouTube authentication issues](https://github.com/yt-dlp/yt-dlp/issues)
- [Cobalt Project](https://github.com/imputnet/cobalt)
