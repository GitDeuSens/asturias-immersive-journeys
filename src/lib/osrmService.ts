// OSRM (Open Source Routing Machine) Service for turn-by-turn navigation
// Uses the public OSRM demo server - for production, consider self-hosting

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuver: {
    type: string;
    modifier?: string;
    bearing_before?: number;
    bearing_after?: number;
    location: [number, number]; // [lng, lat]
  };
  name: string;
  geometry: Coordinate[];
}

export interface OSRMRoute {
  distance: number; // total meters
  duration: number; // total seconds
  geometry: Coordinate[];
  steps: RouteStep[];
}

export interface OSRMResponse {
  success: boolean;
  route?: OSRMRoute;
  error?: string;
}

// OSRM demo server (rate limited, for development)
// For production, self-host or use alternatives
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Get walking route between two points
 */
export async function getWalkingRoute(
  origin: Coordinate,
  destination: Coordinate
): Promise<OSRMResponse> {
  return getRoute(origin, destination, 'foot');
}

/**
 * Get driving route between two points
 */
export async function getDrivingRoute(
  origin: Coordinate,
  destination: Coordinate
): Promise<OSRMResponse> {
  return getRoute(origin, destination, 'car');
}

/**
 * Get route between two points with specified profile
 */
async function getRoute(
  origin: Coordinate,
  destination: Coordinate,
  profile: 'foot' | 'car' | 'bike' = 'foot'
): Promise<OSRMResponse> {
  try {
    // OSRM expects coordinates as lng,lat
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${OSRM_BASE_URL}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return {
        success: false,
        error: data.message || 'No route found',
      };
    }
    
    const route = data.routes[0];
    const legs = route.legs[0];
    
    // Parse geometry (GeoJSON LineString)
    const geometry: Coordinate[] = route.geometry.coordinates.map(
      (coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0],
      })
    );
    
    // Parse steps with human-readable instructions
    const steps: RouteStep[] = legs.steps.map((step: any) => ({
      instruction: generateInstruction(step, profile),
      distance: step.distance,
      duration: step.duration,
      maneuver: {
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
        bearing_before: step.maneuver.bearing_before,
        bearing_after: step.maneuver.bearing_after,
        location: step.maneuver.location,
      },
      name: step.name || '',
      geometry: step.geometry?.coordinates?.map((c: [number, number]) => ({
        lat: c[1],
        lng: c[0],
      })) || [],
    }));
    
    return {
      success: true,
      route: {
        distance: route.distance,
        duration: route.duration,
        geometry,
        steps,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate human-readable instruction from OSRM step
 */
function generateInstruction(step: any, profile: 'foot' | 'car' | 'bike'): string {
  const type = step.maneuver.type;
  const modifier = step.maneuver.modifier;
  const name = step.name ? `por ${step.name}` : '';
  
  const instructions: Record<string, Record<string, string>> = {
    depart: {
      default: `Comienza ${name}`.trim(),
    },
    arrive: {
      default: 'Has llegado a tu destino',
    },
    turn: {
      left: `Gira a la izquierda ${name}`.trim(),
      right: `Gira a la derecha ${name}`.trim(),
      'sharp left': `Gira bruscamente a la izquierda ${name}`.trim(),
      'sharp right': `Gira bruscamente a la derecha ${name}`.trim(),
      'slight left': `Gira ligeramente a la izquierda ${name}`.trim(),
      'slight right': `Gira ligeramente a la derecha ${name}`.trim(),
      straight: `Continúa recto ${name}`.trim(),
      uturn: `Da media vuelta ${name}`.trim(),
    },
    'new name': {
      default: `Continúa ${name}`.trim(),
    },
    merge: {
      default: `Incorpórate ${name}`.trim(),
    },
    'on ramp': {
      default: `Toma la rampa ${name}`.trim(),
    },
    'off ramp': {
      default: `Sal por la rampa ${name}`.trim(),
    },
    fork: {
      left: `Mantente a la izquierda en la bifurcación ${name}`.trim(),
      right: `Mantente a la derecha en la bifurcación ${name}`.trim(),
      'slight left': `Mantente a la izquierda ${name}`.trim(),
      'slight right': `Mantente a la derecha ${name}`.trim(),
    },
    'end of road': {
      left: `Al final de la calle, gira a la izquierda ${name}`.trim(),
      right: `Al final de la calle, gira a la derecha ${name}`.trim(),
    },
    continue: {
      default: `Continúa ${name}`.trim(),
      left: `Continúa a la izquierda ${name}`.trim(),
      right: `Continúa a la derecha ${name}`.trim(),
      straight: `Sigue recto ${name}`.trim(),
    },
    roundabout: {
      default: `En la rotonda, toma la salida ${name}`.trim(),
    },
    rotary: {
      default: `En la glorieta, toma la salida ${name}`.trim(),
    },
    'roundabout turn': {
      left: `En la rotonda, gira a la izquierda ${name}`.trim(),
      right: `En la rotonda, gira a la derecha ${name}`.trim(),
    },
    notification: {
      default: name || 'Continúa',
    },
    'exit roundabout': {
      default: `Sal de la rotonda ${name}`.trim(),
    },
  };
  
  const typeInstructions = instructions[type];
  if (!typeInstructions) {
    return `Continúa ${name}`.trim() || 'Continúa';
  }
  
  return typeInstructions[modifier] || typeInstructions.default || `Continúa ${name}`.trim();
}

/**
 * Format distance for display
 */
export function formatRouteDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 */
export function formatRouteDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
}

/**
 * Get maneuver icon name based on step type
 */
export function getManeuverIcon(step: RouteStep): string {
  const type = step.maneuver.type;
  const modifier = step.maneuver.modifier;
  
  if (type === 'arrive') return 'flag';
  if (type === 'depart') return 'play';
  
  if (type === 'turn' || type === 'end of road' || type === 'fork') {
    if (modifier?.includes('left')) return 'arrow-left';
    if (modifier?.includes('right')) return 'arrow-right';
    if (modifier === 'uturn') return 'rotate-ccw';
    return 'arrow-up';
  }
  
  if (type === 'roundabout' || type === 'rotary') return 'circle';
  
  return 'arrow-up';
}
