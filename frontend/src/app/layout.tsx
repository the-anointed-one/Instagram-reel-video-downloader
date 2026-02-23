import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const viewport: Viewport = {
    themeColor: '#0f172a',
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://reelfetch.com'),
    title: {
        default: 'Instagram Reel Downloader — Download Reels Video Free | ReelFetch',
        template: '%s | ReelFetch',
    },
    description:
        'Instagram Reel Downloader — download reels instantly. Free online reels video download tool. Save Instagram Reels, download IG Reels with audio. No app needed, fast & free.',
    keywords: [
        'instagram reel downloader',
        'download reels',
        'save instagram reels',
        'reels video download',
        'download ig reels',
        'download reels from instagram',
        'instagram reels download app',
        'instagram reels video downloader',
        'reels download',
        'download instagram reels with audio',
        'download a reel from instagram',
        'reelfetch',
    ],
    openGraph: {
        title: 'Instagram Reel Downloader — Download Reels Video Free',
        description:
            'Download Instagram Reels instantly. Free reels video download — no app, no login. Save Instagram Reels to your device.',
        type: 'website',
        siteName: 'ReelFetch',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Instagram Reel Downloader — Download Reels Free | ReelFetch',
        description:
            'Download Instagram Reels instantly — free reels video download, no login required.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: '/',
    },
    verification: {
        google: 'N1XsTzzPSMF2oIIeXr46CtcU-RtFrZj1XW__6EaawBI',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`dark ${inter.variable}`}>
            <body className={inter.className}>
                {children}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-HBLHFY2YLR"
                    strategy="lazyOnload"
                />
                <Script id="google-analytics" strategy="lazyOnload">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-HBLHFY2YLR');
                    `}
                </Script>
            </body>
        </html>
    );
}
