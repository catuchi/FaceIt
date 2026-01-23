# FaceIt - Project Memory

> Global orientation mobile app helping users face any location on Earth using real-time compass guidance.

## Current Work

**Phase 10 of 13**: App Store Preparation

**Completed in Phase 10**:

- App icons created (iOS 1024x1024, Android 512x512 adaptive)
- Privacy Policy & Terms of Service hosted on GitHub Pages
- App store metadata written (APP_STORE_METADATA.md)
- Screenshot guide created (SCREENSHOTS_GUIDE.md)
- Production build configs ready (v1.0.0)
- Bundle identifiers updated to `io.faceit.compass` (iOS & Android)

**Next tasks** (read `plan.md` for full details):

1. Capture screenshots for all required device sizes (see SCREENSHOTS_GUIDE.md)
2. Configure API key restrictions in Google Cloud Console (manual)
3. Create App Store Connect & Play Console accounts (manual)
4. Set up signing certificates and provisioning profiles
5. Archive and upload builds

**Completed**: Phases 1-9 (Foundation, Design System, Core Services, Navigation, Compass, Firebase, Testing, Performance, Security)

**Test Coverage**: 163 tests passing, 75-98% coverage on services

## Workflow

When working on tasks:

1. Read `plan.md` to find next unchecked task in current phase
2. Complete the work
3. Update checkbox in `plan.md` from `- [ ]` to `- [x]`
4. Move to next task

## Tech Stack

| Layer      | Technology                       | Version      |
| ---------- | -------------------------------- | ------------ |
| Framework  | React Native                     | 0.73+        |
| Language   | TypeScript                       | 5.x (strict) |
| Navigation | React Navigation                 | 6.x          |
| Animations | React Native Reanimated          | 2.x/3.x      |
| Sensors    | react-native-sensors             | Latest       |
| Location   | react-native-geolocation-service | Latest       |
| Storage    | AsyncStorage / MMKV              | Latest       |

## Directory Structure

```
src/
├── components/ui/       # Button, TextInput, Card, BottomSheet, Toast
├── components/compass/  # Compass, CalibrationGuide (Phase 5)
├── components/common/   # Loading, ErrorMessage
├── screens/            # Landing, SearchResults, Compass, Settings, Onboarding
├── services/           # geocoding, sensors, location, calculations, storage
├── hooks/              # useAppNavigation, useCompass
├── constants/          # theme.ts
└── types/              # TypeScript interfaces
```

## Design System (Dark Theme)

```typescript
background: { primary: '#101010', secondary: '#2c2c2c', tertiary: '#3a3a3a' }
gradient: { start: '#57ecb2', middle: '#54d9b9', end: '#50b6ff' }
accent: { primary: '#57ecb2', secondary: '#50b6ff', gold: '#FFD700' }
text: { primary: '#ffffff', secondary: '#a0a0a0', tertiary: '#6a6a6a' }
```

**Animations**: Compass 60fps with spring (damping: 15, stiffness: 100)

## Code Conventions

- 2-space indentation, TypeScript strict mode
- Components: PascalCase (`Button.tsx`)
- Services: PascalCase + "Service" suffix (`GeocodingService.ts`)
- Hooks: camelCase + "use" prefix (`useCompass.ts`)
- Path aliases: `@components`, `@services`, `@hooks`, etc.

## Key Services

- **SensorService**: `startHeadingTracking(callback)`, sensor fusion, MockSensorService for simulator
- **CalculationService**: `calculateBearing(from, to)`, `calculateDistance(from, to)`, haversine formula
- **LocationService**: `getCurrentLocation()`, permission handling
- **StorageService**: history (max 10), favorites, preferences

## Commands

```bash
npm start          # Metro bundler
npm run ios        # iOS simulator
npm run android    # Android emulator
npm test           # Jest tests
npm run type-check # TypeScript check
```

## Important Notes

- Use Reanimated 2 for compass (60fps on UI thread)
- Sensor polling: 10-30 Hz (not 60 Hz) for battery
- Stop sensors on unmount
- MockSensorService for simulator testing
- Dark theme only (no light mode in MVP)

## Development Agents

Reusable agents in `.claude/agents/`:

| Agent                       | Use For         | Example Prompt                |
| --------------------------- | --------------- | ----------------------------- |
| `pr-review.md`              | Code review     | "Review my staged changes"    |
| `test-generator.md`         | Create tests    | "Generate tests for [file]"   |
| `architecture-explainer.md` | Understand code | "Explain how [feature] works" |

For structured output, reference the agent file:

```
Read .claude/agents/pr-review.md and review the changes in my branch
```

## Reference Documents

For detailed info, read these files when needed:

- `plan.md` - Full 13-phase roadmap with 350+ tasks
- `prd.md` - Product requirements, user stories, specifications
- `APP_STORE_METADATA.md` - App store descriptions, keywords, categories
- `SCREENSHOTS_GUIDE.md` - Screenshot specs and capture instructions

---

_Phase: 10 of 13 | Status: App Store Preparation_
