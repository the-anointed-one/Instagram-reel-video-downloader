'use strict';

/**
 * backend/services/budget.js
 *
 * Monthly spend cap for paid 3rd-party tool APIs (AI detector, plagiarism, etc).
 *
 * Every paid call is metered against a per-category monthly counter in Redis.
 * When the counter reaches TOOLS_MONTHLY_MAX_CHECKS the tool refuses new work
 * until the calendar month rolls over — a hard kill-switch so a traffic spike
 * or abuse can never run up an unbounded bill.
 *
 * This is intentionally decoupled from the downloader: it only touches its own
 * Redis keys (`reelfetch:budget:*`) and never affects the download path.
 */

const cache = require('./cache');

// Global monthly ceiling per tool category. Tune per your provider pricing.
const MONTHLY_MAX = parseInt(process.env.TOOLS_MONTHLY_MAX_CHECKS || '5000', 10);

// ~35 days so the key always outlives the calendar month it belongs to.
const KEY_TTL_SECONDS = 35 * 24 * 60 * 60;

function monthKey(category) {
    const ym = new Date().toISOString().slice(0, 7); // YYYY-MM
    return `budget:${category}:${ym}`;
}

/**
 * @param {string} category — e.g. 'aidetect', 'plagiarism'
 * @returns {Promise<boolean>} true if there is remaining budget this month
 */
async function canSpend(category) {
    if (MONTHLY_MAX <= 0) return true; // 0/negative => uncapped (opt-out)
    const used = await cache.getNumber(monthKey(category));
    return used < MONTHLY_MAX;
}

/**
 * Record a successful paid call against the monthly counter.
 * @param {string} category
 * @param {number} [cost=1]
 */
async function record(category, cost = 1) {
    await cache.increment(monthKey(category), cost, KEY_TTL_SECONDS);
}

/**
 * @param {string} category
 * @returns {Promise<{ used: number, cap: number, remaining: number }>}
 */
async function usage(category) {
    const used = await cache.getNumber(monthKey(category));
    return { used, cap: MONTHLY_MAX, remaining: Math.max(0, MONTHLY_MAX - used) };
}

module.exports = { canSpend, record, usage };
