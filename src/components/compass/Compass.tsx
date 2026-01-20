/**
 * Compass Component
 * Reusable compass visual with smooth 60fps Reanimated animations
 * Design: Flighty-inspired dark UI with teal-cyan gradient accents
 */

import React, { useEffect, useMemo, memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '@constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.75, 280);

// Static tick positions - defined outside component to avoid recreation
const TICK_DEGREES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;

export interface CompassProps {
  /** Target bearing in degrees (0-360) */
  bearing: number;
  /** Current device heading in degrees (0-360) */
  deviceHeading: number;
  /** Whether the compass is aligned with the target (within threshold) */
  isAligned: boolean;
  /** Sensor accuracy level */
  accuracy?: 'low' | 'medium' | 'high';
  /** Size of the compass in points (default: 280) */
  size?: number;
  /** Show center bearing display */
  showBearing?: boolean;
  /** Show cardinal direction label */
  showCardinal?: boolean;
}

/**
 * Convert bearing to cardinal direction
 */
const bearingToCardinal = (bearing: number): string => {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
};

/**
 * Normalize angle to handle 360° wraparound for smooth animation
 */
const normalizeAngle = (angle: number): number => {
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
};

const CompassComponent: React.FC<CompassProps> = ({
  bearing,
  deviceHeading,
  isAligned,
  accuracy: _accuracy = 'medium',
  size = DEFAULT_COMPASS_SIZE,
  showBearing = true,
  showCardinal = false,
}) => {
  // Shared value for needle rotation
  const rotation = useSharedValue(0);

  // Update rotation when bearing or heading changes
  useEffect(() => {
    // Calculate target rotation (needle points to bearing relative to device heading)
    const targetRotation = normalizeAngle(bearing - deviceHeading);

    // Animate to new rotation with spring physics
    rotation.value = withSpring(targetRotation, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
  }, [bearing, deviceHeading, rotation]);

  // Animated style for needle rotation
  const needleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // Memoize calculated sizes to avoid recalculation on every render
  const sizes = useMemo(
    () => ({
      compassSize: size,
      borderWidth: 4,
      outerSize: size + 4 * 2,
      needleLength: size * 0.35,
      needleWidth: 6,
      tickOffset: size / 2 - 20,
    }),
    [size],
  );

  // Destructure memoized sizes
  const { compassSize, borderWidth, outerSize, needleLength, needleWidth, tickOffset } = sizes;

  const renderCompassFace = () => (
    <View
      style={[
        styles.compassInner,
        { width: compassSize, height: compassSize, borderRadius: compassSize / 2 },
      ]}
    >
      {/* Cardinal Markers */}
      <Text style={[styles.cardinal, styles.cardinalN, { top: 24 }]}>N</Text>
      <Text style={[styles.cardinal, styles.cardinalE, { right: 24 }]}>E</Text>
      <Text style={[styles.cardinal, styles.cardinalS, { bottom: 24 }]}>S</Text>
      <Text style={[styles.cardinal, styles.cardinalW, { left: 24 }]}>W</Text>

      {/* Degree Ticks */}
      {TICK_DEGREES.map(deg => (
        <View
          key={deg}
          style={[
            styles.tick,
            {
              transform: [{ rotate: `${deg}deg` }, { translateY: -tickOffset }],
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
            width: needleWidth,
            height: needleLength,
            top: compassSize * 0.15,
          },
          needleAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.needleGradient, { width: needleWidth, borderRadius: needleWidth / 2 }]}
        />
        <View
          style={[
            styles.needleTip,
            { borderLeftWidth: needleWidth, borderRightWidth: needleWidth },
          ]}
        />
      </Animated.View>

      {/* Center Display */}
      {showBearing && (
        <View style={styles.centerDisplay}>
          <Text style={styles.bearingLarge}>{Math.round(bearing)}°</Text>
          {showCardinal && <Text style={styles.cardinalLabel}>{bearingToCardinal(bearing)}</Text>}
        </View>
      )}
    </View>
  );

  return (
    <View
      style={[styles.compassContainer, { width: outerSize, height: outerSize }]}
      accessible={true}
      accessibilityLabel={`Bearing ${Math.round(bearing)} degrees ${bearingToCardinal(bearing)}. ${isAligned ? 'Aligned with target' : 'Rotate to align'}`}
      accessibilityRole="image"
      accessibilityHint="Compass showing direction to target location"
    >
      {isAligned ? (
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.compassGradientBorder,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              padding: borderWidth,
            },
          ]}
        >
          {renderCompassFace()}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.compassBorder,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              padding: borderWidth,
            },
          ]}
        >
          {renderCompassFace()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassGradientBorder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassBorder: {
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassInner: {
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
    color: colors.accent.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardinalE: {},
  cardinalS: {},
  cardinalW: {},
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
    alignItems: 'center',
  },
  needleGradient: {
    height: '85%',
  },
  needleTip: {
    width: 0,
    height: 0,
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
  cardinalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});

// Memoize component to prevent unnecessary re-renders
export const Compass = memo(CompassComponent);

export default Compass;
