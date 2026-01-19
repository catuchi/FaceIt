/**
 * LandingScreen
 * Main landing page with search, history, and popular locations
 * Design: Flighty-inspired dark UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenProps } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { storageService } from '../../services/storage';
import {
  PopularLocationsService,
  PopularLocation,
} from '../../services/remoteConfig/PopularLocationsService';
import { Location } from '../../types/storage';
import { Analytics, ScreenNames } from '../../utils';

const TOTAL_SEARCHES_KEY = '@faceit:total_searches';

type Props = ScreenProps<'Landing'>;

export const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentHistory, setRecentHistory] = useState<Location[]>([]);
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);

  useEffect(() => {
    loadRecentHistory();
    loadPopularLocations();
  }, []);

  const loadPopularLocations = async () => {
    try {
      setIsLoadingPopular(true);
      const locations = await PopularLocationsService.getPopularLocations();
      setPopularLocations(locations);
    } catch (error) {
      console.error('[LandingScreen] Failed to load popular locations:', error);
      // Fall back to defaults
      setPopularLocations(PopularLocationsService.getDefaultLocations());
    } finally {
      setIsLoadingPopular(false);
    }
  };

  // Reload history and track screen view when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecentHistory();
      Analytics.logScreenView(ScreenNames.LANDING);
    });
    return unsubscribe;
  }, [navigation]);

  const loadRecentHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await storageService.getHistory();
      setRecentHistory(history.slice(0, 5));
    } catch (error) {
      console.error('[LandingScreen] Failed to load history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length === 0) return;
    Keyboard.dismiss();
    Analytics.logSearch({ query: searchQuery.trim() });

    // Increment and track total searches
    try {
      const currentCount = await AsyncStorage.getItem(TOTAL_SEARCHES_KEY);
      const newCount = (parseInt(currentCount || '0', 10) || 0) + 1;
      await AsyncStorage.setItem(TOTAL_SEARCHES_KEY, newCount.toString());
      Analytics.setTotalSearches(newCount);
    } catch (error) {
      console.warn('[LandingScreen] Failed to track total searches:', error);
    }

    navigation.navigate('SearchResults', { query: searchQuery.trim() });
  }, [searchQuery, navigation]);

  const handleLocationPress = useCallback(
    (location: Location) => {
      navigation.navigate('Compass', { location });
    },
    [navigation],
  );

  const handlePopularPress = useCallback(
    (popular: PopularLocation) => {
      navigation.navigate('Compass', {
        location: {
          id: popular.id,
          name: popular.name,
          coordinates: popular.coordinates,
          address: popular.address,
          timestamp: Date.now(),
        },
      });
    },
    [navigation],
  );

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.gradient.start, colors.gradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoBadge}
            >
              <Text style={styles.logoIcon}>◎</Text>
            </LinearGradient>
            <Text style={styles.logoText}>FaceIt</Text>
          </View>
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={styles.settingsButton}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <View style={styles.settingsButtonInner}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search any location..."
              placeholderTextColor={colors.text.tertiary}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches */}
          {!isLoadingHistory && recentHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <View style={styles.recentList}>
                {recentHistory.map(location => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.recentCard}
                    onPress={() => handleLocationPress(location)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentContent}>
                      <Text style={styles.recentName} numberOfLines={1}>
                        {location.name}
                      </Text>
                      <Text style={styles.recentAddress} numberOfLines={1}>
                        {location.address || 'No address'}
                      </Text>
                    </View>
                    <View style={styles.recentMeta}>
                      <Text style={styles.recentTime}>{formatTimestamp(location.timestamp)}</Text>
                      <Text style={styles.recentArrow}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {isLoadingHistory && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.accent.primary} />
            </View>
          )}

          {/* Popular Locations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            {isLoadingPopular ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent.primary} />
              </View>
            ) : (
              <View style={styles.popularGrid}>
                {popularLocations.map(popular => (
                  <TouchableOpacity
                    key={popular.id}
                    style={styles.popularCard}
                    onPress={() => handlePopularPress(popular)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.popularEmoji}>
                      <Text style={styles.popularEmojiText}>{popular.emoji}</Text>
                    </View>
                    <View style={styles.popularInfo}>
                      <Text style={styles.popularName} numberOfLines={1}>
                        {popular.name}
                      </Text>
                      <Text style={styles.popularSubtitle} numberOfLines={1}>
                        {popular.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Tip Card */}
          <View style={styles.tipCard}>
            <LinearGradient
              colors={[colors.gradient.start + '20', colors.gradient.end + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tipGradient}
            >
              <Text style={styles.tipIcon}>💡</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Pro Tip</Text>
                <Text style={styles.tipText}>
                  Enter coordinates directly (e.g., "40.7128, -74.0060") to face any exact location.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
    color: colors.background.primary,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  settingsButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    height: 52,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.text.tertiary,
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  recentList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  recentContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  recentAddress: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  recentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recentTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  recentArrow: {
    fontSize: 16,
    color: colors.accent.primary,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl - spacing.xs,
    gap: spacing.sm,
  },
  popularCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  popularEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularEmojiText: {
    fontSize: 22,
  },
  popularInfo: {
    flex: 1,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  popularSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  tipCard: {
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  tipGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accent.primary + '30',
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.primary,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
