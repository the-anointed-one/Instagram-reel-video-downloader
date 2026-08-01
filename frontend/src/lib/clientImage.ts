/**
 * Client-side image helpers — everything runs in the browser via Canvas.
 * No uploads, no backend, no cost. Used by the image tools in /tools.
 */

/** Load an <img> from an object URL and resolve once decoded. */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not load image.'));
        img.src = src;
    });
}

/** Decode a File into an HTMLImageElement (object URL is revoked after load). */
export async function fileToImage(file: File): Promise<HTMLImageElement> {
    const url = URL.createObjectURL(file);
    try {
        return await loadImage(url);
    } finally {
        URL.revokeObjectURL(url);
    }
}

/** Canvas → Blob as a promise. */
export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Image export failed.'))),
            type,
            quality
        );
    });
}

/** Draw an image (optionally resized) onto a fresh canvas and return it. */
export function drawToCanvas(img: HTMLImageElement, width?: number, height?: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width ?? img.naturalWidth));
    canvas.height = Math.max(1, Math.round(height ?? img.naturalHeight));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Human-readable byte size. */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** Strip the extension from a filename. */
export function baseName(name: string): string {
    const i = name.lastIndexOf('.');
    return i > 0 ? name.slice(0, i) : name;
}

export const IMAGE_FORMATS = {
    png: { mime: 'image/png', ext: 'png', label: 'PNG' },
    jpeg: { mime: 'image/jpeg', ext: 'jpg', label: 'JPG' },
    webp: { mime: 'image/webp', ext: 'webp', label: 'WebP' },
} as const;

export type ImageFormatKey = keyof typeof IMAGE_FORMATS;
