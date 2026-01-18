/**
 * Formatting Utilities
 * Helper functions for formatting distances, bearings, and directions
 */

import { CardinalDirection, DistanceUnit } from '../types/calculations';

/**
 * Format bearing to degrees with symbol
 */
export function formatBearing(bearing: number): string {
  return `${Math.round(bearing)}°`;
}

/**
 * Format cardinal direction to full name
 */
export function formatCardinalDirection(direction: CardinalDirection): string {
  const directionNames: Record<CardinalDirection, string> = {
    [CardinalDirection.N]: 'North',
    [CardinalDirection.NNE]: 'North-Northeast',
    [CardinalDirection.NE]: 'Northeast',
    [CardinalDirection.ENE]: 'East-Northeast',
    [CardinalDirection.E]: 'East',
    [CardinalDirection.ESE]: 'East-Southeast',
    [CardinalDirection.SE]: 'Southeast',
    [CardinalDirection.SSE]: 'South-Southeast',
    [CardinalDirection.S]: 'South',
    [CardinalDirection.SSW]: 'South-Southwest',
    [CardinalDirection.SW]: 'Southwest',
    [CardinalDirection.WSW]: 'West-Southwest',
    [CardinalDirection.W]: 'West',
    [CardinalDirection.WNW]: 'West-Northwest',
    [CardinalDirection.NW]: 'Northwest',
    [CardinalDirection.NNW]: 'North-Northwest',
  };

  return directionNames[direction];
}

/**
 * Format relative direction to readable instruction
 */
export function formatTurnDirection(relativeDegrees: number): string {
  const absDegrees = Math.abs(relativeDegrees);

  if (absDegrees < 10) {
    return 'Straight ahead';
  } else if (absDegrees < 45) {
    return relativeDegrees > 0 ? 'Slightly right' : 'Slightly left';
  } else if (absDegrees < 135) {
    return relativeDegrees > 0 ? 'Turn right' : 'Turn left';
  } else if (absDegrees < 170) {
    return relativeDegrees > 0 ? 'Sharp right' : 'Sharp left';
  } else {
    return 'Turn around';
  }
}

/**
 * Format distance with short notation
 */
export function formatDistanceShort(distanceInMeters: number): string {
  if (distanceInMeters >= 1000) {
    const km = distanceInMeters / 1000;
    if (km >= 100) {
      return `${Math.round(km)} km`;
    } else if (km >= 10) {
      return `${km.toFixed(1)} km`;
    } else {
      return `${km.toFixed(2)} km`;
    }
  } else {
    return `${Math.round(distanceInMeters)} m`;
  }
}

/**
 * Format coordinates to readable string
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  precision: number = 6,
): string {
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lonDirection = longitude >= 0 ? 'E' : 'W';

  const lat = Math.abs(latitude).toFixed(precision);
  const lon = Math.abs(longitude).toFixed(precision);

  return `${lat}° ${latDirection}, ${lon}° ${lonDirection}`;
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

/**
 * Get distance unit label
 */
export function getDistanceUnitLabel(unit: DistanceUnit, longForm: boolean = false): string {
  if (longForm) {
    const labels: Record<DistanceUnit, string> = {
      [DistanceUnit.METERS]: 'meters',
      [DistanceUnit.KILOMETERS]: 'kilometers',
      [DistanceUnit.MILES]: 'miles',
      [DistanceUnit.FEET]: 'feet',
    };
    return labels[unit];
  } else {
    const labels: Record<DistanceUnit, string> = {
      [DistanceUnit.METERS]: 'm',
      [DistanceUnit.KILOMETERS]: 'km',
      [DistanceUnit.MILES]: 'mi',
      [DistanceUnit.FEET]: 'ft',
    };
    return labels[unit];
  }
}
