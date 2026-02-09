import { useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OptimizedImage, CriticalImage } from './OptimizedImage';

interface GalleryImage {
  url: string;
  caption?: Record<string, string>;
  alt?: string;
}

interface MediaGalleryProps {
  images: GalleryImage[];
  className?: string;
}

export function MediaGallery({ images, className = '' }: MediaGalleryProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en' | 'fr';
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  }, [selectedIndex, images.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  }, [selectedIndex, images.length]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
    if (zoom <= 1.5) setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (selectedIndex === null) return;
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        setSelectedIndex(null);
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
    }
  }, [selectedIndex, handlePrevious, handleNext]);

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    setTouchStart(null);
  };

  if (images.length === 0) return null;

  return (
    <>
      {/* Thumbnail grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${className}`}>
        {images.map((image, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border/50 hover:border-primary/50 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`${t('a11y.imageGallery')}: ${image.caption?.[lang] || `Imagen ${index + 1}`}`}
          >
            <OptimizedImage 
              src={image.url} 
              alt={image.alt || image.caption?.[lang] || `Gallery image ${index + 1}`}
              className="w-full h-full"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" aria-hidden="true" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            aria-label={t('a11y.imageGallery')}
          >
            {/* Header controls */}
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm font-medium">
                {selectedIndex + 1} / {images.length}
              </span>
              
              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('a11y.zoomOut')}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 4}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('a11y.zoomIn')}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                {/* Download */}
                <a
                  href={images[selectedIndex].url}
                  download
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('common.download')}
                >
                  <Download className="w-5 h-5" />
                </a>

                {/* Close */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image container */}
            <div 
              className="flex-1 flex items-center justify-center overflow-hidden relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <CriticalImage
                key={selectedIndex}
                src={images[selectedIndex].url}
                alt={images[selectedIndex].alt || images[selectedIndex].caption?.[lang] || ''}
                className="max-w-full max-h-full object-contain select-none"
                sizes="100vw"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                }}
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={t('common.back')}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={t('common.next')}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Caption */}
            {images[selectedIndex].caption && (
              <div className="p-4 text-center">
                <p className="text-white/80 text-sm">
                  {images[selectedIndex].caption[lang]}
                </p>
              </div>
            )}

            {/* Thumbnails strip */}
            <div className="p-4 flex items-center justify-center gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedIndex(index);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    index === selectedIndex ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-current={index === selectedIndex ? 'true' : undefined}
                >
                  <img 
                    src={image.url} 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
