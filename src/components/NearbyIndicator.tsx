// Compact distance indicator component for POI cards
import { MapPin, Navigation, Clock, Car, Footprints } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useExplorationMode } from '@/hooks/useLanguage';
import { 
  calculateDistanceTo, 
  formatTime,
  type NavigationDestination 
} from '@/lib/navigationService';
import { useLanguage } from '@/hooks/useLanguage';
import { useMemo } from 'react';

interface NearbyIndicatorProps {
  destination: NavigationDestination;
  showTime?: boolean;
  compact?: boolean;
  className?: string;
}

const texts = {
  calculating: { es: 'Calculando...', en: 'Calculating...', fr: 'Calcul en cours...' },
  walking: { es: 'a pie', en: 'walking', fr: 'à pied' },
  driving: { es: 'en coche', en: 'by car', fr: 'en voiture' },
};

export function NearbyIndicator({ 
  destination, 
  showTime = true, 
  compact = false,
  className = '' 
}: NearbyIndicatorProps) {
  const { t } = useLanguage();
  const { latitude, longitude, hasLocation } = useGeolocation();
  const { mode } = useExplorationMode();

  const distanceResult = useMemo(() => {
    if (!hasLocation || latitude === null || longitude === null) {
      return null;
    }
    return calculateDistanceTo(latitude, longitude, destination);
  }, [latitude, longitude, hasLocation, destination]);

  // Only show in "here" mode when location is available
  if (mode !== 'here' || !distanceResult) {
    return null;
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 text-xs text-primary font-medium ${className}`}>
        <MapPin className="w-3 h-3" aria-hidden="true" />
        <span>{distanceResult.distanceFormatted}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Distance */}
      <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        <MapPin className="w-4 h-4" aria-hidden="true" />
        <span>{distanceResult.distanceFormatted}</span>
      </div>
      
      {/* Time estimates */}
      {showTime && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Footprints className="w-3 h-3" aria-hidden="true" />
            {formatTime(distanceResult.estimatedWalkingTime)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Car className="w-3 h-3" aria-hidden="true" />
            {formatTime(distanceResult.estimatedDrivingTime)}
          </span>
        </div>
      )}
    </div>
  );
}
