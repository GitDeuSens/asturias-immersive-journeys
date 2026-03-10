import { motion } from 'framer-motion';
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

export function FavoriteButton({ id, type, title, image, size = 'md', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(id);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite({ id, type, title, image });
      }}
      className={`${sizes[size]} rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
        active
          ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30'
          : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
      } ${className}`}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
    >
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
