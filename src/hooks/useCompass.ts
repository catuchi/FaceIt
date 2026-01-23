/**
 * useCompass Hook
 * Custom hook for managing compass orientation state and sensor data
 * Handles location, bearing calculation, sensor tracking, and alignment detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { LocationService } from '../services/location/LocationService';
import { SensorService } from '../services/sensors/SensorService';
import { MockSensorService } from '../services/sensors/MockSensorService';
import { CalculationService } from '../services/calculations/CalculationService';
import { Coordinates } from '../types/location';
import { SensorAccuracy } from '../types/sensors';

/** Alignment threshold in degrees (±5°) */
const ALIGNMENT_THRESHOLD = 5;

export interface UseCompassOptions {
  /** Target location coordinates */
  targetLocation: Coordinates;
  /** Alignment threshold in degrees (default: 5) */
  alignmentThreshold?: number;
  /** Callback when alignment state changes */
  onAlignmentChange?: (isAligned: boolean) => void;
}

export interface UseCompassResult {
  /** Target bearing in degrees (0-360) */
  bearing: number;
  /** Current device heading in degrees (0-360) */
  deviceHeading: number;
  /** Whether the compass is aligned with the target */
  isAligned: boolean;
  /** Sensor accuracy level */
  accuracy: SensorAccuracy;
  /** Whether the compass needs calibration */
  needsCalibration: boolean;
  /** Distance to target in meters */
  distance: number;
  /** Cardinal direction to target */
  cardinalDirection: string;
  /** Current user location */
  currentLocation: Coordinates | null;
  /** Whether location is being loaded */
  isLoadingLocation: boolean;
  /** Location error message if any */
  locationError: string | null;
  /** Whether using mock sensors (simulator mode) */
  isSimulatorMode: boolean;
  /** Retry loading location */
  retryLocation: () => void;
}

/**
 * Custom hook for compass functionality
 * Manages sensor tracking, bearing calculation, and alignment detection
 */
export function useCompass({
  targetLocation,
  alignmentThreshold = ALIGNMENT_THRESHOLD,
  onAlignmentChange,
}: UseCompassOptions): UseCompassResult {
  // Location state
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sensor state
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [accuracy, setAccuracy] = useState<SensorAccuracy>(SensorAccuracy.MEDIUM);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);

  // Calculated values
  const [bearing, setBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [cardinalDirection, setCardinalDirection] = useState('N');

  // Services refs
  const locationServiceRef = useRef<LocationService | null>(null);
  const sensorServiceRef = useRef<SensorService | null>(null);
  const mockSensorServiceRef = useRef<MockSensorService | null>(null);

  // Track previous alignment state for callback
  const prevIsAlignedRef = useRef(false);

  // Initialize services
  useEffect(() => {
    locationServiceRef.current = new LocationService();
    sensorServiceRef.current = new SensorService();
    mockSensorServiceRef.current = new MockSensorService();

    return () => {
      // Cleanup on unmount
      sensorServiceRef.current?.stopHeadingTracking();
      mockSensorServiceRef.current?.stopHeadingTracking();
    };
  }, []);

  // Load current location
  const loadCurrentLocation = useCallback(async () => {
    if (!locationServiceRef.current) return;

    try {
      setIsLoadingLocation(true);
      setLocationError(null);

      // Request permission first (Android requires explicit request)
      await locationServiceRef.current.requestPermission();

      const coords = await locationServiceRef.current.getCurrentLocation();
      setCurrentLocation(coords);
    } catch (error: any) {
      console.error('[useCompass] Failed to get location:', error);
      setLocationError(error.message || 'Failed to get your location');
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  // Start sensor tracking
  const startSensorTracking = useCallback(() => {
    if (!sensorServiceRef.current || !mockSensorServiceRef.current) return;

    try {
      sensorServiceRef.current.startHeadingTracking(
        data => {
          setDeviceHeading(data.heading);
          setAccuracy(data.accuracy);
          setNeedsCalibration(data.needsCalibration);
        },
        error => {
          console.warn('[useCompass] Real sensors not available, using mock sensors:', error);
          setIsSimulatorMode(true);
          mockSensorServiceRef.current?.startHeadingTracking(data => {
            setDeviceHeading(data.heading);
            setAccuracy(data.accuracy);
            setNeedsCalibration(data.needsCalibration);
          });
        },
      );
    } catch (error) {
      console.error('[useCompass] Failed to start sensor tracking:', error);
    }
  }, []);

  // Load location on mount
  useEffect(() => {
    loadCurrentLocation();
  }, [loadCurrentLocation]);

  // Start sensors when location is available
  useEffect(() => {
    if (currentLocation) {
      startSensorTracking();
    }

    return () => {
      sensorServiceRef.current?.stopHeadingTracking();
      mockSensorServiceRef.current?.stopHeadingTracking();
    };
  }, [currentLocation, startSensorTracking]);

  // Stop sensors when app goes to background (battery optimization)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Stop sensors when app is backgrounded
        sensorServiceRef.current?.stopHeadingTracking();
        mockSensorServiceRef.current?.stopHeadingTracking();
      } else if (nextAppState === 'active' && currentLocation) {
        // Restart sensors when app comes to foreground
        startSensorTracking();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [currentLocation, startSensorTracking]);

  // Calculate bearing and distance only when location changes (not on every heading update)
  useEffect(() => {
    if (!currentLocation) return;

    // Calculate bearing to target
    const calculatedBearing = CalculationService.calculateBearing(currentLocation, targetLocation);
    setBearing(calculatedBearing);

    // Calculate distance to target
    const calculatedDistance = CalculationService.calculateDistance(
      currentLocation,
      targetLocation,
    );
    setDistance(calculatedDistance);

    // Get cardinal direction
    const cardinal = CalculationService.getCardinalDirection(calculatedBearing);
    setCardinalDirection(cardinal);
  }, [currentLocation, targetLocation]);

  // Check alignment separately - this runs on every heading change but is lightweight
  useEffect(() => {
    if (!currentLocation) return;

    // Check alignment (lightweight calculation)
    const bearingDiff = Math.abs(bearing - deviceHeading);
    const normalizedDiff = Math.min(bearingDiff, 360 - bearingDiff);
    const aligned = normalizedDiff <= alignmentThreshold;
    setIsAligned(aligned);

    // Trigger callback on alignment state change
    if (aligned !== prevIsAlignedRef.current) {
      prevIsAlignedRef.current = aligned;
      onAlignmentChange?.(aligned);
    }
  }, [bearing, deviceHeading, alignmentThreshold, onAlignmentChange, currentLocation]);

  // Retry location function
  const retryLocation = useCallback(() => {
    loadCurrentLocation();
  }, [loadCurrentLocation]);

  return {
    bearing,
    deviceHeading,
    isAligned,
    accuracy,
    needsCalibration,
    distance,
    cardinalDirection,
    currentLocation,
    isLoadingLocation,
    locationError,
    isSimulatorMode,
    retryLocation,
  };
}

export default useCompass;
