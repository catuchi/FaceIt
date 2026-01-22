/**
 * Compass Component
 * Clean, modern compass with diamond needle design
 * Inspired by minimalist compass UI with smooth 60fps animations
 */

import React, { useEffect, useMemo, memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedProps,
} from 'react-native-reanimated';
import { colors } from '@constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.7, 260);

const AnimatedG = Animated.createAnimatedComponent(G);

export interface CompassProps {
  /** Target bearing in degrees (0-360) */
  bearing: number;
  /** Current device heading in degrees (0-360) */
  deviceHeading: number;
  /** Whether the compass is aligned with the target (within threshold) */
  isAligned: boolean;
  /** Sensor accuracy level */
  accuracy?: 'low' | 'medium' | 'high';
  /** Size of the compass in points (default: 260) */
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
    const targetRotation = normalizeAngle(bearing - deviceHeading);
    rotation.value = withSpring(targetRotation, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
  }, [bearing, deviceHeading, rotation]);

  // Animated style for needle rotation (for the View wrapper)
  const needleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Memoize calculated sizes
  const sizes = useMemo(() => {
    const center = size / 2;
    const radius = size / 2 - 8;
    return {
      size,
      center,
      radius,
      tickOuterRadius: radius - 4,
      tickInnerRadiusMajor: radius - 16,
      tickInnerRadiusMinor: radius - 10,
      needleLength: radius * 0.65,
      needleWidth: 12,
    };
  }, [size]);

  const {
    center,
    radius,
    tickOuterRadius,
    tickInnerRadiusMajor,
    tickInnerRadiusMinor,
    needleLength,
    needleWidth,
  } = sizes;

  // Generate tick marks
  const ticks = useMemo(() => {
    const tickElements = [];
    for (let i = 0; i < 72; i++) {
      const angle = (i * 5 * Math.PI) / 180;
      const isMajor = i % 6 === 0; // Every 30 degrees
      const isCardinal = i % 18 === 0; // Every 90 degrees
      const innerRadius = isMajor ? tickInnerRadiusMajor : tickInnerRadiusMinor;

      const x1 = center + tickOuterRadius * Math.sin(angle);
      const y1 = center - tickOuterRadius * Math.cos(angle);
      const x2 = center + innerRadius * Math.sin(angle);
      const y2 = center - innerRadius * Math.cos(angle);

      tickElements.push(
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={
            isCardinal
              ? colors.text.secondary
              : isMajor
                ? colors.text.tertiary
                : colors.border.medium
          }
          strokeWidth={isCardinal ? 2 : isMajor ? 1.5 : 1}
          strokeLinecap="round"
        />,
      );
    }
    return tickElements;
  }, [center, tickOuterRadius, tickInnerRadiusMajor, tickInnerRadiusMinor]);

  // Diamond needle path - pointing up
  const needlePath = useMemo(() => {
    const tipY = -needleLength;
    const baseY = needleLength * 0.3;
    const width = needleWidth / 2;

    return `M 0 ${tipY} L ${width} 0 L 0 ${baseY} L -${width} 0 Z`;
  }, [needleLength, needleWidth]);

  // Bottom needle path (opposite direction, lighter color)
  const needleBottomPath = useMemo(() => {
    const tipY = needleLength * 0.8;
    const baseY = needleLength * 0.1;
    const width = needleWidth / 2 - 2;

    return `M 0 ${tipY} L ${width} ${baseY} L 0 0 L -${width} ${baseY} Z`;
  }, [needleLength, needleWidth]);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible={true}
      accessibilityLabel={`Bearing ${Math.round(bearing)} degrees ${bearingToCardinal(bearing)}. ${isAligned ? 'Aligned with target' : 'Rotate to align'}`}
      accessibilityRole="image"
    >
      {/* SVG Compass Face */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={colors.background.secondary}
          stroke={isAligned ? colors.accent.primary : colors.background.tertiary}
          strokeWidth={isAligned ? 3 : 2}
        />

        {/* Inner subtle ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius - 20}
          fill="none"
          stroke={colors.border.light}
          strokeWidth={0.5}
        />

        {/* Tick marks */}
        {ticks}

        {/* N marker */}
        <Circle cx={center} cy={center - radius + 28} r={4} fill={colors.accent.primary} />
      </Svg>

      {/* Animated Needle Layer */}
      <Animated.View
        style={[styles.needleContainer, { width: size, height: size }, needleAnimatedStyle]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G transform={`translate(${center}, ${center})`}>
            {/* Bottom needle (gray) */}
            <Path d={needleBottomPath} fill={colors.text.tertiary} />

            {/* Top needle (gradient effect via two overlapping paths) */}
            <Path d={needlePath} fill={colors.gradient.start} />

            {/* Gradient overlay for depth */}
            <Path
              d={`M 0 ${-needleLength} L ${needleWidth / 2} 0 L 0 ${needleLength * 0.15} Z`}
              fill={colors.gradient.end}
              opacity={0.6}
            />

            {/* Center circle */}
            <Circle
              cx={0}
              cy={0}
              r={8}
              fill={colors.background.primary}
              stroke={colors.accent.primary}
              strokeWidth={2}
            />

            {/* Inner dot */}
            <Circle cx={0} cy={0} r={3} fill={colors.accent.primary} />
          </G>
        </Svg>
      </Animated.View>

      {/* Bearing Display */}
      {showBearing && (
        <View style={styles.bearingContainer}>
          <Text style={styles.bearingText}>{Math.round(bearing)}°</Text>
          {showCardinal && <Text style={styles.cardinalText}>{bearingToCardinal(bearing)}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bearingContainer: {
    position: 'absolute',
    bottom: '22%',
    alignItems: 'center',
  },
  bearingText: {
    fontSize: 42,
    fontWeight: '200',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  cardinalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export const Compass = memo(CompassComponent);
export default Compass;
