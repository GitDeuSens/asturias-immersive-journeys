#!/usr/bin/env node

// ============================================
// ASTURIAS XR — DATABASE POPULATION SCRIPT
// Mapped to real Directus schema from recreate-schema.js
// ============================================
//
// Schema relationships (from recreate-schema.js):
//   routes  ──O2M──→ pois (via pois.route_id, ordered by pois.order)
//   routes  ──M2M──→ categories (via routes_categories junction)
//   pois    ──M2O──→ ar_scenes (via pois.ar_scene_id)
//   pois    ──M2O──→ tours_360 (via pois.tour_360_id)
//   All main collections have translations (es/en/fr)
//
// Key insight: there is NO separate "route_points" table.
// Route points ARE pois with route_id + order set.
// ============================================

import { randomUUID } from 'crypto';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL  || 'admin@asturiasxr.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '6xkMbCgPA636ZNCc';

let TOKEN = null;

// ============================================
// HELPERS
// ============================================

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function api(method, path, body, retries = 3) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`${DIRECTUS_URL}${path}`, opts);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }

    if (res.status === 429) {
      const wait = Math.max(100, attempt * 200);
      console.log(`   ⏳ Rate limited, waiting ${wait}ms (attempt ${attempt}/${retries})...`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const msg = json?.errors?.[0]?.message || text.slice(0, 200);
      throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
    }
    return json?.data ?? json;
  }
  throw new Error(`${method} ${path} → 429: Rate limited after ${retries} retries`);
}

async function login() {
  console.log('🔐 Authenticating...');
  const data = await api('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  TOKEN = data.access_token;
  console.log('✅ Authenticated\n');
}

// Upsert helper: try to find by filter, update if exists, create if not
async function upsert(collection, filter, payload) {
  const qs = Object.entries(filter)
    .map(([k, v]) => `filter[${k}][_eq]=${encodeURIComponent(v)}`)
    .join('&');
  const existing = await api('GET', `/items/${collection}?${qs}&limit=1`);

  if (existing && existing.length > 0) {
    const id = existing[0].id;
    await api('PATCH', `/items/${collection}/${id}`, payload);
    return { id, action: 'updated' };
  } else {
    const id = randomUUID();
    const created = await api('POST', `/items/${collection}`, { id, ...payload });
    return { id: created.id ?? id, action: 'created' };
  }
}

// Lookup helper: find one item by filter, return its id or null
async function findId(collection, filter) {
  const qs = Object.entries(filter)
    .map(([k, v]) => `filter[${k}][_eq]=${encodeURIComponent(v)}`)
    .join('&');
  const items = await api('GET', `/items/${collection}?${qs}&limit=1&fields=id`);
  return items?.[0]?.id ?? null;
}

// ============================================
// DATA — mapped to real Directus fields
// ============================================

// --- categories (must exist before routes link to them) ---
const CATEGORIES = [
  { slug: 'nature',    icon: 'Mountain',  color: '#22c55e', translations: { es: 'Naturaleza',  en: 'Nature',    fr: 'Nature'     } },
  { slug: 'adventure', icon: 'Compass',   color: '#f97316', translations: { es: 'Aventura',    en: 'Adventure', fr: 'Aventure'   } },
  { slug: 'heritage',  icon: 'Landmark',  color: '#a855f7', translations: { es: 'Patrimonio',  en: 'Heritage',  fr: 'Patrimoine' } },
  { slug: 'culture',   icon: 'BookOpen',  color: '#3b82f6', translations: { es: 'Cultura',     en: 'Culture',   fr: 'Culture'    } },
];

// --- ar_scenes (must exist before pois reference them) ---
const AR_SCENES = [
  {
    slug: 'covadonga-ar',
    ar_type: 'geo',
    build_path: '/ar/covadonga.glb',
    location_lat: 43.2704,
    location_lng: -4.9856,
    difficulty: 'easy',
    duration_minutes: 10,
    requires_outdoors: true,
    featured: true,
    translations: {
      es: { title: 'AR Lagos de Covadonga', description: null, instructions: 'Apunta al lago para ver la fauna' },
      en: { title: 'AR Covadonga Lakes',    description: null, instructions: 'Point at the lake to see wildlife' },
      fr: { title: 'AR Lacs de Covadonga',  description: null, instructions: 'Pointez vers le lac pour voir la faune' },
    },
  },
  {
    slug: 'picos-ar',
    ar_type: 'geo',
    build_path: '/ar/naranjo.glb',
    location_lat: 43.2194,
    location_lng: -4.8119,
    difficulty: 'easy',
    duration_minutes: 10,
    requires_outdoors: true,
    featured: false,
    translations: {
      es: { title: 'AR Picu Urriellu',  description: null, instructions: 'Descubre la historia de la escalada' },
      en: { title: 'AR Picu Urriellu',  description: null, instructions: 'Discover the climbing history' },
      fr: { title: 'AR Picu Urriellu',  description: null, instructions: "Découvrez l'histoire de l'escalade" },
    },
  },
];

// --- routes ---
const ROUTES = [
  {
    route_code: 'LAGOS',
    slug: 'route-lagos',
    is_circular: true,
    featured: true,
    difficulty: 'medium',
    center_lat: 43.2458,
    center_lng: -4.8803,
    category_slugs: ['nature', 'adventure'],
    translations: {
      es: { title: 'Ruta de los Lagos',    short_description: 'Descubre los lagos glaciares y las cumbres míticas' },
      en: { title: 'Lakes Route',           short_description: 'Discover glacial lakes and mythical peaks' },
      fr: { title: 'Route des Lacs',        short_description: 'Découvrez les lacs glaciaires et les sommets mythiques' },
    },
  },
  {
    route_code: 'HERITAGE',
    slug: 'route-heritage',
    is_circular: false,
    featured: true,
    difficulty: 'easy',
    center_lat: 43.3500,
    center_lng: -5.6000,
    category_slugs: ['heritage', 'culture'],
    translations: {
      es: { title: 'Patrimonio Asturiano',  short_description: 'Un viaje por la historia milenaria' },
      en: { title: 'Asturian Heritage',     short_description: 'A journey through millennial history' },
      fr: { title: 'Patrimoine Asturien',   short_description: "Un voyage à travers l'histoire millénaire" },
    },
  },
  {
    route_code: 'COMPLETE',
    slug: 'route-complete',
    is_circular: true,
    featured: false,
    difficulty: 'hard',
    center_lat: 43.3000,
    center_lng: -5.3000,
    category_slugs: ['nature', 'heritage', 'adventure'],
    translations: {
      es: { title: 'Asturias Completa',     short_description: 'La experiencia definitiva en 2 días' },
      en: { title: 'Complete Asturias',      short_description: 'The ultimate experience in 2 days' },
      fr: { title: 'Asturies Complète',      short_description: "L'expérience ultime en 2 jours" },
    },
  },
];

// --- pois (they ARE the route points, linked via route_id + order) ---
// Each POI has a unique slug. The same physical POI can appear in multiple
// routes, but Directus schema has pois.route_id as single FK, so each POI
// record belongs to one route. For the "complete" route that reuses the same
// locations we create separate POI records with a different slug suffix.
const POIS = [
  // ---- POIs for route-lagos ----
  {
    slug: 'covadonga',
    experience_type: 'AR',
    route_slug: 'route-lagos',
    order: 1,
    lat: 43.2704, lng: -4.9856,
    address: 'Lagos de Covadonga, Cangas de Onís',
    ar_scene_slug: 'covadonga-ar',
    is_required: true,
    featured: true,
    translations: {
      es: { title: 'Lagos de Covadonga', short_description: 'Lagos glaciares entre cumbres míticas' },
      en: { title: 'Covadonga Lakes',    short_description: 'Glacial lakes among mythical peaks' },
      fr: { title: 'Lacs de Covadonga',  short_description: 'Lacs glaciaires parmi les sommets mythiques' },
    },
  },
  {
    slug: 'picos',
    experience_type: 'AR',
    route_slug: 'route-lagos',
    order: 2,
    lat: 43.2194, lng: -4.8119,
    address: 'Bulnes, Cabrales',
    ar_scene_slug: 'picos-ar',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Picos de Europa - Bulnes', short_description: 'Vista épica del Picu Urriellu' },
      en: { title: 'Picos de Europa - Bulnes', short_description: 'Epic view of Picu Urriellu' },
      fr: { title: 'Picos de Europa - Bulnes', short_description: 'Vue épique du Picu Urriellu' },
    },
  },
  {
    slug: 'cares',
    experience_type: '360',
    route_slug: 'route-lagos',
    order: 3,
    lat: 43.2477, lng: -4.8433,
    address: 'Poncebos - Caín',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Ruta del Cares',  short_description: 'La garganta divina entre León y Asturias' },
      en: { title: 'Cares Route',     short_description: 'The divine gorge between León and Asturias' },
      fr: { title: 'Route du Cares',  short_description: 'La gorge divine entre León et Asturies' },
    },
  },

  // ---- POIs for route-heritage ----
  {
    slug: 'preromanico',
    experience_type: '360',
    route_slug: 'route-heritage',
    order: 1,
    lat: 43.3833, lng: -5.8667,
    address: 'Monte Naranco, Oviedo',
    is_required: true,
    featured: true,
    translations: {
      es: { title: 'Prerrománico Asturiano', short_description: 'Joya del prerrománico asturiano' },
      en: { title: 'Asturian Pre-Romanesque', short_description: 'Jewel of Asturian pre-Romanesque' },
      fr: { title: 'Préroman Asturien',       short_description: 'Joyau du préroman asturien' },
    },
  },
  {
    slug: 'horreo',
    experience_type: 'INFO',
    route_slug: 'route-heritage',
    order: 2,
    lat: 43.3167, lng: -5.3333,
    address: 'Espinaréu, Piloña',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Hórreos de Espinaréu', short_description: 'Conjunto etnográfico único en Europa' },
      en: { title: 'Espinaréu Granaries',   short_description: 'Unique ethnographic ensemble in Europe' },
      fr: { title: 'Greniers d\'Espinaréu',  short_description: 'Ensemble ethnographique unique en Europe' },
    },
  },

  // ---- POIs for route-complete (reuses same physical locations) ----
  {
    slug: 'complete-preromanico',
    experience_type: '360',
    route_slug: 'route-complete',
    order: 1,
    lat: 43.3833, lng: -5.8667,
    address: 'Monte Naranco, Oviedo',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Prerrománico Asturiano', short_description: 'Joya del prerrománico asturiano' },
      en: { title: 'Asturian Pre-Romanesque', short_description: 'Jewel of Asturian pre-Romanesque' },
      fr: { title: 'Préroman Asturien',       short_description: 'Joyau du préroman asturien' },
    },
  },
  {
    slug: 'complete-horreo',
    experience_type: 'INFO',
    route_slug: 'route-complete',
    order: 2,
    lat: 43.3167, lng: -5.3333,
    address: 'Espinaréu, Piloña',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Hórreos de Espinaréu', short_description: 'Conjunto etnográfico único en Europa' },
      en: { title: 'Espinaréu Granaries',   short_description: 'Unique ethnographic ensemble in Europe' },
      fr: { title: 'Greniers d\'Espinaréu',  short_description: 'Ensemble ethnographique unique en Europe' },
    },
  },
  {
    slug: 'complete-covadonga',
    experience_type: 'AR',
    route_slug: 'route-complete',
    order: 3,
    lat: 43.2704, lng: -4.9856,
    address: 'Lagos de Covadonga, Cangas de Onís',
    ar_scene_slug: 'covadonga-ar',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Lagos de Covadonga', short_description: 'Lagos glaciares entre cumbres míticas' },
      en: { title: 'Covadonga Lakes',    short_description: 'Glacial lakes among mythical peaks' },
      fr: { title: 'Lacs de Covadonga',  short_description: 'Lacs glaciaires parmi les sommets mythiques' },
    },
  },
  {
    slug: 'complete-picos',
    experience_type: 'AR',
    route_slug: 'route-complete',
    order: 4,
    lat: 43.2194, lng: -4.8119,
    address: 'Bulnes, Cabrales',
    ar_scene_slug: 'picos-ar',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Picos de Europa - Bulnes', short_description: 'Vista épica del Picu Urriellu' },
      en: { title: 'Picos de Europa - Bulnes', short_description: 'Epic view of Picu Urriellu' },
      fr: { title: 'Picos de Europa - Bulnes', short_description: 'Vue épique du Picu Urriellu' },
    },
  },
  {
    slug: 'complete-cares',
    experience_type: '360',
    route_slug: 'route-complete',
    order: 5,
    lat: 43.2477, lng: -4.8433,
    address: 'Poncebos - Caín',
    is_required: true,
    featured: false,
    translations: {
      es: { title: 'Ruta del Cares',  short_description: 'La garganta divina entre León y Asturias' },
      en: { title: 'Cares Route',     short_description: 'The divine gorge between León and Asturias' },
      fr: { title: 'Route du Cares',  short_description: 'La gorge divine entre León et Asturies' },
    },
  },
];

// ============================================
// POPULATION FUNCTIONS
// ============================================

async function populateCategories() {
  console.log('📂 Populating categories...');
  for (const cat of CATEGORIES) {
    const { translations, ...fields } = cat;
    const { id, action } = await upsert('categories', { slug: cat.slug }, {
      ...fields,
      status: 'published',
      order: CATEGORIES.indexOf(cat),
    });
    console.log(`   ${action === 'created' ? '✅' : '🔄'} category: ${cat.slug} (${id})`);

    // Upsert translations
    for (const [lang, name] of Object.entries(translations)) {
      await upsert('categories_translations',
        { categories_id: id, languages_code: lang },
        { categories_id: id, languages_code: lang, name, description: '' }
      );
    }
  }
}

async function populateARScenes() {
  console.log('\n🥽 Populating AR scenes...');
  for (const scene of AR_SCENES) {
    const { translations, ...fields } = scene;
    const { id, action } = await upsert('ar_scenes', { slug: scene.slug }, {
      ...fields,
      status: 'published',
    });
    console.log(`   ${action === 'created' ? '✅' : '🔄'} ar_scene: ${scene.slug} (${id})`);

    for (const [lang, t] of Object.entries(translations)) {
      await upsert('ar_scenes_translations',
        { ar_scenes_id: id, languages_code: lang },
        { ar_scenes_id: id, languages_code: lang, ...t }
      );
    }
  }
}

async function populateRoutes() {
  console.log('\n🛣️  Populating routes...');
  for (const route of ROUTES) {
    const { translations, category_slugs, ...fields } = route;
    const { id: routeId, action } = await upsert('routes', { slug: route.slug }, {
      ...fields,
      status: 'published',
    });
    console.log(`   ${action === 'created' ? '✅' : '🔄'} route: ${route.slug} (${routeId})`);

    // Translations
    for (const [lang, t] of Object.entries(translations)) {
      await upsert('routes_translations',
        { routes_id: routeId, languages_code: lang },
        { routes_id: routeId, languages_code: lang, ...t }
      );
    }

    // M2M categories
    for (const catSlug of category_slugs) {
      const catId = await findId('categories', { slug: catSlug });
      if (!catId) { console.log(`   ⚠️  category not found: ${catSlug}`); continue; }
      try {
        await upsert('routes_categories',
          { routes_id: routeId, categories_id: catId },
          { routes_id: routeId, categories_id: catId }
        );
      } catch (e) {
        // junction row may already exist
        if (!e.message.includes('unique')) console.log(`   ⚠️  ${e.message}`);
      }
    }
  }
}

async function populatePOIs() {
  console.log('\n📍 Populating POIs...');
  for (const poi of POIS) {
    const { translations, route_slug, ar_scene_slug, ...fields } = poi;

    // Resolve route_id
    const routeId = route_slug ? await findId('routes', { slug: route_slug }) : null;
    // Resolve ar_scene_id
    const arSceneId = ar_scene_slug ? await findId('ar_scenes', { slug: ar_scene_slug }) : null;

    const { id: poiId, action } = await upsert('pois', { slug: poi.slug }, {
      ...fields,
      route_id: routeId,
      ar_scene_id: arSceneId,
      status: 'published',
    });
    console.log(`   ${action === 'created' ? '✅' : '🔄'} poi: ${poi.slug} (${poiId}) → route=${route_slug || 'none'}, ar=${ar_scene_slug || 'none'}`);

    // Translations
    for (const [lang, t] of Object.entries(translations)) {
      await upsert('pois_translations',
        { pois_id: poiId, languages_code: lang },
        { pois_id: poiId, languages_code: lang, ...t }
      );
    }
  }
}

async function verify() {
  console.log('\n🔍 Verifying...');
  const categories = await api('GET', '/items/categories?limit=-1&fields=id,slug');
  const arScenes   = await api('GET', '/items/ar_scenes?limit=-1&fields=id,slug');
  const routes     = await api('GET', '/items/routes?limit=-1&fields=id,slug,is_circular');
  const pois       = await api('GET', '/items/pois?limit=-1&fields=id,slug,route_id,order,experience_type');

  console.log(`   📂 Categories:  ${categories.length}`);
  console.log(`   🥽 AR Scenes:   ${arScenes.length}`);
  console.log(`   🛣️  Routes:      ${routes.length}`);
  console.log(`   📍 POIs:        ${pois.length}`);

  // Show route → POI mapping
  for (const route of routes) {
    const routePois = pois
      .filter(p => p.route_id === route.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    console.log(`   🗺️  ${route.slug}: ${routePois.map(p => `${p.order}.${p.slug}(${p.experience_type})`).join(' → ')}`);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🚀 Asturias XR — Database Population\n');
  console.log(`   URL:   ${DIRECTUS_URL}`);
  console.log(`   Admin: ${ADMIN_EMAIL}\n`);

  await login();

  // Order matters: categories → ar_scenes → routes → pois
  await populateCategories();
  await populateARScenes();
  await populateRoutes();
  await populatePOIs();
  await verify();

  console.log('\n🎉 Done! Open Directus: ' + DIRECTUS_URL + '/admin');
}

process.on('unhandledRejection', (err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});

main();
