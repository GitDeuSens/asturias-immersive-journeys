// Asturias Inmersivo - Mock Data Model
// Ready for backend integration

import covadongaImg from '@/assets/covadonga.jpg';
import caresImg from '@/assets/cares.jpg';
import horreoImg from '@/assets/horreo.jpg';
import picosImg from '@/assets/picos.jpg';
import preromanicoImg from '@/assets/preromanico.jpg';

export type ExperienceType = 'AR' | '360' | 'INFO';

export interface Category {
  id: string;
  label: Record<string, string>;
  icon: string;
  color: string;
}

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

export interface POI {
  id: string;
  title: Record<string, string>;
  categoryIds: string[];
  experienceType: ExperienceType;
  shortDescription: Record<string, string>;
  richText?: Record<string, string>;
  audioGuides?: { es?: string; en?: string; fr?: string };
  access: {
    address: string;
    lat: number;
    lng: number;
    notes?: string;
    accessibility?: string;
    parking?: string;
  };
  media: {
    images: string[];
    videos?: string[];
  };
  arExperience?: {
    modelUrl: string;
    instructions: Record<string, string>;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours?: string;
  prices?: string;
  links?: { label: string; url: string }[];
  shareUrl?: string;
}

export interface Route {
  id: string;
  title: Record<string, string>;
  categoryIds: string[];
  isLoop: boolean;
  poiOrder: string[];
  polyline: { lat: number; lng: number }[];
  shortDescription?: Record<string, string>;
  itineraryDays?: {
    day: number;
    title: Record<string, string>;
    poiIds: string[];
  }[];
}

// Categories
export const categories: Category[] = [
  { id: 'nature', label: { es: 'Naturaleza', en: 'Nature', fr: 'Nature' }, icon: 'Mountain', color: 'emerald' },
  { id: 'heritage', label: { es: 'Patrimonio', en: 'Heritage', fr: 'Patrimoine' }, icon: 'Landmark', color: 'amber' },
  { id: 'adventure', label: { es: 'Aventura', en: 'Adventure', fr: 'Aventure' }, icon: 'Compass', color: 'sky' },
  { id: 'gastronomy', label: { es: 'Gastronomía', en: 'Gastronomy', fr: 'Gastronomie' }, icon: 'UtensilsCrossed', color: 'rose' },
  { id: 'culture', label: { es: 'Cultura', en: 'Culture', fr: 'Culture' }, icon: 'BookOpen', color: 'violet' },
];

// POIs
export const pois: POI[] = [
  {
    id: 'covadonga',
    title: { es: 'Lagos de Covadonga', en: 'Lakes of Covadonga', fr: 'Lacs de Covadonga' },
    categoryIds: ['nature', 'adventure'],
    experienceType: 'AR',
    shortDescription: {
      es: 'Lagos glaciares entre cumbres míticas',
      en: 'Glacial lakes among mythical peaks',
      fr: 'Lacs glaciaires parmi les sommets mythiques'
    },
    access: { address: 'Lagos de Covadonga, Cangas de Onís', lat: 43.2704, lng: -4.9856 },
    media: { images: [covadongaImg] },
    arExperience: { modelUrl: '/ar/covadonga.glb', instructions: { es: 'Apunta al lago para ver la fauna', en: 'Point at the lake to see wildlife', fr: 'Pointez vers le lac pour voir la faune' } },
  },
  {
    id: 'cares',
    title: { es: 'Ruta del Cares', en: 'Cares Trail', fr: 'Sentier du Cares' },
    categoryIds: ['nature', 'adventure'],
    experienceType: '360',
    shortDescription: {
      es: 'La garganta divina entre León y Asturias',
      en: 'The divine gorge between León and Asturias',
      fr: 'La gorge divine entre León et Asturies'
    },
    access: { address: 'Poncebos - Caín', lat: 43.2477, lng: -4.8433 },
    media: { images: [caresImg] },
  },
  {
    id: 'horreo',
    title: { es: 'Hórreos de Espinaréu', en: 'Granaries of Espinaréu', fr: 'Greniers d\'Espinaréu' },
    categoryIds: ['heritage', 'culture'],
    experienceType: 'INFO',
    shortDescription: {
      es: 'Conjunto etnográfico único en Europa',
      en: 'Unique ethnographic ensemble in Europe',
      fr: 'Ensemble ethnographique unique en Europe'
    },
    access: { address: 'Espinaréu, Piloña', lat: 43.3167, lng: -5.3333 },
    media: { images: [horreoImg] },
  },
  {
    id: 'picos',
    title: { es: 'Mirador del Naranjo', en: 'Naranjo Viewpoint', fr: 'Belvédère du Naranjo' },
    categoryIds: ['nature', 'adventure'],
    experienceType: 'AR',
    shortDescription: {
      es: 'Vista épica del Picu Urriellu',
      en: 'Epic view of Picu Urriellu',
      fr: 'Vue épique du Picu Urriellu'
    },
    access: { address: 'Bulnes, Cabrales', lat: 43.2194, lng: -4.8119 },
    media: { images: [picosImg] },
    arExperience: { modelUrl: '/ar/naranjo.glb', instructions: { es: 'Descubre la historia de la escalada', en: 'Discover the climbing history', fr: 'Découvrez l\'histoire de l\'escalade' } },
  },
  {
    id: 'preromanico',
    title: { es: 'Santa María del Naranco', en: 'Santa María del Naranco', fr: 'Santa María del Naranco' },
    categoryIds: ['heritage', 'culture'],
    experienceType: '360',
    shortDescription: {
      es: 'Joya del prerrománico asturiano',
      en: 'Jewel of Asturian pre-Romanesque',
      fr: 'Joyau du préroman asturien'
    },
    access: { address: 'Monte Naranco, Oviedo', lat: 43.3833, lng: -5.8667 },
    media: { images: [preromanicoImg] },
  },
];

// Tours 360
export const tours360: Tour360[] = [
  {
    id: 'tour-covadonga',
    title: { es: 'Lagos de Covadonga 360°', en: 'Lakes of Covadonga 360°', fr: 'Lacs de Covadonga 360°' },
    categoryIds: ['nature'],
    coverImage: covadongaImg,
    scenes: [
      { id: 'scene1', title: 'Lago Enol', imageUrl: covadongaImg, hotspots: [] },
    ],
  },
  {
    id: 'tour-cares',
    title: { es: 'Ruta del Cares Virtual', en: 'Virtual Cares Trail', fr: 'Sentier du Cares Virtuel' },
    categoryIds: ['nature', 'adventure'],
    coverImage: caresImg,
    scenes: [
      { id: 'scene1', title: 'Poncebos', imageUrl: caresImg, hotspots: [] },
    ],
  },
  {
    id: 'tour-preromanico',
    title: { es: 'Prerrománico Asturiano', en: 'Asturian Pre-Romanesque', fr: 'Préroman Asturien' },
    categoryIds: ['heritage', 'culture'],
    coverImage: preromanicoImg,
    scenes: [
      { id: 'scene1', title: 'Santa María del Naranco', imageUrl: preromanicoImg, hotspots: [] },
    ],
  },
  {
    id: 'tour-picos',
    title: { es: 'Picos de Europa', en: 'Peaks of Europe', fr: 'Pics d\'Europe' },
    categoryIds: ['nature', 'adventure'],
    coverImage: picosImg,
    scenes: [
      { id: 'scene1', title: 'Naranjo de Bulnes', imageUrl: picosImg, hotspots: [] },
    ],
  },
];

// Routes
export const routes: Route[] = [
  {
    id: 'route-lagos',
    title: { es: 'Ruta de los Lagos', en: 'Lakes Route', fr: 'Route des Lacs' },
    categoryIds: ['nature', 'adventure'],
    isLoop: true,
    poiOrder: ['covadonga', 'picos', 'cares'],
    shortDescription: {
      es: 'Descubre los lagos glaciares y las cumbres míticas',
      en: 'Discover glacial lakes and mythical peaks',
      fr: 'Découvrez les lacs glaciaires et les sommets mythiques'
    },
    polyline: [
      { lat: 43.2704, lng: -4.9856 },
      { lat: 43.2194, lng: -4.8119 },
      { lat: 43.2477, lng: -4.8433 },
      { lat: 43.2704, lng: -4.9856 },
    ],
  },
  {
    id: 'route-heritage',
    title: { es: 'Patrimonio Asturiano', en: 'Asturian Heritage', fr: 'Patrimoine Asturien' },
    categoryIds: ['heritage', 'culture'],
    isLoop: false,
    poiOrder: ['preromanico', 'horreo'],
    shortDescription: {
      es: 'Un viaje por la historia milenaria',
      en: 'A journey through millennial history',
      fr: 'Un voyage à travers l\'histoire millénaire'
    },
    polyline: [
      { lat: 43.3833, lng: -5.8667 },
      { lat: 43.3167, lng: -5.3333 },
    ],
  },
  {
    id: 'route-complete',
    title: { es: 'Asturias Completa', en: 'Complete Asturias', fr: 'Asturies Complète' },
    categoryIds: ['nature', 'heritage', 'adventure'],
    isLoop: true,
    poiOrder: ['preromanico', 'horreo', 'covadonga', 'picos', 'cares'],
    shortDescription: {
      es: 'La experiencia definitiva en 2 días',
      en: 'The ultimate experience in 2 days',
      fr: 'L\'expérience ultime en 2 jours'
    },
    itineraryDays: [
      { day: 1, title: { es: 'Día 1: Patrimonio', en: 'Day 1: Heritage', fr: 'Jour 1: Patrimoine' }, poiIds: ['preromanico', 'horreo'] },
      { day: 2, title: { es: 'Día 2: Naturaleza', en: 'Day 2: Nature', fr: 'Jour 2: Nature' }, poiIds: ['covadonga', 'picos', 'cares'] },
    ],
    polyline: [
      { lat: 43.3833, lng: -5.8667 },
      { lat: 43.3167, lng: -5.3333 },
      { lat: 43.2704, lng: -4.9856 },
      { lat: 43.2194, lng: -4.8119 },
      { lat: 43.2477, lng: -4.8433 },
      { lat: 43.3833, lng: -5.8667 },
    ],
  },
];

// Helper functions
export const getPOIById = (id: string): POI | undefined => pois.find(p => p.id === id);
export const getRouteById = (id: string): Route | undefined => routes.find(r => r.id === id);
export const getTourById = (id: string): Tour360 | undefined => tours360.find(t => t.id === id);
export const getCategoryById = (id: string): Category | undefined => categories.find(c => c.id === id);
