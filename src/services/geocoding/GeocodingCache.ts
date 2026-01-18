/**
 * GeocodingCache Service
 * Manages caching of geocoding results in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeocodingResult, CachedGeocodingResult } from '../../types/geocoding';

const CACHE_KEY_PREFIX = '@faceit:geocoding:';
const CACHE_INDEX_KEY = '@faceit:geocoding:index';
const DEFAULT_TTL_DAYS = 7;
const DEFAULT_MAX_CACHE_SIZE = 100;

export class GeocodingCache {
  private ttlMs: number;
  private maxCacheSize: number;

  constructor(ttlDays: number = DEFAULT_TTL_DAYS, maxCacheSize: number = DEFAULT_MAX_CACHE_SIZE) {
    this.ttlMs = ttlDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Generate cache key from query string
   */
  private generateCacheKey(query: string): string {
    const normalized = query.toLowerCase().trim();
    return `${CACHE_KEY_PREFIX}${this.hashCode(normalized)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      // eslint-disable-next-line no-bitwise
      hash = (hash << 5) - hash + char;
      // eslint-disable-next-line no-bitwise
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached results for a query
   */
  async get(query: string): Promise<GeocodingResult[] | null> {
    try {
      const cacheKey = this.generateCacheKey(query);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) {
        return null;
      }

      const cachedResult: CachedGeocodingResult = JSON.parse(cached);

      // Check if cache has expired
      const now = Date.now();
      if (now - cachedResult.timestamp > this.ttlMs) {
        await this.delete(cacheKey);
        return null;
      }

      return cachedResult.data;
    } catch (error) {
      console.error('[GeocodingCache] Error retrieving from cache:', error);
      return null;
    }
  }

  /**
   * Store geocoding results in cache
   */
  async set(query: string, results: GeocodingResult[]): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(query);
      const cachedResult: CachedGeocodingResult = {
        data: results,
        timestamp: Date.now(),
        query: query.toLowerCase().trim(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedResult));
      await this.updateIndex(cacheKey);
      await this.enforceMaxCacheSize();
    } catch (error) {
      console.error('[GeocodingCache] Error storing in cache:', error);
    }
  }

  /**
   * Update cache index for LRU eviction
   */
  private async updateIndex(cacheKey: string): Promise<void> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      let index: string[] = indexStr ? JSON.parse(indexStr) : [];

      // Remove key if it already exists
      index = index.filter(key => key !== cacheKey);

      // Add key to end (most recently used)
      index.push(cacheKey);

      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('[GeocodingCache] Error updating index:', error);
    }
  }

  /**
   * Enforce maximum cache size using LRU eviction
   */
  private async enforceMaxCacheSize(): Promise<void> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (!indexStr) {
        return;
      }

      const index: string[] = JSON.parse(indexStr);

      if (index.length > this.maxCacheSize) {
        // Remove oldest entries (beginning of array)
        const toRemove = index.slice(0, index.length - this.maxCacheSize);
        const toKeep = index.slice(index.length - this.maxCacheSize);

        // Delete old entries
        await Promise.all(toRemove.map(key => this.delete(key)));

        // Update index
        await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(toKeep));
      }
    } catch (error) {
      console.error('[GeocodingCache] Error enforcing max cache size:', error);
    }
  }

  /**
   * Delete a specific cache entry
   */
  private async delete(cacheKey: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('[GeocodingCache] Error deleting cache entry:', error);
    }
  }

  /**
   * Clear all geocoding cache
   */
  async clear(): Promise<void> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (indexStr) {
        const index: string[] = JSON.parse(indexStr);
        await Promise.all(index.map(key => AsyncStorage.removeItem(key)));
        await AsyncStorage.removeItem(CACHE_INDEX_KEY);
      }
    } catch (error) {
      console.error('[GeocodingCache] Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ count: number; size: number }> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      const index: string[] = indexStr ? JSON.parse(indexStr) : [];

      let totalSize = 0;
      for (const key of index) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        count: index.length,
        size: totalSize,
      };
    } catch (error) {
      console.error('[GeocodingCache] Error getting stats:', error);
      return { count: 0, size: 0 };
    }
  }
}
