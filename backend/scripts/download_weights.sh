#!/usr/bin/env bash
# Downloads the Real-ESRGAN x4plus model weights required for AI-backed
# enhancement. Without this file, the backend automatically falls back
# to the classical OpenCV enhancement pipeline — the app still works,
# just without the deep-learning upscaler.
#
# Usage: bash scripts/download_weights.sh

set -e

WEIGHTS_DIR="$(dirname "$0")/../app/weights"
WEIGHTS_FILE="$WEIGHTS_DIR/RealESRGAN_x4plus.pth"
WEIGHTS_URL="https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"

mkdir -p "$WEIGHTS_DIR"

if [ -f "$WEIGHTS_FILE" ]; then
  echo "Weights already present at $WEIGHTS_FILE"
  exit 0
fi

echo "Downloading Real-ESRGAN x4plus weights (~64MB)..."
curl -L -o "$WEIGHTS_FILE" "$WEIGHTS_URL"
echo "Done. Weights saved to $WEIGHTS_FILE"
