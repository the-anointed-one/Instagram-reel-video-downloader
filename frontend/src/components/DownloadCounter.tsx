'use client';

import { useEffect, useState } from 'react';
import { fetchStats } from '@/api/client';

export default function DownloadCounter() {
    const [mounted, setMounted] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        setMounted(true);

        let cancelled = false;

        async function loadStats() {
            try {
                const { downloadsToday } = await fetchStats();
                if (cancelled) return;

                const total = downloadsToday;
                let startTimestamp: number | null = null;
                const duration = 1500;

                const step = (timestamp: number) => {
                    if (cancelled) return;
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    const easeProgress = progress * (2 - progress);
                    setCount(Math.floor(easeProgress * total));

                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
            } catch {
                if (!cancelled) setCount(0);
            }
        }

        loadStats();

        return () => {
            cancelled = true;
        };
    }, []);

    if (!mounted) {
        return (
            <div className="h-10" /> // same height as the real element to prevent layout shift
        );
    }

    return (
        <div className="text-center text-sm font-semibold animate-fade-in mt-8 mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="inline w-4 h-4 text-brand-500" fill="currentColor" aria-hidden="true">
                    <path d="M153.49 327.16C138.10 316.3 128 298.7 128 279.99c0-28.4 23.16-51.99 51.99-51.99 4.4 0 8.65.57 12.72 1.58C181.39 215.12 170.67 200 144 200c-55.23 0-112 49.77-112 128 0 88.37 82.43 152 176 152 9.23 0 17.54-1.23 26.18-2.86-42.7-20.11-72.56-60.44-80.69-150z" />
                </svg> <span className="text-brand-500 text-base font-extrabold">{count.toLocaleString()}</span> videos downloaded today
            </span>
        </div>
    );
}
