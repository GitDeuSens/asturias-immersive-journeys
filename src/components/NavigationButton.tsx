// Navigation button for starting directions to a POI
import { useState } from 'react';
import { Navigation, Car, Footprints, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useExplorationMode } from '@/hooks/useLanguage';
import { 
  openNavigationTo, 
  openDrivingNavigationTo,
  calculateDistanceTo,
  formatTime,
  type NavigationDestination 
} from '@/lib/navigationService';
import { Button } from '@/components/ui/button';

interface NavigationButtonProps {
  destination: NavigationDestination;
  variant?: 'primary' | 'secondary' | 'compact';
  className?: string;
}

const texts = {
  navigate: { es: 'Cómo llegar', en: 'Get directions', fr: 'Itinéraire' },
  walking: { es: 'A pie', en: 'Walking', fr: 'À pied' },
  driving: { es: 'En coche', en: 'Driving', fr: 'En voiture' },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  chooseMode: { es: 'Elige cómo llegar', en: 'Choose how to get there', fr: 'Choisissez comment y aller' },
};

export function NavigationButton({ 
  destination, 
  variant = 'primary',
  className = '' 
}: NavigationButtonProps) {
  const { t } = useLanguage();
  const { latitude, longitude, hasLocation } = useGeolocation();
  const { mode } = useExplorationMode();
  const [showOptions, setShowOptions] = useState(false);

  const distanceResult = hasLocation && latitude && longitude
    ? calculateDistanceTo(latitude, longitude, destination)
    : null;

  const handleWalking = () => {
    openNavigationTo(destination);
    setShowOptions(false);
  };

  const handleDriving = () => {
    openDrivingNavigationTo(destination);
    setShowOptions(false);
  };

  // For "home" mode, show simple Maps link
  if (mode !== 'here') {
    return (
      <Button
        onClick={() => openDrivingNavigationTo(destination)}
        variant="outline"
        className={`gap-2 ${className}`}
      >
        <Navigation className="w-4 h-4" />
        {t(texts.navigate)}
      </Button>
    );
  }

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <button
        onClick={() => setShowOptions(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors ${className}`}
      >
        <Navigation className="w-3.5 h-3.5" />
        {distanceResult ? distanceResult.distanceFormatted : t(texts.navigate)}
      </button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowOptions(true)}
        variant={variant === 'primary' ? 'default' : 'outline'}
        className={`gap-2 ${className}`}
      >
        <Navigation className="w-4 h-4" />
        {t(texts.navigate)}
        {distanceResult && (
          <span className="ml-1 text-xs opacity-80">
            ({distanceResult.distanceFormatted})
          </span>
        )}
      </Button>

      {/* Navigation mode selector modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  {t(texts.chooseMode)}
                </h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label={t(texts.close)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Destination info */}
              <div className="mb-6 p-3 bg-muted/50 rounded-xl">
                <p className="font-semibold text-foreground">{destination.name}</p>
                {distanceResult && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {distanceResult.distanceFormatted} desde tu ubicación
                  </p>
                )}
              </div>

              {/* Transport options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWalking}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl bg-accent/50 hover:bg-accent transition-colors border border-accent"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Footprints className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{t(texts.walking)}</p>
                    {distanceResult && (
                      <p className="text-sm text-muted-foreground">
                        ~{formatTime(distanceResult.estimatedWalkingTime)}
                      </p>
                    )}
                  </div>
                </button>

                <button
                  onClick={handleDriving}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl bg-accent/50 hover:bg-accent transition-colors border border-accent"
                >
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
                    <Car className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{t(texts.driving)}</p>
                    {distanceResult && (
                      <p className="text-sm text-muted-foreground">
                        ~{formatTime(distanceResult.estimatedDrivingTime)}
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
