import Link from 'next/link';
import Image from 'next/image';
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
            {/* Animated background blobs */}
            <div className="blob-container">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <div className="page-content min-h-screen flex flex-col">
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
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12 space-y-3">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white font-display">Blog</h1>
                            <p className="text-slate-400 text-base max-w-md mx-auto">
                                Guides and tips on downloading Instagram Reels, video saving, and content rights.
                            </p>
                        </div>

                        {posts.length === 0 ? (
                            <p className="text-center text-slate-500">No posts yet. Check back soon!</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group glass-card overflow-hidden hover:bg-white/[0.04] transition-all duration-200 flex flex-col"
                                    >
                                        {/* Image Header */}
                                        <div className="aspect-video w-full relative overflow-hidden bg-surface-800">
                                            {post.featuredImage ? (
                                                <Image
                                                    src={post.featuredImage}
                                                    alt={post.title}
                                                    fill
                                                    unoptimized
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                    <i className="fa-solid fa-image text-3xl opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 to-transparent" />
                                        </div>

                                        {/* Post Content */}
                                        <div className="p-6 flex flex-col flex-1 space-y-3">
                                            {/* Tag */}
                                            {post.tags?.[0] && (
                                                <span className="self-start text-[10px] font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                                                    {post.tags[0]}
                                                </span>
                                            )}

                                            <h2 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h2>
                                            
                                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 flex-1">
                                                {post.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] text-slate-500">
                                                <time dateTime={post.date}>
                                                    {new Date(post.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </time>
                                                <span>{post.readTime}</span>
                                            </div>
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
        </div>
    );
}
