/**
 * CalibrationGuide Component
 * Shows instructions for calibrating the device compass
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BottomSheet } from '@components/ui';
import { Button } from '@components/ui';
import { theme } from '@constants/theme';

export interface CalibrationGuideProps {
  visible: boolean;
  onDismiss: () => void;
  autoHide?: boolean;
  isCalibrated?: boolean;
}

export const CalibrationGuide: React.FC<CalibrationGuideProps> = ({
  visible,
  onDismiss,
  autoHide = true,
  isCalibrated = false,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start figure-8 animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [visible, rotateAnim]);

  useEffect(() => {
    if (autoHide && isCalibrated && visible) {
      // Auto-dismiss when calibrated
      const timer = setTimeout(() => {
        onDismiss();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [autoHide, isCalibrated, visible, onDismiss]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <BottomSheet visible={visible} onClose={onDismiss} snapPoint={0.6}>
      <View style={styles.container}>
        {isCalibrated ? (
          <>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.title}>Calibrated!</Text>
            <Text style={styles.description}>Your compass is now calibrated and ready to use.</Text>
          </>
        ) : (
          <>
            <View style={styles.animationContainer}>
              <Animated.View style={[styles.phoneIcon, { transform: [{ rotate }] }]}>
                <Text style={styles.phoneEmoji}>📱</Text>
              </Animated.View>
            </View>

            <Text style={styles.title}>Calibrate Compass</Text>
            <Text style={styles.description}>
              Your compass needs calibration for accurate directions.
            </Text>

            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Hold your device away from metal objects and electronics
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.instructionText}>
                  Move your device in a figure-8 pattern in the air
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Repeat the motion until the compass is calibrated
                </Text>
              </View>
            </View>

            <Text style={styles.tip}>
              💡 Tip: Calibration usually takes 10-20 seconds of continuous movement
            </Text>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button
            variant="ghost"
            onPress={onDismiss}
            style={styles.button}
            testID="calibration-dismiss-button"
          >
            {isCalibrated ? 'Done' : 'Skip for Now'}
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
  animationContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  phoneIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneEmoji: {
    fontSize: 64,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
    color: theme.colors.success.main,
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
  instructionsList: {
    marginBottom: theme.spacing.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.accent.primary,
    color: theme.colors.background.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    lineHeight: 28,
    marginRight: theme.spacing.md,
  },
  instructionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
    marginTop: 2,
  },
  tip: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background.tertiary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
});
