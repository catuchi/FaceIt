/**
 * TextInput Component
 * Customizable text input with dark theme styling, focus states, and error handling
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
  onFocus,
  onBlur,
  testID,
  accessibilityLabel,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputHeight = (): number => {
    return theme.layout.inputHeight[size];
  };

  const getPadding = (): number => {
    const paddingMap: Record<Size, number> = {
      sm: theme.spacing.sm,
      md: theme.spacing.md,
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

  const getBorderColor = (): string => {
    if (error) return theme.colors.error.main;
    if (isFocused) return theme.colors.border.accent;
    return theme.colors.border.subtle;
  };

  const inputContainerStyle: ViewStyle = {
    height: getInputHeight(),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: getBorderColor(),
    paddingHorizontal: getPadding(),
    ...(isFocused && !error && theme.shadows.glow),
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: getFontSize(),
    color: theme.colors.text.primary,
    paddingLeft: leftIcon ? theme.spacing.sm : 0,
    paddingRight: rightIcon ? theme.spacing.sm : 0,
  };

  const labelStyle: TextStyle = {
    ...theme.typography.bodySmall,
    color: error ? theme.colors.error.main : theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const helperTextStyle: TextStyle = {
    ...theme.typography.caption,
    color: error ? theme.colors.error.main : theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
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
