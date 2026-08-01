/**
 * Client-side config registry for the ffmpeg.wasm video tools.
 *
 * These configs contain functions (output/buildArgs), which cannot be passed
 * from a Server Component page across the RSC boundary. So the pages pass only
 * a slug string, and VideoToolClient looks the config up here (client bundle).
 */

export interface SelectCfg {
    key: string;
    label: string;
    choices: { value: string; label: string }[];
    defaultValue: string;
}
export interface RangeCfg {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    format?: (v: number) => string;
}
export interface NumberCfg {
    key: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    fillWithDuration?: boolean;
}

export interface VideoToolConfig {
    accept: string;
    output: (opts: Record<string, string>) => { name: string; mime: string; ext: string };
    buildArgs: (input: string, output: string, opts: Record<string, string>) => string[];
    resultKind: 'video' | 'audio';
    submitLabel: string;
    selects?: SelectCfg[];
    ranges?: RangeCfg[];
    numbers?: NumberCfg[];
    detectDuration?: boolean;
}

const VIDEO_OUT: Record<string, { name: string; mime: string; ext: string }> = {
    mp4: { name: 'output.mp4', mime: 'video/mp4', ext: 'mp4' },
    webm: { name: 'output.webm', mime: 'video/webm', ext: 'webm' },
    gif: { name: 'output.gif', mime: 'image/gif', ext: 'gif' },
};
const AUDIO_OUT: Record<string, { name: string; mime: string; ext: string }> = {
    mp3: { name: 'output.mp3', mime: 'audio/mpeg', ext: 'mp3' },
    wav: { name: 'output.wav', mime: 'audio/wav', ext: 'wav' },
};

export const VIDEO_CONFIGS: Record<string, VideoToolConfig> = {
    'video-trimmer': {
        accept: 'video/*',
        resultKind: 'video',
        submitLabel: 'Trim',
        detectDuration: true,
        output: () => VIDEO_OUT.mp4,
        numbers: [
            { key: 'start', label: 'Start (s)', defaultValue: '0' },
            { key: 'end', label: 'End (s)', fillWithDuration: true },
        ],
        buildArgs: (input, output, o) => {
            const start = Math.max(0, parseFloat(o.start) || 0);
            const end = parseFloat(o.end);
            const args = ['-ss', String(start), '-i', input];
            if (Number.isFinite(end) && end > start) args.push('-t', String(end - start));
            args.push('-c', 'copy', output);
            return args;
        },
    },

    'video-compressor': {
        accept: 'video/*',
        resultKind: 'video',
        submitLabel: 'Compress',
        output: () => VIDEO_OUT.mp4,
        ranges: [
            {
                key: 'crf',
                label: 'Quality (lower = better, larger file)',
                min: 20,
                max: 34,
                step: 1,
                defaultValue: 28,
                format: (v) => `CRF ${v}`,
            },
        ],
        buildArgs: (input, output, o) => [
            '-i', input,
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(o.crf || 28),
            '-c:a', 'aac', '-b:a', '128k',
            output,
        ],
    },

    'video-converter': {
        accept: 'video/*',
        resultKind: 'video',
        submitLabel: 'Convert',
        output: (o) => VIDEO_OUT[o.format] || VIDEO_OUT.mp4,
        selects: [
            {
                key: 'format',
                label: 'Convert to',
                defaultValue: 'mp4',
                choices: [
                    { value: 'mp4', label: 'MP4' },
                    { value: 'webm', label: 'WebM' },
                    { value: 'gif', label: 'GIF' },
                ],
            },
        ],
        buildArgs: (input, output, o) => {
            if (o.format === 'webm') return ['-i', input, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', output];
            if (o.format === 'gif') return ['-i', input, '-vf', 'fps=12,scale=480:-1:flags=lanczos', output];
            return ['-i', input, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', output];
        },
    },

    'audio-extractor': {
        accept: 'video/*,audio/*',
        resultKind: 'audio',
        submitLabel: 'Extract audio',
        output: (o) => AUDIO_OUT[o.format] || AUDIO_OUT.mp3,
        selects: [
            {
                key: 'format',
                label: 'Audio format',
                defaultValue: 'mp3',
                choices: [
                    { value: 'mp3', label: 'MP3' },
                    { value: 'wav', label: 'WAV' },
                ],
            },
        ],
        buildArgs: (input, output, o) => {
            if (o.format === 'wav') return ['-i', input, '-vn', output];
            return ['-i', input, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', output];
        },
    },
};
