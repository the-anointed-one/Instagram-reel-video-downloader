# Directive: Duplicate URL Check

## Goal
Before downloading, check if a Reel URL has already been processed. Avoid redundant scraping and yt-dlp calls.

## Inputs
- `url` (string) — normalized Instagram Reel URL

## Tools / Scripts
- `execution/check_duplicate.js` — CLI checker
- `backend/src/services/dedupService.js` — service used by the controller

## Steps
1. Normalize the URL: strip trailing slashes, strip query params
2. Query MongoDB `ReelLog` collection for an exact match on `url` field
3. If match found and `status === 'success'` → return `{ isDuplicate: true, log }`
4. If match found but `status === 'failed'` → allow retry, return `{ isDuplicate: false }`
5. If no match → return `{ isDuplicate: false }`

## Outputs
- `{ isDuplicate: boolean, log?: ReelLog }`

## Edge Cases
- URL aliases (e.g. `/p/` vs `/reel/`) — normalize to `/reel/` before querying
- MongoDB connection failure → propagate error; do not silently skip

## Learnings
_(Update this section as you discover new edge cases)_
