import { motion, AnimatePresence } from 'framer-motion';
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
  Info
} from 'lucide-react';
import { ImmersiveRoute, RoutePoint } from '@/data/immersiveRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryById } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RouteDetailSheetProps {
  route: ImmersiveRoute | null;
  onClose: () => void;
  onEnterRoute: (route: ImmersiveRoute) => void;
}

const texts = {
  enterRoute: { es: 'Entrar en la ruta', en: 'Enter route', fr: 'Entrer dans l\'itinéraire' },
  duration: { es: 'Duración', en: 'Duration', fr: 'Durée' },
  difficulty: { es: 'Dificultad', en: 'Difficulty', fr: 'Difficulté' },
  points: { es: 'puntos', en: 'points', fr: 'points' },
  theme: { es: 'Temática', en: 'Theme', fr: 'Thème' },
  circular: { es: 'Ruta circular', en: 'Circular route', fr: 'Route circulaire' },
  linear: { es: 'Ruta lineal', en: 'Linear route', fr: 'Route linéaire' },
  tour360Available: { es: 'Tour 360° disponible', en: '360° tour available', fr: 'Tour 360° disponible' },
  preview: { es: 'Vista previa de la ruta', en: 'Route preview', fr: 'Aperçu de l\'itinéraire' },
};

const difficultyLabels = {
  easy: { es: 'Fácil', en: 'Easy', fr: 'Facile' },
  medium: { es: 'Media', en: 'Medium', fr: 'Moyenne' },
  hard: { es: 'Difícil', en: 'Hard', fr: 'Difficile' },
};

const difficultyColors = {
  easy: 'bg-primary/20 text-primary border-primary',
  medium: 'bg-warm/20 text-warm border-warm',
  hard: 'bg-destructive/20 text-destructive border-destructive',
};

export function RouteDetailSheet({ route, onClose, onEnterRoute }: RouteDetailSheetProps) {
  const { t } = useLanguage();

  if (!route) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background z-50 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div 
          className="relative h-56 bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url(${route.coverImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Route ID */}
          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm font-bold">
            {route.id}
          </span>

          {/* Bottom info */}
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-serif font-bold text-white drop-shadow-lg mb-1">
              {t(route.title)}
            </h1>
            <p className="text-white/90 text-sm font-medium">
              {t(route.theme)}
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2">
              {/* Duration */}
              {route.duration && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary" />
                  {t(route.duration)}
                </span>
              )}
              
              {/* Points */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                {route.maxPoints} {t(texts.points)}
              </span>

              {/* Difficulty */}
              {route.difficulty && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${difficultyColors[route.difficulty]}`}>
                  <Mountain className="w-4 h-4" />
                  {t(difficultyLabels[route.difficulty])}
                </span>
              )}

              {/* Circular/Linear */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                <RotateCw className={`w-4 h-4 ${route.isCircular ? 'text-primary' : 'text-muted-foreground'}`} />
                {route.isCircular ? t(texts.circular) : t(texts.linear)}
              </span>

              {/* 360 tour */}
              {route.tour360?.available && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-bold border border-primary/30">
                  <Camera className="w-4 h-4" />
                  360°
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {route.fullDescription ? t(route.fullDescription) : t(route.shortDescription)}
              </p>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {route.categoryIds.map(catId => {
                const cat = getCategoryById(catId);
                return cat ? (
                  <span key={catId} className="category-chip">
                    {t(cat.label)}
                  </span>
                ) : null;
              })}
            </div>

            {/* Points preview (if any) */}
            {route.points.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  {t(texts.preview)} ({route.points.length})
                </h3>
                <div className="space-y-2">
                  {route.points.slice(0, 3).map((point, idx) => (
                    <PointPreviewCard key={point.id} point={point} index={idx} />
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
            onClick={() => onEnterRoute(route)}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
          >
            {t(texts.enterRoute)}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Small point preview card
function PointPreviewCard({ point, index }: { point: RoutePoint; index: number }) {
  const { t } = useLanguage();
  const content = point.content;
  
  // Determine what content types are available
  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <div 
          className="w-12 h-12 rounded-lg bg-cover bg-center border-2 border-primary/30"
          style={{ backgroundImage: point.coverImage ? `url(${point.coverImage})` : undefined }}
        />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">
          {index + 1}
        </div>
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{t(point.title)}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {hasAR && <Smartphone className="w-3.5 h-3.5 text-warm" />}
          {has360 && <Camera className="w-3.5 h-3.5 text-primary" />}
          {hasVideo && <Play className="w-3.5 h-3.5 text-muted-foreground" />}
          {hasAudio && <Headphones className="w-3.5 h-3.5 text-muted-foreground" />}
          {hasPDF && <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
          {!hasAR && !has360 && !hasVideo && !hasAudio && !hasPDF && (
            <Info className="w-3.5 h-3.5 text-accent" />
          )}
        </div>
      </div>
    </div>
  );
}
