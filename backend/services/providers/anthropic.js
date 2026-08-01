'use strict';

/**
 * backend/services/providers/anthropic.js
 *
 * Adapter for the Claude API (official @anthropic-ai/sdk) — powers the LLM
 * text tools (summarizer, paraphraser, grammar, translator, caption, hashtag,
 * bio). One `complete()` helper; each tool supplies its own system + user text.
 *
 * Model defaults to claude-opus-4-8 (the SDK default). Override with AI_MODEL
 * in .env — e.g. claude-haiku-4-5 to cut cost on these high-volume free tools.
 *
 * Simple text transforms → no thinking, non-streaming, modest max_tokens.
 */

const AnthropicSDK = require('@anthropic-ai/sdk');
const Anthropic = AnthropicSDK.default || AnthropicSDK;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || null;
const AI_MODEL = process.env.AI_MODEL || 'claude-opus-4-8';

let client = null;

class ProviderNotConfiguredError extends Error {
    constructor(msg = 'ANTHROPIC_API_KEY is not configured.') {
        super(msg);
        this.name = 'ProviderNotConfiguredError';
    }
}

function isConfigured() {
    return Boolean(ANTHROPIC_API_KEY);
}

function getClient() {
    if (!client) client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    return client;
}

/**
 * Run a single-shot completion.
 * @param {{ system: string, user: string, maxTokens?: number }} opts
 * @returns {Promise<string>} the model's text output
 */
async function complete({ system, user, maxTokens = 1500 }) {
    if (!isConfigured()) throw new ProviderNotConfiguredError();

    const message = await getClient().messages.create({
        model: AI_MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
    });

    const text = (message.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();

    if (!text) throw new Error('The model returned an empty response.');
    return text;
}

module.exports = { isConfigured, complete, ProviderNotConfiguredError, model: () => AI_MODEL };
