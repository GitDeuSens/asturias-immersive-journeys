import { useState, useMemo } from 'react';
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
import { ImmersiveRoute, RoutePoint } from '@/data/immersiveRoutes';
import { useLanguage, useExplorationMode } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const texts = {
  back: { es: 'Salir de la ruta', en: 'Exit route', fr: 'Quitter l\'itinéraire' },
  exploring: { es: 'Explorando', en: 'Exploring', fr: 'Exploration' },
  points: { es: 'puntos', en: 'points', fr: 'points' },
  noPointsYet: { es: 'Los puntos de esta ruta están en desarrollo', en: 'Points for this route are in development', fr: 'Les points de cet itinéraire sont en développement' },
  progress: { es: 'Progreso', en: 'Progress', fr: 'Progression' },
  viewContent: { es: 'Ver contenido', en: 'View content', fr: 'Voir le contenu' },
  nearestPoint: { es: 'Punto más cercano', en: 'Nearest point', fr: 'Point le plus proche' },
  startHere: { es: 'Empezar aquí', en: 'Start here', fr: 'Commencer ici' },
};

export function RouteExplorerView({ route, onBack, onSelectPoint, selectedPoint }: RouteExplorerViewProps) {
  const { t, language } = useLanguage();
  const { mode } = useExplorationMode();
  const { latitude, longitude, hasLocation } = useGeolocation();
  const [visitedPoints, setVisitedPoints] = useState<Set<string>>(new Set());
  
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
        name: typeof point.title === 'string' ? point.title : point.title[language] || point.title.es,
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
  }, [route.points, latitude, longitude, hasLocation, mode, language]);

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
    setVisitedPoints(prev => new Set([...prev, point.id]));
    onSelectPoint(point);
  };

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
          {t(texts.back)}
        </button>

        {/* Route info */}
        <div className="flex items-start gap-3">
          <div 
            className="w-14 h-14 rounded-xl bg-cover bg-center flex-shrink-0 border-2 border-primary/30"
            style={{ backgroundImage: `url(${route.coverImage})` }}
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {t(texts.exploring)}
            </span>
            <h2 className="font-sans font-bold text-foreground text-lg leading-tight truncate">
              {t(route.title)}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {route.points.length} {t(texts.points)}
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
              <span className="text-muted-foreground">{t(texts.progress)}</span>
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {t(texts.nearestPoint)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{t(nearestPoint.title)}</p>
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
                  {t(texts.startHere)}
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
                {t(texts.noPointsYet)}
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
  const { t } = useLanguage();
  const content = point.content;
  
  // Determine what content types are available
  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;
  const hasImage = !!content.image;

  // Get primary content type for styling
  const getPrimaryType = () => {
    if (hasAR) return 'ar';
    if (has360) return '360';
    return 'info';
  };

  const primaryType = getPrimaryType();
  const borderColors = {
    ar: 'border-warm',
    '360': 'border-primary',
    info: 'border-accent',
  };
  const bgColors = {
    ar: 'bg-warm',
    '360': 'bg-primary',
    info: 'bg-accent',
  };

  return (
    <div className="relative">
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-border" style={{ height: 'calc(100% - 3rem)' }} />
      )}

      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
          isSelected 
            ? 'bg-primary/20 border-2 border-primary' 
            : isNearest
            ? 'bg-accent/20 border-2 border-accent'
            : isVisited
            ? 'bg-muted/30 border border-primary/30'
            : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
        }`}
      >
        {/* Thumbnail / Badge */}
        <div className="relative flex-shrink-0">
          {point.coverImage ? (
            <div 
              className={`w-14 h-14 rounded-xl bg-cover bg-center border-2 ${borderColors[primaryType]}`}
              style={{ backgroundImage: `url(${point.coverImage})` }}
            />
          ) : (
            <div className={`w-14 h-14 rounded-xl ${bgColors[primaryType]}/20 border-2 ${borderColors[primaryType]} flex items-center justify-center`}>
              {hasAR && <Smartphone className="w-6 h-6 text-warm" />}
              {has360 && !hasAR && <Camera className="w-6 h-6 text-primary" />}
              {!hasAR && !has360 && <Info className="w-6 h-6 text-accent" />}
            </div>
          )}
          
          {/* Order number */}
          <div className={`absolute -top-2 -left-2 w-7 h-7 ${bgColors[primaryType]} rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-md`}>
            {isVisited ? <Check className="w-4 h-4" /> : index + 1}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <h4 className="font-semibold text-foreground truncate">
            {t(point.title)}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {t(point.shortDescription)}
          </p>
          
          {/* Content type indicators + distance */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {hasAR && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm/20 text-warm text-[10px] font-bold border border-warm/30">
                <Smartphone className="w-3 h-3" />
                AR
              </span>
            )}
            {has360 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold border border-primary/30">
                <Camera className="w-3 h-3" />
                360°
              </span>
            )}
            {hasVideo && <Play className="w-4 h-4 text-muted-foreground" />}
            {hasAudio && <Headphones className="w-4 h-4 text-muted-foreground" />}
            {hasPDF && <FileText className="w-4 h-4 text-muted-foreground" />}
            {hasImage && !hasAR && !has360 && <Info className="w-4 h-4 text-accent" />}
            
            {/* Distance indicator */}
            {distanceInfo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium ml-auto">
                <MapPin className="w-3 h-3" />
                {distanceInfo.distance}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground mt-4 flex-shrink-0" />
      </motion.button>
    </div>
  );
}
