// ============ DATA TYPES FOR DIRECTUS CMS INTEGRATION ============
// 🗄️ All these types are designed to map to Directus collections
// Current implementation uses mock data, ready for API swap

export type Language = 'es' | 'en' | 'fr';

// ============ KUULA TOUR / VIRTUAL TOUR ============

export interface KuulaTour {
  id: string;
  slug?: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  kuula_embed_url: string;
  build_zip_url?: string;
  museum_id?: string;
  thumbnail_url: string;
  duration_minutes?: number;
  total_panoramas: number;
  featured_hotspots?: {
    id: string;
    title: Record<Language, string>;
    type: 'info' | 'image' | 'video' | 'audio';
  }[];
  external_audioguides?: {
    es?: string;
    en?: string;
    fr?: string;
  };
  created_at?: string;
  updated_at?: string;
  published: boolean;
}

// ============ AR SCENE ============

export type ARType = 'slam' | 'image-tracking' | 'geo';
export type ARDifficulty = 'easy' | 'moderate' | 'advanced';

export interface ARScene {
  id: string;
  slug: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  
  // Needle Engine data
  needle_scene_url: string;
  needle_type: ARType;
  build_path?: string;
  
  // For image tracking
  tracking_image_url?: string;
  tracking_image_physical_size?: number; // cm
  
  // For geo AR
  location?: {
    lat: number;
    lng: number;
    radius_meters: number;
  };
  
  // Relations
  poi_id?: string;
  route_id?: string;
  
  // Media
  preview_image: string;
  preview_video?: string;
  instructions_image?: string;
  
  // Settings
  difficulty: ARDifficulty;
  duration_minutes: number;
  requires_outdoors: boolean;
  
  // Metadata
  created_at?: string;
  published: boolean;
}

// ============ AUDIO TRACK ============

export interface AudioTrack {
  language: Language;
  url: string;
  durationSec?: number;
  transcript?: string;
}

// ============ MUSEUM ============

export interface Museum {
  id: string;
  slug: string;
  name: Record<Language, string>;
  short_description?: Record<Language, string>;
  description: Record<Language, string>;
  address: string;
  lat: number;
  lng: number;
  image_url: string;
  gallery_urls?: string[];
  website?: string;
  phone?: string;
  email?: string;
  opening_hours?: Record<Language, string>;
  prices?: Record<Language, string>;
  accessibility?: Record<Language, string>;
  museum_type?: string;
  municipality: string;
  featured?: boolean;
  published: boolean;
}

// ============ SEARCH RESULTS ============

export interface SearchResults {
  museums: Museum[];
  routes: any[];
  pois: any[];
  ar_scenes: ARScene[];
  total: number;
}

// ============ VR EXPERIENCE ============

export interface VRExperience {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  thumbnail_url: string;
  apk_url?: string;
  web_url?: string;
  duration_minutes?: number;
  category: string;
  published: boolean;
}
