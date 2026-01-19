/**
 * MockSensorService
 * Provides simulated sensor data for testing in simulators where real sensors aren't available
 */

import { SensorFusionData, SensorAccuracy, SensorSubscription } from '../../types/sensors';

export class MockSensorService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentHeading: number = 0;
  private headingChangeRate: number = 1; // degrees per update

  /**
   * Start heading tracking with mock data
   */
  startHeadingTracking(
    callback: (data: SensorFusionData) => void,
    _errorCallback?: (error: Error) => void,
  ): SensorSubscription {
    console.log('[MockSensorService] Starting mock sensor tracking (for simulator testing)');

    // Simulate smooth heading rotation for testing
    this.intervalId = setInterval(() => {
      // Slowly rotate heading (simulating device rotation)
      this.currentHeading = (this.currentHeading + this.headingChangeRate) % 360;

      const mockData: SensorFusionData = {
        heading: this.currentHeading,
        pitch: 0, // Device flat
        roll: 0, // Device flat
        accuracy: SensorAccuracy.HIGH,
        needsCalibration: false,
        timestamp: Date.now(),
      };

      callback(mockData);
    }, 100); // 10 Hz update rate

    return {
      unsubscribe: () => this.stopHeadingTracking(),
    };
  }

  /**
   * Stop heading tracking
   */
  stopHeadingTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentHeading = 0;
  }

  /**
   * Set custom heading for testing specific scenarios
   */
  setHeading(heading: number): void {
    this.currentHeading = heading % 360;
  }

  /**
   * Set heading change rate (degrees per update)
   */
  setHeadingChangeRate(rate: number): void {
    this.headingChangeRate = rate;
  }
}
