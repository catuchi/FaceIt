# FaceIt - App Store Screenshots Guide

This guide provides specifications and instructions for capturing screenshots required for iOS App Store and Google Play Store submission.

---

## Required Screenshots

### iOS App Store Requirements

| Device                   | Display Size                   | Resolution  | Required           |
| ------------------------ | ------------------------------ | ----------- | ------------------ |
| iPhone 6.7"              | iPhone 14 Pro Max / 15 Pro Max | 1290 x 2796 | Yes                |
| iPhone 6.5"              | iPhone 11 Pro Max / XS Max     | 1242 x 2688 | Yes                |
| iPhone 5.5"              | iPhone 8 Plus / 7 Plus         | 1242 x 2208 | Optional           |
| iPad Pro 12.9" (6th gen) | iPad Pro 12.9"                 | 2048 x 2732 | If supporting iPad |

### Google Play Store Requirements

| Device Type | Resolution        | Required              |
| ----------- | ----------------- | --------------------- |
| Phone       | 1080 x 1920 (min) | Yes                   |
| 7" Tablet   | 1200 x 1920       | If supporting tablets |
| 10" Tablet  | 1600 x 2560       | If supporting tablets |

**Feature Graphic**: 1024 x 500 px (Required for Play Store)

---

## Screenshot Scenes (5 required)

### 1. Landing Screen

**What to show**: Main search interface with popular locations visible

- Search bar prominent at top
- "POPULAR DESTINATIONS" section with emoji icons
- Recent searches section (if available)
- Dark theme aesthetic

**Caption suggestion**: "Search any location on Earth"

### 2. Search Results

**What to show**: Results for a compelling search (e.g., "Eiffel Tower" or "Mecca")

- Multiple results displayed
- Location names and coordinates visible
- Clean card-based layout

**Caption suggestion**: "Find landmarks, cities, or coordinates"

### 3. Compass View (Active)

**What to show**: Compass pointing to a destination with bearing displayed

- Compass dial with needle pointing toward target
- Target name displayed (e.g., "Mecca" or "Eiffel Tower")
- Distance shown
- Bearing degrees visible

**Caption suggestion**: "Real-time compass guidance"

### 4. Compass View (Aligned)

**What to show**: Compass in aligned state (within ±5° of target)

- Green "Aligned!" indicator visible
- Compass showing successful alignment
- Checkmark or success indication

**Caption suggestion**: "Know when you're facing the right direction"

### 5. Settings/Favorites

**What to show**: Settings screen OR a favorites list

- Clean organized interface
- Unit preferences visible
- Or saved favorite locations

**Caption suggestion**: "Save your favorite destinations"

---

## Capture Instructions

### iOS Simulator Screenshots

1. **Start the simulator with the correct device**:

   ```bash
   # iPhone 14 Pro Max (6.7")
   npx react-native run-ios --simulator="iPhone 15 Pro Max"

   # iPhone 11 Pro Max (6.5")
   npx react-native run-ios --simulator="iPhone 11 Pro Max"
   ```

2. **Take screenshot**:
   - Press `Cmd + S` in the Simulator
   - Or use `xcrun simctl io booted screenshot filename.png`

3. **Screenshot location**: Saved to Desktop by default

### Android Emulator Screenshots

1. **Start the emulator with correct device**:

   ```bash
   # List available AVDs
   emulator -list-avds

   # Start specific AVD
   emulator -avd Pixel_4_API_31
   ```

2. **Take screenshot**:
   - Click the camera icon in emulator toolbar
   - Or use `adb exec-out screencap -p > screenshot.png`

### Using Fastlane (Automated)

For iOS, add to `ios/fastlane/Fastfile`:

```ruby
lane :screenshots do
  capture_screenshots
end
```

Create `ios/fastlane/Snapfile`:

```ruby
devices([
  "iPhone 15 Pro Max",
  "iPhone 11 Pro Max"
])

languages(["en-US"])

scheme("FaceItTemp")
output_directory("./screenshots")

clear_previous_screenshots(true)
```

---

## Screenshot Preparation Checklist

Before capturing screenshots:

- [ ] Clear app data for fresh state
- [ ] Add some sample recent searches (for landing screen)
- [ ] Save at least one favorite location
- [ ] Ensure device time shows a neutral time (e.g., 9:41 AM for iOS)
- [ ] Hide simulator status bar for cleaner look (optional)
- [ ] Disable any debug overlays

### Sample Data to Prepare

**Recent Searches** (add via app):

1. Mecca, Saudi Arabia
2. Eiffel Tower, Paris
3. Statue of Liberty, New York

**Favorite Location**:

- Mecca (for Qibla use case appeal)

---

## Post-Processing

### Recommended Tools

- **Figma/Sketch**: Add device frames and captions
- **AppMockUp**: Free online tool for device frames
- **Screenshots Pro**: macOS app for adding frames

### Design Guidelines

1. **Device Frames**: Optional but professional
2. **Captions**: Short, benefit-focused (not feature-focused)
3. **Background**: Consistent gradient or solid color
4. **Text**: Readable, high contrast
5. **Consistency**: Same style across all screenshots

### Caption Examples

| Screen  | Feature-focused (avoid)        | Benefit-focused (better)        |
| ------- | ------------------------------ | ------------------------------- |
| Landing | "Search bar with autocomplete" | "Find any place on Earth"       |
| Compass | "60fps compass animation"      | "Always know which way to face" |
| Aligned | "±5° accuracy detection"       | "Perfect alignment, every time" |

---

## File Organization

Create a folder structure:

```
screenshots/
├── ios/
│   ├── 6.7-inch/
│   │   ├── 01_landing.png
│   │   ├── 02_search_results.png
│   │   ├── 03_compass.png
│   │   ├── 04_aligned.png
│   │   └── 05_settings.png
│   └── 6.5-inch/
│       └── ...
├── android/
│   └── phone/
│       └── ...
└── marketing/
    ├── feature_graphic.png (1024x500)
    └── framed/
        └── ...
```

---

## Quick Reference Commands

```bash
# iOS - Run on iPhone 15 Pro Max
npx react-native run-ios --simulator="iPhone 15 Pro Max"

# iOS - Take screenshot
xcrun simctl io booted screenshot ~/Desktop/screenshot.png

# Android - Take screenshot
adb exec-out screencap -p > screenshot.png

# List iOS simulators
xcrun simctl list devices

# List Android emulators
emulator -list-avds
```

---

## Notes

- Apple requires screenshots to be actual app screenshots (no mockups for main images)
- Google allows more flexibility with promotional graphics
- Both stores allow adding text overlays and device frames
- Consider localization if targeting multiple languages later
