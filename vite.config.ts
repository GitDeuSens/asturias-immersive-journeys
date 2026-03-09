import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { componentTagger } from "lovable-tagger";
import fs from 'fs';
import path from 'path';
// mkcert removed — breaks Lovable sandbox
// https://vitejs.dev/config/
// BASE_PATH configuration:
// - Set VITE_BASE_PATH env variable to deploy under a subdirectory
// - Example: VITE_BASE_PATH=/asturias/ → accessible at domain.com/asturias/
// - Leave empty or "/" for root deployment
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_BASE_PATH || '/';
  return {
    base: basePath,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
  '/directus-api': {
    target: env.VITE_DIRECTUS_INTERNAL_URL || 'https://back.asturias.digitalmetaverso.com',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/directus-api/, ''),
  },
  '/directus-assets': {
    target: 'https://back.asturias.digitalmetaverso.com',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/directus-assets/, '/assets'),
  },
},
    },
    plugins: [
      // mkcert() removed — breaks sandbox
      // Serve /tours-builds/ as static files BEFORE SPA fallback
      {
        name: 'serve-tours-builds',
        configureServer(server: any) {
          server.middlewares.use((req: any, res: any, next: any) => {
            if (req.url && (req.url.startsWith('/tours-builds/') || req.url.startsWith('/ar-builds/'))) {
              let filePath = path.join(process.cwd(), 'public', req.url);
              
              // If path ends with / try index.htm then index.html
              if (req.url.endsWith('/')) {
                const htmPath = filePath + 'index.htm';
                const htmlPath = filePath + 'index.html';
                if (fs.existsSync(htmPath)) filePath = htmPath;
                else if (fs.existsSync(htmlPath)) filePath = htmlPath;
                else { next(); return; }
              }

              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes: Record<string, string> = {
                  '.html': 'text/html', '.htm': 'text/html',
                  '.js': 'application/javascript', '.css': 'text/css',
                  '.json': 'application/json', '.png': 'image/png',
                  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                  '.gif': 'image/gif', '.svg': 'image/svg+xml',
                  '.webp': 'image/webp', '.ico': 'image/x-icon',
                  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
                  '.webm': 'video/webm', '.woff': 'font/woff',
                  '.woff2': 'font/woff2', '.ttf': 'font/ttf',
                  '.xml': 'application/xml',
                };
                const contentType = mimeTypes[ext] || 'application/octet-stream';
                res.setHeader('Content-Type', contentType);
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            }
            next();
          });
        },
      },
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          manualChunks(id) {
            // Core vendor
            if (id.includes('react-dom')) return 'vendor';
            if (id.includes('node_modules/react/')) return 'vendor';
            // Router
            if (id.includes('react-router')) return 'router';
            // UI primitives — group all radix
            if (id.includes('@radix-ui')) return 'ui';
            // Maps
            if (id.includes('leaflet')) return 'maps';
            // Icons — large, rarely changes
            if (id.includes('lucide-react')) return 'icons';
            // Animations
            if (id.includes('framer-motion')) return 'animations';
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
            // Analytics (recharts + d3) — only on analytics page
            if (id.includes('recharts') || id.includes('d3-')) return 'analytics';
            // Directus SDK
            if (id.includes('@directus')) return 'directus';
            // React Query
            if (id.includes('@tanstack')) return 'query';
            // Rapier physics — separate from three.js
            if (id.includes('rapier')) return 'rapier';
            // Three.js / Needle — heavy, lazy loaded only for AR
            if (id.includes('three') || id.includes('needle')) return 'three';
          },
        },
      },
      chunkSizeWarningLimit: 300,
      // Enable minification optimizations
      minify: 'esbuild',
      target: 'es2020',
      cssMinify: true,
    },
  };
});
