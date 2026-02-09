// Image optimization utilities
export function generateWebPSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => `${baseUrl}?w=${width}&format=webp ${width}w`)
    .join(', ');
}

export function generateResponsiveSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
}

export function getOptimalWidths(): number[] {
  return [320, 640, 768, 1024, 1280, 1536];
}

export function preloadCriticalImages(urls: string[]): void {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}
