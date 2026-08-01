'use client';

import { useState, useCallback } from 'react';
import Dropzone from '@/components/tools/Dropzone';
import { fileToImage, drawToCanvas, canvasToBlob, downloadBlob, formatBytes, baseName } from '@/lib/clientImage';

export default function ImageCompressorClient() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [quality, setQuality] = useState(0.7);
    const [busy, setBusy] = useState(false);
    const [output, setOutput] = useState<{ blob: Blob; url: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFile = useCallback((f: File) => {
        setError(null);
        setOutput(null);
        if (!f.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        setFile(f);
        setPreviewUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return URL.createObjectURL(f);
        });
    }, []);

    const compress = useCallback(async () => {
        if (!file) return;
        setBusy(true);
        setError(null);
        try {
            const img = await fileToImage(file);
            const canvas = drawToCanvas(img);
            const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
            setOutput((old) => {
                if (old) URL.revokeObjectURL(old.url);
                return { blob, url: URL.createObjectURL(blob) };
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Compression failed.');
        } finally {
            setBusy(false);
        }
    }, [file, quality]);

    const saved = output && file ? Math.round((1 - output.blob.size / file.size) * 100) : 0;

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                <Dropzone
                    onFile={onFile}
                    sublabel="JPG, PNG or WebP"
                    preview={
                        previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewUrl} alt="Preview" className="max-h-56 rounded-lg object-contain" />
                        ) : undefined
                    }
                />

                {file && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Quality</span>
                                <span className="tabular-nums">{Math.round(quality * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={quality}
                                onChange={(e) => setQuality(parseFloat(e.target.value))}
                                className="w-full accent-brand-500"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-slate-500">Original: {formatBytes(file.size)}</span>
                            <button type="button" onClick={compress} disabled={busy} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40">
                                {busy ? 'Compressing…' : 'Compress'}
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
                    <img src={output.url} alt="Compressed result" className="max-h-64 mx-auto rounded-lg object-contain" />
                    <p className="text-sm text-slate-300">
                        {formatBytes(file.size)} → <span className="text-white font-semibold">{formatBytes(output.blob.size)}</span>
                        {saved > 0 && <span className="text-emerald-400 font-semibold"> · {saved}% smaller</span>}
                    </p>
                    <button
                        type="button"
                        onClick={() => downloadBlob(output.blob, `${baseName(file.name)}-compressed.jpg`)}
                        className="btn-primary px-5 py-2.5 text-sm"
                    >
                        Download
                    </button>
                </div>
            )}
        </div>
    );
}
