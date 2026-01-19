/**
 * FaceIt App
 * Main application entry point
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNavigator } from './src/navigation';
import { Analytics, Crashlytics } from './src/utils';

const FIRST_LAUNCH_DATE_KEY = '@faceit:first_launch_date';
const ANONYMOUS_USER_ID_KEY = '@faceit:anonymous_user_id';

function App(): React.JSX.Element {
  // Initialize analytics and crashlytics on app start
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Check and set first launch date
        const firstLaunchDate = await AsyncStorage.getItem(FIRST_LAUNCH_DATE_KEY);
        if (!firstLaunchDate) {
          const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          await AsyncStorage.setItem(FIRST_LAUNCH_DATE_KEY, now);
          await Analytics.setFirstLaunchDate(now);
        } else {
          await Analytics.setFirstLaunchDate(firstLaunchDate);
        }

        // Generate or retrieve anonymous user ID for Crashlytics
        let anonymousUserId = await AsyncStorage.getItem(ANONYMOUS_USER_ID_KEY);
        if (!anonymousUserId) {
          anonymousUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, anonymousUserId);
        }
        await Crashlytics.setUserId(anonymousUserId);

        // Log app start
        Crashlytics.log('App started');

        // Check if previous session crashed
        const didCrash = await Crashlytics.didCrashOnPreviousExecution();
        if (didCrash) {
          Crashlytics.log('Recovered from previous crash');
        }
      } catch (error) {
        console.warn('[App] Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
