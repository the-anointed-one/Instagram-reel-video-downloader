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
                <i className="fa-solid fa-fire text-brand-500" aria-hidden="true" /> <span className="text-brand-500 text-base font-extrabold">{count.toLocaleString()}</span> videos downloaded today
            </span>
        </div>
    );
}
