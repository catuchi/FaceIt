/**
 * CalculationService
 * Handles bearing and distance calculations using great circle formulas
 */

import { Coordinates } from '../../types/location';
import {
  BearingResult,
  CardinalDirection,
  NavigationData,
  DistanceUnit,
  DistanceFormatOptions,
} from '../../types/calculations';

// Earth's radius in meters
const EARTH_RADIUS_METERS = 6371000;

export class CalculationService {
  /**
   * Calculate great circle distance between two coordinates using Haversine formula
   * Returns distance in meters
   */
  static calculateDistance(from: Coordinates, to: Coordinates): number {
    const lat1Rad = (from.latitude * Math.PI) / 180;
    const lat2Rad = (to.latitude * Math.PI) / 180;
    const deltaLatRad = ((to.latitude - from.latitude) * Math.PI) / 180;
    const deltaLonRad = ((to.longitude - from.longitude) * Math.PI) / 180;

    // Haversine formula
    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = EARTH_RADIUS_METERS * c;

    return distance;
  }

  /**
   * Calculate initial bearing from one coordinate to another
   * Returns bearing in degrees (0-360) where 0 is North
   */
  static calculateBearing(from: Coordinates, to: Coordinates): number {
    const lat1Rad = (from.latitude * Math.PI) / 180;
    const lat2Rad = (to.latitude * Math.PI) / 180;
    const deltaLonRad = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;

    // Normalize to 0-360 degrees
    bearing = (bearing + 360) % 360;

    return bearing;
  }

  /**
   * Calculate bearing and distance from one coordinate to another
   */
  static calculateBearingAndDistance(from: Coordinates, to: Coordinates): BearingResult {
    const bearing = this.calculateBearing(from, to);
    const distance = this.calculateDistance(from, to);
    const distanceFormatted = this.formatDistance(distance);

    return {
      bearing,
      distance,
      distanceFormatted,
    };
  }

  /**
   * Calculate navigation data including relative direction from current heading
   */
  static calculateNavigationData(
    from: Coordinates,
    to: Coordinates,
    currentHeading: number,
  ): NavigationData {
    const bearing = this.calculateBearing(from, to);
    const distance = this.calculateDistance(from, to);
    const relativeDirection = this.calculateRelativeDirection(currentHeading, bearing);
    const cardinalDirection = this.getCardinalDirection(bearing);
    const distanceFormatted = this.formatDistance(distance);

    return {
      from,
      to,
      bearing,
      distance,
      heading: currentHeading,
      relativeDirection,
      cardinalDirection,
      distanceFormatted,
    };
  }

  /**
   * Calculate relative direction (angle to turn from current heading to bearing)
   * Returns value between -180 and 180 degrees
   * Negative = turn left, Positive = turn right
   */
  static calculateRelativeDirection(currentHeading: number, targetBearing: number): number {
    let relative = targetBearing - currentHeading;

    // Normalize to -180 to 180
    if (relative > 180) {
      relative -= 360;
    } else if (relative < -180) {
      relative += 360;
    }

    return relative;
  }

  /**
   * Convert bearing to cardinal direction (N, NE, E, etc.)
   */
  static getCardinalDirection(bearing: number): CardinalDirection {
    const normalized = ((bearing % 360) + 360) % 360;
    const directions: CardinalDirection[] = [
      CardinalDirection.N,
      CardinalDirection.NNE,
      CardinalDirection.NE,
      CardinalDirection.ENE,
      CardinalDirection.E,
      CardinalDirection.ESE,
      CardinalDirection.SE,
      CardinalDirection.SSE,
      CardinalDirection.S,
      CardinalDirection.SSW,
      CardinalDirection.SW,
      CardinalDirection.WSW,
      CardinalDirection.W,
      CardinalDirection.WNW,
      CardinalDirection.NW,
      CardinalDirection.NNW,
    ];

    const index = Math.round(normalized / 22.5) % 16;
    return directions[index];
  }

  /**
   * Format distance with appropriate units
   */
  static formatDistance(distanceInMeters: number, options: DistanceFormatOptions = {}): string {
    const { unit, precision, longForm = false } = options;

    // Auto-select unit if not specified
    const selectedUnit = unit || this.selectAppropriateUnit(distanceInMeters);

    let value: number;
    let unitLabel: string;

    switch (selectedUnit) {
      case DistanceUnit.KILOMETERS:
        value = distanceInMeters / 1000;
        unitLabel = longForm ? (value === 1 ? 'kilometer' : 'kilometers') : 'km';
        break;
      case DistanceUnit.MILES:
        value = distanceInMeters / 1609.34;
        unitLabel = longForm ? (value === 1 ? 'mile' : 'miles') : 'mi';
        break;
      case DistanceUnit.FEET:
        value = distanceInMeters * 3.28084;
        unitLabel = longForm ? (value === 1 ? 'foot' : 'feet') : 'ft';
        break;
      case DistanceUnit.METERS:
      default:
        value = distanceInMeters;
        unitLabel = longForm ? (value === 1 ? 'meter' : 'meters') : 'm';
        break;
    }

    // Determine precision if not specified
    const finalPrecision = precision !== undefined ? precision : this.selectPrecision(value);

    return `${value.toFixed(finalPrecision)} ${unitLabel}`;
  }

  /**
   * Select appropriate unit based on distance
   */
  private static selectAppropriateUnit(distanceInMeters: number): DistanceUnit {
    if (distanceInMeters >= 1000) {
      return DistanceUnit.KILOMETERS;
    } else {
      return DistanceUnit.METERS;
    }
  }

  /**
   * Select appropriate precision based on value
   */
  private static selectPrecision(value: number): number {
    if (value >= 100) {
      return 0; // "523 km"
    } else if (value >= 10) {
      return 1; // "45.2 km"
    } else {
      return 2; // "5.23 km"
    }
  }

  /**
   * Convert meters to kilometers
   */
  static metersToKilometers(meters: number): number {
    return meters / 1000;
  }

  /**
   * Convert meters to miles
   */
  static metersToMiles(meters: number): number {
    return meters / 1609.34;
  }

  /**
   * Convert meters to feet
   */
  static metersToFeet(meters: number): number {
    return meters * 3.28084;
  }

  /**
   * Convert kilometers to meters
   */
  static kilometersToMeters(kilometers: number): number {
    return kilometers * 1000;
  }

  /**
   * Convert miles to meters
   */
  static milesToMeters(miles: number): number {
    return miles * 1609.34;
  }

  /**
   * Convert feet to meters
   */
  static feetToMeters(feet: number): number {
    return feet / 3.28084;
  }

  /**
   * Check if two coordinates are approximately equal
   */
  static areCoordinatesEqual(
    coord1: Coordinates,
    coord2: Coordinates,
    toleranceMeters: number = 10,
  ): boolean {
    const distance = this.calculateDistance(coord1, coord2);
    return distance <= toleranceMeters;
  }

  /**
   * Validate coordinates
   */
  static isValidCoordinate(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
}
