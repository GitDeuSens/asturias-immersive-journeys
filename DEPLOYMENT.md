# Asturias Inmersivo - Deployment Guide

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Base Path Configuration

To deploy under a subdirectory (e.g., `https://domain.com/asturias/`):

### Option 1: Environment Variable (Recommended)

```bash
# Create .env.production file
echo "VITE_BASE_PATH=/asturias/" > .env.production

# Or set at build time
VITE_BASE_PATH=/asturias/ npm run build
```

### Option 2: Modify vite.config.ts

```typescript
export default defineConfig({
  base: '/asturias/',
  // ...
});
```

## Platform-Specific Deployment

### Netlify
1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The `_redirects` file handles SPA routing

### Vercel
1. Import your repository
2. Framework: Vite
3. The `vercel.json` handles SPA routing

### Apache Server
1. Upload contents of `dist/` folder
2. The `.htaccess` file handles SPA routing
3. Ensure `mod_rewrite` is enabled

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/asturias;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Azure / IIS
1. Upload contents of `dist/` folder
2. The `web.config` handles SPA routing

### Cloudflare Pages
1. Connect repository
2. Build command: `npm run build`
3. Build output: `dist`
4. The `_redirects` file handles SPA routing

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BASE_PATH` | Subdirectory path | `/asturias/` |
| `VITE_GA4_ID` | Google Analytics 4 ID | `G-XXXXXXXXXX` |
| `VITE_DIRECTUS_URL` | Directus CMS URL | `https://cms.example.com` |

## SEO-Friendly URLs

The app uses slug-based URLs for better SEO:

```
/tours/museo-del-ferrocarril-mf-1
/routes/ruta-de-la-sidra-ar-2
/ar/termas-romanas-valduno
```

Slugs are generated from item titles + IDs for uniqueness.

## Redirects

Common redirects are configured in `_redirects` and server configs:

- All unknown routes → `index.html` (SPA fallback)
- 404 page shows helpful suggestions based on attempted URL

## Performance Optimizations

- Code splitting with lazy loading
- Asset caching with content hashes
- Gzip/Brotli compression (server-dependent)
- Image optimization (use WebP where possible)

## Troubleshooting

### Blank page after deployment
- Check `base` path matches your server configuration
- Verify all assets load (check browser Network tab)
- Ensure SPA fallback is configured

### 404 on page refresh
- SPA routing not configured on server
- Check appropriate config file is in place

### Assets not loading
- `base` path mismatch
- Check asset paths in built files
