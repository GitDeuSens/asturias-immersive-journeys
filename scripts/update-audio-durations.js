const { parseBuffer } = require('music-metadata');
const axios = require('axios');

const DIRECTUS_URL = 'https://back.asturias.digitalmetaverso.com';
const TOKEN = 'asturias-creator-hub-admin-2024';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  timeout: 60000,
});

async function getDuration(fileId, mimeType) {
  const response = await axios.get(`${DIRECTUS_URL}/assets/${fileId}`, {
    responseType: 'arraybuffer',
    headers: { Authorization: `Bearer ${TOKEN}` },
    timeout: 60000,
  });
  const buffer = Buffer.from(response.data);
  const metadata = await parseBuffer(buffer, { mimeType });
  return metadata.format.duration ? Math.round(metadata.format.duration) : null;
}

async function run() {
  console.log('Fetching all POIs with audio files...');

  // Get all POIs that have at least one audio file
  const { data: poisResp } = await api.get('/items/pois', {
    params: {
      'filter[_or][0][audio_es][_nnull]': true,
      'filter[_or][1][audio_en][_nnull]': true,
      'filter[_or][2][audio_fr][_nnull]': true,
      'fields[]': ['id', 'audio_es', 'audio_en', 'audio_fr',
        'audio_duration_seconds_es', 'audio_duration_seconds_en', 'audio_duration_seconds_fr'],
      limit: -1,
    },
  });

  const pois = poisResp.data;
  console.log(`Found ${pois.length} POIs with audio\n`);

  for (const poi of pois) {
    const update = {};

    for (const [lang, fileId, durationField] of [
      ['es', poi.audio_es, 'audio_duration_seconds_es'],
      ['en', poi.audio_en, 'audio_duration_seconds_en'],
      ['fr', poi.audio_fr, 'audio_duration_seconds_fr'],
    ]) {
      if (!fileId) continue;
      if (poi[durationField]) {
        console.log(`  [${lang}] POI ${poi.id}: already has ${poi[durationField]}s — skipping`);
        continue;
      }

      try {
        // Get file info to check type
        const { data: fileResp } = await api.get(`/files/${fileId}`, {
          params: { 'fields[]': ['id', 'type', 'filename_download'] },
        });
        const file = fileResp.data;

        if (!file.type?.startsWith('audio/')) {
          console.log(`  [${lang}] POI ${poi.id}: file ${fileId} is not audio (${file.type}) — skipping`);
          continue;
        }

        const durationSec = await getDuration(fileId, file.type);
        if (durationSec) {
          update[durationField] = durationSec;
          // Also update file's own duration field
          await api.patch(`/files/${fileId}`, { duration: durationSec });
          console.log(`  [${lang}] POI ${poi.id}: ${file.filename_download} → ${durationSec}s ✓`);
        } else {
          console.log(`  [${lang}] POI ${poi.id}: could not extract duration from ${file.filename_download}`);
        }
      } catch (err) {
        console.error(`  [${lang}] POI ${poi.id}: error processing file ${fileId}: ${err.message}`);
      }
    }

    if (Object.keys(update).length > 0) {
      await api.patch(`/items/pois/${poi.id}`, update);
      console.log(`  → POI ${poi.id} updated: ${JSON.stringify(update)}\n`);
    }
  }

  console.log('\n✅ Done!');
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
