/**
 * FaceIt Design System - Theme Configuration
 * Dark theme with gradient accents
 */

export const colors = {
  // Background colors
  background: {
    primary: '#0F0F0F',
    secondary: '#1A1A1A',
    tertiary: '#242424',
  },

  // Gradient colors
  gradient: {
    start: '#00D9B8',
    middle: '#00E8C3',
    end: '#00FFD1',
  },

  // Accent colors
  accent: {
    primary: '#00E8C3',
    gold: '#FFD700',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tertiary: '#A8A8A8',
    disabled: '#666666',
  },

  // Border colors
  border: {
    subtle: '#2A2A2A',
    medium: '#3A3A3A',
    accent: '#00E8C3',
  },

  // Semantic colors
  error: {
    main: '#EF4444',
    light: '#FCA5A5',
    dark: '#DC2626',
  },
  success: {
    main: '#10B981',
    light: '#6EE7B7',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
  },
  info: {
    main: '#3B82F6',
    light: '#93C5FD',
    dark: '#2563EB',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    medium: 'rgba(0, 0, 0, 0.7)',
    dark: 'rgba(0, 0, 0, 0.9)',
  },
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    ultraLight: '100' as const,
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
    '7xl': 64,
    '8xl': 72,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Specific text styles
  displayLarge: {
    fontSize: 72,
    fontWeight: '100' as const,
    lineHeight: 80,
  },
  heading1: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  compassDistance: {
    fontSize: 40,
    fontWeight: '100' as const,
    lineHeight: 48,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
};

export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 100,
  circle: 9999,
};

export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 12,
  },
  // Glow effects for dark theme
  glow: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  glowStrong: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
};

export const animation = {
  // Durations (in milliseconds)
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },

  // Easing functions (for Reanimated)
  easing: {
    linear: 'linear' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },

  // Spring configurations (for Reanimated)
  spring: {
    gentle: {
      damping: 15,
      stiffness: 100,
    },
    bouncy: {
      damping: 10,
      stiffness: 150,
    },
    stiff: {
      damping: 20,
      stiffness: 200,
    },
  },
};

export const layout = {
  // Screen padding
  screenPadding: {
    horizontal: spacing.xl,
    vertical: spacing['2xl'],
  },

  // Component sizes
  buttonHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },

  inputHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },

  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },

  // Compass specific
  compass: {
    size: 280,
    borderWidth: 3,
    needleLength: 100,
    needleWidth: 4,
  },

  // Thumbnail sizes
  thumbnail: {
    small: 56,
    medium: 80,
    large: 120,
  },
};

// Export complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  layout,
};

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Animation = typeof animation;
export type Layout = typeof layout;
