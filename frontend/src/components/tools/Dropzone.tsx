'use client';

import { useRef } from 'react';

/**
 * Reusable click/drag file picker used across the client-side image tools.
 * Pass a `preview` node to replace the default prompt once a file is chosen.
 */
export default function Dropzone({
    onFile,
    accept = 'image/*',
    label = 'Click to upload or drag a file here',
    sublabel,
    preview,
}: {
    onFile: (file: File) => void;
    accept?: string;
    label?: string;
    sublabel?: string;
    preview?: React.ReactNode;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) onFile(f);
            }}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-surface-800/40 px-4 py-10 text-center cursor-pointer hover:border-brand-500/40 transition-colors"
        >
            {preview ?? (
                <>
                    <svg className="w-9 h-9 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V18a3 3 0 003 3h12a3 3 0 003-3v-1.5m-9-12v12m0-12l-4 4m4-4l4 4" />
                    </svg>
                    <div>
                        <p className="text-sm text-slate-300 font-medium">{label}</p>
                        {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
                    </div>
                </>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                }}
            />
        </div>
    );
}
