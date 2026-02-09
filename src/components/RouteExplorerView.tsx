import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  RotateCw,
  Camera,
  Play,
  FileText,
  Headphones,
  Smartphone,
  Info,
  ChevronRight,
  Check,
  X,
  Navigation,
  Footprints
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ImmersiveRoute, RoutePoint } from '@/data/types';
import { useExplorationMode } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trackPOIViewed, trackRouteCompleted } from '@/lib/analytics';
import { Progress } from '@/components/ui/progress';
import { 
  calculateDistanceTo, 
  formatTime,
  type NavigationDestination 
} from '@/lib/navigationService';

interface RouteExplorerViewProps {
  route: ImmersiveRoute;
  onBack: () => void;
  onSelectPoint: (point: RoutePoint) => void;
  selectedPoint: RoutePoint | null;
}

export function RouteExplorerView({ route, onBack, onSelectPoint, selectedPoint }: RouteExplorerViewProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en' | 'fr';
  const { mode } = useExplorationMode();
  const { latitude, longitude, hasLocation } = useGeolocation();
  const [visitedPoints, setVisitedPoints] = useState<Set<string>>(new Set());
  const [routeStartTime] = useState(Date.now());
  
  const progress = route.points.length > 0 
    ? Math.round((visitedPoints.size / route.points.length) * 100) 
    : 0;

  // Calculate distances for all points (only in "here" mode)
  const pointDistances = useMemo(() => {
    if (mode !== 'here' || !hasLocation || latitude === null || longitude === null) {
      return new Map<string, { distance: string; walkTime: number }>();
    }
    
    const distances = new Map<string, { distance: string; walkTime: number }>();
    route.points.forEach(point => {
      const dest: NavigationDestination = {
        id: point.id,
        name: typeof point.title === 'string' ? point.title : point.title[lang] || point.title.es,
        lat: point.location.lat,
        lng: point.location.lng,
        type: 'route-point',
      };
      const result = calculateDistanceTo(latitude, longitude, dest);
      distances.set(point.id, {
        distance: result.distanceFormatted,
        walkTime: result.estimatedWalkingTime,
      });
    });
    return distances;
  }, [route.points, latitude, longitude, hasLocation, mode, lang]);

  // Find nearest point
  const nearestPoint = useMemo(() => {
    if (pointDistances.size === 0) return null;
    let nearest: RoutePoint | null = null;
    let minDistance = Infinity;
    
    route.points.forEach(point => {
      const distData = pointDistances.get(point.id);
      if (distData && distData.walkTime < minDistance) {
        minDistance = distData.walkTime;
        nearest = point;
      }
    });
    return nearest;
  }, [pointDistances, route.points]);

  const handlePointClick = (point: RoutePoint) => {
    // Track POI view if not already visited
    if (!visitedPoints.has(point.id)) {
      const poiName = typeof point.title === 'string' ? point.title : point.title[lang] || point.title.es;
      trackPOIViewed(point.id, poiName, route.id);
    }
    
    setVisitedPoints(prev => new Set([...prev, point.id]));
    onSelectPoint(point);
  };

  // Track route completion when all points are visited
  useEffect(() => {
    if (visitedPoints.size === route.points.length && route.points.length > 0) {
      const durationSec = Math.round((Date.now() - routeStartTime) / 1000);
      const routeName = typeof route.title === 'string' ? route.title : route.title[lang] || route.title.es;
      
      trackRouteCompleted(
        route.id,
        routeName,
        durationSec,
        visitedPoints.size,
        route.points.length
      );
    }
  }, [visitedPoints, route.points.length, route.id, route.title, routeStartTime, lang]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 space-y-3">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('routes.exitRoute')}
        </button>

        {/* Route info */}
        <div className="flex items-start gap-3">
          <div 
            className="w-14 h-14 rounded-xl bg-cover bg-center flex-shrink-0 border-2 border-primary/30"
            style={{ backgroundImage: `url(${route.coverImage})` }}
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {t('routes.exploring')}
            </span>
            <h2 className="font-sans font-bold text-foreground text-lg leading-tight truncate">
              {route.title[lang]}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {route.points.length} {t('routes.points')}
              </span>
              {route.isCircular && (
                <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                  <RotateCw className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {route.points.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('routes.progress')}</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      {/* Points timeline/list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {/* Nearest point suggestion (only in "here" mode) */}
          {nearestPoint && mode === 'here' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {t('navigation.nearestPoint')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{nearestPoint.title[lang]}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {pointDistances.get(nearestPoint.id)?.distance}
                    <span className="mx-1">•</span>
                    <Footprints className="w-3 h-3" />
                    {formatTime(pointDistances.get(nearestPoint.id)?.walkTime || 0)}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handlePointClick(nearestPoint)}
                  className="text-xs"
                >
                  {t('navigation.startHere')}
                </Button>
              </div>
            </motion.div>
          )}

          {route.points.length > 0 ? (
            route.points.map((point, idx) => (
              <PointCard 
                key={point.id} 
                point={point} 
                index={idx}
                isVisited={visitedPoints.has(point.id)}
                isSelected={selectedPoint?.id === point.id}
                isLast={idx === route.points.length - 1}
                isNearest={nearestPoint?.id === point.id}
                distanceInfo={pointDistances.get(point.id)}
                onClick={() => handlePointClick(point)}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('routes.noPoints')}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Point card component (chapita)
interface PointCardProps {
  point: RoutePoint;
  index: number;
  isVisited: boolean;
  isSelected: boolean;
  isLast: boolean;
  isNearest: boolean;
  distanceInfo?: { distance: string; walkTime: number };
  onClick: () => void;
}

function PointCard({ point, index, isVisited, isSelected, isLast, isNearest, distanceInfo, onClick }: PointCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en' | 'fr';
  const content = point.content;
  
  // Determine what content types are available
  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;

  // Get primary content type for styling
  const getPrimaryType = () => {
    if (hasAR) return 'ar';
    if (has360) return '360';
    return 'info';
  };

  const primaryType = getPrimaryType();
  const typeColors = {
    ar: { bg: 'bg-warm', text: 'text-warm', border: 'border-warm' },
    '360': { bg: 'bg-primary', text: 'text-primary', border: 'border-primary' },
    info: { bg: 'bg-accent', text: 'text-accent', border: 'border-accent' },
  };
  const colors = typeColors[primaryType];

  return (
    <div className="relative flex">
      {/* Timeline connector */}
      <div className="flex flex-col items-center mr-3 flex-shrink-0">
        {/* Number badge */}
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md z-10 ${
            isVisited ? 'bg-primary' : colors.bg
          }`}
        >
          {isVisited ? <Check className="w-4 h-4" /> : index + 1}
        </div>
        
        {/* Connecting line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Card content */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          delay: index * 0.04,
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        onClick={onClick}
        className={`flex-1 mb-3 rounded-xl overflow-hidden transition-all text-left border ${
          isSelected 
            ? 'border-primary bg-primary/10 shadow-md' 
            : isNearest
            ? 'border-accent bg-accent/10 shadow-md'
            : isVisited
            ? 'border-primary/40 bg-card/80'
            : 'border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/30'
        }`}
      >
        {/* Thumbnail header */}
        {point.coverImage && (
          <div 
            className="w-full h-24 bg-cover bg-center"
            style={{ backgroundImage: `url(${point.coverImage})` }}
          />
        )}
        
        {/* Card body */}
        <div className="p-3">
          {/* Title */}
          <h4 className="font-semibold text-foreground line-clamp-1">
            {point.title[lang]}
          </h4>
          
          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {point.shortDescription[lang]}
          </p>
          
          {/* Footer: badges and distance */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              {hasAR && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-warm/15 text-warm text-[10px] font-bold">
                  <Smartphone className="w-3 h-3" />
                  AR
                </span>
              )}
              {has360 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/15 text-primary text-[10px] font-bold">
                  <Camera className="w-3 h-3" />
                  360°
                </span>
              )}
              {!hasAR && !has360 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent/15 text-accent text-[10px] font-bold">
                  <Info className="w-3 h-3" />
                  INFO
                </span>
              )}
              {hasVideo && <Play className="w-3.5 h-3.5 text-muted-foreground" />}
              {hasAudio && <Headphones className="w-3.5 h-3.5 text-muted-foreground" />}
              {hasPDF && <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
            
            {/* Distance */}
            {distanceInfo && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                <MapPin className="w-3 h-3" />
                {distanceInfo.distance}
              </span>
            )}
          </div>
        </div>
      </motion.button>
    </div>
  );
}
