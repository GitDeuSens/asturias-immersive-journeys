import { createDirectus, rest, authentication, createRelation, updateField } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(authentication())
  .with(rest());

async function safeCreateRelation(rel, label) {
  try {
    await directus.request(createRelation(rel));
    console.log(`   ✓ ${label}`);
  } catch (e) {
    const msg = String(e?.errors?.[0]?.message || e?.message || e);
    if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate')) {
      console.log(`   ⚠ ${label} (already exists)`);
    } else {
      console.error(`   ✗ ${label}: ${msg}`);
    }
  }
}

async function fixJunctionId(collection, label) {
  try {
    await directus.request(updateField(collection, 'id', {
      meta: { special: ['uuid'] },
    }));
    console.log(`   ✓ ${label} — id now auto-generates UUID`);
  } catch (e) {
    const msg = String(e?.errors?.[0]?.message || e?.message || e);
    console.error(`   ✗ ${label}: ${msg}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  FIX JUNCTION TABLES + FILE RELATIONS            ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log('✅ Logged in\n');

  // ============ FIX ALL JUNCTION + TRANSLATION TABLE IDs ============
  console.log('🔧 Fixing junction/translation table ID fields (auto-generate UUID):');
  const tablesToFix = [
    'routes_categories',
    'pois_categories',
    'ar_scenes_translations',
    'vr_experiences_translations',
    'tours_360_translations',
    'routes_translations',
    'pois_translations',
    'museums_translations',
    'categories_translations',
  ];
  for (const table of tablesToFix) {
    await fixJunctionId(table, table);
  }
  console.log('');

  // ============ TOURS 360 ============
  console.log('📦 tours_360 file relations:');

  await safeCreateRelation({
    collection: 'tours_360',
    field: 'build_zip',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'tours_360.build_zip → directus_files');

  await safeCreateRelation({
    collection: 'tours_360',
    field: 'thumbnail',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'tours_360.thumbnail → directus_files');

  await safeCreateRelation({
    collection: 'tours_360',
    field: 'preview_video',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'tours_360.preview_video → directus_files');

  // ============ AR SCENES ============
  console.log('\n🎯 ar_scenes file relations:');

  await safeCreateRelation({
    collection: 'ar_scenes',
    field: 'build_zip',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'ar_scenes.build_zip → directus_files');

  await safeCreateRelation({
    collection: 'ar_scenes',
    field: 'preview_image',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'ar_scenes.preview_image → directus_files');

  await safeCreateRelation({
    collection: 'ar_scenes',
    field: 'preview_video',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'ar_scenes.preview_video → directus_files');

  await safeCreateRelation({
    collection: 'ar_scenes',
    field: 'tracking_marker',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'ar_scenes.tracking_marker → directus_files');

  // ============ VR EXPERIENCES ============
  console.log('\n🥽 vr_experiences file relations:');

  await safeCreateRelation({
    collection: 'vr_experiences',
    field: 'apk_file',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'vr_experiences.apk_file → directus_files');

  await safeCreateRelation({
    collection: 'vr_experiences',
    field: 'thumbnail',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'vr_experiences.thumbnail → directus_files');

  await safeCreateRelation({
    collection: 'vr_experiences',
    field: 'preview_video',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'vr_experiences.preview_video → directus_files');

  // ============ ROUTES ============
  console.log('\n🗺️  routes file relations:');

  await safeCreateRelation({
    collection: 'routes',
    field: 'cover_image',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'routes.cover_image → directus_files');

  await safeCreateRelation({
    collection: 'routes',
    field: 'gpx_file',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'routes.gpx_file → directus_files');

  // ============ POIS ============
  console.log('\n📍 pois file relations:');

  await safeCreateRelation({
    collection: 'pois',
    field: 'cover_image',
    related_collection: 'directus_files',
    schema: { on_delete: 'SET NULL' },
    meta: { sort_field: null },
  }, 'pois.cover_image → directus_files');

  console.log('\n✅ Done! All file relations created.');
  console.log('   You should now be able to select files from the file library in Directus admin.');
}

main().catch(e => { console.error('❌ FATAL:', String(e?.errors?.[0]?.message || e?.message || e)); process.exit(1); });
