'use client';

import { useState, useCallback } from 'react';
import Dropzone from '@/components/tools/Dropzone';
import { fileToImage, canvasToBlob, downloadBlob, formatBytes, baseName } from '@/lib/clientImage';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'tile';

const POSITIONS: { key: Position; label: string }[] = [
    { key: 'bottom-right', label: 'Bottom right' },
    { key: 'bottom-left', label: 'Bottom left' },
    { key: 'top-right', label: 'Top right' },
    { key: 'top-left', label: 'Top left' },
    { key: 'center', label: 'Center' },
    { key: 'tile', label: 'Tiled' },
];

export default function WatermarkClient() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('ReelFetch');
    const [position, setPosition] = useState<Position>('bottom-right');
    const [opacity, setOpacity] = useState(0.5);
    const [size, setSize] = useState(5); // % of image width
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
    }, []);

    const apply = useCallback(async () => {
        if (!file) return;
        if (!text.trim()) {
            setError('Enter watermark text.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const img = await fileToImage(file);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas is not supported in this browser.');

            ctx.drawImage(img, 0, 0);

            const fontPx = Math.max(12, Math.round((size / 100) * canvas.width));
            ctx.font = `600 ${fontPx}px sans-serif`;
            ctx.fillStyle = `rgba(255,255,255,${opacity})`;
            ctx.strokeStyle = `rgba(0,0,0,${opacity * 0.4})`;
            ctx.lineWidth = Math.max(1, fontPx / 20);
            const pad = fontPx * 0.6;
            const metrics = ctx.measureText(text);
            const tw = metrics.width;

            const place = (x: number, y: number, align: CanvasTextAlign, baseline: CanvasTextBaseline) => {
                ctx.textAlign = align;
                ctx.textBaseline = baseline;
                ctx.strokeText(text, x, y);
                ctx.fillText(text, x, y);
            };

            switch (position) {
                case 'bottom-right': place(canvas.width - pad, canvas.height - pad, 'right', 'bottom'); break;
                case 'bottom-left': place(pad, canvas.height - pad, 'left', 'bottom'); break;
                case 'top-right': place(canvas.width - pad, pad, 'right', 'top'); break;
                case 'top-left': place(pad, pad, 'left', 'top'); break;
                case 'center': place(canvas.width / 2, canvas.height / 2, 'center', 'middle'); break;
                case 'tile': {
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    const stepX = tw + fontPx * 3;
                    const stepY = fontPx * 4;
                    ctx.save();
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate(-Math.PI / 6);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);
                    for (let y = 0; y < canvas.height * 1.5; y += stepY) {
                        for (let x = -canvas.width * 0.25; x < canvas.width * 1.25; x += stepX) {
                            ctx.strokeText(text, x, y);
                            ctx.fillText(text, x, y);
                        }
                    }
                    ctx.restore();
                    break;
                }
            }

            const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const blob = await canvasToBlob(canvas, type, 0.92);
            setOutput((old) => {
                if (old) URL.revokeObjectURL(old.url);
                return { blob, url: URL.createObjectURL(blob) };
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Watermarking failed.');
        } finally {
            setBusy(false);
        }
    }, [file, text, position, opacity, size]);

    const ext = file?.type === 'image/png' ? 'png' : 'jpg';

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                <Dropzone onFile={onFile} sublabel="JPG, PNG or WebP" />

                {file && (
                    <>
                        <label className="block space-y-1">
                            <span className="text-xs text-slate-400">Watermark text</span>
                            <input type="text" value={text} onChange={(e) => setText(e.target.value)}
                                className="w-full rounded-xl bg-surface-800/60 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
                        </label>

                        <div className="flex flex-wrap items-center gap-2">
                            {POSITIONS.map((p) => (
                                <button key={p.key} type="button" onClick={() => setPosition(p.key)}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                        position === p.key ? 'border-brand-500/50 text-white bg-brand-500/10' : 'border-white/10 text-slate-400 hover:text-white'
                                    }`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400"><span>Opacity</span><span>{Math.round(opacity * 100)}%</span></div>
                                <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-brand-500" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400"><span>Size</span><span>{size}%</span></div>
                                <input type="range" min={2} max={15} step={1} value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} className="w-full accent-brand-500" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={apply} disabled={busy} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40">
                                {busy ? 'Applying…' : 'Add watermark'}
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
                    <img src={output.url} alt="Watermarked result" className="max-h-64 mx-auto rounded-lg object-contain" />
                    <p className="text-sm text-slate-300"><span className="text-white font-semibold">{formatBytes(output.blob.size)}</span></p>
                    <button type="button" onClick={() => downloadBlob(output.blob, `${baseName(file.name)}-watermarked.${ext}`)} className="btn-primary px-5 py-2.5 text-sm">
                        Download
                    </button>
                </div>
            )}
        </div>
    );
}
