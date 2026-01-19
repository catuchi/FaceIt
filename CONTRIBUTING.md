# Contributing to FaceIt

Thank you for your interest in contributing to FaceIt! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Xcode 15+ (for iOS development)
- Android Studio (for Android development)
- CocoaPods (`sudo gem install cocoapods`)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/catuchi/FaceIt.git
   cd FaceIt
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

4. **Install iOS dependencies**

   ```bash
   cd ios && pod install && cd ..
   ```

5. **Run the app**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### Commit Messages

We follow conventional commits:

```
type(scope): description

feat: add new feature
fix: resolve bug
refactor: improve code structure
docs: update documentation
test: add tests
perf: performance improvement
chore: maintenance tasks
```

### Code Style

- TypeScript strict mode enabled
- 2-space indentation
- ESLint + Prettier for formatting
- Run `npm run lint` before committing

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/         # Base UI components (Button, Card, etc.)
│   ├── compass/    # Compass-related components
│   └── common/     # Common components (Loading, Error)
├── screens/        # Screen components
├── services/       # Business logic services
├── hooks/          # Custom React hooks
├── navigation/     # React Navigation setup
├── constants/      # Theme, colors, spacing
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Key Technologies

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Framework  | React Native 0.83           |
| Language   | TypeScript (strict)         |
| Navigation | React Navigation 7.x        |
| Animations | React Native Reanimated 4.x |
| State      | React Context + Hooks       |
| Storage    | AsyncStorage                |

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests and linting
4. Submit a PR to `develop`
5. Wait for review and address feedback

## Reporting Issues

Please use GitHub Issues to report bugs or suggest features. Include:

- Clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Device/OS information
- Screenshots if applicable

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to build something great together.

## License

By contributing, you agree that your contributions will be licensed under the project's license.
