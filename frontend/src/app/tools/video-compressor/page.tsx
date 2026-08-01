import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import VideoToolClient from '@/components/tools/VideoToolClient';

export const metadata: Metadata = {
    title: 'Free Video Compressor — Reduce Video File Size',
    description: 'Compress video to a smaller file size right in your browser — no upload, no watermark, no login.',
    keywords: ['video compressor', 'compress video', 'reduce video size', 'shrink video', 'make video smaller'],
    alternates: { canonical: '/tools/video-compressor' },
};

export default function Page() {
    return (
        <ToolShell slug="video-compressor" title="Video Compressor" subtitle="Shrink a video's file size with an adjustable quality level — private, in your browser.">
            <VideoToolClient slug="video-compressor" />
        </ToolShell>
    );
}
