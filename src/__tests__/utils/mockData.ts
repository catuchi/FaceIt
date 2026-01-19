/**
 * Mock Data Factories
 * Test utilities for creating mock data objects
 */

import { Coordinates } from '../../types/location';
import { Location, FavoriteLocation, UserPreferences } from '../../types/storage';
import { GeocodingResult } from '../../types/geocoding';

// ========================
// Coordinate Factories
// ========================

export const createMockCoordinates = (overrides?: Partial<Coordinates>): Coordinates => ({
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
  ...overrides,
});

// Famous locations for testing
export const MOCK_COORDINATES = {
  sanFrancisco: createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 }),
  newYork: createMockCoordinates({ latitude: 40.7128, longitude: -74.006 }),
  london: createMockCoordinates({ latitude: 51.5074, longitude: -0.1278 }),
  tokyo: createMockCoordinates({ latitude: 35.6762, longitude: 139.6503 }),
  sydney: createMockCoordinates({ latitude: -33.8688, longitude: 151.2093 }),
  mecca: createMockCoordinates({ latitude: 21.4225, longitude: 39.8262 }),
  northPole: createMockCoordinates({ latitude: 90, longitude: 0 }),
  southPole: createMockCoordinates({ latitude: -90, longitude: 0 }),
  equator: createMockCoordinates({ latitude: 0, longitude: 0 }),
  dateLine: createMockCoordinates({ latitude: 0, longitude: 180 }),
};

// ========================
// Location Factories
// ========================

export const createMockLocation = (overrides?: Partial<Location>): Location => ({
  id: `location_${Date.now()}`,
  name: 'Test Location',
  coordinates: createMockCoordinates(),
  address: '123 Test Street, Test City',
  timestamp: Date.now(),
  ...overrides,
});

export const createMockFavoriteLocation = (
  overrides?: Partial<FavoriteLocation>,
): FavoriteLocation => ({
  ...createMockLocation(),
  customLabel: undefined,
  savedDate: Date.now(),
  ...overrides,
});

// ========================
// Geocoding Factories
// ========================

export const createMockGeocodingResult = (
  overrides?: Partial<GeocodingResult>,
): GeocodingResult => ({
  name: 'Test Place',
  address: '123 Test Street, Test City, TC 12345',
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  region: 'California',
  country: 'United States',
  ...overrides,
});

// ========================
// Preferences Factories
// ========================

export const createMockPreferences = (overrides?: Partial<UserPreferences>): UserPreferences => ({
  distanceUnit: 'km',
  hapticFeedbackEnabled: true,
  ...overrides,
});

// ========================
// History Factories
// ========================

export const createMockHistory = (count: number = 5): Location[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockLocation({
      id: `history_${i}`,
      name: `Location ${i + 1}`,
      timestamp: Date.now() - i * 60000, // Each location 1 minute older
    }),
  );
};

// ========================
// Favorites Factories
// ========================

export const createMockFavorites = (count: number = 3): FavoriteLocation[] => {
  const names = ['Home', 'Work', 'Gym', 'Park', 'Restaurant'];
  return Array.from({ length: count }, (_, i) =>
    createMockFavoriteLocation({
      id: `favorite_${i}`,
      name: names[i % names.length],
      customLabel: i % 2 === 0 ? `My ${names[i % names.length]}` : undefined,
      savedDate: Date.now() - i * 86400000, // Each favorite 1 day older
    }),
  );
};

// ========================
// Bearing & Distance Test Cases
// ========================

export const BEARING_TEST_CASES = [
  {
    from: MOCK_COORDINATES.sanFrancisco,
    to: MOCK_COORDINATES.newYork,
    expectedBearing: 77, // Approximately ENE
    description: 'San Francisco to New York',
  },
  {
    from: MOCK_COORDINATES.london,
    to: MOCK_COORDINATES.tokyo,
    expectedBearing: 31, // Approximately NNE
    description: 'London to Tokyo',
  },
  {
    from: MOCK_COORDINATES.sydney,
    to: MOCK_COORDINATES.mecca,
    expectedBearing: 294, // Approximately WNW
    description: 'Sydney to Mecca',
  },
];

export const DISTANCE_TEST_CASES = [
  {
    from: MOCK_COORDINATES.sanFrancisco,
    to: MOCK_COORDINATES.newYork,
    expectedDistanceKm: 4139, // Approximately
    description: 'San Francisco to New York',
  },
  {
    from: MOCK_COORDINATES.london,
    to: MOCK_COORDINATES.tokyo,
    expectedDistanceKm: 9560, // Approximately
    description: 'London to Tokyo',
  },
  {
    from: MOCK_COORDINATES.equator,
    to: MOCK_COORDINATES.northPole,
    expectedDistanceKm: 10008, // Quarter of Earth's circumference
    description: 'Equator to North Pole',
  },
];
