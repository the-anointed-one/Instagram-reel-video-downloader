import type { Metadata } from 'next';
import ToolShell from '@/components/tools/ToolShell';
import AiTextToolClient from '@/components/tools/AiTextToolClient';

export const metadata: Metadata = {
    title: 'Free Bio Generator — AI Profile Bios',
    description: 'Generate catchy profile bios for Instagram, TikTok, Twitter and LinkedIn. Free AI bio generator, no login.',
    keywords: ['bio generator', 'instagram bio generator', 'profile bio', 'ai bio', 'tiktok bio'],
    alternates: { canonical: '/tools/bio-generator' },
};

export default function Page() {
    return (
        <ToolShell slug="bio-generator" title="Bio Generator" subtitle="Write a catchy profile bio in seconds.">
            <AiTextToolClient
                config={{
                    task: 'bio',
                    inputLabel: 'Describe yourself',
                    placeholder: 'e.g. Travel photographer, coffee lover, sharing tips on shooting with film',
                    submitLabel: 'Generate bios',
                    maxChars: 800,
                    resultLabel: 'Bios',
                    selects: [
                        {
                            key: 'platform',
                            label: 'Platform',
                            defaultValue: 'instagram',
                            choices: [
                                { value: 'instagram', label: 'Instagram' },
                                { value: 'tiktok', label: 'TikTok' },
                                { value: 'twitter', label: 'X / Twitter' },
                                { value: 'linkedin', label: 'LinkedIn' },
                                { value: 'general', label: 'General' },
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
                                { value: 'aesthetic', label: 'Aesthetic' },
                            ],
                        },
                    ],
                }}
            />
        </ToolShell>
    );
}
