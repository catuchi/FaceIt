/**
 * Location Types
 * Type definitions for location services and permissions
 */

/**
 * Geographic coordinates with metadata
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

/**
 * Location permission status
 */
export enum LocationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  BLOCKED = 'blocked', // User denied and selected "Don't ask again"
  NOT_REQUESTED = 'not_requested',
}

/**
 * Location error types
 */
export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  PLAY_SERVICES_NOT_AVAILABLE = 'PLAY_SERVICES_NOT_AVAILABLE',
  SETTINGS_NOT_SATISFIED = 'SETTINGS_NOT_SATISFIED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Location error
 */
export class LocationError extends Error {
  type: LocationErrorType;
  code?: number;
  originalError?: Error;

  constructor(
    message: string,
    type: LocationErrorType = LocationErrorType.UNKNOWN,
    code?: number,
    originalError?: Error,
  ) {
    super(message);
    this.name = 'LocationError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Cached location with metadata
 */
export interface CachedLocation {
  coordinates: Coordinates;
  timestamp: number;
  isStale: boolean;
  ageInMinutes: number;
}

/**
 * Location service configuration
 */
export interface LocationServiceConfig {
  timeout?: number; // in milliseconds
  maximumAge?: number; // in milliseconds
  enableHighAccuracy?: boolean;
  distanceFilter?: number; // in meters
  showLocationDialog?: boolean; // Android only
  forceLocationManager?: boolean; // Android only
}

/**
 * Watch position subscription
 */
export interface LocationSubscription {
  id: number;
  remove: () => void;
}
