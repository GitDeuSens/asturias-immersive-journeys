import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDirectusAssetUrl } from '@/lib/directus-url';

// Local fallback images
import covadongaImg from '@/assets/covadonga.jpg';
import picosImg from '@/assets/picos.jpg';
import caresImg from '@/assets/cares.jpg';
import heroImg from '@/assets/hero-mountains.jpg';
import llastresImg from '@/assets/llastres.jpg';

const fallbackImages = [heroImg, covadongaImg, picosImg, caresImg, llastresImg];

interface DynamicBackgroundProps {
  blur?: number;
  interval?: number;
  /** CMS image UUIDs from slideshow_images */
  cmsImages?: string[];
  /** CMS slideshow mode */
  mode?: string | null;
}

export function DynamicBackground({ blur = 8, interval = 7000, cmsImages, mode }: DynamicBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use CMS images if available, otherwise fallback
  const images = cmsImages && cmsImages.length > 0
    ? cmsImages.map(id => getDirectusAssetUrl(id))
    : fallbackImages;

  const isSingle = mode === 'static' || images.length === 1;

  useEffect(() => {
    if (isSingle) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, images.length, isSingle]);

  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [cmsImages]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${images[currentIndex]})` }}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    </div>
  );
}
