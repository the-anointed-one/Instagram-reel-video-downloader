'use strict';

/**
 * backend/utils/validateUrl.js
 *
 * Validates that a URL is a legitimate public Instagram Reel URL.
 * Also guards against SSRF and non-Instagram domains.
 */

const INSTAGRAM_REEL_PATTERN = /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?(\?.*)?$/;

/**
 * Validate an Instagram Reel URL.
 * @param {string} url
 * @returns {{ valid: boolean, error?: string, normalized?: string }}
 */
function validateReelUrl(url) {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required.' };
    }

    const trimmed = url.trim();

    // Must start with https
    if (!trimmed.startsWith('https://')) {
        return { valid: false, error: 'Only HTTPS Instagram Reel URLs are accepted.' };
    }

    // Must be instagram.com (block SSRF / internal hosts)
    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch {
        return { valid: false, error: 'Invalid URL format.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block non-Instagram domains (SSRF guard)
    if (hostname !== 'www.instagram.com' && hostname !== 'instagram.com') {
        return { valid: false, error: 'Only Instagram URLs are accepted.' };
    }

    // Block private/internal IPs (belt-and-suspenders SSRF guard)
    const blockedPatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^::1$/,
        /^0\.0\.0\.0$/,
    ];
    if (blockedPatterns.some((p) => p.test(hostname))) {
        return { valid: false, error: 'Invalid host.' };
    }

    // Must match Reel URL pattern
    if (!INSTAGRAM_REEL_PATTERN.test(trimmed)) {
        return {
            valid: false,
            error: 'URL must be a public Instagram Reel (e.g. https://www.instagram.com/reel/ABC123/).',
        };
    }

    // Normalize: strip query params, ensure trailing slash
    const shortcodeMatch = trimmed.match(/\/reel\/([A-Za-z0-9_-]+)/);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;
    const normalized = `https://www.instagram.com/reel/${shortcode}/`;

    return { valid: true, normalized, shortcode };
}

module.exports = { validateReelUrl };
