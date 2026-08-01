'use client';

import { useState, useRef, useCallback } from 'react';
import { detectAiImage, AiDetectResponse } from '@/api/client';

const MAX_MB = 8;

export default function AiImageDetectorClient() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AiDetectResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectFile = useCallback((f: File | null) => {
        setResult(null);
        setError(null);
        if (!f) return;
        if (!f.type.startsWith('image/')) {
            setError('Please choose an image file (JPG, PNG, WebP…).');
            return;
        }
        if (f.size > MAX_MB * 1024 * 1024) {
            setError(`Image too large. The limit is ${MAX_MB}MB.`);
            return;
        }
        setFile(f);
        setPreviewUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return URL.createObjectURL(f);
        });
    }, []);

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await detectAiImage(file);
            if (data.success) setResult(data);
            else setError(data.error || 'Something went wrong. Please try again.');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const aiPct =
        result && typeof result.aiProbability === 'number'
            ? Math.round(result.aiProbability * 100)
            : null;

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                {/* Drop / pick zone */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        selectFile(e.dataTransfer.files?.[0] ?? null);
                    }}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-surface-800/40 px-4 py-10 text-center cursor-pointer hover:border-brand-500/40 transition-colors"
                >
                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Selected preview" className="max-h-56 rounded-lg object-contain" />
                    ) : (
                        <>
                            <svg className="w-9 h-9 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V18a3 3 0 003 3h12a3 3 0 003-3v-1.5m-9-12v12m0-12l-4 4m4-4l4 4" />
                            </svg>
                            <div>
                                <p className="text-sm text-slate-300 font-medium">Click to upload or drag an image here</p>
                                <p className="text-xs text-slate-500 mt-1">JPG, PNG or WebP · up to {MAX_MB}MB</p>
                            </div>
                        </>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 truncate">
                        {file ? file.name : 'No image selected'}
                    </span>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Analyzing…' : 'Detect AI'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {result && aiPct !== null && (
                <div className="glass-card p-6 space-y-4 animate-slide-up">
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Result</h3>
                        {result.cached && <span className="text-[10px] text-slate-600 uppercase tracking-wider">cached</span>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Likely AI-generated</span>
                            <span className={`font-bold ${aiPct >= 60 ? 'text-red-400' : aiPct >= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {aiPct}%
                            </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-surface-800 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    aiPct >= 60 ? 'bg-red-500' : aiPct >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${aiPct}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                        {aiPct >= 60
                            ? 'This image shows strong signs of AI generation.'
                            : aiPct >= 30
                            ? 'This image shows some signs of AI generation — results are mixed.'
                            : 'This image reads as likely a real photo.'}{' '}
                        No detector is 100% accurate; use this as a signal, not proof.
                    </p>
                </div>
            )}
        </div>
    );
}
