'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { downloadBlob } from '@/lib/clientImage';

const COLORS = [
    { fg: '#0f172a', bg: '#ffffff', label: 'Classic' },
    { fg: '#ffffff', bg: '#0f172a', label: 'Inverted' },
    { fg: '#7c3aed', bg: '#ffffff', label: 'Purple' },
    { fg: '#0ea5e9', bg: '#ffffff', label: 'Sky' },
];

export default function QrCodeClient() {
    const [value, setValue] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const text = value.trim();
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!text) {
            setReady(false);
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        QRCode.toCanvas(
            canvas,
            text,
            { width: 320, margin: 2, color: { dark: color.fg, light: color.bg } },
            (err) => setReady(!err)
        );
    }, [value, color]);

    const handleDownload = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !ready) return;
        canvas.toBlob((blob) => {
            if (blob) downloadBlob(blob, 'qr-code.png');
        }, 'image/png');
    }, [ready]);

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter a URL or text (https://reelfetch.xyz)"
                    className="w-full rounded-xl bg-surface-800/60 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                />

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">Style:</span>
                    {COLORS.map((c) => (
                        <button
                            key={c.label}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                color.label === c.label
                                    ? 'border-brand-500/50 text-white bg-brand-500/10'
                                    : 'border-white/10 text-slate-400 hover:text-white'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-card p-6 flex flex-col items-center gap-4">
                <div className="rounded-xl bg-white p-3" style={{ display: ready ? 'block' : 'none' }}>
                    <canvas ref={canvasRef} className="block" />
                </div>
                {!ready && (
                    <p className="text-sm text-slate-500 py-16">Your QR code will appear here.</p>
                )}
                {ready && (
                    <button type="button" onClick={handleDownload} className="btn-primary px-5 py-2.5 text-sm">
                        Download PNG
                    </button>
                )}
            </div>
        </div>
    );
}
