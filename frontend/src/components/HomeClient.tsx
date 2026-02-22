'use client';

import { useState, useCallback } from 'react';
import DownloadForm from '@/components/DownloadForm';
import VideoPreview from '@/components/VideoPreview';
import ErrorAlert from '@/components/ErrorAlert';
import { DownloadResponse } from '@/api/client';

export default function HomeClient() {
    const [result, setResult] = useState<DownloadResponse | null>(null);
    const [error, setError] = useState<{ message: string; status?: number } | null>(null);

    const handleResult = useCallback((data: DownloadResponse) => {
        setError(null);
        setResult(data);
    }, []);

    const handleError = useCallback((err: { message: string; status?: number }) => {
        setResult(null);
        setError(err);
    }, []);

    const handleReset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return (
        <>
            {/* Form card */}
            <div className="glass-card p-6 animate-slide-up animation-pulse-glow space-y-5">
                <DownloadForm
                    onResult={handleResult}
                    onError={handleError}
                    onReset={handleReset}
                />

                {/* Error output */}
                {error && (
                    <ErrorAlert message={error.message} statusCode={error.status} />
                )}
            </div>

            {/* Result card */}
            {result && (
                <VideoPreview data={result} />
            )}

            {/* Feature pills */}
            {!result && !error && (
                <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
                    {[
                        { icon: '⚡', label: 'Instant extraction' },
                        { icon: '🔒', label: 'No login needed' },
                        { icon: '📦', label: '24-hour cache' },
                        { icon: '🌐', label: 'Public Reels only' },
                    ].map(({ icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-1.5 text-slate-400 text-sm bg-white/5 border border-white/8 px-3.5 py-2 rounded-full"
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
