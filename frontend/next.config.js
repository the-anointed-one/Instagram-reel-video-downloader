const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.cdninstagram.com' },
            { protocol: 'https', hostname: '**.fbcdn.net' },
        ],
    },
};

module.exports = withMDX(nextConfig);
