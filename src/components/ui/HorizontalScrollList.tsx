/**
 * HorizontalScrollList Component
 * Horizontal scrollable list with configurable spacing and snap behavior
 */

import React from 'react';
import { ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@constants/theme';
import type { ChildrenProps } from '@shared/types';

export interface HorizontalScrollListProps extends ChildrenProps {
  itemSpacing?: number;
  contentPadding?: number;
  snapToItem?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const HorizontalScrollList: React.FC<HorizontalScrollListProps> = ({
  children,
  itemSpacing = theme.spacing.md,
  contentPadding = theme.spacing.xl,
  snapToItem = false,
  style,
  testID,
}) => {
  const contentContainerStyle: ViewStyle = {
    paddingHorizontal: contentPadding,
    gap: itemSpacing,
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      snapToInterval={snapToItem ? undefined : undefined}
      snapToAlignment={snapToItem ? 'center' : undefined}
      decelerationRate={snapToItem ? 'fast' : 'normal'}
      style={[styles.scrollView, style]}
      testID={testID}
      accessibilityRole="list"
      accessible={true}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
});
