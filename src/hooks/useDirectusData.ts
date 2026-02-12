// ============ DIRECTUS DATA HOOKS ============
// React hooks for loading data from Directus CMS
// These replace all static mock data imports

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ImmersiveRoute, RoutePoint, RoutePointContent, Category, POI } from "@/data/types";
import type { Language } from "@/data/types";
import type { KuulaTour } from "@/lib/types";
import { 
  getRoutes, 
  getRoutePoints, 
  getVirtualTours, 
  getCategories, 
  getPOIs,
} from "@/lib/api/directus-client";
import { logger } from "@/lib/logger";
import { dataCache } from "./useCachedData";

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

function getFileUrl(fileId: string | undefined): string {
  if (!fileId) return '';
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

// ============ Transform Directus route → ImmersiveRoute ============

// Check if a coordinate is valid (non-zero and within reasonable bounds for Asturias region)
function isValidCoord(lat: number, lng: number): boolean {
  // Asturias approximate bounding box with generous margin
  return (
    lat !== 0 && lng !== 0 &&
    isFinite(lat) && isFinite(lng) &&
    lat >= 42.0 && lat <= 44.5 &&
    lng >= -8.5 && lng <= -3.0
  );
}

function directusRouteToImmersive(route: any, points: any[]): ImmersiveRoute {
  // Points are already sorted by API order field, no need to re-sort
  const sortedPoints = points;

  const routePoints: RoutePoint[] = sortedPoints
    .map((poi: any, idx: number) => {
      const content: RoutePointContent = {};

      // Map AR scene if linked
      if (poi.ar_scene_id) {
        content.arExperience = {
          launchUrl: poi.ar_launch_url || '',
          qrValue: poi.ar_qr_value || '',
          iframe3dUrl: poi.ar_iframe_url,
        };
      }

      // Map 360 tour if linked
      if (poi.tour_360_id) {
        console.log(' debes entrar 2 veces ', poi);
        content.tour360 = {
          iframe360Url: poi.tour_360_url || '',
          allowFullscreen: true,
        };
      }

      // Map practical info
      if (poi.phone || poi.email || poi.website || poi.opening_hours || poi.prices) {
        content.practicalInfo = {
          phone: poi.phone,
          email: poi.email,
          website: poi.website,
          schedule: poi.opening_hours,
          prices: poi.prices,
        };
      }

      // Map cover image
      if (poi.cover_image_url) {
        content.image = { url: poi.cover_image };
      }

      const lat = Number(poi.lat) || 0;
      const lng = Number(poi.lng) || 0;

      return {
        id: poi.id || poi.slug || `point-${idx}`,
        order: poi.order ?? idx + 1,
        title: poi.translations[0].title || { es: '', en: '', fr: '' },
        shortDescription: poi.translations[0].short_description || { es: '', en: '', fr: '' },
        location: {
          lat,
          lng,
          address: poi.address,
        },
        coverImage: poi.cover_image || '',
        content,
        tags: poi.tags || [],
      };
    });
    // Filter out points with invalid coordinates — they can't be shown on the map
   // .filter(p => isValidCoord(p.location.lat, p.location.lng));

  // Build polyline: prefer DB polyline if valid, otherwise generate from POI points
  let polyline: { lat: number; lng: number }[] = [];

  if (route.polyline && Array.isArray(route.polyline) && route.polyline.length >= 2) {
    // Validate that DB polyline coordinates are within Asturias bounds
    const validDbPolyline = route.polyline.filter(
      (p: any) => isValidCoord(Number(p.lat), Number(p.lng))
    );
    if (validDbPolyline.length >= 2) {
      polyline = validDbPolyline.map((p: any) => ({ lat: Number(p.lat), lng: Number(p.lng) }));
    }
  }

  // Fallback: generate polyline from valid POI points (in order)
  if (polyline.length < 2 && routePoints.length >= 2) {
    polyline = routePoints.map(p => ({ lat: p.location.lat, lng: p.location.lng }));
  }

  // If only 1 point or 0 points, polyline stays empty — no line will be drawn
  if (polyline.length < 2) {
    polyline = [];
  }

  // Calculate center: prefer DB center_lat/center_lng, then polyline, then POI points
  let center = { lat: 43.36, lng: -5.85 }; // Default: Asturias center
  const dbCenterLat = Number(route.center_lat);
  const dbCenterLng = Number(route.center_lng);
  if (isValidCoord(dbCenterLat, dbCenterLng)) {
    center = { lat: dbCenterLat, lng: dbCenterLng };
  } else {
    const coordsForCenter = polyline.length > 0 ? polyline : routePoints.map(p => p.location);
    if (coordsForCenter.length > 0) {
      const sumLat = coordsForCenter.reduce((s, p) => s + p.lat, 0);
      const sumLng = coordsForCenter.reduce((s, p) => s + p.lng, 0);
      center = { lat: sumLat / coordsForCenter.length, lng: sumLng / coordsForCenter.length };
    }
  }

  console.log(' puntos de ruta ', routePoints, points);

  return {
    id: route.route_code || route.id,
    title: route.title || { es: '', en: '', fr: '' },
    shortDescription: route.short_description || { es: '', en: '', fr: '' },
    fullDescription: route.description,
    coverImage: route.cover_image_url || '',
    theme: route.theme || { es: '', en: '', fr: '' },
    categoryIds: route.category_ids || [],
    duration: route.duration,
    difficulty: route.difficulty || 'easy',
    isCircular: route.is_circular ?? false,
    center,
    maxPoints: points.length,
    points: routePoints,
    tour360: route.tour_360_id ? { available: true } : undefined,
    polyline,
    distanceKm: route.distance_km,
    elevationGainMeters: route.elevation_gain_meters,
    surfaceType: route.surface_type,
  };
}

// ============ HOOKS ============

export { directusRouteToImmersive };

export function useImmersiveRoutes(language: Language = 'es') {
  const [routes, setRoutes] = useState<ImmersiveRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Check cache first
    const cacheKey = `routes_${language}`;
    const cached = dataCache.get<ImmersiveRoute[]>(cacheKey);
    if (cached) {
      setRoutes(cached);
      setLoading(false);
      return;
    }
    
    try {
      const directusRoutes = await getRoutes(language);
      
      // Points are now loaded with deep relations, no need for separate requests
      const immersiveRoutes: ImmersiveRoute[] = directusRoutes.map((route: any) => {
        // Points are already included in the route data
        const points = route.points || [];
        return directusRouteToImmersive(route, points);
      });

      setRoutes(immersiveRoutes);
      // Cache for 5 minutes
      dataCache.set(cacheKey, immersiveRoutes, 5 * 60 * 1000);
    } catch (err: any) {
      // Error loading routes
      setError(err?.message || 'Failed to load routes');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  return { routes, loading, error, reload: loadRoutes };
}

export function useDirectusTours(language: Language = 'es') {
  const [tours, setTours] = useState<KuulaTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getVirtualTours(language);
        setTours(data);
      } catch (err) {
        // Error loading tours
        setTours([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [language]);

  return { tours, loading };
}

export function useDirectusCategories(language: Language = 'es') {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getCategories(language);
        // Map Directus categories to frontend Category type
        // Directus: { id (uuid), slug, icon, color, name: {es,en,fr} }
        // Frontend: { id (slug), label: {es,en,fr}, icon, color }
        const mapped: Category[] = (data as any[]).map(c => ({
          id: c.slug || c.id,
          label: c.name || { es: '', en: '', fr: '' },
          icon: c.icon || 'Tag',
          color: c.color || '#888',
        }));
        setCategories(mapped);
      } catch (err) {
        // Error loading categories
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [language]);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find(c => c.id === id);
  }, [categories]);

  return { categories, loading, getCategoryById };
}

export function useDirectusPOIs(language: Language = 'es') {
  const [pois, setPois] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPOIs(language);
        setPois(data);
      } catch (err) {
        // Error loading POIs
        setPois([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [language]);

  return { pois, loading };
}

// ============ ANALYTICS EVENTS ============

export function useAnalyticsEvents(since?: string) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '5000', sort: '-created_at' });
      if (since) params.set('filter[created_at][_gte]', since);
      // In dev, use Vite proxy to avoid cross-origin issues; in prod, use Directus URL directly
      const baseUrl = import.meta.env.DEV ? '/directus-api' : DIRECTUS_URL;
      const res = await fetch(`${baseUrl}/items/analytics_events?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setEvents(json.data || []);
    } catch (err: any) {
      // Error loading analytics
      setError(err?.message || 'Failed to load analytics');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [since]);

  useEffect(() => { load(); }, [load]);

  return { events, loading, error, reload: load };
}
