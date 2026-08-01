'use client';

import { useState, useCallback } from 'react';
import Dropzone from '@/components/tools/Dropzone';
import { transcode, readMediaDuration } from '@/lib/ffmpeg';
import { downloadBlob, formatBytes, baseName } from '@/lib/clientImage';
import { VIDEO_CONFIGS } from '@/components/tools/videoConfigs';

export default function VideoToolClient({ slug }: { slug: string }) {
    const config = VIDEO_CONFIGS[slug];
    const [file, setFile] = useState<File | null>(null);
    const [opts, setOpts] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        config.selects?.forEach((s) => (init[s.key] = s.defaultValue));
        config.ranges?.forEach((r) => (init[r.key] = String(r.defaultValue)));
        config.numbers?.forEach((n) => (init[n.key] = n.defaultValue ?? ''));
        return init;
    });
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [output, setOutput] = useState<{ url: string; blob: Blob; ext: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFile = useCallback(
        async (f: File) => {
            setError(null);
            setOutput(null);
            setFile(f);
            if (config.detectDuration) {
                const dur = await readMediaDuration(f);
                if (dur > 0) {
                    setOpts((o) => {
                        const next = { ...o };
                        config.numbers?.forEach((n) => {
                            if (n.fillWithDuration) next[n.key] = dur.toFixed(1);
                        });
                        return next;
                    });
                }
            }
        },
        [config]
    );

    const run = async () => {
        if (!file) return;
        setBusy(true);
        setError(null);
        setOutput(null);
        setProgress(0);
        try {
            const out = config.output(opts);
            const data = await transcode(
                file,
                out.name,
                (input, outputName) => config.buildArgs(input, outputName, opts),
                (r) => setProgress(r)
            );
            if (!data || data.length === 0) throw new Error('Processing produced no output.');
            // Copy into a fresh ArrayBuffer-backed view so the Blob types cleanly.
            const bytes = new Uint8Array(data.length);
            bytes.set(data);
            const blob = new Blob([bytes], { type: out.mime });
            setOutput((old) => {
                if (old) URL.revokeObjectURL(old.url);
                return { url: URL.createObjectURL(blob), blob, ext: out.ext };
            });
        } catch (e) {
            setError(
                e instanceof Error
                    ? `Processing failed: ${e.message}. Try a shorter clip — this runs in your browser.`
                    : 'Processing failed. Try a shorter clip.'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                <Dropzone
                    onFile={onFile}
                    accept={config.accept}
                    label={file ? file.name : 'Click to upload or drag a file here'}
                    sublabel="Runs in your browser — best for short clips"
                />

                {file && (
                    <>
                        <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>

                        {(config.numbers?.length || config.selects?.length) && (
                            <div className="flex flex-wrap items-end gap-3">
                                {config.numbers?.map((n) => (
                                    <label key={n.key} className="space-y-1">
                                        <span className="text-xs text-slate-400">{n.label}</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.1"
                                            value={opts[n.key] ?? ''}
                                            placeholder={n.placeholder}
                                            onChange={(e) => setOpts((o) => ({ ...o, [n.key]: e.target.value }))}
                                            className="block w-28 rounded-lg bg-surface-800/60 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50"
                                        />
                                    </label>
                                ))}
                                {config.selects?.map((s) => (
                                    <label key={s.key} className="space-y-1">
                                        <span className="text-xs text-slate-400">{s.label}</span>
                                        <select
                                            value={opts[s.key]}
                                            onChange={(e) => setOpts((o) => ({ ...o, [s.key]: e.target.value }))}
                                            className="block rounded-lg bg-surface-800/60 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50"
                                        >
                                            {s.choices.map((c) => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                ))}
                            </div>
                        )}

                        {config.ranges?.map((r) => (
                            <div key={r.key} className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>{r.label}</span>
                                    <span className="tabular-nums">
                                        {r.format ? r.format(Number(opts[r.key])) : opts[r.key]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={r.min}
                                    max={r.max}
                                    step={r.step}
                                    value={opts[r.key]}
                                    onChange={(e) => setOpts((o) => ({ ...o, [r.key]: e.target.value }))}
                                    className="w-full accent-brand-500"
                                />
                            </div>
                        ))}

                        <div className="flex items-center justify-between gap-4">
                            {busy ? (
                                <div className="flex-1 mr-3">
                                    <div className="h-2 w-full rounded-full bg-surface-800 overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 transition-all duration-200"
                                            style={{ width: `${Math.round(progress * 100) || 5}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-600">First run downloads the processor (~30MB, cached after).</span>
                            )}
                            <button type="button" onClick={run} disabled={busy} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                                {busy ? 'Processing…' : config.submitLabel}
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
                    {config.resultKind === 'video' ? (
                        <video src={output.url} controls className="max-h-72 mx-auto rounded-lg" />
                    ) : (
                        <audio src={output.url} controls className="w-full" />
                    )}
                    <p className="text-sm text-slate-300">{formatBytes(output.blob.size)}</p>
                    <button
                        type="button"
                        onClick={() => downloadBlob(output.blob, `${baseName(file.name)}.${output.ext}`)}
                        className="btn-primary px-5 py-2.5 text-sm"
                    >
                        Download
                    </button>
                </div>
            )}
        </div>
    );
}
