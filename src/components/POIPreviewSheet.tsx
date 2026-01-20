import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Camera, Info, Share2 } from 'lucide-react';
import { POI, categories } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

interface POIPreviewSheetProps {
  poi: POI | null;
  onClose: () => void;
  onViewDetails: () => void;
}

const texts = {
  viewDetails: { es: 'Ver detalles', en: 'View details', fr: 'Voir détails' },
  save: { es: 'Guardar', en: 'Save', fr: 'Sauvegarder' },
};

export function POIPreviewSheet({ poi, onClose, onViewDetails }: POIPreviewSheetProps) {
  const { t } = useLanguage();

  if (!poi) return null;
  const getButtonStyle = () => {
    switch (poi.experienceType) {
      case 'AR':
        return 'bg-[hsl(48,100%,50%)] text-[hsl(210,11%,15%)] hover:bg-[hsl(48,100%,45%)]';
      case '360':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'INFO':
      default:
        return 'bg-[hsl(203,100%,32%)] text-white hover:bg-[hsl(203,100%,28%)]';
    }
  };


  const getTypeBadge = () => {
    switch (poi.experienceType) {
      case 'AR':
        return { 
          className: 'bg-[hsl(48,100%,50%)] text-[hsl(210,11%,15%)]', 
          icon: Smartphone,
          label: 'AR'
        };
      case '360':
        return { 
          className: 'bg-primary text-primary-foreground', 
          icon: Camera,
          label: '360°'
        };
      case 'INFO':
      default:
        return { 
          className: 'bg-[hsl(203,100%,32%)] text-white', 
          icon: Info,
          label: 'INFO'
        };
    }
  };

  const badge = getTypeBadge();
  const BadgeIcon = badge.icon;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(poi.title),
          text: t(poi.shortDescription),
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-4 left-4 right-4 md:left-auto md:right-[430px] md:w-[340px] bg-white rounded-2xl overflow-hidden z-10 shadow-xl border border-border/50"
      >
        {/* Hero Image */}
        <div 
          className="h-40 bg-cover bg-center relative"
          style={{ 
            backgroundImage: poi.media.images[0] 
              ? `url(${poi.media.images[0]})` 
              : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)/0.2) 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Type Badge - Very Visible */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${badge.className}`}>
              <BadgeIcon className="w-3.5 h-3.5" />
              {badge.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-serif font-bold text-xl text-foreground mb-2 leading-tight">
            {t(poi.title)}
          </h3>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {poi.categoryIds.map(catId => {
              const cat = categories.find(c => c.id === catId);
              return cat ? (
                <span 
                  key={catId} 
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground"
                >
                  {t(cat.label)}
                </span>
              ) : null;
            })}
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            {/* Primary CTA */}
            <button
              onClick={onViewDetails}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-md ${getButtonStyle()}`}
            >
              <Info className="w-5 h-5" />
              {t(texts.viewDetails)}
            </button>

            {/* Secondary CTA - Subtle */}
            <button
              onClick={handleShare}
              className="p-3 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors"
              aria-label={t(texts.save)}
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
