import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import VideoTrimmerClient from '@/components/tools/VideoTrimmerClient';

export const metadata: Metadata = {
    title: 'Free Video Trimmer — Cut & Trim Video Online',
    description: 'Trim and cut video clips in your browser — no upload, no watermark, no login. Fast and private.',
    keywords: ['video trimmer', 'cut video', 'trim video online', 'video cutter', 'clip video'],
    alternates: { canonical: '/tools/video-trimmer' },
};

export default function Page() {
    return (
        <ToolShell slug="video-trimmer" title="Video Trimmer" subtitle="Drag the handles to cut a clip out of any video — processed privately in your browser.">
            <VideoTrimmerClient />
        </ToolShell>
    );
}
