# ReelFetch — Roadmap & Remaining Work

Reference doc for the multi-tool platform expansion. The downloader is the
original product; everything under `/tools` was added on top of it, additively.

_Last updated: 2026-08-01 (first platform deploy — commit `f8c496a`)._

---

## ✅ Done (live as of the first platform deploy)

- **10 client-side tools** (no backend, no cost): word counter, QR generator,
  image compressor/resizer/converter/watermark, and video
  trimmer/compressor/converter/audio-extractor (in-browser ffmpeg.wasm,
  single-threaded core — no COOP/COEP, so the main site is unaffected).
- **Provider-backed tools** (graceful 503 until keys set): 7 LLM tools (Claude),
  AI text + image detectors (Copyleaks / Sightengine), subtitle generator
  (Deepgram → SRT/VTT).
- **Platform**: `/tools` hub, homepage tools showcase, per-tool SEO (unique
  content + FAQ + `SoftwareApplication`/`FAQPage`/`BreadcrumbList` JSON-LD +
  breadcrumbs + related tools), sitemap coverage.
- **Backend hardening**: isolated tools router, input caps, Redis result
  caching, monthly per-provider spend caps, per-IP free-tier gate (Phase A of
  the paywall, OFF by default via `TOOLS_FREE_DAILY=0`).
- **Draggable video-trimmer UI**.

---

## 🔴 Immediate (post-deploy)

1. **Add API keys to the Render dashboard** (they're only in local `.env`).
   Until then, provider tools show "being set up" in production:
   `ANTHROPIC_API_KEY`, `AI_MODEL=claude-haiku-4-5`, `SIGHTENGINE_USER`,
   `SIGHTENGINE_SECRET`, `DEEPGRAM_API_KEY`, `TOOLS_FREE_DAILY=0`.
2. **Add Anthropic credits** — account is at $0; LLM tools error until funded.
3. **Verify the deploy**: downloader (`reelfetch.xyz`) still works + `/tools` loads.
4. **Live-test each provider tool on prod** (only Sightengine + the gate were
   tested locally; Claude/Deepgram untested end-to-end).

## 🟡 Blocked on others

5. **Copyleaks approval** → unlocks AI Text Detector + Plagiarism Checker.

## ⬜ Tools not built yet ("Soon")

6. **Plagiarism Checker** (Copyleaks adapter exists — needs route + page).
7. **AI Humanizer**.
8. **Background Remover + Image Upscaler** (decide: client-side WASM model vs paid API).

## 💳 Paywall — Phase B (monetization half)

> Phase A (enforcement/metering) is built. Provider chosen: **Paystack**
> (Nigeria-native; LemonSqueezy can't reliably pay out to Nigeria).

9. **Supabase** project (accounts + entitlements DB) + magic-link login.
10. **Paystack**: Pro plan + subscription checkout + webhook + entitlement check
    (wire `isPro` into the free-tier gate — hook already in place in
    `backend/routes/tools.js` → `blockedByFreeTier`).
11. **Upgrade UI**: pricing page, "Upgrade to Pro" CTA on the 402 response, login flow.
12. Then flip `TOOLS_FREE_DAILY` to a real number (e.g. `3`).

## 📈 SEO / growth (ongoing, not code)

13. Off-page: submit to tool directories, Product Hunt, AlternativeTo.
14. Blog → tool funnel ("how to" posts linking to tools).
15. Per-tool OG images (dynamic `next/og`) for social CTR.

## 🔧 Polish / hardening

16. **Self-host the ffmpeg core** (currently loads from unpkg CDN — robustness).
17. **Update Terms/Privacy** — site now processes user uploads + AI; terms are
    download-only.
18. **YouTube URL-mode subtitles**: proxy-buffer audio to Deepgram instead of
    passing the IP-signed CDN URL (which Deepgram can't fetch).
19. **Real-browser test** of the ffmpeg video tools (build verified; actual
    transcode not driven yet).
20. **Cleanup**: `frontend/.env.local` (localhost URL) + `tsconfig.tsbuildinfo`
    shouldn't be in git; two `package-lock.json` files cause the Vercel
    workspace-root warning.
21. **Reconcile stale docs**: `PROJECT_MISSION.md` / `CLAUDE.md` still describe
    the old MongoDB/Playwright/Vite stack (actual stack: Next.js + Express +
    Redis + yt-dlp).

## ⚙️ Known operational notes

- **Rate limiter** intentionally tight (20 req / 15 min per IP) for small infra.
- **Backend stays lightweight** by design — all heavy media work (video) runs
  client-side in the browser, never on Render.
- **Cost controls**: per-provider monthly caps (`TOOLS_MONTHLY_MAX_CHECKS`),
  per-call input caps, Redis caching so repeats don't re-bill.
