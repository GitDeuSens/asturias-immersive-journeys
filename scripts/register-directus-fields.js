/**
 * Registers new DB fields (location geometry, ar_scenes audio) in Directus field metadata
 * so they appear correctly in the admin UI.
 */
const axios = require('axios');

const DIRECTUS_URL = 'https://back.asturias.digitalmetaverso.com';
const TOKEN = 'asturias-creator-hub-admin-2024';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
});

async function upsertField(collection, field, meta, schema) {
  try {
    await api.patch(`/fields/${collection}/${field}`, { meta, schema });
    console.log(`  ✓ updated ${collection}.${field}`);
  } catch (e) {
    if (e.response?.status === 404) {
      try {
        await api.post(`/fields/${collection}`, { field, type: schema?.data_type || 'alias', meta, schema });
        console.log(`  ✓ created ${collection}.${field}`);
      } catch (e2) {
        console.log(`  ⚠ skip ${collection}.${field}: ${e2.response?.data?.errors?.[0]?.message || e2.message}`);
      }
    } else {
      console.log(`  ⚠ ${collection}.${field}: ${e.response?.data?.errors?.[0]?.message || e.message}`);
    }
  }
}

async function run() {
  console.log('Registering new fields in Directus...\n');

  // --- pois.location (PostGIS geometry — display only, hidden from edit form) ---
  await upsertField('pois', 'location', {
    hidden: true,
    note: 'PostGIS geometry auto-computed from lat/lng',
    readonly: true,
  }, { is_nullable: true });

  // --- routes.center_location ---
  await upsertField('routes', 'center_location', {
    hidden: true,
    note: 'PostGIS geometry auto-computed from center_lat/center_lng',
    readonly: true,
  }, { is_nullable: true });

  // --- museums.location ---
  await upsertField('museums', 'location', {
    hidden: true,
    note: 'PostGIS geometry auto-computed from lat/lng',
    readonly: true,
  }, { is_nullable: true });

  // --- ar_scenes.location ---
  await upsertField('ar_scenes', 'location', {
    hidden: true,
    note: 'PostGIS geometry auto-computed from location_lat/location_lng',
    readonly: true,
  }, { is_nullable: true });

  // --- ar_scenes audio fields (already in DB, register in Directus meta) ---
  console.log('\nRegistering ar_scenes audio fields...');

  const audioFieldsMeta = [
    ['audio_es', 'MP3 español', 13],
    ['audio_en', 'MP3 inglés', 14],
    ['audio_fr', 'MP3 francés', 15],
  ];

  // First check if ar_scenes already has an audio divider
  const { data: arFields } = await api.get('/fields/ar_scenes');
  const existingFields = arFields.data.map(f => f.field);
  const hasAudioDivider = existingFields.includes('audio_divider_ar');
  const maxSort = Math.max(...arFields.data.map(f => f.meta?.sort || 0));

  if (!hasAudioDivider) {
    await upsertField('ar_scenes', 'audio_divider_ar', {
      interface: 'presentation-divider',
      options: { title: 'Audioguías', icon: 'headphones' },
      special: ['alias', 'no-data'],
      hidden: false,
      sort: maxSort + 1,
      width: 'full',
    }, null);
  }

  for (const [field, note, offset] of audioFieldsMeta) {
    if (!existingFields.includes(field)) {
      await upsertField('ar_scenes', field, {
        interface: 'file',
        special: ['file'],
        hidden: false,
        readonly: false,
        note,
        sort: maxSort + 1 + offset,
        width: 'third',
      }, { is_nullable: true });
    } else {
      console.log(`  - ar_scenes.${field} already registered`);
    }
  }

  console.log('\n✅ Done!');
}

run().catch(err => {
  console.error('Fatal:', err.response?.data || err.message);
  process.exit(1);
});
