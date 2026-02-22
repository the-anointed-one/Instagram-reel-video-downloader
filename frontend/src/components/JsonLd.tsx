export function WebAppJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ReelFetch',
        url: 'https://reelfetch.com',
        description:
            'Download public Instagram Reels instantly. Paste a Reel URL and get a direct MP4 download link — fast, free, and no login required.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        featureList: [
            'Instant Instagram Reel extraction',
            'No login required',
            'Direct MP4 download link',
            '24-hour cache for fast repeat lookups',
            'No video storage on server',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
