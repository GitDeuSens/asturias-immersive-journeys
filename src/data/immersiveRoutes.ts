// Asturias Inmersivo - Immersive Routes Data Model
// 29 rutas inmersivas con modelo flexible de POIs

import laboralImg from '@/assets/laboral.jpg';
import ecomuseoSamunoImg from '@/assets/ecomuseo-samuno.jpg';
import musiImg from '@/assets/musi.jpg';
import mumiImg from '@/assets/mumi.jpg';
import cimavillaImg from '@/assets/cimavilla.jpg';
import covadongaImg from '@/assets/covadonga.jpg';
import caresImg from '@/assets/cares.jpg';
import picosImg from '@/assets/picos.jpg';
import llastresImg from '@/assets/llastres.jpg';
import termasValdunoImg from '@/assets/termas-valduno.webp';
// Ruta de la Sidra assets
import rutaSidraCoverImg from '@/assets/ruta-sidra-cover.jpg';
import torazuImg from '@/assets/torazu.jpg';
import museoSidraImg from '@/assets/museo-sidra.jpg';
import narzanaImg from '@/assets/narzana.jpg';
import valdediosImg from '@/assets/valdedios.jpg';
import mujaImg from '@/assets/muja.jpg';
import jardinBotanicoImg from '@/assets/jardin-botanico.jpg';
import prerromanicoImg from '@/assets/preromanico.jpg';
import playaGriegaImg from '@/assets/playa-griega.jpg';
import horreoImg from '@/assets/horreo.jpg';
import sotoBarcoImg from '@/assets/soto-barco-cover.jpg';

// ============ TIPOS ============

export type Language = 'es' | 'en' | 'fr';

// Contenido multimedia flexible para cada punto
export interface RoutePointContent {
  image?: { url: string; caption?: Record<Language, string> };
  gallery?: Array<{ url: string; caption?: Record<Language, string> }>;
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

// Punto de ruta (chapita)
export interface RoutePoint {
  id: string;
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
  // Tags opcionales para filtrar
  tags?: string[];
}

// Ruta inmersiva completa
export interface ImmersiveRoute {
  id: string;
  title: Record<Language, string>;
  shortDescription: Record<Language, string>;
  fullDescription?: Record<Language, string>;
  coverImage: string;
  // Metadatos
  theme: Record<Language, string>;
  categoryIds: string[];
  duration?: Record<Language, string>;
  difficulty?: 'easy' | 'medium' | 'hard';
  isCircular: boolean;
  // Ubicación central para el mapa
  center: { lat: number; lng: number };
  // Puntos de la ruta (máx 10, excepto AR-1 que puede tener 30)
  maxPoints: number;
  points: RoutePoint[];
  // Tour 360 opcional asociado a la ruta
  tour360?: {
    available: boolean;
    iframe360Url?: string;
  };
  // Polyline para dibujar en el mapa
  polyline: { lat: number; lng: number }[];
}

// ============ CATEGORÍAS DE RUTAS ============

export const routeThemes = [
  { id: 'mining', label: { es: 'Patrimonio minero', en: 'Mining heritage', fr: 'Patrimoine minier' } },
  { id: 'industrial', label: { es: 'Industrial', en: 'Industrial', fr: 'Industriel' } },
  { id: 'gastronomy', label: { es: 'Gastronomía', en: 'Gastronomy', fr: 'Gastronomie' } },
  { id: 'landscape', label: { es: 'Paisaje', en: 'Landscape', fr: 'Paysage' } },
  { id: 'heritage', label: { es: 'Patrimonio', en: 'Heritage', fr: 'Patrimoine' } },
  { id: 'roman', label: { es: 'Romano', en: 'Roman', fr: 'Romain' } },
];

// ============ 29 RUTAS INMERSIVAS ============

export const immersiveRoutes: ImmersiveRoute[] = [
  // =============== BLOQUE 1: ASTURIAS, NATURALEZA MINERA ===============
  {
    id: 'AR-1',
    title: { 
      es: 'Asturias, Naturaleza Minera', 
      en: 'Asturias, Mining Nature', 
      fr: 'Asturies, Nature Minière' 
    },
    shortDescription: { 
      es: 'Ruta extensa por el patrimonio minero e industrial de Asturias', 
      en: 'Extensive route through the mining and industrial heritage of Asturias', 
      fr: 'Route étendue à travers le patrimoine minier et industriel des Asturies' 
    },
    fullDescription: {
      es: 'Descubre el alma minera de Asturias a través de pozos, castilletes, lavaderos y paisajes transformados por siglos de extracción del carbón. Una ruta que recorre los valles del Nalón y del Caudal.',
      en: 'Discover the mining soul of Asturias through shafts, headframes, washeries and landscapes transformed by centuries of coal mining. A route through the Nalón and Caudal valleys.',
      fr: 'Découvrez l\'âme minière des Asturies à travers les puits, chevalements, lavoirs et paysages transformés par des siècles d\'extraction du charbon.'
    },
    coverImage: ecomuseoSamunoImg,
    theme: { es: 'Patrimonio minero e industrial', en: 'Mining and industrial heritage', fr: 'Patrimoine minier et industriel' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '2-3 días', en: '2-3 days', fr: '2-3 jours' },
    difficulty: 'medium',
    isCircular: false,
    center: { lat: 43.298, lng: -5.684 },
    maxPoints: 30,
    points: [
      {
        id: 'ar1-pozo-soton',
        order: 1,
        title: { es: 'Pozo Sotón', en: 'Sotón Shaft', fr: 'Puits Sotón' },
        shortDescription: { es: 'Experiencia minera auténtica bajo tierra', en: 'Authentic underground mining experience', fr: 'Expérience minière authentique souterraine' },
        location: { lat: 43.287, lng: -5.697, address: 'San Martín del Rey Aurelio' },
        coverImage: mumiImg,
        content: {
          image: { url: mumiImg },
          arExperience: {
            launchUrl: 'https://asturias.es/ar/pozo-soton',
            qrValue: 'asturias-inmersivo://ar/pozo-soton',
          },
        },
      },
      {
        id: 'ar1-ecomuseo-samuno',
        order: 2,
        title: { es: 'Ecomuseo Minero Valle de Samuño', en: 'Samuño Valley Mining Ecomuseum', fr: 'Écomusée Minier Vallée de Samuño' },
        shortDescription: { es: 'Viaje en tren minero por galerías reales', en: 'Mining train journey through real galleries', fr: 'Voyage en train minier dans de vraies galeries' },
        location: { lat: 43.295, lng: -5.678, address: 'Langreo' },
        coverImage: ecomuseoSamunoImg,
        content: {
          image: { url: ecomuseoSamunoImg },
          tour360: {
            iframe360Url: 'https://kuula.co/share/collection/samuno',
            allowFullscreen: true,
          },
        },
      },
      {
        id: 'ar1-musi',
        order: 3,
        title: { es: 'MUSI – Museo de la Siderurgia', en: 'MUSI – Steelworks Museum', fr: 'MUSI – Musée de la Sidérurgie' },
        shortDescription: { es: 'Historia del acero asturiano', en: 'History of Asturian steel', fr: 'Histoire de l\'acier asturien' },
        location: { lat: 43.305, lng: -5.692, address: 'Langreo' },
        coverImage: musiImg,
        content: {
          image: { url: musiImg },
          tour360: {
            iframe360Url: 'https://kuula.co/share/collection/musi',
            allowFullscreen: true,
          },
        },
      },
    ],
    tour360: { available: true, iframe360Url: 'https://kuula.co/share/collection/mineria' },
    polyline: [
      { lat: 43.287, lng: -5.697 },
      { lat: 43.295, lng: -5.678 },
      { lat: 43.305, lng: -5.692 },
    ],
  },

  {
    id: 'AR-2',
    title: { es: 'Valle Minero del Nalón', en: 'Nalón Mining Valley', fr: 'Vallée Minière du Nalón' },
    shortDescription: { es: 'Recorrido por los pueblos mineros del valle del Nalón', en: 'Tour through the mining villages of the Nalón valley', fr: 'Parcours des villages miniers de la vallée du Nalón' },
    coverImage: mumiImg,
    theme: { es: 'Minería e industria', en: 'Mining and industry', fr: 'Mines et industrie' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.243, lng: -5.665 },
    maxPoints: 2,
    points: [
      {
        id: 'ar2-mumi-tour360',
        order: 1,
        title: { es: 'Tour Virtual MUMI', en: 'MUMI Virtual Tour', fr: 'Visite Virtuelle MUMI' },
        shortDescription: { 
          es: 'Explora el Museo de la Minería desde cualquier lugar con nuestro tour 360°', 
          en: 'Explore the Mining Museum from anywhere with our 360° tour', 
          fr: 'Explorez le Musée de la Mine depuis n\'importe où avec notre visite 360°' 
        },
        location: { lat: 43.243, lng: -5.665 },
        coverImage: mumiImg,
        content: {
          image: { url: mumiImg },
          tour360: { 
            iframe360Url: 'https://kuula.co/share/collection/mumi360',
            allowFullscreen: true 
          },
          practicalInfo: {
            phone: '+34 985 662 562',
            email: 'info@mumi.es',
            website: 'https://mumi.es',
            schedule: {
              es: 'Martes a Domingo: 10:00 - 14:00 y 16:00 - 19:00\nLunes: Cerrado',
              en: 'Tuesday to Sunday: 10:00 - 14:00 and 16:00 - 19:00\nMonday: Closed',
              fr: 'Mardi à Dimanche: 10h00 - 14h00 et 16h00 - 19h00\nLundi: Fermé'
            },
            prices: {
              es: 'Adultos: 8€\nMenores de 12 años: Gratis\nGrupos (+15): 6€/persona',
              en: 'Adults: €8\nUnder 12: Free\nGroups (+15): €6/person',
              fr: 'Adultes: 8€\nMoins de 12 ans: Gratuit\nGroupes (+15): 6€/personne'
            }
          },
        },
      },
      {
        id: 'ar2-mumi',
        order: 2,
        title: { es: 'MUMI', en: 'MUMI', fr: 'MUMI' },
        shortDescription: { es: 'Museo de la Minería y la Industria', en: 'Mining and Industry Museum', fr: 'Musée de la Mine et de l\'Industrie' },
        location: { lat: 43.243, lng: -5.665 },
        coverImage: mumiImg,
        content: {
          image: { url: mumiImg },
          video: { 
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            caption: { es: 'Visita virtual al MUMI', en: 'Virtual tour of MUMI', fr: 'Visite virtuelle du MUMI' }
          },
          audioGuide: {
            es: { url: '/audio/mumi-es.mp3', durationSec: 300 },
            en: { url: '/audio/mumi-en.mp3', durationSec: 290 },
            fr: { url: '/audio/mumi-fr.mp3', durationSec: 310 },
          },
          practicalInfo: {
            phone: '+34 985 662 562',
            email: 'reservas@mumi.es',
            website: 'https://mumi.es',
            schedule: {
              es: 'Martes a Domingo: 10:00 - 14:00 y 16:00 - 19:00\nLunes: Cerrado',
              en: 'Tuesday to Sunday: 10:00 - 14:00 and 16:00 - 19:00\nMonday: Closed',
              fr: 'Mardi à Dimanche: 10h00 - 14h00 et 16h00 - 19h00\nLundi: Fermé'
            },
            prices: {
              es: 'Adultos: 8€\nMenores de 12 años: Gratis\nGrupos (+15): 6€/persona',
              en: 'Adults: €8\nUnder 12: Free\nGroups (+15): €6/person',
              fr: 'Adultes: 8€\nMoins de 12 ans: Gratuit\nGroupes (+15): 6€/personne'
            }
          },
        },
      },
    ],
    polyline: [
      { lat: 43.243, lng: -5.665 },
      { lat: 43.247, lng: -5.661 },
    ],
  },

  {
    id: 'AR-3',
    title: { es: 'Cuencas del Caudal', en: 'Caudal Basins', fr: 'Bassins du Caudal' },
    shortDescription: { es: 'El paisaje industrial transformado del río Caudal', en: 'The transformed industrial landscape of the Caudal river', fr: 'Le paysage industriel transformé de la rivière Caudal' },
    coverImage: laboralImg,
    theme: { es: 'Paisaje industrial', en: 'Industrial landscape', fr: 'Paysage industriel' },
    categoryIds: ['heritage', 'nature'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.207, lng: -5.781 },
    maxPoints: 9,
    points: [],
    polyline: [
      { lat: 43.200, lng: -5.790 },
      { lat: 43.214, lng: -5.772 },
    ],
  },

  {
    id: 'AR-4',
    title: { es: 'Langreo Industrial', en: 'Industrial Langreo', fr: 'Langreo Industriel' },
    shortDescription: { es: 'Memoria obrera de la capital de las cuencas', en: 'Working-class memory of the basin capital', fr: 'Mémoire ouvrière de la capitale des bassins' },
    coverImage: musiImg,
    theme: { es: 'Memoria obrera', en: 'Working-class memory', fr: 'Mémoire ouvrière' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '4-5 horas', en: '4-5 hours', fr: '4-5 heures' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.298, lng: -5.695 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.295, lng: -5.700 },
      { lat: 43.301, lng: -5.690 },
      { lat: 43.295, lng: -5.700 },
    ],
  },

  {
    id: 'AR-5',
    title: { es: 'Mieres y su entorno minero', en: 'Mieres and its mining surroundings', fr: 'Mieres et son environnement minier' },
    shortDescription: { es: 'Pozos, castilletes y patrimonio industrial en Mieres', en: 'Shafts, headframes and industrial heritage in Mieres', fr: 'Puits, chevalements et patrimoine industriel à Mieres' },
    coverImage: laboralImg,
    theme: { es: 'Industria y paisaje', en: 'Industry and landscape', fr: 'Industrie et paysage' },
    categoryIds: ['heritage'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'medium',
    isCircular: false,
    center: { lat: 43.251, lng: -5.775 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.245, lng: -5.780 },
      { lat: 43.257, lng: -5.770 },
    ],
  },

  {
    id: 'AR-6',
    title: { es: 'Siero Industrial', en: 'Industrial Siero', fr: 'Siero Industriel' },
    shortDescription: { es: 'Infraestructura y desarrollo en el concejo de Siero', en: 'Infrastructure and development in Siero municipality', fr: 'Infrastructure et développement dans la commune de Siero' },
    coverImage: laboralImg,
    theme: { es: 'Infraestructura y desarrollo', en: 'Infrastructure and development', fr: 'Infrastructure et développement' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '4 horas', en: '4 hours', fr: '4 heures' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.392, lng: -5.660 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.388, lng: -5.665 },
      { lat: 43.396, lng: -5.655 },
    ],
  },

  {
    id: 'AR-7',
    title: { es: 'Avilés siderúrgico', en: 'Steelmaking Avilés', fr: 'Avilés sidérurgique' },
    shortDescription: { es: 'El legado de la siderurgia en la ría de Avilés', en: 'The steelmaking legacy in the Avilés estuary', fr: 'L\'héritage sidérurgique dans l\'estuaire d\'Avilés' },
    coverImage: laboralImg,
    theme: { es: 'Siderurgia', en: 'Steelmaking', fr: 'Sidérurgie' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '5 horas', en: '5 hours', fr: '5 heures' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.555, lng: -5.924 },
    maxPoints: 9,
    points: [],
    polyline: [
      { lat: 43.550, lng: -5.930 },
      { lat: 43.560, lng: -5.918 },
      { lat: 43.550, lng: -5.930 },
    ],
  },

  {
    id: 'AR-8',
    title: { es: 'Gijón industrial y portuario', en: 'Industrial and port Gijón', fr: 'Gijón industriel et portuaire' },
    shortDescription: { es: 'El puerto y la industria que forjaron la ciudad', en: 'The port and industry that forged the city', fr: 'Le port et l\'industrie qui ont forgé la ville' },
    coverImage: cimavillaImg,
    theme: { es: 'Puerto e industria', en: 'Port and industry', fr: 'Port et industrie' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.538, lng: -5.670 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.530, lng: -5.680 },
      { lat: 43.546, lng: -5.660 },
      { lat: 43.530, lng: -5.680 },
    ],
  },

  {
    id: 'AR-9',
    title: { es: 'Carreño y entorno industrial', en: 'Carreño and industrial surroundings', fr: 'Carreño et environnement industriel' },
    shortDescription: { es: 'Paisaje transformado por la industria en Carreño', en: 'Landscape transformed by industry in Carreño', fr: 'Paysage transformé par l\'industrie à Carreño' },
    coverImage: laboralImg,
    theme: { es: 'Paisaje transformado', en: 'Transformed landscape', fr: 'Paysage transformé' },
    categoryIds: ['heritage', 'nature'],
    duration: { es: '4 horas', en: '4 hours', fr: '4 heures' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.586, lng: -5.780 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.580, lng: -5.785 },
      { lat: 43.592, lng: -5.775 },
    ],
  },

  {
    id: 'AR-10',
    title: { es: 'Corredor industrial central', en: 'Central industrial corridor', fr: 'Corridor industriel central' },
    shortDescription: { es: 'El eje industrial que une las cuencas con el mar', en: 'The industrial axis connecting the basins to the sea', fr: 'L\'axe industriel reliant les bassins à la mer' },
    coverImage: laboralImg,
    theme: { es: 'Eje industrial', en: 'Industrial axis', fr: 'Axe industriel' },
    categoryIds: ['heritage'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'medium',
    isCircular: false,
    center: { lat: 43.410, lng: -5.780 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.400, lng: -5.790 },
      { lat: 43.420, lng: -5.770 },
    ],
  },

  {
    id: 'AR-11',
    title: { es: 'Memoria industrial de Asturias', en: 'Industrial memory of Asturias', fr: 'Mémoire industrielle des Asturies' },
    shortDescription: { es: 'Recorrido por el patrimonio histórico industrial', en: 'Tour through the historical industrial heritage', fr: 'Parcours du patrimoine historique industriel' },
    coverImage: laboralImg,
    theme: { es: 'Patrimonio histórico', en: 'Historical heritage', fr: 'Patrimoine historique' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.350, lng: -5.800 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.345, lng: -5.810 },
      { lat: 43.355, lng: -5.790 },
    ],
  },

  // =============== BLOQUE 2: PLAN NACIONAL ENOGASTRONÓMICO ===============
  {
    id: 'AR-12',
    title: { es: 'Cudillero y alrededores', en: 'Cudillero and surroundings', fr: 'Cudillero et environs' },
    shortDescription: { es: 'Ruta paisajística y gastronómica por el anfiteatro marinero', en: 'Scenic and gastronomic route through the maritime amphitheater', fr: 'Route panoramique et gastronomique à travers l\'amphithéâtre maritime' },
    coverImage: llastresImg,
    theme: { es: 'Paisaje y gastronomía', en: 'Landscape and gastronomy', fr: 'Paysage et gastronomie' },
    categoryIds: ['gastronomy', 'nature'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.563, lng: -6.145 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.558, lng: -6.150 },
      { lat: 43.568, lng: -6.140 },
      { lat: 43.558, lng: -6.150 },
    ],
  },

  {
    id: 'AR-13',
    title: { es: 'Las Regueras – Termas de Valduno', en: 'Las Regueras – Valduno Baths', fr: 'Las Regueras – Thermes de Valduno' },
    shortDescription: { es: 'Ruta con reconstrucción AR de las termas romanas', en: 'Route with AR reconstruction of Roman baths', fr: 'Route avec reconstruction AR des thermes romains' },
    fullDescription: {
      es: 'Descubre las Termas Romanas de Santa Eulalia de Valduno, un excepcional conjunto termal de época romana conservado junto a la Iglesia parroquial. La reconstrucción en Realidad Aumentada te permite comprender la estructura original del Caldarium y Tepidarium, siguiendo la orientación canónica recomendada por Vitrubio.',
      en: 'Discover the Roman Baths of Santa Eulalia de Valduno, an exceptional Roman-era thermal complex preserved next to the parish church. The Augmented Reality reconstruction allows you to understand the original structure of the Caldarium and Tepidarium, following the canonical orientation recommended by Vitruvius.',
      fr: 'Découvrez les Thermes Romains de Santa Eulalia de Valduno, un ensemble thermal exceptionnel de l\'époque romaine conservé à côté de l\'église paroissiale. La reconstruction en Réalité Augmentée vous permet de comprendre la structure originale du Caldarium et du Tepidarium.'
    },
    coverImage: termasValdunoImg,
    theme: { es: 'Patrimonio romano', en: 'Roman heritage', fr: 'Patrimoine romain' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '2-3 horas', en: '2-3 hours', fr: '2-3 heures' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.3910861, lng: -6.0052722 },
    maxPoints: 1,
    points: [
      {
        id: 'ar13-termas-valduno',
        order: 1,
        title: { 
          es: 'Termas Romanas de Valduno', 
          en: 'Roman Baths of Valduno', 
          fr: 'Thermes Romains de Valduno' 
        },
        shortDescription: { 
          es: 'Reconstrucción AR del conjunto termal romano del siglo I-II d.C.', 
          en: 'AR reconstruction of the Roman thermal complex from the 1st-2nd century AD', 
          fr: 'Reconstruction AR du complexe thermal romain du Ier-IIe siècle après J.-C.' 
        },
        location: { 
          lat: 43.3910861, 
          lng: -6.0052722,
          address: 'Santa Eulalia de Valduno, Las Regueras, Asturias'
        },
        coverImage: termasValdunoImg,
        content: {
          image: { 
            url: termasValdunoImg, 
            caption: { 
              es: 'Restos del Caldarium de las Termas de Valduno', 
              en: 'Remains of the Caldarium of the Valduno Baths', 
              fr: 'Vestiges du Caldarium des Thermes de Valduno' 
            } 
          },
          arExperience: {
            launchUrl: 'https://clientes.deusens.com/tarragona/2/',
            qrValue: 'https://clientes.deusens.com/tarragona/2/',
            instructions: {
              es: 'Apunta tu dispositivo hacia los restos arqueológicos para ver la reconstrucción 3D de las termas romanas. Explora el Caldarium (sala caliente), el Tepidarium (sala templada) y el sistema de calefacción por hipocausto.',
              en: 'Point your device at the archaeological remains to see the 3D reconstruction of the Roman baths. Explore the Caldarium (hot room), Tepidarium (warm room) and the hypocaust heating system.',
              fr: 'Pointez votre appareil vers les vestiges archéologiques pour voir la reconstruction 3D des thermes romains. Explorez le Caldarium (salle chaude), le Tepidarium (salle tiède) et le système de chauffage par hypocauste.'
            }
          },
        },
        tags: ['romano', 'termas', 'arqueología', 'AR'],
      },
    ],
    polyline: [
      { lat: 43.3910861, lng: -6.0052722 },
    ],
  },

  {
    id: 'AR-14',
    title: { es: 'Muros del Nalón – Puerto Carbonero', en: 'Muros del Nalón – Coal Port', fr: 'Muros del Nalón – Port Charbonnier' },
    shortDescription: { es: 'Grúas, cargaderos, tolvas y muelles históricos', en: 'Cranes, loading docks, hoppers and historic piers', fr: 'Grues, quais de chargement, trémies et jetées historiques' },
    coverImage: laboralImg,
    theme: { es: 'Puerto e industria', en: 'Port and industry', fr: 'Port et industrie' },
    categoryIds: ['heritage'],
    duration: { es: '4 horas', en: '4 hours', fr: '4 heures' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.542, lng: -6.100 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.538, lng: -6.105 },
      { lat: 43.546, lng: -6.095 },
    ],
  },

  {
    id: 'AR-15',
    title: { es: 'Pravia – Casco histórico', en: 'Pravia – Historic center', fr: 'Pravia – Centre historique' },
    shortDescription: { es: 'Ruta urbana con guía virtual por la capital del Bajo Nalón', en: 'Urban route with virtual guide through the capital of Bajo Nalón', fr: 'Parcours urbain avec guide virtuel dans la capitale du Bajo Nalón' },
    coverImage: laboralImg,
    theme: { es: 'Historia urbana', en: 'Urban history', fr: 'Histoire urbaine' },
    categoryIds: ['heritage', 'culture'],
    duration: { es: '3 horas', en: '3 hours', fr: '3 heures' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.488, lng: -6.112 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.485, lng: -6.115 },
      { lat: 43.491, lng: -6.109 },
      { lat: 43.485, lng: -6.115 },
    ],
  },

  {
    id: 'AR-16',
    title: { es: 'Soto del Barco', en: 'Soto del Barco', fr: 'Soto del Barco' },
    shortDescription: { es: 'Ruta territorial y paisajística por el estuario del Nalón', en: 'Territorial and landscape route through the Nalón estuary', fr: 'Route territoriale et paysagère à travers l\'estuaire du Nalón' },
    coverImage: laboralImg,
    theme: { es: 'Paisaje fluvial', en: 'River landscape', fr: 'Paysage fluvial' },
    categoryIds: ['nature'],
    duration: { es: '4 horas', en: '4 hours', fr: '4 heures' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.533, lng: -6.069 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.528, lng: -6.074 },
      { lat: 43.538, lng: -6.064 },
    ],
  },

  // =============== RUTAS COCINA DE PAISAJE (AR-17 a AR-29) ===============
  {
    id: 'AR-17',
    title: { 
      es: 'Ruta de la Sidra', 
      en: 'Cider Route', 
      fr: 'Route du Cidre' 
    },
    shortDescription: { 
      es: 'De las pumaradas rurales a la cultura urbana del escanciado', 
      en: 'From rural apple orchards to the urban culture of cider pouring', 
      fr: 'Des vergers ruraux à la culture urbaine du service du cidre' 
    },
    fullDescription: {
      es: 'Un recorrido cultural y territorial que conecta la cultura sidrera asturiana desde el ámbito rural —pumaradas, pueblos tradicionales y llagares centenarios—, pasando por patrimonio histórico y museos de referencia, hasta su culminación urbana en Gijón/Xixón. Una experiencia inmersiva que permite comprender cómo la sidra ha moldeado el paisaje, la arquitectura y la identidad asturiana.',
      en: 'A cultural and territorial journey connecting Asturian cider culture from the rural realm —apple orchards, traditional villages and centuries-old cider houses—, through historical heritage and renowned museums, to its urban culmination in Gijón/Xixón. An immersive experience to understand how cider has shaped the landscape, architecture and Asturian identity.',
      fr: 'Un parcours culturel et territorial reliant la culture cidricole asturienne depuis le milieu rural —vergers, villages traditionnels et cidreries centenaires—, en passant par le patrimoine historique et les musées de référence, jusqu\'à son aboutissement urbain à Gijón/Xixón.'
    },
    coverImage: rutaSidraCoverImg,
    theme: { es: 'Gastronomía y cultura sidrera', en: 'Gastronomy and cider culture', fr: 'Gastronomie et culture du cidre' },
    categoryIds: ['gastronomy', 'heritage', 'culture'],
    duration: { es: '2-3 días', en: '2-3 days', fr: '2-3 jours' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.42, lng: -5.48 },
    maxPoints: 7,
    points: [
      // 1️⃣ Torazu - AR
      {
        id: 'ar17-torazu',
        order: 1,
        title: { 
          es: 'Torazu', 
          en: 'Torazu', 
          fr: 'Torazu' 
        },
        shortDescription: { 
          es: 'Pueblo tradicional de Cabranes, cuna de la cultura sidrera rural con arquitectura popular y pumaradas centenarias', 
          en: 'Traditional village of Cabranes, cradle of rural cider culture with folk architecture and centuries-old apple orchards', 
          fr: 'Village traditionnel de Cabranes, berceau de la culture cidricole rurale avec architecture populaire et vergers centenaires' 
        },
        location: { 
          lat: 43.3879, 
          lng: -5.3856,
          address: 'Torazu, Cabranes, Asturias'
        },
        coverImage: torazuImg,
        content: {
          image: { 
            url: torazuImg, 
            caption: { 
              es: 'Vista del pueblo de Torazu con sus hórreos y paneras tradicionales', 
              en: 'View of Torazu village with its traditional granaries', 
              fr: 'Vue du village de Torazu avec ses greniers traditionnels' 
            } 
          },
          arExperience: {
            launchUrl: 'https://asturias-inmersivo.app/ar/torazu',
            qrValue: 'https://asturias-inmersivo.app/ar/torazu',
            instructions: {
              es: 'Apunta tu dispositivo hacia las edificaciones tradicionales para ver la recreación de la vida rural sidrera: el proceso de recogida de manzana, el trabajo en el llagar y las celebraciones del espichu.',
              en: 'Point your device at the traditional buildings to see the recreation of rural cider life: the apple harvest process, work in the cider press and the espichu celebrations.',
              fr: 'Pointez votre appareil vers les bâtiments traditionnels pour voir la recréation de la vie cidricole rurale: la récolte des pommes, le travail au pressoir et les célébrations de l\'espichu.'
            }
          },
        },
        tags: ['sidra', 'rural', 'arquitectura', 'AR'],
      },
      // 2️⃣ Museo de la Sidra - AR
      {
        id: 'ar17-museo-sidra',
        order: 2,
        title: { 
          es: 'Museo de la Sidra de Asturias', 
          en: 'Asturias Cider Museum', 
          fr: 'Musée du Cidre des Asturies' 
        },
        shortDescription: { 
          es: 'Centro de interpretación de la cultura sidrera asturiana en Nava, capital de la sidra', 
          en: 'Interpretation center of Asturian cider culture in Nava, the cider capital', 
          fr: 'Centre d\'interprétation de la culture cidricole asturienne à Nava, capitale du cidre' 
        },
        location: { 
          lat: 43.3586, 
          lng: -5.5053,
          address: 'Plaza Príncipe de Asturias, Nava, Asturias'
        },
        coverImage: museoSidraImg,
        content: {
          image: { 
            url: museoSidraImg, 
            caption: { 
              es: 'Fachada del Museo de la Sidra de Asturias', 
              en: 'Facade of the Asturias Cider Museum', 
              fr: 'Façade du Musée du Cidre des Asturies' 
            } 
          },
          arExperience: {
            launchUrl: 'https://asturias-inmersivo.app/ar/museo-sidra',
            qrValue: 'https://asturias-inmersivo.app/ar/museo-sidra',
            instructions: {
              es: 'Visualiza en AR el proceso completo de elaboración de la sidra: desde la pumarada hasta el escanciado. Explora un llagar virtual y aprende las técnicas tradicionales.',
              en: 'Visualize in AR the complete cider-making process: from the orchard to the pouring. Explore a virtual cider press and learn traditional techniques.',
              fr: 'Visualisez en RA le processus complet d\'élaboration du cidre: du verger au service. Explorez un pressoir virtuel et apprenez les techniques traditionnelles.'
            }
          },
        },
        tags: ['sidra', 'museo', 'gastronomía', 'AR'],
      },
      // 3️⃣ Iglesia de Santa María de Narzana - INFO
      {
        id: 'ar17-narzana',
        order: 3,
        title: { 
          es: 'Iglesia de Santa María de Narzana', 
          en: 'Church of Santa María de Narzana', 
          fr: 'Église de Santa María de Narzana' 
        },
        shortDescription: { 
          es: 'Joya del románico rural asturiano del siglo XII en el municipio de Sariego', 
          en: '12th century jewel of Asturian rural Romanesque in Sariego municipality', 
          fr: 'Joyau du roman rural asturien du XIIe siècle dans la commune de Sariego' 
        },
        location: { 
          lat: 43.4021, 
          lng: -5.5674,
          address: 'Narzana, Sariego, Asturias'
        },
        coverImage: narzanaImg,
        content: {
          image: { 
            url: narzanaImg, 
            caption: { 
              es: 'Portada románica de la Iglesia de Santa María de Narzana', 
              en: 'Romanesque portal of the Church of Santa María de Narzana', 
              fr: 'Portail roman de l\'Église de Santa María de Narzana' 
            } 
          },
          gallery: [
            { url: narzanaImg, caption: { es: 'Fachada principal', en: 'Main facade', fr: 'Façade principale' } },
            { url: prerromanicoImg, caption: { es: 'Detalle arquitectónico románico', en: 'Romanesque architectural detail', fr: 'Détail architectural roman' } },
          ],
          audioGuide: {
            es: { url: '/audio/narzana-es.mp3', durationSec: 150 },
            en: { url: '/audio/narzana-en.mp3', durationSec: 145 },
            fr: { url: '/audio/narzana-fr.mp3', durationSec: 155 },
          },
        },
        tags: ['románico', 'patrimonio', 'iglesia'],
      },
      // 4️⃣ Conjunto Monumental de Valdediós - AR
      {
        id: 'ar17-valdedios',
        order: 4,
        title: { 
          es: 'Conjunto Monumental de Valdediós', 
          en: 'Valdediós Monumental Complex', 
          fr: 'Ensemble Monumental de Valdediós' 
        },
        shortDescription: { 
          es: 'Iglesia prerrománica de San Salvador (s. IX) y Monasterio cisterciense, Patrimonio de la Humanidad UNESCO', 
          en: 'Pre-Romanesque Church of San Salvador (9th c.) and Cistercian Monastery, UNESCO World Heritage', 
          fr: 'Église prérromane de San Salvador (IXe s.) et Monastère cistercien, Patrimoine Mondial UNESCO' 
        },
        location: { 
          lat: 43.4467, 
          lng: -5.4049,
          address: 'Valdediós, Villaviciosa, Asturias'
        },
        coverImage: valdediosImg,
        content: {
          image: { 
            url: valdediosImg, 
            caption: { 
              es: 'Iglesia prerrománica de San Salvador de Valdediós, conocida como "El Conventín"', 
              en: 'Pre-Romanesque Church of San Salvador de Valdediós, known as "El Conventín"', 
              fr: 'Église prérromane de San Salvador de Valdediós, connue sous le nom de "El Conventín"' 
            } 
          },
          arExperience: {
            launchUrl: 'https://asturias-inmersivo.app/ar/valdedios',
            qrValue: 'https://asturias-inmersivo.app/ar/valdedios',
            instructions: {
              es: 'Visualiza la reconstrucción histórica del conjunto monástico: explora el estado original del siglo IX, las ampliaciones cistercienses y la evolución arquitectónica hasta nuestros días.',
              en: 'Visualize the historical reconstruction of the monastic complex: explore the original 9th century state, Cistercian expansions and architectural evolution to the present day.',
              fr: 'Visualisez la reconstruction historique du complexe monastique: explorez l\'état original du IXe siècle, les extensions cisterciennes et l\'évolution architecturale jusqu\'à nos jours.'
            }
          },
        },
        tags: ['prerrománico', 'UNESCO', 'monasterio', 'AR'],
      },
      // 5️⃣ MUJA - INFO
      {
        id: 'ar17-muja',
        order: 5,
        title: { 
          es: 'Museo del Jurásico de Asturias (MUJA)', 
          en: 'Jurassic Museum of Asturias (MUJA)', 
          fr: 'Musée du Jurassique des Asturies (MUJA)' 
        },
        shortDescription: { 
          es: 'Referente paleontológico con la mayor colección de icnitas de dinosaurio de la costa cantábrica', 
          en: 'Paleontological reference with the largest dinosaur footprint collection on the Cantabrian coast', 
          fr: 'Référence paléontologique avec la plus grande collection d\'empreintes de dinosaures de la côte cantabrique' 
        },
        location: { 
          lat: 43.4753, 
          lng: -5.1915,
          address: 'Rasa de San Telmo, Colunga, Asturias'
        },
        coverImage: mujaImg,
        content: {
          image: { 
            url: mujaImg, 
            caption: { 
              es: 'Vista exterior del MUJA con su icónica forma de huella de dinosaurio', 
              en: 'Exterior view of MUJA with its iconic dinosaur footprint shape', 
              fr: 'Vue extérieure du MUJA avec sa forme iconique d\'empreinte de dinosaure' 
            } 
          },
          gallery: [
            { url: mujaImg, caption: { es: 'Edificio del MUJA', en: 'MUJA building', fr: 'Bâtiment du MUJA' } },
            { url: playaGriegaImg, caption: { es: 'Playa de La Griega con icnitas de dinosaurio', en: 'La Griega Beach with dinosaur footprints', fr: 'Plage de La Griega avec empreintes de dinosaures' } },
          ],
          audioGuide: {
            es: { url: '/audio/muja-es.mp3', durationSec: 190 },
            en: { url: '/audio/muja-en.mp3', durationSec: 185 },
            fr: { url: '/audio/muja-fr.mp3', durationSec: 195 },
          },
        },
        tags: ['museo', 'dinosaurios', 'paleontología'],
      },
      // 6️⃣ Laboral Ciudad de la Cultura - AR
      {
        id: 'ar17-laboral',
        order: 6,
        title: { 
          es: 'Laboral Ciudad de la Cultura', 
          en: 'Laboral City of Culture', 
          fr: 'Laboral Cité de la Culture' 
        },
        shortDescription: { 
          es: 'El edificio más grande de España: de Universidad Laboral a epicentro cultural de Gijón', 
          en: 'Spain\'s largest building: from Workers\' University to Gijón\'s cultural epicenter', 
          fr: 'Le plus grand bâtiment d\'Espagne: de l\'Université Ouvrière à l\'épicentre culturel de Gijón' 
        },
        location: { 
          lat: 43.5225, 
          lng: -5.6394,
          address: 'C/ Luis Moya Blanco, 261, Gijón, Asturias'
        },
        coverImage: laboralImg,
        content: {
          image: { 
            url: laboralImg, 
            caption: { 
              es: 'Torre de la Laboral con su icónica cúpula y el patio central', 
              en: 'Laboral Tower with its iconic dome and central courtyard', 
              fr: 'Tour de la Laboral avec sa coupole iconique et la cour centrale' 
            } 
          },
          arExperience: {
            launchUrl: 'https://asturias-inmersivo.app/ar/laboral',
            qrValue: 'https://asturias-inmersivo.app/ar/laboral',
            instructions: {
              es: 'Visualiza la evolución arquitectónica del conjunto: desde su construcción como Universidad Laboral en los años 40 hasta su transformación en Ciudad de la Cultura. Explora espacios inaccesibles y detalles ocultos.',
              en: 'Visualize the architectural evolution of the complex: from its construction as Workers\' University in the 1940s to its transformation into City of Culture. Explore inaccessible spaces and hidden details.',
              fr: 'Visualisez l\'évolution architecturale du complexe: de sa construction comme Université Ouvrière dans les années 40 à sa transformation en Cité de la Culture. Explorez des espaces inaccessibles et des détails cachés.'
            }
          },
        },
        tags: ['arquitectura', 'cultura', 'patrimonio', 'AR'],
      },
      // 7️⃣ Barrio de Cimavilla - INFO
      {
        id: 'ar17-cimavilla',
        order: 7,
        title: { 
          es: 'Barrio de Cimavilla', 
          en: 'Cimavilla Quarter', 
          fr: 'Quartier de Cimavilla' 
        },
        shortDescription: { 
          es: 'El casco antiguo marinero de Gijón: sidrerías, cultura popular y el Elogio del Horizonte de Chillida', 
          en: 'Gijón\'s old seafaring quarter: cider houses, popular culture and Chillida\'s Eulogy to the Horizon', 
          fr: 'Le vieux quartier maritime de Gijón: cidreries, culture populaire et l\'Éloge de l\'Horizon de Chillida' 
        },
        location: { 
          lat: 43.5450, 
          lng: -5.6612,
          address: 'Cimavilla, Gijón, Asturias'
        },
        coverImage: cimavillaImg,
        content: {
          image: { 
            url: cimavillaImg, 
            caption: { 
              es: 'Vista del barrio de Cimavilla desde el puerto deportivo', 
              en: 'View of Cimavilla quarter from the marina', 
              fr: 'Vue du quartier de Cimavilla depuis le port de plaisance' 
            } 
          },
          gallery: [
            { url: cimavillaImg, caption: { es: 'Puerto de Gijón y Cimavilla', en: 'Gijón Port and Cimavilla', fr: 'Port de Gijón et Cimavilla' } },
            { url: llastresImg, caption: { es: 'Arquitectura marinera asturiana', en: 'Asturian maritime architecture', fr: 'Architecture maritime asturienne' } },
          ],
          audioGuide: {
            es: { url: '/audio/cimavilla-es.mp3', durationSec: 200 },
            en: { url: '/audio/cimavilla-en.mp3', durationSec: 195 },
            fr: { url: '/audio/cimavilla-fr.mp3', durationSec: 205 },
          },
        },
        tags: ['sidra', 'urbano', 'gastronomía', 'arte'],
      },
    ],
    polyline: [
      { lat: 43.3879, lng: -5.3856 }, // Torazu
      { lat: 43.3586, lng: -5.5053 }, // Museo Sidra
      { lat: 43.4021, lng: -5.5674 }, // Narzana
      { lat: 43.4467, lng: -5.4049 }, // Valdediós
      { lat: 43.4753, lng: -5.1915 }, // MUJA
      { lat: 43.5225, lng: -5.6394 }, // Laboral
      { lat: 43.5450, lng: -5.6612 }, // Cimavilla
    ],
  },

  {
    id: 'AR-18',
    title: { es: 'Cocina de Paisaje · Llanes', en: 'Landscape Cuisine · Llanes', fr: 'Cuisine de Paysage · Llanes' },
    shortDescription: { es: 'Mar y producto en la costa llanisca', en: 'Sea and produce on the Llanes coast', fr: 'Mer et produit sur la côte de Llanes' },
    coverImage: llastresImg,
    theme: { es: 'Mar y producto', en: 'Sea and produce', fr: 'Mer et produit' },
    categoryIds: ['gastronomy', 'nature'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.420, lng: -4.754 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.415, lng: -4.760 },
      { lat: 43.425, lng: -4.748 },
      { lat: 43.415, lng: -4.760 },
    ],
  },

  {
    id: 'AR-19',
    title: { es: 'Cocina de Paisaje · Picos', en: 'Landscape Cuisine · Picos', fr: 'Cuisine de Paysage · Picos' },
    shortDescription: { es: 'Montaña y tradición en los Picos de Europa', en: 'Mountain and tradition in the Picos de Europa', fr: 'Montagne et tradition dans les Pics d\'Europe' },
    coverImage: picosImg,
    theme: { es: 'Montaña y tradición', en: 'Mountain and tradition', fr: 'Montagne et tradition' },
    categoryIds: ['gastronomy', 'nature', 'adventure'],
    duration: { es: '1-2 días', en: '1-2 days', fr: '1-2 jours' },
    difficulty: 'hard',
    isCircular: false,
    center: { lat: 43.186, lng: -4.832 },
    maxPoints: 10,
    points: [],
    polyline: [
      { lat: 43.180, lng: -4.840 },
      { lat: 43.192, lng: -4.824 },
    ],
  },

  {
    id: 'AR-20',
    title: { es: 'Cocina de Paisaje · Centro', en: 'Landscape Cuisine · Center', fr: 'Cuisine de Paysage · Centre' },
    shortDescription: { es: 'Huerta y mercado en el centro de Asturias', en: 'Orchard and market in central Asturias', fr: 'Verger et marché au centre des Asturies' },
    coverImage: laboralImg,
    theme: { es: 'Huerta y mercado', en: 'Orchard and market', fr: 'Verger et marché' },
    categoryIds: ['gastronomy'],
    duration: { es: '4-5 horas', en: '4-5 hours', fr: '4-5 heures' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.370, lng: -5.850 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.365, lng: -5.855 },
      { lat: 43.375, lng: -5.845 },
      { lat: 43.365, lng: -5.855 },
    ],
  },

  {
    id: 'AR-21',
    title: { es: 'Cocina de Paisaje · Nalón', en: 'Landscape Cuisine · Nalón', fr: 'Cuisine de Paysage · Nalón' },
    shortDescription: { es: 'Río y producto en el valle del Nalón', en: 'River and produce in the Nalón valley', fr: 'Rivière et produit dans la vallée du Nalón' },
    coverImage: laboralImg,
    theme: { es: 'Río y producto', en: 'River and produce', fr: 'Rivière et produit' },
    categoryIds: ['gastronomy', 'nature'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.235, lng: -5.550 },
    maxPoints: 9,
    points: [],
    polyline: [
      { lat: 43.230, lng: -5.560 },
      { lat: 43.240, lng: -5.540 },
    ],
  },

  {
    id: 'AR-22',
    title: { es: 'Cocina de Paisaje · Caudal', en: 'Landscape Cuisine · Caudal', fr: 'Cuisine de Paysage · Caudal' },
    shortDescription: { es: 'Tradición minera y cocina en el valle del Caudal', en: 'Mining tradition and cuisine in the Caudal valley', fr: 'Tradition minière et cuisine dans la vallée du Caudal' },
    coverImage: laboralImg,
    theme: { es: 'Tradición minera y cocina', en: 'Mining tradition and cuisine', fr: 'Tradition minière et cuisine' },
    categoryIds: ['gastronomy', 'heritage'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.190, lng: -5.770 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.185, lng: -5.780 },
      { lat: 43.195, lng: -5.760 },
    ],
  },

  {
    id: 'AR-23',
    title: { es: 'Cocina de Paisaje · Avilés', en: 'Landscape Cuisine · Avilés', fr: 'Cuisine de Paysage · Avilés' },
    shortDescription: { es: 'Ría y producto en la comarca de Avilés', en: 'Estuary and produce in the Avilés area', fr: 'Estuaire et produit dans la région d\'Avilés' },
    coverImage: laboralImg,
    theme: { es: 'Ría y producto', en: 'Estuary and produce', fr: 'Estuaire et produit' },
    categoryIds: ['gastronomy'],
    duration: { es: '4-5 horas', en: '4-5 hours', fr: '4-5 heures' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.555, lng: -5.925 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.550, lng: -5.930 },
      { lat: 43.560, lng: -5.920 },
      { lat: 43.550, lng: -5.930 },
    ],
  },

  {
    id: 'AR-24',
    title: { es: 'Cocina de Paisaje · Occidente', en: 'Landscape Cuisine · West', fr: 'Cuisine de Paysage · Ouest' },
    shortDescription: { es: 'Costa occidental y sus sabores atlánticos', en: 'Western coast and its Atlantic flavors', fr: 'Côte occidentale et ses saveurs atlantiques' },
    coverImage: laboralImg,
    theme: { es: 'Costa occidental', en: 'Western coast', fr: 'Côte occidentale' },
    categoryIds: ['gastronomy', 'nature'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.520, lng: -6.540 },
    maxPoints: 9,
    points: [],
    polyline: [
      { lat: 43.515, lng: -6.550 },
      { lat: 43.525, lng: -6.530 },
    ],
  },

  {
    id: 'AR-25',
    title: { es: 'Cocina de Paisaje · Navia', en: 'Landscape Cuisine · Navia', fr: 'Cuisine de Paysage · Navia' },
    shortDescription: { es: 'Mar y río en la desembocadura del Navia', en: 'Sea and river at the Navia estuary', fr: 'Mer et rivière à l\'embouchure du Navia' },
    coverImage: laboralImg,
    theme: { es: 'Mar y río', en: 'Sea and river', fr: 'Mer et rivière' },
    categoryIds: ['gastronomy', 'nature'],
    duration: { es: '4-5 horas', en: '4-5 hours', fr: '4-5 heures' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.538, lng: -6.720 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.533, lng: -6.730 },
      { lat: 43.543, lng: -6.710 },
    ],
  },

  {
    id: 'AR-26',
    title: { es: 'Cocina de Paisaje · Eo', en: 'Landscape Cuisine · Eo', fr: 'Cuisine de Paysage · Eo' },
    shortDescription: { es: 'Frontera gastronómica entre Asturias y Galicia', en: 'Gastronomic border between Asturias and Galicia', fr: 'Frontière gastronomique entre Asturies et Galice' },
    coverImage: laboralImg,
    theme: { es: 'Frontera gastronómica', en: 'Gastronomic border', fr: 'Frontière gastronomique' },
    categoryIds: ['gastronomy'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: false,
    center: { lat: 43.530, lng: -7.030 },
    maxPoints: 9,
    points: [],
    polyline: [
      { lat: 43.525, lng: -7.040 },
      { lat: 43.535, lng: -7.020 },
    ],
  },

  // =============== AR-16: SOTO DEL BARCO ===============
  {
    id: 'AR-16',
    title: { 
      es: 'Soto del Barco', 
      en: 'Soto del Barco', 
      fr: 'Soto del Barco' 
    },
    shortDescription: { 
      es: 'Historia, mar y patrimonio en la desembocadura del Nalón', 
      en: 'History, sea and heritage at the Nalón estuary', 
      fr: 'Histoire, mer et patrimoine à l\'embouchure du Nalón' 
    },
    fullDescription: {
      es: 'Descubre Soto del Barco, donde el río Nalón encuentra el mar Cantábrico. Fábricas modernistas, tradiciones pesqueras ancestrales como la pesca de la angula, patrimonio militar y vistas espectaculares de la ría.',
      en: 'Discover Soto del Barco, where the Nalón river meets the Cantabrian Sea. Modernist factories, ancestral fishing traditions like elver fishing, military heritage and spectacular estuary views.',
      fr: 'Découvrez Soto del Barco, où le fleuve Nalón rencontre la mer Cantabrique. Usines modernistes, traditions de pêche ancestrales, patrimoine militaire et vues spectaculaires sur l\'estuaire.'
    },
    coverImage: sotoBarcoImg,
    theme: { es: 'Patrimonio costero', en: 'Coastal heritage', fr: 'Patrimoine côtier' },
    categoryIds: ['heritage', 'nature', 'gastronomy'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'easy',
    isCircular: true,
    center: { lat: 43.548, lng: -6.065 },
    maxPoints: 9,
    points: [
      // 1) Antigua fábrica de Conservas Lis - AR
      {
        id: 'ar16-conservas-lis',
        order: 1,
        title: { 
          es: 'Antigua Fábrica de Conservas Lis', 
          en: 'Former Lis Canning Factory', 
          fr: 'Ancienne Conserverie Lis' 
        },
        shortDescription: { 
          es: 'Espectacular edificio modernista de principios del siglo XX', 
          en: 'Spectacular modernist building from the early 20th century', 
          fr: 'Spectaculaire bâtiment moderniste du début du XXe siècle' 
        },
        location: { 
          lat: 43.55840, 
          lng: -6.07587, 
          address: 'Av. de los Quebrantos, San Juan de la Arena' 
        },
        coverImage: sotoBarcoImg,
        content: {
          arExperience: {
            launchUrl: 'https://asturias.es/ar/conservas-lis',
            qrValue: 'asturias-inmersivo://ar/conservas-lis',
            iframe3dUrl: 'https://sketchfab.com/models/conservas-lis/embed',
            instructions: {
              es: 'Apunta al edificio para ver su reconstrucción virtual en su época de esplendor',
              en: 'Point at the building to see its virtual reconstruction in its heyday',
              fr: 'Pointez vers le bâtiment pour voir sa reconstruction virtuelle à son apogée'
            }
          },
          audioGuide: {
            es: { url: '/audio/conservas-lis-es.mp3', durationSec: 180 },
            en: { url: '/audio/conservas-lis-en.mp3', durationSec: 175 },
            fr: { url: '/audio/conservas-lis-fr.mp3', durationSec: 185 },
          },
          practicalInfo: {
            schedule: {
              es: 'Exterior visitable 24h (vía pública). Interior: no hay visitas regulares.',
              en: 'Exterior viewable 24h (public road). Interior: no regular visits.',
              fr: 'Extérieur visible 24h (voie publique). Intérieur: pas de visites régulières.'
            },
            prices: {
              es: 'Gratuito (visita exterior)',
              en: 'Free (exterior visit)',
              fr: 'Gratuit (visite extérieure)'
            }
          }
        },
      },
      // 2) Centro de interpretación Puerta del Mar - AR
      {
        id: 'ar16-puerta-mar',
        order: 2,
        title: { 
          es: 'Centro de Interpretación Puerta del Mar', 
          en: 'Puerta del Mar Interpretation Center', 
          fr: 'Centre d\'Interprétation Puerta del Mar' 
        },
        shortDescription: { 
          es: 'La historia marinera de San Juan de la Arena', 
          en: 'The maritime history of San Juan de la Arena', 
          fr: 'L\'histoire maritime de San Juan de la Arena' 
        },
        location: { 
          lat: 43.556984, 
          lng: -6.076402, 
          address: 'Plaza Casimiro Vega, 3, San Juan de la Arena' 
        },
        coverImage: sotoBarcoImg,
        content: {
          arExperience: {
            launchUrl: 'https://asturias.es/ar/puerta-mar',
            qrValue: 'asturias-inmersivo://ar/puerta-mar',
            instructions: {
              es: 'Escanea para explorar la vida marinera tradicional en realidad aumentada',
              en: 'Scan to explore traditional maritime life in augmented reality',
              fr: 'Scannez pour explorer la vie maritime traditionnelle en réalité augmentée'
            }
          },
          audioGuide: {
            es: { url: '/audio/puerta-mar-es.mp3', durationSec: 240 },
            en: { url: '/audio/puerta-mar-en.mp3', durationSec: 235 },
            fr: { url: '/audio/puerta-mar-fr.mp3', durationSec: 250 },
          },
          practicalInfo: {
            phone: '985 58 65 58',
            email: 'turismo@sotodelbarco.com',
            website: 'https://sotodelbarco.com',
            schedule: {
              es: 'Julio–Septiembre: 10:30–14:30 y 16:00–19:00',
              en: 'July–September: 10:30–14:30 and 16:00–19:00',
              fr: 'Juillet–Septembre: 10h30–14h30 et 16h00–19h00'
            },
            prices: {
              es: 'Entrada gratuita',
              en: 'Free admission',
              fr: 'Entrée gratuite'
            }
          }
        },
      },
      // 3) Playa de Los Quebrantos - INFO con imágenes
      {
        id: 'ar16-playa-quebrantos',
        order: 3,
        title: { 
          es: 'Playa de Los Quebrantos', 
          en: 'Los Quebrantos Beach', 
          fr: 'Plage de Los Quebrantos' 
        },
        shortDescription: { 
          es: 'Extensa playa dorada en la desembocadura del Nalón', 
          en: 'Extensive golden beach at the Nalón estuary', 
          fr: 'Vaste plage dorée à l\'embouchure du Nalón' 
        },
        location: { 
          lat: 43.56517, 
          lng: -6.06942 
        },
        coverImage: sotoBarcoImg,
        content: {
          image: { 
            url: sotoBarcoImg,
            caption: {
              es: 'Vista panorámica de la Playa de Los Quebrantos',
              en: 'Panoramic view of Los Quebrantos Beach',
              fr: 'Vue panoramique de la Plage de Los Quebrantos'
            }
          },
          gallery: [
            { url: sotoBarcoImg, caption: { es: 'Atardecer en la playa', en: 'Sunset at the beach', fr: 'Coucher de soleil sur la plage' } },
            { url: sotoBarcoImg, caption: { es: 'Dunas y vegetación', en: 'Dunes and vegetation', fr: 'Dunes et végétation' } },
          ],
          audioGuide: {
            es: { url: '/audio/quebrantos-es.mp3', durationSec: 120 },
            en: { url: '/audio/quebrantos-en.mp3', durationSec: 115 },
          },
          practicalInfo: {
            schedule: {
              es: 'Acceso libre (servicios según temporada)',
              en: 'Free access (services vary by season)',
              fr: 'Accès libre (services selon la saison)'
            },
            prices: {
              es: 'Gratuito',
              en: 'Free',
              fr: 'Gratuit'
            }
          }
        },
      },
      // 4) Pesca de la angula - INFO con video
      {
        id: 'ar16-pesca-angula',
        order: 4,
        title: { 
          es: 'Pesca de la Angula', 
          en: 'Elver Fishing', 
          fr: 'Pêche à la Civelle' 
        },
        shortDescription: { 
          es: 'Tradición pesquera nocturna en el puerto de San Juan', 
          en: 'Night fishing tradition at San Juan port', 
          fr: 'Tradition de pêche nocturne au port de San Juan' 
        },
        location: { 
          lat: 43.55660, 
          lng: -6.07520,
          address: 'Puerto de San Juan de la Arena / Ría del Nalón' 
        },
        coverImage: sotoBarcoImg,
        content: {
          image: { url: sotoBarcoImg },
          video: { 
            url: 'https://www.youtube.com/watch?v=angula-nalon',
            caption: { 
              es: 'Los anguleros del Nalón: una tradición que pervive',
              en: 'The Nalón elver fishermen: a surviving tradition',
              fr: 'Les pêcheurs de civelles du Nalón: une tradition qui perdure'
            }
          },
          audioGuide: {
            es: { url: '/audio/angula-es.mp3', durationSec: 200 },
            en: { url: '/audio/angula-en.mp3', durationSec: 195 },
          },
          practicalInfo: {
            schedule: {
              es: 'Actividad nocturna y estacional (octubre–marzo, según regulación)',
              en: 'Night and seasonal activity (October–March, regulated)',
              fr: 'Activité nocturne et saisonnière (octobre–mars, réglementée)'
            },
            prices: {
              es: 'Actividad profesional (no visitable)',
              en: 'Professional activity (not visitable)',
              fr: 'Activité professionnelle (non visitable)'
            }
          }
        },
      },
      // 5) Casamatas en Ranón - INFO con imágenes
      {
        id: 'ar16-casamatas-ranon',
        order: 5,
        title: { 
          es: 'Arquitectura Militar: Casamatas en Ranón', 
          en: 'Military Architecture: Casemates in Ranón', 
          fr: 'Architecture Militaire: Casemates à Ranón' 
        },
        shortDescription: { 
          es: 'Restos de fortificaciones costeras y trincheras de la Guerra Civil', 
          en: 'Remains of coastal fortifications and Civil War trenches', 
          fr: 'Vestiges de fortifications côtières et tranchées de la Guerre Civile' 
        },
        location: { 
          lat: 43.56975, 
          lng: -6.07896,
          address: 'Mirador de las Trincheras, Ranón' 
        },
        coverImage: sotoBarcoImg,
        content: {
          image: { url: sotoBarcoImg },
          gallery: [
            { url: sotoBarcoImg, caption: { es: 'Casamata de defensa costera', en: 'Coastal defense casemate', fr: 'Casemate de défense côtière' } },
            { url: sotoBarcoImg, caption: { es: 'Trincheras restauradas', en: 'Restored trenches', fr: 'Tranchées restaurées' } },
            { url: sotoBarcoImg, caption: { es: 'Vista desde el mirador', en: 'View from the viewpoint', fr: 'Vue depuis le belvédère' } },
          ],
          audioGuide: {
            es: { url: '/audio/casamatas-es.mp3', durationSec: 180 },
          },
          practicalInfo: {
            schedule: {
              es: 'Acceso libre',
              en: 'Free access',
              fr: 'Accès libre'
            },
            prices: {
              es: 'Gratuito',
              en: 'Free',
              fr: 'Gratuit'
            }
          }
        },
      },
      // 6) Castillo de San Martín - AR
      {
        id: 'ar16-castillo-san-martin',
        order: 6,
        title: { 
          es: 'Castillo de San Martín', 
          en: 'San Martín Castle', 
          fr: 'Château de San Martín' 
        },
        shortDescription: { 
          es: 'Restos medievales con vistas a la ría del Nalón', 
          en: 'Medieval remains overlooking the Nalón estuary', 
          fr: 'Vestiges médiévaux surplombant l\'estuaire du Nalón' 
        },
        location: { 
          lat: 43.54192, 
          lng: -6.07508 
        },
        coverImage: sotoBarcoImg,
        content: {
          arExperience: {
            launchUrl: 'https://asturias.es/ar/castillo-san-martin',
            qrValue: 'asturias-inmersivo://ar/castillo-san-martin',
            iframe3dUrl: 'https://sketchfab.com/models/castillo-san-martin/embed',
            instructions: {
              es: 'Reconstrucción virtual del castillo medieval en su época de esplendor',
              en: 'Virtual reconstruction of the medieval castle in its heyday',
              fr: 'Reconstruction virtuelle du château médiéval à son apogée'
            }
          },
          audioGuide: {
            es: { url: '/audio/castillo-martin-es.mp3', durationSec: 160 },
            en: { url: '/audio/castillo-martin-en.mp3', durationSec: 155 },
          },
          practicalInfo: {
            schedule: {
              es: 'Acceso libre (exterior/entorno)',
              en: 'Free access (exterior/surroundings)',
              fr: 'Accès libre (extérieur/environs)'
            },
            prices: {
              es: 'Gratuito',
              en: 'Free',
              fr: 'Gratuit'
            }
          }
        },
      },
      // 7) Vista de la ría del Nalón - INFO con imágenes
      {
        id: 'ar16-mirador-pozaco',
        order: 7,
        title: { 
          es: 'Mirador Punta de El Pozaco', 
          en: 'El Pozaco Point Viewpoint', 
          fr: 'Belvédère Punta de El Pozaco' 
        },
        shortDescription: { 
          es: 'Vistas espectaculares de la desembocadura del Nalón', 
          en: 'Spectacular views of the Nalón estuary', 
          fr: 'Vues spectaculaires sur l\'embouchure du Nalón' 
        },
        location: { 
          lat: 43.56610, 
          lng: -6.06278 
        },
        coverImage: sotoBarcoImg,
        content: {
          image: { 
            url: sotoBarcoImg,
            caption: {
              es: 'La ría del Nalón desde El Pozaco',
              en: 'The Nalón estuary from El Pozaco',
              fr: 'L\'estuaire du Nalón depuis El Pozaco'
            }
          },
          gallery: [
            { url: sotoBarcoImg, caption: { es: 'Atardecer sobre la ría', en: 'Sunset over the estuary', fr: 'Coucher de soleil sur l\'estuaire' } },
            { url: sotoBarcoImg, caption: { es: 'Puerto de San Juan', en: 'San Juan Port', fr: 'Port de San Juan' } },
          ],
          practicalInfo: {
            schedule: {
              es: 'Acceso libre',
              en: 'Free access',
              fr: 'Accès libre'
            },
            prices: {
              es: 'Gratuito',
              en: 'Free',
              fr: 'Gratuit'
            }
          }
        },
      },
      // 8) Teatro Clarín - AR
      {
        id: 'ar16-teatro-clarin',
        order: 8,
        title: { 
          es: 'Teatro Clarín', 
          en: 'Clarín Theatre', 
          fr: 'Théâtre Clarín' 
        },
        shortDescription: { 
          es: 'Centro cultural emblemático de Soto del Barco', 
          en: 'Emblematic cultural center of Soto del Barco', 
          fr: 'Centre culturel emblématique de Soto del Barco' 
        },
        location: { 
          lat: 43.53110, 
          lng: -6.07268,
          address: 'Plaza Herminio de la Noval, 2, Soto del Barco' 
        },
        coverImage: sotoBarcoImg,
        content: {
          arExperience: {
            launchUrl: 'https://asturias.es/ar/teatro-clarin',
            qrValue: 'asturias-inmersivo://ar/teatro-clarin',
            instructions: {
              es: 'Descubre la historia del teatro y sus personajes ilustres en realidad aumentada',
              en: 'Discover the history of the theatre and its illustrious characters in AR',
              fr: 'Découvrez l\'histoire du théâtre et ses personnages illustres en RA'
            }
          },
          audioGuide: {
            es: { url: '/audio/teatro-clarin-es.mp3', durationSec: 200 },
            en: { url: '/audio/teatro-clarin-en.mp3', durationSec: 195 },
          },
          practicalInfo: {
            phone: '985 58 85 94',
            schedule: {
              es: 'Según programación (taquilla/funciones)',
              en: 'According to programming (box office/shows)',
              fr: 'Selon la programmation (guichet/spectacles)'
            },
            prices: {
              es: 'Según evento',
              en: 'Depends on event',
              fr: 'Selon l\'événement'
            }
          }
        },
      },
      // 9) La Ferrería - INFO
      {
        id: 'ar16-la-ferreria',
        order: 9,
        title: { 
          es: 'La Ferrería', 
          en: 'La Ferrería', 
          fr: 'La Ferrería' 
        },
        shortDescription: { 
          es: 'Pintoresca aldea tradicional asturiana', 
          en: 'Picturesque traditional Asturian village', 
          fr: 'Pittoresque village traditionnel asturien' 
        },
        location: { 
          lat: 43.52713, 
          lng: -6.03462,
          address: 'La Ferrería, Soto del Barco' 
        },
        coverImage: sotoBarcoImg,
        content: {
          image: { url: sotoBarcoImg },
          audioGuide: {
            es: { url: '/audio/ferreria-es.mp3', durationSec: 140 },
          },
          practicalInfo: {
            schedule: {
              es: 'Acceso libre',
              en: 'Free access',
              fr: 'Accès libre'
            },
            prices: {
              es: 'Gratuito',
              en: 'Free',
              fr: 'Gratuit'
            }
          }
        },
      },
    ],
    polyline: [
      { lat: 43.55840, lng: -6.07587 },
      { lat: 43.556984, lng: -6.076402 },
      { lat: 43.56517, lng: -6.06942 },
      { lat: 43.55660, lng: -6.07520 },
      { lat: 43.56975, lng: -6.07896 },
      { lat: 43.54192, lng: -6.07508 },
      { lat: 43.56610, lng: -6.06278 },
      { lat: 43.53110, lng: -6.07268 },
      { lat: 43.52713, lng: -6.03462 },
      { lat: 43.55840, lng: -6.07587 }, // Circular - vuelve al inicio
    ],
  },
];

// ============ HELPER FUNCTIONS ============

export const getImmersiveRouteById = (id: string): ImmersiveRoute | undefined => 
  immersiveRoutes.find(r => r.id === id);

export const getRoutePointById = (routeId: string, pointId: string): RoutePoint | undefined => {
  const route = getImmersiveRouteById(routeId);
  return route?.points.find(p => p.id === pointId);
};

export const getRoutesbyCategory = (categoryId: string): ImmersiveRoute[] =>
  immersiveRoutes.filter(r => r.categoryIds.includes(categoryId));

export const getRoutesByTheme = (theme: string): ImmersiveRoute[] =>
  immersiveRoutes.filter(r => 
    r.theme.es.toLowerCase().includes(theme.toLowerCase()) ||
    r.theme.en.toLowerCase().includes(theme.toLowerCase())
  );
