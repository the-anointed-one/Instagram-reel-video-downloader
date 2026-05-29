'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DownloadResponse, extractAudio } from '@/api/client';

interface VideoPreviewProps {
    data: DownloadResponse;
}

export default function VideoPreview({ data }: VideoPreviewProps) {
    const { videoUrl, thumbnail, caption, title, cached } = data;
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);

    function handleCopyLink() {
        if (!videoUrl) return;
        navigator.clipboard.writeText(videoUrl);
    }

    async function handleExtractAudio() {
        if (!videoUrl) return;
        setAudioError(null);
        setAudioLoading(true);

        try {
            const response = await extractAudio(videoUrl);
            if (response.success && response.audioUrl) {
                window.open(response.audioUrl, '_blank');
            } else {
                setAudioError(response.error || 'Could not extract audio.');
            }
        } catch (err) {
            setAudioError('Could not extract audio. Please try again.');
        } finally {
            setAudioLoading(false);
        }
    }

    return (
        <div className="glass-card p-5 animate-slide-up space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Reel Preview
                </h2>
                {cached && (
                    <span className="text-xs bg-brand-600/20 text-brand-400 border border-brand-500/20 px-2.5 py-0.5 rounded-full font-medium">
                        Cached
                    </span>
                )}
            </div>

            {/* Video player */}
            {videoUrl && (
                <div className="rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[480px] w-full flex items-center justify-center">
                    <video
                        key={videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        poster={thumbnail ?? undefined}
                        className="w-full h-full object-contain"
                    >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {/* Thumbnail fallback if no video element support */}
            {!videoUrl && thumbnail && (
                <div className="relative rounded-xl overflow-hidden aspect-square">
                    <Image src={thumbnail} alt={title ?? 'Reel thumbnail'} fill className="object-cover" />
                </div>
            )}

            {/* Caption */}
            {caption && (
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{caption}</p>
            )}

            {/* Actions */}
            {videoUrl && (
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <a
                        href={videoUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1 text-sm py-2.5"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download MP4
                    </a>

                    <button
                        type="button"
                        onClick={handleExtractAudio}
                        disabled={audioLoading}
                        className="btn-secondary text-sm py-2.5"
                    >
                        {audioLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Extracting MP3…
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-2v13" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l12-2" />
                                </svg>
                                Extract MP3
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handleCopyLink}
                        className="btn-secondary text-sm py-2.5"
                        title="Copy direct video link"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                    </button>
                </div>
            )}
            {audioError && (
                <p className="text-rose-400 text-xs pt-2">{audioError}</p>
            )}
        </div>
    );
}
