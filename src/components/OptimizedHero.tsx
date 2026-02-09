import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CriticalImage, usePreloadImages } from './OptimizedImage';

interface OptimizedHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText?: string;
  onCTAClick?: () => void;
}

export function OptimizedHero({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  onCTAClick,
}: OptimizedHeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Preload critical images
  usePreloadImages([backgroundImage]);

  useEffect(() => {
    // Set content visibility for LCP optimization
    if ('contentVisibility' in document.documentElement.style) {
      document.documentElement.style.contentVisibility = 'auto';
    }
  }, []);

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      {/* Background image with priority loading */}
      <div className="absolute inset-0">
        <CriticalImage
          src={backgroundImage}
          alt=""
          className="w-full h-full"
          sizes="100vw"
          onLoad={() => setIsLoaded(true)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 min-h-[80vh] flex items-center justify-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ containIntrinsicSize: '400 100' }}
          >
            {title}
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ containIntrinsicSize: '600 50' }}
          >
            {subtitle}
          </motion.p>
          
          {ctaText && (
            <motion.button
              onClick={onCTAClick}
              className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {ctaText}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}
