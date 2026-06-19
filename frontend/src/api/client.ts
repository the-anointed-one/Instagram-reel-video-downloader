import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export type Platform = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'twitter' | 'pinterest';

export interface DownloadResponse {
    success: boolean;
    videoUrl?: string;
    thumbnail?: string | null;
    caption?: string | null;
    title?: string;
    author?: string | null;
    cached?: boolean;
    platform?: Platform;
    error?: string;
}

export interface AudioResponse {
    success: boolean;
    audioUrl?: string;
    title?: string;
    platform?: Platform;
    sourceUrl?: string;
    error?: string;
}

export async function downloadVideo(url: string): Promise<DownloadResponse> {
    const { data } = await apiClient.post<DownloadResponse>('/api/download', { url });
    return data;
}

export async function extractAudio(url: string): Promise<AudioResponse> {
    const { data } = await apiClient.post<AudioResponse>('/api/download/audio', { url });
    return {
        ...data,
        sourceUrl: url,
    };
}

/** @deprecated Use downloadVideo instead */
export async function downloadReel(url: string): Promise<DownloadResponse> {
    return downloadVideo(url);
}

export interface StatsResponse {
    downloadsToday: number;
}

export async function fetchStats(): Promise<StatsResponse> {
    try {
        const { data } = await apiClient.get<StatsResponse>('/api/stats');
        return data;
    } catch {
        return { downloadsToday: 0 };
    }
}

export default apiClient;
