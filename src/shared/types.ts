/**
 * Common component types and interfaces
 */

import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle, StyleProp, GestureResponderEvent } from 'react-native';

export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
export type SemanticColor = 'success' | 'error' | 'warning' | 'info';

export interface BaseComponentProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export interface PressableComponentProps extends BaseComponentProps {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export interface ChildrenProps {
  children?: ReactNode;
}

export interface IconProps {
  name?: string;
  size?: number;
  color?: string;
}

export type CommonStyles = {
  view?: StyleProp<ViewStyle>;
  text?: StyleProp<TextStyle>;
  image?: StyleProp<ImageStyle>;
};
