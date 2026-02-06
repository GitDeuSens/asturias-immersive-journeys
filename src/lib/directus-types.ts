// ============ DIRECTUS SCHEMA TYPES ============
// TypeScript types matching the Directus database schema
// Generated based on recreate-schema.js — translations + M2M

export type Language = 'es' | 'en' | 'fr';

// ============ TRANSLATION ROW ============
// Each *_translations junction row has languages_code + translated fields

export interface TranslationRow {
  languages_code: Language;
}

// ============ LANGUAGES ============
export interface DirectusLanguage {
  code: Language;
  name: string;
  direction: 'ltr' | 'rtl';
}

// ============ CATEGORIES ============
export interface DirectusCategoryTranslation extends TranslationRow {
  name: string;
  description?: string;
}

export interface DirectusCategory {
  id: string;
  slug: string;
  icon?: string;
  color?: string;
  parent_id?: string | null;
  order: number;
  translations: DirectusCategoryTranslation[];
  children?: DirectusCategory[];
  status: 'draft' | 'published' | 'archived';
}

// ============ MUSEUMS ============
export interface DirectusMuseumTranslation extends TranslationRow {
  name: string;
  short_description?: string;
  description?: string;
  opening_hours?: string;
  prices?: string;
  accessibility?: string;
}

export interface DirectusMuseum {
  id: string;
  slug: string;
  museum_code?: string;
  address?: string;
  municipality: string;
  postal_code?: string;
  lat: number;
  lng: number;
  cover_image?: string;
  website?: string;
  phone?: string;
  email?: string;
  museum_type?: 'industrial' | 'mining' | 'railway' | 'ethnographic' | 'art' | 'science';
  featured: boolean;
  annual_visitors?: number;
  view_count: number;
  translations: DirectusMuseumTranslation[];
  tours_360?: DirectusTour360[];
  pois?: DirectusPOI[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============ TOURS 360° ============
export interface DirectusTour360Translation extends TranslationRow {
  title: string;
  description?: string;
}

export interface DirectusTour360 {
  id: string;
  slug: string;
  build_zip?: string;
  build_path?: string;
  thumbnail?: string;
  preview_video?: string;
  museum_id?: string;
  total_panoramas?: number;
  duration_minutes?: number;
  has_audio: boolean;
  vr_compatible: boolean;
  view_count: number;
  average_duration_seconds?: number;
  translations: DirectusTour360Translation[];
  pois?: DirectusPOI[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============ AR SCENES ============
export interface DirectusARSceneTranslation extends TranslationRow {
  title: string;
  description?: string;
  instructions?: string;
}

export interface DirectusARScene {
  id: string;
  slug: string;
  build_zip?: string;
  build_path?: string;
  ar_type: 'slam' | 'image-tracking' | 'geo';
  difficulty: 'easy' | 'moderate' | 'advanced';
  location_lat?: number;
  location_lng?: number;
  location_radius_meters?: number;
  tracking_marker?: string;
  marker_size_cm?: number;
  preview_image?: string;
  preview_video?: string;
  duration_minutes: number;
  requires_outdoors: boolean;
  featured: boolean;
  launch_count: number;
  completion_count: number;
  translations: DirectusARSceneTranslation[];
  pois?: DirectusPOI[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============ VR EXPERIENCES ============
export interface DirectusVRExperienceTranslation extends TranslationRow {
  title: string;
  description?: string;
  short_description?: string;
}

export interface DirectusVRExperience {
  id: string;
  slug: string;
  category?: 'mine' | 'industry' | 'railway' | 'cave' | 'heritage' | 'nature';
  apk_file?: string;
  apk_version?: string;
  apk_size_mb?: number;
  thumbnail?: string;
  preview_video?: string;
  duration_minutes?: number;
  difficulty?: 'easy' | 'moderate';
  age_rating?: '7+' | '12+' | '16+';
  motion_sickness_warning: boolean;
  compatible_devices?: string[];
  download_count: number;
  translations: DirectusVRExperienceTranslation[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============ ROUTES ============
export interface DirectusRouteTranslation extends TranslationRow {
  title: string;
  short_description?: string;
  description?: string;
  theme?: string;
  duration?: string;
}

export interface DirectusRoute {
  id: string;
  route_code: string;
  slug: string;
  cover_image?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_circular: boolean;
  max_points?: number;
  distance_km?: number;
  elevation_gain_meters?: number;
  surface_type?: 'paved' | 'gravel' | 'dirt' | 'mixed';
  center_lat?: number;
  center_lng?: number;
  polyline?: { lat: number; lng: number }[];
  gpx_file?: string;
  featured: boolean;
  view_count: number;
  completion_count: number;
  translations: DirectusRouteTranslation[];
  categories?: DirectusCategory[];
  points?: DirectusPOI[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============ POIs ============
export interface DirectusPOITranslation extends TranslationRow {
  title: string;
  short_description?: string;
  description?: string;
  how_to_get?: string;
  accessibility?: string;
  parking?: string;
  opening_hours?: string;
  prices?: string;
  recommended_duration?: string;
}

export interface DirectusPOI {
  id: string;
  slug: string;
  experience_type: 'AR' | '360' | 'INFO' | 'VR';
  route_id?: string;
  order?: number;
  lat: number;
  lng: number;
  address?: string;
  cover_image?: string;
  audio_es?: string;
  audio_en?: string;
  audio_fr?: string;
  audio_duration_seconds?: number;
  video_url?: string;
  ar_scene_id?: string;
  tour_360_id?: string;
  museum_id?: string;
  rich_text?: { blocks: any[] };
  tags?: string[];
  phone?: string;
  email?: string;
  website?: string;
  share_url?: string;
  external_links?: { label: Record<string, string>; url: string }[];
  is_required: boolean;
  featured: boolean;
  view_count: number;
  translations: DirectusPOITranslation[];
  categories?: DirectusCategory[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============ ANALYTICS EVENTS ============
export interface DirectusAnalyticsEvent {
  id: string;
  event_type: string;
  resource_type?: string;
  resource_id?: string;
  session_id?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop' | 'vr';
  user_agent?: string;
  language?: Language;
  duration_seconds?: number;
  completion_percentage?: number;
  municipality?: string;
  extra_data?: Record<string, any>;
  created_at: string;
}

// ============ DIRECTUS FILE ============
export interface DirectusFile {
  id: string;
  storage: string;
  filename_disk: string;
  filename_download: string;
  title?: string;
  type: string;
  folder?: string;
  uploaded_by?: string;
  uploaded_on: string;
  modified_by?: string;
  modified_on: string;
  charset?: string;
  filesize: number;
  width?: number;
  height?: number;
  duration?: number;
  embed?: string;
  description?: string;
  location?: string;
  tags?: string[];
  metadata?: any;
}

// ============ DIRECTUS SCHEMA (for SDK) ============
export type DirectusSchema = {
  languages: DirectusLanguage[];
  categories: DirectusCategory[];
  museums: DirectusMuseum[];
  tours_360: DirectusTour360[];
  ar_scenes: DirectusARScene[];
  vr_experiences: DirectusVRExperience[];
  routes: DirectusRoute[];
  pois: DirectusPOI[];
  analytics_events: DirectusAnalyticsEvent[];
  directus_files: DirectusFile[];
};

// ============ HELPER: extract translation by locale ============
export function getTranslation<T extends TranslationRow>(
  translations: T[] | undefined,
  locale: Language,
  fallback: Language = 'es'
): T | undefined {
  if (!translations || translations.length === 0) return undefined;
  return translations.find(t => t.languages_code === locale)
    || translations.find(t => t.languages_code === fallback)
    || translations[0];
}

// ============ HELPER: build multilingual record from translations ============
export function toMultilingual(
  translations: TranslationRow[] | undefined,
  field: string
): Record<Language, string> {
  const result: Record<string, string> = { es: '', en: '', fr: '' };
  if (!translations) return result as Record<Language, string>;
  for (const t of translations) {
    result[t.languages_code] = (t as any)[field] || '';
  }
  return result as Record<Language, string>;
}
