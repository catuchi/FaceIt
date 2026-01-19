/**
 * StorageService
 * Handles local persistence of search history, favorites, and user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Location,
  FavoriteLocation,
  UserPreferences,
  StorageKeys,
  StorageError,
  StorageErrorType,
  StorageServiceConfig,
} from '../../types/storage';

const DEFAULT_MAX_HISTORY_ITEMS = 10;
const DEFAULT_PREFERENCES: UserPreferences = {
  distanceUnit: 'km',
  hapticFeedbackEnabled: true,
};

export class StorageService {
  private config: Required<StorageServiceConfig>;

  constructor(config?: StorageServiceConfig) {
    this.config = {
      maxHistoryItems: config?.maxHistoryItems || DEFAULT_MAX_HISTORY_ITEMS,
      enableLogging: config?.enableLogging || false,
    };
  }

  // ========== SEARCH HISTORY ==========

  /**
   * Add a location to search history
   * - Prevents duplicates (by coordinates)
   * - Keeps newest first (LIFO)
   * - Limits to maxHistoryItems
   */
  async addToHistory(location: Location): Promise<void> {
    try {
      const history = await this.getHistory();

      // Remove duplicate if exists (matching by coordinates)
      const filteredHistory = history.filter(
        item =>
          !(
            item.coordinates.latitude === location.coordinates.latitude &&
            item.coordinates.longitude === location.coordinates.longitude
          ),
      );

      // Add new location at the beginning
      const updatedHistory = [location, ...filteredHistory];

      // Limit to max items
      const trimmedHistory = updatedHistory.slice(0, this.config.maxHistoryItems);

      await AsyncStorage.setItem(StorageKeys.SEARCH_HISTORY, JSON.stringify(trimmedHistory));

      if (this.config.enableLogging) {
        console.log('[StorageService] Added to history:', location.name);
      }
    } catch (error) {
      throw new StorageError(
        StorageErrorType.WRITE_ERROR,
        'Failed to add location to history',
        error as Error,
      );
    }
  }

  /**
   * Get search history
   * Returns array sorted by timestamp (newest first)
   */
  async getHistory(): Promise<Location[]> {
    try {
      const historyJson = await AsyncStorage.getItem(StorageKeys.SEARCH_HISTORY);

      if (!historyJson) {
        return [];
      }

      const history: Location[] = JSON.parse(historyJson);
      return history;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError(
          StorageErrorType.PARSE_ERROR,
          'Failed to parse history data',
          error as Error,
        );
      }
      throw new StorageError(StorageErrorType.READ_ERROR, 'Failed to read history', error as Error);
    }
  }

  /**
   * Clear all search history
   */
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(StorageKeys.SEARCH_HISTORY);

      if (this.config.enableLogging) {
        console.log('[StorageService] Cleared search history');
      }
    } catch (error) {
      throw new StorageError(
        StorageErrorType.WRITE_ERROR,
        'Failed to clear history',
        error as Error,
      );
    }
  }

  // ========== FAVORITES ==========

  /**
   * Add a location to favorites
   * @param location - Location to favorite
   * @param customLabel - Optional custom label for the favorite
   */
  async addFavorite(location: Location, customLabel?: string): Promise<FavoriteLocation> {
    try {
      const favorites = await this.getFavorites();

      // Check if already favorited (by coordinates)
      const exists = favorites.some(
        fav =>
          fav.coordinates.latitude === location.coordinates.latitude &&
          fav.coordinates.longitude === location.coordinates.longitude,
      );

      if (exists) {
        throw new StorageError(StorageErrorType.WRITE_ERROR, 'Location is already in favorites');
      }

      const favorite: FavoriteLocation = {
        ...location,
        customLabel,
        savedDate: Date.now(),
      };

      const updatedFavorites = [...favorites, favorite];

      await AsyncStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(updatedFavorites));

      if (this.config.enableLogging) {
        console.log('[StorageService] Added to favorites:', favorite.name);
      }

      return favorite;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        StorageErrorType.WRITE_ERROR,
        'Failed to add favorite',
        error as Error,
      );
    }
  }

  /**
   * Get all favorites
   * Returns array sorted by savedDate (newest first)
   */
  async getFavorites(): Promise<FavoriteLocation[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(StorageKeys.FAVORITES);

      if (!favoritesJson) {
        return [];
      }

      const favorites: FavoriteLocation[] = JSON.parse(favoritesJson);

      // Sort by savedDate (newest first)
      return favorites.sort((a, b) => b.savedDate - a.savedDate);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError(
          StorageErrorType.PARSE_ERROR,
          'Failed to parse favorites data',
          error as Error,
        );
      }
      throw new StorageError(
        StorageErrorType.READ_ERROR,
        'Failed to read favorites',
        error as Error,
      );
    }
  }

  /**
   * Delete a favorite by ID
   */
  async deleteFavorite(id: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();

      const updatedFavorites = favorites.filter(fav => fav.id !== id);

      if (updatedFavorites.length === favorites.length) {
        throw new StorageError(StorageErrorType.NOT_FOUND, 'Favorite not found');
      }

      await AsyncStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(updatedFavorites));

      if (this.config.enableLogging) {
        console.log('[StorageService] Deleted favorite:', id);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        StorageErrorType.WRITE_ERROR,
        'Failed to delete favorite',
        error as Error,
      );
    }
  }

  /**
   * Update a favorite's custom label
   */
  async updateFavorite(id: string, customLabel: string): Promise<FavoriteLocation> {
    try {
      const favorites = await this.getFavorites();

      const favoriteIndex = favorites.findIndex(fav => fav.id === id);

      if (favoriteIndex === -1) {
        throw new StorageError(StorageErrorType.NOT_FOUND, 'Favorite not found');
      }

      const updatedFavorite: FavoriteLocation = {
        ...favorites[favoriteIndex],
        customLabel,
      };

      favorites[favoriteIndex] = updatedFavorite;

      await AsyncStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(favorites));

      if (this.config.enableLogging) {
        console.log('[StorageService] Updated favorite:', id);
      }

      return updatedFavorite;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        StorageErrorType.WRITE_ERROR,
        'Failed to update favorite',
        error as Error,
      );
    }
  }

  /**
   * Check if a location is favorited
   */
  async isFavorited(coordinates: { latitude: number; longitude: number }): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();

      return favorites.some(
        fav =>
          fav.coordinates.latitude === coordinates.latitude &&
          fav.coordinates.longitude === coordinates.longitude,
      );
    } catch (error) {
      // If there's an error reading favorites, assume not favorited
      if (this.config.enableLogging) {
        console.warn('[StorageService] Failed to check favorite status:', error);
      }
      return false;
    }
  }

  // ========== PREFERENCES ==========

  /**
   * Get user preferences
   * Returns default preferences if none are saved
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const preferencesJson = await AsyncStorage.getItem(StorageKeys.PREFERENCES);

      if (!preferencesJson) {
        return DEFAULT_PREFERENCES;
      }

      const preferences: UserPreferences = JSON.parse(preferencesJson);

      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_PREFERENCES,
        ...preferences,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        // If parse error, return defaults
        if (this.config.enableLogging) {
          console.warn('[StorageService] Failed to parse preferences, using defaults');
        }
        return DEFAULT_PREFERENCES;
      }
      throw new StorageError(
        StorageErrorType.READ_ERROR,
        'Failed to read preferences',
        error as Error,
      );
    }
  }

  /**
   * Set a specific preference value
   */
  async setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ): Promise<void> {
    try {
      const preferences = await this.getPreferences();

      const updatedPreferences: UserPreferences = {
        ...preferences,
        [key]: value,
      };

      await AsyncStorage.setItem(StorageKeys.PREFERENCES, JSON.stringify(updatedPreferences));

      if (this.config.enableLogging) {
        console.log('[StorageService] Updated preference:', key, '=', value);
      }
    } catch (error) {
      throw new StorageError(
        StorageErrorType.WRITE_ERROR,
        'Failed to set preference',
        error as Error,
      );
    }
  }

  /**
   * Get a specific preference value
   */
  async getPreference<K extends keyof UserPreferences>(key: K): Promise<UserPreferences[K]> {
    try {
      const preferences = await this.getPreferences();
      return preferences[key];
    } catch (error) {
      throw new StorageError(
        StorageErrorType.READ_ERROR,
        'Failed to get preference',
        error as Error,
      );
    }
  }

  // ========== UTILITY ==========

  /**
   * Clear all stored data (history, favorites, preferences)
   * Use with caution - this is destructive
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        StorageKeys.SEARCH_HISTORY,
        StorageKeys.FAVORITES,
        StorageKeys.PREFERENCES,
      ]);

      if (this.config.enableLogging) {
        console.log('[StorageService] Cleared all data');
      }
    } catch (error) {
      throw new StorageError(
        StorageErrorType.WRITE_ERROR,
        'Failed to clear all data',
        error as Error,
      );
    }
  }

  /**
   * Get storage usage information (for debugging)
   */
  async getStorageInfo(): Promise<{
    historyCount: number;
    favoritesCount: number;
    hasPreferences: boolean;
  }> {
    try {
      const history = await this.getHistory();
      const favorites = await this.getFavorites();
      const preferencesJson = await AsyncStorage.getItem(StorageKeys.PREFERENCES);

      return {
        historyCount: history.length,
        favoritesCount: favorites.length,
        hasPreferences: preferencesJson !== null,
      };
    } catch (error) {
      throw new StorageError(
        StorageErrorType.READ_ERROR,
        'Failed to get storage info',
        error as Error,
      );
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
