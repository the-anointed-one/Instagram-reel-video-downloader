'use client';

import { useState, useCallback, FormEvent } from 'react';
import { downloadReel, DownloadResponse } from '@/api/client';

const INSTAGRAM_REEL_RE = /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?/;

interface DownloadFormProps {
    onResult: (data: DownloadResponse) => void;
    onError: (error: { message: string; status?: number }) => void;
    onReset: () => void;
}

export default function DownloadForm({ onResult, onError, onReset }: DownloadFormProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);

    const validate = (value: string) => {
        if (!value.trim()) return 'Please enter an Instagram Reel URL.';
        if (!INSTAGRAM_REEL_RE.test(value.trim()))
            return 'URL must look like: https://www.instagram.com/reel/ABC123/';
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
                const data = await downloadReel(url.trim());
                if (data.success) {
                    onResult(data);
                } else {
                    onError({ message: data.error || 'Unknown error from server.' });
                }
            } catch (axiosErr: unknown) {
                const e = axiosErr as { response?: { status?: number; data?: { error?: string } }; message?: string };
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
        [url, onResult, onError, onReset]
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    {/* Instagram icon inside input */}
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                    </span>
                    <input
                        id="reel-url-input"
                        type="url"
                        value={url}
                        onChange={handleChange}
                        placeholder="https://www.instagram.com/reel/..."
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
                            {/* Spinner */}
                            <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Fetching…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Fetch Reel
                        </>
                    )}
                </button>
            </div>

            {/* Client-side validation error */}
            {clientError && (
                <p className="text-rose-400 text-xs px-1 animate-fade-in">{clientError}</p>
            )}
        </form>
    );
}
