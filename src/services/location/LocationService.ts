/**
 * LocationService
 * Handles device location access, permissions, and caching
 */

import Geolocation from 'react-native-geolocation-service';
import { Platform, Linking, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Coordinates,
  LocationPermissionStatus,
  LocationError,
  LocationErrorType,
  CachedLocation,
  LocationServiceConfig,
  LocationSubscription,
} from '../../types/location';

const CACHED_LOCATION_KEY = '@faceit:location:cached';
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_MAXIMUM_AGE = 300000; // 5 minutes
const STALE_THRESHOLD_MINUTES = 5;

export class LocationService {
  private watchId: number | null = null;
  private config: LocationServiceConfig;

  constructor(config?: LocationServiceConfig) {
    this.config = {
      timeout: DEFAULT_TIMEOUT,
      maximumAge: DEFAULT_MAXIMUM_AGE,
      enableHighAccuracy: true,
      distanceFilter: 10,
      showLocationDialog: true,
      forceLocationManager: false,
      ...config,
    };
  }

  /**
   * Check current permission status
   */
  async checkPermission(): Promise<LocationPermissionStatus> {
    if (Platform.OS === 'ios') {
      return this.checkIOSPermission();
    } else {
      return this.checkAndroidPermission();
    }
  }

  /**
   * Check iOS location permission status
   */
  private async checkIOSPermission(): Promise<LocationPermissionStatus> {
    return new Promise(resolve => {
      Geolocation.requestAuthorization('whenInUse').then(status => {
        switch (status) {
          case 'granted':
            resolve(LocationPermissionStatus.GRANTED);
            break;
          case 'denied':
            resolve(LocationPermissionStatus.BLOCKED);
            break;
          case 'disabled':
            resolve(LocationPermissionStatus.DENIED);
            break;
          default:
            resolve(LocationPermissionStatus.NOT_REQUESTED);
        }
      });
    });
  }

  /**
   * Check Android location permission status
   */
  private async checkAndroidPermission(): Promise<LocationPermissionStatus> {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted) {
        return LocationPermissionStatus.GRANTED;
      }

      return LocationPermissionStatus.NOT_REQUESTED;
    } catch (error) {
      console.error('[LocationService] Error checking Android permission:', error);
      return LocationPermissionStatus.DENIED;
    }
  }

  /**
   * Request location permission
   */
  async requestPermission(): Promise<LocationPermissionStatus> {
    if (Platform.OS === 'ios') {
      return this.checkIOSPermission(); // iOS handles request automatically
    } else {
      return this.requestAndroidPermission();
    }
  }

  /**
   * Request Android location permission
   */
  private async requestAndroidPermission(): Promise<LocationPermissionStatus> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'FaceIt needs access to your location to calculate the direction and distance to your selected destination.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return LocationPermissionStatus.GRANTED;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return LocationPermissionStatus.BLOCKED;
      } else {
        return LocationPermissionStatus.DENIED;
      }
    } catch (error) {
      console.error('[LocationService] Error requesting Android permission:', error);
      throw new LocationError(
        'Failed to request location permission',
        LocationErrorType.INTERNAL_ERROR,
        undefined,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Open device settings for the app
   */
  async openSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('[LocationService] Error opening settings:', error);
      throw new LocationError(
        'Failed to open settings',
        LocationErrorType.INTERNAL_ERROR,
        undefined,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<Coordinates> {
    // Check permission first
    const permission = await this.checkPermission();
    if (permission !== LocationPermissionStatus.GRANTED) {
      throw new LocationError(
        'Location permission not granted',
        LocationErrorType.PERMISSION_DENIED,
      );
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
            timestamp: position.timestamp,
          };

          // Cache the location
          this.cacheLocation(coordinates);

          resolve(coordinates);
        },
        error => {
          reject(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge,
          showLocationDialog: this.config.showLocationDialog,
          forceLocationManager: this.config.forceLocationManager,
        },
      );
    });
  }

  /**
   * Watch location updates
   */
  watchLocation(callback: (coordinates: Coordinates) => void): LocationSubscription {
    const watchId = Geolocation.watchPosition(
      position => {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          timestamp: position.timestamp,
        };

        // Cache the location
        this.cacheLocation(coordinates);

        callback(coordinates);
      },
      error => {
        console.error('[LocationService] Watch position error:', error);
      },
      {
        enableHighAccuracy: this.config.enableHighAccuracy,
        distanceFilter: this.config.distanceFilter,
        interval: 1000,
        fastestInterval: 500,
        showLocationDialog: this.config.showLocationDialog,
        forceLocationManager: this.config.forceLocationManager,
      },
    );

    this.watchId = watchId;

    return {
      id: watchId,
      remove: () => this.stopWatchingLocation(watchId),
    };
  }

  /**
   * Stop watching location
   */
  stopWatchingLocation(watchId?: number): void {
    const idToRemove = watchId ?? this.watchId;
    if (idToRemove !== null) {
      Geolocation.clearWatch(idToRemove);
      if (idToRemove === this.watchId) {
        this.watchId = null;
      }
    }
  }

  /**
   * Cache location to AsyncStorage
   */
  private async cacheLocation(coordinates: Coordinates): Promise<void> {
    try {
      const cached: CachedLocation = {
        coordinates,
        timestamp: Date.now(),
        isStale: false,
        ageInMinutes: 0,
      };

      await AsyncStorage.setItem(CACHED_LOCATION_KEY, JSON.stringify(cached));
    } catch (error) {
      console.error('[LocationService] Error caching location:', error);
    }
  }

  /**
   * Get cached location
   */
  async getCachedLocation(): Promise<CachedLocation | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHED_LOCATION_KEY);
      if (!cached) {
        return null;
      }

      const cachedLocation: CachedLocation = JSON.parse(cached);
      const now = Date.now();
      const ageMs = now - cachedLocation.timestamp;
      const ageMinutes = Math.floor(ageMs / 60000);

      return {
        ...cachedLocation,
        isStale: ageMinutes >= STALE_THRESHOLD_MINUTES,
        ageInMinutes: ageMinutes,
      };
    } catch (error) {
      console.error('[LocationService] Error retrieving cached location:', error);
      return null;
    }
  }

  /**
   * Get location with fallback to cache
   */
  async getLocationWithFallback(): Promise<{
    coordinates: Coordinates;
    fromCache: boolean;
    ageInMinutes?: number;
  }> {
    try {
      const coordinates = await this.getCurrentLocation();
      return { coordinates, fromCache: false };
    } catch (error) {
      // Try to get cached location
      const cached = await this.getCachedLocation();
      if (cached) {
        return {
          coordinates: cached.coordinates,
          fromCache: true,
          ageInMinutes: cached.ageInMinutes,
        };
      }

      // No cached location available, rethrow error
      throw error;
    }
  }

  /**
   * Clear cached location
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHED_LOCATION_KEY);
    } catch (error) {
      console.error('[LocationService] Error clearing cache:', error);
    }
  }

  /**
   * Handle geolocation errors
   */
  private handleGeolocationError(error: any): LocationError {
    let errorType: LocationErrorType;
    let message: string;

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        errorType = LocationErrorType.PERMISSION_DENIED;
        message = 'Location permission denied';
        break;
      case 2: // POSITION_UNAVAILABLE
        errorType = LocationErrorType.POSITION_UNAVAILABLE;
        message = 'Location unavailable. Please check your GPS settings.';
        break;
      case 3: // TIMEOUT
        errorType = LocationErrorType.TIMEOUT;
        message = 'Location request timed out';
        break;
      case 4: // PLAY_SERVICES_NOT_AVAILABLE (Android)
        errorType = LocationErrorType.PLAY_SERVICES_NOT_AVAILABLE;
        message = 'Google Play Services not available';
        break;
      case 5: // SETTINGS_NOT_SATISFIED (Android)
        errorType = LocationErrorType.SETTINGS_NOT_SATISFIED;
        message = 'Location settings not satisfied';
        break;
      default:
        errorType = LocationErrorType.UNKNOWN;
        message = error.message || 'Unknown location error';
    }

    return new LocationError(message, errorType, error.code, error);
  }
}
