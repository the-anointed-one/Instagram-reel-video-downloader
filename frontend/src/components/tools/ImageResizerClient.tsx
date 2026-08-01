'use client';

import { useState, useCallback } from 'react';
import Dropzone from '@/components/tools/Dropzone';
import { fileToImage, drawToCanvas, canvasToBlob, downloadBlob, formatBytes, baseName } from '@/lib/clientImage';

export default function ImageResizerClient() {
    const [file, setFile] = useState<File | null>(null);
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [lock, setLock] = useState(true);
    const [busy, setBusy] = useState(false);
    const [output, setOutput] = useState<{ blob: Blob; url: string; w: number; h: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFile = useCallback(async (f: File) => {
        setError(null);
        setOutput(null);
        if (!f.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        setFile(f);
        try {
            const img = await fileToImage(f);
            setNatural({ w: img.naturalWidth, h: img.naturalHeight });
            setWidth(String(img.naturalWidth));
            setHeight(String(img.naturalHeight));
        } catch {
            setError('Could not read that image.');
        }
    }, []);

    const onWidth = (v: string) => {
        setWidth(v);
        if (lock && natural && v) {
            const ratio = natural.h / natural.w;
            setHeight(String(Math.round(parseInt(v, 10) * ratio)));
        }
    };
    const onHeight = (v: string) => {
        setHeight(v);
        if (lock && natural && v) {
            const ratio = natural.w / natural.h;
            setWidth(String(Math.round(parseInt(v, 10) * ratio)));
        }
    };

    const resize = useCallback(async () => {
        if (!file) return;
        const w = parseInt(width, 10);
        const h = parseInt(height, 10);
        if (!w || !h || w < 1 || h < 1) {
            setError('Enter valid width and height.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const img = await fileToImage(file);
            const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const canvas = drawToCanvas(img, w, h);
            const blob = await canvasToBlob(canvas, type, 0.92);
            setOutput((old) => {
                if (old) URL.revokeObjectURL(old.url);
                return { blob, url: URL.createObjectURL(blob), w, h };
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Resize failed.');
        } finally {
            setBusy(false);
        }
    }, [file, width, height]);

    const ext = file?.type === 'image/png' ? 'png' : 'jpg';

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                <Dropzone onFile={onFile} sublabel="JPG, PNG or WebP" />

                {file && natural && (
                    <>
                        <p className="text-xs text-slate-500">Original: {natural.w} × {natural.h}px · {formatBytes(file.size)}</p>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="space-y-1">
                                <span className="text-xs text-slate-400">Width (px)</span>
                                <input type="number" min={1} value={width} onChange={(e) => onWidth(e.target.value)}
                                    className="w-full rounded-xl bg-surface-800/60 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
                            </label>
                            <label className="space-y-1">
                                <span className="text-xs text-slate-400">Height (px)</span>
                                <input type="number" min={1} value={height} onChange={(e) => onHeight(e.target.value)}
                                    className="w-full rounded-xl bg-surface-800/60 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
                            </label>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-slate-400">
                            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="accent-brand-500" />
                            Lock aspect ratio
                        </label>
                        <div className="flex justify-end">
                            <button type="button" onClick={resize} disabled={busy} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40">
                                {busy ? 'Resizing…' : 'Resize'}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={output.url} alt="Resized result" className="max-h-64 mx-auto rounded-lg object-contain" />
                    <p className="text-sm text-slate-300">
                        {output.w} × {output.h}px · <span className="text-white font-semibold">{formatBytes(output.blob.size)}</span>
                    </p>
                    <button type="button" onClick={() => downloadBlob(output.blob, `${baseName(file.name)}-${output.w}x${output.h}.${ext}`)} className="btn-primary px-5 py-2.5 text-sm">
                        Download
                    </button>
                </div>
            )}
        </div>
    );
}
