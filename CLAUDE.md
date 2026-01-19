# FaceIt - Project Memory

> Global orientation mobile app helping users face any location on Earth using real-time compass guidance.

## Current Work

**Phase 5 of 13**: Compass Component Implementation

**Next tasks** (read `plan.md` for full details):

1. Create Compass component with SVG compass face
2. Implement smooth rotation with Reanimated 2
3. Create useCompass hook for sensor data
4. Add alignment detection (±5° threshold)
5. Implement success overlay and haptic feedback

**Completed**: Phases 1-4 (Foundation, Design System, Core Services, Navigation & Screens), UI Redesign

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

## Reference Documents

For detailed info, read these files when needed:

- `plan.md` - Full 13-phase roadmap with 350+ tasks
- `prd.md` - Product requirements, user stories, specifications

---

_Phase: 5 of 13 | Status: Active Development_
