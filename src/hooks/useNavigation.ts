// Hook for managing in-app navigation state with real-time tracking and progress
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getWalkingRoute, 
  getDrivingRoute, 
  OSRMRoute, 
  Coordinate 
} from '@/lib/osrmService';
import { useGeolocation } from './useGeolocation';
import { calculateDistance } from '@/lib/mapUtils';
import { cacheRoute, getCachedRoute, isOffline } from '@/lib/offlineCache';

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
  // Progress tracking
  progressPercent: number; // 0-100
  distanceTraveled: number; // meters
  traveledPath: Coordinate[]; // Path already traveled
  isOfflineMode: boolean;
}

const ARRIVAL_THRESHOLD_METERS = 30;
const STEP_ADVANCE_THRESHOLD_METERS = 25;
const POSITION_UPDATE_INTERVAL = 3000;
const MIN_MOVEMENT_THRESHOLD = 5; // meters - minimum movement to record new point

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
    progressPercent: 0,
    distanceTraveled: 0,
    traveledPath: [],
    isOfflineMode: false,
  });
  
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const initialDistanceRef = useRef<number>(0);
  const traveledPathRef = useRef<Coordinate[]>([]);

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
    
    const origin: Coordinate = { lat, lng };
    const dest: Coordinate = { lat: destination.lat, lng: destination.lng };
    
    let route: OSRMRoute | null = null;
    let offlineMode = false;
    
    // Try to get cached route first if offline
    if (isOffline()) {
      route = await getCachedRoute(origin, dest, mode);
      if (route) {
        offlineMode = true;
        // Using cached route (offline)
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Sin conexión y sin ruta en caché' 
        }));
        return false;
      }
    } else {
      // Online: fetch from OSRM
      const result = mode === 'walking' 
        ? await getWalkingRoute(origin, dest)
        : await getDrivingRoute(origin, dest);
      
      if (!result.success || !result.route) {
        // Try cached route as fallback
        route = await getCachedRoute(origin, dest, mode);
        if (route) {
          offlineMode = true;
          // Using cached route (API failed)
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: result.error || 'No se pudo calcular la ruta' 
          }));
          return false;
        }
      } else {
        route = result.route;
        // Cache the route for offline use
        await cacheRoute(origin, destination, mode, route);
      }
    }
    
    lastPositionRef.current = { lat, lng };
    initialDistanceRef.current = route.distance;
    traveledPathRef.current = [{ lat, lng }];
    
    setState({
      isNavigating: true,
      isLoading: false,
      error: null,
      route,
      currentStepIndex: 0,
      destination,
      transportMode: mode,
      distanceRemaining: route.distance,
      timeRemaining: route.duration,
      progressPercent: 0,
      distanceTraveled: 0,
      traveledPath: [{ lat, lng }],
      isOfflineMode: offlineMode,
    });
    
    startPositionTracking();
    return true;
  }, [latitude, longitude, hasLocation, requestLocation]);

  // Stop navigation
  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    traveledPathRef.current = [];
    initialDistanceRef.current = 0;
    
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
      progressPercent: 0,
      distanceTraveled: 0,
      traveledPath: [],
      isOfflineMode: false,
    });
  }, []);

  // Start watching position for real-time updates
  const startPositionTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        
        // Check if moved significantly
        if (lastPositionRef.current) {
          const moved = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            newLat,
            newLng
          ) * 1000; // km to meters
          
          if (moved >= MIN_MOVEMENT_THRESHOLD) {
            // Add to traveled path
            traveledPathRef.current.push({ lat: newLat, lng: newLng });
          }
        }
        
        lastPositionRef.current = { lat: newLat, lng: newLng };
        updateNavigationProgress(newLat, newLng);
      },
      (error) => {
        // Position tracking error
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
      ) * 1000;
      
      if (distToDestination <= ARRIVAL_THRESHOLD_METERS) {
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
          progressPercent: 100,
          distanceTraveled: initialDistanceRef.current,
          traveledPath: [...traveledPathRef.current],
        };
      }
      
      // Find closest point on route to current position
      let minDist = Infinity;
      let closestIdx = 0;
      
      for (let i = 0; i < prev.route.geometry.length; i++) {
        const point = prev.route.geometry[i];
        const dist = calculateDistance(lat, lng, point.lat, point.lng);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      
      // Calculate distance traveled along the route
      let distanceTraveled = 0;
      for (let i = 0; i < closestIdx && i < prev.route.geometry.length - 1; i++) {
        const p1 = prev.route.geometry[i];
        const p2 = prev.route.geometry[i + 1];
        distanceTraveled += calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng) * 1000;
      }
      
      // Calculate progress percentage
      const progressPercent = Math.min(
        99, // Cap at 99% until actual arrival
        Math.round((distanceTraveled / initialDistanceRef.current) * 100)
      );
      
      // Check if we should advance to next step
      let newStepIndex = prev.currentStepIndex;
      const steps = prev.route.steps;
      
      if (newStepIndex < steps.length - 1) {
        const currentStep = steps[newStepIndex];
        const nextStep = steps[newStepIndex + 1];
        
        if (currentStep.maneuver.location && nextStep.maneuver.location) {
          const distToCurrentManeuver = calculateDistance(
            lat, lng,
            currentStep.maneuver.location[1],
            currentStep.maneuver.location[0]
          ) * 1000;
          
          if (distToCurrentManeuver < STEP_ADVANCE_THRESHOLD_METERS) {
            newStepIndex = prev.currentStepIndex + 1;
          }
        }
      }
      
      // Estimate remaining time based on speed
      const speed = prev.transportMode === 'walking' ? 5 : 50; // km/h
      const remainingTime = (distToDestination / 1000 / speed) * 3600;
      
      return {
        ...prev,
        currentStepIndex: newStepIndex,
        distanceRemaining: Math.round(distToDestination),
        timeRemaining: Math.round(remainingTime),
        progressPercent,
        distanceTraveled: Math.round(distanceTraveled),
        traveledPath: [...traveledPathRef.current],
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
      // Keep traveled path but reset for new route
      const newInitialDist = result.route.distance + state.distanceTraveled;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        route: result.route!,
        currentStepIndex: 0,
        distanceRemaining: result.route!.distance,
        timeRemaining: result.route!.duration,
      }));
      
      // Cache updated route
      await cacheRoute(
        lastPositionRef.current!,
        state.destination,
        state.transportMode,
        result.route
      );
    } else {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'No se pudo recalcular la ruta' 
      }));
    }
  }, [state.destination, state.transportMode, state.distanceTraveled]);

  // Get current step
  const currentStep = state.route?.steps[state.currentStepIndex] || null;
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
