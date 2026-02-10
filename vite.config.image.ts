import imagemin from 'vite-plugin-imagemin';

// Image optimization configuration
export const imageOptimization = imagemin({
  // Optimize all images
  gifsicle: { optimizationLevel: 7 },
  mozjpeg: { quality: 85, progressive: true },
  pngquant: { quality: [0.65, 0.8], speed: 4 },
  optipng: { optimizationLevel: 7 },
  svgo: {
    plugins: [
      {
        name: 'removeViewBox',
        active: false,
      },
      {
        name: 'removeEmptyAttrs',
        active: false,
      },
    ],
  },
  
  // Cache optimized images
  cache: true,
  cacheLocation: 'node_modules/.cache/imagemin',
});

// Manual chunk splitting for better caching
export const manualChunks = {
  vendor: ['react', 'react-dom'],
  router: ['react-router-dom'],
  ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  maps: ['leaflet', 'react-leaflet'],
  animations: ['framer-motion'],
  i18n: ['react-i18next'],
  directus: ['@directus/sdk'],
  query: ['@tanstack/react-query'],
};
