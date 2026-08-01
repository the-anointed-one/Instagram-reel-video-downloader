import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiTextToolClient from '@/components/tools/AiTextToolClient';

export const metadata: Metadata = {
    title: 'Free Grammar Checker — Fix Grammar & Spelling',
    description: 'Correct grammar, spelling and punctuation in any text instantly. Free AI grammar checker, no login required.',
    keywords: ['grammar checker', 'spell checker', 'fix grammar', 'punctuation checker', 'proofreader'],
    alternates: { canonical: '/tools/grammar-checker' },
};

export default function Page() {
    return (
        <ToolShell slug="grammar-checker" title="Grammar Checker" subtitle="Fix grammar, spelling and punctuation while keeping your voice.">
            <AiTextToolClient
                config={{
                    task: 'grammar',
                    inputLabel: 'Text to check',
                    placeholder: 'Paste the text you want to proofread…',
                    submitLabel: 'Check grammar',
                    maxChars: 5000,
                    resultLabel: 'Corrected text',
                }}
            />
        </ToolShell>
    );
}
