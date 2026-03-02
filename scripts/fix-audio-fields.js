const axios = require('axios');

const DIRECTUS_URL = 'https://back.asturias.digitalmetaverso.com';
const TOKEN = 'asturias-creator-hub-admin-2024';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
});

async function patchField(field, meta) {
  const { data } = await api.patch(`/fields/pois/${field}`, { meta });
  console.log(`✓ ${field}: sort=${data.data.meta.sort}, readonly=${data.data.meta.readonly}, note="${data.data.meta.note}", group=${data.data.meta.group}`);
}

async function run() {
  // First check current state of audio_divider to know its group
  const { data: divRes } = await api.get('/fields/pois/audio_divider');
  const divGroup = divRes.data.meta.group;
  console.log(`audio_divider group: ${divGroup}`);

  // Check what group audio_es/en/fr belong to
  for (const f of ['audio_es', 'audio_en', 'audio_fr', 'audio_duration_seconds', 'audio_duration_seconds_en', 'audio_duration_seconds_fr']) {
    const { data: r } = await api.get(`/fields/pois/${f}`);
    console.log(`  ${f}: sort=${r.data.meta.sort}, group=${r.data.meta.group}, readonly=${r.data.meta.readonly}`);
  }

  console.log('\nApplying fixes...\n');

  // Get the group of audio_es (the correct group for audio fields)
  const { data: esRes } = await api.get('/fields/pois/audio_es');
  const audioGroup = esRes.data.meta.group;
  const esSort = esRes.data.meta.sort;

  // Patch all duration fields: correct group, consecutive sort after audio files, consistent notes, not readonly
  await patchField('audio_duration_seconds', {
    group: audioGroup,
    sort: esSort + 3,      // right after audio_es(+0), audio_en(+1), audio_fr(+2)
    readonly: false,
    note: 'Duracion audioguia ES (segundos)',
    width: 'third',
  });

  await patchField('audio_duration_seconds_en', {
    group: audioGroup,
    sort: esSort + 4,
    readonly: false,
    note: 'Duracion audioguia EN (segundos)',
    width: 'third',
  });

  await patchField('audio_duration_seconds_fr', {
    group: audioGroup,
    sort: esSort + 5,
    readonly: false,
    note: 'Duracion audioguia FR (segundos)',
    width: 'third',
  });

  console.log('\nDone! Verifying final state...\n');

  const { data: allFields } = await api.get('/fields/pois', {
    params: { limit: -1 },
  });

  const audioFields = allFields.data
    .filter(f => f.field.startsWith('audio'))
    .sort((a, b) => a.meta.sort - b.meta.sort);

  console.log('Field'.padEnd(35), 'Sort'.padEnd(6), 'Group'.padEnd(40), 'Readonly');
  console.log('-'.repeat(90));
  for (const f of audioFields) {
    console.log(
      f.field.padEnd(35),
      String(f.meta.sort).padEnd(6),
      String(f.meta.group).padEnd(40),
      f.meta.readonly
    );
  }
}

run().catch(err => {
  console.error('Fatal:', err.response?.data || err.message);
  process.exit(1);
});
