/**
 * Gradient utility functions
 * Helper functions for creating consistent gradients throughout the app
 */

import { colors } from '@constants/theme';

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial';

export interface GradientConfig {
  colors: string[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

/**
 * Primary gradient (teal/cyan)
 */
export const primaryGradient: GradientConfig = {
  colors: [colors.gradient.start, colors.gradient.middle, colors.gradient.end],
  locations: [0, 0.5, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

/**
 * Success gradient (green)
 */
export const successGradient: GradientConfig = {
  colors: [colors.success.light, colors.success.main, colors.success.dark],
  locations: [0, 0.5, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

/**
 * Error gradient (red)
 */
export const errorGradient: GradientConfig = {
  colors: [colors.error.light, colors.error.main, colors.error.dark],
  locations: [0, 0.5, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

/**
 * Gold gradient (for special elements)
 */
export const goldGradient: GradientConfig = {
  colors: ['#FFD700', '#FFA500', '#FF8C00'],
  locations: [0, 0.5, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

/**
 * Get gradient configuration based on direction
 */
export const getGradientByDirection = (
  direction: GradientDirection,
  gradientColors: string[] = [colors.gradient.start, colors.gradient.middle, colors.gradient.end],
): GradientConfig => {
  const baseConfig: GradientConfig = {
    colors: gradientColors,
    locations: [0, 0.5, 1],
  };

  switch (direction) {
    case 'horizontal':
      return {
        ...baseConfig,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
      };
    case 'vertical':
      return {
        ...baseConfig,
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
      };
    case 'diagonal':
      return {
        ...baseConfig,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
    case 'radial':
      return {
        ...baseConfig,
        start: { x: 0.5, y: 0.5 },
        end: { x: 1, y: 1 },
      };
    default:
      return {
        ...baseConfig,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
      };
  }
};

/**
 * Create a custom gradient with specific colors
 */
export const createGradient = (
  startColor: string,
  endColor: string,
  direction: GradientDirection = 'horizontal',
): GradientConfig => {
  return getGradientByDirection(direction, [startColor, endColor]);
};

/**
 * Create a three-color gradient
 */
export const createTripleGradient = (
  startColor: string,
  middleColor: string,
  endColor: string,
  direction: GradientDirection = 'horizontal',
): GradientConfig => {
  return getGradientByDirection(direction, [startColor, middleColor, endColor]);
};

/**
 * Gradient border helper
 * Returns gradient colors for border backgrounds
 */
export const gradientBorder = {
  primary: primaryGradient,
  success: successGradient,
  error: errorGradient,
  gold: goldGradient,
};
