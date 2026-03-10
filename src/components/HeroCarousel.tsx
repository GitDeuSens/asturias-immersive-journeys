import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  onClick?: () => void;
}

interface HeroCarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
  className?: string;
}

export function HeroCarousel({ items, autoPlayInterval = 5000, className = '' }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-play
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [next, autoPlayInterval, items.length]);

  if (items.length === 0) return null;

  const item = items[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div className="relative aspect-[21/9] sm:aspect-[3/1] bg-muted">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={item.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 cursor-pointer"
            onClick={item.onClick}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 drop-shadow-lg line-clamp-1">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-sm text-white/80 drop-shadow line-clamp-1">{item.subtitle}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
