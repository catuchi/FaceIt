/**
 * useAppNavigation hook
 * Type-safe navigation hook for the app
 */

import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';

/**
 * Type-safe navigation hook
 * Use this instead of useNavigation() to get typed navigation methods
 *
 * @example
 * const navigation = useAppNavigation();
 * navigation.navigate('Compass', { location: myLocation });
 */
export const useAppNavigation = () => {
  return useNavigation<RootStackNavigationProp>();
};
