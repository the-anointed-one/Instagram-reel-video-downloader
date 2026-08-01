import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiTextToolClient from '@/components/tools/AiTextToolClient';

export const metadata: Metadata = {
    title: 'Free AI Paraphraser — Reword & Rephrase Text',
    description: 'Rewrite and rephrase any sentence or paragraph while keeping its meaning. Free AI paraphrasing tool, no login.',
    keywords: ['ai paraphraser', 'paraphrasing tool', 'reword text', 'rephrase sentence', 'rewriter'],
    alternates: { canonical: '/tools/ai-paraphraser' },
};

export default function Page() {
    return (
        <ToolShell slug="ai-paraphraser" title="AI Paraphraser" subtitle="Reword any text while keeping its original meaning.">
            <AiTextToolClient
                config={{
                    task: 'paraphraser',
                    inputLabel: 'Text to paraphrase',
                    placeholder: 'Paste the text you want to reword…',
                    submitLabel: 'Paraphrase',
                    maxChars: 5000,
                    resultLabel: 'Rewritten text',
                    selects: [
                        {
                            key: 'tone',
                            label: 'Style',
                            defaultValue: 'standard',
                            choices: [
                                { value: 'standard', label: 'Standard' },
                                { value: 'formal', label: 'Formal' },
                                { value: 'casual', label: 'Casual' },
                                { value: 'fluent', label: 'Fluent' },
                                { value: 'simple', label: 'Simple' },
                            ],
                        },
                    ],
                }}
            />
        </ToolShell>
    );
}
