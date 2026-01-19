/**
 * StorageService Unit Tests
 * Tests for search history, favorites, and preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../StorageService';
import { StorageKeys, StorageErrorType } from '../../../types/storage';
import {
  createMockLocation,
  createMockFavoriteLocation,
  createMockCoordinates,
} from '../../../__tests__/utils/mockData';

// Get the mocked AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    storageService = new StorageService();
  });

  describe('Search History', () => {
    describe('getHistory', () => {
      it('should return empty array when no history exists', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);

        const history = await storageService.getHistory();

        expect(history).toEqual([]);
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(StorageKeys.SEARCH_HISTORY);
      });

      it('should return parsed history when data exists', async () => {
        const mockHistory = [createMockLocation({ name: 'Location 1' })];
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockHistory));

        const history = await storageService.getHistory();

        expect(history).toHaveLength(1);
        expect(history[0].name).toBe('Location 1');
      });

      it('should throw StorageError on parse error', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

        await expect(storageService.getHistory()).rejects.toMatchObject({
          type: StorageErrorType.PARSE_ERROR,
        });
      });
    });

    describe('addToHistory', () => {
      it('should add a new location to empty history', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        const location = createMockLocation({ name: 'New Location' });
        await storageService.addToHistory(location);

        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          StorageKeys.SEARCH_HISTORY,
          expect.stringContaining('New Location'),
        );
      });

      it('should add location to beginning of history (LIFO)', async () => {
        const oldCoords = createMockCoordinates({ latitude: 40.0, longitude: -70.0 });
        const existingHistory = [
          createMockLocation({ name: 'Old Location', coordinates: oldCoords }),
        ];
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingHistory));
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        const newCoords = createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 });
        const newLocation = createMockLocation({ name: 'New Location', coordinates: newCoords });
        await storageService.addToHistory(newLocation);

        const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
        const savedHistory = JSON.parse(setItemCall[1]);

        expect(savedHistory).toHaveLength(2);
        expect(savedHistory[0].name).toBe('New Location');
        expect(savedHistory[1].name).toBe('Old Location');
      });

      it('should remove duplicate locations by coordinates', async () => {
        const coords = createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 });
        const existingLocation = createMockLocation({
          name: 'Old Name',
          coordinates: coords,
        });
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingLocation]));
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        const newLocation = createMockLocation({
          name: 'New Name',
          coordinates: coords,
        });
        await storageService.addToHistory(newLocation);

        const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
        const savedHistory = JSON.parse(setItemCall[1]);

        expect(savedHistory).toHaveLength(1);
        expect(savedHistory[0].name).toBe('New Name');
      });

      it('should limit history to maxHistoryItems', async () => {
        const service = new StorageService({ maxHistoryItems: 3 });
        const existingHistory = [
          createMockLocation({
            id: '1',
            name: 'Location 1',
            coordinates: createMockCoordinates({ latitude: 1, longitude: 1 }),
          }),
          createMockLocation({
            id: '2',
            name: 'Location 2',
            coordinates: createMockCoordinates({ latitude: 2, longitude: 2 }),
          }),
          createMockLocation({
            id: '3',
            name: 'Location 3',
            coordinates: createMockCoordinates({ latitude: 3, longitude: 3 }),
          }),
        ];
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingHistory));
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        const newLocation = createMockLocation({
          id: '4',
          name: 'Location 4',
          coordinates: createMockCoordinates({ latitude: 4, longitude: 4 }),
        });
        await service.addToHistory(newLocation);

        const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
        const savedHistory = JSON.parse(setItemCall[1]);

        expect(savedHistory).toHaveLength(3);
        expect(savedHistory[0].name).toBe('Location 4');
        expect(savedHistory[2].name).toBe('Location 2');
      });
    });

    describe('clearHistory', () => {
      it('should remove history from storage', async () => {
        mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

        await storageService.clearHistory();

        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(StorageKeys.SEARCH_HISTORY);
      });
    });
  });

  describe('Favorites', () => {
    describe('getFavorites', () => {
      it('should return empty array when no favorites exist', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);

        const favorites = await storageService.getFavorites();

        expect(favorites).toEqual([]);
      });

      it('should return favorites sorted by savedDate (newest first)', async () => {
        const mockFavorites = [
          createMockFavoriteLocation({ id: '1', savedDate: 1000 }),
          createMockFavoriteLocation({ id: '2', savedDate: 3000 }),
          createMockFavoriteLocation({ id: '3', savedDate: 2000 }),
        ];
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockFavorites));

        const favorites = await storageService.getFavorites();

        expect(favorites[0].id).toBe('2');
        expect(favorites[1].id).toBe('3');
        expect(favorites[2].id).toBe('1');
      });
    });

    describe('addFavorite', () => {
      it('should add a new favorite', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        const location = createMockLocation({ name: 'Test Favorite' });
        const favorite = await storageService.addFavorite(location);

        expect(favorite.name).toBe('Test Favorite');
        expect(favorite.savedDate).toBeDefined();
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should add favorite with custom label', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        const location = createMockLocation();
        const favorite = await storageService.addFavorite(location, 'My Custom Label');

        expect(favorite.customLabel).toBe('My Custom Label');
      });

      it('should throw error when location already favorited', async () => {
        const coords = createMockCoordinates({ latitude: 37.7749, longitude: -122.4194 });
        const existingFavorite = createMockFavoriteLocation({ coordinates: coords });
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingFavorite]));

        const location = createMockLocation({ coordinates: coords });

        await expect(storageService.addFavorite(location)).rejects.toMatchObject({
          message: 'Location is already in favorites',
        });
      });
    });

    describe('deleteFavorite', () => {
      it('should delete a favorite by ID', async () => {
        const favorites = [
          createMockFavoriteLocation({ id: 'fav1' }),
          createMockFavoriteLocation({ id: 'fav2' }),
        ];
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(favorites));
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        await storageService.deleteFavorite('fav1');

        const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
        const savedFavorites = JSON.parse(setItemCall[1]);

        expect(savedFavorites).toHaveLength(1);
        expect(savedFavorites[0].id).toBe('fav2');
      });

      it('should throw error when favorite not found', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

        await expect(storageService.deleteFavorite('nonexistent')).rejects.toMatchObject({
          type: StorageErrorType.NOT_FOUND,
        });
      });
    });

    describe('updateFavorite', () => {
      it('should update a favorite custom label', async () => {
        const favorite = createMockFavoriteLocation({ id: 'fav1', customLabel: 'Old Label' });
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([favorite]));
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        const updated = await storageService.updateFavorite('fav1', 'New Label');

        expect(updated.customLabel).toBe('New Label');
      });

      it('should throw error when favorite not found', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

        await expect(storageService.updateFavorite('nonexistent', 'Label')).rejects.toMatchObject({
          type: StorageErrorType.NOT_FOUND,
        });
      });
    });

    describe('isFavorited', () => {
      it('should return true when location is favorited', async () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 };
        const favorite = createMockFavoriteLocation({
          coordinates: createMockCoordinates(coords),
        });
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([favorite]));

        const result = await storageService.isFavorited(coords);

        expect(result).toBe(true);
      });

      it('should return false when location is not favorited', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

        const result = await storageService.isFavorited({
          latitude: 37.7749,
          longitude: -122.4194,
        });

        expect(result).toBe(false);
      });
    });
  });

  describe('Preferences', () => {
    describe('getPreferences', () => {
      it('should return default preferences when none saved', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);

        const prefs = await storageService.getPreferences();

        expect(prefs.distanceUnit).toBe('km');
        expect(prefs.hapticFeedbackEnabled).toBe(true);
      });

      it('should return saved preferences merged with defaults', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ distanceUnit: 'mi' }));

        const prefs = await storageService.getPreferences();

        expect(prefs.distanceUnit).toBe('mi');
        expect(prefs.hapticFeedbackEnabled).toBe(true);
      });

      it('should return defaults on parse error', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

        const prefs = await storageService.getPreferences();

        expect(prefs.distanceUnit).toBe('km');
      });
    });

    describe('setPreference', () => {
      it('should update a single preference', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(null);
        mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

        await storageService.setPreference('distanceUnit', 'mi');

        const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
        const savedPrefs = JSON.parse(setItemCall[1]);

        expect(savedPrefs.distanceUnit).toBe('mi');
      });
    });

    describe('getPreference', () => {
      it('should return a specific preference value', async () => {
        mockAsyncStorage.getItem.mockResolvedValueOnce(
          JSON.stringify({ distanceUnit: 'mi', hapticFeedbackEnabled: false }),
        );

        const distanceUnit = await storageService.getPreference('distanceUnit');

        expect(distanceUnit).toBe('mi');
      });
    });
  });

  describe('Utility', () => {
    describe('clearAll', () => {
      it('should remove all storage keys', async () => {
        mockAsyncStorage.multiRemove.mockResolvedValueOnce(undefined);

        await storageService.clearAll();

        expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
          StorageKeys.SEARCH_HISTORY,
          StorageKeys.FAVORITES,
          StorageKeys.PREFERENCES,
        ]);
      });
    });

    describe('getStorageInfo', () => {
      it('should return storage usage information', async () => {
        mockAsyncStorage.getItem
          .mockResolvedValueOnce(JSON.stringify([createMockLocation()]))
          .mockResolvedValueOnce(JSON.stringify([createMockFavoriteLocation()]))
          .mockResolvedValueOnce(JSON.stringify({ distanceUnit: 'km' }));

        const info = await storageService.getStorageInfo();

        expect(info.historyCount).toBe(1);
        expect(info.favoritesCount).toBe(1);
        expect(info.hasPreferences).toBe(true);
      });
    });
  });
});
