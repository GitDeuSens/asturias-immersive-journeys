// Full-screen navigation view with map, turn-by-turn instructions, and real-time tracking
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import {
  X,
  Navigation as NavigationIcon,
  RotateCcw,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Flag,
  Play,
  Circle,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Footprints,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  WifiOff,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigation, TransportMode } from '@/hooks/useNavigation';
import { RouteStep, formatRouteDistance, formatRouteDuration, getManeuverIcon } from '@/lib/osrmService';
import { createUserPositionMarker, injectMapStyles } from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface NavigationViewProps {
  destination: { name: string; lat: number; lng: number };
  onClose: () => void;
}

// Maneuver icon component
function ManeuverIcon({ type, className = '' }: { type: string; className?: string }) {
  const iconClass = `${className}`;
  switch (type) {
    case 'arrow-left':
      return <ArrowLeft className={iconClass} />;
    case 'arrow-right':
      return <ArrowRight className={iconClass} />;
    case 'arrow-up':
      return <ArrowUp className={iconClass} />;
    case 'rotate-ccw':
      return <RotateCcw className={iconClass} />;
    case 'flag':
      return <Flag className={iconClass} />;
    case 'play':
      return <Play className={iconClass} />;
    case 'circle':
      return <Circle className={iconClass} />;
    default:
      return <ArrowUp className={iconClass} />;
  }
}

export function NavigationView({ destination, onClose }: NavigationViewProps) {
  const { t, i18n } = useTranslation();
  const {
    isNavigating,
    isLoading,
    error,
    route,
    currentStepIndex,
    currentStep,
    nextStep,
    transportMode,
    distanceRemaining,
    timeRemaining,
    userPosition,
    progressPercent,
    distanceTraveled,
    traveledPath,
    isOfflineMode,
    startNavigation,
    stopNavigation,
    recalculateRoute,
  } = useNavigation();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const remainingRouteRef = useRef<L.Polyline | null>(null);
  const traveledRouteRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);

  const [showAllSteps, setShowAllSteps] = useState(false);
  const [selectedMode, setSelectedMode] = useState<TransportMode>('walking');
  const [hasStarted, setHasStarted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    injectMapStyles();

    const map = L.map(mapContainerRef.current, {
      center: [destination.lat, destination.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add destination marker
    const destIcon = L.divIcon({
      className: 'destination-marker',
      html: `
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-3 border-white shadow-lg">
          <svg class="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(destination.name);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [destination]);

  // Update route polylines on map (bicolor: traveled + remaining)
  useEffect(() => {
    if (!mapRef.current || !route) return;

    // Remove old routes
    if (remainingRouteRef.current) {
      remainingRouteRef.current.remove();
    }
    if (traveledRouteRef.current) {
      traveledRouteRef.current.remove();
    }

    // Find the closest point index on route based on progress
    const geometry = route.geometry;
    let splitIndex = 0;
    
    if (userPosition && isNavigating) {
      let minDist = Infinity;
      for (let i = 0; i < geometry.length; i++) {
        const point = geometry[i];
        const dist = Math.hypot(point.lat - userPosition.lat, point.lng - userPosition.lng);
        if (dist < minDist) {
          minDist = dist;
          splitIndex = i;
        }
      }
    }

    // Draw traveled portion (green)
    if (splitIndex > 0) {
      const traveledCoords = geometry.slice(0, splitIndex + 1).map(p => [p.lat, p.lng] as L.LatLngTuple);
      traveledRouteRef.current = L.polyline(traveledCoords, {
        color: 'hsl(142, 76%, 36%)', // Green
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);
    }

    // Draw remaining portion (blue)
    const remainingCoords = geometry.slice(splitIndex).map(p => [p.lat, p.lng] as L.LatLngTuple);
    remainingRouteRef.current = L.polyline(remainingCoords, {
      color: 'hsl(203, 100%, 32%)', // Blue
      weight: 6,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current);

    // Fit bounds to show entire route on first load
    if (!isNavigating) {
      const allCoords = geometry.map(p => [p.lat, p.lng] as L.LatLngTuple);
      const bounds = L.latLngBounds(allCoords);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, userPosition, isNavigating]);

  // Update user position marker
  useEffect(() => {
    if (!mapRef.current || !userPosition) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
    } else {
      userMarkerRef.current = createUserPositionMarker(userPosition.lat, userPosition.lng)
        .addTo(mapRef.current);
    }

    // Center map on user with animation during navigation
    if (isNavigating) {
      mapRef.current.panTo([userPosition.lat, userPosition.lng], {
        animate: true,
        duration: 0.5,
      });
    }
  }, [userPosition, isNavigating]);

  // Voice announcements for step changes
  useEffect(() => {
    if (!voiceEnabled || !currentStep || !isNavigating) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStepIndex, voiceEnabled, currentStep, isNavigating]);

  // Handle navigation start
  const handleStart = async () => {
    setHasStarted(true);
    await startNavigation(destination, selectedMode);
  };

  // Handle close
  const handleClose = () => {
    stopNavigation();
    onClose();
  };

  // Arrived state
  const hasArrived = !isNavigating && hasStarted && !isLoading && !error && route;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Map */}
      <div ref={mapContainerRef} className="flex-1 relative">
        {/* Offline mode indicator on map */}
        {isOfflineMode && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000]">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-semibold shadow-lg"
            >
              <WifiOff className="w-3.5 h-3.5" />
              {t('navigation.offlineMode')}
            </motion.div>
          </div>
        )}

        {/* Progress badge on map */}
        {isNavigating && progressPercent > 0 && (
          <div className="absolute bottom-4 left-4 z-[1000]">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-background/95 backdrop-blur-sm shadow-lg border border-border">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${progressPercent} 100`}
                    strokeLinecap="round"
                    className="text-primary"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                  {progressPercent}%
                </span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">{formatRouteDistance(distanceTraveled)}</p>
                <p className="text-muted-foreground">{t('navigation.progress')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleClose}
            className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>

          {isNavigating && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={recalculateRoute}
                className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
                disabled={isLoading || isOfflineMode}
              >
                <RotateCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom panel */}
      <AnimatePresence mode="wait">
        {/* Mode selection (before start) */}
        {!hasStarted && (
          <motion.div
            key="mode-select"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 space-y-4"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">{destination.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('navigation.selectMode')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMode('walking')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2 ${
                  selectedMode === 'walking'
                    ? 'bg-primary/20 border-primary'
                    : 'bg-muted/50 border-transparent hover:bg-muted'
                }`}
              >
                <Footprints className={`w-8 h-8 ${selectedMode === 'walking' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium">{t('navigation.walking')}</span>
              </button>

              <button
                onClick={() => setSelectedMode('driving')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2 ${
                  selectedMode === 'driving'
                    ? 'bg-primary/20 border-primary'
                    : 'bg-muted/50 border-transparent hover:bg-muted'
                }`}
              >
                <Car className={`w-8 h-8 ${selectedMode === 'driving' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium">{t('navigation.driving')}</span>
              </button>
            </div>

            <Button onClick={handleStart} className="w-full h-12 text-base font-bold gap-2">
              <NavigationIcon className="w-5 h-5" />
              {t('navigation.start')}
            </Button>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && hasStarted && (
          <motion.div
            key="loading"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-card rounded-t-3xl shadow-2xl p-8 flex flex-col items-center gap-4"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">{t('navigation.calculatingRoute')}</p>
          </motion.div>
        )}

        {/* Error state */}
        {error && hasStarted && (
          <motion.div
            key="error"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">{t('navigation.error')}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                {t('common.close')}
              </Button>
              <Button onClick={handleStart} className="flex-1">
                {t('navigation.retry')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Arrived state */}
        {hasArrived && (
          <motion.div
            key="arrived"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-card rounded-t-3xl shadow-2xl p-6 space-y-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <Flag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{t('navigation.arrived')}</h3>
              <p className="text-muted-foreground mt-1">{destination.name}</p>
            </div>
            <Button onClick={handleClose} className="w-full">
              {t('common.close')}
            </Button>
          </motion.div>
        )}

        {/* Active navigation */}
        {isNavigating && currentStep && route && (
          <motion.div
            key="navigating"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-card rounded-t-3xl shadow-2xl overflow-hidden"
          >
            {/* Current instruction */}
            <div className="p-4 bg-primary text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ManeuverIcon type={getManeuverIcon(currentStep)} className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold leading-tight">{currentStep.instruction}</p>
                  {currentStep.distance > 0 && (
                    <p className="text-sm opacity-80 mt-0.5">
                      {formatRouteDistance(currentStep.distance)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 py-2 border-b border-border/50 bg-muted/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{t('navigation.progress')}</span>
                </div>
                <span className="text-xs font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Stats bar */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{formatRouteDistance(distanceRemaining)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{formatRouteDuration(timeRemaining)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOfflineMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 text-[10px] font-bold">
                    <WifiOff className="w-3 h-3" />
                    {t('navigation.offlineMode')}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {transportMode === 'walking' ? <Footprints className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                  <span>{t('navigation.stepOf')} {currentStepIndex + 1} {t('navigation.of')} {route.steps.length}</span>
                </div>
              </div>
            </div>

            {/* Next step preview */}
            {nextStep && (
              <button
                onClick={() => setShowAllSteps(!showAllSteps)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <ManeuverIcon type={getManeuverIcon(nextStep)} className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="flex-1 text-sm text-muted-foreground text-left truncate">
                  {nextStep.instruction}
                </p>
                {showAllSteps ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            )}

            {/* All steps (expandable) */}
            <AnimatePresence>
              {showAllSteps && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="px-4 py-2 bg-muted/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t('navigation.allSteps')}
                    </p>
                  </div>
                  <ScrollArea className="max-h-48">
                    <div className="p-2 space-y-1">
                      {route.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-2 rounded-xl ${
                            idx === currentStepIndex ? 'bg-primary/10' : ''
                          } ${idx < currentStepIndex ? 'opacity-50' : ''}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === currentStepIndex 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </div>
                          <p className="flex-1 text-sm truncate">{step.instruction}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatRouteDistance(step.distance)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stop button */}
            <div className="p-4 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {t('navigation.stopNavigation')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
