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
import { useNavigate } from 'react-router-dom';

interface RouteExplorerViewProps {
  route: ImmersiveRoute;
  onBack: () => void;
  onSelectPoint: (point: RoutePoint) => void;
  selectedPoint: RoutePoint | null;
}

// Helper: safely get string from multilingual field or plain string
function getText(value: any, lang: 'es' | 'en' | 'fr'): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.es || value.en || '';
}

export function RouteExplorerView({ route, onBack, onSelectPoint, selectedPoint }: RouteExplorerViewProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en' | 'fr';
  const { mode } = useExplorationMode();
  const { latitude, longitude, hasLocation } = useGeolocation();
  const [visitedPoints, setVisitedPoints] = useState<Set<string>>(new Set());
  const [routeStartTime] = useState(Date.now());
  const navigate = useNavigate();

  const progress = route.points.length > 0
    ? Math.round((visitedPoints.size / route.points.length) * 100)
    : 0;

  const pointDistances = useMemo(() => {
    if (mode !== 'here' || !hasLocation || latitude === null || longitude === null) {
      return new Map<string, { distance: string; walkTime: number }>();
    }
    const distances = new Map<string, { distance: string; walkTime: number }>();
    route.points.forEach(point => {
      const dest: NavigationDestination = {
        id: point.id,
        name: getText(point.title, lang),
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
    if (!visitedPoints.has(point.id)) {
      trackPOIViewed(point.id, getText(point.title, lang), route.id);
    }
    setVisitedPoints(prev => new Set([...prev, point.id]));
    onSelectPoint(point);
  };

  useEffect(() => {
    if (visitedPoints.size === route.points.length && route.points.length > 0) {
      const durationSec = Math.round((Date.now() - routeStartTime) / 1000);
      trackRouteCompleted(
        route.id,
        getText(route.title, lang),
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
        <button
          onClick={() => { onBack(); navigate('/routes'); }}
          className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('routes.exitRoute')}
        </button>

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
              {getText(route.title, lang)}
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

      {/* Points list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {/* Nearest point suggestion */}
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
                  <p className="font-semibold text-foreground">{getText(nearestPoint.title, lang)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {pointDistances.get(nearestPoint.id)?.distance}
                    <span className="mx-1">•</span>
                    <Footprints className="w-3 h-3" />
                    {formatTime(pointDistances.get(nearestPoint.id)?.walkTime || 0)}
                  </p>
                </div>
                <Button size="sm" onClick={() => handlePointClick(nearestPoint)} className="text-xs">
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
                lang={lang}
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
              <p className="text-sm text-muted-foreground">{t('routes.noPoints')}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Point Card ───────────────────────────────────────────────────────────────
interface PointCardProps {
  point: RoutePoint;
  index: number;
  lang: 'es' | 'en' | 'fr';
  isVisited: boolean;
  isSelected: boolean;
  isLast: boolean;
  isNearest: boolean;
  distanceInfo?: { distance: string; walkTime: number };
  onClick: () => void;
}

function PointCard({ point, index, lang, isVisited, isSelected, isLast, isNearest, distanceInfo, onClick }: PointCardProps) {
  const { t } = useTranslation();
  const content = point.content;

  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;

  const primaryType = hasAR ? 'ar' : has360 ? '360' : 'info';
  const typeColors = {
    ar: { bg: 'bg-warm', text: 'text-warm', border: 'border-warm' },
    '360': { bg: 'bg-360', text: 'text-primary', border: 'border-primary' },
    info: { bg: 'bg-accent', text: 'text-accent', border: 'border-accent' },
  };
  const colors = typeColors[primaryType];

  const title = getText(point.title, lang);
  const shortDescription = getText((point as any).shortDescription ?? (point as any).short_description, lang);

  return (
    <div className="relative flex">
      {/* Timeline connector */}
      <div className="flex flex-col items-center mr-3 flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md z-10 ${colors.bg}`}>
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>

      {/* Card */}
      <div style={{ width: '100%' }}>
        {isVisited && (
          <Check
            style={{ position: 'absolute', right: '5px', top: '5px', padding: '5px' }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md z-10 bg-primary"
          />
        )}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%' }}
          transition={{ delay: index * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={() => {
            onClick();
            window.history.pushState({}, '', '/routes/' + window.location.href.split('/')[4] + '/' + point.order);
          }}
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
          {point.coverImage && (
            <div
              className="w-full h-24 bg-cover bg-center"
              style={{ backgroundImage: `url(https://back.asturias.digitalmetaverso.com/assets/${point.coverImage})` }}
            />
          )}

          <div className="p-3">
            <h4 className="font-semibold text-foreground line-clamp-1">{title}</h4>
            {shortDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{shortDescription}</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                {hasAR && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-warm/15 text-warm text-[10px] font-bold">
                    <Smartphone className="w-3 h-3" />AR
                  </span>
                )}
                {has360 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-360 text-white text-[10px] font-bold">
                    <Camera className="w-3 h-3" />360°
                  </span>
                )}
                {!hasAR && !has360 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent/15 text-accent text-[10px] font-bold">
                    <Info className="w-3 h-3" />INFO
                  </span>
                )}
                {hasVideo && <Play className="w-3.5 h-3.5 text-muted-foreground" />}
                {hasAudio && <Headphones className="w-3.5 h-3.5 text-muted-foreground" />}
                {hasPDF && <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>

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
    </div>
  );
}