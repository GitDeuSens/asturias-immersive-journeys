// Image optimization utilities for WebP/AVIF support

export interface ImageFormats {
  webp: string;
  avif: string;
  original: string;
}

// Generate optimized image URLs with different formats
export function generateImageFormats(originalUrl: string): ImageFormats {
  // If it's already an external URL, return as-is
  if (!originalUrl.startsWith('/')) {
    return {
      webp: originalUrl,
      avif: originalUrl,
      original: originalUrl,
    };
  }

  // Generate optimized URLs for local assets
  const baseUrl = originalUrl.replace(/\.[^/.]+$/, '');
  
  return {
    webp: `${baseUrl}.webp`,
    avif: `${baseUrl}.avif`,
    original: originalUrl,
  };
}

// Check browser support for modern image formats
export function checkImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
} {
  if (typeof window === 'undefined') {
    return { webp: false, avif: false };
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return { webp: false, avif: false };
  }

  // Check WebP support
  const webpDataUrl = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAADAAAAAoABAAFAAQyAAEDABAAAQ';
  const webpSupported = canvas.toDataURL('image/webp').indexOf(webpDataUrl) === 0;

  // Check AVIF support
  const avifDataUrl = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0AAACAAAACAGDQAAAAAAAAAAA';
  const avifSupported = canvas.toDataURL('image/avif').indexOf(avifDataUrl) === 0;

  return { webp: webpSupported, avif: avifSupported };
}

// Get the best image format for the current browser
export function getBestImageFormat(formats: ImageFormats): string {
  const support = checkImageFormatSupport();
  
  if (support.avif) return formats.avif;
  if (support.webp) return formats.webp;
  return formats.original;
}

// Generate responsive srcset for different screen densities
export function generateSrcSet(baseUrl: string, formats: ImageFormats): string {
  const support = checkImageFormatSupport();
  const baseFormat = support.avif ? formats.avif : support.webp ? formats.webp : formats.original;
  
  // Generate different sizes for responsive images
  const sizes = [1, 1.5, 2, 3];
  return sizes
    .map(scale => {
      const scaledUrl = baseFormat.replace(/(\.[^.]+)$/, `@${scale}x$1`);
      return `${scaledUrl} ${scale}x`;
    })
    .join(', ');
}

// Preload critical images
export function preloadImage(src: string, format: 'webp' | 'avif' | 'auto' = 'auto'): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    
    if (format === 'auto') {
      const formats = generateImageFormats(src);
      img.src = getBestImageFormat(formats);
    } else {
      img.src = format === 'webp' ? generateImageFormats(src).webp : generateImageFormats(src).avif;
    }
  });
}

// Lazy loading with intersection observer
export function createLazyLoader(
  element: HTMLImageElement,
  src: string,
  formats: ImageFormats
): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bestFormat = getBestImageFormat(formats);
          element.src = bestFormat;
          element.srcset = generateSrcSet(src, formats);
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01,
    }
  );
  
  observer.observe(element);
}
