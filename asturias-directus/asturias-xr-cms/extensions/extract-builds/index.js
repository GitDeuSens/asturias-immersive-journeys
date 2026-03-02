import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import { parseFile } from 'music-metadata';

// Base path inside the Docker container (mapped via volume)
const BUILDS_ROOT = '/directus/builds';

export default ({ action }, { services, logger, getSchema }) => {
  const { FilesService, ItemsService } = services;

  // ============================================
  // TRIGGER: Audio file upload → extract duration
  // ============================================
  action('files.upload', async (input, context) => {
    await processAudioDuration(input.payload, input.key, context, { services, logger, getSchema });
  });

  // ============================================
  // TRIGGER: Создание tours_360 / ar_scenes
  // ============================================
  action('items.create', async ({ payload, key, collection }, context) => {
    if (collection === 'tours_360' && payload.build_zip) {
      await extractBuild({
        item: { ...payload, id: key },
        collection,
        buildSubdir: 'tours-builds',
        logPrefix: 'EXTRACT-TOUR',
        context,
        logger,
        services,
      });
    }
    if (collection === 'ar_scenes' && payload.build_zip) {
      await extractBuild({
        item: { ...payload, id: key },
        collection,
        buildSubdir: 'ar-builds',
        logPrefix: 'EXTRACT-AR',
        context,
        logger,
        services,
      });
    }
  });

  // ============================================
  // TRIGGER: Обновление tours_360 / ar_scenes
  // ============================================
  action('items.update', async ({ payload, keys, collection }, context) => {
    const configs = {
      tours_360:  { buildSubdir: 'tours-builds', logPrefix: 'EXTRACT-TOUR' },
      ar_scenes:  { buildSubdir: 'ar-builds',    logPrefix: 'EXTRACT-AR' },
    };

    const config = configs[collection];
    if (!config) return;
    if (!('build_zip' in payload)) return; // field not touched

    const itemsService = new ItemsService(collection, { schema: context.schema, accountability: context.accountability });

    for (const id of keys) {
      const item = await itemsService.readOne(id);
      const merged = { ...item, ...payload };

      if (merged.build_zip) {
        // New ZIP uploaded → extract it
        await extractBuild({
          item: merged,
          collection,
          buildSubdir: config.buildSubdir,
          logPrefix: config.logPrefix,
          context,
          logger,
          services,
        });
      } else {
        // build_zip cleared → remove old build and clear build_path
        await cleanupBuild({
          item,
          collection,
          buildSubdir: config.buildSubdir,
          logPrefix: config.logPrefix,
          context,
          logger,
          services,
        });
      }
    }
  });
};

// ============================================
// AUDIO DURATION EXTRACTOR — writes duration to directus_files on upload
// Frontend reads duration directly via M2O expand: audio_es.duration
// ============================================
async function processAudioDuration(payload, fileId, context, { services, logger, getSchema }) {
  if (!fileId) return;
  try {
    const schema = context?.schema || (await getSchema());
    const filesService = new services.FilesService({ schema, accountability: null });
    const file = await filesService.readOne(fileId);

    if (!file || !file.type || !file.type.startsWith('audio/')) return;
    if (file.duration) {
      logger.info(`[AUDIO-DURATION] Already set: ${file.filename_download} = ${file.duration}s`);
      return;
    }

    const filePath = path.join('/directus/uploads', file.filename_disk);
    if (!existsSync(filePath)) {
      logger.warn(`[AUDIO-DURATION] File not on disk: ${filePath}`);
      return;
    }

    const metadata = await parseFile(filePath);
    if (!metadata.format.duration) return;

    const durationSec = Math.round(metadata.format.duration);
    await filesService.updateOne(fileId, { duration: durationSec });
    logger.info(`[AUDIO-DURATION] ${file.filename_download} → ${durationSec}s`);
  } catch (err) {
    logger.error(`[AUDIO-DURATION] Error for ${fileId}: ${err.message}`);
  }
}

// ============================================
// UNIVERSAL BUILD EXTRACTOR
// ============================================
async function extractBuild({ item, collection, buildSubdir, logPrefix, context, logger, services }) {
  const { FilesService, ItemsService } = services;
  const { schema, accountability } = context;
  const filesService = new FilesService({ schema, accountability });
  const itemsService = new ItemsService(collection, { schema, accountability });

  try {
    if (!item.slug) {
      logger.warn(`[${logPrefix}] Skipping: item has no slug`);
      return;
    }

    logger.info(`[${logPrefix}] Processing: ${item.slug} (id: ${item.id})`);

    // 1. Получить метаданные ZIP файла
    const zipFile = await filesService.readOne(item.build_zip);
    const zipPath = path.join('/directus/uploads', zipFile.filename_disk);

    if (!existsSync(zipPath)) {
      throw new Error(`ZIP file not found on disk: ${zipPath}`);
    }

    logger.info(`[${logPrefix}] ZIP: ${zipFile.filename_download} (${zipFile.filename_disk})`);

    // 2. Удалить старый билд если существует
    const extractPath = path.join(BUILDS_ROOT, buildSubdir, item.slug);

    if (existsSync(extractPath)) {
      logger.info(`[${logPrefix}] Removing old build: ${extractPath}`);
      await fs.rm(extractPath, { recursive: true, force: true });
    }

    // 3. Создать папку назначения
    await fs.mkdir(extractPath, { recursive: true });

    logger.info(`[${logPrefix}] Extracting to: ${extractPath}`);

    // 4. Распаковать ZIP
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // 5. Получить список файлов
    const files = await listFilesRecursive(extractPath);

    logger.info(`[${logPrefix}] Extracted ${files.length} files`);

    // 6. Найти index.html (может быть в подпапке от 3DVista)
    const indexFile = files.find(f => f.endsWith('index.html'));

    if (!indexFile) {
      throw new Error('index.html not found in ZIP archive');
    }

    // Если index.html в подпапке — переместить всё на уровень выше
    const indexRelative = path.relative(extractPath, indexFile);
    const indexDir = path.dirname(indexRelative);

    if (indexDir && indexDir !== '.') {
      logger.info(`[${logPrefix}] index.html found in subdirectory: ${indexDir}, flattening...`);

      const nestedRoot = path.join(extractPath, indexDir);
      const tempPath = extractPath + '__temp';

      // Переименовать вложенную папку → temp, удалить extractPath, переименовать temp → extractPath
      await fs.rename(nestedRoot, tempPath);
      await fs.rm(extractPath, { recursive: true, force: true });
      await fs.rename(tempPath, extractPath);

      // Пересчитать файлы
      const newFiles = await listFilesRecursive(extractPath);
      logger.info(`[${logPrefix}] Flattened: ${newFiles.length} files at root level`);
    }

    // 7. Обновить build_path в записи
    const buildPath = `/${buildSubdir}/${item.slug}/`;

    await itemsService.updateOne(item.id, {
      build_path: buildPath,
    });

    logger.info(`[${logPrefix}] ✅ SUCCESS: ${buildPath}`);

  } catch (error) {
    logger.error(`[${logPrefix}] ❌ ERROR for "${item.slug}": ${error.message}`);
    logger.error(error.stack);
    // Не бросаем ошибку — сохранение элемента не должно блокироваться
  }
}

// ============================================
// CLEANUP: remove old build when build_zip is cleared
// ============================================
async function cleanupBuild({ item, collection, buildSubdir, logPrefix, context, logger, services }) {
  const { ItemsService } = services;
  const { schema, accountability } = context;
  const itemsService = new ItemsService(collection, { schema, accountability });

  try {
    if (!item.slug) return;

    const extractPath = path.join(BUILDS_ROOT, buildSubdir, item.slug);

    if (existsSync(extractPath)) {
      logger.info(`[${logPrefix}] build_zip cleared → removing build: ${extractPath}`);
      await fs.rm(extractPath, { recursive: true, force: true });
    }

    // Clear build_path so frontend doesn't try to load stale content
    await itemsService.updateOne(item.id, { build_path: null });
    logger.info(`[${logPrefix}] ✅ Cleaned up build for "${item.slug}"`);

  } catch (error) {
    logger.error(`[${logPrefix}] ❌ Cleanup error for "${item.slug}": ${error.message}`);
  }
}

// ============================================
// HELPER: рекурсивный список файлов
// ============================================
async function listFilesRecursive(dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await listFilesRecursive(fullPath);
      results.push(...sub);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}
