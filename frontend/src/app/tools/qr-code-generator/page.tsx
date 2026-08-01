import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import QrCodeClient from '@/components/tools/QrCodeClient';

export const metadata: Metadata = {
    title: 'Free QR Code Generator — Create & Download QR Codes',
    description:
        'Generate a QR code from any URL or text and download it as a PNG. Free, instant, no login. Everything runs in your browser.',
    keywords: ['qr code generator', 'create qr code', 'qr code maker', 'free qr code', 'url to qr code'],
    alternates: { canonical: '/tools/qr-code-generator' },
};

export default function QrCodePage() {
    return (
        <ToolShell
            slug="qr-code-generator"
            title="QR Code Generator"
            subtitle="Turn any link or text into a downloadable QR code. Free, instant, and generated entirely in your browser."
        >
            <QrCodeClient />
        </ToolShell>
    );
}
