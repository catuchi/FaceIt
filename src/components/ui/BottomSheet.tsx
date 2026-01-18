/**
 * BottomSheet Component
 * Modal that slides up from the bottom with backdrop
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { theme } from '@constants/theme';
import type { ChildrenProps } from '@shared/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps extends ChildrenProps {
  visible: boolean;
  onClose: () => void;
  snapPoint?: number; // Height percentage (0-1)
  showHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  snapPoint = 0.5,
  showHandle = true,
  children,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: theme.animation.spring.gentle.damping,
          stiffness: theme.animation.spring.gentle.stiffness,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: theme.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: theme.animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: theme.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const sheetHeight = SCREEN_HEIGHT * snapPoint;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableOpacity>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay.medium,
  },
  sheet: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Safe area for iOS
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.border.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
});
