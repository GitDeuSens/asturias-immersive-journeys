// Asturias Inmersivo - Mock Data Model
// Ready for backend integration

import covadongaImg from '@/assets/covadonga.jpg';
import caresImg from '@/assets/cares.jpg';
import horreoImg from '@/assets/horreo.jpg';
import picosImg from '@/assets/picos.jpg';
import preromanicoImg from '@/assets/preromanico.jpg';
import rutaSidraImg from '@/assets/ruta-sidra-cover.jpg';

// ============ TIPOS BASE ============

export type ExperienceType = 'AR' | '360' | 'INFO';
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

export const categories: Category[] = [
  { id: 'nature', label: { es: 'Naturaleza', en: 'Nature', fr: 'Nature' }, icon: 'Mountain', color: 'emerald' },
  { id: 'heritage', label: { es: 'Patrimonio', en: 'Heritage', fr: 'Patrimoine' }, icon: 'Landmark', color: 'amber' },
  { id: 'adventure', label: { es: 'Aventura', en: 'Adventure', fr: 'Aventure' }, icon: 'Compass', color: 'sky' },
  { id: 'gastronomy', label: { es: 'Gastronomía', en: 'Gastronomy', fr: 'Gastronomie' }, icon: 'UtensilsCrossed', color: 'rose' },
  { id: 'culture', label: { es: 'Cultura', en: 'Culture', fr: 'Culture' }, icon: 'BookOpen', color: 'violet' },
];

// ============ POI INTERFACE COMPLETA ============

export interface POI {
  // Base (obligatorio)
  id: string;
  title: Record<string, string>;
  categoryIds: string[];
  tags?: string[];
  experienceType: ExperienceType;
  shortDescription: Record<string, string>;
  
  // Contenido modular
  richText: { blocks: RichTextBlock[] };
  
  // Audioguías
  audioGuides: {
    es?: AudioGuide;
    en?: AudioGuide;
    fr?: AudioGuide;
  };
  
  // Acceso/ubicación
  access: {
    address: string;
    lat: number;
    lng: number;
    howToGet?: Record<string, string>;
    accessibility?: Record<string, string>;
    parking?: Record<string, string>;
  };
  
  // Media
  media: {
    heroImageUrl?: string;
    images: { url: string; caption?: Record<string, string> }[];
    videos?: { url: string; caption?: Record<string, string> }[];
  };
  
  // Info práctica
  practical: {
    openingHours?: Record<string, string>;
    prices?: Record<string, string>;
    recommendedDuration?: Record<string, string>;
  };
  
  // Contacto
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // Enlaces externos
  links: { label: Record<string, string>; url: string }[];
  
  // Compartir
  share: { shareUrl: string };
  
  // === ESPECÍFICO AR ===
  ar?: {
    launchUrl: string;
    qrValue: string;
    iframe3dUrl: string;
    instructions?: Record<string, string>;
    compatibilityNote?: Record<string, string>;
  };
  
  // === ESPECÍFICO 360 ===
  tour360?: {
    iframe360Url: string;
    scenes?: { id: string; title: Record<string, string> }[];
    allowFullscreen: boolean;
  };
  
  // === ESPECÍFICO INFO ===
  info?: {
    didYouKnow?: Record<string, string>;
  };
}

// ============ MOCK POIs ============

export const pois: POI[] = [
  // ========== POI AR: COVADONGA ==========
  {
    id: 'covadonga',
    title: { es: 'Lagos de Covadonga', en: 'Lakes of Covadonga', fr: 'Lacs de Covadonga' },
    categoryIds: ['nature', 'adventure'],
    tags: ['lagos', 'montaña', 'picos', 'glaciar'],
    experienceType: 'AR',
    shortDescription: {
      es: 'Lagos glaciares entre cumbres míticas',
      en: 'Glacial lakes among mythical peaks',
      fr: 'Lacs glaciaires parmi les sommets mythiques'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'Los Lagos de Covadonga, Enol y Ercina, son dos lagos de origen glaciar situados en el macizo occidental de los Picos de Europa, a más de 1.000 metros de altitud.',
            en: 'The Lakes of Covadonga, Enol and Ercina, are two glacial lakes located in the western massif of the Picos de Europa, at over 1,000 meters altitude.',
            fr: 'Les Lacs de Covadonga, Enol et Ercina, sont deux lacs d\'origine glaciaire situés dans le massif occidental des Pics d\'Europe, à plus de 1 000 mètres d\'altitude.'
          }
        },
        {
          type: 'highlight',
          title: {
            es: 'Fauna protegida',
            en: 'Protected wildlife',
            fr: 'Faune protégée'
          },
          text: {
            es: 'Hogar del rebeco cantábrico, el urogallo y el águila real. Zona de especial protección dentro del Parque Nacional.',
            en: 'Home to the Cantabrian chamois, capercaillie and golden eagle. Special protection zone within the National Park.',
            fr: 'Habitat du chamois cantabrique, du grand tétras et de l\'aigle royal. Zone de protection spéciale au sein du Parc National.'
          }
        },
        {
          type: 'bullets',
          items: [
            { es: 'Lago Enol: 1.070 m de altitud', en: 'Lake Enol: 1,070 m altitude', fr: 'Lac Enol: 1 070 m d\'altitude' },
            { es: 'Lago Ercina: 1.108 m de altitud', en: 'Lake Ercina: 1,108 m altitude', fr: 'Lac Ercina: 1 108 m d\'altitude' },
            { es: 'Senderos señalizados para todos los niveles', en: 'Marked trails for all levels', fr: 'Sentiers balisés pour tous les niveaux' }
          ]
        }
      ]
    },
    audioGuides: {
      es: { url: '/audio/covadonga-es.mp3', durationSec: 180 },
      en: { url: '/audio/covadonga-en.mp3', durationSec: 175 },
      fr: { url: '/audio/covadonga-fr.mp3', durationSec: 185 }
    },
    access: {
      address: 'Lagos de Covadonga, Cangas de Onís, Asturias',
      lat: 43.2704,
      lng: -4.9856,
      howToGet: {
        es: 'Desde Cangas de Onís, tomar la AS-262 hasta los lagos (12 km). En verano, acceso regulado con autobús lanzadera.',
        en: 'From Cangas de Onís, take AS-262 to the lakes (12 km). In summer, regulated access with shuttle bus.',
        fr: 'Depuis Cangas de Onís, prendre l\'AS-262 jusqu\'aux lacs (12 km). En été, accès réglementé avec navette.'
      },
      accessibility: {
        es: 'Mirador adaptado junto al Lago Enol. Sendero accesible de 500m.',
        en: 'Adapted viewpoint by Lake Enol. Accessible 500m trail.',
        fr: 'Belvédère adapté près du Lac Enol. Sentier accessible de 500m.'
      },
      parking: {
        es: 'Parking gratuito junto al Centro de Visitantes (200 plazas). En temporada alta, usar lanzadera desde Covadonga.',
        en: 'Free parking by the Visitor Center (200 spaces). In peak season, use shuttle from Covadonga.',
        fr: 'Parking gratuit près du Centre des Visiteurs (200 places). En haute saison, utiliser la navette depuis Covadonga.'
      }
    },
    media: {
      heroImageUrl: covadongaImg,
      images: [
        { url: covadongaImg, caption: { es: 'Vista panorámica del Lago Enol', en: 'Panoramic view of Lake Enol', fr: 'Vue panoramique du Lac Enol' } },
        { url: picosImg, caption: { es: 'Picos de Europa al atardecer', en: 'Peaks of Europe at sunset', fr: 'Pics d\'Europe au coucher du soleil' } }
      ]
    },
    practical: {
      openingHours: {
        es: 'Acceso libre 24h. Centro de Visitantes: 9:00-18:00 (invierno) / 9:00-20:00 (verano)',
        en: 'Free access 24h. Visitor Center: 9:00-18:00 (winter) / 9:00-20:00 (summer)',
        fr: 'Accès libre 24h. Centre des Visiteurs: 9h-18h (hiver) / 9h-20h (été)'
      },
      prices: {
        es: 'Entrada gratuita. Autobús lanzadera: 9€ ida/vuelta',
        en: 'Free entry. Shuttle bus: €9 round trip',
        fr: 'Entrée gratuite. Navette: 9€ aller-retour'
      },
      recommendedDuration: {
        es: '2-4 horas',
        en: '2-4 hours',
        fr: '2-4 heures'
      }
    },
    contact: {
      phone: '+34 985 84 86 14',
      email: 'info@parquenacionalpicoseuropa.es',
      website: 'https://parquenacionalpicoseuropa.es'
    },
    links: [
      { label: { es: 'Web del Parque Nacional', en: 'National Park Website', fr: 'Site du Parc National' }, url: 'https://parquenacionalpicoseuropa.es' },
      { label: { es: 'Horarios lanzadera', en: 'Shuttle schedules', fr: 'Horaires navette' }, url: 'https://alsa.es/covadonga' }
    ],
    share: { shareUrl: 'https://asturias.es/covadonga' },
    ar: {
      launchUrl: 'https://asturias.es/ar/covadonga',
      qrValue: 'https://asturias.es/ar/covadonga',
      iframe3dUrl: 'https://sketchfab.com/models/dGVzdC1tb2RlbA/embed?autostart=1&ui_theme=dark',
      instructions: {
        es: '• Apunta tu móvil al lago para ver la fauna\n• Toca los animales para conocer más\n• Activa el sonido para la experiencia completa',
        en: '• Point your phone at the lake to see wildlife\n• Tap animals to learn more\n• Enable sound for the full experience',
        fr: '• Pointez votre téléphone vers le lac pour voir la faune\n• Touchez les animaux pour en savoir plus\n• Activez le son pour l\'expérience complète'
      },
      compatibilityNote: {
        es: 'Recomendado en dispositivos móviles con ARCore/ARKit',
        en: 'Recommended on mobile devices with ARCore/ARKit',
        fr: 'Recommandé sur appareils mobiles avec ARCore/ARKit'
      }
    }
  },

  // ========== POI 360: RUTA DEL CARES ==========
  {
    id: 'cares',
    title: { es: 'Ruta del Cares', en: 'Cares Trail', fr: 'Sentier du Cares' },
    categoryIds: ['nature', 'adventure'],
    tags: ['senderismo', 'garganta', 'río', 'montaña'],
    experienceType: '360',
    shortDescription: {
      es: 'La garganta divina entre León y Asturias',
      en: 'The divine gorge between León and Asturias',
      fr: 'La gorge divine entre León et Asturies'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'Conocida como "La Garganta Divina", la Ruta del Cares es una de las sendas más espectaculares de Europa. Excavada en la roca a lo largo de 12 km, sigue el curso del río Cares entre acantilados de más de 1.000 metros.',
            en: 'Known as "The Divine Gorge", the Cares Trail is one of Europe\'s most spectacular paths. Carved into the rock for 12 km, it follows the Cares river between cliffs over 1,000 meters high.',
            fr: 'Connue comme "La Gorge Divine", le Sentier du Cares est l\'un des chemins les plus spectaculaires d\'Europe. Taillé dans la roche sur 12 km, il suit le cours de la rivière Cares entre des falaises de plus de 1 000 mètres.'
          }
        },
        {
          type: 'quote',
          text: {
            es: 'Un camino entre cielo y abismo, donde el agua ha esculpido una obra maestra.',
            en: 'A path between sky and abyss, where water has sculpted a masterpiece.',
            fr: 'Un chemin entre ciel et abîme, où l\'eau a sculpté un chef-d\'œuvre.'
          }
        },
        {
          type: 'bullets',
          items: [
            { es: 'Distancia: 12 km (solo ida)', en: 'Distance: 12 km (one way)', fr: 'Distance: 12 km (aller simple)' },
            { es: 'Desnivel: 200 m', en: 'Elevation gain: 200 m', fr: 'Dénivelé: 200 m' },
            { es: 'Dificultad: Fácil-Media', en: 'Difficulty: Easy-Medium', fr: 'Difficulté: Facile-Moyenne' },
            { es: 'Llevar agua y calzado adecuado', en: 'Bring water and proper footwear', fr: 'Apporter de l\'eau et des chaussures adaptées' }
          ]
        }
      ]
    },
    audioGuides: {
      es: { url: '/audio/cares-es.mp3', durationSec: 240 },
      en: { url: '/audio/cares-en.mp3', durationSec: 235 }
    },
    access: {
      address: 'Poncebos, Cabrales, Asturias',
      lat: 43.2477,
      lng: -4.8433,
      howToGet: {
        es: 'Inicio en Poncebos (Asturias) o Caín (León). Desde Arenas de Cabrales, 6 km hasta Poncebos.',
        en: 'Start at Poncebos (Asturias) or Caín (León). From Arenas de Cabrales, 6 km to Poncebos.',
        fr: 'Départ à Poncebos (Asturies) ou Caín (León). Depuis Arenas de Cabrales, 6 km jusqu\'à Poncebos.'
      },
      accessibility: {
        es: 'Ruta no adaptada. Tramos estrechos con precipicio. No apta para sillas de ruedas.',
        en: 'Trail not adapted. Narrow sections with precipice. Not suitable for wheelchairs.',
        fr: 'Sentier non adapté. Tronçons étroits avec précipice. Non adapté aux fauteuils roulants.'
      },
      parking: {
        es: 'Parking en Poncebos (100 plazas, gratuito). Llegar temprano en temporada alta.',
        en: 'Parking in Poncebos (100 spaces, free). Arrive early in peak season.',
        fr: 'Parking à Poncebos (100 places, gratuit). Arriver tôt en haute saison.'
      }
    },
    media: {
      heroImageUrl: caresImg,
      images: [
        { url: caresImg, caption: { es: 'El sendero excavado en la roca', en: 'The trail carved into rock', fr: 'Le sentier taillé dans la roche' } },
        { url: picosImg, caption: { es: 'Vistas desde el camino', en: 'Views from the trail', fr: 'Vues depuis le chemin' } }
      ]
    },
    practical: {
      openingHours: {
        es: 'Acceso libre todo el año. Precaución en invierno por hielo.',
        en: 'Free access year-round. Caution in winter due to ice.',
        fr: 'Accès libre toute l\'année. Prudence en hiver en raison du verglas.'
      },
      recommendedDuration: {
        es: '4-6 horas (ida y vuelta)',
        en: '4-6 hours (round trip)',
        fr: '4-6 heures (aller-retour)'
      }
    },
    contact: {
      phone: '+34 985 84 64 84',
      website: 'https://turismoasturias.es/cares'
    },
    links: [
      { label: { es: 'Mapa del sendero', en: 'Trail map', fr: 'Carte du sentier' }, url: 'https://turismoasturias.es/cares/mapa' }
    ],
    share: { shareUrl: 'https://asturias.es/cares' },
    tour360: {
      iframe360Url: 'https://kuula.co/share/collection/7lHpZ?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
      scenes: [
        { id: 'poncebos', title: { es: 'Inicio en Poncebos', en: 'Start at Poncebos', fr: 'Départ à Poncebos' } },
        { id: 'puente', title: { es: 'Puente colgante', en: 'Suspension bridge', fr: 'Pont suspendu' } },
        { id: 'tunel', title: { es: 'Túneles excavados', en: 'Carved tunnels', fr: 'Tunnels creusés' } },
        { id: 'cain', title: { es: 'Llegada a Caín', en: 'Arrival at Caín', fr: 'Arrivée à Caín' } }
      ],
      allowFullscreen: true
    }
  },

  // ========== POI INFO: HÓRREOS ==========
  {
    id: 'horreo',
    title: { es: 'Hórreos de Espinaréu', en: 'Granaries of Espinaréu', fr: 'Greniers d\'Espinaréu' },
    categoryIds: ['heritage', 'culture'],
    tags: ['etnografía', 'arquitectura', 'tradición', 'rural'],
    experienceType: 'INFO',
    shortDescription: {
      es: 'Conjunto etnográfico único en Europa',
      en: 'Unique ethnographic ensemble in Europe',
      fr: 'Ensemble ethnographique unique en Europe'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'Espinaréu alberga el conjunto de hórreos y paneras más importante de Asturias, con más de 30 construcciones tradicionales datadas entre los siglos XVI y XIX.',
            en: 'Espinaréu houses the most important collection of granaries and paneras in Asturias, with over 30 traditional constructions dating from the 16th to 19th centuries.',
            fr: 'Espinaréu abrite la collection la plus importante de greniers et paneras des Asturies, avec plus de 30 constructions traditionnelles datant du XVIe au XIXe siècle.'
          }
        },
        {
          type: 'highlight',
          title: {
            es: 'Arquitectura única',
            en: 'Unique architecture',
            fr: 'Architecture unique'
          },
          text: {
            es: 'El hórreo asturiano se distingue por sus cuatro pegollos (pilares) y estructura de madera elevada que protege los alimentos de la humedad y los roedores.',
            en: 'The Asturian hórreo is distinguished by its four pegollos (pillars) and raised wooden structure that protects food from humidity and rodents.',
            fr: 'Le hórreo asturien se distingue par ses quatre pegollos (piliers) et sa structure en bois surélevée qui protège les aliments de l\'humidité et des rongeurs.'
          }
        },
        {
          type: 'bullets',
          items: [
            { es: 'Más de 30 hórreos y paneras catalogados', en: 'Over 30 catalogued hórreos and paneras', fr: 'Plus de 30 hórreos et paneras catalogués' },
            { es: 'Algunos con más de 400 años de antigüedad', en: 'Some over 400 years old', fr: 'Certains de plus de 400 ans' },
            { es: 'Visita guiada disponible bajo petición', en: 'Guided tour available upon request', fr: 'Visite guidée disponible sur demande' }
          ]
        },
        {
          type: 'quote',
          text: {
            es: 'El hórreo es la huella de una cultura que supo adaptarse al medio con ingenio y belleza.',
            en: 'The hórreo is the mark of a culture that knew how to adapt to the environment with ingenuity and beauty.',
            fr: 'Le hórreo est la marque d\'une culture qui a su s\'adapter à l\'environnement avec ingéniosité et beauté.'
          },
          author: {
            es: 'Arquitectura Popular Asturiana',
            en: 'Asturian Folk Architecture',
            fr: 'Architecture Populaire Asturienne'
          }
        }
      ]
    },
    audioGuides: {
      es: { url: '/audio/horreo-es.mp3', durationSec: 150 },
      en: { url: '/audio/horreo-en.mp3', durationSec: 145 }
    },
    access: {
      address: 'Espinaréu, Piloña, Asturias',
      lat: 43.3167,
      lng: -5.3333,
      howToGet: {
        es: 'Desde Infiesto, tomar la PI-1 hacia Espinaréu (8 km). Pueblo señalizado.',
        en: 'From Infiesto, take PI-1 towards Espinaréu (8 km). Village is signposted.',
        fr: 'Depuis Infiesto, prendre la PI-1 vers Espinaréu (8 km). Village signalisé.'
      },
      accessibility: {
        es: 'Calles del pueblo transitables. Algunos hórreos con acceso limitado.',
        en: 'Village streets are passable. Some granaries with limited access.',
        fr: 'Rues du village praticables. Certains greniers avec accès limité.'
      },
      parking: {
        es: 'Aparcamiento en la entrada del pueblo (20 plazas, gratuito).',
        en: 'Parking at village entrance (20 spaces, free).',
        fr: 'Parking à l\'entrée du village (20 places, gratuit).'
      }
    },
    media: {
      heroImageUrl: horreoImg,
      images: [
        { url: horreoImg, caption: { es: 'Conjunto de hórreos tradicionales', en: 'Traditional granary ensemble', fr: 'Ensemble de greniers traditionnels' } },
        { url: preromanicoImg, caption: { es: 'Detalle de la arquitectura', en: 'Architectural detail', fr: 'Détail architectural' } }
      ]
    },
    practical: {
      openingHours: {
        es: 'Visita libre exterior 24h. Visitas guiadas: sábados 11:00 (reservar)',
        en: 'Free exterior visit 24h. Guided tours: Saturdays 11:00 (book ahead)',
        fr: 'Visite libre extérieure 24h. Visites guidées: samedis 11h (réserver)'
      },
      prices: {
        es: 'Gratuito. Visita guiada: 5€/persona',
        en: 'Free. Guided tour: €5/person',
        fr: 'Gratuit. Visite guidée: 5€/personne'
      },
      recommendedDuration: {
        es: '45 minutos - 1 hora',
        en: '45 minutes - 1 hour',
        fr: '45 minutes - 1 heure'
      }
    },
    contact: {
      phone: '+34 985 71 00 02',
      email: 'turismo@pilona.es',
      website: 'https://pilona.es/turismo'
    },
    links: [
      { label: { es: 'Turismo de Piloña', en: 'Piloña Tourism', fr: 'Tourisme Piloña' }, url: 'https://pilona.es/turismo' }
    ],
    share: { shareUrl: 'https://asturias.es/horreos' },
    info: {
      didYouKnow: {
        es: 'El hórreo más antiguo documentado en Asturias data del año 1513. ¡Más de 500 años de historia!',
        en: 'The oldest documented hórreo in Asturias dates from 1513. Over 500 years of history!',
        fr: 'Le plus ancien hórreo documenté aux Asturies date de 1513. Plus de 500 ans d\'histoire!'
      }
    }
  },

  // ========== POI AR: PICOS ==========
  {
    id: 'picos',
    title: { es: 'Mirador del Naranjo', en: 'Naranjo Viewpoint', fr: 'Belvédère du Naranjo' },
    categoryIds: ['nature', 'adventure'],
    tags: ['montaña', 'escalada', 'mirador', 'naranjo'],
    experienceType: 'AR',
    shortDescription: {
      es: 'Vista épica del Picu Urriellu',
      en: 'Epic view of Picu Urriellu',
      fr: 'Vue épique du Picu Urriellu'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'El Naranjo de Bulnes (Picu Urriellu) es el símbolo de los Picos de Europa. Con sus 2.519 metros y paredes verticales de 500 metros, es una de las cumbres más emblemáticas del alpinismo español.',
            en: 'The Naranjo de Bulnes (Picu Urriellu) is the symbol of the Picos de Europa. With its 2,519 meters and 500-meter vertical walls, it is one of the most iconic peaks of Spanish mountaineering.',
            fr: 'Le Naranjo de Bulnes (Picu Urriellu) est le symbole des Pics d\'Europe. Avec ses 2 519 mètres et ses parois verticales de 500 mètres, c\'est l\'un des sommets les plus emblématiques de l\'alpinisme espagnol.'
          }
        },
        {
          type: 'highlight',
          title: {
            es: 'Historia del alpinismo',
            en: 'Mountaineering history',
            fr: 'Histoire de l\'alpinisme'
          },
          text: {
            es: 'Primera ascensión en 1904 por Pedro Pidal y el Cainejo. Desde entonces, escenario de las hazañas más memorables del alpinismo español.',
            en: 'First ascent in 1904 by Pedro Pidal and the Cainejo. Since then, the setting for the most memorable feats of Spanish mountaineering.',
            fr: 'Première ascension en 1904 par Pedro Pidal et le Cainejo. Depuis lors, théâtre des exploits les plus mémorables de l\'alpinisme espagnol.'
          }
        }
      ]
    },
    audioGuides: {
      es: { url: '/audio/picos-es.mp3', durationSec: 200 }
    },
    access: {
      address: 'Bulnes, Cabrales, Asturias',
      lat: 43.2194,
      lng: -4.8119,
      howToGet: {
        es: 'Funicular desde Poncebos a Bulnes (7 min). Desde Bulnes, senda hasta el mirador (1h).',
        en: 'Funicular from Poncebos to Bulnes (7 min). From Bulnes, trail to viewpoint (1h).',
        fr: 'Funiculaire de Poncebos à Bulnes (7 min). Depuis Bulnes, sentier jusqu\'au belvédère (1h).'
      },
      accessibility: {
        es: 'Funicular accesible. Sendero no adaptado, pendiente pronunciada.',
        en: 'Funicular accessible. Trail not adapted, steep slope.',
        fr: 'Funiculaire accessible. Sentier non adapté, pente prononcée.'
      },
      parking: {
        es: 'Parking en Poncebos. Funicular imprescindible.',
        en: 'Parking in Poncebos. Funicular required.',
        fr: 'Parking à Poncebos. Funiculaire indispensable.'
      }
    },
    media: {
      heroImageUrl: picosImg,
      images: [
        { url: picosImg, caption: { es: 'El Naranjo de Bulnes', en: 'The Naranjo de Bulnes', fr: 'Le Naranjo de Bulnes' } }
      ]
    },
    practical: {
      openingHours: {
        es: 'Funicular: 10:00-20:00 (verano), 10:00-18:00 (invierno)',
        en: 'Funicular: 10:00-20:00 (summer), 10:00-18:00 (winter)',
        fr: 'Funiculaire: 10h-20h (été), 10h-18h (hiver)'
      },
      prices: {
        es: 'Funicular: 22€ ida/vuelta, 17€ solo ida',
        en: 'Funicular: €22 round trip, €17 one way',
        fr: 'Funiculaire: 22€ aller-retour, 17€ aller simple'
      },
      recommendedDuration: {
        es: '3-4 horas',
        en: '3-4 hours',
        fr: '3-4 heures'
      }
    },
    contact: {
      phone: '+34 985 84 68 09',
      website: 'https://bulnes.es'
    },
    links: [],
    share: { shareUrl: 'https://asturias.es/naranjo' },
    ar: {
      launchUrl: 'https://asturias.es/ar/naranjo',
      qrValue: 'https://asturias.es/ar/naranjo',
      iframe3dUrl: 'https://sketchfab.com/models/bmFyYW5qby1tb2RlbA/embed?autostart=1&ui_theme=dark',
      instructions: {
        es: '• Apunta al Naranjo para ver rutas de escalada\n• Explora la historia de cada vía\n• Descubre quién las conquistó primero',
        en: '• Point at the Naranjo to see climbing routes\n• Explore the history of each route\n• Discover who conquered them first',
        fr: '• Pointez vers le Naranjo pour voir les voies d\'escalade\n• Explorez l\'histoire de chaque voie\n• Découvrez qui les a conquises en premier'
      },
      compatibilityNote: {
        es: 'Mejor experiencia en móvil con ARCore/ARKit',
        en: 'Best experience on mobile with ARCore/ARKit',
        fr: 'Meilleure expérience sur mobile avec ARCore/ARKit'
      }
    }
  },

  // ========== POI 360: PRERROMÁNICO ==========
  {
    id: 'preromanico',
    title: { es: 'Santa María del Naranco', en: 'Santa María del Naranco', fr: 'Santa María del Naranco' },
    categoryIds: ['heritage', 'culture'],
    tags: ['prerrománico', 'unesco', 'arquitectura', 'oviedo'],
    experienceType: '360',
    shortDescription: {
      es: 'Joya del prerrománico asturiano',
      en: 'Jewel of Asturian pre-Romanesque',
      fr: 'Joyau du préroman asturien'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'Construida en el siglo IX como palacio de recreo del rey Ramiro I, Santa María del Naranco es una obra maestra del prerrománico asturiano y Patrimonio de la Humanidad.',
            en: 'Built in the 9th century as a pleasure palace for King Ramiro I, Santa María del Naranco is a masterpiece of Asturian pre-Romanesque and World Heritage Site.',
            fr: 'Construit au IXe siècle comme palais de plaisance du roi Ramiro I, Santa María del Naranco est un chef-d\'œuvre du préroman asturien et Patrimoine mondial.'
          }
        },
        {
          type: 'highlight',
          title: {
            es: 'Patrimonio UNESCO',
            en: 'UNESCO Heritage',
            fr: 'Patrimoine UNESCO'
          },
          text: {
            es: 'Declarado Patrimonio de la Humanidad en 1985, junto a San Miguel de Lillo y Santa Cristina de Lena.',
            en: 'Declared World Heritage Site in 1985, along with San Miguel de Lillo and Santa Cristina de Lena.',
            fr: 'Déclaré Patrimoine mondial en 1985, avec San Miguel de Lillo et Santa Cristina de Lena.'
          }
        }
      ]
    },
    audioGuides: {
      es: { url: '/audio/preromanico-es.mp3', durationSec: 220 },
      en: { url: '/audio/preromanico-en.mp3', durationSec: 215 },
      fr: { url: '/audio/preromanico-fr.mp3', durationSec: 225 }
    },
    access: {
      address: 'Monte Naranco, Oviedo, Asturias',
      lat: 43.3833,
      lng: -5.8667,
      howToGet: {
        es: 'A 3 km del centro de Oviedo. Bus urbano línea A4 hasta la parada "Naranco".',
        en: '3 km from Oviedo center. City bus line A4 to "Naranco" stop.',
        fr: 'À 3 km du centre d\'Oviedo. Bus urbain ligne A4 jusqu\'à l\'arrêt "Naranco".'
      },
      accessibility: {
        es: 'Exterior accesible. Interior con escaleras sin alternativa.',
        en: 'Exterior accessible. Interior has stairs with no alternative.',
        fr: 'Extérieur accessible. Intérieur avec escaliers sans alternative.'
      },
      parking: {
        es: 'Parking gratuito junto al monumento (50 plazas).',
        en: 'Free parking next to the monument (50 spaces).',
        fr: 'Parking gratuit à côté du monument (50 places).'
      }
    },
    media: {
      heroImageUrl: preromanicoImg,
      images: [
        { url: preromanicoImg, caption: { es: 'Fachada principal', en: 'Main facade', fr: 'Façade principale' } },
        { url: horreoImg, caption: { es: 'Detalles escultóricos', en: 'Sculptural details', fr: 'Détails sculpturaux' } }
      ]
    },
    practical: {
      openingHours: {
        es: 'Mar-Sáb: 9:30-13:00 y 15:30-19:00. Dom: 9:30-13:00. Lunes cerrado.',
        en: 'Tue-Sat: 9:30-13:00 and 15:30-19:00. Sun: 9:30-13:00. Monday closed.',
        fr: 'Mar-Sam: 9h30-13h et 15h30-19h. Dim: 9h30-13h. Lundi fermé.'
      },
      prices: {
        es: 'General: 3€. Reducida: 1,50€. Lunes gratuito.',
        en: 'General: €3. Reduced: €1.50. Free on Mondays.',
        fr: 'Général: 3€. Réduit: 1,50€. Gratuit le lundi.'
      },
      recommendedDuration: {
        es: '1-2 horas (incluye San Miguel de Lillo)',
        en: '1-2 hours (includes San Miguel de Lillo)',
        fr: '1-2 heures (inclut San Miguel de Lillo)'
      }
    },
    contact: {
      phone: '+34 985 11 44 30',
      email: 'reservas@preromanico.es',
      website: 'https://preromanico.es'
    },
    links: [
      { label: { es: 'Prerrománico Asturiano', en: 'Asturian Pre-Romanesque', fr: 'Préroman Asturien' }, url: 'https://preromanico.es' },
      { label: { es: 'UNESCO', en: 'UNESCO', fr: 'UNESCO' }, url: 'https://whc.unesco.org/en/list/312' }
    ],
    share: { shareUrl: 'https://asturias.es/preromanico' },
    tour360: {
      iframe360Url: 'https://kuula.co/share/collection/7YHTQ?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
      scenes: [
        { id: 'exterior', title: { es: 'Vista exterior', en: 'Exterior view', fr: 'Vue extérieure' } },
        { id: 'cripta', title: { es: 'Cripta', en: 'Crypt', fr: 'Crypte' } },
        { id: 'salon', title: { es: 'Salón principal', en: 'Main hall', fr: 'Salle principale' } },
        { id: 'mirador', title: { es: 'Mirador', en: 'Viewpoint', fr: 'Belvédère' } }
      ],
      allowFullscreen: true
    }
  },
  // ============ POIs RUTA DE LA SIDRA ============
  {
    id: 'museo-sidra',
    title: { es: 'Museo de la Sidra', en: 'Cider Museum', fr: 'Musée du Cidre' },
    categoryIds: ['gastronomy', 'culture'],
    tags: ['sidra', 'museo', 'nava', 'tradición'],
    experienceType: 'INFO',
    shortDescription: {
      es: 'El templo de la cultura sidrera asturiana',
      en: 'The temple of Asturian cider culture',
      fr: 'Le temple de la culture du cidre asturien'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'El Museo de la Sidra de Asturias, ubicado en Nava, es el centro de referencia para conocer la cultura sidrera declarada Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO.',
            en: 'The Asturias Cider Museum, located in Nava, is the reference center for learning about cider culture, declared Intangible Cultural Heritage of Humanity by UNESCO.',
            fr: 'Le Musée du Cidre des Asturies, situé à Nava, est le centre de référence pour connaître la culture du cidre déclarée Patrimoine Culturel Immatériel de l\'Humanité par l\'UNESCO.'
          }
        },
        {
          type: 'highlight',
          title: { es: 'El arte del escanciado', en: 'The art of pouring', fr: 'L\'art de servir' },
          text: {
            es: 'Aprende la técnica tradicional de escanciar la sidra y descubre los secretos de su elaboración artesanal.',
            en: 'Learn the traditional technique of pouring cider and discover the secrets of its artisanal production.',
            fr: 'Apprenez la technique traditionnelle de servir le cidre et découvrez les secrets de sa production artisanale.'
          }
        }
      ]
    },
    audioGuides: {},
    access: {
      address: 'Plaza Príncipe de Asturias, Nava, Asturias',
      lat: 43.3544,
      lng: -5.5067
    },
    media: {
      images: [{ url: rutaSidraImg }]
    },
    practical: {
      openingHours: { es: 'Martes a Domingo: 11:00 - 14:00 y 16:00 - 19:00', en: 'Tuesday to Sunday: 11:00 - 14:00 and 16:00 - 19:00', fr: 'Mardi à Dimanche: 11:00 - 14:00 et 16:00 - 19:00' },
      recommendedDuration: { es: '1-2 horas', en: '1-2 hours', fr: '1-2 heures' }
    },
    contact: { website: 'https://www.museodelasidra.com' },
    links: [],
    share: { shareUrl: 'https://turismoasturias.es/museo-sidra' }
  },
  {
    id: 'valdedios',
    title: { es: 'Conjunto Monumental de Valdediós', en: 'Valdediós Monumental Complex', fr: 'Ensemble Monumental de Valdediós' },
    categoryIds: ['heritage', 'culture'],
    tags: ['prerrománico', 'monasterio', 'villaviciosa'],
    experienceType: '360',
    shortDescription: {
      es: 'Joya prerrománica en un valle de ensueño',
      en: 'Pre-Romanesque jewel in a dream valley',
      fr: 'Joyau préroman dans une vallée de rêve'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'El Conjunto Monumental de Valdediós alberga la iglesia de San Salvador (conocida como "El Conventín"), del siglo IX, y el Monasterio de Santa María, en un entorno natural de extraordinaria belleza.',
            en: 'The Valdediós Monumental Complex houses the 9th-century church of San Salvador (known as "El Conventín") and the Monastery of Santa María, in a natural setting of extraordinary beauty.',
            fr: 'L\'Ensemble Monumental de Valdediós abrite l\'église de San Salvador (connue comme "El Conventín"), du IXe siècle, et le Monastère de Santa María, dans un cadre naturel d\'une beauté extraordinaire.'
          }
        }
      ]
    },
    audioGuides: {},
    access: {
      address: 'Valdediós, Villaviciosa, Asturias',
      lat: 43.4389,
      lng: -5.5147
    },
    media: {
      images: [{ url: preromanicoImg }]
    },
    practical: {
      recommendedDuration: { es: '1-2 horas', en: '1-2 hours', fr: '1-2 heures' }
    },
    contact: {},
    links: [],
    share: { shareUrl: 'https://turismoasturias.es/valdedios' },
    tour360: {
      iframe360Url: 'https://kuula.co/share/collection/7YHTQ',
      allowFullscreen: true
    }
  },
  {
    id: 'muja',
    title: { es: 'Museo del Jurásico de Asturias', en: 'Jurassic Museum of Asturias', fr: 'Musée du Jurassique des Asturies' },
    categoryIds: ['culture'],
    tags: ['dinosaurios', 'museo', 'colunga', 'paleontología'],
    experienceType: 'AR',
    shortDescription: {
      es: 'Viaje al pasado prehistórico asturiano',
      en: 'Journey to the Asturian prehistoric past',
      fr: 'Voyage dans le passé préhistorique asturien'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'El MUJA es una visita esencial para los amantes de la paleontología, con una colección destacada de dinosaurios y fósiles. Su edificio con forma de huella de dinosaurio alberga réplicas a tamaño real.',
            en: 'MUJA is an essential visit for paleontology lovers, with an outstanding collection of dinosaurs and fossils. Its dinosaur footprint-shaped building houses life-size replicas.',
            fr: 'Le MUJA est une visite incontournable pour les amateurs de paléontologie, avec une collection remarquable de dinosaures et de fossiles. Son bâtiment en forme d\'empreinte de dinosaure abrite des répliques grandeur nature.'
          }
        }
      ]
    },
    audioGuides: {},
    access: {
      address: 'Rasa de San Telmo, Colunga, Asturias',
      lat: 43.4897,
      lng: -5.2706
    },
    media: {
      images: [{ url: rutaSidraImg }]
    },
    practical: {
      recommendedDuration: { es: '2-3 horas', en: '2-3 hours', fr: '2-3 heures' }
    },
    contact: { website: 'https://www.museojurasicoasturias.com' },
    links: [],
    share: { shareUrl: 'https://turismoasturias.es/muja' },
    ar: {
      launchUrl: 'https://muja.ar-experience.com',
      qrValue: 'https://muja.ar-experience.com',
      iframe3dUrl: 'https://sketchfab.com/models/dinosaur/embed'
    }
  },
  {
    id: 'laboral',
    title: { es: 'Laboral Ciudad de la Cultura', en: 'Laboral City of Culture', fr: 'Laboral Cité de la Culture' },
    categoryIds: ['culture', 'heritage'],
    tags: ['arquitectura', 'cultura', 'gijón'],
    experienceType: '360',
    shortDescription: {
      es: 'Imponente complejo arquitectónico y cultural',
      en: 'Impressive architectural and cultural complex',
      fr: 'Impressionnant complexe architectural et culturel'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'Laboral Ciudad de la Cultura es uno de los edificios civiles más grandes de España. Este imponente complejo arquitectónico alberga una vibrante oferta cultural y artística, con teatros, salas de exposiciones y espacios creativos.',
            en: 'Laboral City of Culture is one of the largest civil buildings in Spain. This impressive architectural complex houses a vibrant cultural and artistic offering, with theaters, exhibition halls, and creative spaces.',
            fr: 'Laboral Cité de la Culture est l\'un des plus grands bâtiments civils d\'Espagne. Ce complexe architectural impressionnant abrite une offre culturelle et artistique vibrante, avec des théâtres, des salles d\'exposition et des espaces créatifs.'
          }
        }
      ]
    },
    audioGuides: {},
    access: {
      address: 'Luis Moya Blanco 261, Gijón, Asturias',
      lat: 43.5253,
      lng: -5.6186
    },
    media: {
      images: [{ url: rutaSidraImg }]
    },
    practical: {
      recommendedDuration: { es: '2-3 horas', en: '2-3 hours', fr: '2-3 heures' }
    },
    contact: { website: 'https://www.laboralciudaddelacultura.com' },
    links: [],
    share: { shareUrl: 'https://turismoasturias.es/laboral' },
    tour360: {
      iframe360Url: 'https://kuula.co/share/collection/laboral',
      allowFullscreen: true
    }
  },
  {
    id: 'cimavilla',
    title: { es: 'Barrio de Cimavilla', en: 'Cimavilla Neighborhood', fr: 'Quartier de Cimavilla' },
    categoryIds: ['gastronomy', 'culture'],
    tags: ['sidrerías', 'gijón', 'marinero', 'tapas'],
    experienceType: 'INFO',
    shortDescription: {
      es: 'Laberinto marinero con las mejores sidrerías',
      en: 'Maritime labyrinth with the best cider houses',
      fr: 'Labyrinthe maritime avec les meilleures cidreries'
    },
    richText: {
      blocks: [
        {
          type: 'paragraph',
          text: {
            es: 'Un pintoresco laberinto de calles estrechas, lleno de historia marinera y encanto, donde se mezclan el ambiente bohemio y las vistas al puerto. Sus tradicionales sidrerías son el lugar perfecto para disfrutar de un culín.',
            en: 'A picturesque labyrinth of narrow streets, full of maritime history and charm, where bohemian atmosphere and harbor views blend. Its traditional cider houses are the perfect place to enjoy a culín.',
            fr: 'Un pittoresque labyrinthe de ruelles étroites, plein d\'histoire maritime et de charme, où se mêlent l\'ambiance bohème et les vues sur le port. Ses cidreries traditionnelles sont l\'endroit idéal pour déguster un culín.'
          }
        }
      ]
    },
    audioGuides: {},
    access: {
      address: 'Cimavilla, Gijón, Asturias',
      lat: 43.5456,
      lng: -5.6633
    },
    media: {
      images: [{ url: rutaSidraImg }]
    },
    practical: {
      recommendedDuration: { es: '2-4 horas', en: '2-4 hours', fr: '2-4 heures' }
    },
    contact: {},
    links: [],
    share: { shareUrl: 'https://turismoasturias.es/cimavilla' }
  }
];

// ============ TOURS 360 ============

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

// ============ ROUTES ============

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

export const routes: Route[] = [
  {
    id: 'route-lagos',
    title: { es: 'Ruta de los Lagos', en: 'Lakes Route', fr: 'Route des Lacs' },
    categoryIds: ['nature', 'adventure'],
    isLoop: true,
    poiOrder: ['covadonga', 'picos', 'cares'],
    coverImage: covadongaImg,
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
    coverImage: preromanicoImg,
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
    coverImage: picosImg,
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
  {
    id: 'route-sidra',
    title: { es: 'Ruta de la Sidra', en: 'Cider Route', fr: 'Route du Cidre' },
    categoryIds: ['gastronomy', 'culture', 'heritage'],
    isLoop: false,
    poiOrder: ['museo-sidra', 'valdedios', 'muja', 'laboral', 'cimavilla'],
    coverImage: rutaSidraImg,
    shortDescription: {
      es: 'Cultura sidrera declarada Patrimonio UNESCO',
      en: 'Cider culture declared UNESCO Heritage',
      fr: 'Culture du cidre déclarée Patrimoine UNESCO'
    },
    itineraryDays: [
      { 
        day: 1, 
        title: { es: 'Día 1: Comarca de la Sidra', en: 'Day 1: Cider Region', fr: 'Jour 1: Région du Cidre' }, 
        poiIds: ['museo-sidra'] 
      },
      { 
        day: 2, 
        title: { es: 'Día 2: Villaviciosa', en: 'Day 2: Villaviciosa', fr: 'Jour 2: Villaviciosa' }, 
        poiIds: ['valdedios'] 
      },
      { 
        day: 3, 
        title: { es: 'Día 3: Costa Jurásica', en: 'Day 3: Jurassic Coast', fr: 'Jour 3: Côte Jurassique' }, 
        poiIds: ['muja'] 
      },
      { 
        day: 4, 
        title: { es: 'Día 4: Gijón', en: 'Day 4: Gijón', fr: 'Jour 4: Gijón' }, 
        poiIds: ['laboral', 'cimavilla'] 
      },
    ],
    polyline: [
      { lat: 43.3544, lng: -5.5067 }, // Nava - Museo Sidra
      { lat: 43.4389, lng: -5.5147 }, // Valdediós
      { lat: 43.4897, lng: -5.2706 }, // MUJA Colunga
      { lat: 43.5253, lng: -5.6186 }, // Laboral
      { lat: 43.5456, lng: -5.6633 }, // Cimavilla
    ],
  },
];

// ============ HELPER FUNCTIONS ============

export const getPOIById = (id: string): POI | undefined => pois.find(p => p.id === id);
export const getRouteById = (id: string): Route | undefined => routes.find(r => r.id === id);
export const getTourById = (id: string): Tour360 | undefined => tours360.find(t => t.id === id);
export const getCategoryById = (id: string): Category | undefined => categories.find(c => c.id === id);
