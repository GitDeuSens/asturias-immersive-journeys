import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Footprints, Car, MapPin, Eye, Download, Maximize2, Share2, Info, Sparkles } from 'lucide-react';
import { NeedleARViewer } from '@/components/NeedleARViewer';
import { NavigationButton } from '@/components/NavigationButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getARSceneBySlug } from '@/lib/api/directus-client';
import { calculateDistanceTo, formatTime } from '@/lib/navigationService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLanguage } from '@/hooks/useLanguage';
import { trackShare } from '@/lib/analytics';
import type { ARScene, Language } from '@/lib/types';

interface ARPointSheetProps {
  arSlug: string;
  routeId?: string;
  onClose: () => void;
}

const texts = {
  loading:    { es: 'Cargando...', en: 'Loading...', fr: 'Chargement...' },
  notFound:   { es: 'Experiencia no encontrada', en: 'Experience not found', fr: 'Expérience non trouvée' },
  howToGet:   { es: 'Cómo llegar', en: 'How to get there', fr: 'Comment y arriver' },
  fromHere:   { es: 'Desde tu ubicación', en: 'From your location', fr: 'Depuis votre position' },
  howToUse:   { es: 'Cómo usar esta experiencia', en: 'How to use this experience', fr: 'Comment utiliser cette expérience' },
  instructions: {
    slam: {
      es: ['Permite el acceso a la cámara', 'Apunta la cámara al suelo y muévela lentamente', 'Toca para colocar el contenido'],
      en: ['Allow camera access', 'Point the camera at the floor and move slowly', 'Tap to place the content'],
      fr: ['Autorisez l\'accès à la caméra', 'Pointez la caméra vers le sol', 'Touchez pour placer le contenu'],
    },
    'image-tracking': {
      es: ['Imprime el marcador en A4', 'Colócalo en una superficie plana', 'Apunta la cámara al marcador'],
      en: ['Print the marker in A4', 'Place it on a flat surface', 'Point the camera at the marker'],
      fr: ['Imprimez le marqueur en A4', 'Placez-le sur une surface plane', 'Pointez la caméra vers le marqueur'],
    },
    geo: {
      es: ['Ve a la ubicación marcada', 'La AR se activará automáticamente'],
      en: ['Go to the marked location', 'AR will activate automatically'],
      fr: ['Rendez-vous à l\'emplacement', 'L\'AR s\'activera automatiquement'],
    },
  },
  back: { es: 'Volver al recorrido', en: 'Back to route', fr: 'Retour au parcours' },
  share: { es: 'Compartir', en: 'Share', fr: 'Partager' },
  fullscreen: { es: 'Pantalla completa', en: 'Fullscreen', fr: 'Plein écran' },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  arType: {
    slam: { es: 'Superficie', en: 'Surface', fr: 'Surface' },
    'image-tracking': { es: 'Marcador', en: 'Marker', fr: 'Marqueur' },
    geo: { es: 'GPS', en: 'GPS', fr: 'GPS' },
  },
  difficulty: {
    easy: { es: 'Fácil', en: 'Easy', fr: 'Facile' },
    moderate: { es: 'Moderado', en: 'Moderate', fr: 'Modéré' },
    advanced: { es: 'Avanzado', en: 'Advanced', fr: 'Avancé' },
  },
  duration: { es: 'min', en: 'min', fr: 'min' },
};

export function ARPointSheet({ arSlug, routeId, onClose }: ARPointSheetProps) {
  const navigate = useNavigate();
  const { language: locale } = useLanguage();
  const lang = locale as Language;
  const { latitude, longitude, hasLocation } = useGeolocation();
  const [scene, setScene] = useState<ARScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getARSceneBySlug(arSlug, lang)
      .then(data => { if (!cancelled) { setScene(data); setIsLoading(false); } })
      .catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [arSlug, lang]);

  const handleClose = () => {
    if (routeId) {
      navigate(`/routes/${routeId}`, { replace: true });
    } else {
      navigate(-1);
    }
    onClose();
  };

  const handleFullscreenToggle = () => setIsFullscreen(!isFullscreen);

  const handleBrowserFullscreen = () => {
    const el = document.querySelector('.ar-fullscreen-container');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen?.();
      }
    }
  };

  const handleShare = async () => {
    if (!scene) return;
    try {
      const url = `${window.location.origin}/ar/${scene.slug}`;
      if (navigator.share) {
        await navigator.share({ title: scene.title[lang] || scene.title.es, url });
        trackShare('native', 'ar_scene', scene.id);
      } else {
        await navigator.clipboard.writeText(url);
        trackShare('clipboard', 'ar_scene', scene.id);
      }
    } catch {}
  };

  const distInfo = scene?.location && hasLocation && latitude !== null && longitude !== null
    ? calculateDistanceTo(latitude, longitude, {
        id: scene.id,
        name: scene.title[lang] || scene.title.es,
        lat: scene.location.lat,
        lng: scene.location.lng,
        type: 'route-point',
      })
    : null;

  // ── Fullscreen AR Viewer (same pattern as 360 tours) ──
  if (isFullscreen && scene) {
    const title = scene.title[lang] || scene.title.es;
    const description = scene.description[lang] || scene.description.es;
    const arTypeName = texts.arType[scene.needle_type as keyof typeof texts.arType]?.[lang] ?? scene.needle_type;
    const difficultyName = texts.difficulty[scene.difficulty as keyof typeof texts.difficulty]?.[lang] ?? scene.difficulty;

    return (
      <motion.div
        key="ar-fullscreen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black ar-fullscreen-container"
      >
        {/* NeedleARViewer fills entire screen */}
        <div className="absolute inset-0 z-0">
          <NeedleARViewer scene={scene} locale={lang} />
        </div>

        {/* Floating header — must be above needle-engine canvas (z-index ~2147483640) */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto" style={{ zIndex: 2147483645 }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">{title}</h2>
              <p className="text-xs text-white/50">
                {arTypeName}
                {scene.difficulty && ` · ${difficultyName}`}
                {scene.duration_minutes && ` · ${scene.duration_minutes} ${texts.duration[lang]}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {description && (
              <Button
                variant="ghost" size="icon"
                onClick={() => setShowInfo(!showInfo)}
                className={`text-white hover:bg-white/20 h-8 w-8 ${showInfo ? 'bg-white/20' : ''}`}
              >
                <Info className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-white hover:bg-white/20 h-8 w-8">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleBrowserFullscreen} className="text-white hover:bg-white/20 h-8 w-8">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleFullscreenToggle} className="text-white hover:bg-white/20 gap-1 h-8 px-3">
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{texts.close[lang]}</span>
            </Button>
          </div>
        </div>

        {/* Info panel */}
        <AnimatePresence>
          {showInfo && description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-[49px] left-0 right-0 bg-black/80 border-b border-white/10 overflow-hidden" style={{ zIndex: 2147483645 }}
            >
              <p className="px-4 py-3 text-sm text-white/70 max-w-4xl">{description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ── Side-panel (default) ──
  return (
    <AnimatePresence>
      <motion.div
        key="ar-point-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        key="ar-point-sheet"
        initial={{ x: '100%', opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 200, mass: 0.9 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background z-50 shadow-2xl flex flex-col overflow-hidden md:rounded-l-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — styled like 360 tours */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-black/90 to-black/70 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {scene ? (scene.title[lang] || scene.title.es) : (lang === 'es' ? 'Experiencia AR' : 'AR Experience')}
              </h2>
              {scene && (
                <p className="text-xs text-white/50">
                  {texts.arType[scene.needle_type as keyof typeof texts.arType]?.[lang] ?? scene.needle_type}
                  {scene.difficulty && ` · ${texts.difficulty[scene.difficulty as keyof typeof texts.difficulty]?.[lang] ?? scene.difficulty}`}
                  {scene.duration_minutes && ` · ${scene.duration_minutes} ${texts.duration[lang]}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {scene && (
              <>
                <Button variant="ghost" size="icon" onClick={handleShare} className="text-white hover:bg-white/20 h-8 w-8">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleFullscreenToggle} className="text-white hover:bg-white/20 h-8 w-8" title={texts.fullscreen[lang]}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20 gap-1 h-8 px-3">
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{texts.close[lang]}</span>
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>{texts.loading[lang]}</span>
            </div>
          </div>
        )}

        {!isLoading && !scene && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {texts.notFound[lang]}
          </div>
        )}

        {!isLoading && scene && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Hero image */}
              {scene.preview_image && (
                <div className="relative rounded-xl overflow-hidden aspect-video">
                  {scene.preview_video
                    ? <video src={scene.preview_video} autoPlay loop muted playsInline className="w-full h-full object-cover" poster={scene.preview_image} />
                    : <img src={scene.preview_image} alt={scene.title[lang] || scene.title.es} className="w-full h-full object-cover" />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h1 className="text-xl font-bold text-white">{scene.title[lang] || scene.title.es}</h1>
                    {scene.description && (
                      <p className="text-white/80 text-sm mt-1 line-clamp-2">{scene.description[lang] || scene.description.es}</p>
                    )}
                  </div>
                </div>
              )}

              {/* How to get there */}
              {scene.location && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Navigation className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{texts.howToGet[lang]}</h3>
                      {distInfo && <p className="text-xs text-muted-foreground">{texts.fromHere[lang]}</p>}
                    </div>
                  </div>

                  {distInfo && (
                    <div className="flex items-center gap-4 mb-3 p-3 rounded-lg bg-card/50">
                      <p className="text-2xl font-bold text-primary">{distInfo.distanceFormatted}</p>
                      <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Footprints className="w-4 h-4" /><span>{formatTime(distInfo.estimatedWalkingTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Car className="w-4 h-4" /><span>{formatTime(distInfo.estimatedDrivingTime)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <NavigationButton
                    destination={{ id: scene.id, name: scene.title[lang] || scene.title.es, lat: scene.location.lat, lng: scene.location.lng, type: 'route-point' }}
                    variant="primary"
                    className="w-full"
                  />
                </div>
              )}

              {/* AR Viewer */}
              <div>
                <NeedleARViewer scene={scene} locale={lang} />
              </div>

              {/* Fullscreen button below viewer */}
              <Button
                onClick={handleFullscreenToggle}
                variant="outline"
                className="w-full gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                {texts.fullscreen[lang]}
              </Button>

              {/* Instructions */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />{texts.howToUse[lang]}
                </h2>
                <ol className="space-y-2">
                  {(texts.instructions[scene.needle_type]?.[lang] ?? texts.instructions.slam[lang]).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">{idx + 1}</span>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>

                {scene.needle_type === 'image-tracking' && scene.tracking_image_url && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <img src={scene.tracking_image_url} alt="AR Marker" className="w-24 h-24 border border-border rounded-lg mb-2" />
                    <a href={scene.tracking_image_url} download={`marcador-${scene.slug}.png`} className="inline-flex items-center text-sm text-primary hover:underline">
                      <Download className="w-4 h-4 mr-1" />
                      {lang === 'es' ? 'Descargar marcador (A4)' : lang === 'en' ? 'Download marker (A4)' : 'Télécharger le marqueur (A4)'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
