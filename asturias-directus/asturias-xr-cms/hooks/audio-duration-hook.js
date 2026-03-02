const { createReadStream } = require('fs');
const { parseFile } = require('music-metadata');
const axios = require('axios');

module.exports = function registerHook({ filter }, { services, getSchema }) {
  // Hook: когда файл загружается или обновляется
  filter('files.update', async (payload, meta) => {
    return await processFile(payload, meta, services);
  });

  filter('files.create', async (payload, meta) => {
    return await processFile(payload, meta, services);
  });

  // Helper функция для обработки файла
  async function processFile(payload, meta, services) {
    // Проверяем, что это аудиофайл
    if (!payload.type || !payload.type.startsWith('audio/')) {
      return payload;
    }

    try {
      // Получаем полный путь к файлу
      const fileId = payload.id || meta.key;
      const file = await services.Files.readOne(fileId);
      
      // Если длительность уже установлена, пропускаем
      if (file.duration) {
        return payload;
      }

      // Получаем URL файла
      const fileUrl = `${process.env.PUBLIC_URL || 'https://back.asturias.digitalmetaverso.com'}/assets/${file.id}`;
      
      // Скачиваем файл во временный буфер
      const response = await axios.get(fileUrl, { responseType: 'stream' });
      const chunks = [];
      
      for await (const chunk of response.data) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      
      // Извлекаем метаданные
      const metadata = await parseFile(buffer);
      
      if (metadata.format.duration) {
        // Обновляем поле duration в файле
        payload.duration = Math.round(metadata.format.duration);
        
        console.log(`[Audio Hook] Updated duration for file ${file.id}: ${payload.duration}s`);
        
        // Ищем связанные POI и обновляем audio_duration_seconds
        await updateRelatedPOIs(file.id, payload.duration, services);
      }
    } catch (error) {
      console.error('[Audio Hook] Error processing audio file:', error);
    }
    
    return payload;
  }

  // Helper функция для обновления связанных POI
  async function updateRelatedPOIs(fileId, duration, services) {
    try {
      const { ItemsService } = services;
      const poisService = new ItemsService('pois', { schema: await getSchema() });
      
      // Ищем POI где этот аудиофайл используется
      const pois = await poisService.readByQuery({
        filter: {
          _or: [
            { audio_es: { _eq: fileId } },
            { audio_en: { _eq: fileId } },
            { audio_fr: { _eq: fileId } }
          ]
        },
        fields: ['id', 'audio_es', 'audio_en', 'audio_fr', 'audio_duration_seconds']
      });

      for (const poi of pois) {
        // Обновляем audio_duration_seconds
        await poisService.updateOne(poi.id, {
          audio_duration_seconds: duration
        });
        
        console.log(`[Audio Hook] Updated POI ${poi.id} audio_duration_seconds: ${duration}s`);
      }
    } catch (error) {
      console.error('[Audio Hook] Error updating related POIs:', error);
    }
  }
};
