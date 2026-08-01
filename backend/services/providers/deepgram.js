'use strict';

/**
 * backend/services/providers/deepgram.js
 *
 * Adapter for the Deepgram speech-to-text API — powers the Subtitle Generator.
 *
 * Accepts either a remote audio URL (Deepgram fetches it) or raw audio/video
 * bytes. Returns a normalised { transcript, segments, durationSec } where each
 * segment is { start, end, text } — from which we build .srt / .vtt.
 *
 *   POST https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true
 *        &punctuate=true&utterances=true
 *   Authorization: Token <DEEPGRAM_API_KEY>
 *   body: {"url": "..."}  (application/json)  OR  raw bytes (audio/*)
 *
 * Swapping providers = replacing this one file.
 */

const axios = require('axios');

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || null;
const ENDPOINT =
    'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&utterances=true';

class ProviderNotConfiguredError extends Error {
    constructor(msg = 'DEEPGRAM_API_KEY is not configured.') {
        super(msg);
        this.name = 'ProviderNotConfiguredError';
    }
}

function isConfigured() {
    return Boolean(DEEPGRAM_API_KEY);
}

// Fallback: group flat words into ~7-word / ~5s caption segments.
function chunkWords(words) {
    const segments = [];
    let cur = null;
    for (const w of words) {
        const text = w.punctuated_word || w.word || '';
        if (!cur) {
            cur = { start: w.start, end: w.end, words: [text] };
        } else if (cur.words.length >= 7 || w.end - cur.start > 5) {
            segments.push({ start: cur.start, end: cur.end, text: cur.words.join(' ') });
            cur = { start: w.start, end: w.end, words: [text] };
        } else {
            cur.words.push(text);
            cur.end = w.end;
        }
    }
    if (cur) segments.push({ start: cur.start, end: cur.end, text: cur.words.join(' ') });
    return segments;
}

/**
 * @param {{ url?: string, buffer?: Buffer, mimetype?: string }} input
 * @returns {Promise<{ transcript: string, segments: {start,end,text}[], durationSec: number }>}
 */
async function transcribe({ url, buffer, mimetype }) {
    if (!isConfigured()) throw new ProviderNotConfiguredError();

    let body;
    let contentType;
    if (url) {
        body = JSON.stringify({ url });
        contentType = 'application/json';
    } else if (buffer) {
        body = buffer;
        contentType = mimetype || 'application/octet-stream';
    } else {
        throw new Error('transcribe() requires a url or buffer.');
    }

    const res = await axios.post(ENDPOINT, body, {
        headers: { Authorization: `Token ${DEEPGRAM_API_KEY}`, 'Content-Type': contentType },
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
    });

    const results = res.data && res.data.results;
    const alt = results && results.channels && results.channels[0] && results.channels[0].alternatives
        ? results.channels[0].alternatives[0]
        : null;
    const transcript = (alt && alt.transcript ? alt.transcript : '').trim();

    let segments = [];
    if (Array.isArray(results && results.utterances) && results.utterances.length) {
        segments = results.utterances
            .map((u) => ({ start: u.start, end: u.end, text: (u.transcript || '').trim() }))
            .filter((s) => s.text);
    } else if (alt && Array.isArray(alt.words) && alt.words.length) {
        segments = chunkWords(alt.words);
    }

    const durationSec = (res.data && res.data.metadata && res.data.metadata.duration) || 0;
    return { transcript, segments, durationSec };
}

module.exports = { isConfigured, transcribe, ProviderNotConfiguredError };
