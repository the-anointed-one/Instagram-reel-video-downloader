import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import VideoToolClient from '@/components/tools/VideoToolClient';

export const metadata: Metadata = {
    title: 'Free Video Converter — MP4, WebM & GIF',
    description: 'Convert video to MP4, WebM or animated GIF in your browser — no upload, no watermark, no login.',
    keywords: ['video converter', 'mp4 converter', 'video to gif', 'webm converter', 'convert video online'],
    alternates: { canonical: '/tools/video-converter' },
};

export default function Page() {
    return (
        <ToolShell slug="video-converter" title="Video Converter" subtitle="Convert to MP4, WebM or animated GIF — processed privately in your browser.">
            <VideoToolClient slug="video-converter" />
        </ToolShell>
    );
}
