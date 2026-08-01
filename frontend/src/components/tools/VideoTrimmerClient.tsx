'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Dropzone from '@/components/tools/Dropzone';
import { transcode } from '@/lib/ffmpeg';
import { downloadBlob, formatBytes, baseName } from '@/lib/clientImage';

function fmt(t: number): string {
    if (!Number.isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoTrimmerClient() {
    const [file, setFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [output, setOutput] = useState<{ url: string; blob: Blob } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<null | 'start' | 'end'>(null);
    const selRef = useRef({ start: 0, end: 0, duration: 0 });

    useEffect(() => { selRef.current = { start, end, duration }; }, [start, end, duration]);

    const onFile = useCallback((f: File) => {
        setError(null);
        setOutput(null);
        if (!f.type.startsWith('video/')) {
            setError('Please choose a video file.');
            return;
        }
        setFile(f);
        setVideoUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return URL.createObjectURL(f);
        });
    }, []);

    const onLoadedMetadata = () => {
        const d = videoRef.current?.duration ?? 0;
        if (Number.isFinite(d) && d > 0) {
            setDuration(d);
            setStart(0);
            setEnd(d);
        }
    };

    const onPointerMove = useCallback((e: PointerEvent) => {
        if (!dragRef.current || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        let ratio = (e.clientX - rect.left) / rect.width;
        ratio = Math.min(1, Math.max(0, ratio));
        const t = ratio * selRef.current.duration;
        if (dragRef.current === 'start') {
            const ns = Math.max(0, Math.min(t, selRef.current.end - 0.1));
            setStart(ns);
            if (videoRef.current) videoRef.current.currentTime = ns;
        } else {
            const ne = Math.min(selRef.current.duration, Math.max(t, selRef.current.start + 0.1));
            setEnd(ne);
            if (videoRef.current) videoRef.current.currentTime = ne;
        }
    }, []);

    const onPointerUp = useCallback(() => {
        dragRef.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    }, [onPointerMove]);

    const startDrag = (which: 'start' | 'end') => (e: React.PointerEvent) => {
        e.preventDefault();
        dragRef.current = which;
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    useEffect(() => () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    }, [onPointerMove, onPointerUp]);

    const startPct = duration > 0 ? (start / duration) * 100 : 0;
    const endPct = duration > 0 ? (end / duration) * 100 : 100;

    const run = async () => {
        if (!file || end <= start) return;
        setBusy(true);
        setError(null);
        setOutput(null);
        setProgress(0);
        try {
            const data = await transcode(
                file,
                'output.mp4',
                (input, out) => ['-ss', String(start), '-i', input, '-t', String(end - start), '-c', 'copy', out],
                (r) => setProgress(r)
            );
            if (!data || data.length === 0) throw new Error('Trim produced no output.');
            const bytes = new Uint8Array(data.length);
            bytes.set(data);
            const blob = new Blob([bytes], { type: 'video/mp4' });
            setOutput((old) => {
                if (old) URL.revokeObjectURL(old.url);
                return { url: URL.createObjectURL(blob), blob };
            });
        } catch (e) {
            setError(e instanceof Error ? `Trim failed: ${e.message}. Try a shorter clip.` : 'Trim failed.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                {!videoUrl ? (
                    <Dropzone onFile={onFile} accept="video/*" sublabel="Runs in your browser — best for short clips" />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            onLoadedMetadata={onLoadedMetadata}
                            controls
                            className="w-full max-h-72 rounded-lg bg-black"
                        />

                        {/* Trim timeline with draggable handles */}
                        <div className="pt-2">
                            <div
                                ref={trackRef}
                                className="relative h-12 rounded-lg bg-surface-800 select-none touch-none"
                            >
                                {/* selected region */}
                                <div
                                    className="absolute top-0 bottom-0 bg-brand-500/25 border-y-2 border-brand-500/60"
                                    style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
                                />
                                {/* start handle */}
                                <div
                                    onPointerDown={startDrag('start')}
                                    className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-brand-500 rounded cursor-ew-resize flex items-center justify-center shadow-lg"
                                    style={{ left: `${startPct}%` }}
                                >
                                    <span className="w-0.5 h-4 bg-white/70 rounded" />
                                </div>
                                {/* end handle */}
                                <div
                                    onPointerDown={startDrag('end')}
                                    className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-brand-500 rounded cursor-ew-resize flex items-center justify-center shadow-lg"
                                    style={{ left: `${endPct}%` }}
                                >
                                    <span className="w-0.5 h-4 bg-white/70 rounded" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                                <span>Start <span className="text-slate-200 font-semibold tabular-nums">{fmt(start)}</span></span>
                                <span className="text-brand-400 font-semibold tabular-nums">Clip: {fmt(end - start)}</span>
                                <span>End <span className="text-slate-200 font-semibold tabular-nums">{fmt(end)}</span></span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 text-center">Drag the handles to set the clip. {file ? formatBytes(file.size) : ''}</p>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            {busy ? (
                                <div className="flex-1 mr-3 h-2 rounded-full bg-surface-800 overflow-hidden">
                                    <div className="h-full bg-brand-500 transition-all duration-200" style={{ width: `${Math.round(progress * 100) || 5}%` }} />
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setVideoUrl((u) => { if (u) URL.revokeObjectURL(u); return null; }); setFile(null); setOutput(null); }}
                                    className="btn-secondary text-xs px-3 py-2"
                                >
                                    Choose another
                                </button>
                            )}
                            <button type="button" onClick={run} disabled={busy || end <= start} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                                {busy ? 'Trimming…' : 'Trim'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {output && file && (
                <div className="glass-card p-6 space-y-4 animate-slide-up text-center">
                    <video src={output.url} controls className="max-h-72 mx-auto rounded-lg bg-black" />
                    <p className="text-sm text-slate-300">{formatBytes(output.blob.size)}</p>
                    <button type="button" onClick={() => downloadBlob(output.blob, `${baseName(file.name)}-trimmed.mp4`)} className="btn-primary px-5 py-2.5 text-sm">
                        Download
                    </button>
                </div>
            )}
        </div>
    );
}
