/**
 * SensorService
 * Handles device sensors (magnetometer, accelerometer, gyroscope) with sensor fusion
 */

import {
  magnetometer,
  accelerometer,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import { Subscription } from 'rxjs';
import {
  CompassData,
  MagnetometerData,
  AccelerometerData,
  SensorFusionData,
  SensorAccuracy,
  SensorSubscription,
  SensorServiceConfig,
  SensorError,
  SensorErrorType,
} from '../../types/sensors';

const DEFAULT_UPDATE_INTERVAL = 100; // 10 Hz
const DEFAULT_LOW_PASS_ALPHA = 0.2;
const DEFAULT_CALIBRATION_THRESHOLD = 2.0;

export class SensorService {
  private magnetometerSubscription: Subscription | null = null;
  private accelerometerSubscription: Subscription | null = null;
  private config: Required<SensorServiceConfig>;

  // Sensor data buffers
  private magnetometerData: MagnetometerData | null = null;
  private accelerometerData: AccelerometerData | null = null;

  // Filtered data (low-pass filter)
  private filteredMag: { x: number; y: number; z: number } | null = null;
  private filteredAcc: { x: number; y: number; z: number } | null = null;

  // Calibration state
  private isCalibrated: boolean = false;
  private calibrationAccuracy: number = 0;

  constructor(config?: SensorServiceConfig) {
    this.config = {
      updateInterval: config?.updateInterval || DEFAULT_UPDATE_INTERVAL,
      lowPassFilterAlpha: config?.lowPassFilterAlpha || DEFAULT_LOW_PASS_ALPHA,
      calibrationThreshold: config?.calibrationThreshold || DEFAULT_CALIBRATION_THRESHOLD,
    };

    // Set update intervals for sensors
    setUpdateIntervalForType(SensorTypes.magnetometer, this.config.updateInterval);
    setUpdateIntervalForType(SensorTypes.accelerometer, this.config.updateInterval);
  }

  /**
   * Start heading tracking with sensor fusion
   */
  startHeadingTracking(callback: (data: SensorFusionData) => void): SensorSubscription {
    // Subscribe to magnetometer
    this.magnetometerSubscription = magnetometer.subscribe(
      ({ x, y, z, timestamp }) => {
        this.magnetometerData = { x, y, z, timestamp };
        this.applyLowPassFilter('magnetometer', { x, y, z });
        this.processSensorFusion(callback);
      },
      error => {
        console.error('[SensorService] Magnetometer error:', error);
        throw new SensorError(
          'Magnetometer not available',
          SensorErrorType.SENSOR_NOT_AVAILABLE,
          error,
        );
      },
    );

    // Subscribe to accelerometer
    this.accelerometerSubscription = accelerometer.subscribe(
      ({ x, y, z, timestamp }) => {
        this.accelerometerData = { x, y, z, timestamp };
        this.applyLowPassFilter('accelerometer', { x, y, z });
        this.processSensorFusion(callback);
      },
      error => {
        console.error('[SensorService] Accelerometer error:', error);
        throw new SensorError(
          'Accelerometer not available',
          SensorErrorType.SENSOR_NOT_AVAILABLE,
          error,
        );
      },
    );

    return {
      unsubscribe: () => this.stopHeadingTracking(),
    };
  }

  /**
   * Stop heading tracking
   */
  stopHeadingTracking(): void {
    if (this.magnetometerSubscription) {
      this.magnetometerSubscription.unsubscribe();
      this.magnetometerSubscription = null;
    }
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.unsubscribe();
      this.accelerometerSubscription = null;
    }

    // Reset state
    this.magnetometerData = null;
    this.accelerometerData = null;
    this.filteredMag = null;
    this.filteredAcc = null;
  }

  /**
   * Apply low-pass filter to reduce jitter
   */
  private applyLowPassFilter(
    type: 'magnetometer' | 'accelerometer',
    data: { x: number; y: number; z: number },
  ): void {
    const alpha = this.config.lowPassFilterAlpha;

    if (type === 'magnetometer') {
      if (!this.filteredMag) {
        this.filteredMag = { ...data };
      } else {
        this.filteredMag.x = alpha * data.x + (1 - alpha) * this.filteredMag.x;
        this.filteredMag.y = alpha * data.y + (1 - alpha) * this.filteredMag.y;
        this.filteredMag.z = alpha * data.z + (1 - alpha) * this.filteredMag.z;
      }
    } else {
      if (!this.filteredAcc) {
        this.filteredAcc = { ...data };
      } else {
        this.filteredAcc.x = alpha * data.x + (1 - alpha) * this.filteredAcc.x;
        this.filteredAcc.y = alpha * data.y + (1 - alpha) * this.filteredAcc.y;
        this.filteredAcc.z = alpha * data.z + (1 - alpha) * this.filteredAcc.z;
      }
    }
  }

  /**
   * Process sensor fusion to calculate heading
   */
  private processSensorFusion(callback: (data: SensorFusionData) => void): void {
    if (!this.filteredMag || !this.filteredAcc) {
      return; // Wait for both sensors to have data
    }

    try {
      // Calculate pitch and roll from accelerometer
      const { pitch, roll } = this.calculatePitchRoll(this.filteredAcc);

      // Calculate tilt-compensated heading
      const heading = this.calculateTiltCompensatedHeading(this.filteredMag, pitch, roll);

      // Determine accuracy and calibration status
      const magMagnitude = Math.sqrt(
        this.filteredMag.x ** 2 + this.filteredMag.y ** 2 + this.filteredMag.z ** 2,
      );
      const accuracy = this.determineSensorAccuracy(magMagnitude);
      const needsCalibration =
        accuracy === SensorAccuracy.LOW || accuracy === SensorAccuracy.UNRELIABLE;

      const fusionData: SensorFusionData = {
        heading,
        pitch,
        roll,
        accuracy,
        needsCalibration,
        timestamp: Date.now(),
      };

      callback(fusionData);
    } catch (error) {
      console.error('[SensorService] Sensor fusion error:', error);
    }
  }

  /**
   * Calculate pitch and roll from accelerometer data
   */
  private calculatePitchRoll(acc: { x: number; y: number; z: number }): {
    pitch: number;
    roll: number;
  } {
    // Normalize accelerometer data
    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const normX = acc.x / magnitude;
    const normY = acc.y / magnitude;
    const normZ = acc.z / magnitude;

    // Calculate pitch (rotation around X-axis)
    const pitch = (Math.atan2(normY, Math.sqrt(normX ** 2 + normZ ** 2)) * 180) / Math.PI;

    // Calculate roll (rotation around Y-axis)
    const roll = (Math.atan2(-normX, normZ) * 180) / Math.PI;

    return { pitch, roll };
  }

  /**
   * Calculate tilt-compensated heading using magnetometer and tilt angles
   */
  private calculateTiltCompensatedHeading(
    mag: { x: number; y: number; z: number },
    pitch: number,
    roll: number,
  ): number {
    // Convert pitch and roll to radians
    const pitchRad = (pitch * Math.PI) / 180;
    const rollRad = (roll * Math.PI) / 180;

    // Tilt compensation matrix
    const cosPitch = Math.cos(pitchRad);
    const sinPitch = Math.sin(pitchRad);
    const cosRoll = Math.cos(rollRad);
    const sinRoll = Math.sin(rollRad);

    // Apply tilt compensation
    const magX = mag.x * cosPitch + mag.z * sinPitch;
    const magY = mag.x * sinRoll * sinPitch + mag.y * cosRoll - mag.z * sinRoll * cosPitch;

    // Calculate heading
    let heading = (Math.atan2(magY, magX) * 180) / Math.PI;

    // Normalize to 0-360 degrees
    if (heading < 0) {
      heading += 360;
    }

    return heading;
  }

  /**
   * Determine sensor accuracy based on magnetometer magnitude
   */
  private determineSensorAccuracy(magnitude: number): SensorAccuracy {
    // Earth's magnetic field is approximately 25-65 µT
    // In typical units used by sensors, this translates to roughly 25-65
    const expectedMin = 20;
    const expectedMax = 70;

    if (magnitude < expectedMin * 0.5 || magnitude > expectedMax * 2) {
      return SensorAccuracy.UNRELIABLE;
    } else if (magnitude < expectedMin || magnitude > expectedMax) {
      return SensorAccuracy.LOW;
    } else if (magnitude < expectedMin * 1.1 || magnitude > expectedMax * 0.9) {
      return SensorAccuracy.MEDIUM;
    } else {
      return SensorAccuracy.HIGH;
    }
  }

  /**
   * Get simple compass heading (without full sensor fusion)
   */
  getCompassHeading(callback: (data: CompassData) => void): SensorSubscription {
    const subscription = magnetometer.subscribe(
      ({ x, y, z, timestamp }) => {
        // Simple heading calculation (assumes device is flat)
        let heading = (Math.atan2(y, x) * 180) / Math.PI;

        // Normalize to 0-360 degrees
        if (heading < 0) {
          heading += 360;
        }

        const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        const accuracy = this.determineSensorAccuracy(magnitude);

        const compassData: CompassData = {
          heading,
          accuracy,
          timestamp,
        };

        callback(compassData);
      },
      error => {
        console.error('[SensorService] Compass error:', error);
        throw new SensorError('Compass not available', SensorErrorType.SENSOR_NOT_AVAILABLE, error);
      },
    );

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  /**
   * Check if sensors are available
   */
  async checkSensorsAvailable(): Promise<{
    magnetometer: boolean;
    accelerometer: boolean;
  }> {
    let magAvailable = false;
    let accAvailable = false;

    try {
      const magSub = magnetometer.subscribe(() => {
        magAvailable = true;
      });
      setTimeout(() => magSub.unsubscribe(), 100);
    } catch (error) {
      console.warn('[SensorService] Magnetometer not available:', error);
    }

    try {
      const accSub = accelerometer.subscribe(() => {
        accAvailable = true;
      });
      setTimeout(() => accSub.unsubscribe(), 100);
    } catch (error) {
      console.warn('[SensorService] Accelerometer not available:', error);
    }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          magnetometer: magAvailable,
          accelerometer: accAvailable,
        });
      }, 150);
    });
  }
}
