'use strict';

/**
 * backend/services/extractor.js
 *
 * Routes extraction to the correct platform-specific handler.
 *
 * Supported platforms:
 *   - instagram  → HTML/embed scraping → yt-dlp fallback
 *   - tiktok     → yt-dlp (no-watermark via API format)
 *   - facebook   → yt-dlp
 *   - youtube    → yt-dlp
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ── Config ───────────────────────────────────────────────────────
const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';
const YTDLP_TIMEOUT = 45000; // 45s — TikTok can be slow
// Optional: path to a Netscape-format cookies file (e.g. exported from browser)
// Set YTDLP_COOKIES_FILE in .env to enable cookie auth for YouTube/etc.
let YTDLP_COOKIES_FILE = process.env.YTDLP_COOKIES_FILE || null;
const COBALT_API_URL = process.env.COBALT_API_URL || null;

// For Vercel/Render, it's easier to paste the cookie file content as an environment variable:
if (!YTDLP_COOKIES_FILE && process.env.YTDLP_COOKIES_CONTENT) {
    try {
        YTDLP_COOKIES_FILE = path.join(os.tmpdir(), 'ytdlp_cookies.txt');
        // Decode base64 if user encoded it, otherwise assume raw string
        const content = process.env.YTDLP_COOKIES_CONTENT.trim();
        const decodedContent = content.startsWith('base64:') 
            ? Buffer.from(content.replace('base64:', ''), 'base64').toString('utf8')
            : content;
            
        fs.writeFileSync(YTDLP_COOKIES_FILE, decodedContent, { encoding: 'utf8', mode: 0o600 });
        console.log(`[extractor] Wrote cookies from YTDLP_COOKIES_CONTENT to ${YTDLP_COOKIES_FILE}`);
    } catch (err) {
        console.error('[extractor] Failed to write cookies file from ENV:', err.message);
        YTDLP_COOKIES_FILE = null;
    }
}

const REQUEST_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
    Connection: 'keep-alive',
};

// ── Generic Helpers ──────────────────────────────────────────────

function safeJsonParse(str) {
    try { return JSON.parse(str); } catch { return null; }
}

function findVideoUrl(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 10) return null;
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            if ((key === 'video_url' || key === 'contentUrl') && value.startsWith('http')) return value;
            if (key === 'url' && value.includes('.mp4')) return value;
        } else if (typeof value === 'object') {
            const found = findVideoUrl(value, depth + 1);
            if (found) return found;
        }
    }
    return null;
}

// ── Cookie Helper ────────────────────────────────────────────────
function buildCookieArgs() {
    if (YTDLP_COOKIES_FILE) {
        return ['--cookies', YTDLP_COOKIES_FILE];
    }
    return [];
}

// ── yt-dlp Wrapper ───────────────────────────────────────────────

/**
 * Run yt-dlp with given extra args and return the first video URL.
 */
function runYtDlp(url, extraArgs = [], attemptBrowserCookies = true) {
    return new Promise((resolve, reject) => {
        const baseArgs = [
            '--get-url',
            '--no-warnings',
            '--no-playlist',
            '--format', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best',
        ];
        
        const cookieArgs = buildCookieArgs();
        let args = [...baseArgs, ...cookieArgs, ...extraArgs, url];

        console.log(`[extractor] yt-dlp args: ${args.join(' ')}`);

        execFile(YTDLP_PATH, args, { timeout: YTDLP_TIMEOUT }, (err, stdout, stderr) => {
            if (err) {
                // Fallback to browser cookies if no custom cookie file was set and we haven't tried yet
                if (cookieArgs.length === 0 && attemptBrowserCookies) {
                    console.log(`[extractor] Auth/Extract failed, retrying with --cookies-from-browser chrome for ${url}`);
                    return runYtDlp(url, [...extraArgs, '--cookies-from-browser', 'chrome'], false)
                        .then(resolve)
                        .catch((fallbackErr) => {
                            reject(new Error(
                                `yt-dlp extraction failed: ${fallbackErr.message}\n\n` +
                                `Fix: Export cookies to a file and set YTDLP_COOKIES_FILE=/path/to/cookies.txt in your .env. ` +
                                `See https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp`
                            ));
                        });
                }
                
                console.log('[extractor] yt-dlp error:', err.message);
                if (stderr) console.log('[extractor] yt-dlp stderr:', stderr.trim().slice(0, 500));
                return reject(new Error(`yt-dlp extraction failed: ${err.message}`));
            }
            
            const urls = stdout.trim().split('\n').filter(Boolean);
            if (urls.length > 0 && urls[0].startsWith('http')) {
                resolve(urls[0]);
            } else {
                reject(new Error('yt-dlp returned no URL'));
            }
        });
    });
}

// ── yt-dlp JSON Metadata ─────────────────────────────────────────

function runYtDlpJson(url, extraArgs = []) {
    return new Promise((resolve, reject) => {
        const cookieArgs = buildCookieArgs();
        // If we want a browser fallback for metadata, we could add it, but usually standard cookies are fine
        const args = [
            '--dump-json',
            '--no-warnings',
            '--no-playlist',
            ...cookieArgs,
            ...extraArgs,
            url,
        ];

        execFile(YTDLP_PATH, args, { timeout: YTDLP_TIMEOUT }, (err, stdout) => {
            if (err) return reject(new Error('yt-dlp JSON failed'));
            const data = safeJsonParse(stdout.trim());
            if (data) resolve(data);
            else reject(new Error('yt-dlp returned invalid JSON'));
        });
    });
}

// ── Cobalt API Fallback ──────────────────────────────────────────

/**
 * Fallback to a self-hosted or public Cobalt API instance if configured.
 */
async function fetchFromCobalt(url) {
    if (!COBALT_API_URL) return null;
    try {
        console.log('[extractor] Attempting Cobalt API fallback for:', url);
        const res = await axios.post(
            COBALT_API_URL, 
            { url },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );
        
        // Cobalt v11 returns { url: "..." } on success
        if (res.data && res.data.url) {
            console.log('[extractor] ✅ Cobalt API extraction succeeded');
            return res.data.url;
        }
        return null;
    } catch (err) {
        console.log('[extractor] Cobalt fallback failed:', err.response?.data || err.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// INSTAGRAM
// ═══════════════════════════════════════════════════════════════

function extractFromLdJson($) {
    const scripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
        const raw = $(scripts[i]).html();
        if (!raw) continue;
        const parsed = safeJsonParse(raw);
        if (!parsed) continue;
        const videoUrl = findVideoUrl(parsed);
        if (videoUrl) return videoUrl;
    }
    return null;
}

function extractFromScriptTags($) {
    const scripts = $('script:not([src])');
    for (let i = 0; i < scripts.length; i++) {
        const raw = $(scripts[i]).html() || '';
        if (!raw.includes('video_url')) continue;
        const jsonMatches = raw.match(/\{[^{}]*"video_url"[^{}]*\}/g) || [];
        for (const chunk of jsonMatches) {
            const parsed = safeJsonParse(chunk);
            if (parsed?.video_url) return parsed.video_url;
        }
        const parsed = safeJsonParse(raw);
        if (parsed) {
            const videoUrl = findVideoUrl(parsed);
            if (videoUrl) return videoUrl;
        }
    }
    return null;
}

function extractFromRawHtml(html) {
    const match = html.match(/"video_url"\s*:\s*"([^"]+)"/);
    if (match) {
        try { return JSON.parse(`"${match[1]}"`); } catch { return match[1]; }
    }
    const contentUrlMatch = html.match(/"contentUrl"\s*:\s*"([^"]+\.mp4[^"]*)"/);
    if (contentUrlMatch) {
        try { return JSON.parse(`"${contentUrlMatch[1]}"`); } catch { return contentUrlMatch[1]; }
    }
    return null;
}

async function tryCheerioExtraction(url) {
    try {
        const response = await axios.get(url, {
            headers: REQUEST_HEADERS,
            timeout: 10000,
            maxRedirects: 3,
            validateStatus: (s) => s < 500,
        });
        if (response.status === 404) throw new Error('Reel not found (404).');
        if (response.status === 403 || response.status === 401) throw new Error('Reel is private or requires auth.');
        if (response.status !== 200) return null;
        const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const $ = cheerio.load(html);
        return extractFromLdJson($) || extractFromScriptTags($) || extractFromRawHtml(html) || null;
    } catch (err) {
        if (err.message.includes('not found') || err.message.includes('private')) throw err;
        console.log('[extractor] Cheerio strategy failed:', err.message);
        return null;
    }
}

async function tryEmbedExtraction(url) {
    try {
        const shortcodeMatch = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
        if (!shortcodeMatch) return null;
        const shortcode = shortcodeMatch[2];
        const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/`;
        const response = await axios.get(embedUrl, {
            headers: { ...REQUEST_HEADERS, 'Referer': 'https://www.instagram.com/' },
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: (s) => s < 500,
        });
        if (response.status !== 200) return null;
        const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const videoSrcMatch = html.match(/<video[^>]*src=["']([^"']+)["']/i);
        if (videoSrcMatch?.[1]?.startsWith('http')) return videoSrcMatch[1];
        const dataVideoMatch = html.match(/data-video-url=["']([^"']+)["']/i);
        if (dataVideoMatch) return dataVideoMatch[1];
        const inlineVideoMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/);
        if (inlineVideoMatch) {
            try { return JSON.parse(`"${inlineVideoMatch[1]}"`); } catch { return inlineVideoMatch[1]; }
        }
        const mp4Match = html.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/i);
        if (mp4Match) return mp4Match[1];
        const $ = cheerio.load(html);
        return extractFromLdJson($) || extractFromScriptTags($) || extractFromRawHtml(html) || null;
    } catch (err) {
        console.log('[extractor] Embed strategy failed:', err.message);
        return null;
    }
}

async function fetchOembedMetadata(url) {
    try {
        const cleanUrl = url.split('?')[0];
        const res = await axios.get(
            `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(cleanUrl)}`,
            { timeout: 5000 }
        );
        return {
            title: res.data.title || 'Instagram Reel',
            caption: res.data.title || null,
            thumbnail: res.data.thumbnail_url || null,
            author: res.data.author_name || null,
        };
    } catch {
        return { title: 'Instagram Reel', caption: null, thumbnail: null, author: null };
    }
}

async function extractInstagram(url) {
    const metadataPromise = fetchOembedMetadata(url);

    let videoUrl = null;
    try {
        videoUrl = await tryCheerioExtraction(url);
        if (videoUrl) console.log('[extractor] ✅ Instagram Cheerio extraction succeeded');
    } catch (err) {
        if (err.message.includes('not found') || err.message.includes('private')) throw err;
    }

    if (!videoUrl) {
        try {
            videoUrl = await tryEmbedExtraction(url);
            if (videoUrl) console.log('[extractor] ✅ Instagram embed extraction succeeded');
        } catch (err) {
            console.log('[extractor] Embed extraction failed:', err.message);
        }
    }

    if (!videoUrl) {
        try {
            console.log('[extractor] Instagram HTML strategies failed, falling back to yt-dlp...');
            videoUrl = await runYtDlp(url, ['--no-check-certificate']);
            console.log('[extractor] ✅ Instagram yt-dlp extraction succeeded');
        } catch (err) {
            console.log('[extractor] yt-dlp failed:', err.message);
        }
    }

    if (!videoUrl) {
        videoUrl = await fetchFromCobalt(url);
    }

    if (!videoUrl) {
        throw new Error(
            'Could not extract video URL. The Reel may be private, deleted, or Instagram has updated their page structure.'
        );
    }

    const metadata = await metadataPromise;
    return { videoUrl, ...metadata };
}

// ═══════════════════════════════════════════════════════════════
// TIKTOK — no-watermark via yt-dlp aweme API format
// ═══════════════════════════════════════════════════════════════

async function extractTikTok(url) {
    console.log('[extractor] Extracting TikTok video (no-watermark):', url);

    const extraArgs = [
        '--no-check-certificate',
        '--extractor-args', 'tiktok:api_hostname=api22-normal-c-useast2a.tiktokv.com',
    ];

    let videoUrl;
    try {
        // Prefer the play_addr (no-watermark) download URL
        videoUrl = await runYtDlp(url, extraArgs);
        console.log('[extractor] ✅ TikTok yt-dlp extraction succeeded');
    } catch (err) {
        console.log('[extractor] TikTok yt-dlp failed:', err.message);
    }

    if (!videoUrl) {
        videoUrl = await fetchFromCobalt(url);
    }

    if (!videoUrl) {
        throw new Error(`Could not extract TikTok video.`);
    }

    // Fetch basic metadata via yt-dlp JSON
    let metadata = { title: 'TikTok Video', caption: null, thumbnail: null, author: null };
    try {
        const json = await runYtDlpJson(url, extraArgs);
        metadata = {
            title: json.title || json.description || 'TikTok Video',
            caption: json.description || null,
            thumbnail: json.thumbnail || null,
            author: json.uploader || json.creator || null,
        };
    } catch {
        // metadata is optional
    }

    return { videoUrl, ...metadata };
}

// ═══════════════════════════════════════════════════════════════
// FACEBOOK
// ═══════════════════════════════════════════════════════════════

async function extractFacebook(url) {
    console.log('[extractor] Extracting Facebook video:', url);

    const extraArgs = ['--no-check-certificate'];

    let videoUrl;
    try {
        videoUrl = await runYtDlp(url, extraArgs);
        console.log('[extractor] ✅ Facebook yt-dlp extraction succeeded');
    } catch (err) {
        console.log('[extractor] Facebook yt-dlp failed:', err.message);
    }

    if (!videoUrl) {
        videoUrl = await fetchFromCobalt(url);
    }

    if (!videoUrl) {
        throw new Error(`Could not extract Facebook video.`);
    }

    let metadata = { title: 'Facebook Video', caption: null, thumbnail: null, author: null };
    try {
        const json = await runYtDlpJson(url, extraArgs);
        metadata = {
            title: json.title || 'Facebook Video',
            caption: json.description || null,
            thumbnail: json.thumbnail || null,
            author: json.uploader || null,
        };
    } catch {
        // metadata is optional
    }

    return { videoUrl, ...metadata };
}

// ═══════════════════════════════════════════════════════════════
// YOUTUBE SHORTS
// ═══════════════════════════════════════════════════════════════

async function extractYouTube(url) {
    console.log('[extractor] Extracting YouTube video:', url);

    // Strategy 1: Try android client first (sometimes bypasses bot detection)
    let videoUrl;
    const androidArgs = [
        '--no-check-certificate',
        '--extractor-args', 'youtube:player_client=android'
    ];

    try {
        videoUrl = await runYtDlp(url, androidArgs);
        console.log('[extractor] ✅ YouTube extraction succeeded (android client)');
    } catch (err) {
        console.log('[extractor] Android client failed:', err.message);
    }

    // Strategy 2: Try with web client + cookies if available
    if (!videoUrl && YTDLP_COOKIES_FILE) {
        try {
            console.log('[extractor] Retrying YouTube with cookies...');
            videoUrl = await runYtDlp(url, ['--no-check-certificate']);
            console.log('[extractor] ✅ YouTube extraction succeeded (with cookies)');
        } catch (err) {
            console.log('[extractor] Web client with cookies failed:', err.message);
        }
    }

    // Strategy 3: Try browser cookies fallback
    if (!videoUrl && !YTDLP_COOKIES_FILE) {
        try {
            console.log('[extractor] Attempting browser cookies fallback...');
            videoUrl = await runYtDlp(url, ['--cookies-from-browser', 'chrome']);
            console.log('[extractor] ✅ YouTube extraction succeeded (browser cookies)');
        } catch (err) {
            console.log('[extractor] Browser cookies fallback failed:', err.message);
        }
    }

    // Strategy 4: Fallback to Cobalt API
    if (!videoUrl) {
        console.log('[extractor] yt-dlp failed, trying Cobalt API fallback...');
        videoUrl = await fetchFromCobalt(url);
        if (videoUrl) console.log('[extractor] ✅ YouTube extraction succeeded (Cobalt API)');
    }

    if (!videoUrl) {
        throw new Error(
            `Could not extract YouTube video. YouTube requires authentication due to bot detection. ` +
            `Please set YTDLP_COOKIES_CONTENT or configure a Cobalt API fallback.`
        );
    }

    let metadata = { title: 'YouTube Short', caption: null, thumbnail: null, author: null };
    try {
        const json = await runYtDlpJson(url, androidArgs);
        metadata = {
            title: json.title || 'YouTube Short',
            caption: json.description || null,
            thumbnail: json.thumbnail || null,
            author: json.uploader || json.channel || null,
        };
    } catch {
        // metadata is optional
    }

    return { videoUrl, ...metadata };
}

// ═══════════════════════════════════════════════════════════════
// Platform Router
// ═══════════════════════════════════════════════════════════════

/**
 * Extract video URL and metadata from any supported platform.
 * @param {string} url       — Normalised URL
 * @param {string} platform  — 'instagram' | 'tiktok' | 'facebook' | 'youtube'
 * @returns {Promise<{ videoUrl, thumbnail, caption, title, author }>}
 */
async function extractVideoData(url, platform) {
    switch (platform) {
        case 'instagram':
            return extractInstagram(url);
        case 'tiktok':
            return extractTikTok(url);
        case 'facebook':
            return extractFacebook(url);
        case 'youtube':
            return extractYouTube(url);
        default:
            throw new Error(`Unknown platform: ${platform}`);
    }
}

// Keep legacy export name for backward compat
async function extractReelData(url) {
    return extractVideoData(url, 'instagram');
}

module.exports = { extractVideoData, extractReelData };
