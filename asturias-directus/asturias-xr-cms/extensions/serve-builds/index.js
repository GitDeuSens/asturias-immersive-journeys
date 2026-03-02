// Directus Endpoint Extension: serve extracted build files
// Serves static files from /directus/builds/ via /builds/* route
import path from 'path';
import { existsSync, createReadStream, statSync } from 'fs';

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

export default {
  id: 'builds',
  handler: (router) => {
    // Serve: GET /builds/tours-builds/{slug}/{...filepath}
    // Serve: GET /builds/ar-builds/{slug}/{...filepath}
    router.get('/*', (req, res) => {
      // req.params[0] contains everything after /builds/
      const reqPath = req.params[0] || '';

      // Security: prevent directory traversal
      const normalized = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(BUILDS_ROOT, normalized);

      // Ensure we stay within BUILDS_ROOT
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
