'use client';

import { useEffect, useState } from 'react';

// BeforeInstallPromptEvent is not in the standard TS lib
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    if (!showBanner) return null;

    return (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 animate-fade-in">
            <div className="flex items-center gap-3">
                <span className="text-2xl">📲</span>
                <div>
                    <p className="text-sm font-semibold text-white">Install ReelFetch</p>
                    <p className="text-xs text-slate-400">Add to home screen — works like an app</p>
                </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button
                    onClick={() => setShowBanner(false)}
                    className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
                    aria-label="Dismiss install prompt"
                >
                    Not now
                </button>
                <button
                    onClick={handleInstall}
                    className="text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                    aria-label="Install ReelFetch as app"
                >
                    Install
                </button>
            </div>
        </div>
    );
}
