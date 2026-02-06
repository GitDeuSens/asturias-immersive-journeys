import { createDirectus, rest, authentication, createCollection, createField, createRelation, updateField, uploadFiles, readItems, updateItem, createItem } from '@directus/sdk';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { basename } from 'path';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.PUBLIC_URL || 'http://localhost:8055';

const directus = createDirectus(DIRECTUS_URL)
  .with(authentication())
  .with(rest());

let accessToken = '';

async function login() {
  console.log('🔐 Logging in...');
  const auth = await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  accessToken = auth.access_token;
  console.log('✅ Logged in\n');
}

function msg(error) {
  return error?.errors?.[0]?.message || error?.message || JSON.stringify(error);
}

// ============================================
// PART 1: FIX GALLERY M2M RELATIONSHIPS
// ============================================

const COLLECTIONS_WITH_GALLERY = ['museums', 'routes', 'pois'];

async function fixGallery(collectionName) {
  const junctionName = `${collectionName}_files`;
  console.log(`\n📦 Fixing gallery for: ${collectionName}`);

  // 1. Create junction table
  try {
    await directus.request(createCollection({
      collection: junctionName,
      meta: { icon: 'import_export', hidden: true },
      schema: { name: junctionName },
      fields: [
        { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } },
      ],
    }));
    console.log(`   ✓ Created junction: ${junctionName}`);
  } catch (e) {
    if (msg(e).includes('already exists')) console.log(`   ⚠ ${junctionName} exists`);
    else { console.error(`   ✗ ${msg(e)}`); return; }
  }

  // 2. FK fields
  for (const [field, fk] of [[`${collectionName}_id`, collectionName], ['directus_files_id', 'directus_files']]) {
    try {
      await directus.request(createField(junctionName, {
        field, type: 'uuid',
        schema: { foreign_key_table: fk },
        meta: { hidden: true },
      }));
      console.log(`   ✓ Field: ${field}`);
    } catch (e) {
      if (msg(e).includes('already exists')) console.log(`   ⚠ ${field} exists`);
      else console.error(`   ✗ ${field}: ${msg(e)}`);
    }
  }

  // 3. M2M relations
  try {
    await directus.request(createRelation({
      collection: junctionName,
      field: `${collectionName}_id`,
      related_collection: collectionName,
      meta: { one_field: 'gallery', junction_field: 'directus_files_id' },
      schema: { on_delete: 'CASCADE' },
    }));
    console.log(`   ✓ Relation → ${collectionName}`);
  } catch (e) {
    if (msg(e).includes('already') || msg(e).includes('unique')) console.log(`   ⚠ Relation exists`);
    else console.error(`   ✗ ${msg(e)}`);
  }

  try {
    await directus.request(createRelation({
      collection: junctionName,
      field: 'directus_files_id',
      related_collection: 'directus_files',
      meta: { one_field: null, junction_field: `${collectionName}_id` },
      schema: { on_delete: 'CASCADE' },
    }));
    console.log(`   ✓ Relation → directus_files`);
  } catch (e) {
    if (msg(e).includes('already') || msg(e).includes('unique')) console.log(`   ⚠ Relation exists`);
    else console.error(`   ✗ ${msg(e)}`);
  }

  // 4. Update gallery field meta
  try {
    await directus.request(updateField(collectionName, 'gallery', {
      type: 'alias',
      meta: { interface: 'files', special: ['files'], note: 'Galería de imágenes' },
    }));
    console.log(`   ✓ Updated gallery meta`);
  } catch (e) {
    console.error(`   ✗ Update: ${msg(e)}`);
  }

  console.log(`   ✅ ${collectionName} gallery done`);
}

// ============================================
// PART 2: UPLOAD IMAGES & LINK TO POIs
// ============================================

const ASSETS_DIR = resolve('..', '..', 'src', 'assets');

// Map: POI slug → image filename
const POI_IMAGES = {
  'covadonga': 'covadonga.jpg',
  'cares': 'cares.jpg',
  'horreo': 'horreo.jpg',
  'picos': 'picos.jpg',
  'preromanico': 'preromanico.jpg',
  'museo-sidra': 'museo-sidra.jpg',
  'valdedios': 'valdedios.jpg',
  'muja': 'muja.jpg',
  'laboral': 'laboral.jpg',
  'cimavilla': 'cimavilla.jpg',
  'torazu': 'torazu.jpg',
  'narzana': 'narzana.jpg',
  'playa-griega': 'playa-griega.jpg',
  'llastres': 'llastres.jpg',
  'jardin-botanico': 'jardin-botanico.jpg',
};

// Map: Tour slug → image filename
const TOUR_IMAGES = {
  'ecomuseo-samuno': 'ecomuseo-samuno.jpg',
  'mumi': 'mumi.jpg',
  'musi-siderurgia': 'musi.jpg',
  'ferrocarril': 'museo-ferrocarril.jpg',
};

// Map: Route code → image filename
const ROUTE_IMAGES = {
  'AR-1': 'ecomuseo-samuno.jpg',
  'AR-2': 'mumi.jpg',
  'AR-8': 'cimavilla.jpg',
  'AR-16': 'soto-barco-cover.jpg',
  'AR-17': 'ruta-sidra-cover.jpg',
};

// Map: Museum slug → image filename
const MUSEUM_IMAGES = {
  'ecomuseo-samuno': 'ecomuseo-samuno.jpg',
  'mumi': 'mumi.jpg',
  'musi': 'musi.jpg',
  'museo-ferrocarril': 'museo-ferrocarril.jpg',
};

async function uploadImage(filename, title) {
  const filePath = resolve(ASSETS_DIR, filename);
  try {
    const fileData = readFileSync(filePath);
    const form = new FormData();
    form.append('title', title || filename);
    form.append('file', new Blob([fileData]), filename);

    const response = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: form,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.errors?.[0]?.message || response.statusText);
    }

    const result = await response.json();
    console.log(`   ✓ Uploaded: ${filename} → ${result.data.id}`);
    return result.data.id;
  } catch (e) {
    if (msg(e).includes('unique') || msg(e).includes('already')) {
      // File with same title may exist, try to find it
      try {
        const existing = await directus.request(readItems('directus_files', {
          filter: { title: { _eq: title || filename } },
          fields: ['id'],
          limit: 1,
        }));
        if (existing.length > 0) {
          console.log(`   ⚠ ${filename} already uploaded → ${existing[0].id}`);
          return existing[0].id;
        }
      } catch {}
    }
    console.error(`   ✗ Upload ${filename}: ${msg(e)}`);
    return null;
  }
}

async function linkImagesToItems() {
  console.log('\n🖼️  Uploading images & linking to POIs...\n');

  // Upload and link POI cover images
  for (const [slug, filename] of Object.entries(POI_IMAGES)) {
    const fileId = await uploadImage(filename, `POI: ${slug}`);
    if (!fileId) continue;

    try {
      const pois = await directus.request(readItems('pois', {
        filter: { slug: { _eq: slug } },
        fields: ['id'],
        limit: 1,
      }));
      if (pois.length > 0) {
        await directus.request(updateItem('pois', pois[0].id, { cover_image: fileId }));
        console.log(`   ✓ Linked ${filename} → POI ${slug}`);
      }
    } catch (e) {
      console.error(`   ✗ Link POI ${slug}: ${msg(e)}`);
    }
  }

  // Upload and link Tour cover images
  console.log('\n🎥 Linking images to Tours 360...\n');
  for (const [slug, filename] of Object.entries(TOUR_IMAGES)) {
    const fileId = await uploadImage(filename, `Tour: ${slug}`);
    if (!fileId) continue;

    try {
      const tours = await directus.request(readItems('tours_360', {
        filter: { slug: { _eq: slug } },
        fields: ['id'],
        limit: 1,
      }));
      if (tours.length > 0) {
        await directus.request(updateItem('tours_360', tours[0].id, { cover_image: fileId }));
        console.log(`   ✓ Linked ${filename} → Tour ${slug}`);
      }
    } catch (e) {
      console.error(`   ✗ Link Tour ${slug}: ${msg(e)}`);
    }
  }

  // Upload and link Route cover images
  console.log('\n🗺️  Linking images to Routes...\n');
  for (const [code, filename] of Object.entries(ROUTE_IMAGES)) {
    const fileId = await uploadImage(filename, `Route: ${code}`);
    if (!fileId) continue;

    try {
      const routes = await directus.request(readItems('routes', {
        filter: { route_code: { _eq: code } },
        fields: ['id'],
        limit: 1,
      }));
      if (routes.length > 0) {
        await directus.request(updateItem('routes', routes[0].id, { cover_image: fileId }));
        console.log(`   ✓ Linked ${filename} → Route ${code}`);
      }
    } catch (e) {
      console.error(`   ✗ Link Route ${code}: ${msg(e)}`);
    }
  }
}

// ============================================
// PART 3: SEED MUSEUMS
// ============================================

const MUSEUMS = [
  {
    slug: 'ecomuseo-samuno', museum_code: 'MUS-01', museum_type: 'mining',
    lat: 43.295, lng: -5.678, municipality: 'Langreo',
    address: 'Valle de Samuño, Langreo, Asturias',
    website: 'https://ecomuseo.es',
    translations: [
      { languages_code: 'es', name: 'Ecomuseo Minero Valle de Samuño', short_description: 'Viaje en tren minero por galerías reales del valle de Samuño', description: 'El Ecomuseo Minero del Valle de Samuño ofrece una experiencia única: un viaje en tren minero por galerías reales donde se extraía carbón.', opening_hours: 'Mar-Dom: 10:00-14:00 y 15:30-18:30', prices: 'Adultos: 12€ | Niños: 8€' },
      { languages_code: 'en', name: 'Samuño Valley Mining Ecomuseum', short_description: 'Mining train journey through real galleries in the Samuño valley', opening_hours: 'Tue-Sun: 10:00-14:00 and 15:30-18:30', prices: 'Adults: €12 | Children: €8' },
      { languages_code: 'fr', name: 'Écomusée Minier Vallée de Samuño', short_description: 'Voyage en train minier dans de vraies galeries de la vallée de Samuño', opening_hours: 'Mar-Dim: 10h-14h et 15h30-18h30', prices: 'Adultes: 12€ | Enfants: 8€' },
    ],
  },
  {
    slug: 'mumi', museum_code: 'MUS-02', museum_type: 'mining',
    lat: 43.243, lng: -5.665, municipality: 'El Entrego',
    address: 'El Entrego, San Martín del Rey Aurelio, Asturias',
    website: 'https://mumi.es',
    phone: '+34 985 662 562', email: 'info@mumi.es',
    translations: [
      { languages_code: 'es', name: 'MUMI – Museo de la Minería y la Industria de Asturias', short_description: 'El museo más completo sobre la minería asturiana', opening_hours: 'Mar-Dom: 10:00-14:00 y 16:00-19:00. Lunes cerrado.', prices: 'Adultos: 8€ | Menores de 12: Gratis | Grupos (+15): 6€/persona' },
      { languages_code: 'en', name: 'MUMI – Asturias Mining & Industry Museum', short_description: 'The most comprehensive museum on Asturian mining', opening_hours: 'Tue-Sun: 10:00-14:00 and 16:00-19:00. Monday closed.', prices: 'Adults: €8 | Under 12: Free | Groups (+15): €6/person' },
      { languages_code: 'fr', name: 'MUMI – Musée de la Mine et de l\'Industrie des Asturies', short_description: 'Le musée le plus complet sur l\'exploitation minière asturienne', opening_hours: 'Mar-Dim: 10h-14h et 16h-19h. Lundi fermé.', prices: 'Adultes: 8€ | Moins de 12 ans: Gratuit | Groupes (+15): 6€/personne' },
    ],
  },
  {
    slug: 'musi', museum_code: 'MUS-03', museum_type: 'industrial',
    lat: 43.305, lng: -5.692, municipality: 'Langreo',
    address: 'Langreo, Asturias',
    translations: [
      { languages_code: 'es', name: 'MUSI – Museo de la Siderurgia de Asturias', short_description: 'Historia del acero y la siderurgia asturiana' },
      { languages_code: 'en', name: 'MUSI – Asturias Steelworks Museum', short_description: 'History of Asturian steel and steelmaking' },
      { languages_code: 'fr', name: 'MUSI – Musée de la Sidérurgie des Asturies', short_description: 'Histoire de l\'acier et de la sidérurgie asturienne' },
    ],
  },
  {
    slug: 'museo-ferrocarril', museum_code: 'MUS-04', museum_type: 'railway',
    lat: 43.532, lng: -5.667, municipality: 'Gijón',
    address: 'Gijón, Asturias',
    website: 'https://museodelferrocarril.es',
    translations: [
      { languages_code: 'es', name: 'Museo del Ferrocarril de Asturias', short_description: 'Locomotoras, vagones y la historia del ferrocarril asturiano' },
      { languages_code: 'en', name: 'Asturias Railway Museum', short_description: 'Locomotives, carriages and the history of the Asturian railway' },
      { languages_code: 'fr', name: 'Musée du Chemin de Fer des Asturies', short_description: 'Locomotives, wagons et l\'histoire du chemin de fer asturien' },
    ],
  },
  {
    slug: 'museo-sidra', museum_code: 'MUS-05', museum_type: 'ethnographic',
    lat: 43.3544, lng: -5.5067, municipality: 'Nava',
    address: 'Plaza Príncipe de Asturias, Nava, Asturias',
    website: 'https://www.museodelasidra.com',
    translations: [
      { languages_code: 'es', name: 'Museo de la Sidra de Asturias', short_description: 'El templo de la cultura sidrera asturiana', opening_hours: 'Mar-Dom: 11:00-14:00 y 16:00-19:00', prices: 'Adultos: 4€ | Reducida: 2€' },
      { languages_code: 'en', name: 'Asturias Cider Museum', short_description: 'The temple of Asturian cider culture', opening_hours: 'Tue-Sun: 11:00-14:00 and 16:00-19:00', prices: 'Adults: €4 | Reduced: €2' },
      { languages_code: 'fr', name: 'Musée du Cidre des Asturies', short_description: 'Le temple de la culture du cidre asturien', opening_hours: 'Mar-Dim: 11h-14h et 16h-19h', prices: 'Adultes: 4€ | Réduit: 2€' },
    ],
  },
  {
    slug: 'museo-oro', museum_code: 'MUS-06', museum_type: 'mining',
    lat: 43.180, lng: -6.570, municipality: 'Tineo',
    address: 'Navelgas, Tineo, Asturias',
    translations: [
      { languages_code: 'es', name: 'Museo del Oro de Asturias', short_description: 'La historia de la extracción del oro en Asturias' },
      { languages_code: 'en', name: 'Asturias Gold Museum', short_description: 'The history of gold mining in Asturias' },
      { languages_code: 'fr', name: 'Musée de l\'Or des Asturies', short_description: 'L\'histoire de l\'extraction de l\'or dans les Asturies' },
    ],
  },
  {
    slug: 'meiq', museum_code: 'MUS-07', museum_type: 'ethnographic',
    lat: 43.178, lng: -5.970, municipality: 'Quirós',
    address: 'Quirós, Asturias',
    translations: [
      { languages_code: 'es', name: 'MEIQ – Museo Etnográfico e Industrial de Quirós', short_description: 'Etnografía e industria en el corazón de Asturias' },
      { languages_code: 'en', name: 'MEIQ – Quirós Ethnographic & Industrial Museum', short_description: 'Ethnography and industry in the heart of Asturias' },
      { languages_code: 'fr', name: 'MEIQ – Musée Ethnographique et Industriel de Quirós', short_description: 'Ethnographie et industrie au cœur des Asturies' },
    ],
  },
  {
    slug: 'mina-arnao', museum_code: 'MUS-08', museum_type: 'mining',
    lat: 43.575, lng: -5.975, municipality: 'Castrillón',
    address: 'Arnao, Castrillón, Asturias',
    translations: [
      { languages_code: 'es', name: 'Museo de la Mina de Arnao', short_description: 'La mina de carbón más antigua de la Península Ibérica' },
      { languages_code: 'en', name: 'Arnao Mine Museum', short_description: 'The oldest coal mine on the Iberian Peninsula' },
      { languages_code: 'fr', name: 'Musée de la Mine d\'Arnao', short_description: 'La plus ancienne mine de charbon de la Péninsule Ibérique' },
    ],
  },
  {
    slug: 'muja', museum_code: 'MUS-09', museum_type: 'science',
    lat: 43.4897, lng: -5.2706, municipality: 'Colunga',
    address: 'Rasa de San Telmo, Colunga, Asturias',
    website: 'https://www.museojurasicoasturias.com',
    translations: [
      { languages_code: 'es', name: 'Museo del Jurásico de Asturias (MUJA)', short_description: 'Dinosaurios y paleontología en la Costa Jurásica' },
      { languages_code: 'en', name: 'Jurassic Museum of Asturias (MUJA)', short_description: 'Dinosaurs and paleontology on the Jurassic Coast' },
      { languages_code: 'fr', name: 'Musée du Jurassique des Asturies (MUJA)', short_description: 'Dinosaures et paléontologie sur la Côte Jurassique' },
    ],
  },
  {
    slug: 'laboral', museum_code: 'MUS-10', museum_type: 'art',
    lat: 43.5253, lng: -5.6186, municipality: 'Gijón',
    address: 'Luis Moya Blanco 261, Gijón, Asturias',
    website: 'https://www.laboralciudaddelacultura.com',
    translations: [
      { languages_code: 'es', name: 'Laboral Ciudad de la Cultura', short_description: 'Imponente complejo arquitectónico y cultural de Gijón' },
      { languages_code: 'en', name: 'Laboral City of Culture', short_description: 'Impressive architectural and cultural complex in Gijón' },
      { languages_code: 'fr', name: 'Laboral Cité de la Culture', short_description: 'Impressionnant complexe architectural et culturel de Gijón' },
    ],
  },
];

function addUUIDs(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(item => addUUIDs(item));
  } else if (obj && typeof obj === 'object') {
    if ('languages_code' in obj && !obj.id) obj.id = randomUUID();
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) addUUIDs(val);
    }
  }
}

async function seedMuseums() {
  console.log('\n🏛️  Seeding museums...\n');

  for (const museum of MUSEUMS) {
    const data = { ...museum, status: 'published', id: randomUUID() };
    addUUIDs(data);

    try {
      const result = await directus.request(createItem('museums', data));
      console.log(`   ✓ ${museum.slug}`);

      // Link cover image if available
      const imgFile = MUSEUM_IMAGES[museum.slug];
      if (imgFile) {
        const fileId = await uploadImage(imgFile, `Museum: ${museum.slug}`);
        if (fileId) {
          await directus.request(updateItem('museums', result.id, { cover_image: fileId }));
          console.log(`   ✓ Cover image linked`);
        }
      }
    } catch (e) {
      const m = msg(e);
      if (m.includes('unique') || m.includes('already') || m.includes('duplicate')) {
        console.log(`   ⚠ ${museum.slug} (already exists)`);
      } else {
        console.error(`   ✗ ${museum.slug}: ${m}`);
      }
    }
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  FIX GALLERY + UPLOAD IMAGES + SEED MUSEUMS  ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await login();

  // Part 1: Fix gallery relationships
  console.log('═══ PART 1: Fix gallery M2M relationships ═══');
  for (const col of COLLECTIONS_WITH_GALLERY) {
    await fixGallery(col);
  }

  // Part 2: Upload images and link
  console.log('\n═══ PART 2: Upload images & link ═══');
  await linkImagesToItems();

  // Part 3: Seed museums
  console.log('\n═══ PART 3: Seed museums ═══');
  await seedMuseums();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  ✅ ALL DONE!                                 ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\n📊 Summary:');
  console.log(`   · Gallery M2M fixed for: ${COLLECTIONS_WITH_GALLERY.join(', ')}`);
  console.log(`   · ${Object.keys(POI_IMAGES).length} POI images uploaded & linked`);
  console.log(`   · ${Object.keys(TOUR_IMAGES).length} Tour images uploaded & linked`);
  console.log(`   · ${Object.keys(ROUTE_IMAGES).length} Route images uploaded & linked`);
  console.log(`   · ${MUSEUMS.length} museums seeded with translations`);
  console.log('\n🎉 Refresh Directus Admin to verify!\n');
}

main().catch(error => {
  console.error('❌ FATAL:', msg(error));
  process.exit(1);
});
