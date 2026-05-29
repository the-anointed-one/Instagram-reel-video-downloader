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
            {videoUrl && (
                <div className="flex gap-2 pt-2 border-t border-white/5 mt-3">
                    <a
                        href={`whatsapp://send?text=${encodeURIComponent(`Check out this video: ${videoUrl}`)}`}
                        className="btn-secondary flex-1 text-sm py-2 flex items-center justify-center gap-2 hover:text-[#25D366] hover:border-[#25D366]/30 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                    </a>
                    <a
                        href={`tg://msg?text=${encodeURIComponent(`Check out this video: ${videoUrl}`)}`}
                        className="btn-secondary flex-1 text-sm py-2 flex items-center justify-center gap-2 hover:text-[#0088cc] hover:border-[#0088cc]/30 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Telegram
                    </a>
                </div>
            )}
            {audioError && (
                <p className="text-rose-400 text-xs pt-2">{audioError}</p>
            )}
        </div>
    );
}
