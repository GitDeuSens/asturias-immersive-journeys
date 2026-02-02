// Navigation button for starting directions to a POI
// Now uses in-app navigation instead of external maps redirect
import { useState } from 'react';
import { Navigation, Car, Footprints, X, MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
import { NavigationView } from './NavigationView';

interface NavigationButtonProps {
  destination: NavigationDestination;
  variant?: 'primary' | 'secondary' | 'compact';
  className?: string;
}

export function NavigationButton({ 
  destination, 
  variant = 'primary',
  className = '' 
}: NavigationButtonProps) {
  const { t } = useTranslation();
  const { latitude, longitude, hasLocation } = useGeolocation();
  const { mode } = useExplorationMode();
  const [showOptions, setShowOptions] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  const distanceResult = hasLocation && latitude && longitude
    ? calculateDistanceTo(latitude, longitude, destination)
    : null;

  const handleInAppNavigation = () => {
    setShowOptions(false);
    setShowNavigation(true);
  };

  const handleExternalWalking = () => {
    openNavigationTo(destination);
    setShowOptions(false);
  };

  const handleExternalDriving = () => {
    openDrivingNavigationTo(destination);
    setShowOptions(false);
  };

  // For "home" mode, show simple Maps link (no in-app navigation)
  if (mode !== 'here') {
    return (
      <Button
        onClick={() => openDrivingNavigationTo(destination)}
        variant="outline"
        className={`gap-2 ${className}`}
      >
        <Navigation className="w-4 h-4" />
        {t('navigation.getDirections')}
      </Button>
    );
  }

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setShowOptions(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors ${className}`}
        >
          <Navigation className="w-3.5 h-3.5" />
          {distanceResult ? distanceResult.distanceFormatted : t('navigation.getDirections')}
        </button>

        {/* In-app navigation fullscreen */}
        <AnimatePresence>
          {showNavigation && (
            <NavigationView
              destination={destination}
              onClose={() => setShowNavigation(false)}
            />
          )}
        </AnimatePresence>

        {/* Options modal */}
        <AnimatePresence>
          {showOptions && (
            <OptionsModal
              destination={destination}
              distanceResult={distanceResult}
              onClose={() => setShowOptions(false)}
              onInApp={handleInAppNavigation}
              onExternalWalking={handleExternalWalking}
              onExternalDriving={handleExternalDriving}
            />
          )}
        </AnimatePresence>
      </>
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
        {t('navigation.getDirections')}
        {distanceResult && (
          <span className="ml-1 text-xs opacity-80">
            ({distanceResult.distanceFormatted})
          </span>
        )}
      </Button>

      {/* In-app navigation fullscreen */}
      <AnimatePresence>
        {showNavigation && (
          <NavigationView
            destination={destination}
            onClose={() => setShowNavigation(false)}
          />
        )}
      </AnimatePresence>

      {/* Options modal */}
      <AnimatePresence>
        {showOptions && (
          <OptionsModal
            destination={destination}
            distanceResult={distanceResult}
            onClose={() => setShowOptions(false)}
            onInApp={handleInAppNavigation}
            onExternalWalking={handleExternalWalking}
            onExternalDriving={handleExternalDriving}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Options modal component
interface OptionsModalProps {
  destination: NavigationDestination;
  distanceResult: ReturnType<typeof calculateDistanceTo> | null;
  onClose: () => void;
  onInApp: () => void;
  onExternalWalking: () => void;
  onExternalDriving: () => void;
}

function OptionsModal({ 
  destination, 
  distanceResult, 
  onClose, 
  onInApp,
  onExternalWalking,
  onExternalDriving 
}: OptionsModalProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
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
            {t('navigation.chooseMode')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination info */}
        <div className="mb-6 p-3 bg-muted/50 rounded-xl">
          <p className="font-semibold text-foreground">{destination.name}</p>
          {distanceResult && (
            <p className="text-sm text-muted-foreground mt-1">
              {distanceResult.distanceFormatted} {t('navigation.fromYourLocation').toLowerCase()}
            </p>
          )}
        </div>

        {/* In-app navigation (featured) */}
        <button
          onClick={onInApp}
          className="w-full mb-4 p-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center gap-4 hover:opacity-90 transition-opacity"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold">{t('navigation.inApp')}</p>
            <p className="text-sm opacity-80">{t('navigation.stepByStep')}</p>
          </div>
        </button>

        {/* External maps options */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t('navigation.externalMaps')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExternalWalking}
            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Footprints className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground text-sm">{t('navigation.walking')}</p>
              {distanceResult && (
                <p className="text-xs text-muted-foreground">
                  ~{formatTime(distanceResult.estimatedWalkingTime)}
                </p>
              )}
            </div>
          </button>

          <button
            onClick={onExternalDriving}
            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Car className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground text-sm">{t('navigation.driving')}</p>
              {distanceResult && (
                <p className="text-xs text-muted-foreground">
                  ~{formatTime(distanceResult.estimatedDrivingTime)}
                </p>
              )}
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
