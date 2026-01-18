/**
 * GeocodingService
 * Handles geocoding operations using Google Maps Geocoding API and Places Autocomplete
 */

import axios, { AxiosError } from 'axios';
import Config from 'react-native-config';
import { GeocodingCache } from './GeocodingCache';
import {
  GeocodingResult,
  Suggestion,
  GeocodingError,
  GeocodingErrorType,
  GeocodingServiceConfig,
} from '../../types/geocoding';

const GOOGLE_GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_AUTOCOMPLETE_API = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RESULTS = 5;

export class GeocodingService {
  private apiKey: string;
  private cache: GeocodingCache;
  private debounceMs: number;
  private timeoutMs: number;
  private maxResults: number;
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 100; // Minimum 100ms between requests for rate limiting

  constructor(config?: Partial<GeocodingServiceConfig>) {
    this.apiKey = config?.apiKey || Config.GOOGLE_MAPS_API_KEY || '';
    this.debounceMs = config?.debounceMs || DEFAULT_DEBOUNCE_MS;
    this.timeoutMs = config?.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.maxResults = config?.maxResults || DEFAULT_MAX_RESULTS;

    if (!this.apiKey) {
      console.warn('[GeocodingService] Google Maps API key not configured');
    }

    this.cache = new GeocodingCache(config?.cacheTTLDays, config?.maxCacheSize);
  }

  /**
   * Search for locations by text query
   */
  async searchByText(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length === 0) {
      throw new GeocodingError('Query cannot be empty', GeocodingErrorType.INVALID_REQUEST);
    }

    // Check cache first
    const cached = await this.cache.get(query);
    if (cached) {
      return cached;
    }

    try {
      await this.enforceRateLimit();

      const response = await axios.get(GOOGLE_GEOCODING_API, {
        params: {
          address: query,
          key: this.apiKey,
        },
        timeout: this.timeoutMs,
      });

      if (response.data.status === 'ZERO_RESULTS') {
        throw new GeocodingError('No results found for this query', GeocodingErrorType.NO_RESULTS);
      }

      if (response.data.status !== 'OK') {
        throw new GeocodingError(
          `Geocoding API error: ${response.data.status}`,
          GeocodingErrorType.API_ERROR,
        );
      }

      const results = this.parseGeocodingResults(response.data.results);

      // Cache the results
      await this.cache.set(query, results);

      return results.slice(0, this.maxResults);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search by coordinates (reverse geocoding)
   */
  async searchByCoordinates(latitude: number, longitude: number): Promise<GeocodingResult> {
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new GeocodingError('Invalid coordinates', GeocodingErrorType.INVALID_REQUEST);
    }

    const query = `${latitude},${longitude}`;

    // Check cache first
    const cached = await this.cache.get(query);
    if (cached && cached.length > 0) {
      return cached[0];
    }

    try {
      await this.enforceRateLimit();

      const response = await axios.get(GOOGLE_GEOCODING_API, {
        params: {
          latlng: query,
          key: this.apiKey,
        },
        timeout: this.timeoutMs,
      });

      if (response.data.status === 'ZERO_RESULTS') {
        throw new GeocodingError(
          'No results found for these coordinates',
          GeocodingErrorType.NO_RESULTS,
        );
      }

      if (response.data.status !== 'OK') {
        throw new GeocodingError(
          `Geocoding API error: ${response.data.status}`,
          GeocodingErrorType.API_ERROR,
        );
      }

      const results = this.parseGeocodingResults(response.data.results);

      if (results.length === 0) {
        throw new GeocodingError('No results found', GeocodingErrorType.NO_RESULTS);
      }

      // Cache the results
      await this.cache.set(query, results);

      return results[0];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get autocomplete suggestions for input
   */
  async getAutocompleteSuggestions(input: string): Promise<Suggestion[]> {
    if (!input || input.trim().length === 0) {
      return [];
    }

    return new Promise((resolve, reject) => {
      // Clear existing debounce timer for this input
      const existingTimer = this.debounceTimers.get('autocomplete');
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounce timer
      const timer = setTimeout(async () => {
        try {
          await this.enforceRateLimit();

          const response = await axios.get(GOOGLE_AUTOCOMPLETE_API, {
            params: {
              input,
              key: this.apiKey,
              types: '(regions)',
            },
            timeout: this.timeoutMs,
          });

          if (response.data.status === 'ZERO_RESULTS') {
            resolve([]);
            return;
          }

          if (response.data.status !== 'OK') {
            throw new GeocodingError(
              `Autocomplete API error: ${response.data.status}`,
              GeocodingErrorType.API_ERROR,
            );
          }

          const suggestions = this.parseAutocompleteSuggestions(response.data.predictions);

          resolve(suggestions.slice(0, this.maxResults));
        } catch (error) {
          reject(this.handleError(error));
        } finally {
          this.debounceTimers.delete('autocomplete');
        }
      }, this.debounceMs);

      this.debounceTimers.set('autocomplete', timer);
    });
  }

  /**
   * Parse geocoding API results
   */
  private parseGeocodingResults(results: any[]): GeocodingResult[] {
    return results.map(result => ({
      id: result.place_id,
      name: this.extractName(result),
      address: result.formatted_address,
      coordinates: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      region: this.extractComponent(result, 'administrative_area_level_1'),
      country: this.extractComponent(result, 'country'),
      viewport: result.geometry.viewport
        ? {
            northeast: {
              latitude: result.geometry.viewport.northeast.lat,
              longitude: result.geometry.viewport.northeast.lng,
            },
            southwest: {
              latitude: result.geometry.viewport.southwest.lat,
              longitude: result.geometry.viewport.southwest.lng,
            },
          }
        : undefined,
    }));
  }

  /**
   * Parse autocomplete suggestions
   */
  private parseAutocompleteSuggestions(predictions: any[]): Suggestion[] {
    return predictions.map(prediction => ({
      id: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }));
  }

  /**
   * Extract name from geocoding result
   */
  private extractName(result: any): string {
    // Try to get the most specific name
    const locality = this.extractComponent(result, 'locality');
    const sublocality = this.extractComponent(result, 'sublocality');
    const poi = this.extractComponent(result, 'point_of_interest');

    return poi || sublocality || locality || result.formatted_address;
  }

  /**
   * Extract address component by type
   */
  private extractComponent(result: any, type: string): string | undefined {
    const component = result.address_components?.find((comp: any) => comp.types.includes(type));
    return component?.long_name;
  }

  /**
   * Validate coordinates
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Enforce rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise<void>(resolve =>
        setTimeout(() => resolve(), this.minRequestInterval - timeSinceLastRequest),
      );
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Handle and normalize errors
   */
  private handleError(error: unknown): GeocodingError {
    if (error instanceof GeocodingError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED') {
        return new GeocodingError('Request timeout', GeocodingErrorType.TIMEOUT, axiosError);
      }

      if (axiosError.response?.status === 429) {
        return new GeocodingError('Rate limit exceeded', GeocodingErrorType.RATE_LIMIT, axiosError);
      }

      if (!axiosError.response) {
        return new GeocodingError('Network error', GeocodingErrorType.NETWORK_ERROR, axiosError);
      }

      return new GeocodingError(
        `API error: ${axiosError.message}`,
        GeocodingErrorType.API_ERROR,
        axiosError,
      );
    }

    return new GeocodingError(
      error instanceof Error ? error.message : 'Unknown error',
      GeocodingErrorType.UNKNOWN,
      error instanceof Error ? error : undefined,
    );
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ count: number; size: number }> {
    return this.cache.getStats();
  }
}
