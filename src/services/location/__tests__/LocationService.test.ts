/**
 * LocationService Unit Tests
 * Tests for location access, permissions, and caching
 */

import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationService } from '../LocationService';
import { LocationPermissionStatus, LocationErrorType } from '../../../types/location';

// Mock Geolocation (already mocked in jest.setup.js but we need to control it)
jest.mock('react-native-geolocation-service');

// Get mocked modules
const mockGeolocation = Geolocation as jest.Mocked<typeof Geolocation>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  Linking: {
    openSettings: jest.fn(),
  },
  PermissionsAndroid: {
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
  },
}));

const mockPosition = {
  coords: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    altitude: 50,
    altitudeAccuracy: 5,
    heading: 90,
    speed: 0,
  },
  timestamp: Date.now(),
};

describe('LocationService', () => {
  let locationService: LocationService;

  beforeEach(() => {
    jest.clearAllMocks();
    locationService = new LocationService();

    // Default mock implementations
    mockGeolocation.requestAuthorization.mockResolvedValue('granted');
    mockGeolocation.getCurrentPosition.mockImplementation(success => {
      success(mockPosition);
    });
    mockGeolocation.watchPosition.mockReturnValue(1);
    mockGeolocation.clearWatch.mockImplementation(() => {});
  });

  describe('checkPermission', () => {
    describe('iOS', () => {
      beforeEach(() => {
        (Platform as any).OS = 'ios';
      });

      it('should return GRANTED when permission is granted', async () => {
        mockGeolocation.requestAuthorization.mockResolvedValueOnce('granted');

        const status = await locationService.checkPermission();

        expect(status).toBe(LocationPermissionStatus.GRANTED);
        expect(mockGeolocation.requestAuthorization).toHaveBeenCalledWith('whenInUse');
      });

      it('should return BLOCKED when permission is denied', async () => {
        mockGeolocation.requestAuthorization.mockResolvedValueOnce('denied');

        const status = await locationService.checkPermission();

        expect(status).toBe(LocationPermissionStatus.BLOCKED);
      });

      it('should return DENIED when location is disabled', async () => {
        mockGeolocation.requestAuthorization.mockResolvedValueOnce('disabled');

        const status = await locationService.checkPermission();

        expect(status).toBe(LocationPermissionStatus.DENIED);
      });

      it('should return NOT_REQUESTED for unknown status', async () => {
        mockGeolocation.requestAuthorization.mockResolvedValueOnce('restricted' as any);

        const status = await locationService.checkPermission();

        expect(status).toBe(LocationPermissionStatus.NOT_REQUESTED);
      });
    });

    describe('Android', () => {
      beforeEach(() => {
        (Platform as any).OS = 'android';
      });

      it('should return GRANTED when permission check returns true', async () => {
        (PermissionsAndroid.check as jest.Mock).mockResolvedValueOnce(true);

        const status = await locationService.checkPermission();

        expect(status).toBe(LocationPermissionStatus.GRANTED);
        expect(PermissionsAndroid.check).toHaveBeenCalledWith(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      });

      it('should return NOT_REQUESTED when permission check returns false', async () => {
        (PermissionsAndroid.check as jest.Mock).mockResolvedValueOnce(false);

        const status = await locationService.checkPermission();

        expect(status).toBe(LocationPermissionStatus.NOT_REQUESTED);
      });

      it('should return DENIED when permission check throws', async () => {
        (PermissionsAndroid.check as jest.Mock).mockRejectedValueOnce(new Error('Check failed'));

        const status = await locationService.checkPermission();

        expect(status).toBe(LocationPermissionStatus.DENIED);
      });
    });
  });

  describe('requestPermission', () => {
    describe('Android', () => {
      beforeEach(() => {
        (Platform as any).OS = 'android';
      });

      it('should return GRANTED when user grants permission', async () => {
        (PermissionsAndroid.request as jest.Mock).mockResolvedValueOnce(
          PermissionsAndroid.RESULTS.GRANTED,
        );

        const status = await locationService.requestPermission();

        expect(status).toBe(LocationPermissionStatus.GRANTED);
      });

      it('should return DENIED when user denies permission', async () => {
        (PermissionsAndroid.request as jest.Mock).mockResolvedValueOnce(
          PermissionsAndroid.RESULTS.DENIED,
        );

        const status = await locationService.requestPermission();

        expect(status).toBe(LocationPermissionStatus.DENIED);
      });

      it('should return BLOCKED when user selects never ask again', async () => {
        (PermissionsAndroid.request as jest.Mock).mockResolvedValueOnce(
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        );

        const status = await locationService.requestPermission();

        expect(status).toBe(LocationPermissionStatus.BLOCKED);
      });

      it('should throw INTERNAL_ERROR when request fails', async () => {
        (PermissionsAndroid.request as jest.Mock).mockRejectedValueOnce(
          new Error('Request failed'),
        );

        await expect(locationService.requestPermission()).rejects.toMatchObject({
          type: LocationErrorType.INTERNAL_ERROR,
        });
      });
    });

    describe('iOS', () => {
      beforeEach(() => {
        (Platform as any).OS = 'ios';
      });

      it('should call checkIOSPermission for iOS', async () => {
        mockGeolocation.requestAuthorization.mockResolvedValueOnce('granted');

        const status = await locationService.requestPermission();

        expect(status).toBe(LocationPermissionStatus.GRANTED);
      });
    });
  });

  describe('openSettings', () => {
    it('should call Linking.openSettings', async () => {
      (Linking.openSettings as jest.Mock).mockResolvedValueOnce(undefined);

      await locationService.openSettings();

      expect(Linking.openSettings).toHaveBeenCalled();
    });

    it('should throw INTERNAL_ERROR when openSettings fails', async () => {
      (Linking.openSettings as jest.Mock).mockRejectedValueOnce(new Error('Cannot open settings'));

      await expect(locationService.openSettings()).rejects.toMatchObject({
        type: LocationErrorType.INTERNAL_ERROR,
      });
    });
  });

  describe('getCurrentLocation', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
      mockGeolocation.requestAuthorization.mockResolvedValue('granted');
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('should return coordinates when successful', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce(success => {
        success(mockPosition);
      });

      const coordinates = await locationService.getCurrentLocation();

      expect(coordinates.latitude).toBe(37.7749);
      expect(coordinates.longitude).toBe(-122.4194);
      expect(coordinates.accuracy).toBe(10);
      expect(coordinates.timestamp).toBeDefined();
    });

    it('should cache location after getting it', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce(success => {
        success(mockPosition);
      });

      await locationService.getCurrentLocation();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@faceit:location:cached',
        expect.stringContaining('37.7749'),
      );
    });

    it('should throw PERMISSION_DENIED when not granted', async () => {
      mockGeolocation.requestAuthorization.mockResolvedValueOnce('denied');

      await expect(locationService.getCurrentLocation()).rejects.toMatchObject({
        type: LocationErrorType.PERMISSION_DENIED,
      });
    });

    it('should throw TIMEOUT error on timeout', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error?) => {
        error?.({ code: 3, message: 'Timeout' });
      });

      await expect(locationService.getCurrentLocation()).rejects.toMatchObject({
        type: LocationErrorType.TIMEOUT,
      });
    });

    it('should throw POSITION_UNAVAILABLE error', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error?) => {
        error?.({ code: 2, message: 'Position unavailable' });
      });

      await expect(locationService.getCurrentLocation()).rejects.toMatchObject({
        type: LocationErrorType.POSITION_UNAVAILABLE,
      });
    });

    it('should throw PLAY_SERVICES_NOT_AVAILABLE error', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error?) => {
        error?.({ code: 4, message: 'Play Services not available' });
      });

      await expect(locationService.getCurrentLocation()).rejects.toMatchObject({
        type: LocationErrorType.PLAY_SERVICES_NOT_AVAILABLE,
      });
    });

    it('should throw SETTINGS_NOT_SATISFIED error', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error?) => {
        error?.({ code: 5, message: 'Settings not satisfied' });
      });

      await expect(locationService.getCurrentLocation()).rejects.toMatchObject({
        type: LocationErrorType.SETTINGS_NOT_SATISFIED,
      });
    });

    it('should use custom config options', async () => {
      const customService = new LocationService({
        timeout: 10000,
        enableHighAccuracy: false,
      });

      mockGeolocation.getCurrentPosition.mockImplementationOnce(success => {
        success(mockPosition);
      });

      await customService.getCurrentLocation();

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          timeout: 10000,
          enableHighAccuracy: false,
        }),
      );
    });
  });

  describe('watchLocation', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('should return subscription with id and remove function', () => {
      const callback = jest.fn();
      const subscription = locationService.watchLocation(callback);

      expect(subscription.id).toBe(1);
      expect(typeof subscription.remove).toBe('function');
    });

    it('should call callback with coordinates on position update', () => {
      const callback = jest.fn();

      mockGeolocation.watchPosition.mockImplementationOnce(success => {
        success(mockPosition);
        return 1;
      });

      locationService.watchLocation(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 37.7749,
          longitude: -122.4194,
        }),
      );
    });

    it('should cache location on position update', () => {
      const callback = jest.fn();

      mockGeolocation.watchPosition.mockImplementationOnce(success => {
        success(mockPosition);
        return 1;
      });

      locationService.watchLocation(callback);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('stopWatchingLocation', () => {
    it('should clear watch by id', () => {
      const callback = jest.fn();
      const subscription = locationService.watchLocation(callback);

      subscription.remove();

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(1);
    });

    it('should clear internal watchId when not provided', () => {
      const callback = jest.fn();
      locationService.watchLocation(callback);

      locationService.stopWatchingLocation();

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(1);
    });
  });

  describe('getCachedLocation', () => {
    it('should return null when no cached location', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const cached = await locationService.getCachedLocation();

      expect(cached).toBeNull();
    });

    it('should return cached location with age info', async () => {
      const recentCache = {
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        isStale: false,
        ageInMinutes: 0,
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(recentCache));

      const cached = await locationService.getCachedLocation();

      expect(cached).not.toBeNull();
      expect(cached?.coordinates.latitude).toBe(37.7749);
      expect(cached?.isStale).toBe(false);
    });

    it('should mark old cache as stale', async () => {
      const oldCache = {
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes old
        },
        timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes old
        isStale: false,
        ageInMinutes: 0,
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(oldCache));

      const cached = await locationService.getCachedLocation();

      expect(cached?.isStale).toBe(true);
      expect(cached?.ageInMinutes).toBeGreaterThanOrEqual(10);
    });

    it('should return null on parse error', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const cached = await locationService.getCachedLocation();

      expect(cached).toBeNull();
    });
  });

  describe('getLocationWithFallback', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
      mockGeolocation.requestAuthorization.mockResolvedValue('granted');
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('should return fresh location when available', async () => {
      mockGeolocation.getCurrentPosition.mockImplementationOnce(success => {
        success(mockPosition);
      });

      const result = await locationService.getLocationWithFallback();

      expect(result.fromCache).toBe(false);
      expect(result.coordinates.latitude).toBe(37.7749);
    });

    it('should return cached location when getCurrentLocation fails', async () => {
      // First, make permission check pass
      mockGeolocation.requestAuthorization.mockResolvedValue('granted');

      // Make getCurrentPosition fail
      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error?) => {
        error?.({ code: 3, message: 'Timeout' });
      });

      // Have cached location available
      const cachedData = {
        coordinates: {
          latitude: 40.0,
          longitude: -75.0,
          timestamp: Date.now() - 60000,
        },
        timestamp: Date.now() - 60000,
        isStale: false,
        ageInMinutes: 1,
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await locationService.getLocationWithFallback();

      expect(result.fromCache).toBe(true);
      expect(result.coordinates.latitude).toBe(40.0);
      expect(result.ageInMinutes).toBeDefined();
    });

    it('should throw error when no cached location available', async () => {
      // Make permission check pass
      mockGeolocation.requestAuthorization.mockResolvedValue('granted');

      // Make getCurrentPosition fail
      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error?) => {
        error?.({ code: 3, message: 'Timeout' });
      });

      // No cached location
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await expect(locationService.getLocationWithFallback()).rejects.toMatchObject({
        type: LocationErrorType.TIMEOUT,
      });
    });
  });

  describe('clearCache', () => {
    it('should remove cached location from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

      await locationService.clearCache();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@faceit:location:cached');
    });
  });
});
