import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import ImageCompressorClient from '@/components/tools/ImageCompressorClient';

export const metadata: Metadata = {
    title: 'Free Image Compressor — Reduce Image File Size Online',
    description:
        'Compress JPG, PNG and WebP images to reduce file size without losing quality. Free, no upload to any server — everything runs in your browser.',
    keywords: ['image compressor', 'compress image', 'reduce image size', 'shrink photo', 'jpg compressor', 'png compressor'],
    alternates: { canonical: '/tools/image-compressor' },
};

export default function ImageCompressorPage() {
    return (
        <ToolShell
            slug="image-compressor"
            title="Image Compressor"
            subtitle="Shrink JPG, PNG and WebP file sizes with an adjustable quality slider. Your images never leave your device."
        >
            <ImageCompressorClient />
        </ToolShell>
    );
}
