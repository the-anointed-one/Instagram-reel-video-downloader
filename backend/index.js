'use strict';

const https = require('https');

/**
 * backend/index.js
 *
 * ReelFetch API — Express entry point
 * Security: Helmet + CORS + rate limiting
 * Routes:   POST /api/download
 *           GET  /api/health
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cache = require('./services/cache');
const { rateLimiter } = require('./middleware/rateLimiter');
const downloadRouter = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ─────────────────────────────────────────────
app.set('trust proxy', 1); // Trust first proxy (Render, Railway, Nginx)
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    // Add additional origins here for staging/production
];
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (server-to-server, curl)
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        },
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
    })
);

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // small limit — we only accept a URL
app.use(express.urlencoded({ extended: false }));

// ── Request logging ──────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health checks (BEFORE rate limiting) ─────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'reelfetch-api', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rate limiting (applied to all /api routes) ───────────────────
app.use('/api', rateLimiter);

// ── Routes ───────────────────────────────────────────────────────
app.use('/api', downloadRouter);

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('[error]', err.message);
    res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
});

// ── Start ─────────────────────────────────────────────────────────
async function start() {
    // Connect Redis (non-blocking / degraded mode if unavailable)
    await cache.connect();

    app.listen(PORT, () => {
        console.log(`\n🚀 ReelFetch API running on http://localhost:${PORT}`);
        console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   CORS allowed: ${allowedOrigins.join(', ')}`);

        // ── Self-ping to prevent Render free-tier spin-down ──────
        // Set SELF_PING=true and RENDER_EXTERNAL_URL in env to enable
        if (process.env.SELF_PING === 'true' && process.env.RENDER_EXTERNAL_URL) {
            const pingUrl = `${process.env.RENDER_EXTERNAL_URL}/api/health`;
            const FOURTEEN_MIN = 14 * 60 * 1000;

            setInterval(() => {
                https.get(pingUrl, (res) => {
                    console.log(`[self-ping] ${res.statusCode} @ ${new Date().toISOString()}`);
                }).on('error', (err) => {
                    console.warn('[self-ping] Failed:', err.message);
                });
            }, FOURTEEN_MIN);

            console.log(`   Self-ping enabled → ${pingUrl} every 14 min`);
        }
    });
}

start();
