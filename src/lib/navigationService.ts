// Navigation Service for real-time routing and distance calculations
// Used when user is in "I'm already in Asturias" mode

import { calculateDistance, formatDistance } from './mapUtils';

export interface NavigationDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'poi' | 'route-start' | 'route-point';
}

export interface DistanceResult {
  destination: NavigationDestination;
  distanceKm: number;
  distanceFormatted: string;
  estimatedWalkingTime: number; // minutes
  estimatedDrivingTime: number; // minutes
}

// Walking speed: ~5 km/h, Driving: ~50 km/h (average with roads)
const WALKING_SPEED_KMH = 5;
const DRIVING_SPEED_KMH = 50;

/**
 * Calculate distance from user position to a destination
 */
export function calculateDistanceTo(
  userLat: number,
  userLng: number,
  destination: NavigationDestination
): DistanceResult {
  const distanceKm = calculateDistance(userLat, userLng, destination.lat, destination.lng);
  
  return {
    destination,
    distanceKm,
    distanceFormatted: formatDistance(distanceKm),
    estimatedWalkingTime: Math.round((distanceKm / WALKING_SPEED_KMH) * 60),
    estimatedDrivingTime: Math.round((distanceKm / DRIVING_SPEED_KMH) * 60),
  };
}

/**
 * Calculate distances to multiple destinations and sort by proximity
 */
export function calculateDistancesToAll(
  userLat: number,
  userLng: number,
  destinations: NavigationDestination[]
): DistanceResult[] {
  return destinations
    .map(dest => calculateDistanceTo(userLat, userLng, dest))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Filter destinations within a radius
 */
export function filterByRadius(
  results: DistanceResult[],
  maxRadiusKm: number
): DistanceResult[] {
  return results.filter(r => r.distanceKm <= maxRadiusKm);
}

/**
 * Get nearby destinations grouped by type
 */
export function getNearbyGrouped(
  userLat: number,
  userLng: number,
  destinations: NavigationDestination[],
  maxRadiusKm: number = 50
): Record<string, DistanceResult[]> {
  const all = calculateDistancesToAll(userLat, userLng, destinations);
  const nearby = filterByRadius(all, maxRadiusKm);
  
  return nearby.reduce((acc, result) => {
    const type = result.destination.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, DistanceResult[]>);
}

/**
 * Open external navigation app with directions
 */
export function openNavigationTo(destination: NavigationDestination): void {
  const { lat, lng, name } = destination;
  const encodedName = encodeURIComponent(name);
  
  // Detect iOS for Apple Maps preference
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // Apple Maps - walking mode
    const url = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=w&q=${encodedName}`;
    const newWindow = window.open(url, '_blank');
    // Fallback if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }
  } else {
    // Google Maps - walking mode
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    const newWindow = window.open(url, '_blank');
    // Fallback if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }
  }
}

/**
 * Open driving navigation
 */
export function openDrivingNavigationTo(destination: NavigationDestination): void {
  const { lat, lng, name } = destination;
  const encodedName = encodeURIComponent(name);
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    const url = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&q=${encodedName}`;
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }
  } else {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }
  }
}

/**
 * Format estimated time for display
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Check if user is within "arrival" range of a destination (default 50m)
 */
export function isUserNearDestination(
  userLat: number,
  userLng: number,
  destination: NavigationDestination,
  thresholdMeters: number = 50
): boolean {
  const distanceKm = calculateDistance(userLat, userLng, destination.lat, destination.lng);
  return distanceKm * 1000 <= thresholdMeters;
}

/**
 * Get the closest destination from user's position
 */
export function getClosestDestination(
  userLat: number,
  userLng: number,
  destinations: NavigationDestination[]
): DistanceResult | null {
  if (destinations.length === 0) return null;
  
  const sorted = calculateDistancesToAll(userLat, userLng, destinations);
  return sorted[0] || null;
}
