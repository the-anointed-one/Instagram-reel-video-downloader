import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans, Prata } from 'next/font/google';
import Script from 'next/script';
import Link from 'next/link';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const syne = Syne({
    subsets: ['latin'],
    weight: ['700', '800'],
    variable: '--font-syne',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-dm-sans',
    display: 'swap',
});

const prata = Prata({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-prata',
    display: 'swap',
});

export const viewport: Viewport = {
    themeColor: '#0f172a',
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://instagram-reel-downloader.byteoasis.ng'),
    title: {
        default: 'ReelFetch | Instagram, TikTok, Facebook & YouTube Downloader',
        template: '%s | ReelFetch',
    },
    description:
        'Free online video downloader for Instagram Reels, TikTok videos, Facebook Reels and YouTube Shorts. No app, no login, instant MP4 download. No watermark on TikTok.',
    keywords: [
        'instagram reel downloader',
        'download reels',
        'save instagram reels',
        'reels video download',
        'download ig reels',
        'tiktok downloader no watermark',
        'download tiktok without watermark',
        'tiktok video downloader',
        'facebook video downloader',
        'facebook reel downloader',
        'youtube shorts downloader',
        'download youtube shorts',
        'save tiktok to camera roll',
        'download instagram reels with audio',
        'reelfetch',
    ],
    openGraph: {
        title: 'ReelFetch — Download Videos From Any Platform Free',
        description:
            'Paste any Instagram, TikTok, Facebook or YouTube Shorts URL and download as MP4 instantly. Free, no login, no watermark.',
        type: 'website',
        siteName: 'ReelFetch',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ReelFetch — Free Video Downloader for Instagram, TikTok, Facebook & YouTube',
        description:
            'Free online video downloader for Instagram Reels, TikTok videos, Facebook Reels and YouTube Shorts. No app, no login, no watermark.',
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
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'ReelFetch',
    },
    icons: {
        apple: '/icons/icon-192.png',
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
        <html lang="en" suppressHydrationWarning className={`${syne.variable} ${dmSans.variable} ${prata.variable}`}>
            <head>
                <meta name="google-site-verification" content="google60ebb5d04d5bde74.html" />
            </head>
            <body className={dmSans.className}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
                    {children}

                    {/* ByteOasis footer branding + platform summary — injected at layout level */}
                    <div className="border-t border-white/5 py-4 text-center text-slate-600 text-xs space-y-1">
                        <p>ReelFetch supports Instagram, TikTok, Facebook and YouTube Shorts.</p>
                        <p>
                            ReelFetch is a free tool by{' '}
                            <Link
                                href="https://byteoasis.ng"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors"
                            >
                                ByteOasis
                            </Link>
                        </p>
                    </div>
                </ThemeProvider>

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

                {/* Service Worker registration */}
                <Script id="sw-register" strategy="lazyOnload">
                    {`
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker
                                    .register('/sw.js')
                                    .then(function(reg) {
                                        console.log('[ReelFetch] SW registered:', reg.scope);
                                    })
                                    .catch(function(err) {
                                        console.log('[ReelFetch] SW registration failed:', err);
                                    });
                            });
                        }
                    `}
                </Script>
            </body>
        </html>
    );
}
