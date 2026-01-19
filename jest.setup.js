/* eslint-disable no-undef */
/**
 * Jest Setup
 * Mocks for native modules and global test configuration
 */

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Analytics
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(() => Promise.resolve()),
  logScreenView: jest.fn(() => Promise.resolve()),
  setUserProperty: jest.fn(() => Promise.resolve()),
  setUserId: jest.fn(() => Promise.resolve()),
  setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Crashlytics
jest.mock('@react-native-firebase/crashlytics', () => () => ({
  log: jest.fn(),
  recordError: jest.fn(),
  setAttribute: jest.fn(() => Promise.resolve()),
  setAttributes: jest.fn(() => Promise.resolve()),
  setUserId: jest.fn(() => Promise.resolve()),
  setCrashlyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
  crash: jest.fn(),
  didCrashOnPreviousExecution: jest.fn(() => Promise.resolve(false)),
  isCrashlyticsCollectionEnabled: true,
}));

// Mock Firebase Remote Config
jest.mock('@react-native-firebase/remote-config', () => () => ({
  setDefaults: jest.fn(() => Promise.resolve()),
  setConfigSettings: jest.fn(() => Promise.resolve()),
  fetchAndActivate: jest.fn(() => Promise.resolve(true)),
  fetch: jest.fn(() => Promise.resolve()),
  activate: jest.fn(() => Promise.resolve()),
  getValue: jest.fn(() => ({
    asString: () => '[]',
    asNumber: () => 0,
    asBoolean: () => false,
  })),
  getAll: jest.fn(() => ({})),
}));

// Mock react-native-geolocation-service
jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(success =>
    success({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }),
  ),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
}));

// Mock react-native-sensors
jest.mock('react-native-sensors', () => ({
  magnetometer: {
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  },
  accelerometer: {
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  },
  gyroscope: {
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  },
  setUpdateIntervalForType: jest.fn(),
  SensorTypes: {
    magnetometer: 'magnetometer',
    accelerometer: 'accelerometer',
    gyroscope: 'gyroscope',
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  State: {},
  Directions: {},
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
}));

// Mock @react-navigation/stack
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
  TransitionPresets: {
    SlideFromRightIOS: {},
    ModalSlideFromBottomIOS: {},
    FadeFromBottomAndroid: {},
  },
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Note: Component testing requires @testing-library/react-native for proper setup
// Current tests focus on service layer which doesn't need StyleSheet mocks
