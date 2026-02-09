// ============ DIRECTUS API CLIENT ============
// Centralized client for Directus CMS integration
// Uses translations system — all queries include deep translations

import { createDirectus, rest, staticToken, readItems, readItem, createItem } from '@directus/sdk';
import type { 
  KuulaTour, 
  ARScene, 
  Museum, 
  SearchResults,
  VRExperience,
  Language 
} from '@/lib/types';
import type {
  DirectusSchema,
  DirectusMuseum,
  DirectusTour360,
  DirectusARScene,
  DirectusRoute,
  DirectusPOI,
  DirectusVRExperience,
} from '@/lib/directus-types';
import { toMultilingual } from '@/lib/directus-types';

// Configuration
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

// Create Directus client instance (with optional static token for public access)
const directusClient = DIRECTUS_TOKEN
  ? createDirectus<DirectusSchema>(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus<DirectusSchema>(DIRECTUS_URL).with(rest());

// Fields pattern: always include translations
// Cast as any[] to satisfy Directus SDK strict field typing with deep relations
const TRANSLATIONS_DEEP: any[] = ['translations.*'];

// ============ UTILITY FUNCTIONS ============

function getFileUrl(fileId: string | undefined): string {
  if (!fileId) return '';
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

// Remove HTML tags and decode entities (e.g., <p>D&eacute;couvrez</p> → Découvrez)
function stripHtmlAndDecode(text: string): string {
  if (!text) return text;
  // Create a temporary div element to strip HTML and decode entities
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
}

// ============ DATA TRANSFORMATION FUNCTIONS ============

function transformMuseum(museum: DirectusMuseum): Museum {
  return {
    id: museum.id,
    slug: museum.slug,
    name: toMultilingual(museum.translations, 'name'),
    short_description: toMultilingual(museum.translations, 'short_description'),
    description: toMultilingual(museum.translations, 'description'),
    address: museum.address || '',
    lat: museum.lat,
    lng: museum.lng,
    image_url: getFileUrl(museum.cover_image),
    gallery_urls: (museum as any).gallery?.map((g: any) => getFileUrl(g.directus_files_id)) || [],
    website: museum.website,
    phone: museum.phone,
    email: museum.email,
    opening_hours: toMultilingual(museum.translations, 'opening_hours'),
    prices: toMultilingual(museum.translations, 'prices'),
    accessibility: toMultilingual(museum.translations, 'accessibility'),
    museum_type: museum.museum_type,
    municipality: museum.municipality,
    featured: museum.featured,
    published: museum.status === 'published',
  };
}

function transformTour360(tour: DirectusTour360): KuulaTour {
  // build_path = URL to deployed 3DVista dist (index.html)
  // build_zip = UUID of ZIP file in directus_files (backup/source)
  // If build_path is set, use it directly as iframe src
  // If only build_zip exists, construct Directus asset URL (ZIP download, not embeddable)
  const embedUrl = tour.build_path || '';
  const buildZipUrl = (tour as any).build_zip ? getFileUrl((tour as any).build_zip) : '';

  return {
    id: tour.id,
    slug: (tour as any).slug,
    title: toMultilingual(tour.translations, 'title'),
    description: toMultilingual(tour.translations, 'description'),
    kuula_embed_url: embedUrl,
    build_zip_url: buildZipUrl,
    museum_id: tour.museum_id,
    thumbnail_url: getFileUrl(tour.thumbnail),
    duration_minutes: tour.duration_minutes,
    total_panoramas: tour.total_panoramas || 0,
    published: tour.status === 'published',
  };
}

function transformARScene(scene: DirectusARScene): ARScene {
  return {
    id: scene.id,
    slug: scene.slug,
    title: toMultilingual(scene.translations, 'title'),
    description: toMultilingual(scene.translations, 'description'),
    needle_scene_url: scene.build_path || '',
    needle_type: scene.ar_type,
    build_path: scene.build_path || undefined,
    preview_image: getFileUrl(scene.preview_image),
    difficulty: scene.difficulty,
    duration_minutes: scene.duration_minutes,
    requires_outdoors: scene.requires_outdoors,
    location: scene.location_lat && scene.location_lng ? {
      lat: scene.location_lat,
      lng: scene.location_lng,
      radius_meters: scene.location_radius_meters || 50,
    } : undefined,
    published: scene.status === 'published',
  };
}

function transformVRExperience(vr: DirectusVRExperience): VRExperience {
  return {
    id: vr.id,
    title: toMultilingual(vr.translations, 'title'),
    description: toMultilingual(vr.translations, 'description'),
    thumbnail_url: getFileUrl(vr.thumbnail),
    apk_url: getFileUrl(vr.apk_file),
    duration_minutes: vr.duration_minutes,
    category: vr.category || '',
    published: vr.status === 'published',
  };
}

function extractCategoryIds(categories: any): string[] {
  if (!categories || !Array.isArray(categories)) return [];
  return categories
    .map((c: any) => {
      if (typeof c === 'string') return c;
      const catObj = c.categories_id;
      if (!catObj) return null;
      if (typeof catObj === 'string') return catObj;
      return catObj.slug || catObj.id || null;
    })
    .filter(Boolean) as string[];
}

function transformRoute(route: DirectusRoute) {
  return {
    ...route,
    title: toMultilingual(route.translations, 'title'),
    short_description: toMultilingual(route.translations, 'short_description'),
    description: toMultilingual(route.translations, 'description'),
    theme: toMultilingual(route.translations, 'theme'),
    duration: toMultilingual(route.translations, 'duration'),
    cover_image_url: getFileUrl(route.cover_image),
    category_ids: extractCategoryIds((route as any).categories),
  };
}

function transformPOI(poi: DirectusPOI) {
  // Decode richText blocks if present
  let richText = poi.rich_text;
  if (richText && richText.blocks) {
    richText = {
      ...richText,
      blocks: richText.blocks.map(block => {
        const decodedBlock = { ...block };
        // Decode text fields in each block type
        if (decodedBlock.text && typeof decodedBlock.text === 'object') {
          decodedBlock.text = Object.fromEntries(
            Object.entries(decodedBlock.text).map(([lang, value]) => [
              lang,
              stripHtmlAndDecode(value as string)
            ])
          );
        }
        // Decode items in bullets
        if (decodedBlock.items && Array.isArray(decodedBlock.items)) {
          decodedBlock.items = decodedBlock.items.map(item => {
            if (typeof item === 'object') {
              return Object.fromEntries(
                Object.entries(item).map(([lang, value]) => [
                  lang,
                  stripHtmlAndDecode(value as string)
                ])
              );
            }
            return item;
          });
        }
        // Decode author in quotes
        if (decodedBlock.author && typeof decodedBlock.author === 'object') {
          decodedBlock.author = Object.fromEntries(
            Object.entries(decodedBlock.author).map(([lang, value]) => [
              lang,
              stripHtmlAndDecode(value as string)
            ])
          );
        }
        return decodedBlock;
      })
    };
  }

  return {
    ...poi,
    title: toMultilingual(poi.translations, 'title'),
    short_description: toMultilingual(poi.translations, 'short_description'),
    description: toMultilingual(poi.translations, 'description'),
    how_to_get: toMultilingual(poi.translations, 'how_to_get'),
    accessibility: toMultilingual(poi.translations, 'accessibility'),
    parking: toMultilingual(poi.translations, 'parking'),
    opening_hours: toMultilingual(poi.translations, 'opening_hours'),
    prices: toMultilingual(poi.translations, 'prices'),
    recommended_duration: toMultilingual(poi.translations, 'recommended_duration'),
    richText,
    cover_image_url: getFileUrl(poi.cover_image),
    category_ids: extractCategoryIds((poi as any).categories),
  };
}

// ============ DIRECTUS CLIENT CLASS ============

class DirectusApiClient {
  private getClient() {
    return directusClient;
  }

  // ============ TOURS 360 ============

  async getTours360(_locale: Language = 'es'): Promise<KuulaTour[]> {
    try {
      const tours = await this.getClient().request(
        readItems('tours_360', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
        })
      );
      return (tours as unknown as DirectusTour360[]).map(transformTour360);
    } catch (error) {
      console.error('[DirectusClient] Error fetching tours 360:', error);
      return [];
    }
  }

  async getTour360ById(id: string, _locale: Language = 'es'): Promise<KuulaTour | null> {
    try {
      const tour = await this.getClient().request(
        readItem('tours_360', id, {
          fields: ['*', ...TRANSLATIONS_DEEP],
        })
      );
      return transformTour360(tour as unknown as DirectusTour360);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching tour 360 ${id}:`, error);
      return null;
    }
  }

  // ============ AR SCENES ============

  async getARScenes(_locale: Language = 'es'): Promise<ARScene[]> {
    try {
      const scenes = await this.getClient().request(
        readItems('ar_scenes', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
        })
      );
      return (scenes as unknown as DirectusARScene[]).map(transformARScene);
    } catch (error) {
      console.error('[DirectusClient] Error fetching AR scenes:', error);
      return [];
    }
  }

  async getARSceneBySlug(slug: string, _locale: Language = 'es'): Promise<ARScene | null> {
    try {
      const scenes = await this.getClient().request(
        readItems('ar_scenes', {
          filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
          limit: 1,
        })
      );
      if ((scenes as any[]).length === 0) return null;
      return transformARScene((scenes as unknown as DirectusARScene[])[0]);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching AR scene ${slug}:`, error);
      return null;
    }
  }

  async getARScenesByPOI(poiId: string, _locale: Language = 'es'): Promise<ARScene[]> {
    try {
      const pois = await this.getClient().request(
        readItems('pois', {
          filter: { id: { _eq: poiId }, status: { _in: ['published', 'draft'] } },
          fields: ['ar_scene_id'],
        })
      );
      const poi = (pois as any[])[0];
      if (!poi?.ar_scene_id) return [];

      const scenes = await this.getClient().request(
        readItems('ar_scenes', {
          filter: { id: { _eq: poi.ar_scene_id }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
        })
      );
      return (scenes as unknown as DirectusARScene[]).map(transformARScene);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching AR scenes for POI ${poiId}:`, error);
      return [];
    }
  }

  async getARScenesByRoute(routeId: string, _locale: Language = 'es'): Promise<ARScene[]> {
    try {
      const pois = await this.getClient().request(
        readItems('pois', {
          filter: { route_id: { _eq: routeId }, status: { _in: ['published', 'draft'] } },
          fields: ['ar_scene_id'],
        })
      );
      const sceneIds = (pois as any[]).map(p => p.ar_scene_id).filter(Boolean) as string[];
      if (sceneIds.length === 0) return [];

      const scenes = await this.getClient().request(
        readItems('ar_scenes', {
          filter: { id: { _in: sceneIds }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
        })
      );
      return (scenes as unknown as DirectusARScene[]).map(transformARScene);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching AR scenes for route ${routeId}:`, error);
      return [];
    }
  }

  // ============ ROUTES ============

  async getRoutes(_locale: Language = 'es') {
    try {
      const routes = await this.getClient().request(
        readItems('routes', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.slug', 'categories.categories_id.translations.*'],
        })
      );
      return (routes as unknown as DirectusRoute[]).map(transformRoute);
    } catch (error) {
      console.error('[DirectusClient] Error fetching routes:', error);
      return [];
    }
  }

  async getRouteBySlug(slug: string, _locale: Language = 'es') {
    try {
      const routes = await this.getClient().request(
        readItems('routes', {
          filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*', 'points.*', 'points.translations.*'],
          limit: 1,
        })
      );
      if ((routes as any[]).length === 0) return null;
      return transformRoute((routes as unknown as DirectusRoute[])[0]);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching route ${slug}:`, error);
      return null;
    }
  }

  async getRouteByCode(code: string, _locale: Language = 'es') {
    try {
      const routes = await this.getClient().request(
        readItems('routes', {
          filter: { route_code: { _eq: code }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*', 'points.*', 'points.translations.*'],
          limit: 1,
        })
      );
      if ((routes as any[]).length === 0) return null;
      return transformRoute((routes as unknown as DirectusRoute[])[0]);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching route ${code}:`, error);
      return null;
    }
  }

  // ============ MUSEUMS ============

  async getMuseums(_locale: Language = 'es'): Promise<Museum[]> {
    try {
      const museums = await this.getClient().request(
        readItems('museums', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP, 'gallery.directus_files_id'],
        })
      );
      return (museums as unknown as DirectusMuseum[]).map(transformMuseum);
    } catch (error) {
      console.error('[DirectusClient] Error fetching museums:', error);
      return [];
    }
  }

  async getMuseumById(id: string, _locale: Language = 'es'): Promise<Museum | null> {
    try {
      const museum = await this.getClient().request(
        readItem('museums', id, {
          fields: ['*', ...TRANSLATIONS_DEEP, 'gallery.directus_files_id'],
        })
      );
      return transformMuseum(museum as unknown as DirectusMuseum);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching museum ${id}:`, error);
      return null;
    }
  }

  async getMuseumBySlug(slug: string, _locale: Language = 'es'): Promise<Museum | null> {
    try {
      const museums = await this.getClient().request(
        readItems('museums', {
          filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP, 'gallery.directus_files_id'],
          limit: 1,
        })
      );
      if ((museums as any[]).length === 0) return null;
      return transformMuseum((museums as unknown as DirectusMuseum[])[0]);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching museum ${slug}:`, error);
      return null;
    }
  }

  // ============ VR EXPERIENCES ============

  async getVRExperiences(_locale: Language = 'es'): Promise<VRExperience[]> {
    try {
      const experiences = await this.getClient().request(
        readItems('vr_experiences', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
        })
      );
      return (experiences as unknown as DirectusVRExperience[]).map(transformVRExperience);
    } catch (error) {
      console.error('[DirectusClient] Error fetching VR experiences:', error);
      return [];
    }
  }

  // ============ POIs ============

  async getPOIs(_locale: Language = 'es') {
    try {
      const pois = await this.getClient().request(
        readItems('pois', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.slug'],
        })
      );
      return (pois as unknown as DirectusPOI[]).map(transformPOI);
    } catch (error) {
      console.error('[DirectusClient] Error fetching POIs:', error);
      return [];
    }
  }

  async getPOIById(id: string, _locale: Language = 'es') {
    try {
      const poi = await this.getClient().request(
        readItem('pois', id, {
          fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*'],
        })
      );
      return transformPOI(poi as unknown as DirectusPOI);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching POI ${id}:`, error);
      return null;
    }
  }

  async getPOIBySlug(slug: string, _locale: Language = 'es') {
    try {
      const pois = await this.getClient().request(
        readItems('pois', {
          filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*'],
          limit: 1,
        })
      );
      if ((pois as any[]).length === 0) return null;
      return transformPOI((pois as unknown as DirectusPOI[])[0]);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching POI ${slug}:`, error);
      return null;
    }
  }

  // ============ ROUTE POINTS (POIs of a route, ordered) ============

  async getRoutePoints(routeId: string, _locale: Language = 'es') {
    try {
      const pois = await this.getClient().request(
        readItems('pois', {
          filter: { route_id: { _eq: routeId }, status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
          sort: ['order'],
        })
      );
      return (pois as unknown as DirectusPOI[]).map(transformPOI);
    } catch (error) {
      console.error(`[DirectusClient] Error fetching route points for ${routeId}:`, error);
      return [];
    }
  }

  // ============ CATEGORIES ============

  async getCategories(_locale: Language = 'es') {
    try {
      const cats = await this.getClient().request(
        readItems('categories', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: ['*', ...TRANSLATIONS_DEEP],
          sort: ['order'],
        })
      );
      return (cats as any[]).map(c => ({
        ...c,
        name: toMultilingual(c.translations, 'name'),
        description: toMultilingual(c.translations, 'description'),
      }));
    } catch (error) {
      console.error('[DirectusClient] Error fetching categories:', error);
      return [];
    }
  }

  // ============ SEARCH ============

  async search(query: string, locale: Language = 'es'): Promise<SearchResults> {
    try {
      const lowerQuery = query.toLowerCase();

      const [museums, routes, arScenes, pois] = await Promise.all([
        this.getMuseums(locale),
        this.getRoutes(locale),
        this.getARScenes(locale),
        this.getPOIs(locale),
      ]);

      const filteredMuseums = museums.filter(m =>
        m.name[locale]?.toLowerCase().includes(lowerQuery) ||
        m.description[locale]?.toLowerCase().includes(lowerQuery)
      );

      const filteredRoutes = routes.filter((r: any) =>
        r.title[locale]?.toLowerCase().includes(lowerQuery) ||
        r.short_description?.[locale]?.toLowerCase().includes(lowerQuery)
      );

      const filteredARScenes = arScenes.filter(s =>
        s.title[locale]?.toLowerCase().includes(lowerQuery) ||
        s.description[locale]?.toLowerCase().includes(lowerQuery)
      );

      const filteredPOIs = pois.filter((p: any) =>
        p.title[locale]?.toLowerCase().includes(lowerQuery) ||
        p.short_description?.[locale]?.toLowerCase().includes(lowerQuery)
      );

      return {
        museums: filteredMuseums,
        routes: filteredRoutes,
        pois: filteredPOIs,
        ar_scenes: filteredARScenes,
        total: filteredMuseums.length + filteredRoutes.length + filteredARScenes.length + filteredPOIs.length,
      };
    } catch (error) {
      console.error('[DirectusClient] Error searching:', error);
      return { museums: [], routes: [], pois: [], ar_scenes: [], total: 0 };
    }
  }

  // ============ ANALYTICS ============

  async trackEvent(eventData: {
    event_type: string;
    session_id?: string;
    device_type?: string;
    language?: string;
    resource_id?: string;
    resource_type?: string;
    duration_seconds?: number;
    completion_percentage?: number;
    municipality?: string;
    extra_data?: Record<string, any>;
  }) {
    try {
      const id = crypto.randomUUID();
      await this.getClient().request(
        createItem('analytics_events' as any, {
          id,
          ...eventData,
          created_at: new Date().toISOString(),
        })
      );
    } catch (error) {
      // Silently fail analytics - don't break user experience
      console.warn('[DirectusClient] Analytics tracking failed:', error);
    }
  }

  async getAnalyticsEvents(filters?: {
    event_type?: string;
    resource_type?: string;
    since?: string;
    limit?: number;
  }) {
    try {
      // Use direct fetch instead of SDK for reliability
      const params = new URLSearchParams();
      params.set('limit', String(filters?.limit || 1000));
      params.set('sort', '-created_at');
      if (filters?.event_type) params.set('filter[event_type][_eq]', filters.event_type);
      if (filters?.resource_type) params.set('filter[resource_type][_eq]', filters.resource_type);
      if (filters?.since) params.set('filter[created_at][_gte]', filters.since);

      const url = `${DIRECTUS_URL}/items/analytics_events?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return (json.data || []) as any[];
    } catch (error) {
      console.error('[DirectusClient] Error fetching analytics:', error);
      return [];
    }
  }
}

// ============ SINGLETON INSTANCE ============

export const directus = new DirectusApiClient();

// ============ CONVENIENCE FUNCTIONS ============

export const getVirtualTours = (locale?: Language) => directus.getTours360(locale);
export const getVirtualTourById = (id: string, locale?: Language) => directus.getTour360ById(id, locale);
export const getARScenes = (locale?: Language) => directus.getARScenes(locale);
export const getARSceneBySlug = (slug: string, locale?: Language) => directus.getARSceneBySlug(slug, locale);
export const getARScenesByPOI = (poiId: string, locale?: Language) => directus.getARScenesByPOI(poiId, locale);
export const getARScenesByRoute = (routeId: string, locale?: Language) => directus.getARScenesByRoute(routeId, locale);
export const getRoutes = (locale?: Language) => directus.getRoutes(locale);
export const getRouteBySlug = (slug: string, locale?: Language) => directus.getRouteBySlug(slug, locale);
export const getRouteByCode = (code: string, locale?: Language) => directus.getRouteByCode(code, locale);
export const getRoutePoints = (routeId: string, locale?: Language) => directus.getRoutePoints(routeId, locale);
export const getMuseums = (locale?: Language) => directus.getMuseums(locale);
export const getMuseumById = (id: string, locale?: Language) => directus.getMuseumById(id, locale);
export const getMuseumBySlug = (slug: string, locale?: Language) => directus.getMuseumBySlug(slug, locale);
export const getPOIs = (locale?: Language) => directus.getPOIs(locale);
export const getPOIById = (id: string, locale?: Language) => directus.getPOIById(id, locale);
export const getPOIBySlug = (slug: string, locale?: Language) => directus.getPOIBySlug(slug, locale);
export const getVRExperiences = (locale?: Language) => directus.getVRExperiences(locale);
export const getCategories = (locale?: Language) => directus.getCategories(locale);
export const searchContent = (query: string, locale?: Language) => directus.search(query, locale);
export const trackEvent = (eventData: any) => directus.trackEvent(eventData);
