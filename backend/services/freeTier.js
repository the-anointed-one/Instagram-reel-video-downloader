'use strict';

/**
 * backend/services/freeTier.js
 *
 * Free-tier metering for premium (API-cost) tools. Counts successful premium
 * uses per IP per day in Redis. Past the daily limit, the route returns a 402
 * "upgrade" response. Uses the Redis you already have — no new infrastructure.
 *
 * Phase B (accounts + Paystack) will let a logged-in Pro user bypass the limit
 * by passing `isPro = true` to isAllowed().
 *
 * Set TOOLS_FREE_DAILY=0 to disable the gate entirely (unlimited) — useful
 * while Phase B payments aren't live yet, then dial it down to go paid.
 */

const cache = require('./cache');

const FREE_DAILY = parseInt(process.env.TOOLS_FREE_DAILY || '0', 10); // 0 = unlimited (gate off)

function ipOf(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

function key(ip) {
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `freetier:premium:${day}:${ip}`;
}

/**
 * @param {object} req
 * @param {boolean} [isPro] — Phase B: active Pro subscribers bypass the limit
 * @returns {Promise<boolean>}
 */
async function isAllowed(req, isPro = false) {
    if (isPro || FREE_DAILY <= 0) return true;
    const used = await cache.getNumber(key(ipOf(req)));
    return used < FREE_DAILY;
}

/** Record one successful premium use (2-day TTL comfortably covers the day). */
async function consume(req) {
    if (FREE_DAILY <= 0) return;
    await cache.increment(key(ipOf(req)), 1, 2 * 24 * 60 * 60);
}

async function status(req) {
    const used = FREE_DAILY > 0 ? await cache.getNumber(key(ipOf(req))) : 0;
    return { limit: FREE_DAILY, used, remaining: FREE_DAILY <= 0 ? null : Math.max(0, FREE_DAILY - used) };
}

module.exports = { isAllowed, consume, status, FREE_DAILY };
