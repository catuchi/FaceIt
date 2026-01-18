/**
 * Calculation Types
 * Type definitions for bearing and distance calculations
 */

import { Coordinates } from './location';

/**
 * Distance unit types
 */
export enum DistanceUnit {
  METERS = 'meters',
  KILOMETERS = 'kilometers',
  MILES = 'miles',
  FEET = 'feet',
}

/**
 * Bearing result with distance
 */
export interface BearingResult {
  bearing: number; // Degrees from North (0-360)
  distance: number; // Distance in meters
  distanceFormatted: string; // Human-readable distance
}

/**
 * Cardinal direction
 */
export enum CardinalDirection {
  N = 'N',
  NNE = 'NNE',
  NE = 'NE',
  ENE = 'ENE',
  E = 'E',
  ESE = 'ESE',
  SE = 'SE',
  SSE = 'SSE',
  S = 'S',
  SSW = 'SSW',
  SW = 'SW',
  WSW = 'WSW',
  W = 'W',
  WNW = 'WNW',
  NW = 'NW',
  NNW = 'NNW',
}

/**
 * Navigation data combining bearing and heading
 */
export interface NavigationData {
  from: Coordinates;
  to: Coordinates;
  bearing: number; // Direction to destination (0-360)
  distance: number; // Distance in meters
  heading: number; // Current device heading (0-360)
  relativeDirection: number; // Degrees to turn (-180 to 180)
  cardinalDirection: CardinalDirection;
  distanceFormatted: string;
}

/**
 * Distance formatting options
 */
export interface DistanceFormatOptions {
  unit?: DistanceUnit;
  precision?: number;
  longForm?: boolean; // "5.2 kilometers" vs "5.2 km"
}
