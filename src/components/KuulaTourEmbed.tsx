// ============ KUULA TOUR EMBED COMPONENT ============
// Enhanced Kuula integration with branding, analytics, fullscreen

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Share2, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { trackEvent, trackTourStarted, trackTourCompleted } from '@/lib/analytics';
import { useLanguage } from '@/hooks/useLanguage';
import type { KuulaTour, Language } from '@/lib/types';

interface KuulaTourEmbedProps {
  tour: KuulaTour;
  locale?: Language;
  autoPlay?: boolean;
  showControls?: boolean;
  onClose?: () => void;
}

const texts = {
  fullscreen: { es: 'Pantalla completa', en: 'Fullscreen', fr: 'Plein écran' },
  exitFullscreen: { es: 'Salir', en: 'Exit', fr: 'Quitter' },
  share: { es: 'Compartir', en: 'Share', fr: 'Partager' },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  panoramas: { es: 'panoramas', en: 'panoramas', fr: 'panoramas' },
  loading: { es: 'Cargando tour virtual...', en: 'Loading virtual tour...', fr: 'Chargement de la visite virtuelle...' },
  error: { es: 'No se pudo cargar el tour', en: 'Could not load tour', fr: 'Impossible de charger la visite' },
};

export function KuulaTourEmbed({ 
  tour, 
  locale = 'es',
  autoPlay = false,
  showControls = true,
  onClose 
}: KuulaTourEmbedProps) {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const startTimeRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // build_path points to deployed 3DVista dist in public/tours-builds/
  const embedUrl = tour.kuula_embed_url || null;

  useEffect(() => {
    // Track tour started
    trackTourStarted(tour.id, tour.title[locale] || tour.title.es);
    startTimeRef.current = Date.now();

    return () => {
      // Track tour completed on unmount
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 5) {
        trackTourCompleted(tour.id, timeSpent);
      }
    };
  }, [tour.id, tour.title, locale]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    trackEvent('tour_loaded', { tour_id: tour.id });
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    trackEvent('tour_error', { tour_id: tour.id });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    trackEvent('fullscreen_toggled', { 
      tour_id: tour.id, 
      is_fullscreen: !isFullscreen 
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: tour.title[locale] || tour.title.es,
      text: tour.description[locale] || tour.description.es,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackEvent('tour_shared', { tour_id: tour.id, method: 'native' });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        trackEvent('tour_shared', { tour_id: tour.id, method: 'clipboard' });
      }
    } catch (error) {
      console.log('Share cancelled or failed');
    }
  };

  const TourViewer = () => (
    <div className="relative w-full h-full bg-black">
      {/* Loading overlay */}
      {isLoading && embedUrl && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/80">{texts.loading[locale]}</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <p className="text-lg mb-4">{texts.error[locale]}</p>
            <Button 
              variant="outline" 
              onClick={() => { setHasError(false); setIsLoading(true); }}
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* 3DVista / Tour iframe */}
      {embedUrl ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
          title={tour.title[locale] || tour.title.es}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/80">
          <div className="text-center p-8">
            <p className="text-lg font-semibold text-white/80 mb-2">
              {locale === 'es' ? 'Tour no disponible' : locale === 'fr' ? 'Visite non disponible' : 'Tour not available'}
            </p>
            <p className="text-sm text-white/50">
              {locale === 'es' ? 'El archivo del tour aún no ha sido desplegado' : locale === 'fr' ? 'Le fichier de la visite n\'a pas encore été déployé' : 'Tour files have not been deployed yet'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Fullscreen modal
  if (isFullscreen) {
    return (
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-0 bg-black">
          <VisuallyHidden>
            <DialogTitle>{tour.title[locale] || tour.title.es}</DialogTitle>
          </VisuallyHidden>
          
          {/* Fullscreen header */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3 text-white">
              <span className="font-semibold">{tour.title[locale] || tour.title.es}</span>
              <span className="text-white/60 text-sm">
                {tour.total_panoramas} {texts.panoramas[locale]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
                className="text-white hover:bg-white/20"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <TourViewer />
        </DialogContent>
      </Dialog>
    );
  }

  // When showControls is false, render just the viewer (used inside modal)
  if (!showControls) {
    return <div className="w-full h-full"><TourViewer /></div>;
  }

  // Regular embedded view with controls
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden bg-card border border-border shadow-lg"
    >
      {/* Header */}
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div>
            <h3 className="font-semibold text-foreground">
              {tour.title[locale] || tour.title.es}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tour.total_panoramas} {texts.panoramas[locale]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-muted-foreground hover:text-foreground"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tour viewer */}
      <div className="aspect-video">
        <TourViewer />
      </div>

      {/* Footer with description */}
      {tour.description[locale] && (
        <div className="p-4 border-t border-border bg-card/50">
          <p className="text-sm text-muted-foreground">
            {tour.description[locale]}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default KuulaTourEmbed;
