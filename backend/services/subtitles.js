'use strict';

/**
 * backend/services/subtitles.js
 *
 * Build .srt and .vtt subtitle files from timestamped segments
 * ([{ start, end, text }] with times in seconds).
 */

function pad(n, len = 2) {
    return String(Math.floor(n)).padStart(len, '0');
}

// seconds → HH:MM:SS<sep>mmm  (sep = ',' for SRT, '.' for VTT)
function stamp(seconds, sep) {
    const s = Math.max(0, seconds);
    const ms = Math.round((s - Math.floor(s)) * 1000);
    const total = Math.floor(s);
    const hh = Math.floor(total / 3600);
    const mm = Math.floor((total % 3600) / 60);
    const ss = total % 60;
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}${sep}${pad(ms, 3)}`;
}

function toSRT(segments) {
    return segments
        .map((seg, i) => `${i + 1}\n${stamp(seg.start, ',')} --> ${stamp(seg.end, ',')}\n${seg.text}\n`)
        .join('\n');
}

function toVTT(segments) {
    return (
        'WEBVTT\n\n' +
        segments
            .map((seg) => `${stamp(seg.start, '.')} --> ${stamp(seg.end, '.')}\n${seg.text}\n`)
            .join('\n')
    );
}

module.exports = { toSRT, toVTT };
