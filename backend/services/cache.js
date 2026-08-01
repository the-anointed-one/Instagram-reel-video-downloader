'use strict';

/**
 * backend/services/cache.js
 *
 * Redis cache wrapper using ioredis.
 * TTL: 86400 seconds (24 hours) for successful extractions.
 */

const Redis = require('ioredis');

let client = null;

function getClient() {
    if (client) return client;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    client = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        connectTimeout: 5000,
        enableOfflineQueue: false,
    });

    client.on('error', (err) => {
        // Non-fatal: degrade gracefully without cache if Redis is down
        console.warn('[cache] Redis error (degraded mode):', err.message);
    });

    client.on('connect', () => {
        console.log('[cache] Redis connected:', redisUrl);
    });

    return client;
}

const CACHE_PREFIX = 'reelfetch:';
// YouTube CDN URLs are signed to the proxy IP and expire quickly.
// 10 minutes keeps the API responsive for repeated hits while ensuring
// users always get a fresh, valid stream URL.
const TTL_SECONDS = 600; // 10 minutes

/**
 * Get a cached value by key.
 * @param {string} key
 * @returns {Promise<object|null>} Parsed JSON or null if miss/error
 */
async function get(key) {
    try {
        const raw = await getClient().get(CACHE_PREFIX + key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.warn('[cache] get error:', err.message);
        return null;
    }
}

/**
 * Set a value in cache with TTL.
 * @param {string} key
 * @param {object} value
 * @param {number} [ttl=TTL_SECONDS]
 */
async function set(key, value, ttl = TTL_SECONDS) {
    try {
        await getClient().set(CACHE_PREFIX + key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
        console.warn('[cache] set error:', err.message);
        // Degrade gracefully — don't fail the request
    }
}

let fallbackDailyCount = 0;
let fallbackDailyDate = new Date().toISOString().split('T')[0];

/**
 * Increment the daily download counter.
 * Uses a Redis key with today's date (YYYY-MM-DD).
 */
async function incrementDailyCounter() {
    const today = new Date().toISOString().split('T')[0];
    
    // In-memory fallback management
    if (today !== fallbackDailyDate) {
        fallbackDailyCount = 0;
        fallbackDailyDate = today;
    }
    fallbackDailyCount++;

    try {
        const key = `${CACHE_PREFIX}stats:downloads:${today}`;
        const count = await getClient().incr(key);
        if (count === 1) {
            await getClient().expire(key, 86400);
        }
        return count;
    } catch (err) {
        return fallbackDailyCount;
    }
}

/**
 * Get the current daily download count.
 */
async function getDailyCounter() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const key = `${CACHE_PREFIX}stats:downloads:${today}`;
        const raw = await getClient().get(key);
        return raw ? parseInt(raw, 10) : fallbackDailyCount;
    } catch (err) {
        return fallbackDailyCount;
    }
}

/**
 * Generic atomic counter — increment `key` by `amount`.
 * Sets a TTL only on first creation so the window is fixed from first write.
 * Used by the tools budget/spend-cap tracking. Degrades to 0 if Redis is down.
 * @param {string} key
 * @param {number} [amount=1]
 * @param {number} [ttlSeconds] — expiry applied only when the key is first created
 * @returns {Promise<number>} new counter value (0 on error)
 */
async function increment(key, amount = 1, ttlSeconds) {
    try {
        const full = CACHE_PREFIX + key;
        const count = await getClient().incrby(full, amount);
        if (count === amount && ttlSeconds) {
            await getClient().expire(full, ttlSeconds);
        }
        return count;
    } catch (err) {
        console.warn('[cache] increment error:', err.message);
        return 0;
    }
}

/**
 * Read a numeric counter value. Returns 0 on miss or Redis error.
 * @param {string} key
 * @returns {Promise<number>}
 */
async function getNumber(key) {
    try {
        const raw = await getClient().get(CACHE_PREFIX + key);
        return raw ? parseInt(raw, 10) : 0;
    } catch (err) {
        console.warn('[cache] getNumber error:', err.message);
        return 0;
    }
}

/**
 * Connect Redis client explicitly (called at startup).
 */
async function connect() {
    try {
        await getClient().connect();
    } catch (err) {
        console.warn('[cache] Initial Redis connection failed (degraded mode):', err.message);
    }
}

module.exports = { get, set, connect, incrementDailyCounter, getDailyCounter, increment, getNumber };
