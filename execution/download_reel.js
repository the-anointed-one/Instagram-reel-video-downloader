#!/usr/bin/env node
/**
 * execution/download_reel.js
 *
 * Layer 3 — Deterministic CLI tool
 * Directive: directives/download_reel.md
 *
 * Usage:
 *   node execution/download_reel.js <instagram-reel-url>
 *
 * Runs the full download pipeline without the HTTP server:
 *   1. Duplicate check (MongoDB)
 *   2. yt-dlp extraction via child_process
 *   3. Log result to MongoDB
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ── Mongoose model ───────────────────────────────────────────────────
const reelLogSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true, index: true },
    filename: { type: String },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    errorMessage: { type: String },
    downloadedAt: { type: Date, default: Date.now },
});
const ReelLog = mongoose.models.ReelLog || mongoose.model('ReelLog', reelLogSchema);

// ── URL normalizer ───────────────────────────────────────────────────
function normalizeUrl(raw) {
    const u = new URL(raw);
    return `https://www.instagram.com${u.pathname.replace(/\/$/, '')}`;
}

// ── Derive a filename from the URL ───────────────────────────────────
function slugFromUrl(url) {
    const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : `reel_${Date.now()}`;
}

// ── yt-dlp via child_process ─────────────────────────────────────────
function runYtDlp(url, outputPath) {
    return new Promise((resolve, reject) => {
        const ytdlp = process.env.YTDLP_PATH || 'yt-dlp';
        const args = [
            '--output', outputPath,
            '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format', 'mp4',
            '--no-playlist',
            '--progress',
            url,
        ];

        console.log(`\nRunning: ${ytdlp} ${args.join(' ')}\n`);
        const proc = spawn(ytdlp, args, { stdio: ['ignore', 'pipe', 'pipe'] });

        proc.stdout.on('data', (d) => process.stdout.write(d));
        proc.stderr.on('data', (d) => process.stderr.write(d));

        proc.on('close', (code) => {
            if (code === 0) resolve(outputPath);
            else reject(new Error(`yt-dlp exited with code ${code}`));
        });

        proc.on('error', (err) => {
            if (err.code === 'ENOENT') {
                reject(new Error(`yt-dlp not found. Install it with: brew install yt-dlp`));
            } else {
                reject(err);
            }
        });
    });
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
    const rawUrl = process.argv[2];
    if (!rawUrl) {
        console.error('Usage: node execution/download_reel.js <url>');
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
    const downloadDir = path.resolve(__dirname, '..', process.env.DOWNLOAD_DIR || 'downloads');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // 1. Duplicate check
    const existing = await ReelLog.findOne({ url });
    if (existing && existing.status === 'success') {
        console.log(`Already downloaded: ${existing.filename}. Skipping.`);
        await mongoose.disconnect();
        process.exit(0);
    }

    // 2. Ensure download dir exists
    fs.mkdirSync(downloadDir, { recursive: true });

    const slug = slugFromUrl(url);
    const outputPath = path.join(downloadDir, `${slug}.mp4`);

    let log;
    try {
        // 3. Run yt-dlp
        await runYtDlp(url, outputPath);

        // 4. Log success
        log = await ReelLog.findOneAndUpdate(
            { url },
            { url, filename: `${slug}.mp4`, status: 'success', downloadedAt: new Date() },
            { upsert: true, new: true }
        );
        console.log('\n✓ Download complete:', outputPath);
        console.log('Logged to MongoDB:', log._id.toString());
    } catch (err) {
        // 5. Log failure
        await ReelLog.findOneAndUpdate(
            { url },
            { url, status: 'failed', errorMessage: err.message, downloadedAt: new Date() },
            { upsert: true, new: true }
        );
        console.error('\n✗ Download failed:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(2);
});
