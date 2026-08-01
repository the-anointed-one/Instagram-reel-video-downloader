'use strict';

/**
 * backend/services/providers/sightengine.js
 *
 * Adapter for the Sightengine API — powers the AI Image Detector.
 *
 * Endpoint: POST https://api.sightengine.com/1.0/check.json
 *   multipart form: media=<file>, models=genai, api_user, api_secret
 *   → { status:'success', type:{ ai_generated: 0..1 }, ... }
 *
 * Uses Node's built-in FormData/Blob (Node 18+) so no extra deps are needed.
 * Swapping providers = replacing this one file; the route only depends on
 * `isConfigured()` and `detectAiImage()`.
 */

const axios = require('axios');

const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER || null;
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET || null;
const API_URL = 'https://api.sightengine.com/1.0/check.json';

class ProviderNotConfiguredError extends Error {
    constructor(msg = 'Sightengine credentials are not configured.') {
        super(msg);
        this.name = 'ProviderNotConfiguredError';
    }
}

function isConfigured() {
    return Boolean(SIGHTENGINE_USER && SIGHTENGINE_SECRET);
}

/**
 * Detect whether an image is AI-generated.
 * @param {Buffer} buffer   — raw image bytes
 * @param {string} [mimetype='image/jpeg']
 * @param {string} [filename='upload']
 * @returns {Promise<{ aiProbability: number|null }>} probability 0..1 (or null)
 */
async function detectAiImage(buffer, mimetype = 'image/jpeg', filename = 'upload') {
    if (!isConfigured()) throw new ProviderNotConfiguredError();

    const form = new FormData();
    form.append('media', new Blob([buffer], { type: mimetype }), filename);
    form.append('models', 'genai');
    form.append('api_user', SIGHTENGINE_USER);
    form.append('api_secret', SIGHTENGINE_SECRET);

    const { data } = await axios.post(API_URL, form, { timeout: 30000 });

    if (data.status !== 'success') {
        throw new Error((data.error && data.error.message) || 'Sightengine returned an error.');
    }

    const ai =
        data.type && typeof data.type.ai_generated === 'number' ? data.type.ai_generated : null;

    return { aiProbability: ai };
}

module.exports = { isConfigured, detectAiImage, ProviderNotConfiguredError };
