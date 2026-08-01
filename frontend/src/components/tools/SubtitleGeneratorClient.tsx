'use client';

import { useState, useCallback } from 'react';
import { transcribeUrl, transcribeUpload, SubtitleResponse } from '@/api/client';
import { downloadBlob } from '@/lib/clientImage';
import Dropzone from '@/components/tools/Dropzone';

type Mode = 'url' | 'upload';

export default function SubtitleGeneratorClient() {
    const [mode, setMode] = useState<Mode>('url');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SubtitleResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const onFile = useCallback((f: File) => {
        setError(null);
        setResult(null);
        if (!f.type.startsWith('audio/') && !f.type.startsWith('video/')) {
            setError('Please choose an audio or video file.');
            return;
        }
        setFile(f);
    }, []);

    const run = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setCopied(false);
        try {
            const data =
                mode === 'url'
                    ? await transcribeUrl(url.trim())
                    : file
                    ? await transcribeUpload(file)
                    : { success: false, error: 'Please choose a file.' };
            if (data.success) setResult(data);
            else setError(data.error || 'Something went wrong. Please try again.');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = !loading && (mode === 'url' ? url.trim().length > 8 : !!file);

    const download = (kind: 'srt' | 'vtt') => {
        const text = kind === 'srt' ? result?.srt : result?.vtt;
        if (!text) return;
        downloadBlob(new Blob([text], { type: 'text/plain' }), `subtitles.${kind}`);
    };

    const copyTranscript = async () => {
        if (!result?.transcript) return;
        try {
            await navigator.clipboard.writeText(result.transcript);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* ignore */
        }
    };

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                {/* Mode toggle */}
                <div className="flex gap-2">
                    {(['url', 'upload'] as Mode[]).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => { setMode(m); setError(null); setResult(null); }}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                mode === m ? 'border-brand-500/50 text-white bg-brand-500/10' : 'border-white/10 text-slate-400 hover:text-white'
                            }`}
                        >
                            {m === 'url' ? 'From video URL' : 'Upload file'}
                        </button>
                    ))}
                </div>

                {mode === 'url' ? (
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste an Instagram, TikTok, YouTube or Facebook video URL"
                        className="w-full rounded-xl bg-surface-800/60 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                    />
                ) : (
                    <Dropzone
                        onFile={onFile}
                        accept="audio/*,video/*"
                        label={file ? file.name : 'Click to upload or drag audio/video here'}
                        sublabel="MP3, MP4, WAV, M4A… up to 25MB"
                    />
                )}

                <div className="flex items-center justify-end">
                    <button type="button" onClick={run} disabled={!canSubmit} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                        {loading ? 'Transcribing…' : 'Generate subtitles'}
                    </button>
                </div>
                {loading && <p className="text-xs text-slate-500 text-right">This can take a little while for longer videos.</p>}
            </div>

            {error && (
                <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {result?.transcript && (
                <div className="glass-card p-6 space-y-4 animate-slide-up">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Transcript</h3>
                        <div className="flex gap-2">
                            <button type="button" onClick={copyTranscript} className="btn-secondary text-xs px-3 py-1.5">
                                {copied ? 'Copied!' : 'Copy text'}
                            </button>
                            <button type="button" onClick={() => download('srt')} className="btn-primary text-xs px-3 py-1.5">Download .srt</button>
                            <button type="button" onClick={() => download('vtt')} className="btn-primary text-xs px-3 py-1.5">Download .vtt</button>
                        </div>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {result.transcript}
                    </p>
                </div>
            )}
        </div>
    );
}
