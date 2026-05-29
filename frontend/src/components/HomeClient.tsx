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

            {/* Stats Counter */}
            {stats && stats.downloadsToday > 0 && (
                <div className="text-center animate-fade-in mt-6 mb-2">
                    <p className="text-sm font-medium text-slate-400">
                        🔥 <span className="text-white">{stats.downloadsToday.toLocaleString()}</span> videos downloaded today
                    </p>
                </div>
            )}

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

                    <div className="grid gap-3">
                        {history.map((entry) => (
                            <div
                                key={`${entry.downloadedAt}-${entry.videoUrl}`}
                                className="flex items-center gap-3 p-3 bg-slate-950/80 border border-white/5 rounded-2xl"
                            >
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0">
                                    {entry.thumbnail ? (
                                        <img
                                            src={entry.thumbnail}
                                            alt={entry.title || entry.platform}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                            No preview
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-100 truncate">
                                        {entry.title || entry.platform}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {entry.platform || 'Unknown'} · {timeAgo(entry.downloadedAt)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.open(entry.videoUrl, '_blank')}
                                    className="btn-secondary text-xs px-3 py-2"
                                >
                                    Re-download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feature pills */}
            {!result && !audioResult && !error && (
                <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
                    {[
                        { icon: '⚡', label: 'Instant extraction' },
                        { icon: '🔒', label: 'No login needed' },
                        { icon: '🚫', label: 'No watermark (TikTok)' },
                        { icon: '📱', label: 'All platforms' },
                        { icon: '🌐', label: 'Public videos only' },
                        { icon: '📦', label: '24-hour cache' },
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
