import { useState, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
}

const initialState: GeolocationState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  error: null,
  loading: false,
  permissionStatus: 'unknown',
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(() => {
    // Check for cached position
    const cached = localStorage.getItem('asturias-geolocation');
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...initialState, ...parsed, permissionStatus: 'granted' };
    }
    return initialState;
  });

  const requestLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported', permissionStatus: 'denied' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          localStorage.setItem('asturias-geolocation', JSON.stringify(locationData));
          
          setState({
            ...locationData,
            error: null,
            loading: false,
            permissionStatus: 'granted',
          });
          resolve(true);
        },
        (error) => {
          let errorMessage = 'Error getting location';
          let permissionStatus: GeolocationState['permissionStatus'] = 'denied';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              permissionStatus = 'denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          setState(prev => ({
            ...prev,
            error: errorMessage,
            loading: false,
            permissionStatus,
          }));
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem('asturias-geolocation');
    setState(initialState);
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}
