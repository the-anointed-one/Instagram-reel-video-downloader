import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import VideoToolClient from '@/components/tools/VideoToolClient';

export const metadata: Metadata = {
    title: 'Free Audio Extractor — Extract MP3 from Video',
    description: 'Extract the audio (MP3 or WAV) from any video file in your browser — no upload, no watermark, no login.',
    keywords: ['audio extractor', 'video to mp3', 'extract audio from video', 'mp4 to mp3', 'get audio from video'],
    alternates: { canonical: '/tools/audio-extractor' },
};

export default function Page() {
    return (
        <ToolShell slug="audio-extractor" title="Audio Extractor" subtitle="Pull the audio track out of any video — private, in your browser.">
            <VideoToolClient slug="audio-extractor" />
        </ToolShell>
    );
}
