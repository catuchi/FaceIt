/**
 * Navigation types for React Navigation
 */

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Location } from '../types/storage';

/**
 * Root Stack Parameter List
 * Defines all screens and their parameters
 */
export type RootStackParamList = {
  Landing: undefined;
  SearchResults: { query: string };
  Compass: { location: Location };
  Settings: undefined;
  Onboarding: undefined;
};

/**
 * Navigation prop type for any screen
 */
export type RootStackNavigationProp<
  RouteName extends keyof RootStackParamList = keyof RootStackParamList,
> = StackNavigationProp<RootStackParamList, RouteName>;

/**
 * Route prop type for any screen
 */
export type RootStackRouteProp<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;

/**
 * Screen props type helper
 */
export type ScreenProps<RouteName extends keyof RootStackParamList> = {
  navigation: RootStackNavigationProp<RouteName>;
  route: RootStackRouteProp<RouteName>;
};
