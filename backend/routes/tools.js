'use strict';

/**
 * backend/routes/tools.js
 *
 * Utility tools that proxy paid 3rd-party APIs. Fully isolated from the
 * downloader — a failure here can only 5xx these endpoints.
 *
 * POST /api/tools/ai-detector/text   — AI content detection (Copyleaks)
 * GET  /api/tools/ai-detector/status — configured? + monthly usage
 *
 * Safety layers, in order:
 *   1. Inherits the global /api rate limiter (per-IP) from index.js
 *   2. Server-side input caps (min/max chars) — bounds cost per call
 *   3. Redis cache of identical inputs — repeats never re-bill
 *   4. Monthly spend cap (budget.js) — hard kill-switch on the bill
 */

const express = require('express');
const crypto = require('crypto');
const cache = require('../services/cache');
const budget = require('../services/budget');
const copyleaks = require('../services/providers/copyleaks');
const sightengine = require('../services/providers/sightengine');
const anthropic = require('../services/providers/anthropic');
const { AI_TASKS } = require('../services/aiTasks');
const deepgram = require('../services/providers/deepgram');
const { toSRT, toVTT } = require('../services/subtitles');
const { validateReelUrl } = require('../utils/validateUrl');
const { extractAudioUrl } = require('../services/extractor');
const freeTier = require('../services/freeTier');

const router = express.Router();

// Premium (API-cost) tools: enforce the free daily limit. Returns true (and
// sends a 402 "upgrade" response) when the caller is out of free uses.
// Phase B will pass the caller's Pro status; for now everyone is on free tier.
async function blockedByFreeTier(req, res) {
    if (await freeTier.isAllowed(req, /* isPro */ false)) return false;
    res.status(402).json({
        success: false,
        upgrade: true,
        error: `You've reached today's free limit of ${freeTier.FREE_DAILY} premium uses. Upgrade to Pro for unlimited access.`,
    });
    return true;
}

// Free-tier bounds for the AI detector.
const AI_MAX_CHARS = parseInt(process.env.TOOLS_AI_DETECTOR_MAX_CHARS || '1500', 10);
const AI_MIN_CHARS = 255; // Copyleaks needs a minimum sample for a reliable score
const RESULT_TTL_SECONDS = 7 * 24 * 60 * 60; // cache identical text for 7 days

// Max upload size for the AI image detector (bounds cost + memory).
const IMG_MAX_BYTES = parseInt(process.env.TOOLS_AI_IMAGE_MAX_BYTES || String(8 * 1024 * 1024), 10);

router.post('/tools/ai-detector/text', async (req, res) => {
    const { text } = req.body || {};

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, error: 'Text is required.' });
    }

    const trimmed = text.trim();
    if (trimmed.length < AI_MIN_CHARS) {
        return res.status(400).json({
            success: false,
            error: `Please paste at least ${AI_MIN_CHARS} characters for an accurate result.`,
            minChars: AI_MIN_CHARS,
        });
    }
    if (trimmed.length > AI_MAX_CHARS) {
        return res.status(400).json({
            success: false,
            error: `The free limit is ${AI_MAX_CHARS} characters (you pasted ${trimmed.length}).`,
            maxChars: AI_MAX_CHARS,
        });
    }

    // ── Cache identical inputs so repeats never re-bill ────────────
    const hash = crypto.createHash('sha256').update(trimmed).digest('hex');
    const cacheKey = `tools:aidetect:${hash}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        return res.json({ success: true, cached: true, ...cached });
    }

    // ── Graceful degradation until the API key is provisioned ──────
    if (!copyleaks.isConfigured()) {
        return res.status(503).json({
            success: false,
            error: 'The AI detector is being set up and will be available shortly.',
        });
    }

    // ── Monthly spend cap (hard kill-switch) ───────────────────────
    if (!(await budget.canSpend('aidetect'))) {
        return res.status(503).json({
            success: false,
            error: 'This tool has reached its usage limit for this month. Please try again later.',
        });
    }

    if (await blockedByFreeTier(req, res)) return;

    try {
        const result = await copyleaks.detectAiText(trimmed);
        await budget.record('aidetect', 1);
        await freeTier.consume(req);

        const payload = {
            aiProbability: result.aiProbability,
            humanProbability: result.humanProbability,
        };
        await cache.set(cacheKey, payload, RESULT_TTL_SECONDS);

        return res.json({ success: true, cached: false, ...payload });
    } catch (err) {
        if (err.name === 'ProviderNotConfiguredError') {
            return res.status(503).json({
                success: false,
                error: 'The AI detector is being set up and will be available shortly.',
            });
        }
        console.error('[tools/ai-detector] Detection failed:', err.response?.data || err.message);
        return res.status(502).json({
            success: false,
            error: 'The detection service is temporarily unavailable. Please try again.',
        });
    }
});

router.get('/tools/ai-detector/status', async (req, res) => {
    const usage = await budget.usage('aidetect');
    res.json({ configured: copyleaks.isConfigured(), ...usage });
});

// ── AI Image Detector (Sightengine) ───────────────────────────────
// Accept raw image bytes (no multer needed). The global express.json()
// only parses application/json, so image/* bodies fall through to here.
const rawImage = express.raw({
    type: (req) => (req.headers['content-type'] || '').startsWith('image/'),
    limit: '10mb',
});

router.post('/tools/ai-image-detector', rawImage, async (req, res) => {
    const buf = req.body;

    if (!Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ success: false, error: 'Please upload an image file.' });
    }
    if (buf.length > IMG_MAX_BYTES) {
        return res.status(400).json({
            success: false,
            error: `Image too large. The limit is ${Math.round(IMG_MAX_BYTES / 1024 / 1024)}MB.`,
        });
    }

    const mimetype = req.headers['content-type'] || 'image/jpeg';

    // ── Cache identical images so repeats never re-bill ────────────
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    const cacheKey = `tools:aiimage:${hash}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        return res.json({ success: true, cached: true, ...cached });
    }

    if (!sightengine.isConfigured()) {
        return res.status(503).json({
            success: false,
            error: 'The AI image detector is being set up and will be available shortly.',
        });
    }

    if (!(await budget.canSpend('aiimage'))) {
        return res.status(503).json({
            success: false,
            error: 'This tool has reached its usage limit for this month. Please try again later.',
        });
    }

    if (await blockedByFreeTier(req, res)) return;

    try {
        const result = await sightengine.detectAiImage(buf, mimetype);
        await budget.record('aiimage', 1);
        await freeTier.consume(req);

        const payload = { aiProbability: result.aiProbability };
        await cache.set(cacheKey, payload, RESULT_TTL_SECONDS);

        return res.json({ success: true, cached: false, ...payload });
    } catch (err) {
        if (err.name === 'ProviderNotConfiguredError') {
            return res.status(503).json({
                success: false,
                error: 'The AI image detector is being set up and will be available shortly.',
            });
        }
        console.error('[tools/ai-image-detector] Detection failed:', err.response?.data || err.message);
        return res.status(502).json({
            success: false,
            error: 'The detection service is temporarily unavailable. Please try again.',
        });
    }
});

router.get('/tools/ai-image-detector/status', async (req, res) => {
    const usage = await budget.usage('aiimage');
    res.json({ configured: sightengine.isConfigured(), ...usage });
});

// ── LLM text tools (Claude) ───────────────────────────────────────
// Generic handler for summarizer / paraphraser / grammar / translator /
// caption / hashtag / bio. The task registry supplies the prompt + caps.
router.post('/tools/ai/:task', async (req, res) => {
    const task = AI_TASKS[req.params.task];
    if (!task) {
        return res.status(404).json({ success: false, error: 'Unknown tool.' });
    }

    const { text, options } = req.body || {};
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, error: 'Text is required.' });
    }

    const trimmed = text.trim();
    if (trimmed.length < 2) {
        return res.status(400).json({ success: false, error: 'Please enter some text.' });
    }
    if (trimmed.length > task.maxInputChars) {
        return res.status(400).json({
            success: false,
            error: `The free limit is ${task.maxInputChars} characters (you entered ${trimmed.length}).`,
            maxChars: task.maxInputChars,
        });
    }

    const opts = options && typeof options === 'object' ? options : {};

    // ── Cache identical (task + input + options) so repeats never re-bill ──
    const hash = crypto
        .createHash('sha256')
        .update(`${req.params.task} ${trimmed} ${JSON.stringify(opts)}`)
        .digest('hex');
    const cacheKey = `tools:ai:${req.params.task}:${hash}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        return res.json({ success: true, cached: true, ...cached });
    }

    if (!anthropic.isConfigured()) {
        return res.status(503).json({
            success: false,
            error: 'This tool is being set up and will be available shortly.',
        });
    }

    if (!(await budget.canSpend('ai'))) {
        return res.status(503).json({
            success: false,
            error: 'This tool has reached its usage limit for this month. Please try again later.',
        });
    }

    if (await blockedByFreeTier(req, res)) return;

    try {
        const { system, user } = task.build({ text: trimmed, options: opts });
        const result = await anthropic.complete({ system, user, maxTokens: task.maxTokens });
        await budget.record('ai', 1);
        await freeTier.consume(req);

        const payload = { result };
        await cache.set(cacheKey, payload, RESULT_TTL_SECONDS);
        return res.json({ success: true, cached: false, ...payload });
    } catch (err) {
        if (err.name === 'ProviderNotConfiguredError') {
            return res.status(503).json({
                success: false,
                error: 'This tool is being set up and will be available shortly.',
            });
        }
        console.error(`[tools/ai/${req.params.task}] failed:`, err.message);
        return res.status(502).json({
            success: false,
            error: 'The tool is temporarily unavailable. Please try again.',
        });
    }
});

router.get('/tools/ai/status', async (req, res) => {
    const usage = await budget.usage('ai');
    res.json({ configured: anthropic.isConfigured(), model: anthropic.model(), ...usage });
});

// ── Subtitle Generator (Deepgram) ─────────────────────────────────
// Two modes: transcribe from a pasted video URL (reuses extractAudioUrl),
// or from an uploaded audio/video file. Both return transcript + SRT + VTT.
const SUBS_MAX_BYTES = parseInt(process.env.TOOLS_SUBS_MAX_BYTES || String(25 * 1024 * 1024), 10);

async function respondWithTranscript(req, res, cacheKey, transcribeInput) {
    if (!deepgram.isConfigured()) {
        return res.status(503).json({
            success: false,
            error: 'The subtitle generator is being set up and will be available shortly.',
        });
    }
    if (!(await budget.canSpend('transcribe'))) {
        return res.status(503).json({
            success: false,
            error: 'This tool has reached its usage limit for this month. Please try again later.',
        });
    }

    if (await blockedByFreeTier(req, res)) return;

    const { transcript, segments, durationSec } = await deepgram.transcribe(transcribeInput);
    if (!transcript || segments.length === 0) {
        return res.status(422).json({ success: false, error: 'No speech was detected in that media.' });
    }

    // Meter by audio minutes — transcription is priced per minute.
    await budget.record('transcribe', Math.max(1, Math.ceil(durationSec / 60)));
    await freeTier.consume(req);

    const payload = { transcript, srt: toSRT(segments), vtt: toVTT(segments) };
    await cache.set(cacheKey, payload, RESULT_TTL_SECONDS);
    return res.json({ success: true, cached: false, ...payload });
}

router.post('/tools/subtitle-generator/url', async (req, res) => {
    const { url } = req.body || {};
    const validation = validateReelUrl(url);
    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    const cacheKey = `tools:subs:url:${validation.platform}:${validation.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, cached: true, ...cached });

    try {
        const { audioUrl } = await extractAudioUrl(validation.normalized, validation.platform);
        return await respondWithTranscript(req, res, cacheKey, { url: audioUrl });
    } catch (err) {
        if (err.name === 'ProviderNotConfiguredError') {
            return res.status(503).json({ success: false, error: 'The subtitle generator is being set up and will be available shortly.' });
        }
        console.error('[tools/subtitle-generator/url] failed:', err.response?.data || err.message);
        return res.status(502).json({ success: false, error: 'Could not transcribe that video. It may be private, or the audio could not be reached.' });
    }
});

const rawAV = express.raw({
    type: (req) => {
        const ct = req.headers['content-type'] || '';
        return ct.startsWith('audio/') || ct.startsWith('video/');
    },
    limit: '50mb',
});

router.post('/tools/subtitle-generator/upload', rawAV, async (req, res) => {
    const buf = req.body;
    if (!Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ success: false, error: 'Please upload an audio or video file.' });
    }
    if (buf.length > SUBS_MAX_BYTES) {
        return res.status(400).json({
            success: false,
            error: `File too large. The limit is ${Math.round(SUBS_MAX_BYTES / 1024 / 1024)}MB.`,
        });
    }

    const mimetype = req.headers['content-type'] || 'application/octet-stream';
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    const cacheKey = `tools:subs:file:${hash}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, cached: true, ...cached });

    try {
        return await respondWithTranscript(req, res, cacheKey, { buffer: buf, mimetype });
    } catch (err) {
        if (err.name === 'ProviderNotConfiguredError') {
            return res.status(503).json({ success: false, error: 'The subtitle generator is being set up and will be available shortly.' });
        }
        console.error('[tools/subtitle-generator/upload] failed:', err.response?.data || err.message);
        return res.status(502).json({ success: false, error: 'Could not transcribe that file. Please try a different one.' });
    }
});

router.get('/tools/subtitle-generator/status', async (req, res) => {
    const usage = await budget.usage('transcribe');
    res.json({ configured: deepgram.isConfigured(), ...usage });
});

module.exports = router;
