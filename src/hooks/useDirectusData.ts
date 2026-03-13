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
import { toMultilingual } from "@/lib/directus-types";
import { logger } from "@/lib/logger";
import { DIRECTUS_URL } from "@/lib/directus-url";
import { dataCache } from "./useCachedData";

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

      // Map AR scene if linked (ar_scene_id is expanded object from Directus deep query)
      const arScene = typeof poi.ar_scene_id === 'object' && poi.ar_scene_id ? poi.ar_scene_id : null;
      if (arScene) {
        const arSlug = (arScene as any).slug || '';
        const buildPath = (arScene as any).build_path || '';
        const baseUrl = window.location.origin;
        // Resolve AR build URL from Directus server
        const arBuildUrl = buildPath
          ? `${DIRECTUS_URL}/builds${buildPath}`
          : (arSlug ? `${DIRECTUS_URL}/builds/ar-builds/${arSlug}/` : undefined);
        content.arExperience = {
          launchUrl: arSlug ? `${baseUrl}/ar/${arSlug}` : '',
          qrValue: arSlug ? `${baseUrl}/ar/${arSlug}` : '',
          iframe3dUrl: arBuildUrl,
          arSlug,
          arSceneId: (arScene as any).id,
          glb_model: (arScene as any).glb_model || undefined,
          glb_scale: (arScene as any).glb_scale,
          glb_rotation_y: (arScene as any).glb_rotation_y,
          scene_mode: (arScene as any).scene_mode || 'build',
        };
      }

      // Map 360 tour if linked (tour_360_id is expanded object from Directus deep query)
      const tour360 = typeof poi.tour_360_id === 'object' && poi.tour_360_id ? poi.tour_360_id : null;
      if (tour360) {
        const tourBuildPath = (tour360 as any).build_path || '';
        const tourSlug = (tour360 as any).slug || '';
        // Resolve tour build URL from Directus server
        const tourBuildUrl = tourBuildPath
          ? `${DIRECTUS_URL}/builds${tourBuildPath}`
          : (tourSlug ? `${DIRECTUS_URL}/builds/tours-builds/${tourSlug}/` : '');
        content.tour360 = {
          iframe360Url: tourBuildUrl,
          allowFullscreen: true,
        };
      }
      
      if (Array.isArray(poi.gallery)) {
        const photos: { url: string }[] = [];
        poi.gallery.forEach((photo: any) => {
          if (photo?.directus_files_id) {
            photos.push({ url: DIRECTUS_URL + '/assets/' + photo.directus_files_id });
          }
        });
        if (photos.length > 0) content.gallery = photos;
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

      // Map audio guides — audio_es/en/fr are expanded {id, duration} objects from Directus
      // Duration comes directly from directus_files.duration (no separate POI fields needed)
      const getAudioId = (f: any): string | undefined =>
        typeof f === 'object' && f?.id ? f.id : (typeof f === 'string' ? f : undefined);
      const getAudioDuration = (f: any): number | undefined =>
        typeof f === 'object' && f?.duration ? f.duration : undefined;

      if (poi.audio_es || poi.audio_en || poi.audio_fr) {

        content.audioGuide = {};
        if (poi.audio_es) {
          const audioId = getAudioId(poi.audio_es);
          if (audioId) {
            content.audioGuide.es = {
              url: getFileUrl(audioId),
              durationSec: getAudioDuration(poi.audio_es),
            };
          }
        }
        if (poi.audio_en) {
          const audioId = getAudioId(poi.audio_en);
          if (audioId) {
            content.audioGuide.en = {
              url: getFileUrl(audioId),
              durationSec: getAudioDuration(poi.audio_en),
            };
          }
        }
        if (poi.audio_fr) {
          const audioId = getAudioId(poi.audio_fr);
          if (audioId) {
            content.audioGuide.fr = {
              url: getFileUrl(audioId),
              durationSec: getAudioDuration(poi.audio_fr),
            };
          }
        }
        // If no valid audio IDs resolved, remove the empty audioGuide
        if (Object.keys(content.audioGuide).length === 0) {
          delete content.audioGuide;
          console.warn(`[Audio Debug] POI "${poi.slug || poi.id}" had audio fields but no valid IDs resolved`);
        }
      }

      // Map cover image
      if (poi.cover_image) {
        content.image = { url: getFileUrl(poi.cover_image) };
      }

      const lat = Number(poi.lat) || 0;
      const lng = Number(poi.lng) || 0;
      // Build audioGuides URLs correctly (handle both string UUIDs and expanded objects)
      const buildAudioUrl = (f: any): string => {
        const id = getAudioId(f);
        return id ? `${DIRECTUS_URL}/assets/${id}` : '';
      };
      // TODO meter gallery aqui
      return {
        id: poi.slug || poi.id || `point-${idx}`, // Use slug first for clean URLs
        slug: poi.slug || poi.id || `point-${idx}`, // DB slug from Directus
        audioGuides: {
          es: buildAudioUrl(poi.audio_es),
          en: buildAudioUrl(poi.audio_en),
          fr: buildAudioUrl(poi.audio_fr),
        },
        poiUUID: poi.id, // Keep original UUID for API queries
        order: poi.order ?? idx + 1,
        title: toMultilingual(poi.translations, 'title') || { es: '', en: '', fr: '' },
        shortDescription: toMultilingual(poi.translations, 'short_description') || { es: '', en: '', fr: '' },
        longDescription: toMultilingual(poi.translations, 'description') || undefined,
        location: {
          lat,
          lng,
          address: poi.address,
        },
        coverImage: poi.cover_image || '',
        shareUrl: poi.share_url || '',
        content,
        gallery: poi.gallery,
        tags: poi.tags || [],
        viewCount: Math.max(Number(poi.view_count ?? 0), Number(poi.completion_count ?? 0)),
        createdAt: poi.created_at,
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
    const validPoints = routePoints.filter(p => isValidCoord(p.location.lat, p.location.lng));
    if (validPoints.length >= 2) {
      polyline = validPoints.map(p => ({ lat: p.location.lat, lng: p.location.lng }));
    }
  }

  // If only 1 point or 0 points, polyline stays empty — no line will be drawn
  if (polyline.length < 2) {
    polyline = [];
  }

  // Calculate center: prefer DB center_lat/center_lng, then polyline, then POI points
  let center = { lat: 43.36, lng: -5.85 }; // Default: Asturias center
  let hasValidCenter = false;
  const dbCenterLat = Number(route.center_lat);
  const dbCenterLng = Number(route.center_lng);
  if (isValidCoord(dbCenterLat, dbCenterLng)) {
    center = { lat: dbCenterLat, lng: dbCenterLng };
    hasValidCenter = true;
  } else {
    const allCoords = polyline.length > 0 ? polyline : routePoints.map(p => p.location);
    const coordsForCenter = allCoords.filter(p => isValidCoord(p.lat, p.lng));
    if (coordsForCenter.length > 0) {
      const sumLat = coordsForCenter.reduce((s, p) => s + p.lat, 0);
      const sumLng = coordsForCenter.reduce((s, p) => s + p.lng, 0);
      center = { lat: sumLat / coordsForCenter.length, lng: sumLng / coordsForCenter.length };
      hasValidCenter = true;
    }
  }

  return {
    id: route.route_code || route.id,
    slug: route.slug || route.route_code || route.id, // DB slug from Directus
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
    hasValidCenter,
    maxPoints: points.length,
    points: routePoints,
    tour360: typeof route.tour_360_id === 'object' && route.tour_360_id ? { available: true } : undefined,
    polyline,
    distanceKm: route.distance_km,
    elevationGainMeters: route.elevation_gain_meters,
    surfaceType: route.surface_type,
    gpxFile: route.gpx_file || undefined,
    viewCount: Math.max(Number(route.view_count ?? 0), Number((route as any).completion_count ?? 0)),
    createdAt: (route as any).created_at,
    itineraryDays: route.itinerary_days || undefined,
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

    try {
      const directusRoutes = await getRoutes(language);

      // Points are now loaded with deep relations, no need for separate requests
      const immersiveRoutes: ImmersiveRoute[] = directusRoutes.map((route: any) => {
        // Points are already included in the route data
        const points = route.points || [];
        return directusRouteToImmersive(route, points);
      });

      setRoutes(immersiveRoutes);
    } catch (err: any) {
      logger.error('[useImmersiveRoutes] Failed to load routes:', err);
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
