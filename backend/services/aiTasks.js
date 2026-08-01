'use strict';

/**
 * backend/services/aiTasks.js
 *
 * Registry of LLM text tools. Each task defines:
 *   - maxInputChars: server-side cap (bounds cost per call)
 *   - maxTokens:     output ceiling for the model
 *   - build(input):  returns { system, user } prompt for that tool
 *
 * The route layer is generic — it validates input length, caches, meters spend,
 * and calls the provider. Adding a tool = adding an entry here + a page.
 */

// Whitelist a value against an allowed set, falling back to a default.
function pick(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
}

// Sanitise a free-text option (e.g. a target language): single line, bounded.
function cleanShort(value, fallback, max = 40) {
    if (typeof value !== 'string') return fallback;
    const v = value.replace(/[\r\n]+/g, ' ').trim().slice(0, max);
    return v || fallback;
}

const AI_TASKS = {
    summarizer: {
        maxInputChars: 8000,
        maxTokens: 1024,
        build: ({ text, options }) => {
            const length = pick(options.length, ['short', 'medium', 'long'], 'medium');
            const guide = {
                short: 'in 1–2 concise sentences',
                medium: 'in a short paragraph',
                long: 'in a few clear paragraphs covering the key points',
            }[length];
            return {
                system: 'You are an expert editor. Summarise the user\'s text accurately and clearly. Output only the summary — no preamble, no "Here is", no meta-commentary.',
                user: `Summarise the following text ${guide}:\n\n${text}`,
            };
        },
    },

    paraphraser: {
        maxInputChars: 5000,
        maxTokens: 1600,
        build: ({ text, options }) => {
            const tone = pick(options.tone, ['standard', 'formal', 'casual', 'fluent', 'simple'], 'standard');
            return {
                system: 'You are a skilled writer. Rewrite the user\'s text in your own words while preserving its meaning. Output only the rewritten text — no preamble or explanation.',
                user: `Rewrite the following text in a ${tone} style:\n\n${text}`,
            };
        },
    },

    grammar: {
        maxInputChars: 5000,
        maxTokens: 1600,
        build: ({ text }) => ({
            system: 'You are a meticulous proofreader. Correct grammar, spelling, and punctuation while preserving the writer\'s meaning and voice. Output only the corrected text — no explanations or lists of changes.',
            user: `Correct the following text:\n\n${text}`,
        }),
    },

    translator: {
        maxInputChars: 5000,
        maxTokens: 1800,
        build: ({ text, options }) => {
            const language = cleanShort(options.language, 'English');
            return {
                system: 'You are a professional translator. Translate the user\'s text naturally and accurately. Output only the translation — no notes, no transliteration, no preamble.',
                user: `Translate the following text into ${language}:\n\n${text}`,
            };
        },
    },

    caption: {
        maxInputChars: 1000,
        maxTokens: 800,
        build: ({ text, options }) => {
            const platform = pick(options.platform, ['instagram', 'tiktok', 'youtube', 'linkedin', 'x', 'facebook'], 'instagram');
            const tone = pick(options.tone, ['casual', 'professional', 'funny', 'inspirational'], 'casual');
            return {
                system: 'You are a social media copywriter. Write scroll-stopping captions. Output 3 distinct caption options as a numbered list (1., 2., 3.) — nothing else.',
                user: `Write 3 ${tone} ${platform} captions for a post about:\n\n${text}`,
            };
        },
    },

    hashtag: {
        maxInputChars: 500,
        maxTokens: 400,
        build: ({ text, options }) => {
            const platform = pick(options.platform, ['instagram', 'tiktok', 'youtube', 'linkedin', 'x', 'facebook'], 'instagram');
            return {
                system: 'You are a social media strategist. Generate relevant, discoverable hashtags. Output only a single space-separated line of hashtags (each starting with #) — no commentary.',
                user: `Generate 15 relevant ${platform} hashtags for a post about:\n\n${text}`,
            };
        },
    },

    bio: {
        maxInputChars: 800,
        maxTokens: 500,
        build: ({ text, options }) => {
            const platform = pick(options.platform, ['instagram', 'tiktok', 'twitter', 'linkedin', 'general'], 'instagram');
            const tone = pick(options.tone, ['casual', 'professional', 'funny', 'aesthetic'], 'casual');
            return {
                system: 'You are a personal branding expert. Write catchy, concise profile bios. Output 3 distinct bio options as a numbered list (1., 2., 3.) — nothing else.',
                user: `Write 3 ${tone} ${platform} profile bios for someone described as:\n\n${text}`,
            };
        },
    },
};

module.exports = { AI_TASKS };
