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
                                            priority
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
                                                <svg className="inline w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                                </svg> Instagram
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
                                            <svg className="inline w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.2 8.2 0 004.79 1.52V6.92a4.86 4.86 0 01-1.02-.23z" />
                                            </svg> TikTok
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
                                            <svg className="inline w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg> Facebook
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
                                                <svg className="inline w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg> YouTube
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
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="inline w-3 h-3" fill="currentColor" aria-hidden="true">
                                                <path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-29.9-20.7l-111.5 0 76.9-179.4z" />
                                            </svg> Instant
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
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="inline w-3 h-3" fill="currentColor" aria-hidden="true">
                                                <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                                            </svg> No Watermark
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
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="inline w-4 h-4 text-brand-500 flex-shrink-0" fill="currentColor" aria-hidden="true">
                                                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                                            </svg>
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
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8 opacity-20" fill="currentColor" aria-hidden="true">
                                                            <path d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" />
                                                        </svg>
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
                                    View all guides <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="inline w-3 h-3" fill="currentColor" aria-hidden="true"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" /></svg>
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

