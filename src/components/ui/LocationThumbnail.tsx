/**
 * LocationThumbnail Component
 * Circular thumbnail for location with gradient border when active
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@constants/theme';
import { primaryGradient } from '@utils/gradients';
import type { PressableComponentProps } from '@shared/types';

export interface LocationThumbnailProps extends PressableComponentProps {
  name: string;
  image?: ImageSourcePropType;
  active?: boolean;
  size?: number;
}

export const LocationThumbnail: React.FC<LocationThumbnailProps> = ({
  name,
  image,
  active = false,
  size = theme.layout.thumbnail.small,
  onPress,
  style,
  testID,
  accessibilityLabel,
}) => {
  const containerStyle: ViewStyle = {
    alignItems: 'center',
    width: size + theme.spacing.md * 2,
  };

  const imageContainerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  const renderImageContainer = () => {
    const content = (
      <View style={imageContainerStyle}>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholder}>{name.charAt(0).toUpperCase()}</Text>
        )}
      </View>
    );

    if (active) {
      const gradientBorderStyle: ViewStyle = {
        ...imageContainerStyle,
        padding: 2,
      };

      const innerImageStyle: ViewStyle = {
        ...imageContainerStyle,
        width: size - 4,
        height: size - 4,
      };

      return (
        <LinearGradient
          colors={primaryGradient.colors}
          start={primaryGradient.start}
          end={primaryGradient.end}
          locations={primaryGradient.locations}
          style={gradientBorderStyle}
        >
          <View style={innerImageStyle}>
            {image ? (
              <Image source={image} style={styles.image} resizeMode="cover" />
            ) : (
              <Text style={styles.placeholder}>{name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
        </LinearGradient>
      );
    }

    return content;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[containerStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || name}
      accessibilityRole="button"
    >
      {renderImageContainer()}
      <Text style={styles.label} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  label: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: theme.layout.thumbnail.small + theme.spacing.md * 2,
  },
});
