'use strict';

/**
 * backend/routes/download.js
 *
 * POST /api/download
 * Orchestrates: validate → cache check → extract → cache store → respond
 * Supports: Instagram, TikTok, Facebook, YouTube
 */

const express = require('express');
const { validateReelUrl } = require('../utils/validateUrl');
const { extractVideoData, extractAudioUrl } = require('../services/extractor');
const cache = require('../services/cache');

const router = express.Router();

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

    return res.json({ success: true, ...data });
});

module.exports = router;
