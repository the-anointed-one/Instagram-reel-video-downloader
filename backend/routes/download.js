'use strict';

/**
 * backend/routes/download.js
 *
 * POST /api/download          — extract video metadata + stream URL
 * GET  /api/proxy-download    — pipe remote video/audio through backend (bypasses CORS/IP restrictions)
 * POST /api/download/audio    — extract audio URL
 * Supports: Instagram, TikTok, Facebook, YouTube
 */

const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { validateReelUrl } = require('../utils/validateUrl');
const { extractVideoData, extractAudioUrl } = require('../services/extractor');
const cache = require('../services/cache');

const router = express.Router();

// ── Allowed CDN hostnames for proxy (SSRF guard) ───────────────────
const ALLOWED_PROXY_HOSTS = [
    'googlevideo.com',
    'youtube.com',
    'ytimg.com',
    'cdninstagram.com',
    'instagram.com',
    'tiktokcdn.com',
    'tiktokv.com',
    'fbcdn.net',
    'facebook.com',
    'twimg.com',
    'twitter.com',
    'pinimg.com',
    'redd.it',
    'redditmedia.com',
    'reddituploads.com',
    'vimeocdn.com',
    'akamaized.net',
    'cloudfront.net',
];

function isAllowedProxyHost(hostname) {
    return ALLOWED_PROXY_HOSTS.some(
        (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
}

/**
 * GET /api/proxy-download?url=<encoded>&filename=<name>
 *
 * Fetches the remote video/audio through the server and pipes it to the client.
 * This is necessary because YouTube CDN URLs are IP-signed — browsers cannot
 * directly download cross-origin CDN URLs with the `download` attribute.
 */
router.get('/proxy-download', async (req, res) => {
    const { url: rawUrl, filename = 'video.mp4' } = req.query;

    if (!rawUrl) {
        return res.status(400).json({ success: false, error: 'Missing url parameter.' });
    }

    let targetUrl;
    try {
        targetUrl = new URL(decodeURIComponent(rawUrl));
    } catch {
        return res.status(400).json({ success: false, error: 'Invalid URL.' });
    }

    // SSRF guard — only allow known CDN hostnames
    if (!isAllowedProxyHost(targetUrl.hostname)) {
        return res.status(403).json({ success: false, error: 'Proxy not allowed for this host.' });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
    const protocol = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = protocol.get(
        targetUrl.toString(),
        {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ReelFetch/1.0)',
                'Range': req.headers['range'] || '',
            },
        },
        (proxyRes) => {
            // Follow one redirect (Google CDN often redirects)
            if ((proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307) && proxyRes.headers.location) {
                proxyRes.destroy();
                // Recurse with redirect URL — but validate first
                let redirectUrl;
                try {
                    redirectUrl = new URL(proxyRes.headers.location);
                } catch {
                    return res.status(502).json({ success: false, error: 'Bad redirect from CDN.' });
                }
                if (!isAllowedProxyHost(redirectUrl.hostname)) {
                    return res.status(403).json({ success: false, error: 'Redirect to disallowed host.' });
                }
                const redirectProto = redirectUrl.protocol === 'https:' ? https : http;
                const redirectReq = redirectProto.get(redirectUrl.toString(), { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReelFetch/1.0)' } }, (redirectRes) => {
                    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
                    res.setHeader('Content-Type', redirectRes.headers['content-type'] || 'video/mp4');
                    if (redirectRes.headers['content-length']) res.setHeader('Content-Length', redirectRes.headers['content-length']);
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    redirectRes.pipe(res);
                });
                redirectReq.on('error', () => res.status(502).json({ success: false, error: 'Failed to fetch video from CDN.' }));
                return;
            }

            if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
                return res.status(proxyRes.statusCode).json({ success: false, error: `CDN returned ${proxyRes.statusCode}` });
            }

            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
            res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'video/mp4');
            if (proxyRes.headers['content-length']) res.setHeader('Content-Length', proxyRes.headers['content-length']);
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Pipe CDN response directly to client
            proxyRes.pipe(res);
        }
    );

    proxyReq.on('error', (err) => {
        console.error('[proxy-download] Request error:', err.message);
        if (!res.headersSent) {
            res.status(502).json({ success: false, error: 'Failed to fetch video from CDN.' });
        }
    });

    req.on('close', () => proxyReq.destroy());
});


router.post('/download', async (req, res) => {
    const { url } = req.body;

    // ── 1. Validate input ──────────────────────────────────────────
    const validation = validateReelUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    const { normalized, platform, id } = validation;

    // ── 2. Log IP (analytics) ──────────────────────────────────────
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    console.log(`[download] ${new Date().toISOString()} | IP: ${ip} | Platform: ${platform} | ID: ${id}`);

    // ── 3. Build cache key from platform + content id ──────────────
    const cacheKey = `${platform}:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        console.log(`[download] Cache HIT for ${cacheKey}`);
        await cache.incrementDailyCounter();
        return res.json({ success: true, cached: true, platform, ...cached });
    }

    console.log(`[download] Cache MISS for ${cacheKey} — extracting...`);

    // ── 4. Extract video data ──────────────────────────────────────
    let data;
    try {
        data = await extractVideoData(normalized, platform);
    } catch (err) {
        console.error(`[download] Extraction failed for ${cacheKey}:`, err.message);

        if (
            err.message.includes('private') ||
            err.message.includes('authentication') ||
            err.message.includes('login')
        ) {
            return res.status(403).json({ success: false, error: err.message });
        }
        if (err.message.includes('not found') || err.message.includes('deleted')) {
            return res.status(404).json({ success: false, error: err.message });
        }
        if (err.message.includes('timed out') || err.message.includes('timeout')) {
            return res.status(504).json({ success: false, error: err.message });
        }

        return res.status(422).json({ success: false, error: err.message });
    }

    // ── 5. Cache successful result (24h) ───────────────────────────
    await cache.set(cacheKey, data);
    await cache.incrementDailyCounter();

    // ── 6. Return result ───────────────────────────────────────────
    return res.json({ success: true, cached: false, platform, ...data });
});

router.post('/download/audio', async (req, res) => {
    const { url } = req.body;

    const validation = validateReelUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    const { normalized, platform, id } = validation;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    console.log(`[download/audio] ${new Date().toISOString()} | IP: ${ip} | Platform: ${platform} | ID: ${id}`);

    let data;
    try {
        data = await extractAudioUrl(normalized, platform);
    } catch (err) {
        console.error(`[download/audio] Extraction failed for ${platform}:${id}:`, err.message);

        if (
            err.message.includes('private') ||
            err.message.includes('authentication') ||
            err.message.includes('login')
        ) {
            return res.status(403).json({ success: false, error: err.message });
        }
        if (err.message.includes('not found') || err.message.includes('deleted')) {
            return res.status(404).json({ success: false, error: err.message });
        }
        if (err.message.includes('timed out') || err.message.includes('timeout')) {
            return res.status(504).json({ success: false, error: err.message });
        }

        return res.status(422).json({ success: false, error: err.message });
    }

    await cache.incrementDailyCounter();
    return res.json({ success: true, ...data });
});

module.exports = router;
