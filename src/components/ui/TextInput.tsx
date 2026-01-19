/**
 * TextInput Component
 * Flighty-inspired text input with dark theme styling, focus states, and error handling
 */

import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@constants/theme';
import type { BaseComponentProps, Size } from '@shared/types';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'>, BaseComponentProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: Size;
  containerStyle?: ViewStyle;
  pill?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  containerStyle,
  style,
  pill = false,
  onFocus,
  onBlur,
  testID,
  accessibilityLabel,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputHeight = (): number => {
    const heightMap: Record<Size, number> = {
      sm: 40,
      md: 52,
      lg: 56,
    };
    return heightMap[size];
  };

  const getPadding = (): number => {
    const paddingMap: Record<Size, number> = {
      sm: theme.spacing.md,
      md: theme.spacing.lg,
      lg: theme.spacing.lg,
    };
    return paddingMap[size];
  };

  const getFontSize = (): number => {
    const sizeMap: Record<Size, number> = {
      sm: theme.typography.fontSize.sm,
      md: theme.typography.fontSize.base,
      lg: theme.typography.fontSize.lg,
    };
    return sizeMap[size];
  };

  const getBorderRadius = (): number => {
    if (pill) return theme.borderRadius.pill;
    return theme.borderRadius.lg;
  };

  const getBorderColor = (): string => {
    if (error) return theme.colors.error.main;
    if (isFocused) return theme.colors.accent.primary;
    return 'transparent';
  };

  const inputContainerStyle: ViewStyle = {
    height: getInputHeight(),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: getBorderRadius(),
    borderWidth: isFocused || error ? 2 : 0,
    borderColor: getBorderColor(),
    paddingHorizontal: getPadding(),
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: getFontSize(),
    color: theme.colors.text.primary,
    paddingLeft: leftIcon ? theme.spacing.sm : 0,
    paddingRight: rightIcon ? theme.spacing.sm : 0,
    paddingVertical: 0,
  };

  const labelStyle: TextStyle = {
    fontSize: 13,
    fontWeight: '600',
    color: error ? theme.colors.error.main : theme.colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  };

  const helperTextStyle: TextStyle = {
    fontSize: 13,
    color: error ? theme.colors.error.main : theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <View style={inputContainerStyle}>
        {leftIcon}
        <RNTextInput
          style={[inputStyle, style]}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          accessibilityLabel={accessibilityLabel || label}
          {...rest}
        />
        {rightIcon}
      </View>
      {(error || helperText) && <Text style={helperTextStyle}>{error || helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
