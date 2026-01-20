#!/usr/bin/env node
/* eslint-env node */

/**
 * FaceIt App Icon Generator
 * Generates all required iOS and Android app icons programmatically
 *
 * Design: Compass arrow on dark background with teal-to-cyan gradient
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Theme colors from theme.ts
const COLORS = {
  background: '#101010',
  gradientStart: '#57ecb2', // Teal
  gradientEnd: '#50b6ff', // Cyan
};

// iOS icon sizes (size@scale = actual pixels)
const IOS_ICONS = [
  { name: 'Icon-20@2x', size: 40 },
  { name: 'Icon-20@3x', size: 60 },
  { name: 'Icon-29@2x', size: 58 },
  { name: 'Icon-29@3x', size: 87 },
  { name: 'Icon-40@2x', size: 80 },
  { name: 'Icon-40@3x', size: 120 },
  { name: 'Icon-60@2x', size: 120 },
  { name: 'Icon-60@3x', size: 180 },
  { name: 'Icon-1024', size: 1024 },
];

// Android icon sizes
const ANDROID_ICONS = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Android adaptive icon sizes (foreground should be 108dp with 72dp safe zone)
const ANDROID_ADAPTIVE_ICONS = [
  { folder: 'mipmap-mdpi', size: 108 },
  { folder: 'mipmap-hdpi', size: 162 },
  { folder: 'mipmap-xhdpi', size: 216 },
  { folder: 'mipmap-xxhdpi', size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

/**
 * Creates SVG for the app icon
 * Design: Stylized compass arrow pointing north with gradient
 */
function createIconSvg(size, isAdaptive = false, isForeground = false) {
  const center = size / 2;

  // For adaptive icons, the icon should be centered in a larger canvas
  // The visible area is 66% of the total (72dp visible out of 108dp)
  const iconScale = isAdaptive ? 0.5 : 0.7;
  const arrowHeight = size * iconScale;
  const arrowWidth = arrowHeight * 0.45;

  // Arrow points (pointing up/north)
  const topY = center - arrowHeight / 2;
  const bottomY = center + arrowHeight / 2;
  const notchY = center + arrowHeight * 0.15; // Small notch at bottom

  // Create gradient definition
  const gradientId = `iconGradient_${size}`;

  // Background for non-adaptive icons
  const background =
    isAdaptive && isForeground
      ? ''
      : `<rect width="${size}" height="${size}" fill="${COLORS.background}" rx="${isAdaptive ? 0 : size * 0.22}"/>`;

  // Main arrow shape
  const arrow = `
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${COLORS.gradientStart}"/>
        <stop offset="100%" stop-color="${COLORS.gradientEnd}"/>
      </linearGradient>
    </defs>
    <path
      d="M ${center} ${topY}
         L ${center + arrowWidth / 2} ${bottomY}
         L ${center} ${notchY}
         L ${center - arrowWidth / 2} ${bottomY}
         Z"
      fill="url(#${gradientId})"
    />
  `;

  // Small compass circle at center
  const circleRadius = size * 0.04;
  const circle = `<circle cx="${center}" cy="${center}" r="${circleRadius}" fill="${COLORS.background}" stroke="url(#${gradientId})" stroke-width="${size * 0.015}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${background}
  ${arrow}
  ${circle}
</svg>`;
}

/**
 * Creates SVG for adaptive icon foreground (just the arrow, transparent bg)
 */
function createAdaptiveForegroundSvg(size) {
  const center = size / 2;
  // Safe zone is 66% of the icon (72dp out of 108dp)
  // Icon should be within this safe zone
  const iconScale = 0.45; // Smaller to fit in safe zone
  const arrowHeight = size * iconScale;
  const arrowWidth = arrowHeight * 0.45;

  const topY = center - arrowHeight / 2;
  const bottomY = center + arrowHeight / 2;
  const notchY = center + arrowHeight * 0.15;

  const gradientId = `foregroundGradient_${size}`;
  const circleRadius = size * 0.03;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.gradientStart}"/>
      <stop offset="100%" stop-color="${COLORS.gradientEnd}"/>
    </linearGradient>
  </defs>
  <path
    d="M ${center} ${topY}
       L ${center + arrowWidth / 2} ${bottomY}
       L ${center} ${notchY}
       L ${center - arrowWidth / 2} ${bottomY}
       Z"
    fill="url(#${gradientId})"
  />
  <circle cx="${center}" cy="${center}" r="${circleRadius}" fill="${COLORS.background}" stroke="url(#${gradientId})" stroke-width="${size * 0.012}"/>
</svg>`;
}

async function generateIcon(svg, outputPath, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outputPath);
  console.log(`  Generated: ${outputPath} (${size}x${size})`);
}

async function generateIosIcons() {
  console.log('\n📱 Generating iOS icons...');

  const iosOutputDir = path.join(__dirname, '../ios/FaceItTemp/Images.xcassets/AppIcon.appiconset');

  // Ensure directory exists
  if (!fs.existsSync(iosOutputDir)) {
    fs.mkdirSync(iosOutputDir, { recursive: true });
  }

  for (const icon of IOS_ICONS) {
    const svg = createIconSvg(icon.size);
    const outputPath = path.join(iosOutputDir, `${icon.name}.png`);
    await generateIcon(svg, outputPath, icon.size);
  }

  // Update Contents.json with filenames
  const contentsJson = {
    images: [
      { idiom: 'iphone', scale: '2x', size: '20x20', filename: 'Icon-20@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '20x20', filename: 'Icon-20@3x.png' },
      { idiom: 'iphone', scale: '2x', size: '29x29', filename: 'Icon-29@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '29x29', filename: 'Icon-29@3x.png' },
      { idiom: 'iphone', scale: '2x', size: '40x40', filename: 'Icon-40@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '40x40', filename: 'Icon-40@3x.png' },
      { idiom: 'iphone', scale: '2x', size: '60x60', filename: 'Icon-60@2x.png' },
      { idiom: 'iphone', scale: '3x', size: '60x60', filename: 'Icon-60@3x.png' },
      {
        idiom: 'ios-marketing',
        scale: '1x',
        size: '1024x1024',
        filename: 'Icon-1024.png',
      },
    ],
    info: { author: 'xcode', version: 1 },
  };

  fs.writeFileSync(path.join(iosOutputDir, 'Contents.json'), JSON.stringify(contentsJson, null, 2));
  console.log('  Updated: Contents.json');
}

async function generateAndroidIcons() {
  console.log('\n🤖 Generating Android icons...');

  const androidResDir = path.join(__dirname, '../android/app/src/main/res');

  // Generate standard launcher icons
  for (const icon of ANDROID_ICONS) {
    const folderPath = path.join(androidResDir, icon.folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const svg = createIconSvg(icon.size);

    // Standard launcher icon
    await generateIcon(svg, path.join(folderPath, 'ic_launcher.png'), icon.size);

    // Round launcher icon (same as regular for now, Android will apply mask)
    await generateIcon(svg, path.join(folderPath, 'ic_launcher_round.png'), icon.size);
  }

  // Generate adaptive icon layers
  console.log('\n  Generating adaptive icon layers...');
  for (const icon of ANDROID_ADAPTIVE_ICONS) {
    const folderPath = path.join(androidResDir, icon.folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Foreground (the arrow on transparent)
    const foregroundSvg = createAdaptiveForegroundSvg(icon.size);
    await generateIcon(
      foregroundSvg,
      path.join(folderPath, 'ic_launcher_foreground.png'),
      icon.size,
    );
  }

  // Create adaptive icon XML files
  const mipmapAnydpiDir = path.join(androidResDir, 'mipmap-anydpi-v26');
  if (!fs.existsSync(mipmapAnydpiDir)) {
    fs.mkdirSync(mipmapAnydpiDir, { recursive: true });
  }

  const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  fs.writeFileSync(path.join(mipmapAnydpiDir, 'ic_launcher.xml'), adaptiveIconXml);
  fs.writeFileSync(path.join(mipmapAnydpiDir, 'ic_launcher_round.xml'), adaptiveIconXml);
  console.log('  Generated: mipmap-anydpi-v26/ic_launcher.xml');
  console.log('  Generated: mipmap-anydpi-v26/ic_launcher_round.xml');

  // Create color resource for background
  const valuesDir = path.join(androidResDir, 'values');
  const colorsXmlPath = path.join(valuesDir, 'ic_launcher_background.xml');

  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${COLORS.background}</color>
</resources>`;

  fs.writeFileSync(colorsXmlPath, colorsXml);
  console.log('  Generated: values/ic_launcher_background.xml');

  // Generate Play Store icon (512x512)
  console.log('\n  Generating Play Store icon...');
  const playStoreSvg = createIconSvg(512);
  const playStoreDir = path.join(__dirname, '../assets/icons');
  if (!fs.existsSync(playStoreDir)) {
    fs.mkdirSync(playStoreDir, { recursive: true });
  }
  await generateIcon(playStoreSvg, path.join(playStoreDir, 'playstore-icon.png'), 512);
}

async function generateMasterIcon() {
  console.log('\n🎨 Generating master icon (1024x1024)...');

  const assetsDir = path.join(__dirname, '../assets/icons');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const svg = createIconSvg(1024);
  await generateIcon(svg, path.join(assetsDir, 'app-icon-1024.png'), 1024);
}

async function main() {
  console.log('🚀 FaceIt App Icon Generator');
  console.log('============================');
  console.log(`Background: ${COLORS.background}`);
  console.log(`Gradient: ${COLORS.gradientStart} → ${COLORS.gradientEnd}`);

  try {
    await generateMasterIcon();
    await generateIosIcons();
    await generateAndroidIcons();

    console.log('\n✅ All icons generated successfully!');
    console.log('\nGenerated files:');
    console.log('  - iOS: ios/FaceItTemp/Images.xcassets/AppIcon.appiconset/');
    console.log('  - Android: android/app/src/main/res/mipmap-*/');
    console.log('  - Master: assets/icons/app-icon-1024.png');
    console.log('  - Play Store: assets/icons/playstore-icon.png');
  } catch (error) {
    console.error('\n❌ Error generating icons:', error);
    process.exit(1);
  }
}

main();
