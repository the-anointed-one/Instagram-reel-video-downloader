'use strict';

/**
 * backend/utils/validateUrl.js
 *
 * Validates and detects platform from a video URL.
 * Supports: Instagram Reels, TikTok, Facebook, YouTube Shorts.
 * Guards against SSRF and unsupported domains.
 */

// ── Platform URL patterns ─────────────────────────────────────────

const PLATFORM_PATTERNS = {
    instagram: {
        hostnames: ['www.instagram.com', 'instagram.com'],
        pathPattern: /^\/(reel|reels|p)\/[A-Za-z0-9_-]+\/?/,
        errorHint: 'e.g. https://www.instagram.com/reel/ABC123/',
    },
    tiktok: {
        hostnames: ['www.tiktok.com', 'tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
        pathPattern: /^\/@?[^/]+\/video\/\d+|^\/t\/[A-Za-z0-9]+/,
        errorHint: 'e.g. https://www.tiktok.com/@user/video/123456789',
    },
    facebook: {
        hostnames: [
            'www.facebook.com', 'facebook.com',
            'www.fb.watch', 'fb.watch',
            'm.facebook.com',
        ],
        pathPattern: /^\/(reel\/|watch\/|[^/]+\/videos\/|\?v=|share\/r\/|share\/v\/)/,
        errorHint: 'e.g. https://www.facebook.com/reel/123456 or fb.watch/...',
    },
    youtube: {
        hostnames: [
            'www.youtube.com', 'youtube.com',
            'm.youtube.com', 'youtu.be',
        ],
        pathPattern: /^\/(shorts\/[A-Za-z0-9_-]+|watch|[A-Za-z0-9_-]{11}$)/,
        errorHint: 'e.g. https://www.youtube.com/shorts/ABC123',
    },
};

// ── SSRF blocklist ────────────────────────────────────────────────

const BLOCKED_HOSTNAME_PATTERNS = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^::1$/,
    /^0\.0\.0\.0$/,
    /^169\.254\./,       // link-local
    /^[^.]+$/,           // bare hostnames (no TLD)
];

// ── Helpers ───────────────────────────────────────────────────────

function detectPlatform(hostname, pathname) {
    for (const [platform, config] of Object.entries(PLATFORM_PATTERNS)) {
        if (config.hostnames.includes(hostname)) {
            // For YouTube, also allow bare youtu.be IDs
            if (platform === 'youtube' && hostname === 'youtu.be') return platform;
            if (config.pathPattern.test(pathname)) return platform;
            // Facebook: also match ?v= query param URLs
            if (platform === 'facebook') return platform;
        }
    }
    return null;
}

function normalizePlatformUrl(platform, parsed) {
    switch (platform) {
        case 'instagram': {
            const m = parsed.pathname.match(/\/(reel|reels|p)\/([A-Za-z0-9_-]+)/);
            if (!m) return null;
            // Always normalise to /reel/ form
            return {
                normalized: `https://www.instagram.com/reel/${m[2]}/`,
                id: m[2],
            };
        }
        case 'tiktok': {
            // Preserve original URL — yt-dlp handles redirects
            return {
                normalized: parsed.href,
                id: parsed.pathname.replace(/\//g, '_').replace(/^_/, '') || 'tiktok',
            };
        }
        case 'facebook': {
            return {
                normalized: parsed.href,
                id: parsed.pathname.replace(/\//g, '_').replace(/^_/, '') || 'fb',
            };
        }
        case 'youtube': {
            let id = parsed.pathname.split('/').pop() || 'yt';
            if (id === 'watch' && parsed.searchParams.has('v')) {
                id = parsed.searchParams.get('v');
            }
            return {
                normalized: parsed.href,
                id: id,
            };
        }
        default:
            return null;
    }
}

// ── Main export ───────────────────────────────────────────────────

/**
 * Validate a video URL from any supported platform.
 * @param {string} url
 * @returns {{ valid: boolean, error?: string, normalized?: string, platform?: string, id?: string }}
 */
function validateReelUrl(url) {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required.' };
    }

    const trimmed = url.trim();

    if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
        return { valid: false, error: 'Only HTTP/HTTPS URLs are accepted.' };
    }

    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch {
        return { valid: false, error: 'Invalid URL format.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // SSRF guard
    if (BLOCKED_HOSTNAME_PATTERNS.some((p) => p.test(hostname))) {
        return { valid: false, error: 'Invalid host.' };
    }

    const platform = detectPlatform(hostname, parsed.pathname);

    if (!platform) {
        const supported = Object.keys(PLATFORM_PATTERNS).join(', ');
        return {
            valid: false,
            error: `Unsupported platform. Supported: ${supported}.`,
        };
    }

    const result = normalizePlatformUrl(platform, parsed);
    if (!result) {
        return {
            valid: false,
            error: `Could not parse ${platform} URL. ${PLATFORM_PATTERNS[platform].errorHint}`,
        };
    }

    return { valid: true, platform, normalized: result.normalized, id: result.id };
}

// Keep legacy export name so existing callers aren't broken
module.exports = { validateReelUrl };
