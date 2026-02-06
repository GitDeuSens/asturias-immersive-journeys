import { createDirectus, rest, authentication, createItem, createItems, readItems } from '@directus/sdk';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

// ============================================
// HELPERS
// ============================================

async function login() {
  console.log('🔐 Logging in...');
  await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log('✅ Logged in\n');
}

function getErrorMessage(error) {
  if (error?.errors?.length > 0) {
    return error.errors.map(e => e.message || JSON.stringify(e)).join('; ');
  }
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

// Debug: show full error for first POI/route failure
let debugErrorCount = 0;
function debugError(error) {
  if (debugErrorCount < 2) {
    debugErrorCount++;
    console.error('   [DEBUG FULL ERROR]:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2)?.substring(0, 500));
  }
}

// Recursively add UUIDs to all objects that look like they need one
function addUUIDs(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(item => addUUIDs(item));
  } else if (obj && typeof obj === 'object') {
    // If object has languages_code it's a translation junction row — needs id
    if ('languages_code' in obj && !obj.id) {
      obj.id = randomUUID();
    }
    // Recurse into nested arrays (e.g. translations)
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) addUUIDs(val);
    }
  }
}

async function safeCreate(collection, data, label) {
  try {
    // Ensure UUID id on parent
    if (!data.id) data.id = randomUUID();
    // Ensure UUIDs on nested translation rows
    addUUIDs(data);

    const result = await directus.request(createItem(collection, data));
    console.log(`   ✓ ${label}`);
    return result;
  } catch (error) {
    const msg = getErrorMessage(error);
    if (msg?.includes('unique') || msg?.includes('already exists') || msg?.includes('duplicate')) {
      console.log(`   ⚠ ${label} (already exists)`);
      return null;
    }
    console.error(`   ✗ ${label}: ${msg}`);
    debugError(error);
    return null;
  }
}

async function safeBatchCreate(collection, items, label) {
  try {
    const result = await directus.request(createItems(collection, items));
    console.log(`   ✓ ${label} (${items.length} items)`);
    return result;
  } catch (error) {
    console.error(`   ✗ ${label}: ${error.message}`);
    // Fallback: create one by one
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const r = await safeCreate(collection, items[i], `${label} [${i + 1}/${items.length}]`);
      if (r) results.push(r);
    }
    return results;
  }
}

// Helper to find category ID by slug
const categoryMap = {};
async function getCategoryId(slug) {
  if (categoryMap[slug]) return categoryMap[slug];
  try {
    const cats = await directus.request(readItems('categories', {
      filter: { slug: { _eq: slug } },
      fields: ['id'],
      limit: 1,
    }));
    if (cats.length > 0) {
      categoryMap[slug] = cats[0].id;
      return cats[0].id;
    }
  } catch {}
  return null;
}

// Helper to find route ID by route_code
const routeMap = {};
async function getRouteId(code) {
  if (routeMap[code]) return routeMap[code];
  try {
    const routes = await directus.request(readItems('routes', {
      filter: { route_code: { _eq: code } },
      fields: ['id'],
      limit: 1,
    }));
    if (routes.length > 0) {
      routeMap[code] = routes[0].id;
      return routes[0].id;
    }
  } catch {}
  return null;
}

// ============================================
// 1. CATEGORIES
// ============================================

const CATEGORIES = [
  { slug: 'nature', icon: 'Mountain', color: '#10b981', translations: [
    { languages_code: 'es', name: 'Naturaleza', description: 'Espacios naturales, parques y paisajes' },
    { languages_code: 'en', name: 'Nature', description: 'Natural spaces, parks and landscapes' },
    { languages_code: 'fr', name: 'Nature', description: 'Espaces naturels, parcs et paysages' },
  ]},
  { slug: 'heritage', icon: 'Landmark', color: '#f59e0b', translations: [
    { languages_code: 'es', name: 'Patrimonio', description: 'Monumentos, arquitectura e historia' },
    { languages_code: 'en', name: 'Heritage', description: 'Monuments, architecture and history' },
    { languages_code: 'fr', name: 'Patrimoine', description: 'Monuments, architecture et histoire' },
  ]},
  { slug: 'adventure', icon: 'Compass', color: '#0ea5e9', translations: [
    { languages_code: 'es', name: 'Aventura', description: 'Senderismo, escalada y deportes' },
    { languages_code: 'en', name: 'Adventure', description: 'Hiking, climbing and sports' },
    { languages_code: 'fr', name: 'Aventure', description: 'Randonnée, escalade et sports' },
  ]},
  { slug: 'gastronomy', icon: 'UtensilsCrossed', color: '#f43f5e', translations: [
    { languages_code: 'es', name: 'Gastronomía', description: 'Sidra, quesos, fabada y cocina local' },
    { languages_code: 'en', name: 'Gastronomy', description: 'Cider, cheese, fabada and local cuisine' },
    { languages_code: 'fr', name: 'Gastronomie', description: 'Cidre, fromages, fabada et cuisine locale' },
  ]},
  { slug: 'culture', icon: 'BookOpen', color: '#8b5cf6', translations: [
    { languages_code: 'es', name: 'Cultura', description: 'Museos, arte y tradiciones' },
    { languages_code: 'en', name: 'Culture', description: 'Museums, art and traditions' },
    { languages_code: 'fr', name: 'Culture', description: 'Musées, art et traditions' },
  ]},
];

// ============================================
// 2. TOURS 360°
// ============================================

const TOURS_360 = [
  { slug: 'ecomuseo-samuno', translations: [
    { languages_code: 'es', title: 'Ecomuseo Minero Valle de Samuño', description: 'Tour virtual por las galerías mineras del Ecomuseo' },
    { languages_code: 'en', title: 'Samuño Valley Mining Ecomuseum', description: 'Virtual tour through the Ecomuseum mining galleries' },
    { languages_code: 'fr', title: 'Écomusée Minier Vallée de Samuño', description: 'Visite virtuelle des galeries minières de l\'Écomusée' },
  ]},
  { slug: 'meiq', translations: [
    { languages_code: 'es', title: 'MEIQ – Museo Etnográfico e Industrial de Quirós' },
    { languages_code: 'en', title: 'MEIQ – Quirós Ethnographic & Industrial Museum' },
    { languages_code: 'fr', title: 'MEIQ – Musée Ethnographique et Industriel de Quirós' },
  ]},
  { slug: 'mina-arnao', translations: [
    { languages_code: 'es', title: 'Museo de la Mina de Arnao' },
    { languages_code: 'en', title: 'Arnao Mine Museum' },
    { languages_code: 'fr', title: 'Musée de la Mine d\'Arnao' },
  ]},
  { slug: 'mumi', translations: [
    { languages_code: 'es', title: 'MUMI – Museo de la Minería y la Industria de Asturias' },
    { languages_code: 'en', title: 'MUMI – Asturias Mining & Industry Museum' },
    { languages_code: 'fr', title: 'MUMI – Musée de la Mine et de l\'Industrie des Asturies' },
  ]},
  { slug: 'musi-siderurgia', translations: [
    { languages_code: 'es', title: 'MUSI – Museo de la Siderurgia de Asturias' },
    { languages_code: 'en', title: 'MUSI – Asturias Steelworks Museum' },
    { languages_code: 'fr', title: 'MUSI – Musée de la Sidérurgie des Asturies' },
  ]},
  { slug: 'ferrocarril', translations: [
    { languages_code: 'es', title: 'Museo del Ferrocarril de Asturias' },
    { languages_code: 'en', title: 'Asturias Railway Museum' },
    { languages_code: 'fr', title: 'Musée du Chemin de Fer des Asturies' },
  ]},
  { slug: 'oro', translations: [
    { languages_code: 'es', title: 'Museo del Oro de Asturias' },
    { languages_code: 'en', title: 'Asturias Gold Museum' },
    { languages_code: 'fr', title: 'Musée de l\'Or des Asturies' },
  ]},
  { slug: 'bustiello', translations: [
    { languages_code: 'es', title: 'Poblado Minero de Bustiello' },
    { languages_code: 'en', title: 'Bustiello Mining Village' },
    { languages_code: 'fr', title: 'Village Minier de Bustiello' },
  ]},
  { slug: 'pozo-fondon', translations: [
    { languages_code: 'es', title: 'Pozo Fondón' },
    { languages_code: 'en', title: 'Fondón Mine Shaft' },
    { languages_code: 'fr', title: 'Puits Fondón' },
  ]},
  { slug: 'pozo-santa-barbara', translations: [
    { languages_code: 'es', title: 'Pozo Santa Bárbara' },
    { languages_code: 'en', title: 'Santa Bárbara Mine Shaft' },
    { languages_code: 'fr', title: 'Puits Santa Bárbara' },
  ]},
  { slug: 'pozo-soton', translations: [
    { languages_code: 'es', title: 'Pozo Sotón y CEMM' },
    { languages_code: 'en', title: 'Sotón Shaft & Mining Memory Centre' },
    { languages_code: 'fr', title: 'Puits Sotón et Centre de Mémoire Minière' },
  ]},
];

// ============================================
// 3. POIs (from mockData.ts)
// ============================================

const POIS = [
  {
    slug: 'covadonga',
    experience_type: 'AR',
    lat: 43.2704, lng: -4.9856,
    address: 'Lagos de Covadonga, Cangas de Onís, Asturias',
    phone: '+34 985 84 86 14',
    email: 'info@parquenacionalpicoseuropa.es',
    website: 'https://parquenacionalpicoseuropa.es',
    share_url: 'https://asturias.es/covadonga',
    tags: ['lagos', 'montaña', 'picos', 'glaciar'],
    rich_text: { blocks: [
      { type: 'paragraph', text: { es: 'Los Lagos de Covadonga, Enol y Ercina, son dos lagos de origen glaciar situados en el macizo occidental de los Picos de Europa, a más de 1.000 metros de altitud.', en: 'The Lakes of Covadonga, Enol and Ercina, are two glacial lakes located in the western massif of the Picos de Europa, at over 1,000 meters altitude.', fr: 'Les Lacs de Covadonga, Enol et Ercina, sont deux lacs d\'origine glaciaire situés dans le massif occidental des Pics d\'Europe, à plus de 1 000 mètres d\'altitude.' } },
      { type: 'highlight', title: { es: 'Fauna protegida', en: 'Protected wildlife', fr: 'Faune protégée' }, text: { es: 'Hogar del rebeco cantábrico, el urogallo y el águila real.', en: 'Home to the Cantabrian chamois, capercaillie and golden eagle.', fr: 'Habitat du chamois cantabrique, du grand tétras et de l\'aigle royal.' } },
    ]},
    external_links: [
      { label: { es: 'Web del Parque Nacional', en: 'National Park Website', fr: 'Site du Parc National' }, url: 'https://parquenacionalpicoseuropa.es' },
    ],
    categoryIds: ['nature', 'adventure'],
    translations: [
      { languages_code: 'es', title: 'Lagos de Covadonga', short_description: 'Lagos glaciares entre cumbres míticas', description: 'Los Lagos de Covadonga, Enol y Ercina, son dos lagos de origen glaciar situados en el macizo occidental de los Picos de Europa.', how_to_get: 'Desde Cangas de Onís, tomar la AS-262 hasta los lagos (12 km). En verano, acceso regulado con autobús lanzadera.', accessibility: 'Mirador adaptado junto al Lago Enol. Sendero accesible de 500m.', parking: 'Parking gratuito junto al Centro de Visitantes (200 plazas).', opening_hours: 'Acceso libre 24h. Centro de Visitantes: 9:00-18:00 (invierno) / 9:00-20:00 (verano)', prices: 'Entrada gratuita. Autobús lanzadera: 9€ ida/vuelta', recommended_duration: '2-4 horas' },
      { languages_code: 'en', title: 'Lakes of Covadonga', short_description: 'Glacial lakes among mythical peaks', description: 'The Lakes of Covadonga, Enol and Ercina, are two glacial lakes located in the western massif of the Picos de Europa.', how_to_get: 'From Cangas de Onís, take AS-262 to the lakes (12 km). In summer, regulated access with shuttle bus.', accessibility: 'Adapted viewpoint by Lake Enol. Accessible 500m trail.', parking: 'Free parking by the Visitor Center (200 spaces).', opening_hours: 'Free access 24h. Visitor Center: 9:00-18:00 (winter) / 9:00-20:00 (summer)', prices: 'Free entry. Shuttle bus: €9 round trip', recommended_duration: '2-4 hours' },
      { languages_code: 'fr', title: 'Lacs de Covadonga', short_description: 'Lacs glaciaires parmi les sommets mythiques', description: 'Les Lacs de Covadonga, Enol et Ercina, sont deux lacs d\'origine glaciaire situés dans le massif occidental des Pics d\'Europe.', how_to_get: 'Depuis Cangas de Onís, prendre l\'AS-262 jusqu\'aux lacs (12 km). En été, accès réglementé avec navette.', accessibility: 'Belvédère adapté près du Lac Enol. Sentier accessible de 500m.', parking: 'Parking gratuit près du Centre des Visiteurs (200 places).', opening_hours: 'Accès libre 24h. Centre des Visiteurs: 9h-18h (hiver) / 9h-20h (été)', prices: 'Entrée gratuite. Navette: 9€ aller-retour', recommended_duration: '2-4 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'cares',
    experience_type: '360',
    lat: 43.2477, lng: -4.8433,
    address: 'Poncebos, Cabrales, Asturias',
    phone: '+34 985 84 64 84',
    website: 'https://turismoasturias.es/cares',
    share_url: 'https://asturias.es/cares',
    tags: ['senderismo', 'garganta', 'río', 'montaña'],
    rich_text: { blocks: [
      { type: 'paragraph', text: { es: 'Conocida como "La Garganta Divina", la Ruta del Cares es una de las sendas más espectaculares de Europa.', en: 'Known as "The Divine Gorge", the Cares Trail is one of Europe\'s most spectacular paths.', fr: 'Connue comme "La Gorge Divine", le Sentier du Cares est l\'un des chemins les plus spectaculaires d\'Europe.' } },
      { type: 'quote', text: { es: 'Un camino entre cielo y abismo, donde el agua ha esculpido una obra maestra.', en: 'A path between sky and abyss, where water has sculpted a masterpiece.', fr: 'Un chemin entre ciel et abîme, où l\'eau a sculpté un chef-d\'œuvre.' } },
    ]},
    categoryIds: ['nature', 'adventure'],
    translations: [
      { languages_code: 'es', title: 'Ruta del Cares', short_description: 'La garganta divina entre León y Asturias', how_to_get: 'Inicio en Poncebos (Asturias) o Caín (León). Desde Arenas de Cabrales, 6 km hasta Poncebos.', accessibility: 'Ruta no adaptada. Tramos estrechos con precipicio.', parking: 'Parking en Poncebos (100 plazas, gratuito).', opening_hours: 'Acceso libre todo el año.', recommended_duration: '4-6 horas (ida y vuelta)' },
      { languages_code: 'en', title: 'Cares Trail', short_description: 'The divine gorge between León and Asturias', how_to_get: 'Start at Poncebos (Asturias) or Caín (León). From Arenas de Cabrales, 6 km to Poncebos.', accessibility: 'Trail not adapted. Narrow sections with precipice.', parking: 'Parking in Poncebos (100 spaces, free).', opening_hours: 'Free access year-round.', recommended_duration: '4-6 hours (round trip)' },
      { languages_code: 'fr', title: 'Sentier du Cares', short_description: 'La gorge divine entre León et Asturies', how_to_get: 'Départ à Poncebos (Asturies) ou Caín (León).', accessibility: 'Sentier non adapté. Tronçons étroits avec précipice.', parking: 'Parking à Poncebos (100 places, gratuit).', opening_hours: 'Accès libre toute l\'année.', recommended_duration: '4-6 heures (aller-retour)' },
    ],
    status: 'published',
  },
  {
    slug: 'horreo',
    experience_type: 'INFO',
    lat: 43.3167, lng: -5.3333,
    address: 'Espinaréu, Piloña, Asturias',
    phone: '+34 985 71 00 02',
    email: 'turismo@pilona.es',
    website: 'https://pilona.es/turismo',
    share_url: 'https://asturias.es/horreos',
    tags: ['etnografía', 'arquitectura', 'tradición', 'rural'],
    rich_text: { blocks: [
      { type: 'paragraph', text: { es: 'Espinaréu alberga el conjunto de hórreos y paneras más importante de Asturias, con más de 30 construcciones tradicionales.', en: 'Espinaréu houses the most important collection of granaries and paneras in Asturias.', fr: 'Espinaréu abrite la collection la plus importante de greniers et paneras des Asturies.' } },
    ]},
    categoryIds: ['heritage', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Hórreos de Espinaréu', short_description: 'Conjunto etnográfico único en Europa', how_to_get: 'Desde Infiesto, tomar la PI-1 hacia Espinaréu (8 km).', accessibility: 'Calles del pueblo transitables.', parking: 'Aparcamiento en la entrada del pueblo (20 plazas, gratuito).', opening_hours: 'Visita libre exterior 24h. Visitas guiadas: sábados 11:00', prices: 'Gratuito. Visita guiada: 5€/persona', recommended_duration: '45 minutos - 1 hora' },
      { languages_code: 'en', title: 'Granaries of Espinaréu', short_description: 'Unique ethnographic ensemble in Europe', how_to_get: 'From Infiesto, take PI-1 towards Espinaréu (8 km).', accessibility: 'Village streets are passable.', parking: 'Parking at village entrance (20 spaces, free).', opening_hours: 'Free exterior visit 24h. Guided tours: Saturdays 11:00', prices: 'Free. Guided tour: €5/person', recommended_duration: '45 minutes - 1 hour' },
      { languages_code: 'fr', title: 'Greniers d\'Espinaréu', short_description: 'Ensemble ethnographique unique en Europe', how_to_get: 'Depuis Infiesto, prendre la PI-1 vers Espinaréu (8 km).', accessibility: 'Rues du village praticables.', parking: 'Parking à l\'entrée du village (20 places, gratuit).', opening_hours: 'Visite libre extérieure 24h. Visites guidées: samedis 11h', prices: 'Gratuit. Visite guidée: 5€/personne', recommended_duration: '45 minutes - 1 heure' },
    ],
    status: 'published',
  },
  {
    slug: 'picos',
    experience_type: 'AR',
    lat: 43.2194, lng: -4.8119,
    address: 'Bulnes, Cabrales, Asturias',
    phone: '+34 985 84 68 09',
    website: 'https://bulnes.es',
    share_url: 'https://asturias.es/naranjo',
    tags: ['montaña', 'escalada', 'mirador', 'naranjo'],
    categoryIds: ['nature', 'adventure'],
    translations: [
      { languages_code: 'es', title: 'Mirador del Naranjo', short_description: 'Vista épica del Picu Urriellu', how_to_get: 'Funicular desde Poncebos a Bulnes (7 min). Desde Bulnes, senda hasta el mirador (1h).', accessibility: 'Funicular accesible. Sendero no adaptado.', parking: 'Parking en Poncebos.', opening_hours: 'Funicular: 10:00-20:00 (verano), 10:00-18:00 (invierno)', prices: 'Funicular: 22€ ida/vuelta, 17€ solo ida', recommended_duration: '3-4 horas' },
      { languages_code: 'en', title: 'Naranjo Viewpoint', short_description: 'Epic view of Picu Urriellu', how_to_get: 'Funicular from Poncebos to Bulnes (7 min). From Bulnes, trail to viewpoint (1h).', accessibility: 'Funicular accessible. Trail not adapted.', parking: 'Parking in Poncebos.', opening_hours: 'Funicular: 10:00-20:00 (summer), 10:00-18:00 (winter)', prices: 'Funicular: €22 round trip, €17 one way', recommended_duration: '3-4 hours' },
      { languages_code: 'fr', title: 'Belvédère du Naranjo', short_description: 'Vue épique du Picu Urriellu', how_to_get: 'Funiculaire de Poncebos à Bulnes (7 min). Depuis Bulnes, sentier jusqu\'au belvédère (1h).', accessibility: 'Funiculaire accessible. Sentier non adapté.', parking: 'Parking à Poncebos.', opening_hours: 'Funiculaire: 10h-20h (été), 10h-18h (hiver)', prices: 'Funiculaire: 22€ aller-retour, 17€ aller simple', recommended_duration: '3-4 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'preromanico',
    experience_type: '360',
    lat: 43.3833, lng: -5.8667,
    address: 'Monte Naranco, Oviedo, Asturias',
    phone: '+34 985 11 44 30',
    email: 'reservas@preromanico.es',
    website: 'https://preromanico.es',
    share_url: 'https://asturias.es/preromanico',
    tags: ['prerrománico', 'unesco', 'arquitectura', 'oviedo'],
    categoryIds: ['heritage', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Santa María del Naranco', short_description: 'Joya del prerrománico asturiano', how_to_get: 'A 3 km del centro de Oviedo. Bus urbano línea A4.', accessibility: 'Exterior accesible. Interior con escaleras.', parking: 'Parking gratuito junto al monumento (50 plazas).', opening_hours: 'Mar-Sáb: 9:30-13:00 y 15:30-19:00. Dom: 9:30-13:00. Lunes cerrado.', prices: 'General: 3€. Reducida: 1,50€. Lunes gratuito.', recommended_duration: '1-2 horas' },
      { languages_code: 'en', title: 'Santa María del Naranco', short_description: 'Jewel of Asturian pre-Romanesque', how_to_get: '3 km from Oviedo center. City bus line A4.', accessibility: 'Exterior accessible. Interior has stairs.', parking: 'Free parking next to the monument (50 spaces).', opening_hours: 'Tue-Sat: 9:30-13:00 and 15:30-19:00. Sun: 9:30-13:00. Monday closed.', prices: 'General: €3. Reduced: €1.50. Free on Mondays.', recommended_duration: '1-2 hours' },
      { languages_code: 'fr', title: 'Santa María del Naranco', short_description: 'Joyau du préroman asturien', how_to_get: 'À 3 km du centre d\'Oviedo. Bus urbain ligne A4.', accessibility: 'Extérieur accessible. Intérieur avec escaliers.', parking: 'Parking gratuit à côté du monument (50 places).', opening_hours: 'Mar-Sam: 9h30-13h et 15h30-19h. Dim: 9h30-13h. Lundi fermé.', prices: 'Général: 3€. Réduit: 1,50€. Gratuit le lundi.', recommended_duration: '1-2 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'museo-sidra',
    experience_type: 'INFO',
    lat: 43.3544, lng: -5.5067,
    address: 'Plaza Príncipe de Asturias, Nava, Asturias',
    website: 'https://www.museodelasidra.com',
    share_url: 'https://turismoasturias.es/museo-sidra',
    tags: ['sidra', 'museo', 'nava', 'tradición'],
    categoryIds: ['gastronomy', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Museo de la Sidra', short_description: 'El templo de la cultura sidrera asturiana', opening_hours: 'Martes a Domingo: 11:00 - 14:00 y 16:00 - 19:00', recommended_duration: '1-2 horas' },
      { languages_code: 'en', title: 'Cider Museum', short_description: 'The temple of Asturian cider culture', opening_hours: 'Tuesday to Sunday: 11:00 - 14:00 and 16:00 - 19:00', recommended_duration: '1-2 hours' },
      { languages_code: 'fr', title: 'Musée du Cidre', short_description: 'Le temple de la culture du cidre asturien', opening_hours: 'Mardi à Dimanche: 11:00 - 14:00 et 16:00 - 19:00', recommended_duration: '1-2 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'valdedios',
    experience_type: '360',
    lat: 43.4389, lng: -5.5147,
    address: 'Valdediós, Villaviciosa, Asturias',
    share_url: 'https://turismoasturias.es/valdedios',
    tags: ['prerrománico', 'monasterio', 'villaviciosa'],
    categoryIds: ['heritage', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Conjunto Monumental de Valdediós', short_description: 'Joya prerrománica en un valle de ensueño', recommended_duration: '1-2 horas' },
      { languages_code: 'en', title: 'Valdediós Monumental Complex', short_description: 'Pre-Romanesque jewel in a dream valley', recommended_duration: '1-2 hours' },
      { languages_code: 'fr', title: 'Ensemble Monumental de Valdediós', short_description: 'Joyau préroman dans une vallée de rêve', recommended_duration: '1-2 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'muja',
    experience_type: 'AR',
    lat: 43.4897, lng: -5.2706,
    address: 'Rasa de San Telmo, Colunga, Asturias',
    website: 'https://www.museojurasicoasturias.com',
    share_url: 'https://turismoasturias.es/muja',
    tags: ['dinosaurios', 'museo', 'colunga', 'paleontología'],
    categoryIds: ['culture'],
    translations: [
      { languages_code: 'es', title: 'Museo del Jurásico de Asturias', short_description: 'Viaje al pasado prehistórico asturiano', recommended_duration: '2-3 horas' },
      { languages_code: 'en', title: 'Jurassic Museum of Asturias', short_description: 'Journey to the Asturian prehistoric past', recommended_duration: '2-3 hours' },
      { languages_code: 'fr', title: 'Musée du Jurassique des Asturies', short_description: 'Voyage dans le passé préhistorique asturien', recommended_duration: '2-3 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'laboral',
    experience_type: '360',
    lat: 43.5253, lng: -5.6186,
    address: 'Luis Moya Blanco 261, Gijón, Asturias',
    website: 'https://www.laboralciudaddelacultura.com',
    share_url: 'https://turismoasturias.es/laboral',
    tags: ['arquitectura', 'cultura', 'gijón'],
    categoryIds: ['culture', 'heritage'],
    translations: [
      { languages_code: 'es', title: 'Laboral Ciudad de la Cultura', short_description: 'Imponente complejo arquitectónico y cultural', recommended_duration: '2-3 horas' },
      { languages_code: 'en', title: 'Laboral City of Culture', short_description: 'Impressive architectural and cultural complex', recommended_duration: '2-3 hours' },
      { languages_code: 'fr', title: 'Laboral Cité de la Culture', short_description: 'Impressionnant complexe architectural et culturel', recommended_duration: '2-3 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'cimavilla',
    experience_type: 'INFO',
    lat: 43.5456, lng: -5.6633,
    address: 'Cimavilla, Gijón, Asturias',
    share_url: 'https://turismoasturias.es/cimavilla',
    tags: ['sidrerías', 'gijón', 'marinero', 'tapas'],
    categoryIds: ['gastronomy', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Barrio de Cimavilla', short_description: 'Laberinto marinero con las mejores sidrerías', recommended_duration: '2-4 horas' },
      { languages_code: 'en', title: 'Cimavilla Neighborhood', short_description: 'Maritime labyrinth with the best cider houses', recommended_duration: '2-4 hours' },
      { languages_code: 'fr', title: 'Quartier de Cimavilla', short_description: 'Labyrinthe maritime avec les meilleures cidreries', recommended_duration: '2-4 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'torazu',
    experience_type: 'INFO',
    lat: 43.3894, lng: -5.4189,
    address: 'Torazu, Cabranes, Asturias',
    share_url: 'https://turismoasturias.es/torazu',
    tags: ['pueblo', 'hórreos', 'arquitectura', 'tradición'],
    categoryIds: ['heritage', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Torazu', short_description: 'Pueblo tradicional con casonas e hórreos centenarios', recommended_duration: '1 hora' },
      { languages_code: 'en', title: 'Torazu Village', short_description: 'Traditional village with historic manor houses and granaries', recommended_duration: '1 hour' },
      { languages_code: 'fr', title: 'Village de Torazu', short_description: 'Village traditionnel avec maisons de maître et greniers centenaires', recommended_duration: '1 heure' },
    ],
    status: 'published',
  },
  {
    slug: 'narzana',
    experience_type: 'INFO',
    lat: 43.3917, lng: -5.4833,
    address: 'Narzana, Sariego, Asturias',
    share_url: 'https://turismoasturias.es/narzana',
    tags: ['románico', 'iglesia', 'camino de santiago'],
    categoryIds: ['heritage', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Iglesia de Santa María de Narzana', short_description: 'Arte románico en el Camino de Santiago', recommended_duration: '30 minutos' },
      { languages_code: 'en', title: 'Santa María de Narzana Church', short_description: 'Romanesque art on the Way of Saint James', recommended_duration: '30 minutes' },
      { languages_code: 'fr', title: 'Église Santa María de Narzana', short_description: 'Art roman sur le Chemin de Saint-Jacques', recommended_duration: '30 minutes' },
    ],
    status: 'published',
  },
  {
    slug: 'playa-griega',
    experience_type: 'AR',
    lat: 43.4989, lng: -5.2644,
    address: 'Playa de La Griega, Colunga, Asturias',
    share_url: 'https://turismoasturias.es/playa-griega',
    tags: ['dinosaurios', 'playa', 'fósiles', 'jurásico'],
    categoryIds: ['nature', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Playa de La Griega - Huellas de Dinosaurio', short_description: 'Huellas fósiles de dinosaurios del Jurásico', recommended_duration: '1-2 horas (visitar con marea baja)' },
      { languages_code: 'en', title: 'La Griega Beach - Dinosaur Footprints', short_description: 'Jurassic dinosaur fossil footprints', recommended_duration: '1-2 hours (visit at low tide)' },
      { languages_code: 'fr', title: 'Plage de La Griega - Empreintes de Dinosaures', short_description: 'Empreintes fossiles de dinosaures du Jurassique', recommended_duration: '1-2 heures (visiter à marée basse)' },
    ],
    status: 'published',
  },
  {
    slug: 'llastres',
    experience_type: 'INFO',
    lat: 43.5156, lng: -5.2689,
    address: 'Llastres, Colunga, Asturias',
    share_url: 'https://turismoasturias.es/llastres',
    tags: ['pueblo', 'marinero', 'pescadores', 'mirador'],
    categoryIds: ['heritage', 'gastronomy'],
    translations: [
      { languages_code: 'es', title: 'Llastres', short_description: 'Encantador pueblo marinero con calles empedradas', recommended_duration: '1-2 horas' },
      { languages_code: 'en', title: 'Llastres', short_description: 'Charming fishing village with cobbled streets', recommended_duration: '1-2 hours' },
      { languages_code: 'fr', title: 'Llastres', short_description: 'Charmant village de pêcheurs aux rues pavées', recommended_duration: '1-2 heures' },
    ],
    status: 'published',
  },
  {
    slug: 'jardin-botanico',
    experience_type: 'INFO',
    lat: 43.5297, lng: -5.6081,
    address: 'Avenida del Jardín Botánico, 2230, Gijón, Asturias',
    website: 'https://botanico.gijon.es',
    share_url: 'https://turismoasturias.es/jardin-botanico',
    tags: ['jardín', 'botánico', 'naturaleza', 'gijón'],
    categoryIds: ['nature', 'culture'],
    translations: [
      { languages_code: 'es', title: 'Jardín Botánico Atlántico', short_description: 'Oasis verde con colecciones de flora atlántica', opening_hours: 'Verano: 10:00-21:00 | Invierno: 10:00-18:00', recommended_duration: '2-3 horas' },
      { languages_code: 'en', title: 'Atlantic Botanical Garden', short_description: 'Green oasis with Atlantic flora collections', opening_hours: 'Summer: 10:00-21:00 | Winter: 10:00-18:00', recommended_duration: '2-3 hours' },
      { languages_code: 'fr', title: 'Jardin Botanique Atlantique', short_description: 'Oasis vert avec des collections de flore atlantique', opening_hours: 'Été: 10:00-21:00 | Hiver: 10:00-18:00', recommended_duration: '2-3 heures' },
    ],
    status: 'published',
  },
];

// ============================================
// 4. ROUTES (29 immersive routes)
// ============================================

const ROUTES = [
  { route_code: 'AR-1', slug: 'asturias-naturaleza-minera', difficulty: 'medium', is_circular: false, max_points: 30, center_lat: 43.298, center_lng: -5.684, polyline: [{lat:43.287,lng:-5.697},{lat:43.295,lng:-5.678},{lat:43.305,lng:-5.692}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Asturias, Naturaleza Minera', short_description: 'Ruta extensa por el patrimonio minero e industrial de Asturias', description: 'Descubre el alma minera de Asturias a través de pozos, castilletes, lavaderos y paisajes transformados por siglos de extracción del carbón.', theme: 'Patrimonio minero e industrial', duration: '2-3 días' },
    { languages_code: 'en', title: 'Asturias, Mining Nature', short_description: 'Extensive route through the mining and industrial heritage of Asturias', theme: 'Mining and industrial heritage', duration: '2-3 days' },
    { languages_code: 'fr', title: 'Asturies, Nature Minière', short_description: 'Route étendue à travers le patrimoine minier et industriel des Asturies', theme: 'Patrimoine minier et industriel', duration: '2-3 jours' },
  ]},
  { route_code: 'AR-2', slug: 'valle-minero-nalon', difficulty: 'easy', is_circular: false, max_points: 2, center_lat: 43.243, center_lng: -5.665, polyline: [{lat:43.243,lng:-5.665},{lat:43.247,lng:-5.661}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Valle Minero del Nalón', short_description: 'Recorrido por los pueblos mineros del valle del Nalón', theme: 'Minería e industria', duration: '1 día' },
    { languages_code: 'en', title: 'Nalón Mining Valley', short_description: 'Tour through the mining villages of the Nalón valley', theme: 'Mining and industry', duration: '1 day' },
    { languages_code: 'fr', title: 'Vallée Minière du Nalón', short_description: 'Parcours des villages miniers de la vallée du Nalón', theme: 'Mines et industrie', duration: '1 jour' },
  ]},
  { route_code: 'AR-3', slug: 'cuencas-caudal', difficulty: 'easy', is_circular: false, max_points: 9, center_lat: 43.207, center_lng: -5.781, polyline: [{lat:43.200,lng:-5.790},{lat:43.214,lng:-5.772}], categoryIds: ['heritage','nature'], translations: [
    { languages_code: 'es', title: 'Cuencas del Caudal', short_description: 'El paisaje industrial transformado del río Caudal', theme: 'Paisaje industrial', duration: '1 día' },
    { languages_code: 'en', title: 'Caudal Basins', short_description: 'The transformed industrial landscape of the Caudal river', theme: 'Industrial landscape', duration: '1 day' },
    { languages_code: 'fr', title: 'Bassins du Caudal', short_description: 'Le paysage industriel transformé de la rivière Caudal', theme: 'Paysage industriel', duration: '1 jour' },
  ]},
  { route_code: 'AR-4', slug: 'langreo-industrial', difficulty: 'easy', is_circular: true, max_points: 8, center_lat: 43.298, center_lng: -5.695, polyline: [{lat:43.295,lng:-5.700},{lat:43.301,lng:-5.690},{lat:43.295,lng:-5.700}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Langreo Industrial', short_description: 'Memoria obrera de la capital de las cuencas', theme: 'Memoria obrera', duration: '4-5 horas' },
    { languages_code: 'en', title: 'Industrial Langreo', short_description: 'Working-class memory of the basin capital', theme: 'Working-class memory', duration: '4-5 hours' },
    { languages_code: 'fr', title: 'Langreo Industriel', short_description: 'Mémoire ouvrière de la capitale des bassins', theme: 'Mémoire ouvrière', duration: '4-5 heures' },
  ]},
  { route_code: 'AR-5', slug: 'mieres-entorno-minero', difficulty: 'medium', is_circular: false, max_points: 10, center_lat: 43.251, center_lng: -5.775, polyline: [{lat:43.245,lng:-5.780},{lat:43.257,lng:-5.770}], categoryIds: ['heritage'], translations: [
    { languages_code: 'es', title: 'Mieres y su entorno minero', short_description: 'Pozos, castilletes y patrimonio industrial en Mieres', theme: 'Industria y paisaje', duration: '1 día' },
    { languages_code: 'en', title: 'Mieres and its mining surroundings', short_description: 'Shafts, headframes and industrial heritage in Mieres', theme: 'Industry and landscape', duration: '1 day' },
    { languages_code: 'fr', title: 'Mieres et son environnement minier', short_description: 'Puits, chevalements et patrimoine industriel à Mieres', theme: 'Industrie et paysage', duration: '1 jour' },
  ]},
  { route_code: 'AR-6', slug: 'siero-industrial', difficulty: 'easy', is_circular: false, max_points: 8, center_lat: 43.392, center_lng: -5.660, polyline: [{lat:43.388,lng:-5.665},{lat:43.396,lng:-5.655}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Siero Industrial', short_description: 'Infraestructura y desarrollo en el concejo de Siero', theme: 'Infraestructura y desarrollo', duration: '4 horas' },
    { languages_code: 'en', title: 'Industrial Siero', short_description: 'Infrastructure and development in Siero municipality', theme: 'Infrastructure and development', duration: '4 hours' },
    { languages_code: 'fr', title: 'Siero Industriel', short_description: 'Infrastructure et développement dans la commune de Siero', theme: 'Infrastructure et développement', duration: '4 heures' },
  ]},
  { route_code: 'AR-7', slug: 'aviles-siderurgico', difficulty: 'easy', is_circular: true, max_points: 9, center_lat: 43.555, center_lng: -5.924, polyline: [{lat:43.550,lng:-5.930},{lat:43.560,lng:-5.918},{lat:43.550,lng:-5.930}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Avilés siderúrgico', short_description: 'El legado de la siderurgia en la ría de Avilés', theme: 'Siderurgia', duration: '5 horas' },
    { languages_code: 'en', title: 'Steelmaking Avilés', short_description: 'The steelmaking legacy in the Avilés estuary', theme: 'Steelmaking', duration: '5 hours' },
    { languages_code: 'fr', title: 'Avilés sidérurgique', short_description: 'L\'héritage sidérurgique dans l\'estuaire d\'Avilés', theme: 'Sidérurgie', duration: '5 heures' },
  ]},
  { route_code: 'AR-8', slug: 'gijon-industrial-portuario', difficulty: 'easy', is_circular: true, max_points: 10, center_lat: 43.538, center_lng: -5.670, polyline: [{lat:43.530,lng:-5.680},{lat:43.546,lng:-5.660},{lat:43.530,lng:-5.680}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Gijón industrial y portuario', short_description: 'El puerto y la industria que forjaron la ciudad', theme: 'Puerto e industria', duration: '1 día' },
    { languages_code: 'en', title: 'Industrial and port Gijón', short_description: 'The port and industry that forged the city', theme: 'Port and industry', duration: '1 day' },
    { languages_code: 'fr', title: 'Gijón industriel et portuaire', short_description: 'Le port et l\'industrie qui ont forgé la ville', theme: 'Port et industrie', duration: '1 jour' },
  ]},
  { route_code: 'AR-9', slug: 'carreno-industrial', difficulty: 'easy', is_circular: false, max_points: 8, center_lat: 43.586, center_lng: -5.780, polyline: [{lat:43.580,lng:-5.785},{lat:43.592,lng:-5.775}], categoryIds: ['heritage','nature'], translations: [
    { languages_code: 'es', title: 'Carreño y entorno industrial', short_description: 'Paisaje transformado por la industria en Carreño', theme: 'Paisaje transformado', duration: '4 horas' },
    { languages_code: 'en', title: 'Carreño and industrial surroundings', short_description: 'Landscape transformed by industry in Carreño', theme: 'Transformed landscape', duration: '4 hours' },
    { languages_code: 'fr', title: 'Carreño et environnement industriel', short_description: 'Paysage transformé par l\'industrie à Carreño', theme: 'Paysage transformé', duration: '4 heures' },
  ]},
  { route_code: 'AR-10', slug: 'corredor-industrial-central', difficulty: 'medium', is_circular: false, max_points: 10, center_lat: 43.410, center_lng: -5.780, polyline: [{lat:43.400,lng:-5.790},{lat:43.420,lng:-5.770}], categoryIds: ['heritage'], translations: [
    { languages_code: 'es', title: 'Corredor industrial central', short_description: 'El eje industrial que une las cuencas con el mar', theme: 'Eje industrial', duration: '1 día' },
    { languages_code: 'en', title: 'Central industrial corridor', short_description: 'The industrial axis connecting the basins to the sea', theme: 'Industrial axis', duration: '1 day' },
    { languages_code: 'fr', title: 'Corridor industriel central', short_description: 'L\'axe industriel reliant les bassins à la mer', theme: 'Axe industriel', duration: '1 jour' },
  ]},
  { route_code: 'AR-11', slug: 'memoria-industrial', difficulty: 'easy', is_circular: false, max_points: 8, center_lat: 43.350, center_lng: -5.800, polyline: [{lat:43.345,lng:-5.810},{lat:43.355,lng:-5.790}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Memoria industrial de Asturias', short_description: 'Recorrido por el patrimonio histórico industrial', theme: 'Patrimonio histórico', duration: '1 día' },
    { languages_code: 'en', title: 'Industrial memory of Asturias', short_description: 'Tour through the historical industrial heritage', theme: 'Historical heritage', duration: '1 day' },
    { languages_code: 'fr', title: 'Mémoire industrielle des Asturies', short_description: 'Parcours du patrimoine historique industriel', theme: 'Patrimoine historique', duration: '1 jour' },
  ]},
  { route_code: 'AR-12', slug: 'cudillero', difficulty: 'easy', is_circular: true, max_points: 10, center_lat: 43.563, center_lng: -6.145, polyline: [{lat:43.558,lng:-6.150},{lat:43.568,lng:-6.140},{lat:43.558,lng:-6.150}], categoryIds: ['gastronomy','nature'], translations: [
    { languages_code: 'es', title: 'Cudillero y alrededores', short_description: 'Ruta paisajística y gastronómica por el anfiteatro marinero', theme: 'Paisaje y gastronomía', duration: '1 día' },
    { languages_code: 'en', title: 'Cudillero and surroundings', short_description: 'Scenic and gastronomic route through the maritime amphitheater', theme: 'Landscape and gastronomy', duration: '1 day' },
    { languages_code: 'fr', title: 'Cudillero et environs', short_description: 'Route panoramique et gastronomique à travers l\'amphithéâtre maritime', theme: 'Paysage et gastronomie', duration: '1 jour' },
  ]},
  { route_code: 'AR-13', slug: 'las-regueras-termas-valduno', difficulty: 'easy', is_circular: false, max_points: 1, center_lat: 43.3910861, center_lng: -6.0052722, polyline: [{lat:43.3910861,lng:-6.0052722}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Las Regueras – Termas de Valduno', short_description: 'Ruta con reconstrucción AR de las termas romanas', description: 'Descubre las Termas Romanas de Santa Eulalia de Valduno, un excepcional conjunto termal de época romana.', theme: 'Patrimonio romano', duration: '2-3 horas' },
    { languages_code: 'en', title: 'Las Regueras – Valduno Baths', short_description: 'Route with AR reconstruction of Roman baths', theme: 'Roman heritage', duration: '2-3 hours' },
    { languages_code: 'fr', title: 'Las Regueras – Thermes de Valduno', short_description: 'Route avec reconstruction AR des thermes romains', theme: 'Patrimoine romain', duration: '2-3 heures' },
  ]},
  { route_code: 'AR-14', slug: 'muros-nalon-puerto-carbonero', difficulty: 'easy', is_circular: false, max_points: 10, center_lat: 43.542, center_lng: -6.100, polyline: [{lat:43.538,lng:-6.105},{lat:43.546,lng:-6.095}], categoryIds: ['heritage'], translations: [
    { languages_code: 'es', title: 'Muros del Nalón – Puerto Carbonero', short_description: 'Grúas, cargaderos, tolvas y muelles históricos', theme: 'Puerto e industria', duration: '4 horas' },
    { languages_code: 'en', title: 'Muros del Nalón – Coal Port', short_description: 'Cranes, loading docks, hoppers and historic piers', theme: 'Port and industry', duration: '4 hours' },
    { languages_code: 'fr', title: 'Muros del Nalón – Port Charbonnier', short_description: 'Grues, quais de chargement, trémies et jetées historiques', theme: 'Port et industrie', duration: '4 heures' },
  ]},
  { route_code: 'AR-15', slug: 'pravia-casco-historico', difficulty: 'easy', is_circular: true, max_points: 10, center_lat: 43.488, center_lng: -6.112, polyline: [{lat:43.485,lng:-6.115},{lat:43.491,lng:-6.109},{lat:43.485,lng:-6.115}], categoryIds: ['heritage','culture'], translations: [
    { languages_code: 'es', title: 'Pravia – Casco histórico', short_description: 'Ruta urbana con guía virtual por la capital del Bajo Nalón', theme: 'Historia urbana', duration: '3 horas' },
    { languages_code: 'en', title: 'Pravia – Historic center', short_description: 'Urban route with virtual guide through the capital of Bajo Nalón', theme: 'Urban history', duration: '3 hours' },
    { languages_code: 'fr', title: 'Pravia – Centre historique', short_description: 'Parcours urbain avec guide virtuel dans la capitale du Bajo Nalón', theme: 'Histoire urbaine', duration: '3 heures' },
  ]},
  { route_code: 'AR-16', slug: 'soto-del-barco', difficulty: 'easy', is_circular: true, max_points: 9, center_lat: 43.54850, center_lng: -6.07250, polyline: [{lat:43.55840,lng:-6.07587},{lat:43.556984,lng:-6.076402},{lat:43.56517,lng:-6.06942},{lat:43.55660,lng:-6.07520},{lat:43.55840,lng:-6.07587}], categoryIds: ['heritage','nature','gastronomy'], translations: [
    { languages_code: 'es', title: 'Soto del Barco', short_description: 'Historia, mar y patrimonio en la desembocadura del Nalón', description: 'Descubre Soto del Barco, donde el río Nalón encuentra el mar Cantábrico.', theme: 'Patrimonio costero', duration: '1 día' },
    { languages_code: 'en', title: 'Soto del Barco', short_description: 'History, sea and heritage at the Nalón estuary', theme: 'Coastal heritage', duration: '1 day' },
    { languages_code: 'fr', title: 'Soto del Barco', short_description: 'Histoire, mer et patrimoine à l\'embouchure du Nalón', theme: 'Patrimoine côtier', duration: '1 jour' },
  ]},
  { route_code: 'AR-17', slug: 'ruta-de-la-sidra', difficulty: 'easy', is_circular: false, max_points: 10, center_lat: 43.450, center_lng: -5.450, polyline: [{lat:43.3894,lng:-5.4189},{lat:43.3544,lng:-5.5067},{lat:43.3917,lng:-5.4833},{lat:43.4389,lng:-5.5147},{lat:43.4897,lng:-5.2706},{lat:43.4989,lng:-5.2644},{lat:43.5156,lng:-5.2689},{lat:43.5253,lng:-5.6186},{lat:43.5297,lng:-5.6081},{lat:43.5456,lng:-5.6633}], categoryIds: ['gastronomy','culture','heritage'], translations: [
    { languages_code: 'es', title: 'Ruta de la Sidra', short_description: 'Descubre la cultura sidrera asturiana declarada Patrimonio UNESCO', theme: 'Gastronomía y cultura', duration: '4 días' },
    { languages_code: 'en', title: 'Cider Route', short_description: 'Discover the Asturian cider culture declared UNESCO Heritage', theme: 'Gastronomy and culture', duration: '4 days' },
    { languages_code: 'fr', title: 'Route du Cidre', short_description: 'Découvrez la culture du cidre asturienne déclarée Patrimoine UNESCO', theme: 'Gastronomie et culture', duration: '4 jours' },
  ]},
];

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  ASTURIAS XR — SEED EXISTING CONTENT         ║');
  console.log('║  Categories · Tours · POIs · Routes           ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await login();

  // ── STEP 1: Categories ──
  console.log('📂 Seeding categories...\n');
  for (const cat of CATEGORIES) {
    const { categoryIds, ...data } = cat;
    await safeCreate('categories', { ...data, status: 'published', order: CATEGORIES.indexOf(cat) + 1 }, cat.slug);
  }

  // ── STEP 2: Tours 360 ──
  console.log('\n🎥 Seeding tours 360...\n');
  for (const tour of TOURS_360) {
    await safeCreate('tours_360', { ...tour, status: 'draft', vr_compatible: true, has_audio: false }, tour.slug);
  }

  // ── STEP 3: POIs ──
  console.log('\n📍 Seeding POIs...\n');
  for (const poi of POIS) {
    const { categoryIds, ...data } = poi;
    const created = await safeCreate('pois', data, data.slug);

    // Link M2M categories
    if (created && categoryIds) {
      for (const catSlug of categoryIds) {
        const catId = await getCategoryId(catSlug);
        if (catId) {
          try {
            await directus.request(createItem('pois_categories', {
              pois_id: created.id,
              categories_id: catId,
            }));
          } catch {}
        }
      }
    }
  }

  // ── STEP 4: Routes ──
  console.log('\n🗺️  Seeding routes...\n');
  for (const route of ROUTES) {
    const { categoryIds, ...data } = route;
    const created = await safeCreate('routes', { ...data, status: 'published' }, data.route_code);

    // Link M2M categories
    if (created && categoryIds) {
      for (const catSlug of categoryIds) {
        const catId = await getCategoryId(catSlug);
        if (catId) {
          try {
            await directus.request(createItem('routes_categories', {
              routes_id: created.id,
              categories_id: catId,
            }));
          } catch {}
        }
      }
    }
  }

  // ── DONE ──
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  ✅ CONTENT SEEDED SUCCESSFULLY!              ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('📊 Summary:');
  console.log(`   · ${CATEGORIES.length} categories`);
  console.log(`   · ${TOURS_360.length} tours 360°`);
  console.log(`   · ${POIS.length} POIs (with translations + M2M categories)`);
  console.log(`   · ${ROUTES.length} routes (with translations + M2M categories)`);

  console.log('\n🎉 Next steps:');
  console.log('   1. Open http://localhost:8055');
  console.log('   2. Check Content → POIs — verify translations (es/en/fr)');
  console.log('   3. Check Content → Routes — verify M2M categories');
  console.log('   4. Upload images to File Library and link to items');
  console.log('   5. Upload 3DVista ZIP builds for tours_360');
  console.log('   6. Upload Needle Engine ZIP builds for ar_scenes\n');
}

main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  if (error.errors) {
    error.errors.forEach(err => console.error('  -', err.message));
  }
  process.exit(1);
});
