const axios = require('axios');

const DIRECTUS_URL = 'https://back.asturias.digitalmetaverso.com';
const TOKEN = 'asturias-creator-hub-admin-2024';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
});

async function patch(field, meta) {
  const { data } = await api.patch(`/fields/pois/${field}`, { meta });
  console.log(`  ${field}: sort=${data.data.meta.sort} note="${data.data.meta.note}"`);
}

async function run() {
  console.log('Shifting video_url and subsequent fields up by 3 to make room...\n');

  // Fields with sort >= 18 need to shift up by 3 to make room for 3 duration fields
  // video_url: 18 -> 21
  // relations_divider: 19 -> 22
  // ar_scene_id: 20 -> 23
  // etc.
  const shifts = [
    ['video_url', 21],
    ['relations_divider', 22],
    ['ar_scene_id', 23],
    ['tour_360_id', 24],
    ['museum_id', 25],
    ['content_divider', 26],
    ['rich_text', 27],
    ['tags', 28],
    ['contact_divider', 29],
    ['phone', 30],
    ['email', 31],
    ['website', 32],
    ['share_url', 33],
    ['external_links', 34],
    ['is_required', 35],
    ['featured', 36],
    ['seo_divider', 37],
    ['seo_title', 38],
    ['seo_description', 39],
    ['seo_keywords', 40],
    ['stats_divider', 41],
    ['view_count', 42],
    ['status', 43],
    ['sort', 44],
    ['created_at', 45],
    ['updated_at', 46],
    ['translations', 47],
    ['categories', 48],
  ];

  // Shift in reverse order to avoid sort collisions
  for (const [field, newSort] of shifts.reverse()) {
    try {
      await api.patch(`/fields/pois/${field}`, { meta: { sort: newSort } });
      console.log(`  shifted ${field} -> sort ${newSort}`);
    } catch (e) {
      console.log(`  skip ${field}: ${e.response?.data?.errors?.[0]?.message || e.message}`);
    }
  }

  console.log('\nPlacing audio duration fields at sort 18/19/20...\n');

  await patch('audio_duration_seconds', {
    sort: 18,
    readonly: false,
    note: 'Duracion audioguia ES (segundos)',
    width: 'third',
    group: null,
  });

  await patch('audio_duration_seconds_en', {
    sort: 19,
    readonly: false,
    note: 'Duracion audioguia EN (segundos)',
    width: 'third',
    group: null,
  });

  await patch('audio_duration_seconds_fr', {
    sort: 20,
    readonly: false,
    note: 'Duracion audioguia FR (segundos)',
    width: 'third',
    group: null,
  });

  console.log('\nVerifying audio section order:\n');
  const { data: allFields } = await api.get('/fields/pois', { params: { limit: -1 } });
  allFields.data
    .filter(f => f.meta.sort >= 13 && f.meta.sort <= 25)
    .sort((a, b) => a.meta.sort - b.meta.sort)
    .forEach(f => console.log(`  sort=${f.meta.sort} ${f.field}`));
}

run().catch(err => {
  console.error('Fatal:', err.response?.data || err.message);
  process.exit(1);
});
