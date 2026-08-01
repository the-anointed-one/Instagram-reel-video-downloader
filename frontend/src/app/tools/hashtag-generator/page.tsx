import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiTextToolClient from '@/components/tools/AiTextToolClient';

export const metadata: Metadata = {
    title: 'Free Hashtag Generator — AI Hashtags for Any Post',
    description: 'Generate relevant, discoverable hashtags for Instagram, TikTok and more. Free AI hashtag generator, no login.',
    keywords: ['hashtag generator', 'instagram hashtags', 'tiktok hashtags', 'ai hashtags', 'best hashtags'],
    alternates: { canonical: '/tools/hashtag-generator' },
};

export default function Page() {
    return (
        <ToolShell slug="hashtag-generator" title="Hashtag Generator" subtitle="Find relevant, discoverable hashtags for your next post.">
            <AiTextToolClient
                config={{
                    task: 'hashtag',
                    inputLabel: 'What is your post about?',
                    placeholder: 'e.g. Vegan meal prep for busy weeknights',
                    submitLabel: 'Generate hashtags',
                    maxChars: 500,
                    resultLabel: 'Hashtags',
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
                    ],
                }}
            />
        </ToolShell>
    );
}
