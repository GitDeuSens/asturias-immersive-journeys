/**
 * Creates a Directus Flow that automatically calculates audio duration
 * when a file is uploaded, and updates audio_duration_seconds / _en / _fr on POIs.
 *
 * Trigger : Event Hook → files.upload (action)
 * Operation: Run Script (exec) — available in Directus 10.10
 *
 * The exec sandbox exposes:
 *   $trigger, $accountability, $env, $services, $database, $logger, $getSchema, module
 * "module" lets you require npm packages already installed in the Directus container.
 */
const axios = require('axios');

const DIRECTUS_URL = 'https://back.asturias.digitalmetaverso.com';
const TOKEN = 'asturias-creator-hub-admin-2024';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
});

// The script that runs inside the Directus exec sandbox
const EXEC_SCRIPT = `
module.exports = async function({ $trigger, $services, $getSchema, $logger }) {
  const fileId = $trigger.key;
  if (!fileId) return {};

  const schema = await $getSchema();
  const { FilesService, ItemsService } = $services;

  const filesService = new FilesService({ schema, accountability: null });
  const file = await filesService.readOne(fileId);

  if (!file || !file.type || !file.type.startsWith('audio/')) return {};
  if (file.duration) {
    $logger.info('[AudioDuration] Already set: ' + fileId + ' = ' + file.duration + 's');
    // Still sync to POI fields
  }

  let durationSec = file.duration;

  if (!durationSec) {
    try {
      const https = require('https');
      const { parseBuffer } = require('music-metadata');

      const buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        const url = new URL('${DIRECTUS_URL}/assets/' + fileId);
        const options = { hostname: url.hostname, path: url.pathname, headers: { Authorization: 'Bearer ${TOKEN}' } };
        https.get(options, res => {
          res.on('data', c => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });

      const metadata = await parseBuffer(buffer, { mimeType: file.type });
      if (metadata.format.duration) {
        durationSec = Math.round(metadata.format.duration);
        await filesService.updateOne(fileId, { duration: durationSec });
        $logger.info('[AudioDuration] Extracted ' + durationSec + 's for ' + fileId);
      }
    } catch (err) {
      $logger.error('[AudioDuration] Error: ' + err.message);
      return {};
    }
  }

  if (!durationSec) return {};

  // Update audio_duration_seconds / _en / _fr on any POI referencing this file
  const poisService = new ItemsService('pois', { schema, accountability: null });
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
      $logger.info('[AudioDuration] Updated POI ' + poi.id + ' ' + durationField + '=' + durationSec);
    }
  }

  return { fileId, durationSec };
};
`;

async function run() {
  // Remove existing flow with same name if any
  const { data: existing } = await api.get('/flows', { params: { 'filter[name][_eq]': 'Auto Audio Duration' } });
  for (const f of existing.data) {
    await api.delete(`/flows/${f.id}`);
    console.log(`Deleted existing flow: ${f.id}`);
  }

  // 1. Create the Flow
  console.log('Creating flow...');
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
  console.log(`  Flow created: ${flowId}`);

  // 2. Create exec operation
  console.log('Creating exec operation...');
  const { data: opRes } = await api.post('/operations', {
    name: 'Extract and save audio duration',
    key: 'extract_duration',
    type: 'exec',
    position_x: 19,
    position_y: 1,
    options: { code: EXEC_SCRIPT },
    flow: flowId,
    resolve: null,
    reject: null,
  });
  const opId = opRes.data.id;
  console.log(`  Operation created: ${opId}`);

  // 3. Link operation as first step
  await api.patch(`/flows/${flowId}`, { operation: opId });
  console.log('  Flow linked to operation\n');

  console.log('✅ Flow "Auto Audio Duration" is active!');
  console.log(`   ${DIRECTUS_URL}/admin/settings/flows/${flowId}`);
}

run().catch(err => {
  console.error('Fatal:', JSON.stringify(err.response?.data) || err.message);
  process.exit(1);
});
