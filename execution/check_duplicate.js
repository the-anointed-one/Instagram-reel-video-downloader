#!/usr/bin/env node
/**
 * execution/check_duplicate.js
 *
 * Layer 3 — Deterministic CLI tool
 * Directive: directives/dedup_check.md
 *
 * Usage:
 *   node execution/check_duplicate.js <instagram-reel-url>
 *
 * Checks MongoDB to see if a Reel URL has already been processed.
 * Exits 0 if NOT a duplicate (safe to proceed).
 * Exits 1 if IS a duplicate (skip download).
 */

'use strict';

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// ── Inline the schema so this script is self-contained ──────────────
const reelLogSchema = new mongoose.Schema({
  url:          { type: String, required: true, unique: true, index: true },
  filename:     { type: String },
  status:       { type: String, enum: ['success', 'failed'], default: 'success' },
  downloadedAt: { type: Date, default: Date.now },
});
const ReelLog = mongoose.models.ReelLog || mongoose.model('ReelLog', reelLogSchema);

// ── URL normalizer ───────────────────────────────────────────────────
function normalizeUrl(raw) {
  const u = new URL(raw);
  // Strip query params and trailing slash
  return `https://www.instagram.com${u.pathname.replace(/\/$/, '')}`;
}

async function main() {
  const rawUrl = process.argv[2];
  if (!rawUrl) {
    console.error('Usage: node execution/check_duplicate.js <url>');
    process.exit(2);
  }

  let url;
  try {
    url = normalizeUrl(rawUrl);
  } catch {
    console.error('Invalid URL:', rawUrl);
    process.exit(2);
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/instagram_reels';
  await mongoose.connect(mongoUri);

  const existing = await ReelLog.findOne({ url });

  if (existing && existing.status === 'success') {
    console.log(`DUPLICATE — already downloaded: ${existing.filename}`);
    console.log(JSON.stringify(existing.toObject(), null, 2));
    await mongoose.disconnect();
    process.exit(1); // exit 1 = is duplicate
  }

  console.log('NOT DUPLICATE — safe to proceed.');
  await mongoose.disconnect();
  process.exit(0); // exit 0 = not duplicate
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(2);
});
