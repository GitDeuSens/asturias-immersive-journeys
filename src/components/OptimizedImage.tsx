import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { 
  generateImageFormats, 
  getBestImageFormat, 
  generateSrcSet, 
  preloadImage,
  type ImageFormats 
} from '@/lib/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // For LCP optimization
  sizes?: string; // For responsive images
  aspectRatio?: string;
  fallbackSrc?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  aspectRatio = 'aspect-[4/3]',
  fallbackSrc = '/placeholder.svg',
  style,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageFormats] = useState<ImageFormats>(() => generateImageFormats(src));
  const [bestFormat, setBestFormat] = useState(() => getBestImageFormat(imageFormats));
  
  const observerRef = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(observerRef, {
    threshold: 0.01,
    rootMargin: '50px',
  });
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '50px', // Start loading 50px before entering viewport
          threshold: 0.1,
        }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    } else {
      setIsInView(true); // Load immediately if priority
    }
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate responsive image URLs with better compression
  const generateSrcSet = (originalSrc: string) => {
    // For Directus assets, we can add query parameters for resizing and compression
    if (originalSrc.includes('/assets/')) {
      const baseUrl = originalSrc.split('?')[0];
      return [
        `${baseUrl}?width=200&format=webp&quality=75 200w`,
        `${baseUrl}?width=400&format=webp&quality=75 400w`,
        `${baseUrl}?width=800&format=webp&quality=75 800w`,
        `${baseUrl}?width=1200&format=webp&quality=75 1200w`,
      ].join(', ');
    }
    return originalSrc;
  };

  const shouldLoad = priority || isInView;

  return (
    <div 
      className={`relative overflow-hidden ${aspectRatio} ${className}`}
      style={{
        ...style,
        // Prevent layout shift with intrinsic size
        containIntrinsicSize: '400 300',
        contentVisibility: 'auto',
      }}
    >
      {/* Placeholder skeleton with fixed dimensions */}
      <div 
        className={`absolute inset-0 bg-muted transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          // Ensure skeleton maintains layout
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      {/* Image container with fixed dimensions */}
      <div 
        className="relative w-full h-full" 
        style={{
          // Ensure container maintains aspect ratio
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {shouldLoad && !hasError && (
          <img
            ref={imgRef}
            src={src}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading={priority ? 'eager' : 'lazy'}
            {...(priority && { fetchpriority: 'high' })}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              // Prevent layout shift
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        
        {/* Error state */}
        {hasError && (
          <img
            src={fallbackSrc}
            alt={alt}
            className="w-full h-full object-cover opacity-50"
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      {/* Loading indicator */}
      {shouldLoad && !isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-muted/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  );
}

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

// Component for hero/above-fold images
export function CriticalImage(props: Omit<OptimizedImageProps, 'priority'>) {
  return <OptimizedImage {...props} priority={true} />;
}

// Component for gallery images
export function GalleryImage(props: Omit<OptimizedImageProps, 'priority'>) {
  return <OptimizedImage {...props} priority={false} />;
}
