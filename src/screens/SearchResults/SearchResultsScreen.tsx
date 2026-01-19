/**
 * SearchResultsScreen
 * Displays geocoding search results for a query
 * Design: Flighty-inspired dark UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ScreenProps } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { GeocodingService } from '../../services/geocoding/GeocodingService';
import { storageService } from '../../services/storage';
import { GeocodingResult } from '../../types/geocoding';
import { Location } from '../../types/storage';
import { Analytics, ScreenNames } from '../../utils';

type Props = ScreenProps<'SearchResults'>;

export const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { query } = route.params;
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const geocodingService = new GeocodingService();

  useEffect(() => {
    Analytics.logScreenView(ScreenNames.SEARCH_RESULTS);
    fetchResults();
  }, [query]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const searchResults = await geocodingService.searchByText(query);
      setResults(searchResults);
      Analytics.logSearchSuccess({ query, resultCount: searchResults.length });
    } catch (err: any) {
      console.error('[SearchResultsScreen] Search failed:', err);
      const errorMessage = err.message || 'Failed to search for locations. Please try again.';
      setError(errorMessage);
      Analytics.logSearchFailure({ query, errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultSelect = useCallback(
    async (result: GeocodingResult) => {
      try {
        const location: Location = {
          id: `${result.coordinates.latitude},${result.coordinates.longitude}`,
          name: result.name,
          coordinates: {
            latitude: result.coordinates.latitude,
            longitude: result.coordinates.longitude,
            accuracy: undefined,
            timestamp: Date.now(),
          },
          address: result.address,
          timestamp: Date.now(),
        };

        await storageService.addToHistory(location);
        navigation.navigate('Compass', { location });
      } catch (err) {
        console.error('[SearchResultsScreen] Failed to save to history:', err);
        navigation.navigate('Compass', {
          location: {
            id: `${result.coordinates.latitude},${result.coordinates.longitude}`,
            name: result.name,
            coordinates: {
              latitude: result.coordinates.latitude,
              longitude: result.coordinates.longitude,
              accuracy: undefined,
              timestamp: Date.now(),
            },
            address: result.address,
            timestamp: Date.now(),
          },
        });
      }
    },
    [navigation],
  );

  const handleRetry = useCallback(() => {
    fetchResults();
  }, [query]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <View style={styles.backButtonInner}>
                <Text style={styles.backIcon}>←</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Searching...</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.loadingText}>Searching for "{query}"</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <View style={styles.backButtonInner}>
                <Text style={styles.backIcon}>←</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Search</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.centerContent}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorEmoji}>⚠️</Text>
            </View>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.retryGradient}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <View style={styles.backButtonInner}>
                <Text style={styles.backIcon}>←</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Search</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.centerContent}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>🔍</Text>
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyMessage}>We couldn't find anything for "{query}"</Text>
            <Text style={styles.emptyHint}>Try a different search term or check spelling</Text>
            <TouchableOpacity style={styles.searchAgainButton} onPress={() => navigation.goBack()}>
              <Text style={styles.searchAgainText}>Search Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Results list
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <Text style={styles.backIcon}>←</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Results</Text>
            <Text style={styles.headerSubtitle}>
              {results.length} found for "{query}"
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Results */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {results.map((result, index) => (
            <TouchableOpacity
              key={`${result.coordinates.latitude},${result.coordinates.longitude}-${index}`}
              style={styles.resultCard}
              onPress={() => handleResultSelect(result)}
              activeOpacity={0.7}
            >
              <View style={styles.resultMain}>
                <Text style={styles.resultName} numberOfLines={1}>
                  {result.name}
                </Text>
                <Text style={styles.resultAddress} numberOfLines={2}>
                  {result.address}
                </Text>
                {(result.region || result.country) && (
                  <View style={styles.resultTags}>
                    {result.region && (
                      <View style={styles.resultTag}>
                        <Text style={styles.resultTagText}>{result.region}</Text>
                      </View>
                    )}
                    {result.country && (
                      <View style={styles.resultTag}>
                        <Text style={styles.resultTagText}>{result.country}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View style={styles.resultCoords}>
                <Text style={styles.coordLabel}>{result.coordinates.latitude.toFixed(4)}°</Text>
                <Text style={styles.coordLabel}>{result.coordinates.longitude.toFixed(4)}°</Text>
              </View>
              <View style={styles.resultArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.text.primary,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  errorEmoji: {
    fontSize: 36,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background.primary,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  searchAgainButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.pill,
  },
  searchAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  resultMain: {
    flex: 1,
    marginRight: spacing.md,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  resultTags: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  resultTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
  },
  resultTagText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  resultCoords: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  coordLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontFamily: 'Menlo',
  },
  resultArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 16,
    color: colors.accent.primary,
  },
});
