import Link from 'next/link';
import HomeClient from '@/components/HomeClient';
import { WebAppJsonLd, FaqJsonLd } from '@/components/JsonLd';

const faqs = [
    {
        question: 'How do I download an Instagram Reel?',
        answer: 'Copy the Reel URL from Instagram, paste it into the input field on ReelFetch, and click "Fetch Reel". You\'ll instantly get a direct MP4 download link.',
    },
    {
        question: 'Is ReelFetch free to use?',
        answer: 'Yes, ReelFetch is completely free. There are no hidden charges, no subscriptions, and no sign-up required.',
    },
    {
        question: 'Do I need to log in to my Instagram account?',
        answer: 'No. ReelFetch only processes publicly accessible Reels. You never need to enter your Instagram credentials.',
    },
    {
        question: 'Can I download private Instagram Reels?',
        answer: 'No. ReelFetch only works with publicly accessible Reels. Private accounts and restricted content cannot be processed.',
    },
    {
        question: 'Does ReelFetch store the downloaded videos?',
        answer: 'No. ReelFetch never downloads or stores any video files on its servers. It only extracts the direct CDN link from Instagram and passes it to your browser.',
    },
    {
        question: 'Is it legal to download Instagram Reels?',
        answer: 'Downloading publicly available content for personal use is generally allowed, but you should always respect the original creator\'s rights. Never re-upload or monetize content you don\'t own.',
    },
];

export default function HomePage() {
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
                            Free &amp; No Login Required
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                            Instagram Reel Downloader<br />
                            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                                Download Reels Instantly
                            </span>
                        </h1>
                        <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                            Free reels video download tool — paste any Reel URL and save Instagram Reels as MP4 in seconds. No app needed.
                        </p>
                    </div>

                    {/* Interactive client section */}
                    <HomeClient />
                </div>

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
                            The Best Way to Download Reels From Instagram
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            ReelFetch is a free <strong className="text-slate-300">Instagram Reel Downloader</strong> built for speed and privacy.
                            Just paste any public Reel URL to <strong className="text-slate-300">download reels</strong> as MP4 files — no app install,
                            no account login, no watermarks. Whether you want to <strong className="text-slate-300">save Instagram Reels</strong> for
                            offline viewing or back up your own content, ReelFetch handles it in seconds.
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Unlike other tools, our <strong className="text-slate-300">reels video download</strong> engine extracts the direct CDN link
                            and streams it straight to your browser. You can <strong className="text-slate-300">download IG Reels</strong> with
                            full audio quality on any device — iPhone, Android, desktop, or tablet.
                            Need to <strong className="text-slate-300">download Instagram Reels with audio</strong>?
                            ReelFetch always preserves the original soundtrack.
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Looking for an <strong className="text-slate-300">Instagram Reels download app</strong>? You don&apos;t need one —
                            ReelFetch works directly in your browser. Check out our{' '}
                            <Link href="/blog/how-to-download-instagram-reels" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">step-by-step guide</Link>,{' '}
                            learn how to <Link href="/blog/download-instagram-reels-with-music-audio" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">download Reels with music</Link>,
                            or browse our <Link href="/blog" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">blog</Link> for more tips.
                        </p>
                    </div>
                </section>
            </main>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm space-y-1">
                <p>
                    ReelFetch only processes publicly accessible Instagram Reels.{' '}
                    <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
                        Terms &amp; DMCA
                    </Link>
                </p>
                <p className="text-slate-700">
                    &copy; {new Date().getFullYear()} ReelFetch. Not affiliated with Instagram or Meta.
                </p>
            </footer>
        </div>
    );
}
