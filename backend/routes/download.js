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
 * Fetches the remote video/audio through the Webshare proxy and pipes it
 * to the client. This is required because YouTube CDN URLs are IP-signed
 * to the proxy IP — so fetching must also go through the same proxy.
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

    // Build axios proxy config from env (same proxy yt-dlp uses to extract)
    let axiosProxyConfig = false; // false = no proxy
    const YTDLP_PROXY = process.env.YTDLP_PROXY;
    if (YTDLP_PROXY) {
        try {
            const proxyParsed = new URL(YTDLP_PROXY);
            axiosProxyConfig = {
                protocol: proxyParsed.protocol.replace(':', ''),
                host: proxyParsed.hostname,
                port: parseInt(proxyParsed.port, 10),
                auth: proxyParsed.username ? {
                    username: decodeURIComponent(proxyParsed.username),
                    password: decodeURIComponent(proxyParsed.password),
                } : undefined,
            };
            console.log('[proxy-download] Routing through proxy:', proxyParsed.hostname + ':' + proxyParsed.port);
        } catch (e) {
            console.warn('[proxy-download] Could not parse YTDLP_PROXY, fetching direct:', e.message);
        }
    }

    try {
        const axios = require('axios');
        const cdnResponse = await axios.get(targetUrl.toString(), {
            responseType: 'stream',
            timeout: 60000,
            proxy: axiosProxyConfig,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.youtube.com/',
                ...(req.headers['range'] ? { 'Range': req.headers['range'] } : {}),
            },
            maxRedirects: 5,
        });

        const contentType = cdnResponse.headers['content-type'] || 'video/mp4';
        const contentLength = cdnResponse.headers['content-length'];

        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', contentType);
        if (contentLength) res.setHeader('Content-Length', contentLength);
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (cdnResponse.status === 206 || cdnResponse.status === 200) {
            res.status(cdnResponse.status);
        }

        // Pipe CDN stream → client
        cdnResponse.data.pipe(res);

        cdnResponse.data.on('error', (err) => {
            console.error('[proxy-download] Stream error:', err.message);
            if (!res.headersSent) res.status(502).end();
        });

        req.on('close', () => cdnResponse.data.destroy());

    } catch (err) {
        console.error('[proxy-download] Error fetching CDN URL:', err.message);
        if (!res.headersSent) {
            const status = err.response?.status || 502;
            res.status(status).json({ success: false, error: `CDN fetch failed: ${err.message}` });
        }
    }
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
