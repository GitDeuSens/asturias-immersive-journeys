// ============ DIRECTUS API CLIENT ============
// 🗄️ Centralized client for Directus CMS integration
// Currently returns mock data, ready to swap for real API calls

import type { 
  KuulaTour, 
  ARScene, 
  Museum, 
  SearchResults,
  VRExperience,
  Language 
} from '@/lib/types';
import { tours360 } from '@/data/mockData';
import { immersiveRoutes } from '@/data/immersiveRoutes';

// Configuration
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

// Map tour IDs to Kuula embed URLs
const KUULA_EMBEDS: Record<string, string> = {
  'tour-ecomuseo-samuno': 'https://kuula.co/share/collection/samuno?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-meiq': 'https://kuula.co/share/collection/meiq?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-mina-arnao': 'https://kuula.co/share/collection/arnao?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-mumi': 'https://kuula.co/share/collection/mumi?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-siderurgia': 'https://kuula.co/share/collection/musi?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-ferrocarril': 'https://kuula.co/share/collection/ferrocarril?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-prehistoria': 'https://kuula.co/share/collection/prehistoria?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-artes-populares': 'https://kuula.co/share/collection/artes?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
  'tour-faro-lastres': 'https://kuula.co/share/collection/lastres?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
};

// ============ MOCK DATA ============

const MOCK_AR_SCENES: ARScene[] = [
  {
    id: 'ar-covadonga',
    slug: 'lagos-covadonga',
    title: { 
      es: 'Fauna de los Lagos de Covadonga', 
      en: 'Wildlife of Covadonga Lakes', 
      fr: 'Faune des Lacs de Covadonga' 
    },
    description: {
      es: 'Descubre la fauna protegida del Parque Nacional en realidad aumentada',
      en: 'Discover the protected wildlife of the National Park in augmented reality',
      fr: 'Découvrez la faune protégée du Parc National en réalité augmentée'
    },
    needle_scene_url: 'https://engine.needle.tools/demos/covadonga',
    needle_type: 'slam',
    preview_image: '/assets/covadonga.jpg',
    difficulty: 'easy',
    duration_minutes: 10,
    requires_outdoors: true,
    poi_id: 'covadonga',
    published: true,
  },
  {
    id: 'ar-mumi',
    slug: 'mina-virtual-mumi',
    title: {
      es: 'Mina Virtual MUMI',
      en: 'MUMI Virtual Mine',
      fr: 'Mine Virtuelle MUMI'
    },
    description: {
      es: 'Explora una galería minera en AR dentro del museo',
      en: 'Explore a mining gallery in AR inside the museum',
      fr: 'Explorez une galerie minière en RA dans le musée'
    },
    needle_scene_url: 'https://engine.needle.tools/demos/mumi',
    needle_type: 'image-tracking',
    tracking_image_url: '/markers/mumi-marker.png',
    tracking_image_physical_size: 20,
    preview_image: '/assets/mumi.jpg',
    difficulty: 'easy',
    duration_minutes: 15,
    requires_outdoors: false,
    published: true,
  },
  {
    id: 'ar-termas-valduno',
    slug: 'termas-romanas-valduno',
    title: {
      es: 'Termas Romanas de Valduno',
      en: 'Roman Baths of Valduno',
      fr: 'Thermes Romains de Valduno'
    },
    description: {
      es: 'Reconstrucción virtual de las antiguas termas romanas',
      en: 'Virtual reconstruction of the ancient Roman baths',
      fr: 'Reconstruction virtuelle des anciens thermes romains'
    },
    needle_scene_url: 'https://engine.needle.tools/demos/valduno',
    needle_type: 'geo',
    location: {
      lat: 43.4167,
      lng: -6.0833,
      radius_meters: 50,
    },
    preview_image: '/assets/termas-valduno.webp',
    difficulty: 'moderate',
    duration_minutes: 20,
    requires_outdoors: true,
    route_id: 'AR-24',
    published: true,
  },
];

const MOCK_MUSEUMS: Museum[] = [
  {
    id: 'mumi',
    name: { es: 'MUMI - Museo de la Minería', en: 'MUMI - Mining Museum', fr: 'MUMI - Musée de la Mine' },
    description: { 
      es: 'El museo más importante sobre la minería del carbón en España',
      en: 'The most important coal mining museum in Spain',
      fr: 'Le musée le plus important sur l\'exploitation minière du charbon en Espagne'
    },
    address: 'El Entrego, San Martín del Rey Aurelio',
    lat: 43.243,
    lng: -5.665,
    image_url: '/assets/mumi.jpg',
    website: 'https://mumi.es',
    phone: '+34 985 662 562',
    municipality: 'San Martín del Rey Aurelio',
    published: true,
  },
  {
    id: 'muja',
    name: { es: 'MUJA - Museo Jurásico', en: 'MUJA - Jurassic Museum', fr: 'MUJA - Musée Jurassique' },
    description: {
      es: 'Museo dedicado a los dinosaurios de la costa asturiana',
      en: 'Museum dedicated to dinosaurs of the Asturian coast',
      fr: 'Musée dédié aux dinosaures de la côte asturienne'
    },
    address: 'Colunga, Asturias',
    lat: 43.4886,
    lng: -5.2652,
    image_url: '/assets/muja.jpg',
    website: 'https://museojurasico.com',
    municipality: 'Colunga',
    published: true,
  },
];

// ============ DIRECTUS CLIENT CLASS ============

interface DirectusConfig {
  url: string;
  token?: string;
}

class DirectusClient {
  private baseUrl: string;
  private token?: string;

  constructor(config: DirectusConfig) {
    this.baseUrl = config.url;
    this.token = config.token;
  }

  private async request<T>(endpoint: string, _options?: RequestInit): Promise<T> {
    // 🗄️ TODO: Enable when Directus is connected
    // const headers: HeadersInit = {
    //   'Content-Type': 'application/json',
    //   ...(this.token && { Authorization: `Bearer ${this.token}` })
    // };
    //
    // const response = await fetch(`${this.baseUrl}${endpoint}`, {
    //   ...options,
    //   headers: {
    //     ...headers,
    //     ...options?.headers
    //   }
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`Directus API error: ${response.statusText}`);
    // }
    //
    // const data = await response.json();
    // return data.data;

    console.log(`[DirectusClient] Mock request to: ${endpoint}`);
    throw new Error('Not implemented - using mock data');
  }

  // ============ VIRTUAL TOURS ============

  async getVirtualTours(_locale: Language = 'es'): Promise<KuulaTour[]> {
    // 🗄️ TODO: Replace with Directus API
    // return this.request(`/items/virtual_tours?locale=${locale}`);
    
    return tours360.map(tour => ({
      id: tour.id,
      title: tour.title,
      description: { es: '', en: '', fr: '' },
      kuula_embed_url: KUULA_EMBEDS[tour.id] || 'https://kuula.co/share/collection/default',
      thumbnail_url: tour.coverImage,
      total_panoramas: tour.scenes.length,
      published: true,
    }));
  }

  async getVirtualTourById(id: string, _locale: Language = 'es'): Promise<KuulaTour | null> {
    const tours = await this.getVirtualTours(_locale);
    return tours.find(t => t.id === id) || null;
  }

  // ============ AR SCENES ============

  async getARScenes(_locale: Language = 'es'): Promise<ARScene[]> {
    // 🗄️ TODO: Replace with Directus API
    // return this.request(`/items/ar_scenes?filter[published][_eq]=true&locale=${locale}`);
    
    return MOCK_AR_SCENES;
  }

  async getARSceneBySlug(slug: string, locale: Language = 'es'): Promise<ARScene | null> {
    const scenes = await this.getARScenes(locale);
    return scenes.find(s => s.slug === slug) || null;
  }

  async getARScenesByPOI(poiId: string, locale: Language = 'es'): Promise<ARScene[]> {
    const scenes = await this.getARScenes(locale);
    return scenes.filter(s => s.poi_id === poiId);
  }

  async getARScenesByRoute(routeId: string, locale: Language = 'es'): Promise<ARScene[]> {
    const scenes = await this.getARScenes(locale);
    return scenes.filter(s => s.route_id === routeId);
  }

  // ============ ROUTES ============

  async getRoutes(_locale: Language = 'es') {
    // 🗄️ TODO: Replace with Directus API
    return immersiveRoutes;
  }

  async getRouteBySlug(slug: string, locale: Language = 'es') {
    const routes = await this.getRoutes(locale);
    return routes.find(r => r.id === slug) || null;
  }

  // ============ MUSEUMS ============

  async getMuseums(_locale: Language = 'es'): Promise<Museum[]> {
    // 🗄️ TODO: Replace with Directus API
    return MOCK_MUSEUMS;
  }

  async getMuseumById(id: string, locale: Language = 'es'): Promise<Museum | null> {
    const museums = await this.getMuseums(locale);
    return museums.find(m => m.id === id) || null;
  }

  // ============ VR EXPERIENCES ============

  async getVRExperiences(_locale: Language = 'es'): Promise<VRExperience[]> {
    // 🗄️ TODO: Replace with Directus API
    return [];
  }

  // ============ SEARCH ============

  async search(query: string, locale: Language = 'es'): Promise<SearchResults> {
    const lowerQuery = query.toLowerCase();

    const [museums, routes, arScenes] = await Promise.all([
      this.getMuseums(locale),
      this.getRoutes(locale),
      this.getARScenes(locale),
    ]);

    const filteredMuseums = museums.filter(m => 
      m.name[locale]?.toLowerCase().includes(lowerQuery)
    );

    const filteredRoutes = routes.filter(r =>
      r.title[locale]?.toLowerCase().includes(lowerQuery)
    );

    const filteredARScenes = arScenes.filter(s =>
      s.title[locale]?.toLowerCase().includes(lowerQuery)
    );

    return {
      museums: filteredMuseums,
      routes: filteredRoutes,
      pois: [],
      ar_scenes: filteredARScenes,
      total: filteredMuseums.length + filteredRoutes.length + filteredARScenes.length,
    };
  }
}

// ============ SINGLETON INSTANCE ============

export const directus = new DirectusClient({
  url: DIRECTUS_URL,
  token: DIRECTUS_TOKEN,
});

// ============ CONVENIENCE FUNCTIONS ============

export const getVirtualTours = (locale?: Language) => directus.getVirtualTours(locale);
export const getVirtualTourById = (id: string, locale?: Language) => directus.getVirtualTourById(id, locale);
export const getARScenes = (locale?: Language) => directus.getARScenes(locale);
export const getARSceneBySlug = (slug: string, locale?: Language) => directus.getARSceneBySlug(slug, locale);
export const getRoutes = (locale?: Language) => directus.getRoutes(locale);
export const getRouteBySlug = (slug: string, locale?: Language) => directus.getRouteBySlug(slug, locale);
export const getMuseums = (locale?: Language) => directus.getMuseums(locale);
export const getMuseumById = (id: string, locale?: Language) => directus.getMuseumById(id, locale);
export const getVRExperiences = (locale?: Language) => directus.getVRExperiences(locale);
export const searchContent = (query: string, locale?: Language) => directus.search(query, locale);
