/**
 * Geocoding Types
 * Type definitions for geocoding services and results
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocoding result from search
 */
export interface GeocodingResult {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  region?: string;
  country?: string;
  viewport?: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

/**
 * Autocomplete suggestion
 */
export interface Suggestion {
  id: string;
  description: string;
  mainText: string;
  secondaryText?: string;
}

/**
 * Geocoding error types
 */
export enum GeocodingErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  NO_RESULTS = 'NO_RESULTS',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Geocoding error
 */
export class GeocodingError extends Error {
  type: GeocodingErrorType;
  originalError?: Error;

  constructor(
    message: string,
    type: GeocodingErrorType = GeocodingErrorType.UNKNOWN,
    originalError?: Error,
  ) {
    super(message);
    this.name = 'GeocodingError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Cached geocoding result with metadata
 */
export interface CachedGeocodingResult {
  data: GeocodingResult[];
  timestamp: number;
  query: string;
}

/**
 * Geocoding service configuration
 */
export interface GeocodingServiceConfig {
  apiKey: string;
  debounceMs?: number;
  timeoutMs?: number;
  maxResults?: number;
  cacheTTLDays?: number;
  maxCacheSize?: number;
}

/**
 * Geocoding provider types
 */
export enum GeocodingProvider {
  GOOGLE_MAPS = 'GOOGLE_MAPS',
  MAPBOX = 'MAPBOX',
}
