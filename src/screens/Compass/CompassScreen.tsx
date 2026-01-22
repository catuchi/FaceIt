/**
 * CompassScreen
 * Real-time compass view with sensor-based orientation
 * Design: Flighty-inspired dark UI with teal-cyan gradient accents
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ScreenProps } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Compass, CalibrationGuide } from '../../components/compass';
import { useCompass } from '../../hooks';
import { storageService } from '../../services/storage';
import { CalculationService } from '../../services/calculations/CalculationService';
import { Analytics, ScreenNames } from '../../utils';

type Props = ScreenProps<'Compass'>;

export const CompassScreen: React.FC<Props> = ({ route, navigation }) => {
  const { location } = route.params;

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);

  // Calibration guide state
  const [showCalibrationGuide, setShowCalibrationGuide] = useState(false);

  // Pulse animation for aligned state
  const pulseScale = useSharedValue(1);

  // Track if we've already logged alignment success (to avoid duplicate logs)
  const hasLoggedAlignment = React.useRef(false);

  // Use the compass hook
  const {
    bearing,
    deviceHeading,
    isAligned,
    needsCalibration,
    distance,
    currentLocation,
    isLoadingLocation,
    locationError,
    isSimulatorMode,
    retryLocation,
  } = useCompass({
    targetLocation: location.coordinates,
    onAlignmentChange: aligned => {
      if (aligned) {
        // Start pulse animation when aligned
        pulseScale.value = withRepeat(
          withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
          -1,
          false,
        );
        // Log alignment success (only once per session)
        if (!hasLoggedAlignment.current) {
          hasLoggedAlignment.current = true;
          Analytics.logAlignmentSuccess({
            locationName: location.name,
            bearing,
            distance,
          });
        }
      } else {
        // Stop pulse animation
        pulseScale.value = withTiming(1, { duration: 200 });
      }
    },
  });

  // Animated style for pulse effect
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Track screen view and compass view
  useEffect(() => {
    Analytics.logScreenView(ScreenNames.COMPASS);
    Analytics.logCompassView({
      locationName: location.name,
      bearing,
      distance,
    });
  }, []);

  // Check if location is favorited
  useEffect(() => {
    checkFavoriteStatus();
  }, [location]);

  const checkFavoriteStatus = async () => {
    try {
      const favorited = await storageService.isFavorited(location.coordinates);
      setIsFavorite(favorited);
    } catch (error) {
      console.error('[CompassScreen] Failed to check favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        const favorites = await storageService.getFavorites();
        const favorite = favorites.find(
          f =>
            f.coordinates.latitude === location.coordinates.latitude &&
            f.coordinates.longitude === location.coordinates.longitude,
        );
        if (favorite) {
          await storageService.deleteFavorite(favorite.id);
          setIsFavorite(false);
          Analytics.logFavoriteRemoved({
            locationName: location.name,
            locationId: favorite.id,
          });
        }
      } else {
        await storageService.addFavorite(location);
        setIsFavorite(true);
        Analytics.logFavoriteAdded({
          locationName: location.name,
          locationId: location.id,
        });
      }
    } catch (error) {
      console.error('[CompassScreen] Failed to toggle favorite:', error);
    }
  };

  const handleRetry = useCallback(() => {
    retryLocation();
  }, [retryLocation]);

  const formatDistance = (meters: number): string => {
    return CalculationService.formatDistance(meters);
  };

  const getCardinalDirection = (deg: number): string => {
    return CalculationService.getCardinalDirection(deg);
  };

  // Loading state
  if (isLoadingLocation) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <Loading message="Getting your location..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (locationError || !currentLocation) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <ErrorMessage
          type="location"
          title="Location Unavailable"
          message={locationError || 'Unable to determine your location'}
          actionLabel="Retry"
          onAction={handleRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <View style={styles.headerButtonInner}>
              <Text style={styles.headerButtonIcon}>{'←'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={styles.headerButton}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <View style={[styles.headerButtonInner, isFavorite && styles.headerButtonActive]}>
              <Text style={[styles.headerButtonIcon, isFavorite && styles.headerButtonIconActive]}>
                {isFavorite ? '★' : '☆'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Compass with pulse animation */}
          <Animated.View style={[styles.compassContainer, pulseAnimatedStyle]}>
            <Compass
              bearing={bearing}
              deviceHeading={deviceHeading}
              isAligned={isAligned}
              showBearing={true}
              showCardinal={false}
            />
          </Animated.View>

          {/* Status Button */}
          {isAligned ? (
            <View style={styles.alignedButton}>
              <Text style={styles.alignedButtonText}>✓ Aligned</Text>
            </View>
          ) : (
            <View style={styles.rotateButton}>
              <Text style={styles.rotateButtonText}>Rotate to align</Text>
            </View>
          )}
        </View>

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          {/* Location Info */}
          <View style={styles.locationSection}>
            <Text style={styles.locationName} numberOfLines={1}>
              {location.name}
            </Text>
            {location.address && (
              <Text style={styles.locationAddress} numberOfLines={1}>
                {location.address}
              </Text>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{formatDistance(distance)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>BEARING</Text>
              <Text style={styles.statValue}>{Math.round(bearing)}°</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DIRECTION</Text>
              <Text style={styles.statValue}>{getCardinalDirection(bearing)}</Text>
            </View>
          </View>

          {/* Coordinates */}
          <View style={styles.coordsRow}>
            <View style={styles.coordPill}>
              <Text style={styles.coordText}>{location.coordinates.latitude.toFixed(4)}°</Text>
            </View>
            <View style={styles.coordPill}>
              <Text style={styles.coordText}>{location.coordinates.longitude.toFixed(4)}°</Text>
            </View>
          </View>
        </View>

        {/* Calibration Warning */}
        {needsCalibration && (
          <TouchableOpacity
            onPress={() => setShowCalibrationGuide(true)}
            style={styles.calibrationBanner}
            activeOpacity={0.8}
            accessibilityLabel="Compass needs calibration. Tap for instructions."
            accessibilityRole="button"
          >
            <Text style={styles.calibrationText}>⚠️ Tap for calibration guide</Text>
          </TouchableOpacity>
        )}

        {/* Calibration Guide BottomSheet */}
        <CalibrationGuide
          visible={showCalibrationGuide}
          onDismiss={() => setShowCalibrationGuide(false)}
          autoHide={true}
          isCalibrated={!needsCalibration}
        />

        {/* Simulator Mode Indicator */}
        {isSimulatorMode && (
          <View style={styles.simulatorBanner}>
            <Text style={styles.simulatorText}>Simulator Mode</Text>
          </View>
        )}
      </SafeAreaView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  headerButtonIcon: {
    fontSize: 22,
    color: colors.text.primary,
  },
  headerButtonIconActive: {
    color: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 180,
  },
  compassContainer: {
    marginBottom: spacing.md,
  },
  alignedButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 24,
  },
  alignedButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.background.primary,
  },
  rotateButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 24,
  },
  rotateButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  bottomCard: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  locationSection: {
    marginBottom: spacing.xl,
  },
  locationName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.medium,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coordPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
  },
  coordText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    fontFamily: 'Menlo',
  },
  calibrationBanner: {
    position: 'absolute',
    top: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.warning?.dark || colors.background.tertiary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  calibrationText: {
    fontSize: 13,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  simulatorBanner: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
  },
  simulatorText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});
