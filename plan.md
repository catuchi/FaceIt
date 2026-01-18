# FaceIt - Development Plan

## Overview

**Project**: FaceIt - Global Orientation Mobile App
**Description**: A React Native mobile app that helps users physically orient themselves to face any location in the world using real-time compass guidance powered by device sensors.

**Tech Stack**:
- **Framework**: React Native 0.73+ with TypeScript 5.x
- **Navigation**: React Navigation 6.x
- **State Management**: React Context API + Hooks
- **Animations**: React Native Reanimated 2.x/3.x
- **Local Storage**: AsyncStorage / MMKV
- **Sensors**: react-native-sensors or expo-sensors
- **Geolocation**: react-native-geolocation-service
- **External APIs**: Google Maps Geocoding API (primary), Mapbox (fallback)
- **Backend Services**: Firebase (Analytics, Crashlytics, Remote Config)
- **Testing**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions + Fastlane
- **Platforms**: iOS 15+ and Android 8.0 (API 26)+

---

## Phase 1: Project Setup & Foundation

### 1.1 Repository & Environment Setup
- [x] Create Git repository with comprehensive README
  - [x] Project overview and description
  - [x] Tech stack documentation
  - [x] Links to PRD and design spec
- [x] Add .gitignore for React Native (node_modules, iOS build files, Android build files)
- [ ] Set up branch protection rules (main, develop) ⚠️ Requires GitHub repo - skip for now
- [ ] Create initial React Native project structure
  ```bash
  npx react-native init FaceIt --template react-native-template-typescript
  ```
- [ ] Configure package.json with project metadata
- [ ] Set up environment variables template (.env.example)
  ```
  GOOGLE_MAPS_API_KEY=
  MAPBOX_API_KEY=
  FIREBASE_CONFIG=
  ```
- [ ] Install environment variables package (react-native-config)
- [ ] Create iOS and Android signing configurations (certificates, provisioning profiles, keystores)

### 1.2 Project Structure
- [ ] Set up directory structure:
  ```
  src/
  ├── components/        # Reusable components
  │   ├── ui/           # Base UI components (Button, Card, Input, etc.)
  │   ├── compass/      # Compass-specific components
  │   ├── search/       # Search-related components
  │   └── common/       # Common components (Header, Loading, Error)
  ├── screens/          # Screen components
  │   ├── Landing/
  │   ├── SearchResults/
  │   ├── Compass/
  │   ├── Settings/
  │   └── Onboarding/
  ├── navigation/       # Navigation configuration
  ├── services/         # Business logic
  │   ├── geocoding/    # Geocoding API integration
  │   ├── sensors/      # Sensor management
  │   ├── location/     # GPS location services
  │   ├── storage/      # Local storage operations
  │   └── calculations/ # Bearing and distance calculations
  ├── hooks/            # Custom React hooks
  ├── contexts/         # React contexts for state
  ├── utils/            # Helper functions
  ├── constants/        # Constants (colors, spacing, config)
  ├── types/            # TypeScript type definitions
  └── assets/           # Images, icons, fonts
  ```
- [ ] Configure TypeScript with strict mode (tsconfig.json)
- [ ] Set up path aliases for clean imports (@components, @services, @utils, etc.)
  ```json
  {
    "baseUrl": "./src",
    "paths": {
      "@components/*": ["components/*"],
      "@screens/*": ["screens/*"],
      "@services/*": ["services/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"],
      "@constants/*": ["constants/*"]
    }
  }
  ```

### 1.3 Development Tools
- [ ] Configure ESLint with React Native preset
- [ ] Configure Prettier for code formatting
- [ ] Set up pre-commit hooks (husky + lint-staged)
  - [ ] Run ESLint on staged files
  - [ ] Run Prettier on staged files
  - [ ] Run TypeScript type checking
- [ ] Configure VS Code settings (.vscode/settings.json)
  - [ ] Format on save
  - [ ] ESLint auto-fix
  - [ ] TypeScript validation
- [ ] Configure editor config (.editorconfig)
- [ ] Set up debugging configuration for VS Code (iOS and Android)
- [ ] Create npm scripts for common tasks:
  ```json
  {
    "scripts": {
      "start": "react-native start",
      "ios": "react-native run-ios",
      "android": "react-native run-android",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
      "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
      "type-check": "tsc --noEmit",
      "clean": "rm -rf node_modules && npm install",
      "clean:ios": "cd ios && pod install && cd ..",
      "clean:android": "cd android && ./gradlew clean && cd .."
    }
  }
  ```

### 1.4 CI/CD Pipeline
- [ ] Set up GitHub Actions workflow (.github/workflows/ci.yml)
  - [ ] Install dependencies
  - [ ] Run linting
  - [ ] Run type checking
  - [ ] Run tests
  - [ ] Build iOS (on macOS runner)
  - [ ] Build Android
- [ ] Configure automated testing on pull requests
- [ ] Set up Fastlane for iOS
  - [ ] Configure lanes for beta deployment (TestFlight)
  - [ ] Configure lanes for production release
- [ ] Set up Fastlane for Android
  - [ ] Configure lanes for beta deployment (Google Play Internal Testing)
  - [ ] Configure lanes for production release
- [ ] Configure environment secrets in GitHub Actions
  - [ ] Google Maps API key
  - [ ] Firebase configuration
  - [ ] iOS certificates and provisioning profiles
  - [ ] Android keystore
- [ ] Set up automatic build numbering

### 1.5 Documentation
- [ ] Create CONTRIBUTING.md
  - [ ] Code style guidelines
  - [ ] Git workflow (feature branches, PR process)
  - [ ] Testing requirements
- [ ] Document local development setup in README
  - [ ] Prerequisites (Node.js, React Native CLI, Xcode, Android Studio)
  - [ ] Installation steps
  - [ ] Running on iOS simulator
  - [ ] Running on Android emulator
  - [ ] Running on physical devices
- [ ] Create architecture decision records folder (docs/adr/)
- [ ] Document sensor calibration algorithms (docs/algorithms.md)
- [ ] Document bearing calculation formulas (haversine, great circle)

---

## Phase 2: Design System & UI Foundation

### 2.1 Design Tokens & Theme
- [ ] Create theme configuration (src/constants/theme.ts)
  - [ ] Color palette (dark theme):
    ```typescript
    colors: {
      background: { primary: '#0F0F0F', secondary: '#1A1A1A', tertiary: '#242424' },
      gradient: { start: '#00D9B8', middle: '#00E8C3', end: '#00FFD1' },
      accent: { primary: '#00E8C3', gold: '#FFD700' },
      text: { primary: '#FFFFFF', secondary: '#E0E0E0', tertiary: '#A8A8A8' },
      border: { subtle: '#2A2A2A', accent: '#00E8C3' },
      error: { main: '#EF4444' },
      success: { main: '#10B981' }
    }
    ```
  - [ ] Typography scale (displayLarge 72pt, heading1 28pt, body 16pt, etc.)
  - [ ] Spacing system (xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, etc.)
  - [ ] Border radius values (sm: 8, md: 12, lg: 16, xl: 20, pill: 100, circle: 9999)
  - [ ] Shadow definitions for dark theme
  - [ ] Animation durations and easing functions
- [ ] Create gradient utility functions (for LinearGradient)
- [ ] Set up system font configuration (SF Pro for iOS, Roboto for Android)

### 2.2 Base UI Components
- [ ] Create Button component (src/components/ui/Button.tsx)
  - [ ] Variants: primary, secondary, outline, ghost, text
  - [ ] Sizes: sm (40pt), md (48pt), lg (56pt)
  - [ ] Gradient support with LinearGradient
  - [ ] Loading state with ActivityIndicator
  - [ ] Disabled state
  - [ ] Left and right icon support
  - [ ] Press animation (scale 0.96)
  - [ ] Accessibility labels
  - [ ] TypeScript props interface
- [ ] Create TextInput component (src/components/ui/TextInput.tsx)
  - [ ] Dark theme styling (background #1A1A1A, border #2A2A2A)
  - [ ] Focus state (border #00E8C3 with glow)
  - [ ] Error state (border #EF4444)
  - [ ] Left icon support (search icon)
  - [ ] Placeholder styling
  - [ ] Accessibility labels
- [ ] Create Card component (src/components/ui/Card.tsx)
  - [ ] Variants: default, elevated, active (with gradient border)
  - [ ] Padding options: sm, md, lg
  - [ ] Press state animation
  - [ ] Shadow for dark theme
  - [ ] Accessibility role
- [ ] Create Modal/BottomSheet component (src/components/ui/BottomSheet.tsx)
  - [ ] Slide-up animation
  - [ ] Backdrop with opacity
  - [ ] Handle bar indicator
  - [ ] Dismiss on backdrop tap
  - [ ] Close on Escape key (Android back button)
  - [ ] Focus trap
- [ ] Create Toast/Notification component (src/components/ui/Toast.tsx)
  - [ ] Types: success, error, warning, info
  - [ ] Slide-in animation
  - [ ] Auto-dismiss after 5 seconds
  - [ ] Position: bottom-center (mobile)
  - [ ] Icon support
  - [ ] Accessibility announcements
- [ ] Create Loading component (src/components/common/Loading.tsx)
  - [ ] Full-screen loading overlay
  - [ ] Centered spinner with gradient color
  - [ ] Optional loading message
- [ ] Create ErrorMessage component (src/components/common/ErrorMessage.tsx)
  - [ ] Icon display (alert, wifi, location, compass)
  - [ ] Title and message text
  - [ ] Action button (retry, go to settings)
  - [ ] Accessibility support

### 2.3 Horizontal Scroll Thumbnails Component
- [ ] Create LocationThumbnail component (src/components/ui/LocationThumbnail.tsx)
  - [ ] Circular image container (56pt diameter)
  - [ ] Location label below
  - [ ] Press state animation
  - [ ] Active state (gradient border)
  - [ ] Placeholder for missing images
- [ ] Create HorizontalScrollList component (src/components/ui/HorizontalScrollList.tsx)
  - [ ] Horizontal ScrollView with no scroll indicator
  - [ ] Item spacing (12pt)
  - [ ] Screen padding (20pt horizontal)
  - [ ] Snap to item (optional)
  - [ ] Accessibility (scrollable region)

---

## Phase 3: Core Services & Business Logic

### 3.1 Geocoding Service
**Reference**: FR-1.1, FR-1.2, FR-1.3, FR-1.4 | US-1.1, US-1.2, US-1.3, US-1.4

- [ ] Create geocoding service (src/services/geocoding/GeocodingService.ts)
  - [ ] Initialize with Google Maps API key
  - [ ] Implement text search endpoint
    ```typescript
    searchByText(query: string): Promise<GeocodingResult[]>
    ```
  - [ ] Implement coordinate parsing and validation
    ```typescript
    searchByCoordinates(lat: number, lng: number): Promise<GeocodingResult>
    ```
  - [ ] Implement autocomplete/suggestions endpoint
    ```typescript
    getAutocompleteSuggestions(input: string): Promise<Suggestion[]>
    ```
  - [ ] Debounce autocomplete requests (300ms)
  - [ ] Request timeout handling (5 seconds)
  - [ ] Rate limiting (prevent excessive API calls)
  - [ ] Error handling (network errors, API errors, no results)
  - [ ] Response parsing and normalization
  - [ ] Mapbox fallback implementation
- [ ] Create geocoding cache service (src/services/geocoding/GeocodingCache.ts)
  - [ ] Cache geocoding results in AsyncStorage
  - [ ] 7-day TTL for cached results
  - [ ] Cache key generation (hash of query)
  - [ ] Cache retrieval with expiration check
  - [ ] Cache size management (limit to 100 entries, LRU eviction)
- [ ] Create TypeScript types for geocoding (src/types/geocoding.ts)
  ```typescript
  interface GeocodingResult {
    name: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
    region?: string;
    country?: string;
  }
  ```

### 3.2 Location Service
**Reference**: FR-3.1, FR-3.2, FR-3.3 | US-4.1, US-4.2, US-2.5

- [ ] Create location service (src/services/location/LocationService.ts)
  - [ ] Initialize react-native-geolocation-service
  - [ ] Implement getCurrentLocation() with timeout (5s)
    ```typescript
    getCurrentLocation(): Promise<Coordinates>
    ```
  - [ ] Implement watchLocation() for periodic updates
  - [ ] Handle location permission requests
    - [ ] Check permission status
    - [ ] Request permission with custom rationale
    - [ ] Handle permission denial (redirect to settings)
  - [ ] Implement location caching
    - [ ] Store last known location with timestamp
    - [ ] Retrieve cached location when current unavailable
    - [ ] Display staleness indicator ("Last location from 5 min ago")
  - [ ] Error handling (GPS disabled, permission denied, timeout)
  - [ ] Platform-specific permission handling (iOS vs Android)
- [ ] Create location permission modal component (src/components/common/LocationPermissionModal.tsx)
  - [ ] Custom explanation before OS prompt
  - [ ] "Why we need location" text
  - [ ] Continue button (triggers OS prompt)
  - [ ] Dismiss option (allows coordinate search)
- [ ] Create TypeScript types (src/types/location.ts)
  ```typescript
  interface Coordinates {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  }
  ```

### 3.3 Sensor Service (Compass, Accelerometer, Gyroscope)
**Reference**: FR-2.2, FR-2.5 | US-2.1, US-2.2

- [ ] Create sensor service (src/services/sensors/SensorService.ts)
  - [ ] Initialize sensor subscriptions (magnetometer, accelerometer, gyroscope)
  - [ ] Implement sensor fusion algorithm
    - [ ] Combine magnetometer + accelerometer for stable heading
    - [ ] Apply low-pass filter to reduce jitter
    - [ ] Compensate for device tilt using accelerometer
  - [ ] Implement heading tracking
    ```typescript
    startHeadingTracking(callback: (heading: number) => void): Subscription
    stopHeadingTracking(subscription: Subscription): void
    ```
  - [ ] Sensor polling rate: 10-30 Hz (configurable)
  - [ ] Detect sensor accuracy level (low/medium/high)
  - [ ] Calibration state detection
  - [ ] Error handling (sensors unavailable, permission denied)
  - [ ] Platform-specific sensor APIs
- [ ] Create sensor calibration guide component (src/components/compass/CalibrationGuide.tsx)
  - [ ] Figure-8 motion animation
  - [ ] Instruction text
  - [ ] Auto-dismiss when calibrated
  - [ ] Manual dismiss option
- [ ] Create TypeScript types (src/types/sensors.ts)
  ```typescript
  interface SensorData {
    heading: number; // 0-360 degrees
    accuracy: 'low' | 'medium' | 'high';
    needsCalibration: boolean;
  }
  ```

### 3.4 Calculation Service (Bearing & Distance)
**Reference**: FR-2.1, FR-2.4 | US-2.1, US-2.3

- [ ] Create calculation service (src/services/calculations/CalculationService.ts)
  - [ ] Implement haversine formula for great circle distance
    ```typescript
    calculateDistance(from: Coordinates, to: Coordinates): number // in meters
    ```
  - [ ] Implement bearing calculation (initial bearing on great circle route)
    ```typescript
    calculateBearing(from: Coordinates, to: Coordinates): number // 0-360 degrees
    ```
  - [ ] Implement magnetic declination compensation
    - [ ] Fetch magnetic declination for current location
    - [ ] Apply declination to convert true north to magnetic north
  - [ ] Implement cardinal direction conversion
    ```typescript
    bearingToCardinal(bearing: number): string // 'N', 'NNE', 'NE', etc.
    ```
  - [ ] Distance formatting utility
    ```typescript
    formatDistance(meters: number, unit: 'km' | 'mi'): string
    ```
  - [ ] Coordinate validation
    ```typescript
    isValidCoordinate(lat: number, lng: number): boolean
    ```
- [ ] Unit tests for calculation functions (100% coverage required)
  - [ ] Test bearing calculation with known coordinates
  - [ ] Test distance calculation with known coordinates
  - [ ] Test edge cases (poles, equator, date line)
  - [ ] Test coordinate validation

### 3.5 Storage Service (History & Favorites)
**Reference**: FR-4.1, FR-4.3 | US-3.1, US-3.2, US-3.3, US-3.4, US-3.5

- [ ] Create storage service (src/services/storage/StorageService.ts)
  - [ ] Initialize AsyncStorage or MMKV
  - [ ] Implement search history management
    ```typescript
    addToHistory(location: Location): Promise<void>
    getHistory(): Promise<Location[]>
    clearHistory(): Promise<void>
    ```
    - [ ] Store last 10 searches
    - [ ] Newest first (LIFO)
    - [ ] Prevent duplicates
  - [ ] Implement favorites management
    ```typescript
    addFavorite(location: Location, customLabel?: string): Promise<void>
    getFavorites(): Promise<FavoriteLocation[]>
    deleteFavorite(id: string): Promise<void>
    updateFavorite(id: string, customLabel: string): Promise<void>
    ```
    - [ ] Unlimited favorites (MVP)
    - [ ] Custom labels support
    - [ ] Unique IDs for each favorite
  - [ ] Implement preferences storage
    ```typescript
    setPreference(key: string, value: any): Promise<void>
    getPreference(key: string): Promise<any>
    ```
    - [ ] Distance unit (km/mi)
    - [ ] Theme preference (future)
    - [ ] Haptic feedback enabled/disabled
  - [ ] Error handling (storage quota, read/write failures)
- [ ] Create TypeScript types (src/types/storage.ts)
  ```typescript
  interface Location {
    id: string;
    name: string;
    coordinates: Coordinates;
    address?: string;
    timestamp: number;
  }
  interface FavoriteLocation extends Location {
    customLabel?: string;
    savedDate: number;
  }
  ```

---

## Phase 4: Navigation & Screen Structure

### 4.1 Navigation Setup
- [ ] Install and configure React Navigation 6.x
  - [ ] Install dependencies (@react-navigation/native, @react-navigation/stack)
  - [ ] Install peer dependencies (react-native-screens, react-native-safe-area-context, react-native-gesture-handler)
- [ ] Create navigation configuration (src/navigation/AppNavigator.tsx)
  - [ ] Stack Navigator for main screens
  - [ ] Screen transition animations (slide from right, fade)
  - [ ] Header configuration (dark theme)
- [ ] Define screen routes
  ```typescript
  type RootStackParamList = {
    Landing: undefined;
    SearchResults: { query: string };
    Compass: { location: Location };
    Settings: undefined;
    Onboarding: undefined;
  };
  ```
- [ ] Create navigation hook (src/hooks/useAppNavigation.ts)
  - [ ] Typed navigation prop
  - [ ] Helper functions for common navigation actions

### 4.2 Screen: Landing Page
**Reference**: FR-5.1 | US-1.1, US-3.1

**File**: src/screens/Landing/LandingScreen.tsx

- [ ] Create LandingScreen component
  - [ ] App title ("FaceIt") with gradient text effect
  - [ ] Search input field (prominent, auto-focus optional)
  - [ ] Recent history section (if exists)
    - [ ] Section header "RECENT SEARCHES"
    - [ ] List of last 5-10 searches
    - [ ] Each item: location name, region, distance, timestamp
    - [ ] Tap to navigate to compass
  - [ ] Popular locations section
    - [ ] Section header "POPULAR LOCATIONS" or "EXPLORE"
    - [ ] Horizontal scroll of location thumbnails
    - [ ] Each thumbnail: circular image, location label
    - [ ] Tap to navigate to compass
  - [ ] Settings button (top-right corner)
  - [ ] Dark background with subtle gradient
  - [ ] Safe area handling (notch, status bar)
  - [ ] Keyboard handling (dismiss on scroll, return key)
- [ ] Implement search functionality
  - [ ] Text input with debounced onChange (300ms)
  - [ ] Trigger autocomplete suggestions
  - [ ] Navigate to SearchResults on submit
  - [ ] Parse coordinate input (detect "lat, lng" format)
  - [ ] Show loading indicator during search
  - [ ] Error handling (network error, no results)
- [ ] Load recent history on mount
  - [ ] Fetch from StorageService
  - [ ] Display in list
  - [ ] Show empty state if no history
- [ ] Load popular locations
  - [ ] Hardcode initial list or fetch from Firebase Remote Config
  - [ ] Display in horizontal scroll
- [ ] Performance optimization
  - [ ] Memoize components
  - [ ] Optimize re-renders (React.memo)
  - [ ] Lazy load images

### 4.3 Screen: Search Results
**Reference**: FR-1.3 | US-1.1, US-1.2, US-1.3

**File**: src/screens/SearchResults/SearchResultsScreen.tsx

- [ ] Create SearchResultsScreen component
  - [ ] Header with back button and title "Search Results"
  - [ ] Result summary ("3 results for 'Tokyo'")
  - [ ] List of geocoding results
    - [ ] Each result card: location name, coordinates, region/country, distance
    - [ ] Tap to select result
    - [ ] Press animation (scale 0.98)
  - [ ] Empty state (no results found)
    - [ ] Icon (search with X)
    - [ ] Message: "No results found"
    - [ ] Suggestion: "Try a different search term or check your spelling"
    - [ ] "Search Again" button
  - [ ] Loading state (skeleton cards)
  - [ ] Error state (network error, API error)
- [ ] Implement result selection
  - [ ] Navigate to Compass screen with selected location
  - [ ] Save to search history
  - [ ] Show confirmation (optional)
- [ ] Fetch results on mount
  - [ ] Call GeocodingService.searchByText()
  - [ ] Handle errors gracefully
  - [ ] Show loading indicator

### 4.4 Screen: Compass View
**Reference**: FR-2.3, FR-5.2 | US-2.1, US-2.2, US-2.3, US-2.4, US-5.2

**File**: src/screens/Compass/CompassScreen.tsx

- [ ] Create CompassScreen component
  - [ ] Header overlay (gradient background)
    - [ ] Back button (top-left)
    - [ ] Favorite/star button (top-right, toggle state)
  - [ ] Compass component (center)
    - [ ] SVG compass face with cardinal markers (N, E, S, W)
    - [ ] Gradient border (animated)
    - [ ] Animated needle pointing to target
    - [ ] Center bearing display (large number + degree symbol)
    - [ ] Direction label (NNW, etc.)
  - [ ] Location info panel (below compass)
    - [ ] Target location name (displaySmall typography)
    - [ ] Distance to target (compassDistance typography)
    - [ ] Centered alignment
  - [ ] Instruction text ("Rotate to align" or "Hold steady")
  - [ ] Alignment success overlay (when within ±5°)
    - [ ] Gradient pill background (success green)
    - [ ] Message: "Aligned! You're facing [Location]"
    - [ ] Checkmark icon
    - [ ] Slide-up animation
    - [ ] Haptic feedback
  - [ ] Calibration prompt (when accuracy low)
    - [ ] Warning banner at top
    - [ ] Figure-8 animation
    - [ ] Message: "Compass needs calibration. Move your phone in a figure-8"
    - [ ] Dismiss button
- [ ] Implement real-time compass updates
  - [ ] Start sensor tracking on mount
  - [ ] Calculate bearing to target location
  - [ ] Update compass rotation via Reanimated 2 (60fps)
  - [ ] Detect alignment (±5° threshold)
  - [ ] Show success overlay when aligned
  - [ ] Trigger haptic feedback on alignment
  - [ ] Stop sensor tracking on unmount
- [ ] Implement favorite toggle
  - [ ] Star button in header
  - [ ] Save to favorites (StorageService)
  - [ ] Unfavorite if already saved
  - [ ] Visual feedback (gold star when favorited)
- [ ] Handle loading states
  - [ ] GPS acquisition ("Getting your location...")
  - [ ] Center spinner with message
- [ ] Handle error states
  - [ ] GPS unavailable (show error message + fallback options)
  - [ ] Sensor unavailable (show static compass with numeric bearing)
  - [ ] Location permission denied (prompt to enable)
- [ ] Performance optimization
  - [ ] Use Reanimated 2 for smooth 60fps rotation
  - [ ] Optimize sensor polling rate (10-30 Hz)
  - [ ] Minimize re-renders

### 4.5 Screen: Settings
**Reference**: FR-5.4 | US-3.2, US-4.3, US-5.4, US-6.1, US-6.2, US-6.3

**File**: src/screens/Settings/SettingsScreen.tsx

- [ ] Create SettingsScreen component
  - [ ] Header with back button and title "Settings"
  - [ ] Section: PREFERENCES
    - [ ] Distance Units row (tap to open picker: Kilometers, Miles)
    - [ ] Theme row (future: Dark, Light, System)
    - [ ] Haptic Feedback toggle (switch)
  - [ ] Section: DATA
    - [ ] Clear Search History row (tap to confirm + clear)
  - [ ] Section: ABOUT
    - [ ] Privacy Policy row (opens in-app or browser)
    - [ ] Terms of Service row (opens in-app or browser)
    - [ ] Help & Support row (opens FAQ or contact form)
    - [ ] Version row (displays app version, non-tappable)
  - [ ] Grouped card style (adjacent rows with dividers)
  - [ ] Confirmation dialogs for destructive actions
- [ ] Implement preference changes
  - [ ] Distance unit picker (bottom sheet)
  - [ ] Save to StorageService
  - [ ] Apply immediately (update state)
- [ ] Implement clear history
  - [ ] Confirmation dialog ("Are you sure?")
  - [ ] Call StorageService.clearHistory()
  - [ ] Show success toast
- [ ] External link handling
  - [ ] Open Privacy Policy URL
  - [ ] Open Terms of Service URL

### 4.6 Screen: Onboarding
**Reference**: FR-5.3 | US-5.1

**File**: src/screens/Onboarding/OnboardingScreen.tsx

- [ ] Create OnboardingScreen component
  - [ ] 3-screen swipeable carousel
  - [ ] Skip button (top-right, all screens)
  - [ ] Page indicators (dots at bottom)
  - [ ] Next/Get Started button (bottom)
  - [ ] Screen 1: Welcome
    - [ ] Large gradient icon/illustration (160x160pt)
    - [ ] Title: "Welcome to FaceIt"
    - [ ] Body: "Find any location in the world and orient yourself to face it using your device compass."
  - [ ] Screen 2: Search
    - [ ] Illustration: Search magnifying glass
    - [ ] Title: "Search Anywhere"
    - [ ] Body: "Search for landmarks, cities, addresses, or enter coordinates."
  - [ ] Screen 3: Orient
    - [ ] Illustration: Compass icon
    - [ ] Title: "Face Your Destination"
    - [ ] Body: "Rotate your phone and align with the compass to face any location on Earth."
  - [ ] Gradient button on last screen: "Get Started"
- [ ] Implement onboarding flow
  - [ ] Show only on first app launch (check AsyncStorage flag)
  - [ ] Swipe gestures to navigate screens
  - [ ] Skip button navigates to Landing
  - [ ] "Get Started" navigates to Landing and sets flag
  - [ ] Never show again after completion
- [ ] Make onboarding re-accessible from Settings (future)

---

## Phase 5: Compass Component Implementation

### 5.1 Compass Visual Component
**Reference**: FR-2.3, FR-2.2 | US-2.1, US-5.2

**File**: src/components/compass/Compass.tsx

- [ ] Create Compass component
  - [ ] Props interface:
    ```typescript
    interface CompassProps {
      bearing: number;           // Target bearing (0-360°)
      deviceHeading: number;     // Current device heading (0-360°)
      isAligned: boolean;        // Within ±5° of target
      accuracy?: 'low' | 'medium' | 'high';
    }
    ```
  - [ ] Gradient border container (LinearGradient)
    - [ ] Colors: isAligned ? success gradient : primary gradient
    - [ ] Border width: 3pt
    - [ ] Border radius: 142pt (circular)
    - [ ] Shadow + glow effect
  - [ ] Compass inner container
    - [ ] Size: 280pt × 280pt
    - [ ] Background: background.secondary
    - [ ] Centered
  - [ ] SVG compass face
    - [ ] Cardinal markers (N, E, S, W) positioned on perimeter
      - [ ] N marker: accent.primary color, larger font
      - [ ] E, S, W: text.tertiary color
    - [ ] Degree tick marks (every 30°)
      - [ ] Major ticks: 6pt length
      - [ ] Minor ticks: 3pt length
      - [ ] Color: border.medium
  - [ ] Animated needle (Reanimated 2)
    - [ ] Width: 4pt, Length: 100pt
    - [ ] Gradient color (primary gradient)
    - [ ] Arrowhead tip
    - [ ] Rotation: bearing - deviceHeading (smooth spring animation)
    - [ ] useSharedValue + useAnimatedStyle
  - [ ] Center bearing display
    - [ ] Large bearing number (64pt, ultra-light weight)
    - [ ] Degree symbol (superscript)
    - [ ] Cardinal direction label below (14pt, uppercase, semibold)
    - [ ] Text color: white
- [ ] Implement smooth rotation animation
  - [ ] useEffect to update rotation.value when bearing or heading changes
  - [ ] withSpring animation (damping: 15, stiffness: 100)
  - [ ] 60fps performance target
- [ ] Accessibility
  - [ ] accessible={true}
  - [ ] accessibilityLabel: "Bearing ${bearing} degrees. ${isAligned ? 'Aligned with target' : 'Rotate to align'}"
  - [ ] accessibilityRole="image"

### 5.2 Compass Controller Hook
**File**: src/hooks/useCompass.ts

- [ ] Create useCompass custom hook
  ```typescript
  function useCompass(targetLocation: Coordinates) {
    const [bearing, setBearing] = useState<number>(0);
    const [deviceHeading, setDeviceHeading] = useState<number>(0);
    const [isAligned, setIsAligned] = useState<boolean>(false);
    const [accuracy, setAccuracy] = useState<'low' | 'medium' | 'high'>('medium');
    const [needsCalibration, setNeedsCalibration] = useState<boolean>(false);

    // ... implementation

    return { bearing, deviceHeading, isAligned, accuracy, needsCalibration };
  }
  ```
- [ ] Implement compass logic
  - [ ] Get current location (LocationService)
  - [ ] Calculate bearing to target (CalculationService)
  - [ ] Start sensor tracking (SensorService)
  - [ ] Update device heading state on sensor updates
  - [ ] Detect alignment (|bearing - heading| < 5°)
  - [ ] Monitor sensor accuracy
  - [ ] Detect calibration needed
  - [ ] Cleanup sensor subscription on unmount
- [ ] Trigger haptic feedback on alignment
  - [ ] Use Haptics.notificationAsync(NotificationFeedbackType.Success)
  - [ ] Only trigger once when entering aligned state (not continuously)

---

## Phase 6: Popular Locations & Remote Config

### 6.1 Firebase Setup
- [ ] Create Firebase project
  - [ ] Register iOS app (bundle ID)
  - [ ] Register Android app (package name)
  - [ ] Download GoogleService-Info.plist (iOS)
  - [ ] Download google-services.json (Android)
- [ ] Install Firebase SDK dependencies
  - [ ] @react-native-firebase/app
  - [ ] @react-native-firebase/analytics
  - [ ] @react-native-firebase/crashlytics
  - [ ] @react-native-firebase/remote-config
- [ ] Configure Firebase in iOS project
  - [ ] Add GoogleService-Info.plist to Xcode project
  - [ ] Add Firebase initialization in AppDelegate
  - [ ] Pod install
- [ ] Configure Firebase in Android project
  - [ ] Add google-services.json to android/app/
  - [ ] Add google-services plugin to build.gradle
- [ ] Initialize Firebase on app start

### 6.2 Firebase Analytics Integration
- [ ] Set up event tracking
  - [ ] Track screen views (Landing, Compass, Settings)
  - [ ] Track search events (search_query, search_success, search_failure)
  - [ ] Track compass events (compass_view, alignment_success)
  - [ ] Track user actions (favorite_added, favorite_removed, history_cleared)
  - [ ] Track errors (gps_unavailable, sensor_unavailable, network_error)
- [ ] Set user properties
  - [ ] Distance unit preference
  - [ ] First launch date
  - [ ] Total searches count
- [ ] Create analytics utility (src/utils/analytics.ts)
  ```typescript
  export const analytics = {
    logEvent: (eventName: string, params?: object) => { },
    setUserProperty: (name: string, value: string) => { },
  };
  ```

### 6.3 Firebase Crashlytics Integration
- [ ] Enable Crashlytics in Firebase console
- [ ] Initialize Crashlytics on app start
- [ ] Test crash reporting (test crash button in settings)
- [ ] Set up custom logging
  - [ ] Log key user actions
  - [ ] Log navigation events
  - [ ] Log API call failures
- [ ] Add user identifier (anonymous ID)
- [ ] Implement crash-free session tracking

### 6.4 Firebase Remote Config (Popular Locations)
**Reference**: FR-4.2 | US-1.5

- [ ] Set up Remote Config in Firebase console
- [ ] Create config parameter: "popular_locations"
  ```json
  {
    "popular_locations": [
      {
        "id": "mecca",
        "name": "Mecca",
        "coordinates": { "latitude": 21.4225, "longitude": 39.8262 },
        "image": "https://...",
        "category": "religious"
      },
      {
        "id": "eiffel_tower",
        "name": "Eiffel Tower",
        "coordinates": { "latitude": 48.8584, "longitude": 2.2945 },
        "image": "https://...",
        "category": "landmark"
      }
      // ... more locations
    ]
  }
  ```
- [ ] Fetch Remote Config on app start
  - [ ] Set fetch interval (1 hour)
  - [ ] Activate fetched values
  - [ ] Parse popular_locations JSON
- [ ] Fallback to hardcoded list if fetch fails
- [ ] Create service to manage popular locations (src/services/PopularLocationsService.ts)
  - [ ] Fetch from Remote Config
  - [ ] Fallback to local list
  - [ ] Cache in memory
- [ ] Update LandingScreen to use popular locations from service

### 6.5 Curated Popular Locations
- [ ] Compile initial list of 20+ popular locations
  - [ ] Religious sites: Mecca, Vatican City, Jerusalem (Western Wall), Bodh Gaya, Golden Temple
  - [ ] World wonders: Great Wall of China, Taj Mahal, Machu Picchu, Petra, Chichen Itza
  - [ ] Famous landmarks: Eiffel Tower, Statue of Liberty, Big Ben, Colosseum, Christ the Redeemer
  - [ ] Natural landmarks: Mount Everest, Grand Canyon, Great Barrier Reef, Victoria Falls
  - [ ] Cities: Tokyo, New York, London, Paris, Sydney
- [ ] Source or create thumbnail images (56x56pt, circular)
  - [ ] License-free images or custom illustrations
  - [ ] Optimize for mobile (WebP or compressed PNG)
- [ ] Upload images to CDN or Firebase Storage
- [ ] Add image URLs to Remote Config

---

## Phase 7: Testing

### 7.1 Unit Tests Setup
- [ ] Configure Jest for React Native
  - [ ] jest.config.js with RN preset
  - [ ] Mock native modules (AsyncStorage, geolocation, sensors)
  - [ ] Mock Firebase
- [ ] Set up test utilities (src/__tests__/utils/)
  - [ ] Mock data factories (locations, coordinates)
  - [ ] Test helpers (render with providers)
- [ ] Configure code coverage
  - [ ] Coverage thresholds (80% branches, 80% functions, 80% lines)
  - [ ] Exclude files from coverage (index.ts, types, constants)

### 7.2 Service Layer Unit Tests
- [ ] Test CalculationService (src/services/calculations/__tests__/CalculationService.test.ts)
  - [ ] Bearing calculation accuracy (known coordinates)
  - [ ] Distance calculation accuracy (known coordinates)
  - [ ] Edge cases (poles, equator, date line, antipodes)
  - [ ] Coordinate validation
  - [ ] Cardinal direction conversion
  - [ ] Distance formatting (km, miles)
  - [ ] **Target**: 100% coverage
- [ ] Test GeocodingService (src/services/geocoding/__tests__/GeocodingService.test.ts)
  - [ ] Mock Axios requests
  - [ ] Test text search
  - [ ] Test coordinate search
  - [ ] Test autocomplete
  - [ ] Test debouncing
  - [ ] Test error handling (network error, API error)
  - [ ] Test cache integration
- [ ] Test StorageService (src/services/storage/__tests__/StorageService.test.ts)
  - [ ] Mock AsyncStorage
  - [ ] Test addToHistory (LIFO, max 10)
  - [ ] Test getHistory
  - [ ] Test clearHistory
  - [ ] Test addFavorite
  - [ ] Test deleteFavorite
  - [ ] Test updateFavorite (custom label)
  - [ ] Test preferences get/set
- [ ] Test LocationService (src/services/location/__tests__/LocationService.test.ts)
  - [ ] Mock geolocation API
  - [ ] Test getCurrentLocation
  - [ ] Test location caching
  - [ ] Test permission handling
  - [ ] Test error scenarios
- [ ] Test SensorService (src/services/sensors/__tests__/SensorService.test.ts)
  - [ ] Mock sensor APIs
  - [ ] Test heading tracking
  - [ ] Test sensor fusion algorithm
  - [ ] Test calibration detection
  - [ ] Test accuracy level detection

### 7.3 Component Unit Tests
- [ ] Test Button component (src/components/ui/__tests__/Button.test.tsx)
  - [ ] Renders with correct text
  - [ ] Handles press events
  - [ ] Shows loading state
  - [ ] Disables when disabled prop
  - [ ] Renders variants correctly
- [ ] Test TextInput component
  - [ ] Renders with placeholder
  - [ ] Handles text change
  - [ ] Shows error state
  - [ ] Shows focus state
- [ ] Test Card component
  - [ ] Renders children
  - [ ] Handles press events
  - [ ] Renders variants correctly
- [ ] Test Compass component
  - [ ] Renders with correct bearing
  - [ ] Updates rotation on heading change
  - [ ] Shows aligned state
  - [ ] Displays cardinal direction
- [ ] **Target**: >70% component coverage

### 7.4 Integration Tests
- [ ] Test search flow (src/__tests__/integration/search.test.tsx)
  - [ ] User types search query
  - [ ] Autocomplete suggestions appear
  - [ ] User selects result
  - [ ] Navigates to compass view
  - [ ] Location added to history
- [ ] Test compass flow
  - [ ] User selects location
  - [ ] GPS acquires location
  - [ ] Compass displays
  - [ ] Alignment detection works
  - [ ] Success overlay appears
- [ ] Test favorites flow
  - [ ] User favorites a location
  - [ ] Star icon updates
  - [ ] Favorite appears in list
  - [ ] User removes favorite
- [ ] Test settings flow
  - [ ] User changes distance unit
  - [ ] Unit persists across sessions
  - [ ] User clears history
  - [ ] History list empties

### 7.5 End-to-End Tests (Optional)
- [ ] Set up Detox for E2E testing
  - [ ] Configure Detox for iOS and Android
  - [ ] Create test utilities
- [ ] Critical path E2E tests
  - [ ] First-time user onboarding flow
  - [ ] Search and orient to Eiffel Tower
  - [ ] Save location to favorites
  - [ ] Clear search history
  - [ ] Change distance units
- [ ] Run E2E tests on CI (iOS and Android)

---

## Phase 8: Performance & Optimization

### 8.1 Performance Optimization
- [ ] Optimize compass rendering
  - [ ] Use Reanimated 2 for 60fps (runs on UI thread)
  - [ ] Minimize state updates
  - [ ] Use useCallback for event handlers
  - [ ] Use useMemo for expensive calculations
- [ ] Optimize sensor polling
  - [ ] Configure sensor update rate (10-30 Hz, not 60 Hz)
  - [ ] Implement sensor sleep when app backgrounded
  - [ ] Stop sensor tracking when compass not visible
- [ ] Optimize geocoding API calls
  - [ ] Debounce autocomplete (300ms)
  - [ ] Cache results (7-day TTL)
  - [ ] Rate limit requests
- [ ] Code splitting and lazy loading
  - [ ] Lazy load onboarding screens (not needed until first launch)
  - [ ] Lazy load settings screen
- [ ] Image optimization
  - [ ] Use WebP for thumbnails
  - [ ] Compress images
  - [ ] Implement image caching
- [ ] Bundle size optimization
  - [ ] Enable Hermes on Android (faster startup)
  - [ ] Enable ProGuard/R8 for Android (code shrinking)
  - [ ] Strip unused code
  - [ ] Analyze bundle size (react-native-bundle-visualizer)

### 8.2 Battery Optimization
- [ ] Monitor battery usage during testing
  - [ ] 10-minute compass session should use <5% battery
- [ ] Optimize GPS usage
  - [ ] Use "balanced" accuracy (not high-power)
  - [ ] Stop GPS updates when not needed
  - [ ] Cache location for short periods
- [ ] Optimize sensor usage
  - [ ] Reduce polling rate where possible (10 Hz minimum, not 60 Hz)
  - [ ] Stop sensors when app backgrounded
- [ ] Implement low-power mode (optional)
  - [ ] Setting to reduce sensor polling rate
  - [ ] Warning when battery <20%

### 8.3 Memory Optimization
- [ ] Monitor memory usage (< 150 MB target)
- [ ] Cleanup subscriptions and listeners
  - [ ] Unsubscribe from sensors on unmount
  - [ ] Remove event listeners
  - [ ] Clear timers and intervals
- [ ] Optimize image loading
  - [ ] Use FastImage for caching
  - [ ] Release cached images when not visible
- [ ] Prevent memory leaks
  - [ ] Check for retain cycles
  - [ ] Use weak references where appropriate

---

## Phase 9: Security & Privacy

### 9.1 API Key Security
- [ ] Obfuscate API keys in compiled app
  - [ ] Use react-native-config for environment variables
  - [ ] Don't commit keys to Git (.env in .gitignore)
- [ ] Restrict API keys by bundle ID / package name
  - [ ] Google Maps API: Restrict to iOS bundle ID
  - [ ] Google Maps API: Restrict to Android package name + SHA-1
- [ ] Implement API key rotation strategy
  - [ ] Document how to rotate keys without app update (use Remote Config if possible)
- [ ] Monitor API usage for abuse
  - [ ] Set up alerts in Google Cloud Console
  - [ ] Implement client-side rate limiting

### 9.2 Data Privacy
- [ ] Implement privacy policy
  - [ ] What data is collected (location, search history)
  - [ ] How data is used (bearing calculation, search results)
  - [ ] Where data is stored (locally on device)
  - [ ] Third-party services (Google Maps API, Firebase)
  - [ ] User rights (clear history, uninstall)
- [ ] Implement terms of service
  - [ ] Acceptable use policy
  - [ ] Disclaimer (accuracy not guaranteed, not for critical navigation)
  - [ ] Intellectual property
- [ ] Host privacy policy and ToS
  - [ ] Create simple HTML pages
  - [ ] Host on GitHub Pages or Vercel
  - [ ] Link from app and app store listings
- [ ] GDPR compliance
  - [ ] Data minimization (collect only what's needed)
  - [ ] Local-first processing
  - [ ] Right to deletion (clear history, uninstall)
  - [ ] Transparent privacy policy
- [ ] CCPA compliance
  - [ ] Disclose data collection
  - [ ] No sale of personal data

### 9.3 Security Hardening
- [ ] Implement SSL pinning (optional, advanced)
  - [ ] Pin Google Maps API certificates
- [ ] Validate all user input
  - [ ] Coordinate ranges (-90 to 90, -180 to 180)
  - [ ] Search query length limits
- [ ] Secure local storage
  - [ ] Use device keychain (iOS) / keystore (Android) for sensitive data
  - [ ] Encrypt cached data if needed
- [ ] Code obfuscation
  - [ ] Enable ProGuard/R8 for Android
  - [ ] Strip debug symbols for production builds
- [ ] Dependency security audit
  - [ ] Run `npm audit` regularly
  - [ ] Update dependencies with security patches
  - [ ] Use Snyk or Dependabot for automated checks

---

## Phase 10: App Store Preparation

### 10.1 iOS App Store Setup
- [ ] Create App Store Connect account
- [ ] Register app bundle ID (com.yourcompany.faceit)
- [ ] Create app listing in App Store Connect
  - [ ] App name: "FaceIt - Global Orientation"
  - [ ] Subtitle: "Face any location on Earth"
  - [ ] Primary category: Navigation
  - [ ] Secondary category: Travel or Education
- [ ] Create app icon (1024x1024px)
  - [ ] Dark theme design
  - [ ] Gradient accent colors
  - [ ] iOS adaptive icon
- [ ] Create screenshots (required sizes for all devices)
  - [ ] iPhone 6.7" (iPhone 14 Pro Max)
  - [ ] iPhone 6.5" (iPhone 11 Pro Max)
  - [ ] iPhone 5.5" (iPhone 8 Plus)
  - [ ] iPad Pro 12.9"
  - [ ] Screenshots: Landing page, Compass view, Search results, Favorites
  - [ ] Dark theme, modern design
- [ ] Write app description
  - [ ] Feature bullet points
  - [ ] Use cases (prayer direction, travel, education)
  - [ ] Simple, intuitive, beautiful
  - [ ] No ads, free to use (MVP)
- [ ] Add keywords (orientation, compass, qibla, prayer, travel, geography, etc.)
- [ ] Set age rating (4+ or 9+, no objectionable content)
- [ ] Add privacy policy URL
- [ ] Configure location permission usage description
  - [ ] NSLocationWhenInUseUsageDescription: "FaceIt needs your location to calculate the direction to your chosen destination."

### 10.2 Android Play Store Setup
- [ ] Create Google Play Console account
- [ ] Register app package name (com.yourcompany.faceit)
- [ ] Create app listing in Play Console
  - [ ] App name: "FaceIt - Global Orientation"
  - [ ] Short description: "Face any location on Earth with real-time compass guidance"
  - [ ] Full description: Detailed feature list and use cases
  - [ ] Category: Maps & Navigation
- [ ] Create app icon (512x512px, adaptive icon with background and foreground)
- [ ] Create screenshots (required sizes)
  - [ ] Phone: 1080x1920px or 1440x2560px
  - [ ] 7-inch tablet: 1200x1920px
  - [ ] 10-inch tablet: 1600x2560px
  - [ ] Screenshots: Landing page, Compass view, Search results, Favorites
- [ ] Create feature graphic (1024x500px)
- [ ] Add promotional video (optional, YouTube link)
- [ ] Set content rating (Everyone or PEGI 3)
- [ ] Add privacy policy URL
- [ ] Configure location permission
  - [ ] Add to AndroidManifest.xml:
    ```xml
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    ```
  - [ ] Justify in Play Console (required for compass functionality)

### 10.3 Build for Production
- [ ] iOS production build
  - [ ] Increment build number
  - [ ] Set version number (1.0.0)
  - [ ] Configure release scheme in Xcode
  - [ ] Archive app (Product > Archive)
  - [ ] Upload to App Store Connect via Xcode or Transporter
  - [ ] Submit for review
- [ ] Android production build
  - [ ] Increment version code
  - [ ] Set version name (1.0.0)
  - [ ] Generate signed APK/AAB
    ```bash
    cd android && ./gradlew bundleRelease
    ```
  - [ ] Upload to Play Console (Internal Testing → Beta → Production)
  - [ ] Submit for review

### 10.4 App Store Optimization (ASO)
- [ ] Research keywords
  - [ ] Qibla, compass, prayer direction, orientation, geography
  - [ ] Analyze competitor keywords
- [ ] A/B test screenshots (Play Store console)
- [ ] Optimize app title and subtitle
- [ ] Encourage early reviews (in-app rating prompt after successful orientation)
- [ ] Monitor app store rankings

---

## Phase 11: Beta Testing

### 11.1 Internal Testing (Alpha)
- [ ] Create internal TestFlight build (iOS)
  - [ ] Upload build to App Store Connect
  - [ ] Add internal testers (team members)
  - [ ] Distribute via TestFlight
- [ ] Create internal testing track (Android)
  - [ ] Upload AAB to Play Console
  - [ ] Add internal testers (email addresses)
  - [ ] Distribute via Play Console
- [ ] Internal testing checklist
  - [ ] Core features work (search, compass, favorites)
  - [ ] No crashes on basic flows
  - [ ] Performance acceptable (no lag)
  - [ ] All sensors functioning
- [ ] Collect feedback from team
  - [ ] Bug reports (GitHub Issues)
  - [ ] Feature suggestions
  - [ ] UX improvements

### 11.2 External Beta Testing
- [ ] Create external TestFlight build (iOS)
  - [ ] Upload build to App Store Connect
  - [ ] Submit for Beta Review (Apple approval required)
  - [ ] Create public beta link or invite testers
- [ ] Create open beta testing track (Android)
  - [ ] Upload AAB to Play Console
  - [ ] Create open beta program
  - [ ] Share beta sign-up link
- [ ] Recruit beta testers (target: 100+ testers)
  - [ ] Post on Reddit (r/iOSBeta, r/androidapps)
  - [ ] Share on Twitter/X
  - [ ] Share in relevant communities (prayer app forums, geography subreddits)
  - [ ] Friends and family
- [ ] Collect beta feedback
  - [ ] In-app feedback form
  - [ ] Email address for bug reports
  - [ ] Monitor Crashlytics for crashes
  - [ ] Track analytics (Firebase)
- [ ] Iterate based on feedback
  - [ ] Fix critical bugs
  - [ ] Adjust UX based on user testing
  - [ ] Improve onboarding if users struggle

---

## Phase 12: Launch & Post-Launch

### 12.1 Pre-Launch Checklist
- [ ] Final QA testing
  - [ ] All P0 user stories completed
  - [ ] No critical bugs
  - [ ] Crash-free rate > 99%
  - [ ] Performance targets met (<2s load, 10+ FPS compass)
- [ ] Final build submission
  - [ ] iOS: Submit for App Store review
  - [ ] Android: Submit for Google Play review
- [ ] Prepare launch materials
  - [ ] Product Hunt submission (optional)
  - [ ] Launch tweet/announcement
  - [ ] Press kit (screenshots, description, contact)
- [ ] Set up monitoring
  - [ ] Firebase Crashlytics alerts
  - [ ] Firebase Analytics dashboards
  - [ ] App Store Connect analytics
  - [ ] Play Console analytics
- [ ] Create support channels
  - [ ] Support email address (support@faceit.app)
  - [ ] FAQ page on website
  - [ ] In-app help content

### 12.2 Launch Day
- [ ] Monitor app store approval status
- [ ] Once approved, announce launch
  - [ ] Social media (Twitter/X, Reddit, Instagram)
  - [ ] Product Hunt
  - [ ] Hacker News Show HN
  - [ ] Relevant communities (r/islam for Qibla use case, r/travel, etc.)
- [ ] Monitor for issues
  - [ ] Crashlytics for crashes
  - [ ] User reviews for complaints
  - [ ] Social media for feedback
- [ ] Respond to reviews
  - [ ] Thank positive reviews
  - [ ] Respond to negative reviews, offer to help

### 12.3 Post-Launch Monitoring (Week 1)
- [ ] Monitor key metrics daily
  - [ ] Downloads / installs
  - [ ] Daily active users (DAU)
  - [ ] Crash-free sessions rate
  - [ ] Search success rate
  - [ ] Average session length
  - [ ] App store ratings
- [ ] Track critical errors
  - [ ] Crashlytics for new crashes
  - [ ] API errors (geocoding failures)
  - [ ] GPS/sensor failures
- [ ] Collect user feedback
  - [ ] App store reviews
  - [ ] In-app feedback
  - [ ] Social media mentions
- [ ] Hot-fix critical issues
  - [ ] Prepare 1.0.1 patch if needed
  - [ ] Fast-track review for critical fixes

### 12.4 Post-Launch Iteration (Week 2-4)
- [ ] Analyze user behavior
  - [ ] Which popular locations are most used?
  - [ ] What locations are users searching for?
  - [ ] Where do users drop off?
  - [ ] What errors are most common?
- [ ] Plan first update (1.1.0)
  - [ ] Bug fixes from user reports
  - [ ] Small UX improvements
  - [ ] Add more popular locations based on usage
- [ ] Improve app store presence
  - [ ] Respond to all reviews
  - [ ] Update screenshots if needed
  - [ ] Refine app description based on user language
- [ ] Marketing efforts
  - [ ] Share user testimonials
  - [ ] Create tutorial videos (YouTube)
  - [ ] Blog post on launch learnings
- [ ] Begin planning Phase 2 features (P1 features from PRD)

---

## Phase 13: Maintenance & Growth

### 13.1 Regular Maintenance
- [ ] Weekly monitoring
  - [ ] Review analytics dashboards
  - [ ] Check crash reports
  - [ ] Monitor API usage and costs
  - [ ] Review user feedback
- [ ] Monthly dependency updates
  - [ ] Update React Native patch versions
  - [ ] Update library dependencies
  - [ ] Run security audit (`npm audit`)
  - [ ] Test thoroughly after updates
- [ ] Quarterly major updates
  - [ ] Update React Native minor version
  - [ ] Update iOS/Android SDKs
  - [ ] Update Firebase SDK
  - [ ] Performance profiling
  - [ ] Battery usage testing

### 13.2 Metrics Tracking
- [ ] Set up KPI dashboards
  - [ ] MAU (Monthly Active Users): Target 100K by Month 12
  - [ ] DAU/MAU ratio: Target 20%
  - [ ] Retention: D1 40%, D7 25%, D30 60%
  - [ ] Session length: 2-3 minutes average
  - [ ] Search success rate: >95%
  - [ ] Crash-free sessions: >99.5%
  - [ ] App store rating: >4.5 stars
- [ ] Weekly review of metrics
- [ ] Monthly report for stakeholders

### 13.3 Phase 2 Feature Planning
**Reference**: P1 features from PRD

Based on user feedback and metrics, prioritize these features for next release:
- [ ] Search autocomplete/suggestions (FR-1.4)
- [ ] Compass calibration guidance (FR-2.5)
- [ ] Saved/favorite locations with custom labels (FR-4.3)
- [ ] Onboarding tutorial (FR-5.3)
- [ ] Landscape orientation support
- [ ] Haptic feedback on alignment
- [ ] Accessibility improvements (VoiceOver/TalkBack)
- [ ] Performance optimizations

---

## Quick Reference

### Git Workflow
```bash
# Feature development
git checkout develop
git pull origin develop
git checkout -b feature/compass-component
# ... make changes ...
git add .
git commit -m "feat: implement compass component with gradient border"
git push origin feature/compass-component
# Create PR to develop on GitHub
# After review and approval, merge to develop
# Staging deployment happens automatically
```

### Common Commands
```bash
# Development
npm start                # Start Metro bundler
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # Run TypeScript type checking

# iOS
cd ios && pod install && cd ..   # Install iOS dependencies
npm run clean:ios                # Clean iOS build

# Android
npm run clean:android            # Clean Android build
cd android && ./gradlew clean    # Clean Gradle cache

# Build
npm run build:ios                # Build iOS for device
npm run build:android            # Build Android APK/AAB
```

### Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | React Native 0.73+ | Team expertise, cross-platform, mature ecosystem, good sensor access |
| **Language** | TypeScript 5.x | Type safety, better refactoring, catch errors at compile-time |
| **Navigation** | React Navigation 6.x | Industry standard for RN, stack navigation, smooth transitions |
| **Animations** | React Native Reanimated 2.x/3.x | 60fps performance (runs on UI thread), smooth compass rotation |
| **State Management** | React Context + Hooks | Sufficient for app complexity, no Redux overhead needed for MVP |
| **Local Storage** | AsyncStorage / MMKV | Persistent storage, MMKV faster if performance issues arise |
| **Geocoding API** | Google Maps Geocoding API | Accurate, comprehensive, $200 free credit/month, fallback to Mapbox |
| **Analytics** | Firebase Analytics + Crashlytics | Free tier, comprehensive, mobile-optimized |
| **Backend** | None (client-side only) | No custom backend for MVP, leverage managed services (Firebase) |
| **Testing** | Jest + React Native Testing Library | Standard for RN, good mocking support |
| **CI/CD** | GitHub Actions + Fastlane | Automated builds and deployments, free for public repos |
| **Design** | Dark theme first | Modern aesthetic, battery-friendly on OLED, matches reference apps |

---

## Success Criteria

### Phase 1 (MVP Launch) - Week 24
- [ ] App approved by iOS App Store
- [ ] App approved by Google Play Store
- [ ] All P0 functional requirements implemented (13 FRs)
- [ ] All P0 user stories completed (13 USs)
- [ ] Crash-free sessions > 99%
- [ ] Search success rate > 90%
- [ ] App store rating > 4.0 stars (early reviews)
- [ ] <1° bearing accuracy for 95% of calculations
- [ ] <2 second load time
- [ ] 10+ FPS compass update rate

### Phase 2 (Growth) - Month 12
- [ ] 100,000 monthly active users (MAU)
- [ ] 20% DAU/MAU ratio
- [ ] 60% D30 retention
- [ ] 4.5+ star app store rating
- [ ] 40% organic acquisition
- [ ] P1 features launched (autocomplete, favorites, onboarding, calibration)

### Technical Excellence (Ongoing)
- [ ] 80%+ test coverage (backend services)
- [ ] 70%+ component test coverage
- [ ] <150 MB memory usage
- [ ] <5% battery drain per 10-minute session
- [ ] No security vulnerabilities in dependencies
- [ ] WCAG 2.1 AA accessibility compliance

---

## Notes

- **No custom backend**: MVP is client-side only, using Google Maps API + Firebase managed services
- **Sensor-intensive**: Compass requires 10-30 Hz sensor updates for smooth 60fps rotation
- **Local-first**: All user data (history, favorites) stored locally on device for privacy
- **Dark theme first**: Modern design inspired by reference apps (world time, flight tracker)
- **Performance critical**: Compass rotation must be smooth (60fps via Reanimated 2)
- **API costs**: Monitor Google Maps API usage closely; aggressive caching essential
- **Calibration UX**: Figure-8 calibration will be critical for user success
- **Privacy-first**: No user accounts, no cloud sync, no tracking (MVP)

---

**End of Development Plan**

Total Estimated Tasks: **350+ tasks** across 13 phases

Estimated Timeline: **24 weeks (6 months)** to MVP launch

Next Steps:
1. Review and approve this plan with stakeholders
2. Set up development environment (Phase 1)
3. Begin Phase 2 (Design System) while Phase 1 wraps up
4. Weekly sprint planning using this task list
5. Track progress with checkboxes
6. Update plan as needed based on learnings
