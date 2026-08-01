import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import ImageConverterClient from '@/components/tools/ImageConverterClient';

export const metadata: Metadata = {
    title: 'Free Image Converter — JPG ↔ PNG ↔ WebP',
    description:
        'Convert images between JPG, PNG and WebP formats instantly. Free, no upload to any server — everything runs in your browser.',
    keywords: ['image converter', 'jpg to png', 'png to jpg', 'webp converter', 'convert image format', 'png to webp'],
    alternates: { canonical: '/tools/image-converter' },
};

export default function ImageConverterPage() {
    return (
        <ToolShell
            slug="image-converter"
            title="Image Converter"
            subtitle="Convert between JPG, PNG and WebP in one click. Files are converted locally and never uploaded."
        >
            <ImageConverterClient />
        </ToolShell>
    );
}
