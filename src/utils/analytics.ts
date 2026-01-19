/**
 * Analytics Utility
 * Wrapper for Firebase Analytics with typed events
 */

import analytics from '@react-native-firebase/analytics';

// Event names
export const AnalyticsEvents = {
  // Screen views
  SCREEN_VIEW: 'screen_view',

  // Search events
  SEARCH_QUERY: 'search_query',
  SEARCH_SUCCESS: 'search_success',
  SEARCH_FAILURE: 'search_failure',
  SEARCH_RESULT_SELECT: 'search_result_select',

  // Compass events
  COMPASS_VIEW: 'compass_view',
  ALIGNMENT_SUCCESS: 'alignment_success',

  // User actions
  FAVORITE_ADDED: 'favorite_added',
  FAVORITE_REMOVED: 'favorite_removed',
  HISTORY_CLEARED: 'history_cleared',

  // Settings
  SETTING_CHANGED: 'setting_changed',

  // Errors
  GPS_UNAVAILABLE: 'gps_unavailable',
  SENSOR_UNAVAILABLE: 'sensor_unavailable',
  NETWORK_ERROR: 'network_error',
} as const;

// Screen names
export const ScreenNames = {
  LANDING: 'Landing',
  SEARCH_RESULTS: 'SearchResults',
  COMPASS: 'Compass',
  SETTINGS: 'Settings',
  ONBOARDING: 'Onboarding',
} as const;

type EventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
type ScreenName = (typeof ScreenNames)[keyof typeof ScreenNames];

interface SearchParams {
  query: string;
  resultCount?: number;
  errorMessage?: string;
}

interface CompassParams {
  locationName: string;
  bearing: number;
  distance: number;
}

interface FavoriteParams {
  locationName: string;
  locationId: string;
}

interface SettingParams {
  settingName: string;
  oldValue: string;
  newValue: string;
}

interface ErrorParams {
  errorType: string;
  errorMessage: string;
}

/**
 * Analytics service for tracking events and screen views
 */
export const Analytics = {
  /**
   * Log a screen view
   */
  async logScreenView(screenName: ScreenName, screenClass?: string): Promise<void> {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.warn('[Analytics] Failed to log screen view:', error);
    }
  },

  /**
   * Log a custom event
   */
  async logEvent(eventName: EventName, params?: Record<string, unknown>): Promise<void> {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.warn('[Analytics] Failed to log event:', error);
    }
  },

  /**
   * Log a search query
   */
  async logSearch(params: SearchParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.SEARCH_QUERY, {
      search_term: params.query,
    });
  },

  /**
   * Log a successful search
   */
  async logSearchSuccess(params: SearchParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.SEARCH_SUCCESS, {
      search_term: params.query,
      result_count: params.resultCount,
    });
  },

  /**
   * Log a failed search
   */
  async logSearchFailure(params: SearchParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.SEARCH_FAILURE, {
      search_term: params.query,
      error_message: params.errorMessage,
    });
  },

  /**
   * Log compass view
   */
  async logCompassView(params: CompassParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.COMPASS_VIEW, {
      location_name: params.locationName,
      bearing: params.bearing,
      distance: params.distance,
    });
  },

  /**
   * Log alignment success
   */
  async logAlignmentSuccess(params: CompassParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.ALIGNMENT_SUCCESS, {
      location_name: params.locationName,
      bearing: params.bearing,
      distance: params.distance,
    });
  },

  /**
   * Log favorite added
   */
  async logFavoriteAdded(params: FavoriteParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.FAVORITE_ADDED, {
      location_name: params.locationName,
      location_id: params.locationId,
    });
  },

  /**
   * Log favorite removed
   */
  async logFavoriteRemoved(params: FavoriteParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.FAVORITE_REMOVED, {
      location_name: params.locationName,
      location_id: params.locationId,
    });
  },

  /**
   * Log history cleared
   */
  async logHistoryCleared(): Promise<void> {
    await this.logEvent(AnalyticsEvents.HISTORY_CLEARED);
  },

  /**
   * Log setting changed
   */
  async logSettingChanged(params: SettingParams): Promise<void> {
    await this.logEvent(AnalyticsEvents.SETTING_CHANGED, {
      setting_name: params.settingName,
      old_value: params.oldValue,
      new_value: params.newValue,
    });
  },

  /**
   * Log an error
   */
  async logError(params: ErrorParams): Promise<void> {
    const eventName =
      params.errorType === 'gps'
        ? AnalyticsEvents.GPS_UNAVAILABLE
        : params.errorType === 'sensor'
          ? AnalyticsEvents.SENSOR_UNAVAILABLE
          : AnalyticsEvents.NETWORK_ERROR;

    await this.logEvent(eventName, {
      error_message: params.errorMessage,
    });
  },

  /**
   * Set a user property
   */
  async setUserProperty(name: string, value: string | null): Promise<void> {
    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.warn('[Analytics] Failed to set user property:', error);
    }
  },

  /**
   * Set user ID (anonymous)
   */
  async setUserId(userId: string | null): Promise<void> {
    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.warn('[Analytics] Failed to set user ID:', error);
    }
  },

  /**
   * Enable/disable analytics collection
   */
  async setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
    } catch (error) {
      console.warn('[Analytics] Failed to set analytics collection:', error);
    }
  },

  // ========================
  // User Properties
  // ========================

  /**
   * Set distance unit preference
   */
  async setDistanceUnit(unit: 'km' | 'mi'): Promise<void> {
    await this.setUserProperty('distance_unit', unit);
  },

  /**
   * Set first launch date (ISO string)
   */
  async setFirstLaunchDate(date: string): Promise<void> {
    await this.setUserProperty('first_launch_date', date);
  },

  /**
   * Set total searches count
   */
  async setTotalSearches(count: number): Promise<void> {
    await this.setUserProperty('total_searches', count.toString());
  },
};

export default Analytics;
