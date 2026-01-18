# CI/CD Setup Guide

This document explains how to set up and use the CI/CD pipeline for FaceIt.

## Table of Contents

- [GitHub Actions CI](#github-actions-ci)
- [Fastlane Setup](#fastlane-setup)
- [iOS Configuration](#ios-configuration)
- [Android Configuration](#android-configuration)
- [GitHub Secrets](#github-secrets)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)

---

## GitHub Actions CI

The CI pipeline automatically runs on:

- **Push** to `develop` or `main` branches
- **Pull requests** targeting `develop` or `main`

### CI Jobs

1. **Lint, Type Check & Test**
   - Runs ESLint
   - Runs TypeScript type checking
   - Runs Jest tests with coverage
   - Uploads coverage to Codecov

2. **Build Android**
   - Builds Android Debug APK
   - Uploads APK as artifact

3. **Build iOS**
   - Builds iOS app for simulator (Debug)
   - Requires macOS runner

---

## Fastlane Setup

### Installation

Fastlane is managed via Bundler. Install dependencies:

```bash
bundle install
```

### iOS Lanes

Located in `ios/fastlane/Fastfile`:

- **`fastlane ios beta`** - Build and upload to TestFlight
- **`fastlane ios release`** - Build and upload to App Store
- **`fastlane ios test`** - Run iOS tests
- **`fastlane ios dev`** - Build for development

### Android Lanes

Located in `android/fastlane/Fastfile`:

- **`fastlane android beta`** - Build and upload to Google Play Internal Testing
- **`fastlane android release`** - Build and upload to Google Play Production
- **`fastlane android test`** - Run Android tests
- **`fastlane android dev`** - Build debug APK
- **`fastlane android build_apk`** - Build release APK

---

## iOS Configuration

### Prerequisites

1. **Apple Developer Account** (required)
2. **App Store Connect** access
3. **Certificates and Provisioning Profiles**

### Steps

1. **Update Bundle Identifier**

   Edit `ios/fastlane/Appfile`:

   ```ruby
   app_identifier("com.yourcompany.faceit")
   ```

2. **Set Up Certificates**

   Use [fastlane match](https://docs.fastlane.tools/actions/match/) for code signing:

   ```bash
   fastlane match init
   fastlane match development
   fastlane match appstore
   ```

3. **Configure Signing**

   In Xcode:
   - Open `ios/FaceItTemp.xcworkspace`
   - Select project > Signing & Capabilities
   - Set Team and Bundle Identifier
   - Enable Automatic Signing (or use manual with match)

4. **Set Environment Variables**

   ```bash
   export APPLE_ID="your-apple-id@email.com"
   export APPLE_TEAM_ID="YOUR_TEAM_ID"
   export MATCH_PASSWORD="your-match-password"
   ```

---

## Android Configuration

### Prerequisites

1. **Google Play Console** account
2. **Service Account** for API access
3. **Keystore** for signing

### Steps

1. **Update Package Name**

   Edit `android/fastlane/Appfile`:

   ```ruby
   package_name("com.yourcompany.faceit")
   ```

2. **Create Service Account**
   - Go to [Google Play Console](https://play.google.com/console)
   - Settings > API access
   - Create new service account
   - Download JSON key file
   - Grant necessary permissions (Release Manager)

3. **Create Keystore**

   ```bash
   keytool -genkey -v -keystore faceit-release.keystore \
     -alias faceit-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

   Store keystore securely (DO NOT commit to Git!)

4. **Configure Gradle Signing**

   Edit `android/app/build.gradle`:

   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file(System.getenv("RELEASE_KEYSTORE_PATH"))
               storePassword System.getenv("RELEASE_KEYSTORE_PASSWORD")
               keyAlias System.getenv("RELEASE_KEY_ALIAS")
               keyPassword System.getenv("RELEASE_KEY_PASSWORD")
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

5. **Set Environment Variables**

   ```bash
   export RELEASE_KEYSTORE_PATH="/path/to/faceit-release.keystore"
   export RELEASE_KEYSTORE_PASSWORD="your-keystore-password"
   export RELEASE_KEY_ALIAS="faceit-key-alias"
   export RELEASE_KEY_PASSWORD="your-key-password"
   ```

---

## GitHub Secrets

Configure these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

### iOS Secrets

- **`APPLE_ID`** - Your Apple Developer email
- **`APPLE_TEAM_ID`** - Your Team ID (found in Apple Developer portal)
- **`MATCH_PASSWORD`** - Password for fastlane match
- **`MATCH_GIT_URL`** - Git repo URL for certificates (if using match)
- **`APP_STORE_CONNECT_API_KEY_ID`** - App Store Connect API Key ID
- **`APP_STORE_CONNECT_API_ISSUER_ID`** - App Store Connect Issuer ID
- **`APP_STORE_CONNECT_API_KEY`** - App Store Connect API Key (base64 encoded)

### Android Secrets

- **`PLAY_STORE_JSON_KEY`** - Google Play service account JSON (base64 encoded)
- **`RELEASE_KEYSTORE`** - Android keystore file (base64 encoded)
- **`RELEASE_KEYSTORE_PASSWORD`** - Keystore password
- **`RELEASE_KEY_ALIAS`** - Key alias
- **`RELEASE_KEY_PASSWORD`** - Key password

### General Secrets

- **`GOOGLE_MAPS_API_KEY`** - Google Maps API key
- **`MAPBOX_API_KEY`** - Mapbox API key (fallback)
- **`FIREBASE_CONFIG`** - Firebase configuration

### Encoding Files for Secrets

```bash
# Encode file to base64
base64 -i path/to/file.json -o encoded.txt

# Decode in CI
echo "$SECRET_VARIABLE" | base64 -d > file.json
```

---

## Usage

### Local Development

**Build iOS beta:**

```bash
cd ios
fastlane beta
```

**Build Android beta:**

```bash
cd android
fastlane beta
```

**Run tests:**

```bash
npm test                    # JavaScript tests
fastlane ios test          # iOS tests
fastlane android test      # Android tests
```

### Automated Builds (GitHub Actions)

- **Push to develop** → Triggers CI (lint, test, build)
- **Create PR** → Triggers CI on PR
- **Merge to main** → Ready for manual Fastlane release

### Manual Releases

**iOS Production Release:**

```bash
cd ios
fastlane release
```

**Android Production Release:**

```bash
cd android
fastlane release
```

---

## Troubleshooting

### iOS Issues

**Code signing errors:**

- Verify certificates are valid in Apple Developer portal
- Run `fastlane match development --readonly` to fetch certificates
- Check Xcode > Preferences > Accounts for valid credentials

**TestFlight upload fails:**

- Ensure app complies with App Store guidelines
- Check App Store Connect for pending agreements
- Verify API key has proper permissions

### Android Issues

**Gradle build fails:**

- Clean build: `cd android && ./gradlew clean`
- Check Java version: `java -version` (requires Java 17)
- Verify Gradle wrapper: `./gradlew --version`

**Play Store upload fails:**

- Verify service account has "Release Manager" role
- Check JSON key file is valid and not expired
- Ensure version code is higher than previous releases

### General Issues

**Dependencies fail to install:**

- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`
- Clear CocoaPods cache: `cd ios && rm -rf Pods && pod install`

**CI builds fail:**

- Check GitHub Actions logs for specific errors
- Verify all secrets are properly configured
- Ensure branch protection rules allow CI to run

---

## Additional Resources

- [Fastlane Documentation](https://docs.fastlane.tools/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Native Deployment Guide](https://reactnative.dev/docs/publishing-to-app-store)
- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)
- [Google Play Console Guide](https://support.google.com/googleplay/android-developer)

---

## Automatic Build Numbering

Build numbers are automatically incremented by Fastlane:

- **iOS**: `increment_build_number` in Fastfile
- **Android**: `increment_version_code` in Fastfile

Version numbers should be manually updated for major/minor releases:

- **iOS**: `xcrun agvtool new-marketing-version <version>`
- **Android**: Update `versionName` in `app/build.gradle`

---

**Last Updated**: January 2026
