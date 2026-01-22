/**
 * OnboardingScreen
 * First-time user onboarding with 3-screen carousel
 * Design: Flighty-inspired dark UI
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { ScreenProps } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Analytics, ScreenNames } from '../../utils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ONBOARDING_COMPLETE_KEY = '@faceit:onboarding_complete';

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  highlight?: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: '◎',
    title: 'Welcome to FaceIt',
    description: 'Orient yourself to face any location in the world using your device compass.',
    highlight: 'any location',
  },
  {
    id: '2',
    icon: '🔍',
    title: 'Search Anywhere',
    description:
      'Search for landmarks, cities, addresses, or enter coordinates to find any destination.',
    highlight: 'any destination',
  },
  {
    id: '3',
    icon: '🧭',
    title: 'Face Your Direction',
    description:
      'Align with the compass to face any location. Perfect for prayer direction, travel, or exploration.',
    highlight: 'face any location',
  },
];

type Props = ScreenProps<'Onboarding'>;

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Track screen view on mount
  React.useEffect(() => {
    Analytics.logScreenView(ScreenNames.ONBOARDING);
  }, []);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleSkip = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      navigation.replace('Landing');
    } catch (error) {
      console.error('[OnboardingScreen] Failed to save onboarding state:', error);
      navigation.replace('Landing');
    }
  }, [navigation]);

  const handleGetStarted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      navigation.replace('Landing');
    } catch (error) {
      console.error('[OnboardingScreen] Failed to save onboarding state:', error);
      navigation.replace('Landing');
    }
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isFirstSlide = index === 0;

    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            {isFirstSlide ? (
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Text style={styles.iconLogo}>{item.icon}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          {!isLastSlide && (
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              accessibilityLabel="Skip onboarding"
              accessibilityRole="button"
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Carousel */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderSlide}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
          scrollEventThrottle={16}
        />

        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.indicator, index === currentIndex && styles.indicatorActive]}
            />
          ))}
        </View>
      </SafeAreaView>

      {/* Bottom Buttons - Outside SafeAreaView with manual padding */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {isLastSlide ? (
          <LinearGradient
            colors={[colors.gradient.start, colors.gradient.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.getStartedButton}
          >
            <TouchableOpacity
              style={styles.getStartedTouchable}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  headerSpacer: {
    width: 60,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.pill,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: spacing['3xl'],
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLogo: {
    fontSize: 64,
    color: colors.background.primary,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: 17,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
  indicatorActive: {
    backgroundColor: colors.accent.primary,
    width: 28,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  getStartedButton: {
    borderRadius: borderRadius.pill,
    height: 56,
  },
  getStartedTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background.primary,
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
