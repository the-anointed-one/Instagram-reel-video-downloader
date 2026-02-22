'use strict';

/**
 * backend/services/extractor.js
 *
 * Fetches a public Instagram Reel's video URL and metadata.
 *
 * Strategies (in order):
 *   1. HTML fetch + Cheerio parse (ld+json, script tags, regex) — fast, no deps
 *   2. yt-dlp via child_process — reliable, handles JS-rendered pages
 *
 * Metadata is enriched via Instagram's oEmbed API when available.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { execFile } = require('child_process');
const path = require('path');

// ── Config ───────────────────────────────────────────────────────
const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';
const YTDLP_TIMEOUT = 15000; // 15s max

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

// ── Helpers ──────────────────────────────────────────────────────

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

// ── Strategy 1: Cheerio HTML parsing ─────────────────────────────

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

        const videoUrl = extractFromLdJson($) || extractFromScriptTags($) || extractFromRawHtml(html);
        return videoUrl || null;
    } catch (err) {
        // Re-throw specific errors (404, 403)
        if (err.message.includes('not found') || err.message.includes('private')) throw err;
        console.log('[extractor] Cheerio strategy failed:', err.message);
        return null;
    }
}

// ── Strategy 2: yt-dlp ───────────────────────────────────────────

function extractWithYtDlp(url) {
    return new Promise((resolve, reject) => {
        const args = [
            '--get-url',
            '--no-warnings',
            '--no-playlist',
            '--format', 'best[ext=mp4]/best',
            url,
        ];

        const child = execFile(YTDLP_PATH, args, { timeout: YTDLP_TIMEOUT }, (err, stdout, stderr) => {
            if (err) {
                console.log('[extractor] yt-dlp failed:', err.message);
                if (stderr) console.log('[extractor] yt-dlp stderr:', stderr.trim());
                return reject(new Error('yt-dlp extraction failed'));
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

// ── Metadata: oEmbed API ─────────────────────────────────────────

async function fetchOembedMetadata(url) {
    try {
        const cleanUrl = url.split('?')[0]; // Strip query params
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

// ── Main Extractor ───────────────────────────────────────────────

/**
 * Extract video URL and metadata from a public Instagram Reel.
 * @param {string} url — normalized Instagram Reel URL
 */
async function extractReelData(url) {
    // 1. Fetch metadata via oEmbed (fast, reliable, runs in parallel)
    const metadataPromise = fetchOembedMetadata(url);

    // 2. Try Cheerio HTML extraction first (fastest, no external deps)
    let videoUrl = null;
    try {
        videoUrl = await tryCheerioExtraction(url);
        if (videoUrl) console.log('[extractor] ✅ Cheerio extraction succeeded');
    } catch (err) {
        // 404/403 errors should propagate immediately
        if (err.message.includes('not found') || err.message.includes('private')) throw err;
    }

    // 3. Fall back to yt-dlp if Cheerio didn't find a URL
    if (!videoUrl) {
        try {
            console.log('[extractor] Cheerio found no video data, falling back to yt-dlp...');
            videoUrl = await extractWithYtDlp(url);
            console.log('[extractor] ✅ yt-dlp extraction succeeded');
        } catch {
            // Both strategies failed
        }
    }

    if (!videoUrl) {
        throw new Error(
            'Could not extract video URL. The Reel may be private, deleted, or Instagram has updated their page structure.'
        );
    }

    const metadata = await metadataPromise;

    return {
        videoUrl,
        thumbnail: metadata.thumbnail,
        caption: metadata.caption,
        title: metadata.title,
        author: metadata.author,
    };
}

module.exports = { extractReelData };
