/**
 * Card Component
 * Flighty-inspired container with variants, padding options, and gradient border support
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@constants/theme';
import type { PressableComponentProps, ChildrenProps } from '@shared/types';

export type CardVariant = 'default' | 'elevated' | 'active' | 'subtle';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends PressableComponentProps, ChildrenProps {
  variant?: CardVariant;
  padding?: CardPadding;
  gradientBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  gradientBorder = false,
  onPress,
  onLongPress,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const getPadding = (): number => {
    const paddingMap: Record<CardPadding, number> = {
      none: 0,
      sm: theme.spacing.md,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
    };
    return paddingMap[padding];
  };

  const getBackgroundColor = (): string => {
    if (variant === 'elevated') return theme.colors.background.secondary;
    if (variant === 'active') return theme.colors.background.tertiary;
    if (variant === 'subtle') return theme.colors.background.secondary + '80';
    return theme.colors.background.secondary;
  };

  const getShadow = () => {
    if (variant === 'elevated') return theme.shadows.md;
    return theme.shadows.none;
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: theme.borderRadius.lg,
    padding: getPadding(),
    ...getShadow(),
  };

  // If the card is pressable, wrap in TouchableOpacity
  if (onPress || onLongPress) {
    if (gradientBorder && variant === 'active') {
      return (
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled}
          activeOpacity={0.7}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={[cardStyle, styles.gradientInner, style]}>{children}</View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[cardStyle, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Static card without press handlers
  if (gradientBorder && variant === 'active') {
    return (
      <LinearGradient
        colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      >
        <View
          style={[cardStyle, styles.gradientInner, style]}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
        >
          {children}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[cardStyle, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: theme.borderRadius.lg + 2,
    padding: 2,
  },
  gradientInner: {
    borderRadius: theme.borderRadius.lg,
  },
});
