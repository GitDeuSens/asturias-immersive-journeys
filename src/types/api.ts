// API response types with better type safety

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DirectusResponse<T> {
  data: T[];
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

export interface OSRMResponse {
  success: boolean;
  route?: OSRMRoute;
  error?: string;
}

export interface OSRMRoute {
  geometry: {
    coordinates: [number, number][];
  };
  legs: OSRMLeg[];
}

export interface OSRMLeg {
  steps: OSRMStep[];
  distance: number;
  duration: number;
}

export interface OSRMStep {
  maneuver: {
    type: string;
    modifier?: string;
    bearing_before?: number;
  };
  instruction: string;
  distance: number;
  duration: number;
}

// Type guards
export function isValidCoordinate(coord: unknown): coord is { lat: number; lng: number } {
  return (
    typeof coord === 'object' &&
    coord !== null &&
    'lat' in coord &&
    'lng' in coord &&
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    !isNaN(coord.lat) &&
    !isNaN(coord.lng) &&
    isFinite(coord.lat) &&
    isFinite(coord.lng)
  );
}

export function isValidCoordinates(coords: unknown): coords is { lat: number; lng: number }[] {
  return (
    Array.isArray(coords) &&
    coords.every(coord => isValidCoordinate(coord))
  );
}
