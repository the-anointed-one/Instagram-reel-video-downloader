'use strict';

/**
 * backend/routes/download.js
 *
 * POST /api/download
 * Orchestrates: validate → cache check → extract → cache store → respond
 */

const express = require('express');
const { validateReelUrl } = require('../utils/validateUrl');
const { extractReelData } = require('../services/extractor');
const cache = require('../services/cache');

const router = express.Router();

router.post('/download', async (req, res) => {
    const { url } = req.body;

    // ── 1. Validate input ──────────────────────────────────────────
    const validation = validateReelUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    const { normalized, shortcode } = validation;

    // ── 2. Log IP (analytics) ──────────────────────────────────────
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    console.log(`[download] ${new Date().toISOString()} | IP: ${ip} | Reel: ${shortcode}`);

    // ── 3. Check Redis cache ───────────────────────────────────────
    const cached = await cache.get(shortcode);
    if (cached) {
        console.log(`[download] Cache HIT for ${shortcode}`);
        return res.json({ success: true, cached: true, ...cached });
    }

    console.log(`[download] Cache MISS for ${shortcode} — extracting...`);

    // ── 4. Extract video data ──────────────────────────────────────
    let data;
    try {
        data = await extractReelData(normalized);
    } catch (err) {
        console.error(`[download] Extraction failed for ${shortcode}:`, err.message);

        // Map error messages to structured HTTP responses
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
        if (err.message.includes('timed out')) {
            return res.status(504).json({ success: false, error: err.message });
        }

        return res.status(422).json({ success: false, error: err.message });
    }

    // ── 5. Cache successful result (24h) ───────────────────────────
    await cache.set(shortcode, data);

    // ── 6. Return result ───────────────────────────────────────────
    return res.json({ success: true, cached: false, ...data });
});

module.exports = router;
