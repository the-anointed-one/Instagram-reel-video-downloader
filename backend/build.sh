#!/bin/bash
# Build script for Render deployment
# Installs npm dependencies + yt-dlp binary

set -e

echo "==> Installing npm dependencies..."
npm install

echo "==> Installing yt-dlp..."
mkdir -p bin
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o bin/yt-dlp
chmod +x bin/yt-dlp
echo "==> yt-dlp installed at bin/yt-dlp"
./bin/yt-dlp --version
