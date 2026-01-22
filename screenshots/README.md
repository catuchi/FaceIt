# FaceIt Screenshots

This directory contains app store screenshots for iOS and Android.

## Quick Start

### 1. Start the App on Simulator

```bash
# iPhone 17 Pro Max (recommended for 6.7" screenshots)
npx react-native run-ios --simulator="iPhone 17 Pro Max"
```

### 2. Capture Screenshots

Use the capture script for each screen:

```bash
# Navigate to each screen in the app, then run:
./scripts/capture-screenshots.sh 01_landing
./scripts/capture-screenshots.sh 02_search
./scripts/capture-screenshots.sh 03_compass
./scripts/capture-screenshots.sh 04_aligned
./scripts/capture-screenshots.sh 05_settings
```

Or take manual screenshots with:

- **Simulator**: Press `Cmd + S`
- **Command line**: `xcrun simctl io booted screenshot screenshot.png`

## Required Screens

| #   | Screen            | What to Show                                  |
| --- | ----------------- | --------------------------------------------- |
| 1   | Landing           | Search bar + Popular destinations grid        |
| 2   | Search Results    | Results for "Eiffel Tower" or "Mecca"         |
| 3   | Compass (Active)  | Compass pointing to destination with distance |
| 4   | Compass (Aligned) | Green "Aligned!" indicator visible            |
| 5   | Settings          | Settings screen with preferences              |

## Required Sizes

### iOS App Store

- **6.7" (required)**: iPhone 17 Pro Max → 1290 x 2796
- **6.5" (required)**: iPhone 11 Pro Max → 1242 x 2688

### Google Play Store

- **Phone (required)**: 1080 x 1920 minimum

## Directory Structure

```
screenshots/
├── ios/
│   ├── 6.7-inch/        # iPhone 17 Pro Max
│   └── 6.5-inch/        # iPhone 11 Pro Max
├── android/
│   └── phone/
└── marketing/
    └── framed/          # Screenshots with device frames
```

## Tips

1. **Fresh state**: Clear app data before capturing
2. **Sample data**: Add some searches to history first
3. **Favorite**: Save Mecca as a favorite for the compass screen
4. **Time**: iOS status bar time doesn't matter for App Store
5. **Orientation**: Portrait only for phone screenshots
