/**
 * LocationPermissionModal Component
 * Modal explaining why location permission is needed before requesting it
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheet } from '@components/ui';
import { Button } from '@components/ui';
import { theme } from '@constants/theme';

export interface LocationPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onDismiss: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  onRequestPermission,
  onDismiss,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onDismiss} snapPoint={0.5}>
      <View style={styles.container}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Location Access</Text>
        <Text style={styles.description}>
          FaceIt needs access to your location to calculate the direction and distance to your
          selected destination in real-time.
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Calculate accurate bearing to your destination</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Show real-time distance updates</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>Provide compass-based directional guidance</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Your location data is only used for navigation and is never stored or shared.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={onRequestPermission}
            style={styles.primaryButton}
            testID="request-permission-button"
          >
            Continue
          </Button>
          <Button
            variant="ghost"
            onPress={onDismiss}
            style={styles.secondaryButton}
            testID="dismiss-permission-button"
          >
            Not Now
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing['2xl'],
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.xl,
  },
  featureList: {
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  featureBullet: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.accent.primary,
    marginRight: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  featureText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  note: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xl,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
