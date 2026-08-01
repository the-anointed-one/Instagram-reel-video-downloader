/**
 * Client-side ffmpeg.wasm loader + transcode helper.
 *
 * Uses the SINGLE-THREADED core (@ffmpeg/core, not core-mt) so it works
 * WITHOUT SharedArrayBuffer / cross-origin isolation — i.e. no COOP/COEP
 * headers, which would otherwise break the site's cross-origin images and
 * analytics. Slower than multi-threaded, but header-free and safe.
 *
 * Everything runs in the browser: no uploads, no backend, no cost.
 * The ~30MB core is fetched once (from CDN) and cached by the browser.
 */

// ffmpeg types are loaded dynamically; keep this module import-light.
type ProgressCb = (ratio: number) => void;

const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpegPromise: Promise<any> | null = null;

/** Lazy-load (once) and return a ready FFmpeg instance. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadFFmpeg(): Promise<any> {
    if (!ffmpegPromise) {
        ffmpegPromise = (async () => {
            const { FFmpeg } = await import('@ffmpeg/ffmpeg');
            const { toBlobURL } = await import('@ffmpeg/util');
            const ff = new FFmpeg();
            await ff.load({
                coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            return ff;
        })().catch((err) => {
            ffmpegPromise = null; // allow retry on failure
            throw err;
        });
    }
    return ffmpegPromise;
}

/**
 * Run one ffmpeg command against a File and return the output bytes.
 * @param file        the input File
 * @param output      output filename (e.g. "output.mp4")
 * @param buildArgs   (input, output) => full ffmpeg arg list
 * @param onProgress  0..1 progress callback
 */
export async function transcode(
    file: File,
    output: string,
    buildArgs: (input: string, output: string) => string[],
    onProgress?: ProgressCb
): Promise<Uint8Array> {
    const { fetchFile } = await import('@ffmpeg/util');
    const ff = await loadFFmpeg();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
        if (typeof e?.progress === 'number') onProgress?.(Math.min(1, Math.max(0, e.progress)));
    };
    ff.on('progress', handler);

    const extMatch = file.name.match(/\.[a-z0-9]+$/i);
    const input = `input${extMatch ? extMatch[0] : '.mp4'}`;

    try {
        await ff.writeFile(input, await fetchFile(file));
        await ff.exec(buildArgs(input, output));
        const data = await ff.readFile(output);
        // readFile returns Uint8Array for binary; guard the string case
        return typeof data === 'string' ? new TextEncoder().encode(data) : (data as Uint8Array);
    } finally {
        ff.off?.('progress', handler);
        try { await ff.deleteFile(input); } catch { /* ignore */ }
        try { await ff.deleteFile(output); } catch { /* ignore */ }
    }
}

/** Read a video/audio file's duration (seconds) via a media element. */
export function readMediaDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const el = document.createElement('video');
        el.preload = 'metadata';
        el.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(Number.isFinite(el.duration) ? el.duration : 0);
        };
        el.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(0);
        };
        el.src = url;
    });
}
