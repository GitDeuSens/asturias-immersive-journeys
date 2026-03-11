import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites, type FavoriteType } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  id: string;
  type: FavoriteType;
  title: string;
  image?: string;
  size?: 'sm' | 'md';
  className?: string;
}

// Particle burst effect on favorite
function HeartBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <AnimatePresence>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 20;
        const y = Math.sin(angle) * 20;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0, x, y }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-1.5 h-1.5 rounded-full bg-red-400 pointer-events-none"
          />
        );
      })}
    </AnimatePresence>
  );
}

export function FavoriteButton({ id, type, title, image, size = 'md', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id, type);
  const [showBurst, setShowBurst] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const wasActive = active;
    toggleFavorite({ id, type, title, image });
    if (!wasActive) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className={`${sizes[size]} rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 relative ${
        active
          ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30'
          : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
      } ${className}`}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      <HeartBurst active={showBurst} />
      <motion.div
        key={active ? 'filled' : 'empty'}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        <Heart className={`${iconSizes[size]} ${active ? 'fill-current' : ''}`} />
      </motion.div>
    </motion.button>
  );
}
