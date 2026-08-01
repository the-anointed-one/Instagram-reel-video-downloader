import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiDetectorClient from '@/components/tools/AiDetectorClient';

export const metadata: Metadata = {
    title: 'Free AI Content Detector — Check if Text is AI-Generated',
    description:
        'Paste any text to check whether it was written by AI (ChatGPT, Gemini, Claude) or a human. Free AI detector, no login required.',
    keywords: [
        'ai detector',
        'ai content detector',
        'ai text detector',
        'chatgpt detector',
        'is this written by ai',
        'ai checker',
        'detect ai writing',
    ],
    alternates: { canonical: '/tools/ai-detector' },
    openGraph: {
        title: 'Free AI Content Detector — Check if Text is AI-Generated',
        description:
            'Paste any text to check whether it was written by AI or a human. Free, no login required.',
        type: 'website',
    },
};

export default function AiDetectorPage() {
    return (
        <ToolShell
            slug="ai-detector"
            title="AI Content Detector"
            subtitle="Paste text below to estimate whether it was written by AI or a human. Works with output from ChatGPT, Gemini, Claude and others."
        >
            <AiDetectorClient />
        </ToolShell>
    );
}
