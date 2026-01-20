#!/usr/bin/env node

/**
 * Version Management Script for FaceIt
 *
 * This script synchronizes version numbers across:
 * - package.json (source of truth for version)
 * - iOS project (MARKETING_VERSION and CURRENT_PROJECT_VERSION)
 * - Android build.gradle (versionName and versionCode)
 *
 * Usage:
 *   node scripts/set-version.js              # Sync versions from package.json
 *   node scripts/set-version.js 1.0.0        # Set specific version
 *   node scripts/set-version.js --bump patch # Bump patch version (1.0.0 -> 1.0.1)
 *   node scripts/set-version.js --bump minor # Bump minor version (1.0.0 -> 1.1.0)
 *   node scripts/set-version.js --bump major # Bump major version (1.0.0 -> 2.0.0)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const IOS_PBXPROJ_PATH = path.join(ROOT_DIR, 'ios', 'FaceItTemp.xcodeproj', 'project.pbxproj');
const ANDROID_BUILD_GRADLE_PATH = path.join(ROOT_DIR, 'android', 'app', 'build.gradle');

/**
 * Get the number of git commits (used as build number)
 */
function getGitCommitCount() {
  try {
    const count = execSync('git rev-list --count HEAD', { cwd: ROOT_DIR, encoding: 'utf8' });
    return parseInt(count.trim(), 10);
  } catch (error) {
    console.warn('Warning: Could not get git commit count, using 1');
    return 1;
  }
}

/**
 * Parse semantic version string
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}. Expected format: X.Y.Z`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
  };
}

/**
 * Bump version based on type
 */
function bumpVersion(currentVersion, bumpType) {
  const parsed = parseVersion(currentVersion);

  switch (bumpType) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    default:
      throw new Error(`Unknown bump type: ${bumpType}`);
  }
}

/**
 * Read and parse package.json
 */
function readPackageJson() {
  const content = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
  return JSON.parse(content);
}

/**
 * Write package.json
 */
function writePackageJson(packageJson) {
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * Update iOS project.pbxproj
 */
function updateiOSVersion(marketingVersion, buildNumber) {
  let content = fs.readFileSync(IOS_PBXPROJ_PATH, 'utf8');

  // Update MARKETING_VERSION
  content = content.replace(
    /MARKETING_VERSION = [\d.]+;/g,
    `MARKETING_VERSION = ${marketingVersion};`,
  );

  // Update CURRENT_PROJECT_VERSION
  content = content.replace(
    /CURRENT_PROJECT_VERSION = \d+;/g,
    `CURRENT_PROJECT_VERSION = ${buildNumber};`,
  );

  fs.writeFileSync(IOS_PBXPROJ_PATH, content);
  console.log(
    `  iOS: MARKETING_VERSION = ${marketingVersion}, CURRENT_PROJECT_VERSION = ${buildNumber}`,
  );
}

/**
 * Update Android build.gradle
 */
function updateAndroidVersion(versionName, versionCode) {
  let content = fs.readFileSync(ANDROID_BUILD_GRADLE_PATH, 'utf8');

  // Update versionCode
  content = content.replace(/versionCode \d+/, `versionCode ${versionCode}`);

  // Update versionName
  content = content.replace(/versionName "[\d.]+"/, `versionName "${versionName}"`);

  fs.writeFileSync(ANDROID_BUILD_GRADLE_PATH, content);
  console.log(`  Android: versionName = "${versionName}", versionCode = ${versionCode}`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Read current package.json
  const packageJson = readPackageJson();
  let newVersion = packageJson.version;

  // Handle arguments
  if (args.length === 0) {
    // Just sync current version
    console.log(`Syncing version ${newVersion} to iOS and Android...`);
  } else if (args[0] === '--bump') {
    const bumpType = args[1];
    if (!['major', 'minor', 'patch'].includes(bumpType)) {
      console.error('Error: --bump requires major, minor, or patch');
      process.exit(1);
    }
    newVersion = bumpVersion(packageJson.version, bumpType);
    console.log(`Bumping ${bumpType}: ${packageJson.version} -> ${newVersion}`);

    // Update package.json
    packageJson.version = newVersion;
    writePackageJson(packageJson);
    console.log(`  package.json updated`);
  } else if (args[0].match(/^\d+\.\d+\.\d+/)) {
    // Specific version provided
    newVersion = args[0];
    console.log(`Setting version to ${newVersion}...`);

    // Validate version format
    parseVersion(newVersion);

    // Update package.json
    packageJson.version = newVersion;
    writePackageJson(packageJson);
    console.log(`  package.json updated`);
  } else {
    console.error('Usage:');
    console.error('  node scripts/set-version.js              # Sync versions');
    console.error('  node scripts/set-version.js 1.0.0        # Set specific version');
    console.error('  node scripts/set-version.js --bump patch # Bump patch/minor/major');
    process.exit(1);
  }

  // Get build number from git commit count
  const buildNumber = getGitCommitCount();

  // Update iOS
  console.log('Updating iOS...');
  updateiOSVersion(newVersion, buildNumber);

  // Update Android
  console.log('Updating Android...');
  updateAndroidVersion(newVersion, buildNumber);

  console.log(`\nDone! Version: ${newVersion}, Build: ${buildNumber}`);
}

main();
