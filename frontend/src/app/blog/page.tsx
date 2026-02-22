import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
    title: 'Blog',
    description:
        'Tips, guides, and insights on downloading Instagram Reels, saving videos, and understanding digital content rights.',
    openGraph: {
        title: 'Blog — ReelFetch',
        description: 'Tips and guides on downloading Instagram Reels.',
    },
};

export default function BlogIndexPage() {
    const posts = getAllPosts();

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Header ──────────────────────────────────────────────── */}
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
                        <Link href="/blog" className="text-white">Blog</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </nav>
                </div>
            </header>

            {/* ── Content ─────────────────────────────────────────────── */}
            <main className="flex-1 px-4 py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12 space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Blog</h1>
                        <p className="text-slate-400 text-base max-w-md mx-auto">
                            Guides and tips on downloading Instagram Reels, video saving, and content rights.
                        </p>
                    </div>

                    {posts.length === 0 ? (
                        <p className="text-center text-slate-500">No posts yet. Check back soon!</p>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="block glass-card p-6 hover:bg-white/10 transition-all duration-200 group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <h2 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors">
                                                {post.title}
                                            </h2>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {post.description}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <time dateTime={post.date}>
                                                    {new Date(post.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </time>
                                                <span>·</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                        <svg
                                            className="w-5 h-5 text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm">
                <p>
                    &copy; {new Date().getFullYear()} ReelFetch. Not affiliated with Instagram or Meta.
                </p>
            </footer>
        </div>
    );
}
