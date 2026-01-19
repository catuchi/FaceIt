/**
 * SensorService Unit Tests
 * Tests for sensor fusion, heading tracking, and compass functionality
 */

import {
  magnetometer,
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import { SensorService } from '../SensorService';
import { SensorAccuracy, SensorErrorType } from '../../../types/sensors';

// Mock react-native-sensors
jest.mock('react-native-sensors');

const mockMagnetometer = magnetometer as jest.Mocked<typeof magnetometer>;
const mockAccelerometer = accelerometer as jest.Mocked<typeof accelerometer>;
const mockSetUpdateInterval = setUpdateIntervalForType as jest.Mock;

// Mock subscription object
const createMockSubscription = () => ({
  unsubscribe: jest.fn(),
});

describe('SensorService', () => {
  let sensorService: SensorService;
  let mockMagSubscription: ReturnType<typeof createMockSubscription>;
  let mockAccSubscription: ReturnType<typeof createMockSubscription>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMagSubscription = createMockSubscription();
    mockAccSubscription = createMockSubscription();

    // Default mock implementations
    (mockMagnetometer as any).subscribe = jest.fn(() => mockMagSubscription);
    (mockAccelerometer as any).subscribe = jest.fn(() => mockAccSubscription);

    sensorService = new SensorService();
  });

  describe('constructor', () => {
    it('should set default config values', () => {
      // Constructor called in beforeEach, sensorService already created
      expect(mockSetUpdateInterval).toHaveBeenCalledWith(SensorTypes.magnetometer, 100);
      expect(mockSetUpdateInterval).toHaveBeenCalledWith(SensorTypes.accelerometer, 100);
    });

    it('should use custom config values', () => {
      mockSetUpdateInterval.mockClear();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _customService = new SensorService({
        updateInterval: 50,
        lowPassFilterAlpha: 0.3,
        calibrationThreshold: 3.0,
      });

      expect(mockSetUpdateInterval).toHaveBeenCalledWith(SensorTypes.magnetometer, 50);
      expect(mockSetUpdateInterval).toHaveBeenCalledWith(SensorTypes.accelerometer, 50);
    });
  });

  describe('startHeadingTracking', () => {
    it('should subscribe to magnetometer and accelerometer', () => {
      const callback = jest.fn();

      sensorService.startHeadingTracking(callback);

      expect(mockMagnetometer.subscribe).toHaveBeenCalled();
      expect(mockAccelerometer.subscribe).toHaveBeenCalled();
    });

    it('should return subscription with unsubscribe function', () => {
      const callback = jest.fn();

      const subscription = sensorService.startHeadingTracking(callback);

      expect(subscription).toHaveProperty('unsubscribe');
      expect(typeof subscription.unsubscribe).toBe('function');
    });

    it('should call callback with sensor fusion data when both sensors report', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;
      let accCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      (mockAccelerometer as any).subscribe = jest.fn(onData => {
        accCallback = onData;
        return mockAccSubscription;
      });

      sensorService.startHeadingTracking(callback);

      // Simulate sensor data
      accCallback!({ x: 0, y: 0, z: 9.8, timestamp: Date.now() });
      magCallback!({ x: 40, y: 0, z: 0, timestamp: Date.now() });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          heading: expect.any(Number),
          pitch: expect.any(Number),
          roll: expect.any(Number),
          accuracy: expect.any(String),
          needsCalibration: expect.any(Boolean),
          timestamp: expect.any(Number),
        }),
      );
    });

    it('should not call callback until both sensors have data', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      sensorService.startHeadingTracking(callback);

      // Only magnetometer data
      magCallback!({ x: 40, y: 0, z: 0, timestamp: Date.now() });

      // Callback should not be called yet
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call error callback on magnetometer error', () => {
      const callback = jest.fn();
      const errorCallback = jest.fn();

      let errorHandler: ((error: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn((_, onError) => {
        errorHandler = onError;
        return mockMagSubscription;
      });

      sensorService.startHeadingTracking(callback, errorCallback);

      // Simulate error
      errorHandler!(new Error('Magnetometer error'));

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SensorErrorType.SENSOR_NOT_AVAILABLE,
        }),
      );
    });

    it('should call error callback on accelerometer error', () => {
      const callback = jest.fn();
      const errorCallback = jest.fn();

      let errorHandler: ((error: any) => void) | null = null;

      (mockAccelerometer as any).subscribe = jest.fn((_, onError) => {
        errorHandler = onError;
        return mockAccSubscription;
      });

      sensorService.startHeadingTracking(callback, errorCallback);

      // Simulate error
      errorHandler!(new Error('Accelerometer error'));

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SensorErrorType.SENSOR_NOT_AVAILABLE,
        }),
      );
    });
  });

  describe('stopHeadingTracking', () => {
    it('should unsubscribe from both sensors', () => {
      const callback = jest.fn();

      const subscription = sensorService.startHeadingTracking(callback);
      subscription.unsubscribe();

      expect(mockMagSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockAccSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should reset internal state', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;
      let accCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      (mockAccelerometer as any).subscribe = jest.fn(onData => {
        accCallback = onData;
        return mockAccSubscription;
      });

      sensorService.startHeadingTracking(callback);

      // Simulate sensor data
      accCallback!({ x: 0, y: 0, z: 9.8, timestamp: Date.now() });
      magCallback!({ x: 40, y: 0, z: 0, timestamp: Date.now() });

      expect(callback).toHaveBeenCalledTimes(1);

      // Stop tracking
      sensorService.stopHeadingTracking();

      // Reset mocks
      mockMagSubscription = createMockSubscription();
      mockAccSubscription = createMockSubscription();

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      (mockAccelerometer as any).subscribe = jest.fn(onData => {
        accCallback = onData;
        return mockAccSubscription;
      });

      // Start tracking again - should need both sensors to report again
      callback.mockClear();
      sensorService.startHeadingTracking(callback);

      magCallback!({ x: 40, y: 0, z: 0, timestamp: Date.now() });

      // Should not call until both have data again
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getCompassHeading', () => {
    it('should subscribe to magnetometer only', () => {
      const callback = jest.fn();

      sensorService.getCompassHeading(callback);

      expect(mockMagnetometer.subscribe).toHaveBeenCalled();
      expect(mockAccelerometer.subscribe).not.toHaveBeenCalled();
    });

    it('should return subscription with unsubscribe function', () => {
      const callback = jest.fn();

      const subscription = sensorService.getCompassHeading(callback);

      expect(subscription).toHaveProperty('unsubscribe');
      expect(typeof subscription.unsubscribe).toBe('function');
    });

    it('should call callback with compass data', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      sensorService.getCompassHeading(callback);

      // Simulate magnetometer data pointing north (x positive)
      magCallback!({ x: 40, y: 0, z: 0, timestamp: 1234567890 });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          heading: expect.any(Number),
          accuracy: expect.any(String),
          timestamp: 1234567890,
        }),
      );
    });

    it('should calculate correct heading for different orientations', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      sensorService.getCompassHeading(callback);

      // Pointing East (y positive)
      magCallback!({ x: 0, y: 40, z: 0, timestamp: Date.now() });
      const eastHeading = callback.mock.calls[0][0].heading;
      expect(eastHeading).toBeCloseTo(90, 0);

      // Pointing West (y negative)
      magCallback!({ x: 0, y: -40, z: 0, timestamp: Date.now() });
      const westHeading = callback.mock.calls[1][0].heading;
      expect(westHeading).toBeCloseTo(270, 0);
    });

    it('should call error callback on magnetometer error', () => {
      const callback = jest.fn();
      const errorCallback = jest.fn();

      let errorHandler: ((error: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn((_, onError) => {
        errorHandler = onError;
        return mockMagSubscription;
      });

      sensorService.getCompassHeading(callback, errorCallback);

      errorHandler!(new Error('Compass error'));

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SensorErrorType.SENSOR_NOT_AVAILABLE,
        }),
      );
    });
  });

  describe('sensor accuracy', () => {
    it('should report HIGH accuracy for normal magnetic field', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      sensorService.getCompassHeading(callback);

      // Normal Earth magnetic field (around 30-50 µT)
      magCallback!({ x: 30, y: 20, z: 10, timestamp: Date.now() });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: SensorAccuracy.HIGH,
        }),
      );
    });

    it('should report UNRELIABLE accuracy for very low magnetic field', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      sensorService.getCompassHeading(callback);

      // Very weak magnetic field (near interference)
      magCallback!({ x: 2, y: 2, z: 2, timestamp: Date.now() });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: SensorAccuracy.UNRELIABLE,
        }),
      );
    });

    it('should report UNRELIABLE accuracy for very high magnetic field', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      sensorService.getCompassHeading(callback);

      // Very strong magnetic field (interference)
      magCallback!({ x: 100, y: 100, z: 100, timestamp: Date.now() });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: SensorAccuracy.UNRELIABLE,
        }),
      );
    });

    it('should set needsCalibration for low accuracy', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;
      let accCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      (mockAccelerometer as any).subscribe = jest.fn(onData => {
        accCallback = onData;
        return mockAccSubscription;
      });

      sensorService.startHeadingTracking(callback);

      // Low magnetic field requiring calibration
      accCallback!({ x: 0, y: 0, z: 9.8, timestamp: Date.now() });
      magCallback!({ x: 5, y: 5, z: 5, timestamp: Date.now() });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          needsCalibration: true,
        }),
      );
    });
  });

  describe('checkSensorsAvailable', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return availability status for both sensors', async () => {
      // Mock successful subscriptions
      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        setTimeout(() => onData({ x: 0, y: 0, z: 0 }), 10);
        return mockMagSubscription;
      });

      (mockAccelerometer as any).subscribe = jest.fn(onData => {
        setTimeout(() => onData({ x: 0, y: 0, z: 0 }), 10);
        return mockAccSubscription;
      });

      const promise = sensorService.checkSensorsAvailable();

      // Advance timers
      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result).toHaveProperty('magnetometer');
      expect(result).toHaveProperty('accelerometer');
    });

    it('should handle sensor subscription errors', async () => {
      // Mock magnetometer throwing error
      (mockMagnetometer as any).subscribe = jest.fn(() => {
        throw new Error('Magnetometer not available');
      });

      // Mock accelerometer working
      (mockAccelerometer as any).subscribe = jest.fn(onData => {
        setTimeout(() => onData({ x: 0, y: 0, z: 0 }), 10);
        return mockAccSubscription;
      });

      const promise = sensorService.checkSensorsAvailable();

      jest.advanceTimersByTime(200);

      const result = await promise;

      expect(result.magnetometer).toBe(false);
    });
  });

  describe('low-pass filter', () => {
    it('should smooth sensor data over time', () => {
      const callback = jest.fn();

      let magCallback: ((data: any) => void) | null = null;
      let accCallback: ((data: any) => void) | null = null;

      (mockMagnetometer as any).subscribe = jest.fn(onData => {
        magCallback = onData;
        return mockMagSubscription;
      });

      (mockAccelerometer as any).subscribe = jest.fn(onData => {
        accCallback = onData;
        return mockAccSubscription;
      });

      // Use higher alpha for more aggressive filtering
      const service = new SensorService({ lowPassFilterAlpha: 0.2 });
      service.startHeadingTracking(callback);

      // First reading
      accCallback!({ x: 0, y: 0, z: 9.8, timestamp: Date.now() });
      magCallback!({ x: 40, y: 0, z: 0, timestamp: Date.now() });

      const firstHeading = callback.mock.calls[0][0].heading;

      // Second reading with different values
      magCallback!({ x: 0, y: 40, z: 0, timestamp: Date.now() });

      const secondHeading = callback.mock.calls[1][0].heading;

      // Due to low-pass filtering, heading should change gradually
      // not jump immediately from first to second value
      expect(Math.abs(secondHeading - firstHeading)).toBeLessThan(90);
    });
  });
});
