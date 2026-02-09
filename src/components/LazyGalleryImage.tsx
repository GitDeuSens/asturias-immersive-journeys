import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { motion } from 'framer-motion';

interface LazyGalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

export const LazyGalleryImage = React.memo(function LazyGalleryImage({
  src,
  alt,
  className = '',
  onClick,
  loading = 'lazy',
}: LazyGalleryImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px', // Load earlier for gallery images
    triggerOnce: true,
  });

  React.useEffect(() => {
    if (loading === 'eager') {
      // Load immediately for eager images
      setImageSrc(src);
      return;
    }

    if (!isIntersecting || imageSrc) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setHasError(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
    };
    img.src = src;
  }, [isIntersecting, src, imageSrc, loading]);

  return (
    <div 
      ref={targetRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Placeholder */}
      <motion.div
        className={`absolute inset-0 bg-muted ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Image */}
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${hasError ? 'opacity-50' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          loading={loading}
          decoding="async"
        />
      )}

      {/* Loading indicator */}
      {loading === 'lazy' && isIntersecting && !isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-muted/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  );
});

LazyGalleryImage.displayName = 'LazyGalleryImage';
