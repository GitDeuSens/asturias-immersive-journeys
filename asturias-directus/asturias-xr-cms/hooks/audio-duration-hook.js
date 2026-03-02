const { parseBuffer } = require('music-metadata');
const axios = require('axios');

module.exports = function registerHook({ action }, { services, getSchema }) {
  // Срабатывает ПОСЛЕ загрузки нового файла
  action('files.upload', async ({ key }) => {
    await processDuration(key, services);
  });

  // Срабатывает ПОСЛЕ обновления файла
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

      // Только аудиофайлы
      if (!file.type || !file.type.startsWith('audio/')) return;

      // Уже есть длительность — пропускаем
      if (file.duration) {
        console.log(`[Audio Hook] Already has duration: ${fileId} = ${file.duration}s`);
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
      } else {
        console.warn(`[Audio Hook] Could not extract duration for ${fileId}`);
      }
    } catch (error) {
      console.error(`[Audio Hook] Error for ${fileId}:`, error.message || error);
    }
  }
};
