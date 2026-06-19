const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.cdninstagram.com' },
            { protocol: 'https', hostname: '**.fbcdn.net' },
            { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
        ],
    },
    async headers() {
        return [
            {
                // Ensure the service worker is served as JS, not intercepted by Next.js router
                source: '/sw.js',
                headers: [
                    { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                    { key: 'Service-Worker-Allowed', value: '/' },
                ],
            },
            {
                source: '/manifest.json',
                headers: [
                    { key: 'Content-Type', value: 'application/manifest+json' },
                    { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
                ],
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'instagram-reel-downloader.byteoasis.ng' }],
                destination: 'https://reelfetch.xyz/:path*',
                permanent: true,
            },
        ];
    },
};

module.exports = withMDX(nextConfig);
