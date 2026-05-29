'use client';

import { useState } from 'react';
import { AudioResponse } from '@/api/client';

interface AudioPreviewProps {
    data: AudioResponse;
}

export default function AudioPreview({ data }: AudioPreviewProps) {
    const { audioUrl, title, platform } = data;
    const [copied, setCopied] = useState(false);

    function handleCopyLink() {
        if (!audioUrl) return;
        navigator.clipboard.writeText(audioUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="glass-card p-5 animate-slide-up space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    🎵 Audio Extracted
                </h2>
                {platform && (
                    <span className="text-xs bg-white/5 text-slate-400 border border-white/10 px-2.5 py-0.5 rounded-full font-medium capitalize">
                        {platform}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2">
                <p className="text-slate-100 font-medium line-clamp-2">
                    {title || 'YouTube Audio'}
                </p>
                {!audioUrl && (
                    <p className="text-rose-400 text-sm">
                        Audio extraction failed. Please try again.
                    </p>
                )}
            </div>

            {/* Actions */}
            {audioUrl && (
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <a
                        href={audioUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download MP3
                    </a>

                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"
                        title="Copy direct audio link"
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
