import Link from 'next/link';
import { TOOLS, getTool } from '@/lib/tools';
import { TOOL_CONTENT } from '@/lib/toolContent';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reelfetch.xyz';

/**
 * SEO block rendered under every tool: how-to steps, FAQ, related tools, plus
 * SoftwareApplication + FAQPage + BreadcrumbList JSON-LD for rich results.
 */
export default function ToolSEO({ slug, name }: { slug: string; name: string }) {
    const content = TOOL_CONTENT[slug];
    const tool = getTool(slug);
    if (!content || !tool) return null;

    const related = TOOLS.filter((t) => t.enabled && t.category === tool.category && t.slug !== slug).slice(0, 4);
    const url = `${SITE_URL}/tools/${slug}`;

    const softwareLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${name} — ReelFetch`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        url,
        description: content.intro,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };

    const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
            { '@type': 'ListItem', position: 3, name, item: url },
        ],
    };

    return (
        <div className="w-full space-y-8 mt-4">
            {/* How to use */}
            <section className="glass-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">How to use the {name}</h2>
                <ol className="space-y-3">
                    {content.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/15 text-brand-400 text-xs font-bold flex items-center justify-center">
                                {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                        </li>
                    ))}
                </ol>
            </section>

            {/* FAQ */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-white px-1">Frequently asked questions</h2>
                {content.faqs.map((f, i) => (
                    <details key={i} className="glass-card group">
                        <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-slate-200 hover:text-white transition-colors list-none">
                            <span>{f.q}</span>
                            <svg className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                    </details>
                ))}
            </section>

            {/* Related tools */}
            {related.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider px-1">Related tools</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {related.map((t) => (
                            <Link key={t.slug} href={`/tools/${t.slug}`} className="glass-card p-3 flex items-center gap-2 hover:bg-white/[0.04] hover:border-brand-500/30 transition-all">
                                <span className="text-lg" aria-hidden>{t.emoji}</span>
                                <span className="text-xs font-semibold text-slate-200 truncate">{t.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        </div>
    );
}
