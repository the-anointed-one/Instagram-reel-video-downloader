'use client';

import { useState, useCallback, useEffect } from 'react';
import DownloadForm from '@/components/DownloadForm';
import VideoPreview from '@/components/VideoPreview';
import AudioPreview from '@/components/AudioPreview';
import ErrorAlert from '@/components/ErrorAlert';
import { DownloadResponse, AudioResponse, Platform, fetchStats } from '@/api/client';
import InstallPrompt from '@/components/InstallPrompt';

interface DownloadHistoryEntry {
    videoUrl: string;
    thumbnail?: string | null;
    title?: string;
    platform?: Platform;
    caption?: string | null;
    downloadedAt: string;
}

function timeAgo(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function HomeClient() {
    const [result, setResult] = useState<DownloadResponse | null>(null);
    const [audioResult, setAudioResult] = useState<AudioResponse | null>(null);
    const [error, setError] = useState<{ message: string; status?: number } | null>(null);
    const [history, setHistory] = useState<DownloadHistoryEntry[]>([]);
    const [stats, setStats] = useState<{ downloadsToday: number } | null>(null);

    useEffect(() => {
        fetchStats().then(setStats);
        if (typeof window === 'undefined') return;
        try {
            const stored = localStorage.getItem('reelfetch_history');
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch {
            // ignore malformed storage
        }
    }, []);

    const persistHistory = useCallback((entries: DownloadHistoryEntry[]) => {
        setHistory(entries);
        if (typeof window !== 'undefined') {
            localStorage.setItem('reelfetch_history', JSON.stringify(entries));
        }
    }, []);

    const handleResult = useCallback((data: DownloadResponse) => {
        setError(null);
        setAudioResult(null);
        setResult(data);

        const entry: DownloadHistoryEntry = {
            videoUrl: data.videoUrl || '',
            thumbnail: data.thumbnail ?? null,
            title: data.title || data.platform || 'Download',
            platform: data.platform,
            caption: data.caption ?? null,
            downloadedAt: new Date().toISOString(),
        };

        const nextHistory = [entry, ...history].slice(0, 10);
        persistHistory(nextHistory);
    }, [history, persistHistory]);

    const handleAudioResult = useCallback((data: AudioResponse) => {
        setError(null);
        setResult(null);
        setAudioResult(data);

        const entry: DownloadHistoryEntry = {
            videoUrl: data.audioUrl || '',
            thumbnail: null,
            title: data.title || 'YouTube Audio',
            platform: data.platform,
            caption: null,
            downloadedAt: new Date().toISOString(),
        };

        const nextHistory = [entry, ...history].slice(0, 10);
        persistHistory(nextHistory);
    }, [history, persistHistory]);

    const handleError = useCallback((err: { message: string; status?: number }) => {
        setResult(null);
        setAudioResult(null);
        setError(err);
    }, []);

    const handleReset = useCallback(() => {
        setResult(null);
        setAudioResult(null);
        setError(null);
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('reelfetch_history');
        }
    }, []);

    return (
        <>
            {/* PWA install banner */}
            <InstallPrompt />

            {/* Form card */}
            <div className="glass-card p-6 animate-slide-up animation-pulse-glow space-y-5">
                <DownloadForm
                    onResult={handleResult}
                    onAudioResult={handleAudioResult}
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

            {audioResult && !result && (
                <AudioPreview data={audioResult} />
            )}

            {/* Recent Downloads */}
            {history.length > 0 && (
                <div className="glass-card p-5 animate-slide-up space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                Recent Downloads
                            </h2>
                            <p className="text-xs text-slate-500">Open any item to re-download or review past extractions.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearHistory}
                            className="btn-secondary text-xs px-3 py-2"
                        >
                            Clear history
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {history.map((entry) => (
                            <div
                                key={`${entry.downloadedAt}-${entry.videoUrl}`}
                                className="relative group glass-card overflow-hidden cursor-pointer hover:border-brand-500/30 transition-all duration-200"
                                onClick={() => window.open(entry.videoUrl, '_blank')}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video w-full bg-surface-800 relative overflow-hidden">
                                    {entry.thumbnail ? (
                                        <img
                                            src={entry.thumbnail}
                                            alt={entry.title || entry.platform}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                                            No preview
                                        </div>
                                    )}

                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Platform badge */}
                                    <div className="absolute bottom-1.5 left-1.5">
                                        <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded capitalize">
                                            {entry.platform || 'video'}
                                        </span>
                                    </div>

                                    {/* Download icon top-right */}
                                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Info below thumbnail */}
                                <div className="p-2">
                                    <p className="text-xs font-semibold text-slate-200 truncate">
                                        {entry.title || entry.platform || 'Download'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {timeAgo(entry.downloadedAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
