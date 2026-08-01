import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import ToolSEO from '@/components/tools/ToolSEO';

/**
 * Shared chrome for every tool page: header (logo + nav), animated background,
 * a centered content column, and a footer. Keeps all /tools/* pages consistent
 * without duplicating layout markup.
 */
export default function ToolShell({
    title,
    subtitle,
    slug,
    children,
}: {
    title: string;
    subtitle?: string;
    slug?: string;
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Animated background blobs */}
            <div className="blob-container">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <div className="page-content min-h-screen flex flex-col">
                {/* ── Header ──────────────────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-900/80 backdrop-blur-md">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <span className="font-bold text-white text-lg tracking-tight">ReelFetch</span>
                        </Link>
                        <nav className="flex items-center gap-4 text-sm text-slate-400">
                            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                            <ThemeToggle />
                        </nav>
                    </div>
                </header>

                {/* ── Main ────────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-16">
                    <div className="w-full max-w-2xl mx-auto space-y-8">
                        {slug && (
                            <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
                                <span aria-hidden>/</span>
                                <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
                                <span aria-hidden>/</span>
                                <span className="text-slate-400">{title}</span>
                            </nav>
                        )}

                        <div className="text-center space-y-3">
                            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {children}

                        {slug && <ToolSEO slug={slug} name={title} />}
                    </div>
                </main>

                {/* ── Footer ──────────────────────────────────────────── */}
                <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm space-y-1">
                    <p>
                        <Link href="/tools" className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
                            All tools
                        </Link>
                        {' · '}
                        <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
                            Terms
                        </Link>
                    </p>
                    <p className="text-slate-700">&copy; {new Date().getFullYear()} ReelFetch by ByteOasis.</p>
                </footer>
            </div>
        </>
    );
}
