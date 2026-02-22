import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service & DMCA — ReelFetch',
    description: 'Terms of use and DMCA policy for ReelFetch Instagram Reel Downloader.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen px-4 py-16">
            <div className="max-w-2xl mx-auto space-y-10">
                {/* Back link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to ReelFetch
                </Link>

                <div className="glass-card p-8 space-y-8">
                    <h1 className="text-3xl font-bold text-white">Terms of Service &amp; DMCA Policy</h1>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-200">1. Acceptable Use</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            ReelFetch is a tool for downloading publicly accessible Instagram Reels for personal,
                            non-commercial use only. You agree not to use this service to download, redistribute, or
                            monetize content that you do not own or do not have explicit permission to use.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-200">2. What We Do Not Do</h2>
                        <ul className="text-slate-400 text-sm space-y-1.5 list-disc list-inside leading-relaxed">
                            <li>We do not download or store any video files on our servers.</li>
                            <li>We do not automate or simulate Instagram logins.</li>
                            <li>We do not bypass private account protections or DRM.</li>
                            <li>We only process URLs that are publicly accessible without authentication.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-200">3. Intellectual Property</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            All content on Instagram is owned by respective creators and subject to Instagram&apos;s
                            Terms of Service. Downloading content does not transfer any rights to you. You are
                            solely responsible for ensuring your use complies with applicable copyright law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-200">4. DMCA Takedown Policy</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            If you believe your copyrighted content has been made accessible through our service
                            in a way that infringes your rights, please send a DMCA takedown notice to our contact
                            email. We will respond promptly and take appropriate action.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Because we do not store any videos, a takedown notice to us is advisory only — the
                            content is hosted on Instagram&apos;s own CDN. We encourage you to also file a complaint
                            directly with Instagram/Meta.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-200">5. Disclaimer</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            ReelFetch is provided &quot;as is&quot; without warranty of any kind. We are not affiliated with,
                            endorsed by, or connected to Instagram or Meta Platforms, Inc. Service availability
                            depends on Instagram&apos;s public page structure and may change without notice.
                        </p>
                    </section>

                    <p className="text-slate-600 text-xs border-t border-white/5 pt-6">
                        Last updated: February 2026. By using ReelFetch, you agree to these terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
