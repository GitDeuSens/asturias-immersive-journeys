import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  RotateCw,
  Mountain,
  ChevronRight,
  Camera,
  Play,
  FileText,
  Headphones,
  Smartphone,
  Info,
  Ruler,
  Navigation,
  Footprints,
  Tag,
  BookOpen,
  UtensilsCrossed,
  Compass,
  Landmark
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ImmersiveRoute, RoutePoint } from '@/data/types';
import { useDirectusCategories } from '@/hooks/useDirectusData';
import { calculateRouteDistance, formatDistance, openNavigation } from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShareButtons } from '@/components/ShareButtons';
import { trackRouteViewed } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

interface RouteDetailSheetProps {
  route: ImmersiveRoute | null;
  onClose: () => void;
  onEnterRoute: (route: ImmersiveRoute) => void;
}

export function RouteDetailSheet({ route, onClose, onEnterRoute }: RouteDetailSheetProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en' | 'fr';
  const { getCategoryById } = useDirectusCategories(lang);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Mountain,
    Landmark,
    Compass,
    UtensilsCrossed,
    BookOpen,
    Tag,
  };

  // Track route view when details are opened
  useEffect(() => {
    if (route) {
      const routeName = typeof route.title === 'string' ? route.title : route.title[lang] || route.title.es;
      trackRouteViewed(route.id, routeName, route.points.length);
    }
  }, [route, lang]);

  if (!route) return null;

  const calculatedDistance = calculateRouteDistance(route.polyline);
  const distance = route.distanceKm || calculatedDistance;

  const allFunctions = (route: ImmersiveRoute) => {
    onEnterRoute(route);
    onClose();
    window.history.pushState({}, '', '/routes/' + route.id);
  }

  const surfaceLabels: Record<string, Record<string, string>> = {
    paved: { es: 'Asfaltado', en: 'Paved', fr: 'Asphalté' },
    gravel: { es: 'Grava', en: 'Gravel', fr: 'Gravier' },
    dirt: { es: 'Tierra', en: 'Dirt', fr: 'Terre' },
    mixed: { es: 'Mixto', en: 'Mixed', fr: 'Mixte' },
  };

  const difficultyColors = {
    easy: 'bg-primary/20 text-primary border-primary',
    medium: 'bg-warm/20 text-warm border-warm',
    hard: 'bg-destructive/20 text-destructive border-destructive',
  };

  const handleNavigateToStart = () => {
    if (route.polyline.length > 0) {
      const start = route.points[0].location;
      console.log(' ruta ??? ', route);
      openNavigation(start.lat, start.lng, route.title[lang]);
    }
  };

  console.log(' route ', route);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        onClick={onClose}
        role="presentation"
      />
      <motion.div
        key="sheet"
        initial={{ x: '100%', opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.8 }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 200,
          mass: 0.9,
          opacity: { duration: 0.2, ease: 'easeOut' }
        }}
        style={{ width: '100%' }}
        className="fixed right-0 top-0 bottom-0 max-w-lg bg-background z-50 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-detail-title"
      >
        {/* Hero image */}
        <div
          className="relative h-56 bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url(${route.coverImage})` }}
          role="img"
          aria-label={route.title[lang]}
        >
          <div className="absolute inset-0 from-background via-background/20 to-transparent" aria-hidden="true" />

          {/* Close button */}
          <button
            onClick={() => {
              onClose();
              location.reload();
            }
            }
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Route ID */}
          <span className="hidden absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-foreground text-sm font-bold shadow-lg">
            {route.id}
          </span>


        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          {/* Bottom info */}
          <div className="pl-6 pt-3">
            <h1 id="route-detail-title" className="text-2xl font-serif font-bold mb-1">
              {route.title[lang]}
            </h1>
            <p className="text-sm font-medium">
              {route.theme[lang]}
            </p>
          </div>
          <div className="p-6 space-y-6">
            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2">
              {/* Duration */}
              {route.duration && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                  {route.duration[lang]}
                </span>
              )}

              {/* Distance */}
              {distance > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                  <Ruler className="w-4 h-4 text-primary" aria-hidden="true" />
                  {route.distanceKm ? `${route.distanceKm} km` : formatDistance(distance)}
                </span>
              )}

              {/* Elevation */}
              {route.elevationGainMeters && route.elevationGainMeters > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                  <Mountain className="w-4 h-4 text-primary" aria-hidden="true" />
                  ↑ {route.elevationGainMeters} m
                </span>
              )}

              {/* Surface type */}
              {route.surfaceType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                  <Footprints className="w-4 h-4 text-primary" aria-hidden="true" />
                  {surfaceLabels[route.surfaceType]?.[lang] || route.surfaceType}
                </span>
              )}

              {/* Points */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                {route.points.length} {t('routes.points')}
              </span>

              {/* Difficulty */}
              {route.difficulty && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${difficultyColors[route.difficulty]}`}>
                  <Mountain className="w-4 h-4" aria-hidden="true" />
                  {t(`difficulty.${route.difficulty}`)}
                </span>
              )}

              {/* Circular/Linear */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                <RotateCw className={`w-4 h-4 ${route.isCircular ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                {route.isCircular ? t('routes.circular') : t('routes.linear')}
              </span>

              {/* 360 tour */}
              {route.tour360?.available && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-bold border border-primary/30">
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  360°
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {route.fullDescription ? route.fullDescription[lang] : route.shortDescription[lang]}
              </p>
            </div>

            {/* Navigation button - NEW */}
            {route.polyline.length > 0 && (
              <Button
                variant="outline"
                className="w-100 justify-between"
                onClick={handleNavigateToStart}
                style={{ width: '100%' }}
              >
                <span className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" aria-hidden="true" />
                  {t('routes.howToGet')}
                </span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {route.categoryIds.map(catId => {
                const cat = getCategoryById(catId);
                const IconComponent = iconMap[cat?.icon] || Tag;
                return cat ? (
                  <span className="px-2 py-2 border text-base" style={{ borderRadius: '300px' }}>
                    <IconComponent className="w-8 h-8 text-base" />
                  </span>
                ) : null;
              })}
            </div>

            {/* Share buttons - NEW */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">{t('common.share')}</p>
              <ShareButtons
                title={route.title[lang]}
                description={route.shortDescription[lang]}
                routeCode={route.id}
                hashtags={['AsturiasParaisoNatural', 'AsturiasInmersivo', route.id.replace('-', '')]}
              />
            </div>

            {/* Points preview (if any) */}
            {route.points.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  {t('routes.points')} ({route.points.length})
                </h3>
                <div className="space-y-4">
                  {route.points.map((point, idx) => (
                    <PointPreviewCard key={point.id} point={point} index={idx} lang={lang} />
                  ))}
                  {route.points.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      +{route.points.length - 3} más...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* CTA Footer */}
        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <Button
            onClick={() => allFunctions(route)}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
          >
            {t('routes.enterRoute')}
            <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Small point preview card
function PointPreviewCard({ point, index, lang }: { point: RoutePoint; index: number; lang: any }) {
  const content = point.content;
  // Determine what content types are available
  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;
  const pointTitle = point.title;
  const primaryType = hasAR ? 'ar' : has360 ? '360' : 'info';
  const typeColors = {
    ar: { bg: 'bg-warm', text: 'text-warm', border: 'border-warm' },
    '360': { bg: 'bg-360', text: 'text-primary', border: 'border-primary' },
    info: { bg: 'bg-accent', text: 'text-accent', border: 'border-accent' },
  };
  const colors = typeColors[primaryType];

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50" style={{ width: '100%' }}>
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <div
          className="w-12 h-12 rounded-lg bg-cover bg-center border-2 border-primary/30"
          style={{ backgroundImage: point.coverImage ? `url(https://back.asturias.digitalmetaverso.com/assets/${point.coverImage})` : undefined }}
          role="img"
          aria-label={point.title as any}
        />
        <div className={`absolute -top-2 -right-2 w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm`}>
          {index + 1}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">{point.title as any}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {hasAR &&
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-warm/15 text-warm text-[10px] font-bold">
              <Smartphone className="w-3 h-3" />AR
            </span>
          }
          {has360 &&
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-360 text-white text-[10px] font-bold">
              <Camera className="w-3 h-3" />360°
            </span>}
          {hasVideo && <Play className="w-3.5 h-3.5 text-muted-foreground" aria-label="Video" />}
          {hasAudio && <Headphones className="w-3.5 h-3.5 text-muted-foreground" aria-label="Audio" />}
          {hasPDF && <FileText className="w-3.5 h-3.5 text-muted-foreground" aria-label="PDF" />}
          {!hasAR && !has360 && !hasVideo && !hasAudio && !hasPDF && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent/15 text-accent text-[10px] font-bold">
              <Info className="w-3 h-3" />INFO
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
