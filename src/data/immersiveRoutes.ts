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

// ============ TIPOS ============

export type Language = 'es' | 'en' | 'fr';

// Contenido multimedia flexible para cada punto
export interface RoutePointContent {
  image?: { url: string; caption?: Record<Language, string> };
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
    center: { lat: 43.245, lng: -5.663 },
    maxPoints: 10,
    points: [
      {
        id: 'ar2-mumi',
        order: 1,
        title: { es: 'MUMI', en: 'MUMI', fr: 'MUMI' },
        shortDescription: { es: 'Museo de la Minería y la Industria', en: 'Mining and Industry Museum', fr: 'Musée de la Mine et de l\'Industrie' },
        location: { lat: 43.243, lng: -5.665 },
        coverImage: mumiImg,
        content: {
          image: { url: mumiImg },
          tour360: { iframe360Url: 'https://kuula.co/share/mumi', allowFullscreen: true },
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
    center: { lat: 43.3933, lng: -5.9544 },
    maxPoints: 8,
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
          lat: 43.3933, 
          lng: -5.9544,
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
            launchUrl: 'https://asturias-inmersivo.app/ar/termas-valduno',
            qrValue: 'https://asturias-inmersivo.app/ar/termas-valduno',
            iframe3dUrl: 'https://sketchfab.com/models/termas-valduno/embed?autostart=1&ui_theme=dark',
            instructions: {
              es: 'Apunta tu dispositivo hacia los restos arqueológicos para ver la reconstrucción 3D de las termas. Podrás explorar el Caldarium (sala caliente), el Tepidarium (sala templada) y el sistema de calefacción por hipocausto.',
              en: 'Point your device at the archaeological remains to see the 3D reconstruction of the baths. You can explore the Caldarium (hot room), Tepidarium (warm room) and the hypocaust heating system.',
              fr: 'Pointez votre appareil vers les vestiges archéologiques pour voir la reconstruction 3D des thermes. Vous pourrez explorer le Caldarium (salle chaude), le Tepidarium (salle tiède) et le système de chauffage par hypocauste.'
            }
          },
        },
        tags: ['romano', 'termas', 'arqueología', 'AR'],
      },
    ],
    polyline: [
      { lat: 43.3933, lng: -5.9544 },
      { lat: 43.400, lng: -5.960 },
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
    title: { es: 'Cocina de Paisaje · Oriente', en: 'Landscape Cuisine · East', fr: 'Cuisine de Paysage · Est' },
    shortDescription: { es: 'Gastronomía y territorio en el oriente asturiano', en: 'Gastronomy and territory in eastern Asturias', fr: 'Gastronomie et territoire dans l\'est des Asturies' },
    coverImage: covadongaImg,
    theme: { es: 'Gastronomía y territorio', en: 'Gastronomy and territory', fr: 'Gastronomie et territoire' },
    categoryIds: ['gastronomy', 'nature'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'medium',
    isCircular: false,
    center: { lat: 43.358, lng: -4.840 },
    maxPoints: 9,
    points: [],
    polyline: [
      { lat: 43.350, lng: -4.850 },
      { lat: 43.366, lng: -4.830 },
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

  {
    id: 'AR-27',
    title: { es: 'Cocina de Paisaje · Somiedo', en: 'Landscape Cuisine · Somiedo', fr: 'Cuisine de Paysage · Somiedo' },
    shortDescription: { es: 'Alta montaña y productos de la Reserva de la Biosfera', en: 'High mountain and products from the Biosphere Reserve', fr: 'Haute montagne et produits de la Réserve de Biosphère' },
    coverImage: picosImg,
    theme: { es: 'Alta montaña', en: 'High mountain', fr: 'Haute montagne' },
    categoryIds: ['gastronomy', 'nature', 'adventure'],
    duration: { es: '1-2 días', en: '1-2 days', fr: '1-2 jours' },
    difficulty: 'hard',
    isCircular: false,
    center: { lat: 43.057, lng: -6.250 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.050, lng: -6.260 },
      { lat: 43.064, lng: -6.240 },
    ],
  },

  {
    id: 'AR-28',
    title: { es: 'Cocina de Paisaje · Tineo', en: 'Landscape Cuisine · Tineo', fr: 'Cuisine de Paysage · Tineo' },
    shortDescription: { es: 'Territorio rural y productos de la tierra', en: 'Rural territory and local products', fr: 'Territoire rural et produits du terroir' },
    coverImage: laboralImg,
    theme: { es: 'Territorio rural', en: 'Rural territory', fr: 'Territoire rural' },
    categoryIds: ['gastronomy'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'medium',
    isCircular: false,
    center: { lat: 43.335, lng: -6.414 },
    maxPoints: 9,
    points: [],
    polyline: [
      { lat: 43.330, lng: -6.420 },
      { lat: 43.340, lng: -6.408 },
    ],
  },

  {
    id: 'AR-29',
    title: { es: 'Cocina de Paisaje · Allande', en: 'Landscape Cuisine · Allande', fr: 'Cuisine de Paysage · Allande' },
    shortDescription: { es: 'Paisaje y producto en el corazón del suroccidente', en: 'Landscape and product in the heart of the southwest', fr: 'Paysage et produit au cœur du sud-ouest' },
    coverImage: laboralImg,
    theme: { es: 'Paisaje y producto', en: 'Landscape and product', fr: 'Paysage et produit' },
    categoryIds: ['gastronomy', 'nature'],
    duration: { es: '1 día', en: '1 day', fr: '1 jour' },
    difficulty: 'medium',
    isCircular: false,
    center: { lat: 43.259, lng: -6.604 },
    maxPoints: 8,
    points: [],
    polyline: [
      { lat: 43.254, lng: -6.610 },
      { lat: 43.264, lng: -6.598 },
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
