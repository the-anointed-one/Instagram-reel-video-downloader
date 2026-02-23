import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 45000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface DownloadResponse {
    success: boolean;
    videoUrl?: string;
    thumbnail?: string | null;
    caption?: string | null;
    title?: string;
    cached?: boolean;
    error?: string;
}

export async function downloadReel(url: string): Promise<DownloadResponse> {
    const { data } = await apiClient.post<DownloadResponse>('/api/download', { url });
    return data;
}

export default apiClient;
