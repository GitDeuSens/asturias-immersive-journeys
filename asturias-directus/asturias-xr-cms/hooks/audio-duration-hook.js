const { parseBuffer } = require('music-metadata');
const axios = require('axios');

module.exports = function registerHook({ action }, { services, getSchema }) {
  // action срабатывает ПОСЛЕ сохранения файла — ID уже доступен
  action('files.upload', async ({ payload, key }) => {
    await processFile(key, payload, services);
  });

  action('files.update', async ({ payload, keys }) => {
    const fileId = Array.isArray(keys) ? keys[0] : keys;
    if (fileId) await processFile(fileId, payload, services);
  });

  async function processFile(fileId, payload, services) {
    // Проверяем тип по payload или перечитываем файл
    try {
      const schema = await getSchema();
      const filesService = new services.FilesService({ schema });
      const file = await filesService.readOne(fileId);

      if (!file) return;
      if (!file.type || !file.type.startsWith('audio/')) return;

      // Если длительность уже установлена — пропускаем
      if (file.duration) {
        console.log(`[Audio Hook] Duration already set for ${fileId}: ${file.duration}s`);
        return;
      }

      const fileUrl = `${process.env.PUBLIC_URL || 'https://back.asturias.digitalmetaverso.com'}/assets/${fileId}`;

      // Скачиваем файл в буфер
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN || ''}` },
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);

      // Извлекаем метаданные (parseBuffer принимает буфер, parseFile — путь)
      const metadata = await parseBuffer(buffer, file.type);

      if (metadata.format.duration) {
        const durationSec = Math.round(metadata.format.duration);

        // Обновляем duration у файла
        await filesService.updateOne(fileId, { duration: durationSec });
        console.log(`[Audio Hook] Updated duration for file ${fileId}: ${durationSec}s`);

        // Обновляем audio_duration_seconds у связанных POI
        await updateRelatedPOIs(fileId, durationSec, services, schema);
      }
    } catch (error) {
      console.error('[Audio Hook] Error processing audio file:', error.message || error);
    }
  }

  async function updateRelatedPOIs(fileId, duration, services, schema) {
    try {
      const poisService = new services.ItemsService('pois', { schema });

      const pois = await poisService.readByQuery({
        filter: {
          _or: [
            { audio_es: { _eq: fileId } },
            { audio_en: { _eq: fileId } },
            { audio_fr: { _eq: fileId } },
          ],
        },
        fields: ['id'],
      });

      for (const poi of pois) {
        await poisService.updateOne(poi.id, { audio_duration_seconds: duration });
        console.log(`[Audio Hook] Updated POI ${poi.id} audio_duration_seconds: ${duration}s`);
      }
    } catch (error) {
      console.error('[Audio Hook] Error updating related POIs:', error.message || error);
    }
  }
};
