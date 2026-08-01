'use client';

import { useState } from 'react';
import { detectAiText, AiDetectResponse } from '@/api/client';

const MAX_CHARS = 1500;
const MIN_CHARS = 255;

export default function AiDetectorClient() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AiDetectResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const chars = text.trim().length;
    const tooShort = chars > 0 && chars < MIN_CHARS;
    const overLimit = chars > MAX_CHARS;
    const canSubmit = chars >= MIN_CHARS && !overLimit && !loading;

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await detectAiText(text.trim());
            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Normalise 0..1 probability → whole-number percentage
    const aiPct =
        result && typeof result.aiProbability === 'number'
            ? Math.round(result.aiProbability * 100)
            : null;

    return (
        <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the text you want to check here…"
                    rows={9}
                    className="w-full resize-y rounded-xl bg-surface-800/60 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                />

                <div className="flex items-center justify-between gap-4">
                    <span
                        className={`text-xs ${
                            overLimit ? 'text-red-400' : tooShort ? 'text-amber-400' : 'text-slate-500'
                        }`}
                    >
                        {chars.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
                        {tooShort && ` · need ${MIN_CHARS - chars} more`}
                    </span>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
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
                            ? 'This text shows strong signs of AI generation.'
                            : aiPct >= 30
                            ? 'This text shows some signs of AI generation — results are mixed.'
                            : 'This text reads as mostly human-written.'}{' '}
                        No detector is 100% accurate; use this as a signal, not proof.
                    </p>
                </div>
            )}
        </div>
    );
}
