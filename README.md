# ReelFetch 🎬

> Production-ready Instagram Reel video URL extractor — Next.js frontend + Express/Redis backend.

## Features

- **Instant extraction** — fetches video URL from public Reel pages
- **24-hour Redis cache** — rapid repeat lookups
- **Rate limiting** — 20 req/IP/15min via express-rate-limit
- **Helmet security** — hardened HTTP headers
- **No video storage** — returns direct CDN link only
- **Dark glassmorphism UI** — Next.js App Router + TailwindCSS

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| Redis | ≥ 7 | `brew install redis` |

---

## Project Structure

```
.
├── backend/
│   ├── index.js                   # Express entry
│   ├── routes/download.js         # POST /api/download
│   ├── services/
│   │   ├── extractor.js           # HTML fetch + Cheerio parse
│   │   └── cache.js               # ioredis wrapper
│   ├── middleware/rateLimiter.js
│   └── utils/validateUrl.js
│
├── frontend/
│   ├── src/app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Homepage
│   │   ├── globals.css
│   │   └── terms/page.tsx         # Terms & DMCA
│   ├── src/components/
│   │   ├── DownloadForm.tsx
│   │   ├── VideoPreview.tsx
│   │   └── ErrorAlert.tsx
│   └── src/api/client.ts
│
├── directives/                    # Layer 1: SOPs
├── execution/                     # Layer 3: CLI scripts
├── .env.example
└── README.md
```

---

## Local Development

### 1. Clone & install

```bash
git clone <your-repo>
cd "Instagram reel downloader"

# Backend
cd backend
cp .env.example .env   # edit as needed
npm install
npm run dev            # starts on :3001

# Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev            # starts on :3000
```

### 2. Start Redis

```bash
brew services start redis
# or:
redis-server
```

### 3. Open the app

Visit [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Express server port |
| `NODE_ENV` | `development` | Environment |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `RATE_LIMIT_MAX` | `20` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Window in ms (15 min) |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API base URL |

---

## Deployment

### Render (Recommended)

#### Backend
1. Create a new **Web Service** on [render.com](https://render.com)
2. Root directory: `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add a **Redis** instance from Render's add-ons
6. Set env vars: `REDIS_URL` (from Render Redis), `FRONTEND_URL`, `NODE_ENV=production`

#### Frontend
1. Create a new **Static Site** or **Web Service**
2. Root directory: `frontend/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start` (for Web Service)
5. Set env var: `NEXT_PUBLIC_API_URL` = your backend Render URL

---

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login

# Backend
cd backend
railway init
railway up
railway variables set REDIS_URL=... FRONTEND_URL=...

# Add Redis plugin from Railway dashboard

# Frontend
cd frontend
railway init
railway up
railway variables set NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

---

### VPS (Ubuntu/Debian)

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs redis-server

# Install PM2
sudo npm i -g pm2

# Backend
cd backend
cp .env.example .env && nano .env
npm install
pm2 start index.js --name reelfetch-api
pm2 save

# Frontend
cd frontend
cp .env.local.example .env.local && nano .env.local
npm install && npm run build
pm2 start npm --name reelfetch-frontend -- start
pm2 save

# Nginx reverse proxy (optional)
# proxy / → :3000, /api → :3001
```

---

## API Reference

### `POST /api/download`

**Request:**
```json
{ "url": "https://www.instagram.com/reel/ABC123/" }
```

**Success response:**
```json
{
  "success": true,
  "cached": false,
  "videoUrl": "https://scontent.cdninstagram.com/...",
  "thumbnail": "https://...",
  "caption": "Reel caption text",
  "title": "Instagram Reel"
}
```

**Error response:**
```json
{ "success": false, "error": "This Reel is private or requires authentication." }
```

### `GET /api/health`
```json
{ "status": "ok", "timestamp": "2026-02-19T..." }
```

---

## Important Constraints

- ❌ Does **not** proxy or stream video through server
- ❌ Does **not** store video files
- ❌ Does **not** automate login
- ❌ Does **not** bypass private account protections
- ✅ Only processes publicly accessible Reel URLs
