/**
 * Onboarding utilities
 * Manages first-time user onboarding state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@faceit:onboarding_complete';

/**
 * Check if user has completed onboarding
 */
export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('[Onboarding] Failed to check onboarding status:', error);
    // Default to showing onboarding if we can't determine status
    return false;
  }
};

/**
 * Mark onboarding as complete
 */
export const setOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('[Onboarding] Failed to set onboarding status:', error);
  }
};

/**
 * Reset onboarding (for testing/development)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
  } catch (error) {
    console.error('[Onboarding] Failed to reset onboarding:', error);
  }
};
