// Panel showing nearby POIs sorted by distance when in "here" mode
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  SlidersHorizontal, 
  ChevronUp, 
  ChevronDown,
  Compass,
  Loader2 
} from 'lucide-react';
import { useLanguage, useExplorationMode } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { 
  calculateDistancesToAll, 
  filterByRadius,
  formatTime,
  type NavigationDestination,
  type DistanceResult 
} from '@/lib/navigationService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NearbyIndicator } from './NearbyIndicator';
import { NavigationButton } from './NavigationButton';

interface NearbyPanelProps {
  destinations: NavigationDestination[];
  onSelectDestination: (destination: NavigationDestination) => void;
  selectedId?: string;
}

const texts = {
  nearYou: { es: 'Cerca de ti', en: 'Near you', fr: 'Près de vous' },
  noLocation: { es: 'Activa tu ubicación para ver qué tienes cerca', en: 'Enable location to see what\'s nearby', fr: 'Activez la localisation pour voir ce qui est proche' },
  loading: { es: 'Localizando...', en: 'Locating...', fr: 'Localisation...' },
  showMore: { es: 'Ver más', en: 'Show more', fr: 'Voir plus' },
  showLess: { es: 'Ver menos', en: 'Show less', fr: 'Voir moins' },
  nothingNearby: { es: 'No hay puntos cercanos en un radio de 50km', en: 'No points within 50km radius', fr: 'Aucun point dans un rayon de 50km' },
  sortBy: { es: 'Ordenar por', en: 'Sort by', fr: 'Trier par' },
  distance: { es: 'Distancia', en: 'Distance', fr: 'Distance' },
  enableLocation: { es: 'Activar ubicación', en: 'Enable location', fr: 'Activer la localisation' },
  withinRadius: { es: 'en un radio de', en: 'within', fr: 'dans un rayon de' },
};

const RADIUS_OPTIONS = [5, 10, 25, 50]; // km

export function NearbyPanel({ 
  destinations, 
  onSelectDestination,
  selectedId 
}: NearbyPanelProps) {
  const { t } = useLanguage();
  const { mode } = useExplorationMode();
  const { latitude, longitude, hasLocation, loading, requestLocation } = useGeolocation();
  const [expanded, setExpanded] = useState(true);
  const [maxRadius, setMaxRadius] = useState(25); // default 25km
  const [showAll, setShowAll] = useState(false);

  // Only render in "here" mode
  if (mode !== 'here') return null;

  const sortedDestinations = useMemo(() => {
    if (!hasLocation || latitude === null || longitude === null) {
      return [];
    }
    const all = calculateDistancesToAll(latitude, longitude, destinations);
    return filterByRadius(all, maxRadius);
  }, [latitude, longitude, hasLocation, destinations, maxRadius]);

  const displayedDestinations = showAll 
    ? sortedDestinations 
    : sortedDestinations.slice(0, 5);

  const handleRequestLocation = async () => {
    await requestLocation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground">{t(texts.nearYou)}</h3>
            {hasLocation && sortedDestinations.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {sortedDestinations.length} {t(texts.withinRadius)} {maxRadius}km
              </p>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* No location state */}
            {!hasLocation && !loading && (
              <div className="p-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">{t(texts.noLocation)}</p>
                <button
                  onClick={handleRequestLocation}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {t(texts.enableLocation)}
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t(texts.loading)}</span>
              </div>
            )}

            {/* Has location */}
            {hasLocation && !loading && (
              <>
                {/* Radius filter */}
                <div className="px-4 py-2 border-t border-border/50 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {RADIUS_OPTIONS.map(radius => (
                      <button
                        key={radius}
                        onClick={() => setMaxRadius(radius)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          maxRadius === radius
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {radius}km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destinations list */}
                {sortedDestinations.length > 0 ? (
                  <ScrollArea className="max-h-80">
                    <div className="p-2 space-y-1">
                      {displayedDestinations.map(result => (
                        <NearbyItem
                          key={result.destination.id}
                          result={result}
                          isSelected={result.destination.id === selectedId}
                          onClick={() => onSelectDestination(result.destination)}
                        />
                      ))}
                    </div>

                    {/* Show more/less */}
                    {sortedDestinations.length > 5 && (
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full py-2 text-sm text-primary font-medium hover:underline"
                      >
                        {showAll ? t(texts.showLess) : `${t(texts.showMore)} (${sortedDestinations.length - 5})`}
                      </button>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {t(texts.nothingNearby)}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Individual nearby item
interface NearbyItemProps {
  result: DistanceResult;
  isSelected: boolean;
  onClick: () => void;
}

function NearbyItem({ result, isSelected, onClick }: NearbyItemProps) {
  const { destination, distanceFormatted, estimatedWalkingTime, estimatedDrivingTime } = result;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
        isSelected 
          ? 'bg-primary/10 border-2 border-primary' 
          : 'hover:bg-muted/50 border border-transparent'
      }`}
    >
      {/* Type indicator */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        destination.type === 'route-start' 
          ? 'bg-accent' 
          : 'bg-primary/10'
      }`}>
        <MapPin className={`w-5 h-5 ${
          destination.type === 'route-start' 
            ? 'text-accent-foreground' 
            : 'text-primary'
        }`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{destination.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="font-medium text-primary">{distanceFormatted}</span>
          <span>•</span>
          <span>{formatTime(estimatedWalkingTime)} a pie</span>
        </div>
      </div>

      {/* Navigate icon */}
      <Navigation className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
