import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import ImageResizerClient from '@/components/tools/ImageResizerClient';

export const metadata: Metadata = {
    title: 'Free Image Resizer — Resize Photos to Any Dimensions',
    description:
        'Resize JPG, PNG and WebP images to exact pixel dimensions with optional aspect-ratio lock. Free, no upload — runs entirely in your browser.',
    keywords: ['image resizer', 'resize image', 'resize photo', 'change image dimensions', 'resize picture online'],
    alternates: { canonical: '/tools/image-resizer' },
};

export default function ImageResizerPage() {
    return (
        <ToolShell
            slug="image-resizer"
            title="Image Resizer"
            subtitle="Resize any image to exact pixel dimensions, with optional aspect-ratio lock. Processed locally in your browser."
        >
            <ImageResizerClient />
        </ToolShell>
    );
}
