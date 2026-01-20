/**
 * PopularLocationsService
 * Manages popular locations from Firebase Remote Config
 */

import remoteConfig from '@react-native-firebase/remote-config';
import { Coordinates } from '../../types/location';

export interface PopularLocation {
  id: string;
  name: string;
  subtitle: string;
  coordinates: Coordinates;
  address: string;
  emoji: string;
  category?: 'religious' | 'landmark' | 'natural' | 'city';
}

// Default popular locations (fallback)
const DEFAULT_POPULAR_LOCATIONS: PopularLocation[] = [
  {
    id: 'eiffel_tower',
    name: 'Eiffel Tower',
    subtitle: 'Paris, France',
    coordinates: { latitude: 48.8584, longitude: 2.2945, timestamp: Date.now() },
    address: 'Paris, France',
    emoji: '🗼',
    category: 'landmark',
  },
  {
    id: 'statue_liberty',
    name: 'Statue of Liberty',
    subtitle: 'New York, USA',
    coordinates: { latitude: 40.6892, longitude: -74.0445, timestamp: Date.now() },
    address: 'New York, USA',
    emoji: '🗽',
    category: 'landmark',
  },
  {
    id: 'taj_mahal',
    name: 'Taj Mahal',
    subtitle: 'Agra, India',
    coordinates: { latitude: 27.1751, longitude: 78.0421, timestamp: Date.now() },
    address: 'Agra, India',
    emoji: '🏛️',
    category: 'landmark',
  },
  {
    id: 'christ_redeemer',
    name: 'Christ Redeemer',
    subtitle: 'Rio, Brazil',
    coordinates: { latitude: -22.9519, longitude: -43.2105, timestamp: Date.now() },
    address: 'Rio de Janeiro, Brazil',
    emoji: '⛪',
    category: 'religious',
  },
  {
    id: 'great_wall',
    name: 'Great Wall',
    subtitle: 'China',
    coordinates: { latitude: 40.4319, longitude: 116.5704, timestamp: Date.now() },
    address: 'Beijing, China',
    emoji: '🏯',
    category: 'landmark',
  },
  {
    id: 'vatican_city',
    name: 'Vatican City',
    subtitle: 'Rome, Italy',
    coordinates: { latitude: 41.9029, longitude: 12.4534, timestamp: Date.now() },
    address: 'Vatican City',
    emoji: '⛪',
    category: 'religious',
  },
  {
    id: 'machu_picchu',
    name: 'Machu Picchu',
    subtitle: 'Peru',
    coordinates: { latitude: -13.1631, longitude: -72.545, timestamp: Date.now() },
    address: 'Cusco Region, Peru',
    emoji: '🏔️',
    category: 'landmark',
  },
  {
    id: 'colosseum',
    name: 'Colosseum',
    subtitle: 'Rome, Italy',
    coordinates: { latitude: 41.8902, longitude: 12.4922, timestamp: Date.now() },
    address: 'Rome, Italy',
    emoji: '🏛️',
    category: 'landmark',
  },
  {
    id: 'golden_temple',
    name: 'Golden Temple',
    subtitle: 'Amritsar, India',
    coordinates: { latitude: 31.62, longitude: 74.8765, timestamp: Date.now() },
    address: 'Amritsar, Punjab, India',
    emoji: '🛕',
    category: 'religious',
  },
  {
    id: 'petra',
    name: 'Petra',
    subtitle: 'Jordan',
    coordinates: { latitude: 30.3285, longitude: 35.4444, timestamp: Date.now() },
    address: "Ma'an Governorate, Jordan",
    emoji: '🏜️',
    category: 'landmark',
  },
  {
    id: 'mount_everest',
    name: 'Mount Everest',
    subtitle: 'Nepal/Tibet',
    coordinates: { latitude: 27.9881, longitude: 86.925, timestamp: Date.now() },
    address: 'Nepal/Tibet Border',
    emoji: '🏔️',
    category: 'natural',
  },
];

const REMOTE_CONFIG_KEY = 'popular_locations';
const FETCH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

class PopularLocationsServiceClass {
  private initialized = false;
  private cachedLocations: PopularLocation[] = [];

  /**
   * Initialize Remote Config with defaults and fetch latest values
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Set default values
      await remoteConfig().setDefaults({
        [REMOTE_CONFIG_KEY]: JSON.stringify(DEFAULT_POPULAR_LOCATIONS),
      });

      // Set minimum fetch interval (development: 0, production: 1 hour)
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: __DEV__ ? 0 : FETCH_INTERVAL_MS,
      });

      // Fetch and activate
      const fetchedRemotely = await remoteConfig().fetchAndActivate();

      if (fetchedRemotely) {
        console.log('[PopularLocationsService] Remote config fetched and activated');
      } else {
        console.log('[PopularLocationsService] Using cached/default config');
      }

      // Parse and cache locations
      this.cachedLocations = this.parseLocations();
      this.initialized = true;
    } catch (error) {
      console.error('[PopularLocationsService] Failed to initialize:', error);
      // Fall back to defaults
      this.cachedLocations = DEFAULT_POPULAR_LOCATIONS;
      this.initialized = true;
    }
  }

  /**
   * Parse popular locations from Remote Config
   */
  private parseLocations(): PopularLocation[] {
    try {
      const value = remoteConfig().getValue(REMOTE_CONFIG_KEY);
      const jsonString = value.asString();

      if (!jsonString) {
        return DEFAULT_POPULAR_LOCATIONS;
      }

      const parsed = JSON.parse(jsonString) as PopularLocation[];

      // Validate and add timestamps
      return parsed.map(location => ({
        ...location,
        coordinates: {
          ...location.coordinates,
          timestamp: location.coordinates.timestamp || Date.now(),
        },
      }));
    } catch (error) {
      console.error('[PopularLocationsService] Failed to parse locations:', error);
      return DEFAULT_POPULAR_LOCATIONS;
    }
  }

  /**
   * Get all popular locations
   */
  async getPopularLocations(): Promise<PopularLocation[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.cachedLocations;
  }

  /**
   * Get popular locations by category
   */
  async getLocationsByCategory(
    category: 'religious' | 'landmark' | 'natural' | 'city',
  ): Promise<PopularLocation[]> {
    const locations = await this.getPopularLocations();
    return locations.filter(loc => loc.category === category);
  }

  /**
   * Force refresh from Remote Config
   */
  async refresh(): Promise<void> {
    try {
      await remoteConfig().fetch(0); // Force fetch
      await remoteConfig().activate();
      this.cachedLocations = this.parseLocations();
      console.log('[PopularLocationsService] Refreshed popular locations');
    } catch (error) {
      console.error('[PopularLocationsService] Failed to refresh:', error);
    }
  }

  /**
   * Get default locations (no Remote Config)
   */
  getDefaultLocations(): PopularLocation[] {
    return DEFAULT_POPULAR_LOCATIONS;
  }
}

export const PopularLocationsService = new PopularLocationsServiceClass();
export default PopularLocationsService;
