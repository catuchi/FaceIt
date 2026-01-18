/**
 * Card Component
 * Container component with variants, padding options, and gradient border support
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@constants/theme';
import { primaryGradient } from '@utils/gradients';
import type { PressableComponentProps, ChildrenProps } from '@shared/types';

export type CardVariant = 'default' | 'elevated' | 'active';
export type CardPadding = 'sm' | 'md' | 'lg';

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
      sm: theme.spacing.md,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
    };
    return paddingMap[padding];
  };

  const getBackgroundColor = (): string => {
    if (variant === 'elevated') return theme.colors.background.secondary;
    if (variant === 'active') return theme.colors.background.tertiary;
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
    const content = <View style={[cardStyle, style]}>{children}</View>;

    if (gradientBorder && variant === 'active') {
      return (
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled}
          activeOpacity={0.8}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={primaryGradient.colors}
            start={primaryGradient.start}
            end={primaryGradient.end}
            locations={primaryGradient.locations}
            style={styles.gradientBorder}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.8}
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
        colors={primaryGradient.colors}
        start={primaryGradient.start}
        end={primaryGradient.end}
        locations={primaryGradient.locations}
        style={styles.gradientBorder}
      >
        <View style={[cardStyle, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
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
    borderRadius: theme.borderRadius.lg,
    padding: 2, // Border width
  },
});
