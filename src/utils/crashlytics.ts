/**
 * Crashlytics Utility
 * Wrapper for Firebase Crashlytics with helper methods
 */

import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Crashlytics service for error reporting and logging
 */
export const Crashlytics = {
  /**
   * Log a message to Crashlytics
   * Messages appear in the "Logs" tab of crash reports
   */
  log(message: string): void {
    try {
      crashlytics().log(message);
    } catch (error) {
      console.warn('[Crashlytics] Failed to log message:', error);
    }
  },

  /**
   * Record a non-fatal error to Crashlytics
   * Use this to report caught exceptions
   */
  recordError(error: Error, jsErrorName?: string): void {
    try {
      crashlytics().recordError(error, jsErrorName);
    } catch (e) {
      console.warn('[Crashlytics] Failed to record error:', e);
    }
  },

  /**
   * Set a custom key-value pair for crash reports
   * Use to add context to crash reports
   */
  async setCustomKey(key: string, value: string | number | boolean): Promise<void> {
    try {
      await crashlytics().setAttribute(key, String(value));
    } catch (error) {
      console.warn('[Crashlytics] Failed to set custom key:', error);
    }
  },

  /**
   * Set multiple custom key-value pairs at once
   */
  async setCustomKeys(attributes: Record<string, string>): Promise<void> {
    try {
      await crashlytics().setAttributes(attributes);
    } catch (error) {
      console.warn('[Crashlytics] Failed to set custom keys:', error);
    }
  },

  /**
   * Set a user identifier for crash reports (anonymous ID recommended)
   */
  async setUserId(userId: string): Promise<void> {
    try {
      await crashlytics().setUserId(userId);
    } catch (error) {
      console.warn('[Crashlytics] Failed to set user ID:', error);
    }
  },

  /**
   * Enable or disable Crashlytics collection
   */
  async setCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      await crashlytics().setCrashlyticsCollectionEnabled(enabled);
    } catch (error) {
      console.warn('[Crashlytics] Failed to set collection enabled:', error);
    }
  },

  /**
   * Check if Crashlytics collection is enabled
   */
  isCrashlyticsCollectionEnabled(): boolean {
    try {
      return crashlytics().isCrashlyticsCollectionEnabled;
    } catch (error) {
      console.warn('[Crashlytics] Failed to check collection status:', error);
      return false;
    }
  },

  /**
   * Force a crash for testing purposes
   * WARNING: Only use in development!
   */
  testCrash(): void {
    if (__DEV__) {
      console.log('[Crashlytics] Forcing test crash...');
      crashlytics().crash();
    } else {
      console.warn('[Crashlytics] testCrash() is only available in development mode');
    }
  },

  /**
   * Check if the app crashed during the last session
   */
  async didCrashOnPreviousExecution(): Promise<boolean> {
    try {
      return await crashlytics().didCrashOnPreviousExecution();
    } catch (error) {
      console.warn('[Crashlytics] Failed to check previous crash:', error);
      return false;
    }
  },
};

export default Crashlytics;
