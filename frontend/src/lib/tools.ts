/**
 * Tool registry — the feature-flag source of truth for the /tools section.
 *
 * `enabled: true`  → the tool has a live page and links out.
 * `enabled: false` → shown as "coming soon" on the index, not yet routable.
 *
 * Flipping a tool on/off here is the safe kill-switch: a half-finished tool
 * simply doesn't render, no redeploy of anything else required.
 */

export type ToolCategory = 'AI Writing' | 'Image' | 'Video' | 'Creator';

export interface Tool {
    slug: string;              // route under /tools/<slug> (when enabled)
    name: string;
    tagline: string;
    category: ToolCategory;
    enabled: boolean;
    emoji: string;
}

export const TOOLS: Tool[] = [
    // ── AI Writing ────────────────────────────────────────────────
    { slug: 'ai-detector', name: 'AI Content Detector', tagline: 'Check if text was written by AI.', category: 'AI Writing', enabled: true, emoji: '🤖' },
    { slug: 'ai-image-detector', name: 'AI Image Detector', tagline: 'Detect AI-generated images.', category: 'AI Writing', enabled: true, emoji: '🖼️' },
    { slug: 'plagiarism-checker', name: 'Plagiarism Checker', tagline: 'Scan text for copied content.', category: 'AI Writing', enabled: false, emoji: '📋' },
    { slug: 'ai-humanizer', name: 'AI Humanizer', tagline: 'Rewrite AI text to sound human.', category: 'AI Writing', enabled: false, emoji: '✍️' },
    { slug: 'ai-summarizer', name: 'AI Summarizer', tagline: 'Summarize any text instantly.', category: 'AI Writing', enabled: true, emoji: '📝' },
    { slug: 'ai-paraphraser', name: 'AI Paraphraser', tagline: 'Reword sentences and paragraphs.', category: 'AI Writing', enabled: true, emoji: '🔁' },
    { slug: 'grammar-checker', name: 'Grammar Checker', tagline: 'Fix grammar and spelling.', category: 'AI Writing', enabled: true, emoji: '✅' },
    { slug: 'ai-translator', name: 'AI Translator', tagline: 'Translate between languages.', category: 'AI Writing', enabled: true, emoji: '🌐' },
    { slug: 'word-counter', name: 'Word Counter', tagline: 'Count words and characters.', category: 'AI Writing', enabled: true, emoji: '🔢' },

    // ── Image ─────────────────────────────────────────────────────
    { slug: 'image-compressor', name: 'Image Compressor', tagline: 'Shrink image file size.', category: 'Image', enabled: true, emoji: '🗜️' },
    { slug: 'background-remover', name: 'Background Remover', tagline: 'Remove image backgrounds.', category: 'Image', enabled: false, emoji: '🎭' },
    { slug: 'image-upscaler', name: 'Image Upscaler', tagline: 'Increase image resolution.', category: 'Image', enabled: false, emoji: '🔍' },
    { slug: 'image-resizer', name: 'Image Resizer', tagline: 'Resize to any dimensions.', category: 'Image', enabled: true, emoji: '📐' },
    { slug: 'image-converter', name: 'Image Converter', tagline: 'JPG ↔ PNG ↔ WebP.', category: 'Image', enabled: true, emoji: '🔄' },
    { slug: 'watermark', name: 'Watermark', tagline: 'Add a watermark to images.', category: 'Image', enabled: true, emoji: '💧' },

    // ── Video ─────────────────────────────────────────────────────
    { slug: 'video-compressor', name: 'Video Compressor', tagline: 'Reduce video file size.', category: 'Video', enabled: true, emoji: '🎬' },
    { slug: 'video-converter', name: 'Video Converter', tagline: 'Convert between formats.', category: 'Video', enabled: true, emoji: '📼' },
    { slug: 'video-trimmer', name: 'Video Trimmer', tagline: 'Cut and trim clips.', category: 'Video', enabled: true, emoji: '✂️' },
    { slug: 'audio-extractor', name: 'Audio Extractor', tagline: 'Pull MP3 audio from video.', category: 'Video', enabled: true, emoji: '🎵' },
    { slug: 'subtitle-generator', name: 'Subtitle Generator', tagline: 'Auto-generate subtitles.', category: 'Video', enabled: true, emoji: '💬' },

    // ── Creator ───────────────────────────────────────────────────
    { slug: 'caption-generator', name: 'Caption Generator', tagline: 'Generate social captions.', category: 'Creator', enabled: true, emoji: '📣' },
    { slug: 'hashtag-generator', name: 'Hashtag Generator', tagline: 'Find relevant hashtags.', category: 'Creator', enabled: true, emoji: '#️⃣' },
    { slug: 'bio-generator', name: 'Bio Generator', tagline: 'Write a catchy profile bio.', category: 'Creator', enabled: true, emoji: '🪪' },
    { slug: 'qr-code-generator', name: 'QR Code Generator', tagline: 'Create custom QR codes.', category: 'Creator', enabled: true, emoji: '⬛' },
];

export const CATEGORY_ORDER: ToolCategory[] = ['AI Writing', 'Image', 'Video', 'Creator'];

export function getTool(slug: string): Tool | undefined {
    return TOOLS.find((t) => t.slug === slug);
}

export function enabledTools(): Tool[] {
    return TOOLS.filter((t) => t.enabled);
}

/**
 * Premium tools call a paid 3rd-party API (Claude / Copyleaks / Sightengine /
 * Deepgram). They're metered by the free-tier limit and unlock with Pro.
 * The client-side tools (not listed) cost nothing and stay free forever.
 */
export const PREMIUM_SLUGS = new Set<string>([
    'ai-detector', 'ai-image-detector', 'plagiarism-checker', 'ai-humanizer',
    'ai-summarizer', 'ai-paraphraser', 'grammar-checker', 'ai-translator',
    'caption-generator', 'hashtag-generator', 'bio-generator', 'subtitle-generator',
]);

export function isPremium(slug: string): boolean {
    return PREMIUM_SLUGS.has(slug);
}
