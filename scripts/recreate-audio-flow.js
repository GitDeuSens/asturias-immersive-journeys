// Recreate the audio duration Flow in Directus with correct exec script format
const axios = require('axios');

const DIRECTUS_URL = 'https://back.asturias.digitalmetaverso.com';
const TOKEN = 'asturias-creator-hub-admin-2024';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
});

// In Directus 10.10 exec sandbox the script is a plain async function body.
// Available globals: $trigger, $accountability, $env, $services, $database, $logger, $getSchema
// NO module.exports, NO require of external packages — only Node built-ins
const SCRIPT = `
const fileId = $trigger.key;
if (!fileId) return {};

const schema = await $getSchema();
const filesService = new $services.FilesService({ schema, accountability: null });
const file = await filesService.readOne(fileId);

if (!file || !file.type || !file.type.startsWith('audio/')) return {};

// Download via built-in https
const https = require('https');
const buffer = await new Promise((resolve, reject) => {
  const chunks = [];
  const req = https.get({
    hostname: 'back.asturias.digitalmetaverso.com',
    path: '/assets/' + fileId,
    headers: { Authorization: 'Bearer ${TOKEN}' }
  }, res => {
    res.on('data', c => chunks.push(c));
    res.on('end', () => resolve(Buffer.concat(chunks)));
    res.on('error', reject);
  });
  req.on('error', reject);
});

// Parse MP3/audio duration from ID3/MPEG frames — simple manual approach
// Check for ID3v2 tag to get duration, or use MPEG frame counting
// For simplicity use the file's metadata from Directus if already populated,
// otherwise calculate from buffer size and bitrate heuristic
let durationSec = file.duration || null;

if (!durationSec) {
  // Try to get MPEG audio duration from frame headers
  // Look for MPEG sync bytes (0xFF 0xE0 or 0xFF 0xF0)
  let bitrate = 128; // default 128kbps
  let totalFrames = 0;
  let frameSize = 0;
  
  for (let i = 0; i < Math.min(buffer.length - 4, 10000); i++) {
    if (buffer[i] === 0xFF && (buffer[i+1] & 0xE0) === 0xE0) {
      const bitrateIndex = (buffer[i+2] >> 4) & 0x0F;
      const bitrateTable = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0];
      if (bitrateTable[bitrateIndex] > 0) {
        bitrate = bitrateTable[bitrateIndex];
        break;
      }
    }
  }
  // Duration = file size in bits / bitrate in bits per second
  durationSec = Math.round((buffer.length * 8) / (bitrate * 1000));
}

if (!durationSec || durationSec <= 0) return {};

// Update file duration
await filesService.updateOne(fileId, { duration: durationSec });

// Update POI duration fields
const poisService = new $services.ItemsService('pois', { schema, accountability: null });
const langMap = [
  ['audio_es', 'audio_duration_seconds'],
  ['audio_en', 'audio_duration_seconds_en'],
  ['audio_fr', 'audio_duration_seconds_fr'],
];

for (const [audioField, durationField] of langMap) {
  const pois = await poisService.readByQuery({
    filter: { [audioField]: { _eq: fileId } },
    fields: ['id'],
  });
  for (const poi of pois) {
    await poisService.updateOne(poi.id, { [durationField]: durationSec });
  }
}

return { fileId, durationSec };
`;

async function run() {
  // Clean up old flows
  const { data: existing } = await api.get('/flows', {
    params: { 'filter[name][_eq]': 'Auto Audio Duration' },
  });
  for (const f of existing.data) {
    await api.delete(`/flows/${f.id}`);
    console.log('Deleted old flow:', f.id);
  }

  // Create flow
  const { data: flowRes } = await api.post('/flows', {
    name: 'Auto Audio Duration',
    icon: 'headphones',
    color: '#6644AA',
    status: 'active',
    trigger: 'event',
    options: {
      type: 'action',
      scope: ['files.upload'],
    },
  });
  const flowId = flowRes.data.id;
  console.log('Flow created:', flowId);

  // Create exec operation
  const { data: opRes } = await api.post('/operations', {
    name: 'Extract audio duration',
    key: 'extract_duration',
    type: 'exec',
    position_x: 19,
    position_y: 1,
    options: { code: SCRIPT },
    flow: flowId,
  });
  const opId = opRes.data.id;
  console.log('Operation created:', opId);

  // Link as first operation
  await api.patch(`/flows/${flowId}`, { operation: opId });
  console.log('Flow linked\n');
  console.log('✅ Active:', `${DIRECTUS_URL}/admin/settings/flows/${flowId}`);
}

run().catch(err => {
  console.error('Fatal:', JSON.stringify(err.response?.data, null, 2) || err.message);
  process.exit(1);
});
