import Link from 'next/link';
import Image from 'next/image';
import HomeClient from '@/components/HomeClient';
import { WebAppJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { getAllPosts } from '@/lib/blog';
import ThemeToggle from '@/components/ThemeToggle';
import DownloadCounter from '@/components/DownloadCounter';

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

export default async function HomePage() {
    // Server-side: fetch latest 3 blog posts
    const latestPosts = getAllPosts().slice(0, 3);

    return (
        <>
            {/* Animated background blobs */}
            <div className="blob-container">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <div className="page-content min-h-screen flex flex-col">
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
                            <ThemeToggle />
                        </nav>
                    </div>
                </header>

                {/* ── Hero ────────────────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col items-center justify-start px-4 pt-12 pb-16">
                    <div className="w-full max-w-5xl mx-auto space-y-6">
                        {/* Top: badge + headline — centered, compact */}
                        <div className="text-center space-y-3 animate-fade-in">
                            {/* Badge pill */}
                            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                                4 Platforms · Free · No Login · No Watermark
                            </div>

                            {/* Headline — tighter, smaller than before */}
                            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                                Download Videos From{' '}
                                <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                                    Any Platform
                                </span>
                            </h1>

                            {/* Platform sub-label */}
                            <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase">
                                Instagram · TikTok · Facebook · YouTube Shorts
                            </p>
                        </div>

                        {/* Middle: mosaic left + description right — compact two-column */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center max-w-4xl mx-auto">
                            {/* LEFT: mosaic grid of 6 rich thumbnail cards */}
                            <div className="grid grid-cols-2 gap-2" style={{ gridTemplateRows: 'auto auto auto' }}>
                                {/* Card 1 — Instagram — tall (spans 2 rows) */}
                                <div className="row-span-2 rounded-2xl overflow-hidden relative" style={{ minHeight: '200px' }}>
                                    <div className="absolute inset-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"
                                            alt="Instagram Reel thumbnail showing a vertical mountain landscape"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 200px"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30" />
                                    {/* Fake video content */}
                                    <div className="absolute inset-0 flex flex-col justify-between p-3">
                                        <div className="flex justify-end">
                                            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Fake waveform bars */}
                                        <div className="space-y-1.5">
                                            <div className="flex gap-0.5 items-end h-6">
                                                {[3, 5, 4, 7, 5, 3, 6, 4, 5, 3].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-white/40 rounded-sm" style={{ height: `${h * 3}px` }} />
                                                ))}
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                                                <i className="fa-brands fa-instagram" aria-hidden="true" /> Instagram
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 — TikTok */}
                                <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: '96px' }}>
                                    <div className="absolute inset-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80"
                                            alt="TikTok video thumbnail showing a music performance"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 200px"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 flex flex-col justify-between p-2.5">
                                        <div className="flex justify-end">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full self-start">
                                            <i className="fa-brands fa-tiktok" aria-hidden="true" /> TikTok
                                        </span>
                                    </div>
                                </div>

                                {/* Card 3 — Facebook */}
                                <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: '96px' }}>
                                    <div className="absolute inset-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80"
                                            alt="Facebook video thumbnail showing a group of friends"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 200px"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 flex flex-col justify-between p-2.5">
                                        <div className="flex justify-end">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full self-start">
                                            <i className="fa-brands fa-facebook" aria-hidden="true" /> Facebook
                                        </span>
                                    </div>
                                </div>

                                {/* Card 4 — YouTube — tall (spans 2 rows) */}
                                <div className="row-span-2 rounded-2xl overflow-hidden relative" style={{ minHeight: '200px' }}>
                                    <div className="absolute inset-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80"
                                            alt="YouTube Shorts thumbnail showing a video cinema scene"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 200px"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 flex flex-col justify-between p-3">
                                        <div className="flex justify-end">
                                            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex gap-0.5 items-end h-6">
                                                {[4, 6, 3, 7, 5, 4, 6, 3, 5, 4].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-white/40 rounded-sm" style={{ height: `${h * 3}px` }} />
                                                ))}
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                                                <i className="fa-brands fa-youtube" aria-hidden="true" /> YouTube
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 5 — Brand orange */}
                                <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: '96px' }}>
                                    <div className="absolute inset-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
                                            alt="Fitness and energy lifestyle image"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 200px"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 flex flex-col justify-between p-2.5">
                                        <div className="flex justify-end">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full self-start">
                                            <i className="fa-solid fa-bolt" aria-hidden="true" /> Instant
                                        </span>
                                    </div>
                                </div>

                                {/* Card 6 — Teal/cyan */}
                                <div className="rounded-2xl overflow-hidden relative" style={{ minHeight: '96px' }}>
                                    <div className="absolute inset-0">
                                        <Image
                                            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80"
                                            alt="Nature and outdoors landscape"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 200px"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 flex flex-col justify-between p-2.5">
                                        <div className="flex justify-end">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full self-start">
                                            <i className="fa-solid fa-ban" aria-hidden="true" /> No Watermark
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* END mosaic */}

                            {/* RIGHT: description text */}
                            <div className="space-y-4">
                                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                    Free video downloader for Instagram Reels, TikTok videos, Facebook videos and YouTube Shorts. Paste any URL and download as MP4 instantly. No app needed. No login required.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-400">
                                    {[
                                        'No watermark on TikTok',
                                        'YouTube audio extraction (MP3)',
                                        'Batch download up to 10 URLs',
                                        '24-hour smart caching',
                                    ].map((text) => (
                                        <li key={text} className="flex items-center gap-2">
                                            <i className="fa-solid fa-circle-check text-brand-500 flex-shrink-0" aria-hidden="true" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* END two-column */}

                        {/* Download form — full width below */}
                        <HomeClient />
                    </div>

                    <DownloadCounter />

                    {/* ── Tips & Guides Blog Cards ──────────────────────────────── */}
                    {latestPosts.length > 0 && (
                        <section className="w-full max-w-5xl mt-20" aria-label="Tips and Guides">
                            <h2 className="text-2xl font-bold text-white text-center mb-8 font-display">
                                Tips &amp; Guides
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {latestPosts.map((post) => {
                                    const excerpt =
                                        post.description?.slice(0, 100) ||
                                        post.content.replace(/[#*`\[\]]/g, '').slice(0, 100);
                                    return (
                                        <Link
                                            key={post.slug}
                                            href={`/blog/${post.slug}`}
                                            className="group glass-card overflow-hidden hover:bg-white/[0.04] transition-all duration-200 flex flex-col"
                                            aria-label={`Read: ${post.title}`}
                                        >
                                            {/* Image */}
                                            <div className="aspect-video w-full relative overflow-hidden bg-surface-800">
                                                {post.featuredImage ? (
                                                    <Image
                                                        src={post.featuredImage}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                        <i className="fa-solid fa-image text-2xl opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 to-transparent" />
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex flex-col flex-1 space-y-2">
                                                {/* Tag pill */}
                                                {post.tags?.[0] && (
                                                    <span className="self-start text-[9px] font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                                                        {post.tags[0]}
                                                    </span>
                                                )}

                                                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white leading-snug transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>

                                                <p className="text-[11px] text-slate-500 leading-relaxed flex-1 line-clamp-2">
                                                    {excerpt.trim()}…
                                                </p>

                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                                    <span className="text-[9px] text-slate-600">{post.readTime}</span>
                                                    <span className="text-[11px] text-brand-400 group-hover:text-brand-300 font-medium transition-colors">
                                                        Read more →
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                            <p className="text-center mt-8">
                                <Link href="/blog" className="text-sm text-slate-500 hover:text-brand-400 transition-colors inline-flex items-center gap-2">
                                    View all guides <i className="fa-solid fa-arrow-right text-xs" />
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
                                            stroke="currentColor" strokeWidth={2}
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
        </>
    );
}

