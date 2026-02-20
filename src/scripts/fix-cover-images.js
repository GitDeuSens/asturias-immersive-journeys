#!/usr/bin/env node
// ============================================
// FIX: cover_image fields across all collections
// 1. Set special: ["file"] on all file-image fields
// 2. Null out orphaned cover_image UUIDs (referencing deleted files)
// 3. Create missing FK relations to directus_files
// ============================================

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL  || 'admin@asturiasxr.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '6xkMbCgPA636ZNCc';

let TOKEN = null;

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
      await sleep(attempt * 200);
      continue;
    }
    if (!res.ok) {
      const msg = json?.errors?.[0]?.message || text.slice(0, 300);
      throw new Error(`${method} ${path} → ${res.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
    return json?.data ?? json;
  }
  throw new Error(`${method} ${path} → 429 after ${retries} retries`);
}

async function login() {
  console.log('🔐 Authenticating...');
  const data = await api('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  TOKEN = data.access_token;
  console.log('✅ Authenticated\n');
}

// All file-type fields that need special: ["file"]
const FILE_FIELDS = [
  // cover_image (file-image)
  { collection: 'routes', field: 'cover_image' },
  { collection: 'pois', field: 'cover_image' },
  { collection: 'museums', field: 'cover_image' },
  // thumbnail (file-image)
  { collection: 'tours_360', field: 'thumbnail' },
  { collection: 'vr_experiences', field: 'thumbnail' },
  // preview_image (file-image)
  { collection: 'ar_scenes', field: 'preview_image' },
  // tracking_marker (file-image)
  { collection: 'ar_scenes', field: 'tracking_marker' },
  // build_zip (file)
  { collection: 'tours_360', field: 'build_zip' },
  { collection: 'ar_scenes', field: 'build_zip' },
  // apk_file (file)
  { collection: 'vr_experiences', field: 'apk_file' },
  // preview_video (file)
  { collection: 'tours_360', field: 'preview_video' },
  { collection: 'ar_scenes', field: 'preview_video' },
  { collection: 'vr_experiences', field: 'preview_video' },
  // gpx_file (file)
  { collection: 'routes', field: 'gpx_file' },
  // audio files
  { collection: 'pois', field: 'audio_es' },
  { collection: 'pois', field: 'audio_en' },
  { collection: 'pois', field: 'audio_fr' },
];

async function fixFieldMetadata() {
  console.log('🔧 Step 1: Fix special metadata on file fields...\n');

  for (const { collection, field } of FILE_FIELDS) {
    try {
      const fieldData = await api('GET', `/fields/${collection}/${field}`);
      const currentSpecial = fieldData?.meta?.special;

      if (!currentSpecial || !currentSpecial.includes('file')) {
        await api('PATCH', `/fields/${collection}/${field}`, {
          meta: { special: ['file'] }
        });
        console.log(`   ✅ ${collection}.${field}: special set to ["file"] (was: ${JSON.stringify(currentSpecial)})`);
      } else {
        console.log(`   ✓  ${collection}.${field}: already correct`);
      }
    } catch (e) {
      console.log(`   ⚠️  ${collection}.${field}: ${e.message}`);
    }
  }
}

async function fixOrphanedFileReferences() {
  console.log('\n🔧 Step 2: Fix orphaned file references...\n');

  // Get all existing file IDs
  const files = await api('GET', '/files?limit=-1&fields=id');
  const fileIds = new Set(files.map(f => f.id));
  console.log(`   📁 ${fileIds.size} files in directus_files\n`);

  // Collections with file UUID fields to check
  const collectionsToCheck = [
    { collection: 'museums', fields: ['cover_image'] },
    { collection: 'routes', fields: ['cover_image', 'gpx_file'] },
    { collection: 'pois', fields: ['cover_image', 'audio_es', 'audio_en', 'audio_fr'] },
    { collection: 'tours_360', fields: ['build_zip', 'thumbnail', 'preview_video'] },
    { collection: 'ar_scenes', fields: ['build_zip', 'preview_image', 'preview_video', 'tracking_marker'] },
    { collection: 'vr_experiences', fields: ['apk_file', 'thumbnail', 'preview_video'] },
  ];

  for (const { collection, fields } of collectionsToCheck) {
    const items = await api('GET', `/items/${collection}?limit=-1&fields=id,slug,${fields.join(',')}`);

    for (const item of items) {
      const nullUpdates = {};
      for (const field of fields) {
        if (item[field] && !fileIds.has(item[field])) {
          nullUpdates[field] = null;
          console.log(`   🗑️  ${collection}/${item.slug || item.id}: ${field}=${item[field]} → orphaned, setting to null`);
        }
      }
      if (Object.keys(nullUpdates).length > 0) {
        await api('PATCH', `/items/${collection}/${item.id}`, nullUpdates);
      }
    }
  }
}

async function fixMissingRelations() {
  console.log('\n🔧 Step 3: Create missing FK relations to directus_files...\n');

  // Check which relations already exist
  for (const { collection, field } of FILE_FIELDS) {
    try {
      await api('GET', `/relations/${collection}/${field}`);
      console.log(`   ✓  ${collection}.${field}: relation exists`);
    } catch (e) {
      if (e.message.includes('403') || e.message.includes('404')) {
        // Relation doesn't exist — create it
        try {
          await api('POST', '/relations', {
            collection,
            field,
            related_collection: 'directus_files',
            schema: { on_delete: 'SET NULL' },
            meta: { one_field: null },
          });
          console.log(`   ✅ ${collection}.${field}: relation CREATED`);
        } catch (createErr) {
          console.log(`   ⚠️  ${collection}.${field}: could not create relation: ${createErr.message}`);
        }
      } else {
        console.log(`   ⚠️  ${collection}.${field}: ${e.message}`);
      }
    }
  }
}

async function main() {
  console.log('🚀 Fix Cover Images & File Fields\n');
  await login();
  await fixFieldMetadata();
  await fixOrphanedFileReferences();
  await fixMissingRelations();
  console.log('\n🎉 Done! Refresh Directus admin to see the changes.');
}

process.on('unhandledRejection', (err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});

main();
