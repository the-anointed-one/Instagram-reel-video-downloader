'use client';

import { useState, useCallback, useEffect, useRef, FormEvent } from 'react';
import { downloadVideo, DownloadResponse, Platform } from '@/api/client';

// ── Platform Config ──────────────────────────────────────────────

interface PlatformConfig {
    id: Platform;
    label: string;
    placeholder: string;
    pattern: RegExp;
    successMessage: string;
    gradient: string;
    iconColor: string;
    tabActive: string;
    tabHover: string;
    icon: React.ReactNode;
}

const PLATFORMS: PlatformConfig[] = [
    {
        id: 'instagram',
        label: 'Instagram',
        placeholder: 'https://www.instagram.com/reel/ABC123/',
        pattern: /https?:\/\/(www\.)?instagram\.com\/(reel|p)\/[A-Za-z0-9_-]+/,
        successMessage: 'Instagram Reel ready to download!',
        gradient: 'from-pink-500 via-fuchsia-500 to-purple-600',
        iconColor: 'text-pink-400',
        tabActive: 'border-pink-500 text-pink-400 bg-pink-500/10',
        tabHover: 'hover:border-pink-500/50 hover:text-pink-300',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        placeholder: 'https://www.tiktok.com/@user/video/123456789',
        pattern: /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//,
        successMessage: 'TikTok video ready — no watermark!',
        gradient: 'from-slate-900 via-teal-900 to-slate-900',
        iconColor: 'text-teal-400',
        tabActive: 'border-teal-400 text-teal-400 bg-teal-400/10',
        tabHover: 'hover:border-teal-400/50 hover:text-teal-300',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.2 8.2 0 004.79 1.52V6.92a4.86 4.86 0 01-1.02-.23z" />
            </svg>
        ),
    },
    {
        id: 'facebook',
        label: 'Facebook',
        placeholder: 'https://www.facebook.com/reel/123456',
        pattern: /https?:\/\/(www\.|m\.)?facebook\.com\/|https?:\/\/(www\.)?fb\.watch\//,
        successMessage: 'Facebook video ready to download!',
        gradient: 'from-blue-600 to-blue-800',
        iconColor: 'text-blue-400',
        tabActive: 'border-blue-500 text-blue-400 bg-blue-500/10',
        tabHover: 'hover:border-blue-500/50 hover:text-blue-300',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        id: 'youtube',
        label: 'YouTube',
        placeholder: 'https://www.youtube.com/shorts/ABC123',
        pattern: /https?:\/\/(www\.|m\.)?youtube\.com\/(shorts|watch)|https?:\/\/youtu\.be\//,
        successMessage: 'YouTube Short ready to download!',
        gradient: 'from-red-600 to-red-800',
        iconColor: 'text-red-400',
        tabActive: 'border-red-500 text-red-400 bg-red-500/10',
        tabHover: 'hover:border-red-500/50 hover:text-red-300',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
    },
];

// ── Auto-detect platform from URL ────────────────────────────────

function detectPlatformFromUrl(url: string): Platform | null {
    for (const p of PLATFORMS) {
        if (p.pattern.test(url)) return p.id;
    }
    return null;
}

// ── Props ────────────────────────────────────────────────────────

interface DownloadFormProps {
    onResult: (data: DownloadResponse) => void;
    onError: (error: { message: string; status?: number }) => void;
    onReset: () => void;
}

// ── Component ────────────────────────────────────────────────────

export default function DownloadForm({ onResult, onError, onReset }: DownloadFormProps) {
    const [activePlatform, setActivePlatform] = useState<Platform>('instagram');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const platform = PLATFORMS.find((p) => p.id === activePlatform)!;

    // Auto-detect platform when URL changes
    useEffect(() => {
        if (!url.trim()) return;
        const detected = detectPlatformFromUrl(url.trim());
        if (detected && detected !== activePlatform) {
            setActivePlatform(detected);
        }
    }, [url, activePlatform]);

    const handleTabSwitch = useCallback(
        (id: Platform) => {
            setActivePlatform(id);
            setClientError(null);
            onReset();
            setUrl('');
            setTimeout(() => inputRef.current?.focus(), 50);
        },
        [onReset]
    );

    const validate = (value: string): string | null => {
        if (!value.trim()) return `Please enter a ${platform.label} URL.`;
        if (!platform.pattern.test(value.trim()))
            return `URL must be a valid ${platform.label} link. ${platform.placeholder}`;
        return null;
    };

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setUrl(e.target.value);
            setClientError(null);
            onReset();
        },
        [onReset]
    );

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            onReset();

            const err = validate(url);
            if (err) {
                setClientError(err);
                return;
            }

            setLoading(true);
            try {
                const data = await downloadVideo(url.trim());
                if (data.success) {
                    onResult(data);
                } else {
                    onError({ message: data.error || 'Unknown error from server.' });
                }
            } catch (axiosErr: unknown) {
                const e = axiosErr as {
                    response?: { status?: number; data?: { error?: string } };
                    message?: string;
                };
                const status = e.response?.status;
                const message =
                    e.response?.data?.error ||
                    e.message ||
                    'Could not reach the server. Please try again.';
                onError({ message, status });
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [url, activePlatform, onResult, onError, onReset]
    );

    return (
        <div className="space-y-4">
            {/* ── Platform Tabs ── */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
                {PLATFORMS.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        id={`platform-tab-${p.id}`}
                        onClick={() => handleTabSwitch(p.id)}
                        className={[
                            'flex items-center gap-1.5 flex-1 justify-center px-2 py-2 rounded-lg text-xs font-semibold',
                            'border transition-all duration-200 cursor-pointer',
                            activePlatform === p.id
                                ? p.tabActive + ' border-opacity-100'
                                : 'border-transparent text-slate-500 ' + p.tabHover,
                        ].join(' ')}
                        aria-pressed={activePlatform === p.id}
                        aria-label={`Switch to ${p.label}`}
                    >
                        <span className={activePlatform === p.id ? p.iconColor : 'text-slate-600'}>
                            {p.icon}
                        </span>
                        <span className="hidden sm:inline">{p.label}</span>
                    </button>
                ))}
            </div>

            {/* ── URL Input Form ── */}
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        {/* Platform icon inside input */}
                        <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${platform.iconColor}`}>
                            {platform.icon}
                        </span>
                        <input
                            ref={inputRef}
                            id="reel-url-input"
                            type="url"
                            value={url}
                            onChange={handleChange}
                            placeholder={platform.placeholder}
                            className="input-field pl-10"
                            disabled={loading}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>

                    <button
                        type="submit"
                        id="fetch-btn"
                        disabled={loading}
                        className="btn-primary sm:w-auto w-full whitespace-nowrap"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Fetching…
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </>
                        )}
                    </button>
                </div>

                {clientError && (
                    <p className="text-rose-400 text-xs px-1 animate-fade-in">{clientError}</p>
                )}
            </form>
        </div>
    );
}
