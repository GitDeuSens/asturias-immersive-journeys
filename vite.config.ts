import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

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
          target: env.VITE_DIRECTUS_URL || 'http://localhost:8055',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/directus-api/, ''),
        },
      },
    },
    plugins: [
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
          // Ensure assets use relative paths for subdirectory deployment
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  };
});
