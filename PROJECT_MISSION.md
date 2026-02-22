# Instagram Reels Downloader — Project Mission

## What This Is
A full-stack tool that downloads Instagram Reels reliably using stealth browser automation and `yt-dlp`.

## Stack
| Layer | Technology |
|---|---|
| Frontend | Vite + React |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Stealth Scrape | Playwright + Stealth Plugin |
| Video Extraction | `yt-dlp` via `child_process` |

## Architecture
This project follows the **3-layer architecture** defined in `Machine instruction.md`:

- **Layer 1 — Directives** (`directives/`): Markdown SOPs for each workflow
- **Layer 2 — Orchestration** (you / Express controllers): intelligent routing between services
- **Layer 3 — Execution** (`execution/`): deterministic Node.js CLI scripts

## Core Features
1. **Stealth download** — Playwright fingerprint masking avoids bot detection
2. **Deduplication** — MongoDB `ReelLog` collection prevents re-downloading
3. **Resilient extraction** — `yt-dlp` via `child_process` as the primary download engine
4. **Full-stack UI** — React frontend for submitting URLs and viewing download history

## Directory Layout
```
.
├── Machine instruction.md   # AI operating instructions (source of truth)
├── CLAUDE.md / AGENTS.md / GEMINI.md  # mirrors
├── directives/              # Layer 1: SOPs
│   ├── download_reel.md
│   ├── dedup_check.md
│   ├── stealth_scrape.md
│   └── ytdlp_extract.md
├── execution/               # Layer 3: CLI scripts
│   ├── download_reel.js
│   └── check_duplicate.js
├── backend/                 # Express + Mongoose + Playwright
├── frontend/                # Vite + React
├── downloads/               # Output .mp4 files (gitignored)
├── .tmp/                    # Intermediates (gitignored)
├── .env                     # Secrets (gitignored)
└── .env.example             # Template
```

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- `yt-dlp`: `brew install yt-dlp`
- Playwright Chromium: `npx playwright install chromium`
