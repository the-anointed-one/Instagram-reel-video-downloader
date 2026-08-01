'use client';

import { useState, useMemo } from 'react';

export default function WordCounterClient() {
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length;
        const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim()).length : 0;
        const readingMin = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
        return { words, chars, charsNoSpaces, sentences, paragraphs, readingMin };
    }, [text]);

    const cards = [
        { label: 'Words', value: stats.words },
        { label: 'Characters', value: stats.chars },
        { label: 'Characters (no spaces)', value: stats.charsNoSpaces },
        { label: 'Sentences', value: stats.sentences },
        { label: 'Paragraphs', value: stats.paragraphs },
        { label: 'Reading time', value: `${stats.readingMin} min` },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cards.map((c) => (
                    <div key={c.label} className="glass-card p-4 text-center">
                        <p className="text-2xl font-extrabold text-white tabular-nums">
                            {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">{c.label}</p>
                    </div>
                ))}
            </div>

            <div className="glass-card p-5 space-y-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing or paste your text here…"
                    rows={12}
                    className="w-full resize-y rounded-xl bg-surface-800/60 border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                />
                {text.length > 0 && (
                    <div className="flex justify-end">
                        <button type="button" onClick={() => setText('')} className="btn-secondary text-xs px-3 py-2">
                            Clear
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
