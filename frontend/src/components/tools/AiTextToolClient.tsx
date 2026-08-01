'use client';

import { useState } from 'react';
import { runAiTool } from '@/api/client';

export interface SelectOption {
    key: string;
    label: string;
    choices: { value: string; label: string }[];
    defaultValue: string;
}

export interface AiTextToolConfig {
    task: string;                 // backend task slug
    inputLabel: string;
    placeholder: string;
    submitLabel: string;
    maxChars: number;
    selects?: SelectOption[];
    /** free-text option sent under this key (e.g. translator's target language) */
    freeText?: { key: string; label: string; placeholder: string; defaultValue: string };
    resultLabel?: string;
}

export default function AiTextToolClient({ config }: { config: AiTextToolConfig }) {
    const [text, setText] = useState('');
    const [opts, setOpts] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        config.selects?.forEach((s) => (init[s.key] = s.defaultValue));
        if (config.freeText) init[config.freeText.key] = config.freeText.defaultValue;
        return init;
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const chars = text.trim().length;
    const overLimit = chars > config.maxChars;
    const canSubmit = chars >= 2 && !overLimit && !loading;

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setCopied(false);
        try {
            const data = await runAiTool(config.task, text.trim(), opts);
            if (data.success && data.result) setResult(data.result);
            else setError(data.error || 'Something went wrong. Please try again.');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard blocked — ignore */
        }
    };

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                <label className="block space-y-1">
                    <span className="text-xs text-slate-400">{config.inputLabel}</span>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={config.placeholder}
                        rows={7}
                        className="w-full resize-y rounded-xl bg-surface-800/60 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                    />
                </label>

                {(config.selects || config.freeText) && (
                    <div className="flex flex-wrap items-end gap-3">
                        {config.freeText && (
                            <label className="space-y-1">
                                <span className="text-xs text-slate-400">{config.freeText.label}</span>
                                <input
                                    type="text"
                                    value={opts[config.freeText.key] ?? ''}
                                    placeholder={config.freeText.placeholder}
                                    onChange={(e) => setOpts((o) => ({ ...o, [config.freeText!.key]: e.target.value }))}
                                    className="block rounded-lg bg-surface-800/60 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50"
                                />
                            </label>
                        )}
                        {config.selects?.map((s) => (
                            <label key={s.key} className="space-y-1">
                                <span className="text-xs text-slate-400">{s.label}</span>
                                <select
                                    value={opts[s.key]}
                                    onChange={(e) => setOpts((o) => ({ ...o, [s.key]: e.target.value }))}
                                    className="block rounded-lg bg-surface-800/60 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50 capitalize"
                                >
                                    {s.choices.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                    <span className={`text-xs ${overLimit ? 'text-red-400' : 'text-slate-500'}`}>
                        {chars.toLocaleString()} / {config.maxChars.toLocaleString()} chars
                    </span>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Working…' : config.submitLabel}
                    </button>
                </div>
            </div>

            {error && (
                <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {result && (
                <div className="glass-card p-6 space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                            {config.resultLabel || 'Result'}
                        </h3>
                        <button type="button" onClick={handleCopy} className="btn-secondary text-xs px-3 py-1.5">
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{result}</p>
                </div>
            )}
        </div>
    );
}
