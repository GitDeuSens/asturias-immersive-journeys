// ============ DIRECTUS DATA HOOKS ============
// React hooks for loading data from Directus CMS
// These replace all static mock data imports

import { useState, useEffect, useCallback } from 'react';
import type { ImmersiveRoute, RoutePoint, RoutePointContent, Language, Category } from '@/data/types';
import type { KuulaTour, Language as ApiLanguage } from '@/lib/types';
import { getRoutes, getRoutePoints, getVirtualTours, getPOIs, getCategories } from '@/lib/api/directus-client';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

function getFileUrl(fileId: string | undefined): string {
  if (!fileId) return '';
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

// ============ Transform Directus route → ImmersiveRoute ============

function directusRouteToImmersive(route: any, points: any[]): ImmersiveRoute {
  const routePoints: RoutePoint[] = points.map((poi: any, idx: number) => {
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
      content.image = { url: poi.cover_image_url };
    }

    return {
      id: poi.id || poi.slug || `point-${idx}`,
      order: poi.order ?? idx + 1,
      title: poi.title || { es: '', en: '', fr: '' },
      shortDescription: poi.short_description || { es: '', en: '', fr: '' },
      location: {
        lat: poi.lat || 0,
        lng: poi.lng || 0,
        address: poi.address,
      },
      coverImage: poi.cover_image_url || '',
      content,
      tags: poi.tags || [],
    };
  });

  // Build polyline from route data or from points
  let polyline: { lat: number; lng: number }[] = [];
  if (route.polyline && Array.isArray(route.polyline)) {
    polyline = route.polyline;
  } else if (routePoints.length > 0) {
    polyline = routePoints
      .filter(p => p.location.lat && p.location.lng)
      .map(p => ({ lat: p.location.lat, lng: p.location.lng }));
  }

  // Calculate center from polyline or points
  let center = { lat: 43.36, lng: -5.85 }; // Default: Asturias center
  if (polyline.length > 0) {
    const sumLat = polyline.reduce((s, p) => s + p.lat, 0);
    const sumLng = polyline.reduce((s, p) => s + p.lng, 0);
    center = { lat: sumLat / polyline.length, lng: sumLng / polyline.length };
  }

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
    maxPoints: routePoints.length || 10,
    points: routePoints,
    tour360: route.tour_360_id ? { available: true } : undefined,
    polyline,
    distanceKm: route.distance_km,
    elevationGainMeters: route.elevation_gain_meters,
    surfaceType: route.surface_type,
  };
}

// ============ HOOKS ============

export function useImmersiveRoutes(language: Language = 'es') {
  const [routes, setRoutes] = useState<ImmersiveRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const directusRoutes = await getRoutes(language as ApiLanguage);
      
      // For each route, load its points
      const immersiveRoutes: ImmersiveRoute[] = await Promise.all(
        (directusRoutes as any[]).map(async (route: any) => {
          let points: any[] = [];
          try {
            points = await getRoutePoints(route.id, language as ApiLanguage);
          } catch {
            // Route may have no points
          }
          return directusRouteToImmersive(route, points);
        })
      );

      setRoutes(immersiveRoutes);
    } catch (err: any) {
      console.error('[useImmersiveRoutes] Error:', err);
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
        const data = await getVirtualTours(language as ApiLanguage);
        setTours(data);
      } catch (err) {
        console.error('[useDirectusTours] Error:', err);
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
        const data = await getCategories(language as ApiLanguage);
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
        console.error('[useDirectusCategories] Error:', err);
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
        const data = await getPOIs(language as ApiLanguage);
        setPois(data);
      } catch (err) {
        console.error('[useDirectusPOIs] Error:', err);
        setPois([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [language]);

  return { pois, loading };
}
