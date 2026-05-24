import Link from 'next/link';
import HomeClient from '@/components/HomeClient';
import { WebAppJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { getAllPosts } from '@/lib/blog';

const faqs = [
    {
        question: 'How do I download an Instagram Reel?',
        answer: 'Copy the Reel URL from Instagram, paste it into the input field on ReelFetch, and click Download. You\'ll instantly get a direct MP4 download link.',
    },
    {
        question: 'Can I download TikTok videos without watermark?',
        answer: 'Yes! ReelFetch now supports TikTok. Switch to the TikTok tab, paste the video URL, and download a clean MP4 with no watermark.',
    },
    {
        question: 'Does ReelFetch support Facebook and YouTube?',
        answer: 'Yes. Use the platform tabs to switch between Instagram, TikTok, Facebook, and YouTube Shorts. ReelFetch handles all four.',
    },
    {
        question: 'Is ReelFetch free to use?',
        answer: 'Yes, ReelFetch is completely free. There are no hidden charges, no subscriptions, and no sign-up required.',
    },
    {
        question: 'Do I need to log in to my account?',
        answer: 'No. ReelFetch only processes publicly accessible content. You never need to enter any account credentials.',
    },
    {
        question: 'Can I download private Instagram Reels?',
        answer: 'No. ReelFetch only works with publicly accessible content. Private accounts and restricted content cannot be processed.',
    },
    {
        question: 'Does ReelFetch store the downloaded videos?',
        answer: 'No. ReelFetch never downloads or stores any video files on its servers. It only extracts the direct CDN link and passes it to your browser.',
    },
    {
        question: 'Is it legal to download videos?',
        answer: 'Downloading publicly available content for personal use is generally allowed, but you should always respect the original creator\'s rights. Never re-upload or monetize content you don\'t own.',
    },
    {
        question: 'Can I download TikTok videos without watermark?',
        answer: 'Yes. ReelFetch removes the TikTok watermark automatically. Paste your TikTok URL and download a clean MP4 with no watermark and full audio.',
    },
    {
        question: 'Does ReelFetch support Facebook videos?',
        answer: 'Yes. ReelFetch supports Facebook Reels and Facebook videos. Paste any public Facebook video URL and download it instantly as MP4.',
    },
    {
        question: 'Can I download YouTube Shorts?',
        answer: 'Yes. Paste any YouTube Shorts URL into ReelFetch and download it as an MP4 file. Works on mobile and desktop.',
    },
    {
        question: 'Which platforms does ReelFetch support?',
        answer: 'ReelFetch currently supports Instagram Reels, TikTok videos, Facebook videos and Reels, and YouTube Shorts. More platforms coming soon.',
    },
];

// Platform badges for the hero
const PLATFORM_PILLS = [
    { label: 'Instagram', color: 'from-pink-500 to-purple-600', emoji: '📸' },
    { label: 'TikTok', color: 'from-slate-700 to-teal-700', emoji: '🎵' },
    { label: 'Facebook', color: 'from-blue-600 to-blue-800', emoji: '👍' },
    { label: 'YouTube', color: 'from-red-600 to-red-800', emoji: '▶️' },
];

export default async function HomePage() {
    // Server-side: fetch latest 3 blog posts
    const latestPosts = getAllPosts().slice(0, 3);

    return (
        <div className="min-h-screen flex flex-col">
            {/* JSON-LD Structured Data */}
            <WebAppJsonLd />
            <FaqJsonLd faqs={faqs} />

            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-900/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {/* Logo */}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <span className="font-bold text-white text-lg tracking-tight">ReelFetch</span>
                    </div>
                    <nav className="flex items-center gap-4 text-sm text-slate-400">
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                        >
                            GitHub
                        </a>
                    </nav>
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-start px-4 pt-20 pb-16">
                <div className="w-full max-w-2xl space-y-10">
                    {/* Hero text */}
                    <div className="text-center space-y-4 animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                            4 Platforms · Free · No Login · No Watermark
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                            Download Videos From<br />
                            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                                Any Platform
                            </span>
                        </h1>

                        {/* Platform sub-heading */}
                        <p className="text-slate-500 text-sm font-semibold tracking-widest uppercase">
                            Instagram · TikTok · Facebook · YouTube Shorts
                        </p>

                        <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                            Free video downloader for Instagram Reels, TikTok videos, Facebook videos and YouTube Shorts. Paste any URL and download as MP4 instantly. No app needed. No login required.
                        </p>

                        {/* Platform gradient pills */}
                        <div className="flex flex-wrap justify-center gap-2 pt-1">
                            {PLATFORM_PILLS.map(({ label, color, emoji }) => (
                                <span
                                    key={label}
                                    className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${color} text-white text-xs font-semibold px-3 py-1 rounded-full opacity-90`}
                                >
                                    <span>{emoji}</span>
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Interactive client section */}
                    <HomeClient />
                </div>

                {/* ── Tips & Guides Blog Cards ──────────────────────────────── */}
                {latestPosts.length > 0 && (
                    <section className="w-full max-w-5xl mt-20" aria-label="Tips and Guides">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            Tips &amp; Guides
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {latestPosts.map((post) => {
                                const excerpt =
                                    post.description?.slice(0, 120) ||
                                    post.content.replace(/[#*`\[\]]/g, '').slice(0, 120);
                                return (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group glass-card p-6 flex flex-col gap-3 hover:border-brand-500/30 hover:bg-white/[0.04] transition-all duration-200"
                                        aria-label={`Read: ${post.title}`}
                                    >
                                        {/* Tag pill */}
                                        {post.tags?.[0] && (
                                            <span className="self-start text-[10px] font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                                                {post.tags[0]}
                                            </span>
                                        )}

                                        {/* Title */}
                                        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white leading-snug transition-colors">
                                            {post.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p className="text-xs text-slate-500 leading-relaxed flex-1">
                                            {excerpt.trim()}
                                            {excerpt.length >= 120 ? '…' : ''}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                            <span className="text-[10px] text-slate-600">{post.readTime}</span>
                                            <span className="text-xs text-brand-400 group-hover:text-brand-300 font-medium transition-colors">
                                                Read more →
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        <p className="text-center mt-6">
                            <Link href="/blog" className="text-sm text-slate-500 hover:text-brand-400 transition-colors">
                                View all guides →
                            </Link>
                        </p>
                    </section>
                )}

                {/* ── FAQ Section ──────────────────────────────────────────── */}
                <section className="w-full max-w-2xl mt-20">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details
                                key={i}
                                className="glass-card group"
                            >
                                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-medium text-slate-200 hover:text-white transition-colors list-none">
                                    <span>{faq.question}</span>
                                    <svg
                                        className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <p className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* ── SEO Content Block ────────────────────────────────────── */}
                <section className="w-full max-w-2xl mt-16">
                    <div className="glass-card p-8 space-y-4">
                        <h2 className="text-xl font-bold text-white">
                            The Best Way to Download Videos From Any Platform
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            ReelFetch is a free multi-platform video downloader supporting <strong className="text-slate-300">Instagram Reels</strong>,{' '}
                            <strong className="text-slate-300">TikTok videos</strong> (no watermark),{' '}
                            <strong className="text-slate-300">Facebook videos and Reels</strong>, and{' '}
                            <strong className="text-slate-300">YouTube Shorts</strong>.
                            Just paste any public video URL and download it as an MP4 file — no app install, no account login, no watermarks.
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Whether you want to <strong className="text-slate-300">save Instagram Reels to camera roll</strong>,{' '}
                            <strong className="text-slate-300">download TikTok without watermark</strong>, or grab a{' '}
                            <strong className="text-slate-300">Facebook reel downloader</strong> link,
                            ReelFetch handles it in seconds on any device — iPhone, Android, desktop, or tablet.
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Check out our{' '}
                            <Link href="/blog/how-to-download-instagram-reels" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">step-by-step guide</Link>,{' '}
                            learn{' '}
                            <Link href="/blog/how-to-save-instagram-reels-to-camera-roll" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">how to save Reels to camera roll</Link>,
                            or explore our{' '}
                            <Link href="/blog" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">tips &amp; guides blog</Link>.
                        </p>
                    </div>
                </section>
            </main>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm space-y-1">
                <p>
                    ReelFetch only processes publicly accessible content.{' '}
                    <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
                        Terms &amp; DMCA
                    </Link>
                </p>
                <p className="text-slate-700">
                    &copy; {new Date().getFullYear()} ReelFetch. Not affiliated with Instagram, TikTok, Meta, or Google.
                </p>
            </footer>
        </div>
    );
}
