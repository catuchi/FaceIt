/**
 * AppNavigator
 * Main navigation configuration for the app
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { RootStackParamList } from './types';
import { colors } from '../constants/theme';
import { LandingScreen } from '../screens/Landing';
import { SearchResultsScreen } from '../screens/SearchResults';
import { CompassScreen } from '../screens/Compass';
import { SettingsScreen } from '../screens/Settings';
import { OnboardingScreen } from '../screens/Onboarding';
import { isOnboardingComplete } from '../utils/onboarding';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Landing');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingComplete();
      setInitialRoute(completed ? 'Landing' : 'Onboarding');
    } catch (error) {
      console.error('[AppNavigator] Failed to check onboarding status:', error);
      // Default to Landing if check fails
      setInitialRoute('Landing');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.secondary,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          cardStyle: {
            backgroundColor: colors.background.primary,
          },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{
            title: 'Search Results',
          }}
        />
        <Stack.Screen
          name="Compass"
          component={CompassScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
