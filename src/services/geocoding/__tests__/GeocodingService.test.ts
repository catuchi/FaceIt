/**
 * GeocodingService Unit Tests
 * Tests for geocoding, reverse geocoding, and autocomplete
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeocodingService } from '../GeocodingService';
import { GeocodingErrorType } from '../../../types/geocoding';

// Mock axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock react-native-config
jest.mock('react-native-config', () => ({
  GOOGLE_MAPS_API_KEY: 'test-api-key',
}));

// Get the mocked AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Sample API responses
const mockGeocodingResponse = {
  status: 'OK',
  results: [
    {
      place_id: 'place123',
      formatted_address: '123 Test Street, San Francisco, CA 94102, USA',
      geometry: {
        location: { lat: 37.7749, lng: -122.4194 },
        viewport: {
          northeast: { lat: 37.78, lng: -122.41 },
          southwest: { lat: 37.77, lng: -122.43 },
        },
      },
      address_components: [
        { long_name: 'San Francisco', types: ['locality'] },
        { long_name: 'California', types: ['administrative_area_level_1'] },
        { long_name: 'United States', types: ['country'] },
      ],
    },
  ],
};

const mockAutocompleteResponse = {
  status: 'OK',
  predictions: [
    {
      place_id: 'pred123',
      description: 'San Francisco, CA, USA',
      structured_formatting: {
        main_text: 'San Francisco',
        secondary_text: 'CA, USA',
      },
    },
    {
      place_id: 'pred456',
      description: 'San Francisco International Airport',
      structured_formatting: {
        main_text: 'San Francisco International Airport',
        secondary_text: 'San Francisco, CA, USA',
      },
    },
  ],
};

describe('GeocodingService', () => {
  let geocodingService: GeocodingService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset rate limiter
    geocodingService = new GeocodingService({
      apiKey: 'test-api-key',
      debounceMs: 100,
      timeoutMs: 5000,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('searchByText', () => {
    it('should return geocoding results for valid query', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null); // No cache
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAxios.get.mockResolvedValueOnce({ data: mockGeocodingResponse });

      const results = await geocodingService.searchByText('San Francisco');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('San Francisco');
      expect(results[0].coordinates.latitude).toBe(37.7749);
      expect(results[0].coordinates.longitude).toBe(-122.4194);
      expect(results[0].country).toBe('United States');
    });

    it('should throw error for empty query', async () => {
      await expect(geocodingService.searchByText('')).rejects.toMatchObject({
        type: GeocodingErrorType.INVALID_REQUEST,
        message: 'Query cannot be empty',
      });
    });

    it('should throw error for whitespace-only query', async () => {
      await expect(geocodingService.searchByText('   ')).rejects.toMatchObject({
        type: GeocodingErrorType.INVALID_REQUEST,
      });
    });

    it('should return cached results when available', async () => {
      const cachedData = {
        data: [
          {
            id: 'cached123',
            name: 'Cached Location',
            address: '123 Cached St',
            coordinates: { latitude: 40.0, longitude: -75.0 },
          },
        ],
        timestamp: Date.now(),
        query: 'cached query',
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedData));

      const results = await geocodingService.searchByText('Cached Query');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Cached Location');
      expect(mockAxios.get).not.toHaveBeenCalled(); // Should not make API call
    });

    it('should throw NO_RESULTS error when no results found', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'ZERO_RESULTS', results: [] },
      });

      await expect(geocodingService.searchByText('xyznonexistent')).rejects.toMatchObject({
        type: GeocodingErrorType.NO_RESULTS,
      });
    });

    it('should throw API_ERROR for non-OK status', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'REQUEST_DENIED', results: [] },
      });

      await expect(geocodingService.searchByText('test')).rejects.toMatchObject({
        type: GeocodingErrorType.API_ERROR,
      });
    });

    it('should limit results to maxResults', async () => {
      const service = new GeocodingService({ apiKey: 'test', maxResults: 1 });
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const multipleResults = {
        status: 'OK',
        results: [
          { ...mockGeocodingResponse.results[0], place_id: '1' },
          { ...mockGeocodingResponse.results[0], place_id: '2' },
          { ...mockGeocodingResponse.results[0], place_id: '3' },
        ],
      };
      mockAxios.get.mockResolvedValueOnce({ data: multipleResults });

      const results = await service.searchByText('test');

      expect(results).toHaveLength(1);
    });
  });

  describe('searchByCoordinates', () => {
    it('should return result for valid coordinates', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAxios.get.mockResolvedValueOnce({ data: mockGeocodingResponse });

      const result = await geocodingService.searchByCoordinates(37.7749, -122.4194);

      expect(result.name).toBe('San Francisco');
      expect(result.coordinates.latitude).toBe(37.7749);
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            latlng: '37.7749,-122.4194',
          }),
        }),
      );
    });

    it('should throw error for invalid latitude', async () => {
      await expect(geocodingService.searchByCoordinates(91, 0)).rejects.toMatchObject({
        type: GeocodingErrorType.INVALID_REQUEST,
        message: 'Invalid coordinates',
      });
    });

    it('should throw error for invalid longitude', async () => {
      await expect(geocodingService.searchByCoordinates(0, 181)).rejects.toMatchObject({
        type: GeocodingErrorType.INVALID_REQUEST,
      });
    });

    it('should return cached result when available', async () => {
      const cachedData = {
        data: [
          {
            id: 'cached123',
            name: 'Cached Reverse',
            address: 'Cached Address',
            coordinates: { latitude: 37.7749, longitude: -122.4194 },
          },
        ],
        timestamp: Date.now(),
        query: '37.7749,-122.4194',
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await geocodingService.searchByCoordinates(37.7749, -122.4194);

      expect(result.name).toBe('Cached Reverse');
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should throw NO_RESULTS for zero results', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'ZERO_RESULTS', results: [] },
      });

      await expect(geocodingService.searchByCoordinates(0, 0)).rejects.toMatchObject({
        type: GeocodingErrorType.NO_RESULTS,
      });
    });

    it('should accept boundary coordinates', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAxios.get.mockResolvedValueOnce({ data: mockGeocodingResponse });

      // Should not throw for valid boundary values
      await expect(geocodingService.searchByCoordinates(90, 180)).resolves.toBeDefined();
    });
  });

  describe('getAutocompleteSuggestions', () => {
    it('should return suggestions after debounce', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockAutocompleteResponse });

      const promise = geocodingService.getAutocompleteSuggestions('San');

      // Fast-forward debounce timer
      jest.advanceTimersByTime(100);

      const suggestions = await promise;

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].mainText).toBe('San Francisco');
      expect(suggestions[0].description).toBe('San Francisco, CA, USA');
    });

    it('should return empty array for empty input', async () => {
      const suggestions = await geocodingService.getAutocompleteSuggestions('');

      expect(suggestions).toEqual([]);
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace input', async () => {
      const suggestions = await geocodingService.getAutocompleteSuggestions('   ');

      expect(suggestions).toEqual([]);
    });

    it('should return empty array for ZERO_RESULTS', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { status: 'ZERO_RESULTS', predictions: [] },
      });

      const promise = geocodingService.getAutocompleteSuggestions('xyz');
      jest.advanceTimersByTime(100);

      const suggestions = await promise;

      expect(suggestions).toEqual([]);
    });

    it('should cancel previous debounced request on new input', async () => {
      mockAxios.get.mockResolvedValue({ data: mockAutocompleteResponse });

      // Start first request (will be cancelled)
      geocodingService.getAutocompleteSuggestions('San');

      // Before debounce completes, start another request
      jest.advanceTimersByTime(50);
      const promise2 = geocodingService.getAutocompleteSuggestions('San Fran');

      // Complete both debounces
      jest.advanceTimersByTime(100);

      // Second promise should resolve
      const suggestions = await promise2;
      expect(suggestions).toHaveLength(2);

      // Only one API call should have been made (the second one)
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should limit suggestions to maxResults', async () => {
      const service = new GeocodingService({
        apiKey: 'test',
        maxResults: 1,
        debounceMs: 10,
      });

      mockAxios.get.mockResolvedValueOnce({ data: mockAutocompleteResponse });

      const promise = service.getAutocompleteSuggestions('San');
      jest.advanceTimersByTime(10);

      const suggestions = await promise;

      expect(suggestions).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const networkError = new Error('Network Error');
      (networkError as any).isAxiosError = true;
      (networkError as any).response = undefined;
      mockAxios.get.mockRejectedValueOnce(networkError);
      mockAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(geocodingService.searchByText('test')).rejects.toMatchObject({
        type: GeocodingErrorType.NETWORK_ERROR,
      });
    });

    it('should handle timeout errors', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const timeoutError = new Error('Timeout');
      (timeoutError as any).isAxiosError = true;
      (timeoutError as any).code = 'ECONNABORTED';
      mockAxios.get.mockRejectedValueOnce(timeoutError);
      mockAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(geocodingService.searchByText('test')).rejects.toMatchObject({
        type: GeocodingErrorType.TIMEOUT,
      });
    });

    it('should handle rate limit errors', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const rateLimitError = new Error('Rate Limited');
      (rateLimitError as any).isAxiosError = true;
      (rateLimitError as any).response = { status: 429 };
      mockAxios.get.mockRejectedValueOnce(rateLimitError);
      mockAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(geocodingService.searchByText('test')).rejects.toMatchObject({
        type: GeocodingErrorType.RATE_LIMIT,
      });
    });

    it('should handle unknown errors', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAxios.get.mockRejectedValueOnce(new Error('Unknown error'));
      mockAxios.isAxiosError = jest.fn().mockReturnValue(false);

      await expect(geocodingService.searchByText('test')).rejects.toMatchObject({
        type: GeocodingErrorType.UNKNOWN,
      });
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['key1', 'key2']));
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await geocodingService.clearCache();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should get cache stats', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(['key1', 'key2']))
        .mockResolvedValueOnce('{"data": []}')
        .mockResolvedValueOnce('{"data": []}');

      const stats = await geocodingService.getCacheStats();

      expect(stats).toHaveProperty('count');
      expect(stats).toHaveProperty('size');
    });
  });

  describe('configuration', () => {
    it('should use provided API key', async () => {
      const service = new GeocodingService({ apiKey: 'custom-key' });
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAxios.get.mockResolvedValueOnce({ data: mockGeocodingResponse });

      await service.searchByText('test');

      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            key: 'custom-key',
          }),
        }),
      );
    });

    it('should use custom timeout', async () => {
      const service = new GeocodingService({ apiKey: 'test', timeoutMs: 10000 });
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAxios.get.mockResolvedValueOnce({ data: mockGeocodingResponse });

      await service.searchByText('test');

      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: 10000,
        }),
      );
    });
  });
});
