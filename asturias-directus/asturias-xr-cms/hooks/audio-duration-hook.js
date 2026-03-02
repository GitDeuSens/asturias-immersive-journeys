const { parseBuffer } = require('music-metadata');
const axios = require('axios');

module.exports = function registerHook({ action }, { services, getSchema }) {
  action('files.upload', async ({ key }) => {
    await processDuration(key, services);
  });

  action('files.update', async ({ keys }) => {
    const ids = Array.isArray(keys) ? keys : [keys];
    for (const id of ids) {
      await processDuration(id, services);
    }
  });

  async function processDuration(fileId, services) {
    try {
      const schema = await getSchema();
      const filesService = new services.FilesService({ schema });
      const file = await filesService.readOne(fileId);

      if (!file) return;
      if (!file.type || !file.type.startsWith('audio/')) return;

      if (file.duration) {
        console.log(`[Audio Hook] Already has duration: ${fileId} = ${file.duration}s`);
        // Still update POI fields even if file already has duration
        await updatePOIDurations(fileId, file.duration, services, schema);
        return;
      }

      const baseUrl = process.env.PUBLIC_URL || 'https://back.asturias.digitalmetaverso.com';
      const token = process.env.ADMIN_TOKEN || 'asturias-creator-hub-admin-2024';
      const fileUrl = `${baseUrl}/assets/${fileId}`;

      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);
      const metadata = await parseBuffer(buffer, { mimeType: file.type });

      if (metadata.format.duration) {
        const durationSec = Math.round(metadata.format.duration);
        await filesService.updateOne(fileId, { duration: durationSec });
        console.log(`[Audio Hook] Set duration for ${fileId}: ${durationSec}s`);
        await updatePOIDurations(fileId, durationSec, services, schema);
      } else {
        console.warn(`[Audio Hook] Could not extract duration for ${fileId}`);
      }
    } catch (error) {
      console.error(`[Audio Hook] Error for ${fileId}:`, error.message || error);
    }
  }

  // Update audio_duration_seconds_es/en/fr on POIs that reference this file
  async function updatePOIDurations(fileId, durationSec, services, schema) {
    try {
      const poisService = new services.ItemsService('pois', { schema });

      // Check each language field separately
      const langFields = [
        { field: 'audio_es', durationField: 'audio_duration_seconds_es' },
        { field: 'audio_en', durationField: 'audio_duration_seconds_en' },
        { field: 'audio_fr', durationField: 'audio_duration_seconds_fr' },
      ];

      for (const { field, durationField } of langFields) {
        const pois = await poisService.readByQuery({
          filter: { [field]: { _eq: fileId } },
          fields: ['id'],
        });

        for (const poi of pois) {
          await poisService.updateOne(poi.id, { [durationField]: durationSec });
          console.log(`[Audio Hook] Updated POI ${poi.id} ${durationField}: ${durationSec}s`);
        }
      }
    } catch (error) {
      console.error(`[Audio Hook] Error updating POI durations:`, error.message || error);
    }
  }
};
