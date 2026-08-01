import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiTextToolClient from '@/components/tools/AiTextToolClient';

export const metadata: Metadata = {
    title: 'Free AI Translator — Translate Text Between Languages',
    description: 'Translate text naturally between languages with AI. Free online translator, no login required.',
    keywords: ['ai translator', 'translate text', 'language translator', 'online translator', 'free translation'],
    alternates: { canonical: '/tools/ai-translator' },
};

export default function Page() {
    return (
        <ToolShell slug="ai-translator" title="AI Translator" subtitle="Translate text naturally into any language.">
            <AiTextToolClient
                config={{
                    task: 'translator',
                    inputLabel: 'Text to translate',
                    placeholder: 'Paste the text you want to translate…',
                    submitLabel: 'Translate',
                    maxChars: 5000,
                    resultLabel: 'Translation',
                    freeText: {
                        key: 'language',
                        label: 'Translate to',
                        placeholder: 'e.g. Spanish, French, Japanese',
                        defaultValue: 'Spanish',
                    },
                }}
            />
        </ToolShell>
    );
}
