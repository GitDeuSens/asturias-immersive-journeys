// ============ SHARED DATA TYPES ============
// Types extracted from mockData and immersiveRoutes
// All data now comes from Directus CMS

export type ExperienceType = 'AR' | '360' | 'INFO' | 'VR';
export type Language = 'es' | 'en' | 'fr';

// Bloques de contenido modular (richText)
export type RichTextBlock = 
  | { type: 'paragraph'; text: Record<string, string> }
  | { type: 'bullets'; items: Record<string, string>[] }
  | { type: 'quote'; text: Record<string, string>; author?: Record<string, string> }
  | { type: 'highlight'; title?: Record<string, string>; text: Record<string, string> };

// Audioguía completa por idioma
export interface AudioGuide {
  url: string;
  durationSec?: number;
  transcript?: Record<string, string>;
}

// ============ CATEGORÍAS ============

export interface Category {
  id: string;
  label: Record<string, string>;
  icon: string;
  color: string;
}

// ============ POI ============

export interface POI {
  id: string;
  title: Record<string, string>;
  categoryIds: string[];
  tags?: string[];
  experienceType: ExperienceType;
  shortDescription: Record<string, string>;
  richText: { blocks: RichTextBlock[] };
  audioGuides: {
    es?: AudioGuide;
    en?: AudioGuide;
    fr?: AudioGuide;
  };
  access: {
    address: string;
    lat: number;
    lng: number;
    howToGet?: Record<string, string>;
    accessibility?: Record<string, string>;
    parking?: Record<string, string>;
  };
  media: {
    heroImageUrl?: string;
    images: { url: string; caption?: Record<string, string> }[];
    videos?: { url: string; caption?: Record<string, string> }[];
  };
  practical: {
    openingHours?: Record<string, string>;
    prices?: Record<string, string>;
    recommendedDuration?: Record<string, string>;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  links: { label: Record<string, string>; url: string }[];
  share: { shareUrl: string };
  ar?: {
    launchUrl: string;
    qrValue: string;
    iframe3dUrl: string;
    instructions?: Record<string, string>;
    compatibilityNote?: Record<string, string>;
  };
  tour360?: {
    iframe360Url: string;
    scenes?: { id: string; title: Record<string, string> }[];
    allowFullscreen: boolean;
  };
  info?: {
    didYouKnow?: Record<string, string>;
  };
}

// ============ TOUR 360 ============

export interface Tour360 {
  id: string;
  title: Record<string, string>;
  categoryIds: string[];
  coverImage: string;
  scenes: {
    id: string;
    title: string;
    imageUrl: string;
    hotspots: { id: string; label: string; targetSceneId?: string }[];
  }[];
}

// ============ ROUTE (simple) ============

export interface Route {
  id: string;
  title: Record<string, string>;
  categoryIds: string[];
  isLoop: boolean;
  poiOrder: string[];
  polyline: { lat: number; lng: number }[];
  coverImage?: string;
  shortDescription?: Record<string, string>;
  itineraryDays?: {
    day: number;
    title: Record<string, string>;
    poiIds: string[];
  }[];
}

// ============ IMMERSIVE ROUTE TYPES ============

export interface RoutePointContent {
  image?: { url: string; caption?: Record<Language, string> };
  gallery?: any[];
  video?: { url: string; caption?: Record<Language, string> };
  pdf?: { url: string; title: Record<Language, string> };
  audioGuide?: {
    es?: { url: string; durationSec?: number };
    en?: { url: string; durationSec?: number };
    fr?: { url: string; durationSec?: number };
  };
  arExperience?: {
    launchUrl: string;
    qrValue: string;
    iframe3dUrl?: string;
    arSlug?: string;
    instructions?: Record<Language, string>;
  };
  tour360?: {
    iframe360Url: string;
    allowFullscreen: boolean;
  };
  practicalInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    schedule?: Record<Language, string>;
    prices?: Record<Language, string>;
  };
}

export interface RoutePoint {
  id: string;       // slug (for clean URLs)
  poiUUID?: string; // original Directus UUID (for API queries)
  order: number;
  title: Record<Language, string>;
  shortDescription: Record<Language, string>;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  coverImage?: string;
  content: RoutePointContent;
  tags?: string[];
}

export interface ImmersiveRoute {
  id: string;
  title: Record<Language, string>;
  shortDescription: Record<Language, string>;
  fullDescription?: Record<Language, string>;
  coverImage: string;
  theme: Record<Language, string>;
  categoryIds: string[];
  duration?: Record<Language, string>;
  difficulty?: 'easy' | 'medium' | 'hard';
  isCircular: boolean;
  center: { lat: number; lng: number };
  hasValidCenter: boolean;
  maxPoints: number;
  points: RoutePoint[];
  tour360?: {
    available: boolean;
    iframe360Url?: string;
  };
  polyline: { lat: number; lng: number }[];
  distanceKm?: number;
  elevationGainMeters?: number;
  surfaceType?: 'paved' | 'gravel' | 'dirt' | 'mixed';
}
