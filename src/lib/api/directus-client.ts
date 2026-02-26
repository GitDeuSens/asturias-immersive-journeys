// ============ DIRECTUS API CLIENT ============
import { createDirectus, rest, staticToken, readItems, readItem, createItem } from '@directus/sdk';
import type { KuulaTour, ARScene, Museum, SearchResults, VRExperience, Language } from '@/lib/types';
import type { DirectusSchema, DirectusMuseum, DirectusTour360, DirectusARScene, DirectusRoute, DirectusPOI, DirectusVRExperience } from '@/lib/directus-types';
import { toMultilingual } from '@/lib/directus-types';
import { logger } from "@/lib/logger";
import { API_CONFIG } from "@/constants/api";

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

const directusClient = DIRECTUS_TOKEN
  ? createDirectus<DirectusSchema>(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus<DirectusSchema>(DIRECTUS_URL).with(rest());

const TRANSLATIONS_DEEP: any[] = ['translations.*'];

function getDirectusFileUrl(fileId: string | undefined): string {
  if (!fileId) return '';
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

function stripHtmlAndDecode(text: string): string {
  if (!text) return text;
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
}

// ============ TRANSFORM FUNCTIONS ============

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
    image_url: getDirectusFileUrl(museum.cover_image),
    gallery_urls: (museum as any).gallery?.map((g: any) => getDirectusFileUrl(g.directus_files_id)) || [],
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
  const embedUrl = tour.build_path || '';
  const buildZipUrl = (tour as any).build_zip ? getDirectusFileUrl((tour as any).build_zip) : '';
  return {
    id: tour.id,
    slug: (tour as any).slug,
    title: toMultilingual(tour.translations, 'title'),
    description: toMultilingual(tour.translations, 'description'),
    kuula_embed_url: embedUrl,
    build_zip_url: buildZipUrl,
    museum_id: tour.museum_id,
    thumbnail_url: getDirectusFileUrl(tour.thumbnail),
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

    // Dynamic mode — GLB from Directus
    scene_mode: scene.scene_mode ?? 'build',
    glb_model: scene.glb_model ?? undefined,
    glb_scale: scene.glb_scale ?? 1,
    glb_rotation_y: scene.glb_rotation_y ?? 0,

    // Media
    preview_image: getDirectusFileUrl(scene.preview_image),
    preview_video: scene.preview_video
      ? getDirectusFileUrl(scene.preview_video)
      : undefined,
    tracking_image_url: scene.tracking_marker
      ? getDirectusFileUrl(scene.tracking_marker)
      : undefined,
    tracking_image_physical_size: scene.marker_size_cm ?? undefined,

    // Settings
    difficulty: scene.difficulty,
    duration_minutes: scene.duration_minutes,
    requires_outdoors: scene.requires_outdoors,

    // Geo
    location: scene.location_lat && scene.location_lng
      ? {
          lat: scene.location_lat,
          lng: scene.location_lng,
          radius_meters: scene.location_radius_meters || 50,
        }
      : undefined,

    published: scene.status === 'published',
  };
}

function transformVRExperience(vr: DirectusVRExperience): VRExperience {
  return {
    id: vr.id,
    title: toMultilingual(vr.translations, 'title'),
    description: toMultilingual(vr.translations, 'description'),
    thumbnail_url: getDirectusFileUrl(vr.thumbnail),
    apk_url: getDirectusFileUrl(vr.apk_file),
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
    cover_image_url: getDirectusFileUrl(route.cover_image),
    category_ids: extractCategoryIds((route as any).categories),
  };
}

function transformPOI(poi: DirectusPOI) {
  let richText = poi.rich_text;
  if (richText && richText.blocks) {
    richText = {
      ...richText,
      blocks: richText.blocks.map(block => {
        const decodedBlock = { ...block };
        if (decodedBlock.text && typeof decodedBlock.text === 'object') {
          decodedBlock.text = Object.fromEntries(
            Object.entries(decodedBlock.text).map(([lang, value]) => [lang, stripHtmlAndDecode(value as string)])
          );
        }
        if (decodedBlock.items && Array.isArray(decodedBlock.items)) {
          decodedBlock.items = decodedBlock.items.map(item => {
            if (typeof item === 'object') {
              return Object.fromEntries(
                Object.entries(item).map(([lang, value]) => [lang, stripHtmlAndDecode(value as string)])
              );
            }
            return item;
          });
        }
        if (decodedBlock.author && typeof decodedBlock.author === 'object') {
          decodedBlock.author = Object.fromEntries(
            Object.entries(decodedBlock.author).map(([lang, value]) => [lang, stripHtmlAndDecode(value as string)])
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
    cover_image_url: getDirectusFileUrl(poi.cover_image),
    category_ids: extractCategoryIds((poi as any).categories),
  };
}

// ============ API CLIENT CLASS ============

class DirectusApiClient {
  private getClient() { return directusClient; }

  async getTours360(_locale: Language = 'es', page = 1, limit = 20): Promise<KuulaTour[]> {
    try {
      const tours = await this.getClient().request(readItems('tours_360', {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } },
        fields: ['*', ...TRANSLATIONS_DEEP],
        limit, offset: (page - 1) * limit, sort: ['-created_at'],
      }));
      return (tours as unknown as DirectusTour360[]).map(transformTour360);
    } catch (error) { logger.error('[DirectusClient] Error fetching tours 360:', error); return []; }
  }

  async getTour360ById(id: string, _locale: Language = 'es'): Promise<KuulaTour | null> {
    try {
      const tour = await this.getClient().request(readItem('tours_360', id, { fields: ['*', ...TRANSLATIONS_DEEP] }));
      return transformTour360(tour as unknown as DirectusTour360);
    } catch (error) { logger.error(`[DirectusClient] Error fetching tour 360 ${id}:`, error); return null; }
  }

  async getARScenes(_locale: Language = 'es', page = 1, limit = 20): Promise<ARScene[]> {
    try {
      const scenes = await this.getClient().request(readItems('ar_scenes', {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } },
        fields: ['*', ...TRANSLATIONS_DEEP],
        limit, offset: (page - 1) * limit, sort: ['-created_at'],
      }));
      return (scenes as unknown as DirectusARScene[]).map(transformARScene);
    } catch (error) { logger.error('[DirectusClient] Error fetching AR scenes:', error); return []; }
  }

  async getARSceneBySlug(slug: string, _locale: Language = 'es'): Promise<ARScene | null> {
    try {
      const scenes = await this.getClient().request(readItems('ar_scenes', {
        filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP],
        limit: 1,
      }));
      if ((scenes as any[]).length === 0) return null;
      return transformARScene((scenes as unknown as DirectusARScene[])[0]);
    } catch (error) { logger.error(`[DirectusClient] Error fetching AR scene ${slug}:`, error); return null; }
  }

  async getARScenesByPOI(poiId: string, _locale: Language = 'es'): Promise<ARScene[]> {
    try {
      const pois = await this.getClient().request(readItems('pois', {
        filter: { id: { _eq: poiId }, status: { _in: ['published', 'draft'] } },
        fields: ['ar_scene_id'],
      }));
      const poi = (pois as any[])[0];
      if (!poi?.ar_scene_id) return [];
      const scenes = await this.getClient().request(readItems('ar_scenes', {
        filter: { id: { _eq: poi.ar_scene_id }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP],
      }));
      return (scenes as unknown as DirectusARScene[]).map(transformARScene);
    } catch (error) { logger.error(`[DirectusClient] Error fetching AR scenes for POI ${poiId}:`, error); return []; }
  }

  async getARScenesByRoute(routeId: string, _locale: Language = 'es'): Promise<ARScene[]> {
    try {
      const pois = await this.getClient().request(readItems('pois', {
        filter: { route_id: { _eq: routeId }, status: { _in: ['published', 'draft'] } },
        fields: ['ar_scene_id'],
      }));
      const sceneIds = (pois as any[]).map(p => p.ar_scene_id).filter(Boolean) as string[];
      if (sceneIds.length === 0) return [];
      const scenes = await this.getClient().request(readItems('ar_scenes', {
        filter: { id: { _in: sceneIds }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP],
      }));
      return (scenes as unknown as DirectusARScene[]).map(transformARScene);
    } catch (error) { logger.error(`[DirectusClient] Error fetching AR scenes for route ${routeId}:`, error); return []; }
  }

  async getRoutes(_locale: Language = 'es') {
    try {
      // Step 1: fetch all routes without deep point relations (avoids query complexity limit)
      const routes = await this.getClient().request(readItems('routes' as any, {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } } as any,
        fields: ['*', 'translations.*', 'categories.categories_id.*', 'categories.categories_id.translations.*'] as any,
        limit: -1,
      }));
      const routeList = routes as unknown as DirectusRoute[];

      // Step 2: fetch all points in one separate query (avoids deep-relation complexity limit)
      const allPoints = await this.getClient().request(readItems('pois' as any, {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } } as any,
        fields: ['*', 'translations.*', 'ar_scene_id.slug', 'ar_scene_id.build_path', 'ar_scene_id.translations.*', 'ar_scene_id.scene_mode', 'ar_scene_id.glb_model', 'ar_scene_id.glb_scale', 'ar_scene_id.glb_rotation_y', 'tour_360_id.slug', 'tour_360_id.build_path', 'tour_360_id.translations.*', 'gallery.*'] as any,
        sort: ['order'] as any,
        limit: -1,
      })).catch(() => []);

      // Attach points to their routes
      const pointsByRoute = new Map<string, any[]>();
      for (const pt of allPoints as any[]) {
        const rid = pt.route_id;
        if (!rid) continue;
        if (!pointsByRoute.has(rid)) pointsByRoute.set(rid, []);
        pointsByRoute.get(rid)!.push(pt);
      }
      for (const route of routeList) {
        (route as any).points = pointsByRoute.get(route.id) ?? (route as any).points ?? [];
      }

      return routeList.map(transformRoute);
    } catch (error) { logger.error('[DirectusClient] Error fetching routes:', error); return []; }
  }

  async getRouteBySlug(slug: string, _locale: Language = 'es') {
    try {
      const routes = await this.getClient().request(readItems('routes', {
        filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*', 'points.*', 'points.translations.*', 'points.ar_scene_id.*', 'points.ar_scene_id.translations.*', 'points.tour_360_id.*', 'points.tour_360_id.translations.*', 'points.gallery.*'] as any,
        limit: 1,
      }));
      if ((routes as any[]).length === 0) return null;
      return transformRoute((routes as unknown as DirectusRoute[])[0]);
    } catch (error) { logger.error(`[DirectusClient] Error fetching route ${slug}:`, error); return null; }
  }

  async getRouteByCode(code: string, _locale: Language = 'es') {
    try {
      const routes = await this.getClient().request(readItems('routes', {
        filter: { route_code: { _eq: code }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*', 'points.*', 'points.translations.*', 'points.ar_scene_id.*', 'points.ar_scene_id.translations.*', 'points.tour_360_id.*', 'points.tour_360_id.translations.*', 'points.gallery.*'] as any,
        limit: 1,
      }));
      if ((routes as any[]).length === 0) return null;
      return transformRoute((routes as unknown as DirectusRoute[])[0]);
    } catch (error) { logger.error(`[DirectusClient] Error fetching route ${code}:`, error); return null; }
  }

  async getMuseums(_locale: Language = 'es'): Promise<Museum[]> {
    try {
      const museums = await this.getClient().request(readItems('museums', {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } },
        fields: ['*', ...TRANSLATIONS_DEEP, 'gallery.directus_files_id'],
      }));
      return (museums as unknown as DirectusMuseum[]).map(transformMuseum);
    } catch (error) { logger.error('[DirectusClient] Error fetching museums:', error); return []; }
  }

  async getMuseumById(id: string, _locale: Language = 'es'): Promise<Museum | null> {
    try {
      const museum = await this.getClient().request(readItem('museums', id, { fields: ['*', ...TRANSLATIONS_DEEP, 'gallery.directus_files_id'] }));
      return transformMuseum(museum as unknown as DirectusMuseum);
    } catch (error) { logger.error(`[DirectusClient] Error fetching museum ${id}:`, error); return null; }
  }

  async getMuseumBySlug(slug: string, _locale: Language = 'es'): Promise<Museum | null> {
    try {
      const museums = await this.getClient().request(readItems('museums', {
        filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP, 'gallery.directus_files_id'],
        limit: 1,
      }));
      if ((museums as any[]).length === 0) return null;
      return transformMuseum((museums as unknown as DirectusMuseum[])[0]);
    } catch (error) { logger.error(`[DirectusClient] Error fetching museum ${slug}:`, error); return null; }
  }

  async getVRExperiences(_locale: Language = 'es', page = 1, limit = 20): Promise<VRExperience[]> {
    try {
      const experiences = await this.getClient().request(readItems('vr_experiences', {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } },
        fields: ['*', ...TRANSLATIONS_DEEP],
        limit, offset: (page - 1) * limit, sort: ['-created_at'],
      }));
      return (experiences as unknown as DirectusVRExperience[]).map(transformVRExperience);
    } catch (error) { logger.error('[DirectusClient] Error fetching VR experiences:', error); return []; }
  }

  async getPOIs(_locale: Language = 'es') {
    try {
      const pois = await this.getClient().request(readItems('pois', {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } },
        fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.slug', 'ar_scene_id.*', 'ar_scene_id.translations.*', 'tour_360_id.*', 'tour_360_id.translations.*', 'gallery.*'] as any,
        sort: ['order'] as any,
      }));
      return (pois as unknown as DirectusPOI[]).map(transformPOI);
    } catch (error) { logger.error('[DirectusClient] Error fetching POIs:', error); return []; }
  }

  async getPOIById(id: string, _locale: Language = 'es') {
    try {
      const poi = await this.getClient().request(readItem('pois', id, { fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*', 'ar_scene_id.*', 'ar_scene_id.translations.*', 'tour_360_id.*', 'tour_360_id.translations.*', 'gallery.*'] as any }));
      return transformPOI(poi as unknown as DirectusPOI);
    } catch (error) { logger.error(`[DirectusClient] Error fetching POI ${id}:`, error); return null; }
  }

  async getPOIBySlug(slug: string, _locale: Language = 'es') {
    try {
      const pois = await this.getClient().request(readItems('pois', {
        filter: { slug: { _eq: slug }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP, 'categories.categories_id.*', 'categories.categories_id.translations.*', 'ar_scene_id.*', 'ar_scene_id.translations.*', 'tour_360_id.*', 'tour_360_id.translations.*', 'gallery.*'] as any,
        limit: 1,
      }));
      if ((pois as any[]).length === 0) return null;
      return transformPOI((pois as unknown as DirectusPOI[])[0]);
    } catch (error) { logger.error(`[DirectusClient] Error fetching POI ${slug}:`, error); return null; }
  }

  async getRoutePoints(routeId: string, _locale: Language = 'es') {
    try {
      const pois = await this.getClient().request(readItems('pois', {
        filter: { route_id: { _eq: routeId }, status: { _in: ['published', 'draft'] } },
        fields: ['*', ...TRANSLATIONS_DEEP, 'ar_scene_id.slug', 'ar_scene_id.build_path', 'ar_scene_id.translations.*', 'ar_scene_id.scene_mode', 'ar_scene_id.glb_model', 'ar_scene_id.glb_scale', 'ar_scene_id.glb_rotation_y', 'tour_360_id.slug', 'tour_360_id.build_path', 'tour_360_id.translations.*'],
        sort: ['order'],
      }));
      return (pois as unknown as DirectusPOI[]).map(transformPOI);
    } catch (error) { logger.error(`[DirectusClient] Error fetching route points for ${routeId}:`, error); return []; }
  }

  async getCategories(_locale: Language = 'es') {
    try {
      const cats = await this.getClient().request(readItems('categories', {
        filter: { status: { _in: API_CONFIG.getStatusFilter() } },
        fields: ['*', ...TRANSLATIONS_DEEP],
        sort: ['order'],
      }));
      return (cats as any[]).map(c => ({
        ...c,
        name: toMultilingual(c.translations, 'name'),
        description: toMultilingual(c.translations, 'description'),
      }));
    } catch (error) { logger.error('[DirectusClient] Error fetching categories:', error); return []; }
  }

  async search(query: string, locale: Language = 'es'): Promise<SearchResults> {
    try {
      const lowerQuery = query.toLowerCase();
      const [museums, routes, arScenes, pois] = await Promise.all([
        this.getMuseums(locale), this.getRoutes(locale),
        this.getARScenes(locale), this.getPOIs(locale),
      ]);
      return {
        museums: museums.filter(m => m.name[locale]?.toLowerCase().includes(lowerQuery) || m.description[locale]?.toLowerCase().includes(lowerQuery)),
        routes: routes.filter((r: any) => r.title[locale]?.toLowerCase().includes(lowerQuery) || r.short_description?.[locale]?.toLowerCase().includes(lowerQuery)),
        pois: pois.filter((p: any) => p.title[locale]?.toLowerCase().includes(lowerQuery) || p.short_description?.[locale]?.toLowerCase().includes(lowerQuery)),
        ar_scenes: arScenes.filter(s => s.title[locale]?.toLowerCase().includes(lowerQuery) || s.description[locale]?.toLowerCase().includes(lowerQuery)),
        total: 0,
      };
    } catch (error) { logger.error('[DirectusClient] Error searching:', error); return { museums: [], routes: [], pois: [], ar_scenes: [], total: 0 }; }
  }

  async trackAnalyticsEvent(eventData: {
    event_type: string; session_id?: string; device_type?: string; language?: string;
    resource_id?: string; resource_type?: string; duration_seconds?: number;
    completion_percentage?: number; municipality?: string; experience_type?: string;
    access_location?: string; page_url?: string; referrer?: string;
    screen_resolution?: string; browser?: string; os?: string;
    country?: string; is_returning?: boolean; extra_data?: Record<string, any>;
  }) {
    try {
      const id = crypto.randomUUID();
      await this.getClient().request(createItem('analytics_events' as any, { id, ...eventData, created_at: new Date().toISOString() }));
    } catch (error) { logger.warn('[DirectusClient] Analytics tracking failed:', error); }
  }

  async getAnalyticsEvents(filters?: { event_type?: string; resource_type?: string; since?: string; limit?: number }) {
    try {
      const filter: any = {};
      if (filters?.event_type) filter.event_type = { _eq: filters.event_type };
      if (filters?.resource_type) filter.resource_type = { _eq: filters.resource_type };
      if (filters?.since) filter.created_at = { _gte: filters.since };
      const events = await this.getClient().request(readItems('analytics_events' as any, { filter, sort: ['-created_at'] as any, limit: filters?.limit || 5000 }));
      return events as any[];
    } catch (error) { logger.error('[DirectusClient] Error fetching analytics:', error); return []; }
  }
}

export const directus = new DirectusApiClient();

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
export const trackAnalyticsEvent = (eventData: any) => directus.trackAnalyticsEvent(eventData);