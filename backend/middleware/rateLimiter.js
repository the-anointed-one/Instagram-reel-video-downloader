'use strict';

/**
 * backend/middleware/rateLimiter.js
 *
 * Rate limiting: 20 requests per IP per 15 minutes.
 * Returns 429 with structured JSON on abuse.
 */

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
    standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Respect X-Forwarded-For behind proxies (Render, Railway, etc.)
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests. You are limited to 20 requests per 15 minutes. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
        });
    },
});

module.exports = { rateLimiter };
