import Link from 'next/link';
import { TOOLS, CATEGORY_ORDER, isPremium } from '@/lib/tools';

/**
 * Homepage tools showcase — features every enabled tool, grouped by category.
 * Reads the tools registry so it stays in sync automatically. Each card links
 * to its tool page, giving the whole suite internal links from the homepage.
 */
export default function ToolsShowcase() {
    const enabled = TOOLS.filter((t) => t.enabled);
    if (enabled.length === 0) return null;

    return (
        <section className="w-full max-w-5xl mt-20" aria-label="Free online tools">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white font-display">Plus {enabled.length}+ Free Tools</h2>
                <p className="text-sm text-slate-500 mt-2">
                    AI writing, image, video and creator tools — no login, no install, no watermark.
                </p>
            </div>

            <div className="space-y-8">
                {CATEGORY_ORDER.map((category) => {
                    const tools = enabled.filter((t) => t.category === category);
                    if (tools.length === 0) return null;

                    return (
                        <div key={category}>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{category}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {tools.map((tool) => (
                                    <Link
                                        key={tool.slug}
                                        href={`/tools/${tool.slug}`}
                                        className="glass-card p-4 flex items-start gap-3 hover:bg-white/[0.04] hover:border-brand-500/30 transition-all duration-200"
                                        aria-label={tool.name}
                                    >
                                        <span className="text-2xl leading-none" aria-hidden>{tool.emoji}</span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-semibold text-slate-200 truncate">{tool.name}</p>
                                                {isPremium(tool.slug) && (
                                                    <span className="flex-shrink-0 text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-1 py-0.5 rounded">Pro</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{tool.tagline}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-center mt-8">
                <Link href="/tools" className="text-sm text-slate-500 hover:text-brand-400 transition-colors inline-flex items-center gap-2">
                    Browse all tools
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="inline w-3 h-3" fill="currentColor" aria-hidden="true">
                        <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                    </svg>
                </Link>
            </p>
        </section>
    );
}
