/**
 * Sensor Types
 * Type definitions for compass, accelerometer, and gyroscope sensors
 */

/**
 * Sensor accuracy levels
 */
export enum SensorAccuracy {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  UNRELIABLE = 'unreliable',
}

/**
 * Compass heading data
 */
export interface CompassData {
  heading: number; // 0-360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
  accuracy: SensorAccuracy;
  timestamp: number;
}

/**
 * Magnetometer raw data
 */
export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Accelerometer data
 */
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Gyroscope data
 */
export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Sensor fusion result
 */
export interface SensorFusionData {
  heading: number; // Compass heading in degrees (0-360)
  pitch: number; // Device pitch in degrees
  roll: number; // Device roll in degrees
  accuracy: SensorAccuracy;
  needsCalibration: boolean;
  timestamp: number;
}

/**
 * Sensor subscription
 */
export interface SensorSubscription {
  unsubscribe: () => void;
}

/**
 * Sensor service configuration
 */
export interface SensorServiceConfig {
  updateInterval?: number; // in milliseconds (default: 100ms = 10Hz)
  lowPassFilterAlpha?: number; // Low-pass filter smoothing (0-1, default: 0.2)
  calibrationThreshold?: number; // Calibration accuracy threshold (default: 2.0)
}

/**
 * Sensor error types
 */
export enum SensorErrorType {
  SENSOR_NOT_AVAILABLE = 'SENSOR_NOT_AVAILABLE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Sensor error
 */
export class SensorError extends Error {
  type: SensorErrorType;
  originalError?: Error;

  constructor(
    message: string,
    type: SensorErrorType = SensorErrorType.UNKNOWN,
    originalError?: Error,
  ) {
    super(message);
    this.name = 'SensorError';
    this.type = type;
    this.originalError = originalError;
  }
}
