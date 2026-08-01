import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import WordCounterClient from '@/components/tools/WordCounterClient';

export const metadata: Metadata = {
    title: 'Free Word Counter — Count Words, Characters & Reading Time',
    description:
        'Free online word counter. Instantly count words, characters, sentences, paragraphs and reading time as you type. No login, works offline in your browser.',
    keywords: ['word counter', 'character counter', 'word count tool', 'count words online', 'reading time calculator'],
    alternates: { canonical: '/tools/word-counter' },
};

export default function WordCounterPage() {
    return (
        <ToolShell
            slug="word-counter"
            title="Word Counter"
            subtitle="Count words, characters, sentences, paragraphs and reading time in real time. Everything runs in your browser — nothing is uploaded."
        >
            <WordCounterClient />
        </ToolShell>
    );
}
