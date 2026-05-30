import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: post.title,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.date,
            images: post.featuredImage ? [{ url: post.featuredImage }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: post.featuredImage ? [post.featuredImage] : [],
        },
        alternates: {
            canonical: `/blog/${slug}`,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) notFound();

    // Compile markdown content to HTML
    const htmlContent = await marked(post.content);

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        image: post.featuredImage,
        publisher: {
            '@type': 'Organization',
            name: 'ReelFetch',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://instagram-reel-downloader.byteoasis.ng',
        },
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

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
                            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        </nav>
                    </div>
                </header>

                {/* ── Article ─────────────────────────────────────────────── */}
                <main className="flex-1 px-4 py-12">
                    <article className="max-w-3xl mx-auto">
                        {/* Back to blog */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            All Posts
                        </Link>

                        {/* Featured Image */}
                        {post.featuredImage && (
                            <div className="aspect-video w-full relative rounded-3xl overflow-hidden mb-10 shadow-2xl shadow-black/50">
                                <Image
                                    src={post.featuredImage}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 800px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/40 to-transparent" />
                            </div>
                        )}

                        {/* Post header */}
                        <header className="mb-10 space-y-4">
                            {post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight font-display">
                                {post.title}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-slate-500 pt-2">
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
                        </header>

                        {/* Rendered content */}
                        <div
                            className="prose-blog"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />

                        {/* CTA */}
                        <div className="glass-card p-8 mt-16 text-center space-y-4 border-brand-500/20 bg-brand-500/5">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-brand-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-5 h-5 text-white" fill="currentColor" aria-hidden="true">
                                    <path d="M0 336c0 79.5 64.5 144 144 144l368 0c70.7 0 128-57.3 128-128 0-59.5-40.6-109.5-95.4-123.3C538.7 112.3 478.3 64 408 64c-42.5 0-81.2 16.5-110.1 43.4-16.1-32.9-49.8-55.5-89.5-55.5-54.4 0-98.5 44-98.5 98.4 0 6.2 .6 12.3 1.7 18.2C44.6 172.2 0 248.5 0 336zM288 416l0-192 80 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L256 160c-17.7 0-32 14.3-32 32l0 192c0 17.7 14.3 32 32 32s32-14.3 32-32z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white font-display">Ready to download a Reel?</h2>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                Try ReelFetch — the fastest way to save videos from Instagram, TikTok, and more.
                            </p>
                            <Link href="/" className="btn-primary inline-flex mt-2">
                                Start Downloading
                            </Link>
                        </div>
                    </article>
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
