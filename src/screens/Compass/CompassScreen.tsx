/**
 * CompassScreen
 * Real-time compass view with sensor-based orientation
 * Design: Flighty-inspired dark UI with teal-cyan gradient accents
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ScreenProps } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LocationService } from '../../services/location/LocationService';
import { SensorService } from '../../services/sensors/SensorService';
import { MockSensorService } from '../../services/sensors/MockSensorService';
import { CalculationService } from '../../services/calculations/CalculationService';
import { storageService } from '../../services/storage';
import { Coordinates } from '../../types/location';
import { SensorAccuracy } from '../../types/sensors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.75, 300);
const ALIGNMENT_THRESHOLD = 5; // degrees

type Props = ScreenProps<'Compass'>;

export const CompassScreen: React.FC<Props> = ({ route, navigation }) => {
  const { location } = route.params;

  // Location state
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sensor state
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [sensorAccuracy, setSensorAccuracy] = useState<SensorAccuracy>(SensorAccuracy.MEDIUM);
  const [needsCalibration, setNeedsCalibration] = useState(false);

  // Compass calculations
  const [bearing, setBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isAligned, setIsAligned] = useState(false);

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);

  // Sensor state
  const [usingMockSensors, setUsingMockSensors] = useState(false);

  // Animated values
  const [needleRotation] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const locationService = new LocationService();
  const sensorService = new SensorService();
  const mockSensorService = new MockSensorService();

  // Load current location on mount
  useEffect(() => {
    loadCurrentLocation();
    return () => {
      // Cleanup location service if needed
    };
  }, []);

  // Start sensor tracking when location is available
  useEffect(() => {
    if (currentLocation) {
      startSensorTracking();
    }
    return () => {
      sensorService.stopHeadingTracking();
      mockSensorService.stopHeadingTracking();
    };
  }, [currentLocation]);

  // Check if location is favorited
  useEffect(() => {
    checkFavoriteStatus();
  }, [location]);

  // Update calculations when heading or location changes
  useEffect(() => {
    if (currentLocation) {
      updateCalculations();
    }
  }, [currentLocation, deviceHeading, location]);

  // Pulse animation when aligned
  useEffect(() => {
    if (isAligned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAligned]);

  const loadCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setLocationError(null);

      const coords = await locationService.getCurrentLocation();
      setCurrentLocation(coords);
    } catch (error: any) {
      console.error('[CompassScreen] Failed to get location:', error);
      setLocationError(error.message || 'Failed to get your location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const startSensorTracking = () => {
    try {
      sensorService.startHeadingTracking(
        data => {
          setDeviceHeading(data.heading);
          setSensorAccuracy(data.accuracy);
          setNeedsCalibration(data.needsCalibration);
        },
        error => {
          console.warn('[CompassScreen] Real sensors not available, using mock sensors:', error);
          setUsingMockSensors(true);
          mockSensorService.startHeadingTracking(data => {
            setDeviceHeading(data.heading);
            setSensorAccuracy(data.accuracy);
            setNeedsCalibration(data.needsCalibration);
          });
        },
      );
    } catch (error) {
      console.error('[CompassScreen] Failed to start sensor tracking:', error);
    }
  };

  const updateCalculations = () => {
    if (!currentLocation) return;

    const calculatedBearing = CalculationService.calculateBearing(
      currentLocation,
      location.coordinates,
    );
    setBearing(calculatedBearing);

    const calculatedDistance = CalculationService.calculateDistance(
      currentLocation,
      location.coordinates,
    );
    setDistance(calculatedDistance);

    const bearingDiff = Math.abs(calculatedBearing - deviceHeading);
    const normalizedDiff = Math.min(bearingDiff, 360 - bearingDiff);
    const aligned = normalizedDiff <= ALIGNMENT_THRESHOLD;
    setIsAligned(aligned);

    const targetRotation = calculatedBearing - deviceHeading;
    Animated.spring(needleRotation, {
      toValue: targetRotation,
      damping: 15,
      stiffness: 100,
      useNativeDriver: true,
    }).start();
  };

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
        }
      } else {
        await storageService.addFavorite(location);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('[CompassScreen] Failed to toggle favorite:', error);
    }
  };

  const handleRetry = useCallback(() => {
    loadCurrentLocation();
  }, []);

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
          {/* Compass */}
          <Animated.View
            style={[styles.compassContainer, { transform: [{ scale: isAligned ? pulseAnim : 1 }] }]}
          >
            {/* Compass Ring */}
            <View style={[styles.compassRing, isAligned && styles.compassRingAligned]}>
              {isAligned ? (
                <LinearGradient
                  colors={[colors.gradient.start, colors.gradient.end]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.compassGradientBorder}
                >
                  <View style={styles.compassInner}>{renderCompassContent()}</View>
                </LinearGradient>
              ) : (
                <View style={styles.compassBorder}>
                  <View style={styles.compassInner}>{renderCompassContent()}</View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Instruction */}
          <View style={styles.instructionContainer}>
            {isAligned ? (
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.alignedPill}
              >
                <Text style={styles.alignedIcon}>✓</Text>
                <Text style={styles.alignedText}>Aligned</Text>
              </LinearGradient>
            ) : (
              <View style={styles.instructionPill}>
                <Text style={styles.instructionText}>Rotate to align</Text>
              </View>
            )}
          </View>
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
          <View style={styles.calibrationBanner}>
            <Text style={styles.calibrationText}>Move device in figure-8 to calibrate</Text>
          </View>
        )}

        {/* Simulator Mode */}
        {usingMockSensors && (
          <View style={styles.simulatorBanner}>
            <Text style={styles.simulatorText}>Simulator Mode</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );

  function renderCompassContent() {
    return (
      <>
        {/* Cardinal Markers */}
        <Text style={[styles.cardinal, styles.cardinalN]}>N</Text>
        <Text style={[styles.cardinal, styles.cardinalE]}>E</Text>
        <Text style={[styles.cardinal, styles.cardinalS]}>S</Text>
        <Text style={[styles.cardinal, styles.cardinalW]}>W</Text>

        {/* Degree Ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
          <View
            key={deg}
            style={[
              styles.tick,
              {
                transform: [{ rotate: `${deg}deg` }, { translateY: -COMPASS_SIZE / 2 + 20 }],
              },
              deg % 90 === 0 ? styles.tickMajor : styles.tickMinor,
            ]}
          />
        ))}

        {/* Animated Needle */}
        <Animated.View
          style={[
            styles.needle,
            {
              transform: [
                {
                  rotate: needleRotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.gradient.start, colors.gradient.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.needleGradient}
          />
          <View style={styles.needleTip} />
        </Animated.View>

        {/* Center Display */}
        <View style={styles.centerDisplay}>
          <Text style={styles.bearingLarge}>{Math.round(bearing)}°</Text>
        </View>
      </>
    );
  }
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
  },
  compassContainer: {
    marginBottom: spacing['2xl'],
  },
  compassRing: {
    width: COMPASS_SIZE + 8,
    height: COMPASS_SIZE + 8,
    borderRadius: (COMPASS_SIZE + 8) / 2,
  },
  compassRingAligned: {
    // Handled by gradient
  },
  compassGradientBorder: {
    width: COMPASS_SIZE + 8,
    height: COMPASS_SIZE + 8,
    borderRadius: (COMPASS_SIZE + 8) / 2,
    padding: 4,
  },
  compassBorder: {
    width: COMPASS_SIZE + 8,
    height: COMPASS_SIZE + 8,
    borderRadius: (COMPASS_SIZE + 8) / 2,
    padding: 4,
    backgroundColor: colors.background.tertiary,
  },
  compassInner: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardinal: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  cardinalN: {
    top: 24,
    color: colors.accent.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardinalE: {
    right: 24,
  },
  cardinalS: {
    bottom: 24,
  },
  cardinalW: {
    left: 24,
  },
  tick: {
    position: 'absolute',
    width: 2,
    backgroundColor: colors.border.medium,
  },
  tickMajor: {
    height: 12,
    backgroundColor: colors.text.tertiary,
  },
  tickMinor: {
    height: 6,
  },
  needle: {
    position: 'absolute',
    width: 6,
    height: COMPASS_SIZE * 0.35,
    alignItems: 'center',
    top: COMPASS_SIZE * 0.15,
  },
  needleGradient: {
    width: 6,
    height: '85%',
    borderRadius: 3,
  },
  needleTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.gradient.end,
    marginTop: -2,
  },
  centerDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bearingLarge: {
    fontSize: 56,
    fontWeight: '200',
    color: colors.text.primary,
    letterSpacing: -2,
  },
  instructionContainer: {
    marginTop: spacing.lg,
  },
  instructionPill: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.pill,
  },
  instructionText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  alignedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
    gap: spacing.sm,
  },
  alignedIcon: {
    fontSize: 18,
    color: colors.background.primary,
    fontWeight: '700',
  },
  alignedText: {
    fontSize: 16,
    color: colors.background.primary,
    fontWeight: '600',
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
    backgroundColor: colors.warning.dark,
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
