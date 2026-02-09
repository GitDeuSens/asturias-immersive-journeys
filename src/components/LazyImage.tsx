import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = React.memo(function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-route.jpg',
  aspectRatio = 'aspect-video',
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  
  const { targetRef: observerRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  // Start loading when image is in viewport
  useEffect(() => {
    if (!isIntersecting || currentSrc) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };
    img.onerror = () => {
      setCurrentSrc(placeholder);
      setHasError(true);
      setIsLoaded(false);
      onError?.();
    };
    img.src = src;
  }, [isIntersecting, src, placeholder, currentSrc, onLoad, onError]);

  return (
    <div 
      ref={observerRef}
      className={`relative overflow-hidden ${aspectRatio} ${className}`}
    >
      {/* Placeholder skeleton */}
      <motion.div
        className={`absolute inset-0 bg-muted ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        animate={{
          opacity: isLoaded ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Image */}
      {currentSrc && (
        <motion.img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${hasError ? 'opacity-50' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Loading indicator */}
      {isIntersecting && !isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-muted/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';
