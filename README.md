# FaceIt - Global Orientation Mobile App

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.83+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

A beautiful, modern mobile application that helps users physically orient themselves to face any location in the world using real-time compass guidance powered by device sensors.

## 📖 Overview

**FaceIt** transforms the complex task of spatial orientation into a simple, elegant experience. Whether you're a spiritual practitioner finding prayer direction, a traveler understanding global geography, a parent feeling connected to distant family, or an educator teaching spatial awareness - FaceIt provides instant, accurate orientation to any location on Earth.

### Key Features

- 🔍 **Universal Search** - Search for any location worldwide (landmarks, cities, addresses, coordinates)
- 🧭 **Real-Time Compass** - Smooth 60fps compass rotation using device sensors
- ⭐ **Favorites & History** - Quick access to frequently-used locations
- 🌍 **Popular Locations** - Discover and orient toward world landmarks
- 🌙 **Modern Dark Theme** - Beautiful gradient-accented UI inspired by world-class mobile design
- 🎯 **Sub-1° Accuracy** - Precise bearing calculations using great circle routes
- 🔒 **Privacy-First** - All data stored locally, no cloud sync required

### Use Cases

- **Spiritual Practice**: Find accurate prayer direction (Qibla) from anywhere
- **Travel & Exploration**: Understand spatial relationships between locations
- **Emotional Connection**: Face toward distant loved ones
- **Education**: Teach geography and spatial awareness

---

## 🛠 Tech Stack

### Frontend

- **Framework**: React Native 0.83+ (Cross-platform iOS/Android)
- **Language**: TypeScript 5.x (strict mode)
- **Navigation**: React Navigation 7.x
- **Animations**: React Native Reanimated 4.x (60fps compass rotation)
- **State Management**: React Context API + Hooks
- **Styling**: React Native StyleSheet API + Custom Dark Theme

### Services & APIs

- **Geocoding**: Google Maps Geocoding API (primary), Mapbox (fallback)
- **Analytics**: Firebase Analytics
- **Crash Reporting**: Firebase Crashlytics
- **Remote Config**: Firebase Remote Config
- **Local Storage**: AsyncStorage / MMKV

### Device Integration

- **Sensors**: react-native-sensors (Magnetometer, Accelerometer, Gyroscope)
- **Geolocation**: react-native-geolocation-service
- **Haptic Feedback**: Native haptic APIs

### Development & Testing

- **Testing**: Jest + React Native Testing Library
- **E2E Testing**: Detox (optional)
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions + Fastlane
- **Version Control**: Git

---

## 📋 Documentation

- **[Product Requirements Document (PRD)](./prd.md)** - Complete product specification, user stories, and requirements
- **[Development Plan](./plan.md)** - Comprehensive 350+ task development roadmap
- **[Development Execution Guides](./start-dev-auto.md)** - Step-by-step implementation instructions

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **React Native CLI**: Latest
- **Xcode**: 14.x or higher (for iOS development)
- **Android Studio**: Latest (for Android development)
- **CocoaPods**: Latest (for iOS dependencies)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd FaceIt

# Install dependencies
npm install

# iOS: Install CocoaPods dependencies
cd ios && pod install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

---

## 🏗 Project Structure

```
FaceIt/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base components (Button, Card, Input)
│   │   ├── compass/      # Compass-specific components
│   │   ├── search/       # Search-related components
│   │   └── common/       # Common components (Header, Loading, Error)
│   ├── screens/          # Screen components
│   │   ├── Landing/      # Main landing page
│   │   ├── SearchResults/# Search results screen
│   │   ├── Compass/      # Compass orientation screen
│   │   ├── Settings/     # Settings screen
│   │   └── Onboarding/   # First-time user tutorial
│   ├── navigation/       # Navigation configuration
│   ├── services/         # Business logic & API integrations
│   │   ├── geocoding/    # Geocoding API integration
│   │   ├── sensors/      # Sensor management & fusion
│   │   ├── location/     # GPS location services
│   │   ├── storage/      # Local storage operations
│   │   └── calculations/ # Bearing & distance calculations
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts for global state
│   ├── utils/            # Helper functions
│   ├── constants/        # Constants (theme, config)
│   ├── types/            # TypeScript type definitions
│   └── assets/           # Images, icons, fonts
├── ios/                  # iOS native code
├── android/              # Android native code
├── __tests__/            # Test files
└── docs/                 # Additional documentation
```

---

## 🎨 Design Philosophy

- **Dark Theme First**: Modern, battery-friendly OLED-optimized design
- **Gradient Accents**: Cyan to green gradients (#00D9B8 → #00FFD1)
- **Minimalist UI**: Clean, uncluttered interface inspired by world-class mobile apps
- **60fps Animations**: Smooth, delightful interactions using Reanimated 2
- **Accessibility**: WCAG 2.1 AA compliance with VoiceOver/TalkBack support

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

**Testing Requirements**:

- Services: >80% coverage
- Components: >70% coverage
- Critical calculations: 100% coverage

---

## 📦 Building for Production

### iOS

```bash
# Build for TestFlight (beta)
cd ios
fastlane beta

# Build for App Store (production)
fastlane release
```

### Android

```bash
# Build for Google Play Internal Testing (beta)
cd android
fastlane beta

# Build for Google Play (production)
fastlane release
```

---

## 🗺 Roadmap

### Phase 1: MVP (Weeks 0-24) ✅ In Progress

- Core location search and compass orientation
- Recent history and popular locations
- Dark theme UI with gradient accents
- iOS and Android App Store launch

### Phase 2: Enhancement (Months 6-12)

- Search autocomplete/suggestions
- Saved favorites with custom labels
- Onboarding tutorial
- Compass calibration guidance
- Landscape orientation support
- Accessibility improvements

### Phase 3: Scale & Monetization (Months 12-24)

- Premium features
- AR mode (simple direction overlay)
- Social sharing
- Multi-language support
- Platform expansion (iPad, Watch)

---

## 📊 Success Metrics

| Metric                     | Target              |
| -------------------------- | ------------------- |
| Monthly Active Users (MAU) | 100,000 by Month 12 |
| App Store Rating           | 4.5+ stars          |
| Crash-Free Sessions        | >99.5%              |
| Bearing Accuracy           | <1° error for 95%   |
| App Launch Time            | <2 seconds          |
| Compass Update Rate        | 10-30 FPS           |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:

- Code style guidelines
- Git workflow (feature branches, PR process)
- Testing requirements
- Commit message conventions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Design inspiration from world-class mobile apps
- React Native community for excellent libraries and tools
- Firebase for comprehensive mobile backend services
- Google Maps for accurate geocoding services

---

## 📧 Contact & Support

- **Email**: support@faceit.app
- **Issues**: [GitHub Issues](https://github.com/yourorg/faceit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourorg/faceit/discussions)

---

**Built with ❤️ using React Native**

_FaceIt - Face any location on Earth_
