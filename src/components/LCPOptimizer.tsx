// Re-export from consolidated PerformanceOptimizer for backward compatibility
import { useResourceHints, usePreloadImages } from './PerformanceOptimizer';

export function LCPOptimizer({ heroImage }: { heroImage?: string }) {
  usePreloadImages(heroImage ? [heroImage] : []);
  return null;
}

export function useLCPOptimization() {
  // No-op: content-visibility handled via CSS where needed
}

export function ResourceOptimizer() {
  useResourceHints();
  return null;
}
