'use strict';

/**
 * backend/services/providers/copyleaks.js
 *
 * Adapter for the Copyleaks API — powers the AI Content Detector (and later the
 * Plagiarism Checker, which uses the same account/credentials).
 *
 * Auth flow (per Copyleaks docs):
 *   1. POST https://id.copyleaks.com/v3/account/login/api  { email, key }
 *        → { access_token }  (JWT, valid ~48h)
 *   2. POST https://api.copyleaks.com/v2/writer-detector/{scanId}/check
 *        Authorization: Bearer <token>   body: { text, sandbox }
 *        → { summary: { human, ai }, results, ... }   (0..1 probabilities)
 *
 * Swapping providers = replacing this one file. The route layer only depends on
 * `isConfigured()` and `detectAiText()`.
 *
 * NOTE: endpoints/response shape follow Copyleaks' published API. Verify the
 * normalisation in detectAiText() against a real response once the key lands.
 */

const axios = require('axios');
const crypto = require('crypto');
const cache = require('../cache');

const COPYLEAKS_EMAIL = process.env.COPYLEAKS_EMAIL || null;
const COPYLEAKS_API_KEY = process.env.COPYLEAKS_API_KEY || null;
// Sandbox mode returns mock results without consuming credits — leave 'true'
// until you've confirmed everything works, then set 'false' to go live.
const SANDBOX = process.env.COPYLEAKS_SANDBOX === 'true';

const ID_BASE = 'https://id.copyleaks.com';
const API_BASE = 'https://api.copyleaks.com';
const TOKEN_CACHE_KEY = 'copyleaks:token';

class ProviderNotConfiguredError extends Error {
    constructor(msg = 'Copyleaks credentials are not configured.') {
        super(msg);
        this.name = 'ProviderNotConfiguredError';
    }
}

function isConfigured() {
    return Boolean(COPYLEAKS_EMAIL && COPYLEAKS_API_KEY);
}

/**
 * Fetch (and cache) a Copyleaks bearer token. Tokens last ~48h; we cache for 40h.
 * @param {boolean} [forceRefresh]
 */
async function getToken(forceRefresh = false) {
    if (!forceRefresh) {
        const cached = await cache.get(TOKEN_CACHE_KEY);
        if (cached && cached.token) return cached.token;
    }

    const { data } = await axios.post(
        `${ID_BASE}/v3/account/login/api`,
        { email: COPYLEAKS_EMAIL, key: COPYLEAKS_API_KEY },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    const token = data && data.access_token;
    if (!token) throw new Error('Copyleaks login returned no access_token.');

    await cache.set(TOKEN_CACHE_KEY, { token }, 40 * 60 * 60); // 40h
    return token;
}

/**
 * Run AI-content detection on a block of text.
 * @param {string} text
 * @returns {Promise<{ aiProbability: number|null, humanProbability: number|null }>}
 *          probabilities are 0..1 (or null if the provider omitted them)
 */
async function detectAiText(text) {
    if (!isConfigured()) throw new ProviderNotConfiguredError();

    const scanId = crypto.randomUUID();
    const body = { text, sandbox: SANDBOX };

    const call = async (token) =>
        axios.post(`${API_BASE}/v2/writer-detector/${scanId}/check`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

    let response;
    try {
        response = await call(await getToken());
    } catch (err) {
        // Token likely expired/invalid — refresh once and retry.
        if (err.response && err.response.status === 401) {
            response = await call(await getToken(true));
        } else {
            throw err;
        }
    }

    const data = response.data || {};
    const summary = data.summary || {};
    const ai = typeof summary.ai === 'number' ? summary.ai : null;
    const human = typeof summary.human === 'number' ? summary.human : null;

    return {
        aiProbability: ai,
        humanProbability: human,
    };
}

module.exports = { isConfigured, detectAiText, ProviderNotConfiguredError };
