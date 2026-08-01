import type { Metadata } from 'next';
import Link from 'next/link';
import ToolShell from '@/components/tools/ToolShell';
import { TOOLS, CATEGORY_ORDER, isPremium } from '@/lib/tools';

export const metadata: Metadata = {
    title: 'Free Online Tools — AI, Image, Video & Creator Utilities',
    description:
        'A growing suite of free online tools: AI content detector, image and video utilities, and creator helpers. No login, no install.',
    alternates: { canonical: '/tools' },
};

export default function ToolsIndexPage() {
    return (
        <ToolShell
            title="Free Online Tools"
            subtitle="A growing suite of AI, image, video and creator utilities — free, no login, no install."
        >
            <div className="space-y-10">
                {CATEGORY_ORDER.map((category) => {
                    const tools = TOOLS.filter((t) => t.category === category);
                    if (tools.length === 0) return null;

                    return (
                        <section key={category} className="space-y-4">
                            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {tools.map((tool) => {
                                    const card = (
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl leading-none" aria-hidden>{tool.emoji}</span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-slate-200 truncate">{tool.name}</p>
                                                    {!tool.enabled ? (
                                                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                                            Soon
                                                        </span>
                                                    ) : isPremium(tool.slug) ? (
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                                            Pro
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{tool.tagline}</p>
                                            </div>
                                        </div>
                                    );

                                    return tool.enabled ? (
                                        <Link
                                            key={tool.slug}
                                            href={`/tools/${tool.slug}`}
                                            className="glass-card p-4 hover:bg-white/[0.04] hover:border-brand-500/30 transition-all duration-200"
                                        >
                                            {card}
                                        </Link>
                                    ) : (
                                        <div
                                            key={tool.slug}
                                            className="glass-card p-4 opacity-50 cursor-not-allowed select-none"
                                            aria-disabled
                                        >
                                            {card}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </ToolShell>
    );
}
