// Directus Endpoint Extension: serve extracted build files + bulk extract
// Serves static files from /directus/builds/ via /builds/* route
import path from 'path';
import { existsSync, createReadStream, statSync } from 'fs';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';

const BUILDS_ROOT = '/directus/builds';

// MIME type map for common build file types
const MIME_TYPES = {
  '.html': 'text/html',
  '.htm':  'text/html',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.mp3':  'audio/mpeg',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
  '.glb':  'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin':  'application/octet-stream',
  '.wasm': 'application/wasm',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
  '.map':  'application/json',
};

// Helper: recursive file listing
async function listFilesRecursive(dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(fullPath)));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

// Extract a single build from ZIP
async function extractSingleBuild({ item, buildSubdir, filesService, itemsService, collection, logger }) {
  if (!item.slug) {
    logger.warn(`[EXTRACT-ALL] Skipping item ${item.id}: no slug`);
    return { id: item.id, status: 'skipped', reason: 'no slug' };
  }
  if (!item.build_zip) {
    return { id: item.id, slug: item.slug, status: 'skipped', reason: 'no build_zip' };
  }

  try {
    const zipFile = await filesService.readOne(item.build_zip);
    const zipPath = path.join('/directus/uploads', zipFile.filename_disk);

    if (!existsSync(zipPath)) {
      return { id: item.id, slug: item.slug, status: 'error', reason: 'ZIP not on disk' };
    }

    const extractPath = path.join(BUILDS_ROOT, buildSubdir, item.slug);

    // Remove old build
    if (existsSync(extractPath)) {
      await fs.rm(extractPath, { recursive: true, force: true });
    }
    await fs.mkdir(extractPath, { recursive: true });

    // Extract
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    const files = await listFilesRecursive(extractPath);
    const indexFile = files.find(f => f.endsWith('index.html') || f.endsWith('index.htm'));

    if (!indexFile) {
      return { id: item.id, slug: item.slug, status: 'error', reason: 'no index.html in ZIP' };
    }

    // Flatten if index is in subdirectory
    const indexRelative = path.relative(extractPath, indexFile);
    const indexDir = path.dirname(indexRelative);
    if (indexDir && indexDir !== '.') {
      const nestedRoot = path.join(extractPath, indexDir);
      const tempPath = extractPath + '__temp';
      await fs.rename(nestedRoot, tempPath);
      await fs.rm(extractPath, { recursive: true, force: true });
      await fs.rename(tempPath, extractPath);
    }

    // Update build_path
    const buildPath = `/${buildSubdir}/${item.slug}/`;
    await itemsService.updateOne(item.id, { build_path: buildPath });

    const finalFiles = await listFilesRecursive(extractPath);
    logger.info(`[EXTRACT-ALL] ✅ ${item.slug}: ${finalFiles.length} files → ${buildPath}`);
    return { id: item.id, slug: item.slug, status: 'extracted', files: finalFiles.length, build_path: buildPath };
  } catch (err) {
    logger.error(`[EXTRACT-ALL] ❌ ${item.slug}: ${err.message}`);
    return { id: item.id, slug: item.slug, status: 'error', reason: err.message };
  }
}

export default {
  id: 'builds',
  handler: (router, { services, logger, getSchema }) => {

    // =========================================================
    // POST /builds/extract-all — bulk extract all pending builds
    // Usage: POST https://back.asturias.digitalmetaverso.com/builds/extract-all
    //   Header: Authorization: Bearer <admin-token>
    //   Query:  ?force=true  — re-extract even if build_path already set
    // =========================================================
    router.post('/extract-all', async (req, res) => {
      try {
        const schema = await getSchema();
        const accountability = req.accountability;

        // Require admin token or logged-in admin user
        if (!accountability?.admin) {
          return res.status(403).json({ error: 'Admin access required. Pass Authorization: Bearer <admin-token>' });
        }

        const { ItemsService, FilesService } = services;
        const filesService = new FilesService({ schema, accountability });

        const collections = [
          { name: 'tours_360', buildSubdir: 'tours-builds' },
          { name: 'ar_scenes', buildSubdir: 'ar-builds' },
        ];

        // ?force=true to re-extract even if build_path exists
        const force = req.query.force === 'true';

        const results = [];

        for (const col of collections) {
          const itemsService = new ItemsService(col.name, { schema, accountability });

          const filter = force
            ? { build_zip: { _nnull: true } }
            : { build_zip: { _nnull: true }, build_path: { _null: true } };

          const items = await itemsService.readByQuery({
            filter,
            fields: ['id', 'slug', 'build_zip', 'build_path'],
            limit: -1,
          });

          logger.info(`[EXTRACT-ALL] ${col.name}: found ${items.length} items to process`);

          for (const item of items) {
            const result = await extractSingleBuild({
              item,
              buildSubdir: col.buildSubdir,
              filesService,
              itemsService,
              collection: col.name,
              logger,
            });
            results.push({ collection: col.name, ...result });
          }
        }

        const extracted = results.filter(r => r.status === 'extracted').length;
        const skipped = results.filter(r => r.status === 'skipped').length;
        const errors = results.filter(r => r.status === 'error').length;

        res.json({
          message: `Processed ${results.length} items: ${extracted} extracted, ${skipped} skipped, ${errors} errors`,
          results,
        });
      } catch (err) {
        logger.error(`[EXTRACT-ALL] Fatal: ${err.message}`);
        res.status(500).json({ error: err.message });
      }
    });

    // =========================================================
    // GET /builds/* — serve static build files
    // =========================================================
    router.get('/*', (req, res) => {
      const reqPath = req.params[0] || '';

      // Security: prevent directory traversal
      const normalized = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(BUILDS_ROOT, normalized);

      if (!filePath.startsWith(BUILDS_ROOT)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // If path is a directory, try index.html then index.htm
      let resolvedPath = filePath;
      if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        if (existsSync(path.join(filePath, 'index.html'))) {
          resolvedPath = path.join(filePath, 'index.html');
        } else if (existsSync(path.join(filePath, 'index.htm'))) {
          resolvedPath = path.join(filePath, 'index.htm');
        } else {
          return res.status(404).json({ error: 'No index file found' });
        }
      }

      if (!existsSync(resolvedPath) || statSync(resolvedPath).isDirectory()) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set content type
      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);

      // Cache static assets (not HTML)
      if (ext !== '.html' && ext !== '.htm') {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }

      // Allow embedding in iframes — override Directus CSP
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
      res.setHeader('X-Frame-Options', 'ALLOWALL');

      // CORS for cross-origin iframe loading
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      // Stream the file
      const stat = statSync(resolvedPath);
      res.setHeader('Content-Length', stat.size);
      createReadStream(resolvedPath).pipe(res);
    });
  },
};
