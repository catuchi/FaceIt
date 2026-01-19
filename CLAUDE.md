# FaceIt - Project Memory

> Global orientation mobile app helping users face any location on Earth using real-time compass guidance.

## Project Status

**Current Phase**: Phase 5 of 13 (Compass Component Implementation)

**Completed**:

- ✅ Phases 1-4: Foundation, Design System, Core Services, Navigation & Screens
- ✅ All base UI components (Button, TextInput, Card, BottomSheet, Toast)
- ✅ All core services (Geocoding, Location, Sensors, Calculations, Storage)
- ✅ All main screens (Landing, SearchResults, Compass, Settings, Onboarding)
- ✅ **UI Redesign**: Complete Flighty-inspired dark UI overhaul (Jan 2026)
  - Redesigned all screens with new design language
  - Updated Button, Card, TextInput components
  - Pill-shaped buttons, gradient accents, card-based layouts

**In Progress**:

- 🚧 Phase 5: Compass visual component with Reanimated 2
- 🚧 useCompass custom hook for real-time orientation

**Reference Documents**:

- @plan.md - Complete 13-phase development roadmap with 350+ tasks
- @prd.md - Full Product Requirements Document with functional requirements and user stories

## Development Workflow

**IMPORTANT**: Always track progress in plan.md as you work.

**When completing tasks**:

1. ✅ **Check off completed items** - Update plan.md checkboxes from `- [ ]` to `- [x]` immediately after completing each task
2. 🔄 **Move to next task** - Automatically proceed to the next unchecked item in the current phase
3. 📊 **Update phase status** - When a phase section is fully complete, update the "Project Status" section in this CLAUDE.md file
4. 💬 **Communicate progress** - Tell the user what was completed and what's next

**Example workflow**:

```
✅ Completed: Create Button component (plan.md:191)
✅ Updated plan.md checkbox
🔄 Moving to next task: Create TextInput component (plan.md:200)
```

**When starting a session**:

- Check plan.md to see what's next in the current phase
- If unclear what to work on, ask the user
- Don't repeat tasks that are already checked off

**When encountering blockers**:

- Note the blocker in plan.md as a comment
- Skip to next unblocked task
- Report blockers to user for decision

## Tech Stack

| Layer      | Technology                                       | Version                |
| ---------- | ------------------------------------------------ | ---------------------- |
| Framework  | React Native                                     | 0.73+                  |
| Language   | TypeScript                                       | 5.x (strict mode)      |
| Navigation | React Navigation                                 | 6.x (Stack Navigator)  |
| Animations | React Native Reanimated                          | 2.x/3.x (60fps target) |
| State      | React Context + Hooks                            | Built-in               |
| Sensors    | react-native-sensors                             | Latest                 |
| Location   | react-native-geolocation-service                 | Latest                 |
| Storage    | AsyncStorage / MMKV                              | Latest                 |
| Geocoding  | Google Maps API (primary), Mapbox (fallback)     | v3 / v5                |
| Analytics  | Firebase (Analytics, Crashlytics, Remote Config) | Latest                 |

## Architecture

**Pattern**: Mobile client-heavy, local-first, no custom backend (MVP)

**Directory Structure**:

```
src/
├── components/       # Reusable components
│   ├── ui/          # Button, TextInput, Card, BottomSheet, Toast, etc.
│   ├── compass/     # Compass, CalibrationGuide (Phase 5)
│   ├── search/      # Search-related components
│   └── common/      # Loading, ErrorMessage, Header
├── screens/         # Screen components (Landing, SearchResults, Compass, Settings, Onboarding)
├── navigation/      # AppNavigator.tsx, types.ts
├── services/        # Business logic (geocoding, sensors, location, calculations, storage)
├── hooks/           # Custom hooks (useAppNavigation, useCompass)
├── contexts/        # React contexts
├── utils/           # Helper functions
├── constants/       # theme.ts, colors, spacing
├── types/           # TypeScript interfaces
└── assets/          # Images, icons, fonts
```

**Key Patterns**:

- Services are singletons with clear single responsibility
- Barrel exports (index.ts) for clean imports
- TypeScript strict mode with path aliases (@components, @services, @utils, etc.)
- All async operations use Promise-based APIs
- Error boundaries for graceful failure handling

## Design System

**Theme**: Dark-first Flighty-inspired UI (no light mode in MVP)

**Colors** (Updated Jan 2026):

```typescript
background: {
  primary: '#101010',    // Near black
  secondary: '#2c2c2c',  // Dark gray (cards)
  tertiary: '#3a3a3a'    // Medium gray (elevated)
}
gradient: {
  start: '#57ecb2',      // Teal
  middle: '#54d9b9',     // Mid teal-cyan
  end: '#50b6ff'         // Cyan/Blue
}
accent: {
  primary: '#57ecb2',    // Teal
  secondary: '#50b6ff',  // Cyan
  gold: '#FFD700'        // Favorite stars
}
text: {
  primary: '#ffffff',    // Pure white
  secondary: '#a0a0a0',  // Muted gray
  tertiary: '#6a6a6a',   // Subtle gray
  disabled: '#4a4a4a'
}
border: {
  subtle: '#2c2c2c',
  medium: '#3a3a3a',
  accent: '#57ecb2'
}
error: { main: '#EF4444' }
success: { main: '#57ecb2' }
```

**Typography**:

- iOS: SF Pro | Android: Roboto
- Scale: displayLarge (72pt), displaySmall (48pt), heading1 (28pt), heading2 (24pt), body (16pt), label (14pt), caption (12pt)

**Spacing**: xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32, 4xl: 40, 5xl: 48

**Border Radius**: sm: 8, md: 12, lg: 16, xl: 20, pill: 100, circle: 9999

**UI Patterns** (Flighty-inspired):

- Pill-shaped buttons with gradient for primary actions
- Card-based layouts with 16px border radius
- Circular header buttons (back, settings)
- Section headers: uppercase, letter-spacing, tertiary color
- Bottom sheets for pickers and modals
- Gradient accents for emphasis

**Animations**:

- Standard transitions: 250ms
- Compass rotation: 60fps with spring physics (damping: 15, stiffness: 100)
- Press animations: scale to 0.96

## Code Conventions

**Style**:

- 2-space indentation
- TypeScript strict mode enabled
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Destructure props in function parameters

**File Naming**:

- Components: PascalCase (e.g., `CompassScreen.tsx`, `Button.tsx`)
- Services: PascalCase with "Service" suffix (e.g., `GeocodingService.ts`)
- Hooks: camelCase with "use" prefix (e.g., `useAppNavigation.ts`)
- Types: PascalCase (e.g., `navigation.ts` exports `RootStackParamList`)
- Utils: camelCase (e.g., `formatDistance.ts`)

**Imports**:

- Use barrel exports (index.ts) for clean imports
- Path aliases preferred: `@components/ui/Button` not `../../../components/ui/Button`
- Group imports: React, third-party, local (separated by blank lines)

**Components**:

- Functional components only (no class components)
- Use hooks for state and lifecycle
- Props interface defined above component
- Export component as default, export types as named exports

**Error Handling**:

- Try-catch for async operations
- Display user-friendly error messages (not stack traces)
- Log errors to Crashlytics in production
- Provide fallback UI for error states

## Performance Requirements

**Critical Metrics** (from PRD):

- App launch: <2s cold start, <1s warm start
- Search response: <2s for 95% of queries
- Compass update rate: minimum 10 FPS, target 30 FPS
- Bearing accuracy: <1° error for 95% of calculations
- View transitions: <1s
- Memory footprint: <150 MB
- Battery drain: <5% per 10-minute compass session

**Optimization Strategies**:

- Use Reanimated 2 for smooth 60fps animations (runs on UI thread)
- Debounce autocomplete requests (300ms)
- Cache geocoding results (7-day TTL)
- Optimize sensor polling rate (10-30 Hz, not 60 Hz)
- Minimize state updates and re-renders
- Use useMemo and useCallback appropriately

## Common Commands

**Development**:

```bash
npm start                 # Start Metro bundler
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # Run TypeScript type checking
```

**iOS**:

```bash
cd ios && pod install && cd ..    # Install iOS dependencies
npm run clean:ios                 # Clean iOS build
```

**Android**:

```bash
npm run clean:android             # Clean Android build
cd android && ./gradlew clean     # Clean Gradle cache
```

## Git Workflow

**Branches**:

- `develop` - Main development branch (current)
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- Main branch (for production releases) - TBD

**Commit Messages**:

- Format: `type: description` (e.g., `feat: implement compass component`)
- Types: feat, fix, refactor, test, docs, style, chore
- Always include Co-Authored-By for Claude: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

**Workflow**:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/compass-visual
# ... make changes ...
git add .
git commit -m "feat: implement compass visual component with gradient border"
git push origin feature/compass-visual
# Create PR to develop on GitHub
```

## Services Documentation

### GeocodingService (`src/services/geocoding/GeocodingService.ts`)

- `searchByText(query: string)` - Search locations by text
- `searchByCoordinates(lat, lng)` - Reverse geocoding
- `getAutocompleteSuggestions(input)` - Debounced suggestions (300ms)
- Uses caching (7-day TTL) to minimize API costs
- Fallback to Mapbox if Google API fails

### LocationService (`src/services/location/LocationService.ts`)

- `getCurrentLocation()` - Get current GPS position (5s timeout)
- `watchLocation()` - Subscribe to location updates
- Handles permissions (request, check, redirect to settings)
- Caches last known location with staleness indicator

### SensorService (`src/services/sensors/SensorService.ts`)

- `startHeadingTracking(callback)` - Subscribe to compass heading
- `stopHeadingTracking(subscription)` - Unsubscribe
- Implements sensor fusion (magnetometer + accelerometer)
- Low-pass filter to reduce jitter
- Detects calibration needed and accuracy level
- **MockSensorService** available for simulator testing

### CalculationService (`src/services/calculations/CalculationService.ts`)

- `calculateDistance(from, to)` - Haversine formula (meters)
- `calculateBearing(from, to)` - Initial bearing (0-360°)
- `bearingToCardinal(bearing)` - Convert to N, NNE, NE, etc.
- `formatDistance(meters, unit)` - Format for display
- `isValidCoordinate(lat, lng)` - Validation

### StorageService (`src/services/storage/StorageService.ts`)

- `addToHistory(location)` - Add to recent searches (max 10, LIFO)
- `getHistory()` - Retrieve search history
- `clearHistory()` - Clear all history
- `addFavorite(location)` - Save favorite location
- `getFavorites()` - Retrieve favorites
- `deleteFavorite(id)` - Remove favorite
- `setPreference(key, value)` - Save user preference
- `getPreference(key)` - Retrieve preference

## Testing

**Target Coverage**:

- Services: 80%+ (CalculationService must be 100%)
- Components: 70%+
- Integration tests for critical flows

**Testing Stack**:

- Jest + React Native Testing Library
- Mock native modules (AsyncStorage, geolocation, sensors)
- Mock Firebase

**Running Tests**:

```bash
npm test                           # Run all tests
npm run test:watch                 # Watch mode
npm run test:coverage              # With coverage report
npm test -- CalculationService     # Run specific test file
```

## Known Issues & Gotchas

**Simulator Testing**:

- iOS Simulator lacks real sensors (magnetometer, gyroscope)
- MockSensorService provides simulated heading data for testing
- "Simulator Mode" indicator shown when using mock sensors

**Compass Calibration**:

- Many devices need figure-8 calibration for accuracy
- Display calibration prompt when sensor accuracy is low
- Don't hide the prompt too early - users need clear guidance

**Sensor Performance**:

- Polling rate matters for battery life (10-30 Hz, not 60 Hz)
- Always stop sensor tracking on unmount to avoid memory leaks
- Reanimated 2 is critical for 60fps - don't use Animated API

**Geocoding Costs**:

- Google Maps API has $200/month free credit (~40,000 requests)
- Aggressive caching is ESSENTIAL (7-day TTL implemented)
- Monitor usage closely, implement rate limiting if needed

**Location Permissions**:

- Always show custom explanation BEFORE OS prompt
- Request "when in use" only (not "always")
- Handle denial gracefully - allow coordinate search as fallback

**React Native Specific**:

- Always quote file paths with spaces in bash commands
- Hermes engine enabled on Android for performance
- iOS requires pod install after dependency changes

## Priority Order for Implementation

**⚠️ REMEMBER**: Check off items in @plan.md as you complete them, then move to the next unchecked task.

**Phase 5 (Current)**: Compass Visual Component

1. Create Compass component with SVG compass face
2. Implement smooth rotation with Reanimated 2
3. Create useCompass hook for sensor data
4. Add alignment detection (±5° threshold)
5. Implement success overlay and haptic feedback

**Phase 6 (Next)**: Popular Locations & Firebase

1. Set up Firebase (Analytics, Crashlytics, Remote Config)
2. Create popular locations list (20+ curated locations)
3. Implement remote config for location list updates
4. Add analytics tracking for key events

**Phase 7**: Testing

1. Unit tests for all services (80%+ coverage)
2. Component tests (70%+ coverage)
3. Integration tests for critical flows

See @plan.md for complete task breakdown and detailed subtasks.

## Important Notes

**Privacy First**:

- All location data processed locally (not sent to backend)
- Search history stored on device only (never synced)
- No user accounts in MVP (no PII collected)
- GDPR/CCPA compliant

**Battery Optimization**:

- 10-30 Hz sensor polling (not continuous 60 Hz)
- Stop sensors when app backgrounded
- Use "balanced" GPS accuracy (not high-power)

**Bearing Accuracy**:

- Target: <1° error for 95% of calculations
- Use great circle calculations (haversine)
- Apply magnetic declination compensation
- Sensor fusion critical for stability

**DO NOT**:

- Add light mode (dark theme only for MVP)
- Create custom backend (local-first architecture)
- Add social features (MVP is single-player)
- Add navigation/routing (orientation only, not directions)
- Over-engineer - keep solutions simple and focused

## Questions?

For architecture decisions, see @plan.md Section "Key Decisions Made"
For requirements, see @prd.md Functional Requirements (Section 4)
For user stories, see @prd.md Section 11

---

_Last Updated: 2026-01-18_
_Project Phase: 5 of 13_
_Status: Active Development - UI Redesign Complete_
