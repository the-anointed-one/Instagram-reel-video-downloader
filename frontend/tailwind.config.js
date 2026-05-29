/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
                display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
                hero: ['var(--font-prata)', 'serif'],
            },
            colors: {
                brand: {
                    50: '#fff3ee',
                    100: '#ffe0cc',
                    300: '#ffb86b',
                    400: '#ff9f3f',
                    500: '#ff8412',
                    600: '#f06a00',
                    700: '#a33a12',
                },
                surface: {
                    900: '#0e0c0a',
                    800: '#1a1714',
                    700: '#25201c',
                    600: '#332b26',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,132,18,0.3)' },
                    '50%': { boxShadow: '0 0 20px 6px rgba(255,132,18,0.12)' },
                },
            },
        },
    },
    plugins: [],
};
