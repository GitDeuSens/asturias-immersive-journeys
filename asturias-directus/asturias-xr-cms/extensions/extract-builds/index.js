import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// Base path inside the Docker container (mapped via volume)
const BUILDS_ROOT = '/directus/builds';

export default ({ action }, { services, logger }) => {
  const { FilesService, ItemsService } = services;

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
    if (collection === 'tours_360' && payload.build_zip) {
      const itemsService = new ItemsService(collection, { schema: context.schema, accountability: context.accountability });
      for (const id of keys) {
        const item = await itemsService.readOne(id);
        await extractBuild({
          item: { ...item, ...payload },
          collection,
          buildSubdir: 'tours-builds',
          logPrefix: 'EXTRACT-TOUR',
          context,
          logger,
          services,
        });
      }
    }
    if (collection === 'ar_scenes' && payload.build_zip) {
      const itemsService = new ItemsService(collection, { schema: context.schema, accountability: context.accountability });
      for (const id of keys) {
        const item = await itemsService.readOne(id);
        await extractBuild({
          item: { ...item, ...payload },
          collection,
          buildSubdir: 'ar-builds',
          logPrefix: 'EXTRACT-AR',
          context,
          logger,
          services,
        });
      }
    }
  });
};

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
