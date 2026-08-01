import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import WatermarkClient from '@/components/tools/WatermarkClient';

export const metadata: Metadata = {
    title: 'Free Watermark Tool — Add a Watermark to Images',
    description:
        'Add a text watermark to your photos with adjustable position, opacity and size. Free, no upload — everything runs in your browser.',
    keywords: ['add watermark', 'watermark image', 'watermark tool', 'watermark photo online', 'text watermark'],
    alternates: { canonical: '/tools/watermark' },
};

export default function WatermarkPage() {
    return (
        <ToolShell
            slug="watermark"
            title="Watermark"
            subtitle="Stamp a text watermark onto any image — choose position, opacity and size. Processed locally, never uploaded."
        >
            <WatermarkClient />
        </ToolShell>
    );
}
