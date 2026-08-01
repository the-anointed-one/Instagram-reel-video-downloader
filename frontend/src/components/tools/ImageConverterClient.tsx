'use client';

import { useState, useCallback } from 'react';
import Dropzone from '@/components/tools/Dropzone';
import { fileToImage, drawToCanvas, canvasToBlob, downloadBlob, formatBytes, baseName, IMAGE_FORMATS, ImageFormatKey } from '@/lib/clientImage';

const TARGETS: ImageFormatKey[] = ['png', 'jpeg', 'webp'];

export default function ImageConverterClient() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [target, setTarget] = useState<ImageFormatKey>('png');
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

    const convert = useCallback(async () => {
        if (!file) return;
        setBusy(true);
        setError(null);
        try {
            const img = await fileToImage(file);
            const canvas = drawToCanvas(img);
            const blob = await canvasToBlob(canvas, IMAGE_FORMATS[target].mime, 0.92);
            setOutput((old) => {
                if (old) URL.revokeObjectURL(old.url);
                return { blob, url: URL.createObjectURL(blob) };
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Conversion failed.');
        } finally {
            setBusy(false);
        }
    }, [file, target]);

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
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">Convert to:</span>
                            {TARGETS.map((t) => (
                                <button key={t} type="button" onClick={() => setTarget(t)}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                        target === t ? 'border-brand-500/50 text-white bg-brand-500/10' : 'border-white/10 text-slate-400 hover:text-white'
                                    }`}>
                                    {IMAGE_FORMATS[t].label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-slate-500">Original: {formatBytes(file.size)}</span>
                            <button type="button" onClick={convert} disabled={busy} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40">
                                {busy ? 'Converting…' : 'Convert'}
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
                    <img src={output.url} alt="Converted result" className="max-h-64 mx-auto rounded-lg object-contain" />
                    <p className="text-sm text-slate-300">
                        {IMAGE_FORMATS[target].label} · <span className="text-white font-semibold">{formatBytes(output.blob.size)}</span>
                    </p>
                    <button type="button" onClick={() => downloadBlob(output.blob, `${baseName(file.name)}.${IMAGE_FORMATS[target].ext}`)} className="btn-primary px-5 py-2.5 text-sm">
                        Download {IMAGE_FORMATS[target].label}
                    </button>
                </div>
            )}
        </div>
    );
}
