/**
 * Button Component
 * Customizable button with gradient support, loading states, and multiple variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@constants/theme';
import { primaryGradient } from '@utils/gradients';
import type { PressableComponentProps, ChildrenProps, Size, Variant } from '@shared/types';

export interface ButtonProps extends PressableComponentProps, ChildrenProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  gradient = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  const getButtonHeight = (): number => {
    return theme.layout.buttonHeight[size];
  };

  const getButtonPadding = (): number => {
    const paddingMap: Record<Size, number> = {
      sm: theme.spacing.md,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
    };
    return paddingMap[size];
  };

  const getTextSize = (): number => {
    const sizeMap: Record<Size, number> = {
      sm: theme.typography.fontSize.sm,
      md: theme.typography.fontSize.base,
      lg: theme.typography.fontSize.lg,
    };
    return sizeMap[size];
  };

  const getBackgroundColor = (): string => {
    if (variant === 'primary') return theme.colors.accent.primary;
    if (variant === 'secondary') return theme.colors.background.tertiary;
    return 'transparent';
  };

  const getBorderColor = (): string => {
    if (variant === 'outline') return theme.colors.border.accent;
    return 'transparent';
  };

  const getTextColor = (): string => {
    if (variant === 'primary') return theme.colors.background.primary;
    if (variant === 'ghost' || variant === 'text') return theme.colors.accent.primary;
    return theme.colors.text.primary;
  };

  const buttonStyle: ViewStyle = {
    height: getButtonHeight(),
    paddingHorizontal: getButtonPadding(),
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: getBorderColor(),
    backgroundColor: gradient ? 'transparent' : getBackgroundColor(),
    opacity: isDisabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const textStyle: TextStyle = {
    color: getTextColor(),
    fontSize: getTextSize(),
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: leftIcon ? theme.spacing.sm : 0,
    marginRight: rightIcon ? theme.spacing.sm : 0,
  };

  const renderContent = () => (
    <>
      {loading && <ActivityIndicator size="small" color={getTextColor()} style={styles.loader} />}
      {!loading && leftIcon}
      {typeof children === 'string' ? <Text style={textStyle}>{children}</Text> : children}
      {!loading && rightIcon}
    </>
  );

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[buttonStyle, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        <LinearGradient
          colors={primaryGradient.colors}
          start={primaryGradient.start}
          end={primaryGradient.end}
          locations={primaryGradient.locations}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[buttonStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginRight: theme.spacing.sm,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
});
