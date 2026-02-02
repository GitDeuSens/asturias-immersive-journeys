// Hook for managing in-app navigation state with real-time tracking
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getWalkingRoute, 
  getDrivingRoute, 
  OSRMRoute, 
  RouteStep,
  Coordinate 
} from '@/lib/osrmService';
import { useGeolocation } from './useGeolocation';
import { calculateDistance } from '@/lib/mapUtils';

export type TransportMode = 'walking' | 'driving';

export interface NavigationState {
  isNavigating: boolean;
  isLoading: boolean;
  error: string | null;
  route: OSRMRoute | null;
  currentStepIndex: number;
  destination: { name: string; lat: number; lng: number } | null;
  transportMode: TransportMode;
  distanceRemaining: number; // meters
  timeRemaining: number; // seconds
}

const ARRIVAL_THRESHOLD_METERS = 30;
const STEP_ADVANCE_THRESHOLD_METERS = 25;
const POSITION_UPDATE_INTERVAL = 3000; // 3 seconds

export function useNavigation() {
  const { latitude, longitude, hasLocation, requestLocation } = useGeolocation();
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    isLoading: false,
    error: null,
    route: null,
    currentStepIndex: 0,
    destination: null,
    transportMode: 'walking',
    distanceRemaining: 0,
    timeRemaining: 0,
  });
  
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  // Start navigation to a destination
  const startNavigation = useCallback(async (
    destination: { name: string; lat: number; lng: number },
    mode: TransportMode = 'walking'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Ensure we have location
    let lat = latitude;
    let lng = longitude;
    
    if (!hasLocation) {
      const success = await requestLocation();
      if (!success) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'No se pudo obtener tu ubicación' 
        }));
        return false;
      }
      // Get updated position from localStorage (set by requestLocation)
      const cached = localStorage.getItem('asturias-geolocation');
      if (cached) {
        const parsed = JSON.parse(cached);
        lat = parsed.latitude;
        lng = parsed.longitude;
      }
    }
    
    if (lat === null || lng === null) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Ubicación no disponible' 
      }));
      return false;
    }
    
    // Get route from OSRM
    const origin: Coordinate = { lat, lng };
    const dest: Coordinate = { lat: destination.lat, lng: destination.lng };
    
    const result = mode === 'walking' 
      ? await getWalkingRoute(origin, dest)
      : await getDrivingRoute(origin, dest);
    
    if (!result.success || !result.route) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.error || 'No se pudo calcular la ruta' 
      }));
      return false;
    }
    
    lastPositionRef.current = { lat, lng };
    
    setState({
      isNavigating: true,
      isLoading: false,
      error: null,
      route: result.route,
      currentStepIndex: 0,
      destination,
      transportMode: mode,
      distanceRemaining: result.route.distance,
      timeRemaining: result.route.duration,
    });
    
    // Start continuous position tracking
    startPositionTracking();
    
    return true;
  }, [latitude, longitude, hasLocation, requestLocation]);

  // Stop navigation
  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setState({
      isNavigating: false,
      isLoading: false,
      error: null,
      route: null,
      currentStepIndex: 0,
      destination: null,
      transportMode: 'walking',
      distanceRemaining: 0,
      timeRemaining: 0,
    });
  }, []);

  // Start watching position for real-time updates
  const startPositionTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    
    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        
        lastPositionRef.current = { lat: newLat, lng: newLng };
        
        // Update navigation state based on new position
        updateNavigationProgress(newLat, newLng);
      },
      (error) => {
        console.error('Position tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: POSITION_UPDATE_INTERVAL,
        timeout: 10000,
      }
    );
  }, []);

  // Update navigation progress based on current position
  const updateNavigationProgress = useCallback((lat: number, lng: number) => {
    setState(prev => {
      if (!prev.isNavigating || !prev.route || !prev.destination) return prev;
      
      // Check if arrived at destination
      const distToDestination = calculateDistance(
        lat, lng, 
        prev.destination.lat, prev.destination.lng
      ) * 1000; // km to meters
      
      if (distToDestination <= ARRIVAL_THRESHOLD_METERS) {
        // Arrived!
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        return {
          ...prev,
          isNavigating: false,
          currentStepIndex: prev.route.steps.length - 1,
          distanceRemaining: 0,
          timeRemaining: 0,
        };
      }
      
      // Check if we should advance to next step
      let newStepIndex = prev.currentStepIndex;
      const steps = prev.route.steps;
      
      if (newStepIndex < steps.length - 1) {
        const currentStep = steps[newStepIndex];
        const nextStep = steps[newStepIndex + 1];
        
        if (currentStep.maneuver.location && nextStep.maneuver.location) {
          const distToNextManeuver = calculateDistance(
            lat, lng,
            nextStep.maneuver.location[1], // lat
            nextStep.maneuver.location[0]  // lng
          ) * 1000;
          
          // If we're closer to the next step's maneuver point, advance
          const distToCurrentManeuver = calculateDistance(
            lat, lng,
            currentStep.maneuver.location[1],
            currentStep.maneuver.location[0]
          ) * 1000;
          
          if (distToCurrentManeuver < STEP_ADVANCE_THRESHOLD_METERS && 
              distToNextManeuver > distToCurrentManeuver) {
            newStepIndex = prev.currentStepIndex + 1;
          }
        }
      }
      
      // Calculate remaining distance and time
      let remainingDistance = distToDestination;
      
      // Estimate remaining time based on speed
      const speed = prev.transportMode === 'walking' ? 5 : 50; // km/h
      const remainingTime = (remainingDistance / 1000 / speed) * 3600; // seconds
      
      return {
        ...prev,
        currentStepIndex: newStepIndex,
        distanceRemaining: Math.round(remainingDistance),
        timeRemaining: Math.round(remainingTime),
      };
    });
  }, []);

  // Recalculate route if user goes off-track
  const recalculateRoute = useCallback(async () => {
    if (!state.destination || !lastPositionRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    const result = state.transportMode === 'walking'
      ? await getWalkingRoute(lastPositionRef.current!, { 
          lat: state.destination.lat, 
          lng: state.destination.lng 
        })
      : await getDrivingRoute(lastPositionRef.current!, { 
          lat: state.destination.lat, 
          lng: state.destination.lng 
        });
    
    if (result.success && result.route) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        route: result.route!,
        currentStepIndex: 0,
        distanceRemaining: result.route!.distance,
        timeRemaining: result.route!.duration,
      }));
    } else {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'No se pudo recalcular la ruta' 
      }));
    }
  }, [state.destination, state.transportMode]);

  // Get current step
  const currentStep = state.route?.steps[state.currentStepIndex] || null;
  
  // Get next step (for preview)
  const nextStep = state.route?.steps[state.currentStepIndex + 1] || null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    currentStep,
    nextStep,
    userPosition: lastPositionRef.current,
    startNavigation,
    stopNavigation,
    recalculateRoute,
  };
}
