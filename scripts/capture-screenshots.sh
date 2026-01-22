#!/bin/bash

# FaceIt Screenshot Capture Script
# Usage: ./scripts/capture-screenshots.sh [screen_name]
#
# This script captures screenshots from the currently running iOS simulator
# and saves them to the appropriate folder based on device type.

set -e

SCREENSHOT_DIR="$(dirname "$0")/../screenshots"
SCREEN_NAME="${1:-screenshot}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}FaceIt Screenshot Capture${NC}"
echo "================================"

# Get the booted simulator info
BOOTED_DEVICE=$(xcrun simctl list devices booted | grep -E "^\s+" | head -1 | sed 's/^[[:space:]]*//')

if [ -z "$BOOTED_DEVICE" ]; then
    echo -e "${YELLOW}No simulator is currently running.${NC}"
    echo ""
    echo "Start a simulator first with one of these commands:"
    echo "  npx react-native run-ios --simulator=\"iPhone 17 Pro Max\""
    echo "  npx react-native run-ios --simulator=\"iPhone 17 Pro\""
    exit 1
fi

echo -e "Active simulator: ${GREEN}$BOOTED_DEVICE${NC}"

# Determine the device size category
if echo "$BOOTED_DEVICE" | grep -qE "(Pro Max|Plus|Max)"; then
    DEVICE_SIZE="6.7-inch"
elif echo "$BOOTED_DEVICE" | grep -qE "(Pro|Air|\b17\b|\b16\b)"; then
    DEVICE_SIZE="6.1-inch"
else
    DEVICE_SIZE="phone"
fi

# Create output directory
OUTPUT_DIR="$SCREENSHOT_DIR/ios/$DEVICE_SIZE"
mkdir -p "$OUTPUT_DIR"

# Generate filename
FILENAME="${SCREEN_NAME}.png"
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

# Capture screenshot
echo -e "Capturing screenshot..."
xcrun simctl io booted screenshot "$OUTPUT_PATH"

echo -e "${GREEN}Screenshot saved:${NC} $OUTPUT_PATH"
echo ""

# Show available screen names for reference
echo -e "${BLUE}Suggested screen names:${NC}"
echo "  01_landing      - Landing/home screen"
echo "  02_search       - Search results"
echo "  03_compass      - Compass view (active)"
echo "  04_aligned      - Compass view (aligned)"
echo "  05_settings     - Settings screen"
echo ""
echo "Usage: ./scripts/capture-screenshots.sh [screen_name]"
