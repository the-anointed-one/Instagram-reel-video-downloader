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

// ── Tools ─────────────────────────────────────────────────────────

export interface AiDetectResponse {
    success: boolean;
    aiProbability?: number | null;   // 0..1
    humanProbability?: number | null; // 0..1
    cached?: boolean;
    error?: string;
}

/**
 * Run AI-content detection. Never throws — network/HTTP errors are normalised
 * into an { success:false, error } payload so callers can render them directly.
 */
export async function detectAiText(text: string): Promise<AiDetectResponse> {
    try {
        const { data } = await apiClient.post<AiDetectResponse>('/api/tools/ai-detector/text', { text });
        return data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) {
            return err.response.data as AiDetectResponse;
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/**
 * Detect whether an image is AI-generated. Sends the raw file bytes with the
 * image's own Content-Type so the backend can forward it to Sightengine.
 * Never throws — errors are normalised into { success:false, error }.
 */
export async function detectAiImage(file: File): Promise<AiDetectResponse> {
    try {
        const { data } = await apiClient.post<AiDetectResponse>('/api/tools/ai-image-detector', file, {
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
        });
        return data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) {
            return err.response.data as AiDetectResponse;
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export interface AiToolResponse {
    success: boolean;
    result?: string;
    cached?: boolean;
    error?: string;
}

/**
 * Run an LLM text tool (summarizer, paraphraser, grammar, translator,
 * caption, hashtag, bio). Never throws — errors are normalised.
 */
export async function runAiTool(
    task: string,
    text: string,
    options?: Record<string, string>
): Promise<AiToolResponse> {
    try {
        const { data } = await apiClient.post<AiToolResponse>(`/api/tools/ai/${task}`, { text, options });
        return data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) {
            return err.response.data as AiToolResponse;
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

export interface SubtitleResponse {
    success: boolean;
    transcript?: string;
    srt?: string;
    vtt?: string;
    cached?: boolean;
    error?: string;
}

/** Transcribe from a pasted video URL. Never throws. */
export async function transcribeUrl(url: string): Promise<SubtitleResponse> {
    try {
        const { data } = await apiClient.post<SubtitleResponse>(
            '/api/tools/subtitle-generator/url',
            { url },
            { timeout: 180000 }
        );
        return data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) return err.response.data as SubtitleResponse;
        return { success: false, error: 'Network error. Please try again.' };
    }
}

/** Transcribe from an uploaded audio/video file. Never throws. */
export async function transcribeUpload(file: File): Promise<SubtitleResponse> {
    try {
        const { data } = await apiClient.post<SubtitleResponse>(
            '/api/tools/subtitle-generator/upload',
            file,
            { headers: { 'Content-Type': file.type || 'application/octet-stream' }, timeout: 180000 }
        );
        return data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data) return err.response.data as SubtitleResponse;
        return { success: false, error: 'Network error. Please try again.' };
    }
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
