import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiTextToolClient from '@/components/tools/AiTextToolClient';

export const metadata: Metadata = {
    title: 'Free AI Summarizer — Summarize Any Text Instantly',
    description: 'Paste any text and get a clear, accurate summary in seconds. Free AI summarizer, no login required.',
    keywords: ['ai summarizer', 'text summarizer', 'summarize text', 'article summarizer', 'summary generator'],
    alternates: { canonical: '/tools/ai-summarizer' },
};

export default function Page() {
    return (
        <ToolShell slug="ai-summarizer" title="AI Summarizer" subtitle="Turn long text into a clear, concise summary in seconds.">
            <AiTextToolClient
                config={{
                    task: 'summarizer',
                    inputLabel: 'Text to summarize',
                    placeholder: 'Paste the text you want to summarize…',
                    submitLabel: 'Summarize',
                    maxChars: 8000,
                    resultLabel: 'Summary',
                    selects: [
                        {
                            key: 'length',
                            label: 'Length',
                            defaultValue: 'medium',
                            choices: [
                                { value: 'short', label: 'Short' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'long', label: 'Long' },
                            ],
                        },
                    ],
                }}
            />
        </ToolShell>
    );
}
