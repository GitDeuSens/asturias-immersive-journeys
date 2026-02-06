import { createDirectus, rest, authentication, readItems, updateItem, createItem } from '@directus/sdk';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
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

const ASSETS_DIR = resolve('..', '..', 'src', 'assets');

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// ============================================
// Helper: find file by filename_download via REST API
// ============================================
async function findFileByFilename(filename) {
  try {
    const resp = await fetch(
      `${DIRECTUS_URL}/files?filter[filename_download][_eq]=${encodeURIComponent(filename)}&fields=id&limit=1`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    if (!resp.ok) return null;
    const json = await resp.json();
    return json.data?.[0]?.id || null;
  } catch { return null; }
}

// ============================================
// Upload or find existing file
// ============================================
const uploadCache = {};

async function uploadImage(filename, title) {
  if (uploadCache[filename]) {
    return uploadCache[filename];
  }

  // Check if already uploaded by filename
  const existingId = await findFileByFilename(filename);
  if (existingId) {
    uploadCache[filename] = existingId;
    console.log(`   ⚡ Exists: ${filename} → ${existingId}`);
    return existingId;
  }

  const filePath = resolve(ASSETS_DIR, filename);
  if (!existsSync(filePath)) {
    console.error(`   ✗ File not found: ${filePath}`);
    return null;
  }

  const ext = extname(filename).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const fileBuffer = readFileSync(filePath);
    const form = new FormData();
    form.append('title', title);
    form.append('file', new File([fileBuffer], filename, { type: mimeType }));

    const response = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: form,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.errors?.[0]?.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    const fileId = result.data.id;
    uploadCache[filename] = fileId;
    console.log(`   ✓ Uploaded: ${filename} (${mimeType}) → ${fileId}`);
    return fileId;
  } catch (e) {
    console.error(`   ✗ Upload ${filename}: ${msg(e)}`);
    return null;
  }
}

// ============================================
// STEP 3: Link images to items
// ============================================

// POI slug → { cover: filename, gallery: [filenames] }
const POI_MEDIA = {
  'covadonga':      { cover: 'covadonga.jpg',      gallery: ['covadonga.jpg', 'picos.jpg'] },
  'cares':          { cover: 'cares.jpg',           gallery: ['cares.jpg'] },
  'horreo':         { cover: 'horreo.jpg',          gallery: ['horreo.jpg'] },
  'picos':          { cover: 'picos.jpg',           gallery: ['picos.jpg'] },
  'preromanico':    { cover: 'preromanico.jpg',     gallery: ['preromanico.jpg'] },
  'museo-sidra':    { cover: 'museo-sidra.jpg',     gallery: ['museo-sidra.jpg'] },
  'valdedios':      { cover: 'valdedios.jpg',       gallery: ['valdedios.jpg'] },
  'muja':           { cover: 'muja.jpg',            gallery: ['muja.jpg'] },
  'laboral':        { cover: 'laboral.jpg',         gallery: ['laboral.jpg'] },
  'cimavilla':      { cover: 'cimavilla.jpg',       gallery: ['cimavilla.jpg'] },
  'torazu':         { cover: 'torazu.jpg',          gallery: ['torazu.jpg'] },
  'narzana':        { cover: 'narzana.jpg',         gallery: ['narzana.jpg'] },
  'playa-griega':   { cover: 'playa-griega.jpg',    gallery: ['playa-griega.jpg'] },
  'llastres':       { cover: 'llastres.jpg',        gallery: ['llastres.jpg'] },
  'jardin-botanico':{ cover: 'jardin-botanico.jpg', gallery: ['jardin-botanico.jpg'] },
};

const TOUR_MEDIA = {
  'ecomuseo-samuno': 'ecomuseo-samuno.jpg',
  'mumi': 'mumi.jpg',
  'musi-siderurgia': 'musi.jpg',
  'ferrocarril': 'museo-ferrocarril.jpg',
};

const ROUTE_MEDIA = {
  'AR-1': 'ecomuseo-samuno.jpg',
  'AR-2': 'mumi.jpg',
  'AR-8': 'cimavilla.jpg',
  'AR-16': 'soto-barco-cover.jpg',
  'AR-17': 'ruta-sidra-cover.jpg',
};

const MUSEUM_MEDIA = {
  'ecomuseo-samuno': 'ecomuseo-samuno.jpg',
  'mumi': 'mumi.jpg',
  'musi': 'musi.jpg',
  'museo-ferrocarril': 'museo-ferrocarril.jpg',
  'muja': 'muja.jpg',
  'laboral': 'laboral.jpg',
  'museo-sidra': 'museo-sidra.jpg',
};

async function findItemBySlug(collection, slug, filterField = 'slug') {
  try {
    const items = await directus.request(readItems(collection, {
      filter: { [filterField]: { _eq: slug } },
      fields: ['id'],
      limit: 1,
    }));
    return items.length > 0 ? items[0].id : null;
  } catch {
    return null;
  }
}

async function linkPOIs() {
  console.log('\n📍 Linking images to POIs (cover_image + gallery)...\n');

  for (const [slug, media] of Object.entries(POI_MEDIA)) {
    const poiId = await findItemBySlug('pois', slug);
    if (!poiId) { console.log(`   ⚠ POI ${slug} not found`); continue; }

    // Cover image
    const coverId = await uploadImage(media.cover, `${slug}`);
    if (coverId) {
      try {
        await directus.request(updateItem('pois', poiId, { cover_image: coverId }));
        console.log(`   ✓ cover_image → POI ${slug}`);
      } catch (e) { console.error(`   ✗ cover ${slug}: ${msg(e)}`); }
    }

    // Gallery (via junction table pois_files)
    for (const galleryFile of media.gallery) {
      const fileId = await uploadImage(galleryFile, `${slug}-gallery-${galleryFile}`);
      if (!fileId) continue;

      try {
        await directus.request(createItem('pois_files', {
          pois_id: poiId,
          directus_files_id: fileId,
        }));
        console.log(`   ✓ gallery += ${galleryFile} → POI ${slug}`);
      } catch (e) {
        const m = msg(e);
        if (m.includes('unique') || m.includes('duplicate')) {
          console.log(`   ⚠ gallery ${galleryFile} already linked`);
        } else {
          console.error(`   ✗ gallery ${slug}: ${m}`);
        }
      }
    }
  }
}

async function linkTours() {
  console.log('\n🎥 Linking images to Tours 360...\n');
  for (const [slug, filename] of Object.entries(TOUR_MEDIA)) {
    const tourId = await findItemBySlug('tours_360', slug);
    if (!tourId) { console.log(`   ⚠ Tour ${slug} not found`); continue; }

    const fileId = await uploadImage(filename, `tour-${slug}`);
    if (fileId) {
      try {
        await directus.request(updateItem('tours_360', tourId, { cover_image: fileId }));
        console.log(`   ✓ cover_image → Tour ${slug}`);
      } catch (e) { console.error(`   ✗ ${slug}: ${msg(e)}`); }
    }
  }
}

async function linkRoutes() {
  console.log('\n🗺️  Linking images to Routes...\n');
  for (const [code, filename] of Object.entries(ROUTE_MEDIA)) {
    const routeId = await findItemBySlug('routes', code, 'route_code');
    if (!routeId) { console.log(`   ⚠ Route ${code} not found`); continue; }

    const fileId = await uploadImage(filename, `route-${code}`);
    if (fileId) {
      try {
        await directus.request(updateItem('routes', routeId, { cover_image: fileId }));
        console.log(`   ✓ cover_image → Route ${code}`);
      } catch (e) { console.error(`   ✗ ${code}: ${msg(e)}`); }
    }
  }
}

async function linkMuseums() {
  console.log('\n🏛️  Linking images to Museums...\n');
  for (const [slug, filename] of Object.entries(MUSEUM_MEDIA)) {
    const museumId = await findItemBySlug('museums', slug);
    if (!museumId) { console.log(`   ⚠ Museum ${slug} not found`); continue; }

    const fileId = await uploadImage(filename, `museum-${slug}`);
    if (fileId) {
      try {
        await directus.request(updateItem('museums', museumId, { cover_image: fileId }));
        console.log(`   ✓ cover_image → Museum ${slug}`);
      } catch (e) { console.error(`   ✗ ${slug}: ${msg(e)}`); }
    }
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  RE-UPLOAD IMAGES + LINK TO ALL COLLECTIONS  ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await login();

  // Upload and link images to all collections
  await linkPOIs();
  await linkTours();
  await linkRoutes();
  await linkMuseums();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  ✅ ALL IMAGES UPLOADED & LINKED!              ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\n📊 Summary:');
  console.log(`   · ${Object.keys(POI_MEDIA).length} POIs — cover_image + gallery`);
  console.log(`   · ${Object.keys(TOUR_MEDIA).length} Tours — cover_image`);
  console.log(`   · ${Object.keys(ROUTE_MEDIA).length} Routes — cover_image`);
  console.log(`   · ${Object.keys(MUSEUM_MEDIA).length} Museums — cover_image`);
  console.log(`   · ${Object.keys(uploadCache).length} unique files uploaded`);
  console.log('\n🎉 Refresh Directus Admin → File Library to verify!\n');
}

main().catch(error => {
  console.error('❌ FATAL:', msg(error));
  process.exit(1);
});
