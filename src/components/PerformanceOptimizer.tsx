import { useEffect, useRef } from 'react';

// Hook for preloading critical images
export function usePreloadImages(srcs: string[]) {
  useEffect(() => {
    srcs.forEach(src => {
      const img = new Image();
      img.src = src;
      img.fetchPriority = 'high';
    });
  }, [srcs]);
}

// Component for preloading hero images
export function ImagePreloader({ images }: { images: string[] }) {
  usePreloadImages(images);
  return null;
}

// Hook for optimizing font loading
export function useFontOptimization() {
  useEffect(() => {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Optimize font display
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter Variable';
        font-display: swap;
        src: url('/fonts/inter-var.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(style);
    };
  }, []);
}

// Hook for bfcache optimization
export function useBFCacheOptimization() {
  useEffect(() => {
    // Optimize for back/forward cache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);
}

// Component for performance monitoring
export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          // LCP metric
        }
        if (entry.entryType === 'layout-shift') {
          // CLS metric
        }
        if (entry.entryType === 'first-input') {
          // FID metric
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'] });

    return () => observer.disconnect();
  }, []);

  return null;
}

// Hook for resource hints
export function useResourceHints() {
  useEffect(() => {
    // DNS prefetch for external domains
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = '//' + new URL(import.meta.env.VITE_DIRECTUS_URL || 'https://back.asturias.digitalmetaverso.com').host;
    document.head.appendChild(dnsPrefetch);

    // Preconnect to Directus API
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = import.meta.env.VITE_DIRECTUS_URL || 'https://back.asturias.digitalmetaverso.com';
    document.head.appendChild(preconnect);

    return () => {
      document.head.removeChild(dnsPrefetch);
      document.head.removeChild(preconnect);
    };
  }, []);
}

// Component for optimizing script loading
export function ScriptOptimizer() {
  useEffect(() => {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script:not([data-critical])');
    scripts.forEach(script => {
      const htmlScript = script as HTMLScriptElement;
      if (!htmlScript.defer && !htmlScript.async) {
        htmlScript.defer = true;
      }
    });
  }, []);

  return null;
}
