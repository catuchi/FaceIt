/**
 * Storage types for persisting user data
 */

import { Coordinates } from './location';

/**
 * Base location information
 */
export interface Location {
  id: string;
  name: string;
  coordinates: Coordinates;
  address?: string;
  timestamp: number;
}

/**
 * Favorite location with optional custom label
 */
export interface FavoriteLocation extends Location {
  customLabel?: string;
  savedDate: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  distanceUnit: 'km' | 'mi';
  hapticFeedbackEnabled: boolean;
  theme?: 'dark' | 'light' | 'system'; // Future feature
}

/**
 * Storage keys used throughout the app
 */
export enum StorageKeys {
  SEARCH_HISTORY = '@faceit:search_history',
  FAVORITES = '@faceit:favorites',
  PREFERENCES = '@faceit:preferences',
}

/**
 * Error types for storage operations
 */
export enum StorageErrorType {
  READ_ERROR = 'READ_ERROR',
  WRITE_ERROR = 'WRITE_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NOT_FOUND = 'NOT_FOUND',
}

/**
 * Storage error class
 */
export class StorageError extends Error {
  type: StorageErrorType;
  originalError?: Error;

  constructor(type: StorageErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = 'StorageError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Storage service configuration
 */
export interface StorageServiceConfig {
  maxHistoryItems?: number;
  enableLogging?: boolean;
}
