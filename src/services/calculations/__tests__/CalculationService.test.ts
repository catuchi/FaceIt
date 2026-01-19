/**
 * CalculationService Unit Tests
 * Tests for bearing, distance, and coordinate calculations
 */

import { CalculationService } from '../CalculationService';
import { CardinalDirection, DistanceUnit } from '../../../types/calculations';
import { MOCK_COORDINATES, createMockCoordinates } from '../../../__tests__/utils/mockData';

describe('CalculationService', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between San Francisco and New York', () => {
      const distance = CalculationService.calculateDistance(
        MOCK_COORDINATES.sanFrancisco,
        MOCK_COORDINATES.newYork,
      );

      // Expected ~4,139 km (4,139,000 meters)
      const distanceKm = distance / 1000;
      expect(distanceKm).toBeGreaterThan(4000);
      expect(distanceKm).toBeLessThan(4300);
    });

    it('should calculate distance between London and Tokyo', () => {
      const distance = CalculationService.calculateDistance(
        MOCK_COORDINATES.london,
        MOCK_COORDINATES.tokyo,
      );

      // Expected ~9,560 km
      const distanceKm = distance / 1000;
      expect(distanceKm).toBeGreaterThan(9400);
      expect(distanceKm).toBeLessThan(9700);
    });

    it('should return 0 for same coordinates', () => {
      const distance = CalculationService.calculateDistance(
        MOCK_COORDINATES.sanFrancisco,
        MOCK_COORDINATES.sanFrancisco,
      );

      expect(distance).toBe(0);
    });

    it('should calculate distance from equator to north pole (quarter circumference)', () => {
      const distance = CalculationService.calculateDistance(
        MOCK_COORDINATES.equator,
        MOCK_COORDINATES.northPole,
      );

      // Quarter of Earth's circumference ~10,008 km
      const distanceKm = distance / 1000;
      expect(distanceKm).toBeGreaterThan(9900);
      expect(distanceKm).toBeLessThan(10100);
    });

    it('should handle antipodal points (maximum distance)', () => {
      const northPole = createMockCoordinates({ latitude: 90, longitude: 0 });
      const southPole = createMockCoordinates({ latitude: -90, longitude: 0 });

      const distance = CalculationService.calculateDistance(northPole, southPole);

      // Half of Earth's circumference ~20,015 km
      const distanceKm = distance / 1000;
      expect(distanceKm).toBeGreaterThan(19900);
      expect(distanceKm).toBeLessThan(20200);
    });

    it('should handle date line crossing', () => {
      const west = createMockCoordinates({ latitude: 0, longitude: 179 });
      const east = createMockCoordinates({ latitude: 0, longitude: -179 });

      const distance = CalculationService.calculateDistance(west, east);

      // Should be ~222 km (2 degrees at equator)
      const distanceKm = distance / 1000;
      expect(distanceKm).toBeGreaterThan(200);
      expect(distanceKm).toBeLessThan(250);
    });
  });

  describe('calculateBearing', () => {
    it('should calculate bearing from San Francisco to New York (approximately ENE)', () => {
      const bearing = CalculationService.calculateBearing(
        MOCK_COORDINATES.sanFrancisco,
        MOCK_COORDINATES.newYork,
      );

      // Expected ~70 degrees (ENE)
      expect(bearing).toBeGreaterThan(65);
      expect(bearing).toBeLessThan(75);
    });

    it('should return 0 degrees for due north', () => {
      const from = createMockCoordinates({ latitude: 0, longitude: 0 });
      const to = createMockCoordinates({ latitude: 10, longitude: 0 });

      const bearing = CalculationService.calculateBearing(from, to);

      expect(bearing).toBeCloseTo(0, 0);
    });

    it('should return 90 degrees for due east', () => {
      const from = createMockCoordinates({ latitude: 0, longitude: 0 });
      const to = createMockCoordinates({ latitude: 0, longitude: 10 });

      const bearing = CalculationService.calculateBearing(from, to);

      expect(bearing).toBeCloseTo(90, 0);
    });

    it('should return 180 degrees for due south', () => {
      const from = createMockCoordinates({ latitude: 10, longitude: 0 });
      const to = createMockCoordinates({ latitude: 0, longitude: 0 });

      const bearing = CalculationService.calculateBearing(from, to);

      expect(bearing).toBeCloseTo(180, 0);
    });

    it('should return 270 degrees for due west', () => {
      const from = createMockCoordinates({ latitude: 0, longitude: 10 });
      const to = createMockCoordinates({ latitude: 0, longitude: 0 });

      const bearing = CalculationService.calculateBearing(from, to);

      expect(bearing).toBeCloseTo(270, 0);
    });

    it('should return normalized bearing (0-360)', () => {
      const from = createMockCoordinates({ latitude: 0, longitude: 0 });
      const to = createMockCoordinates({ latitude: 0, longitude: -10 });

      const bearing = CalculationService.calculateBearing(from, to);

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('getCardinalDirection', () => {
    it('should return N for 0 degrees', () => {
      expect(CalculationService.getCardinalDirection(0)).toBe(CardinalDirection.N);
    });

    it('should return N for 360 degrees', () => {
      expect(CalculationService.getCardinalDirection(360)).toBe(CardinalDirection.N);
    });

    it('should return E for 90 degrees', () => {
      expect(CalculationService.getCardinalDirection(90)).toBe(CardinalDirection.E);
    });

    it('should return S for 180 degrees', () => {
      expect(CalculationService.getCardinalDirection(180)).toBe(CardinalDirection.S);
    });

    it('should return W for 270 degrees', () => {
      expect(CalculationService.getCardinalDirection(270)).toBe(CardinalDirection.W);
    });

    it('should return NE for 45 degrees', () => {
      expect(CalculationService.getCardinalDirection(45)).toBe(CardinalDirection.NE);
    });

    it('should return SE for 135 degrees', () => {
      expect(CalculationService.getCardinalDirection(135)).toBe(CardinalDirection.SE);
    });

    it('should return SW for 225 degrees', () => {
      expect(CalculationService.getCardinalDirection(225)).toBe(CardinalDirection.SW);
    });

    it('should return NW for 315 degrees', () => {
      expect(CalculationService.getCardinalDirection(315)).toBe(CardinalDirection.NW);
    });

    it('should handle negative bearings', () => {
      expect(CalculationService.getCardinalDirection(-90)).toBe(CardinalDirection.W);
    });

    it('should handle bearings > 360', () => {
      expect(CalculationService.getCardinalDirection(450)).toBe(CardinalDirection.E);
    });
  });

  describe('calculateRelativeDirection', () => {
    it('should return 0 when heading equals bearing', () => {
      const relative = CalculationService.calculateRelativeDirection(90, 90);
      expect(relative).toBe(0);
    });

    it('should return positive for clockwise turn', () => {
      const relative = CalculationService.calculateRelativeDirection(0, 90);
      expect(relative).toBe(90);
    });

    it('should return negative for counter-clockwise turn', () => {
      const relative = CalculationService.calculateRelativeDirection(90, 0);
      expect(relative).toBe(-90);
    });

    it('should handle crossing 0 degrees (shortest path clockwise)', () => {
      const relative = CalculationService.calculateRelativeDirection(350, 10);
      expect(relative).toBe(20);
    });

    it('should handle crossing 0 degrees (shortest path counter-clockwise)', () => {
      const relative = CalculationService.calculateRelativeDirection(10, 350);
      expect(relative).toBe(-20);
    });

    it('should return value between -180 and 180', () => {
      const testCases = [
        { heading: 0, bearing: 270 },
        { heading: 270, bearing: 0 },
        { heading: 45, bearing: 225 },
      ];

      testCases.forEach(({ heading, bearing }) => {
        const relative = CalculationService.calculateRelativeDirection(heading, bearing);
        expect(relative).toBeGreaterThanOrEqual(-180);
        expect(relative).toBeLessThanOrEqual(180);
      });
    });
  });

  describe('formatDistance', () => {
    it('should format meters for small distances', () => {
      const formatted = CalculationService.formatDistance(500);
      expect(formatted).toBe('500 m');
    });

    it('should format kilometers for large distances', () => {
      const formatted = CalculationService.formatDistance(5000);
      expect(formatted).toBe('5.00 km');
    });

    it('should format with specified unit', () => {
      const formatted = CalculationService.formatDistance(1609.34, {
        unit: DistanceUnit.MILES,
      });
      expect(formatted).toBe('1.00 mi');
    });

    it('should format with specified precision', () => {
      const formatted = CalculationService.formatDistance(1234.567, {
        unit: DistanceUnit.METERS,
        precision: 0,
      });
      expect(formatted).toBe('1235 m');
    });

    it('should format in long form', () => {
      const formatted = CalculationService.formatDistance(1000, {
        unit: DistanceUnit.KILOMETERS,
        longForm: true,
      });
      expect(formatted).toBe('1.00 kilometer');
    });

    it('should use plural in long form for values != 1', () => {
      const formatted = CalculationService.formatDistance(2000, {
        unit: DistanceUnit.KILOMETERS,
        longForm: true,
      });
      expect(formatted).toBe('2.00 kilometers');
    });

    it('should format feet correctly', () => {
      const formatted = CalculationService.formatDistance(100, {
        unit: DistanceUnit.FEET,
      });
      expect(formatted).toContain('ft');
    });
  });

  describe('unit conversions', () => {
    it('should convert meters to kilometers', () => {
      expect(CalculationService.metersToKilometers(1000)).toBe(1);
      expect(CalculationService.metersToKilometers(5000)).toBe(5);
    });

    it('should convert meters to miles', () => {
      const miles = CalculationService.metersToMiles(1609.34);
      expect(miles).toBeCloseTo(1, 1);
    });

    it('should convert meters to feet', () => {
      const feet = CalculationService.metersToFeet(1);
      expect(feet).toBeCloseTo(3.28084, 3);
    });

    it('should convert kilometers to meters', () => {
      expect(CalculationService.kilometersToMeters(1)).toBe(1000);
      expect(CalculationService.kilometersToMeters(5)).toBe(5000);
    });

    it('should convert miles to meters', () => {
      const meters = CalculationService.milesToMeters(1);
      expect(meters).toBeCloseTo(1609.34, 1);
    });

    it('should convert feet to meters', () => {
      const meters = CalculationService.feetToMeters(3.28084);
      expect(meters).toBeCloseTo(1, 3);
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      expect(CalculationService.isValidCoordinate(0, 0)).toBe(true);
      expect(CalculationService.isValidCoordinate(37.7749, -122.4194)).toBe(true);
      expect(CalculationService.isValidCoordinate(-90, 180)).toBe(true);
      expect(CalculationService.isValidCoordinate(90, -180)).toBe(true);
    });

    it('should return false for invalid latitude', () => {
      expect(CalculationService.isValidCoordinate(91, 0)).toBe(false);
      expect(CalculationService.isValidCoordinate(-91, 0)).toBe(false);
    });

    it('should return false for invalid longitude', () => {
      expect(CalculationService.isValidCoordinate(0, 181)).toBe(false);
      expect(CalculationService.isValidCoordinate(0, -181)).toBe(false);
    });

    it('should return true for boundary values', () => {
      expect(CalculationService.isValidCoordinate(90, 180)).toBe(true);
      expect(CalculationService.isValidCoordinate(-90, -180)).toBe(true);
    });
  });

  describe('areCoordinatesEqual', () => {
    it('should return true for same coordinates', () => {
      const coord = createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 });
      expect(CalculationService.areCoordinatesEqual(coord, coord)).toBe(true);
    });

    it('should return true for coordinates within tolerance', () => {
      const coord1 = createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 });
      const coord2 = createMockCoordinates({ latitude: 37.77495, longitude: -122.41945 });

      expect(CalculationService.areCoordinatesEqual(coord1, coord2, 100)).toBe(true);
    });

    it('should return false for coordinates outside tolerance', () => {
      const coord1 = createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 });
      const coord2 = createMockCoordinates({ latitude: 37.78, longitude: -122.42 });

      expect(CalculationService.areCoordinatesEqual(coord1, coord2, 10)).toBe(false);
    });

    it('should use default tolerance of 10 meters', () => {
      const coord1 = createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 });
      const coord2 = createMockCoordinates({ latitude: 37.77491, longitude: -122.41941 });

      // Very small difference should be within 10m
      expect(CalculationService.areCoordinatesEqual(coord1, coord2)).toBe(true);
    });
  });

  describe('calculateBearingAndDistance', () => {
    it('should return bearing, distance, and formatted distance', () => {
      const result = CalculationService.calculateBearingAndDistance(
        MOCK_COORDINATES.sanFrancisco,
        MOCK_COORDINATES.newYork,
      );

      expect(result).toHaveProperty('bearing');
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('distanceFormatted');

      expect(typeof result.bearing).toBe('number');
      expect(typeof result.distance).toBe('number');
      expect(typeof result.distanceFormatted).toBe('string');

      expect(result.bearing).toBeGreaterThan(0);
      expect(result.distance).toBeGreaterThan(0);
    });
  });

  describe('calculateNavigationData', () => {
    it('should return complete navigation data', () => {
      const result = CalculationService.calculateNavigationData(
        MOCK_COORDINATES.sanFrancisco,
        MOCK_COORDINATES.newYork,
        45, // Current heading
      );

      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('to');
      expect(result).toHaveProperty('bearing');
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('heading');
      expect(result).toHaveProperty('relativeDirection');
      expect(result).toHaveProperty('cardinalDirection');
      expect(result).toHaveProperty('distanceFormatted');

      expect(result.heading).toBe(45);
      expect(result.from).toEqual(MOCK_COORDINATES.sanFrancisco);
      expect(result.to).toEqual(MOCK_COORDINATES.newYork);
    });
  });
});
