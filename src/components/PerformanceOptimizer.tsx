import { useEffect } from 'react';
import { DIRECTUS_URL } from '@/lib/directus-url';

/**
 * Consolidated performance optimizations.
 * Replaces separate LCPOptimizer, WebSocketManager, ScriptOptimizer etc.
 */

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

// Hook for resource hints (DNS prefetch + preconnect to API)
export function useResourceHints() {
  useEffect(() => {
    const host = new URL(DIRECTUS_URL).host;

    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = `//${host}`;
    document.head.appendChild(dnsPrefetch);

    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = DIRECTUS_URL;
    document.head.appendChild(preconnect);

    return () => {
      dnsPrefetch.parentNode?.removeChild(dnsPrefetch);
      preconnect.parentNode?.removeChild(preconnect);
    };
  }, []);
}

// Hook for bfcache optimization
export function useBFCacheOptimization() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.dispatchEvent(new CustomEvent('bfcache-restore'));
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);
}

// Lightweight font optimization
export function useFontOptimization() {
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    return () => {
      fontLink.parentNode?.removeChild(fontLink);
    };
  }, []);
}

// Empty components kept for backward compatibility but with zero overhead
export function PerformanceMonitor() { return null; }
export function ScriptOptimizer() { return null; }
export function ImagePreloader({ images }: { images: string[] }) {
  usePreloadImages(images);
  return null;
}
