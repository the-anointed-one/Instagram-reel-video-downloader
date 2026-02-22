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
const TTL_SECONDS = 86400; // 24 hours

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

module.exports = { get, set, connect };
