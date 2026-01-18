/**
 * ErrorMessage Component
 * Displays error messages with icons and action buttons
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@constants/theme';
import { Button } from '@components/ui';

export type ErrorType = 'network' | 'location' | 'sensor' | 'general';

export interface ErrorMessageProps {
  type?: ErrorType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'general',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const getErrorIcon = () => {
    // Placeholder - will be replaced with actual icons later
    const iconMap: Record<ErrorType, string> = {
      network: '📡',
      location: '📍',
      sensor: '🧭',
      general: '⚠️',
    };
    return iconMap[type];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{getErrorIcon()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onPress={onAction}
          style={styles.button}
          testID="error-action-button"
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['3xl'],
    backgroundColor: theme.colors.background.primary,
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing['2xl'],
  },
  button: {
    marginTop: theme.spacing.md,
    minWidth: 200,
  },
});
