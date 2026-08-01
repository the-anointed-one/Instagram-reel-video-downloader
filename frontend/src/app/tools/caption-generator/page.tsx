import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiTextToolClient from '@/components/tools/AiTextToolClient';

export const metadata: Metadata = {
    title: 'Free Caption Generator — AI Social Media Captions',
    description: 'Generate scroll-stopping captions for Instagram, TikTok, YouTube and more. Free AI caption generator, no login.',
    keywords: ['caption generator', 'instagram caption generator', 'social media captions', 'ai captions', 'tiktok captions'],
    alternates: { canonical: '/tools/caption-generator' },
};

export default function Page() {
    return (
        <ToolShell slug="caption-generator" title="Caption Generator" subtitle="Generate scroll-stopping captions for any platform in seconds.">
            <AiTextToolClient
                config={{
                    task: 'caption',
                    inputLabel: 'What is your post about?',
                    placeholder: 'e.g. A sunset hike with friends and homemade trail snacks',
                    submitLabel: 'Generate captions',
                    maxChars: 1000,
                    resultLabel: 'Captions',
                    selects: [
                        {
                            key: 'platform',
                            label: 'Platform',
                            defaultValue: 'instagram',
                            choices: [
                                { value: 'instagram', label: 'Instagram' },
                                { value: 'tiktok', label: 'TikTok' },
                                { value: 'youtube', label: 'YouTube' },
                                { value: 'linkedin', label: 'LinkedIn' },
                                { value: 'x', label: 'X / Twitter' },
                                { value: 'facebook', label: 'Facebook' },
                            ],
                        },
                        {
                            key: 'tone',
                            label: 'Tone',
                            defaultValue: 'casual',
                            choices: [
                                { value: 'casual', label: 'Casual' },
                                { value: 'professional', label: 'Professional' },
                                { value: 'funny', label: 'Funny' },
                                { value: 'inspirational', label: 'Inspirational' },
                            ],
                        },
                    ],
                }}
            />
        </ToolShell>
    );
}
