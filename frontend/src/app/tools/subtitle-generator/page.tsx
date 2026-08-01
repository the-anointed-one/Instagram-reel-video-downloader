import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import SubtitleGeneratorClient from '@/components/tools/SubtitleGeneratorClient';

export const metadata: Metadata = {
    title: 'Free Subtitle Generator — Auto Subtitles & Transcripts (SRT/VTT)',
    description:
        'Auto-generate subtitles and transcripts from any video URL or audio file. Download SRT and VTT captions free — no login required.',
    keywords: [
        'subtitle generator',
        'auto subtitles',
        'video to text',
        'transcribe video',
        'srt generator',
        'caption generator',
        'video transcription',
    ],
    alternates: { canonical: '/tools/subtitle-generator' },
    openGraph: {
        title: 'Free Subtitle Generator — Auto Subtitles & Transcripts',
        description: 'Auto-generate subtitles and transcripts from any video or audio. Download SRT and VTT free.',
        type: 'website',
    },
};

export default function SubtitleGeneratorPage() {
    return (
        <ToolShell
            slug="subtitle-generator"
            title="Subtitle Generator"
            subtitle="Auto-generate subtitles and a transcript from a video URL or an audio/video file. Download ready-to-use SRT and VTT captions."
        >
            <SubtitleGeneratorClient />
        </ToolShell>
    );
}
