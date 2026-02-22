import Link from 'next/link';
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
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
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
        publisher: {
            '@type': 'Organization',
            name: 'ReelFetch',
            url: 'https://reelfetch.com',
        },
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

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
                <article className="max-w-2xl mx-auto">
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

                    {/* Post header */}
                    <header className="mb-10 space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
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
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs bg-brand-600/10 text-brand-400 px-2.5 py-1 rounded-full border border-brand-500/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    {/* Rendered content */}
                    <div
                        className="prose-blog"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />

                    {/* CTA */}
                    <div className="glass-card p-6 mt-12 text-center space-y-3">
                        <p className="text-lg font-semibold text-white">Ready to download a Reel?</p>
                        <p className="text-sm text-slate-400">
                            Try ReelFetch — free, fast, and no login needed.
                        </p>
                        <Link href="/" className="btn-primary inline-flex mt-2">
                            Download a Reel Now
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
    );
}
