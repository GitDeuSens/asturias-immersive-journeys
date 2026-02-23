import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Camera, Play, FileText, Headphones, Smartphone, ExternalLink, ChevronRight, Maximize2, Sparkles, Image as ImageIcon, Phone, Mail, Globe, Clock, Euro, Info, Navigation, Footprints, Car, Eye, Download, Share2 } from 'lucide-react';
import type { RoutePoint } from '@/data/types';
import { useLanguage, useExplorationMode } from '@/hooks/useLanguage';
import { useIsMobile } from '@/hooks/use-mobile';
import { NeedleARViewer } from '@/components/NeedleARViewer';
import type { ARScene, Language } from '@/lib/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationButton } from '@/components/NavigationButton';
import { calculateDistanceTo, formatTime, type NavigationDestination } from '@/lib/navigationService';
import { trackPOITimeSpent } from '@/lib/analytics';
import { openNavigation } from '@/lib/mapUtils';
import { getARScenesByPOI } from '@/lib/api/directus-client';
import { ShareButtons } from '@/components/ShareButtons';

interface PointDetailSheetProps { point: RoutePoint | null; onClose: () => void; }

function getText(value: any, lang: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.es || value.en || '';
}

const texts = {
  launchAR: { es: 'Abrir experiencia AR', en: 'Launch AR experience', fr: "Lancer l'experience AR" },
  scanQRDesc: { es: 'Apunta la camara de tu movil al codigo QR para abrir la experiencia AR', en: 'Point your phone camera at the QR code to open the AR experience', fr: 'Pointez la camera vers le code QR' },
  location: { es: 'Ubicacion', en: 'Location', fr: 'Emplacement' },
  contentAvailable: { es: 'Contenido disponible', en: 'Available content', fr: 'Contenu disponible' },
  open360: { es: 'Abrir tour 360', en: 'Open 360 tour', fr: 'Ouvrir le tour 360' },
  playVideo: { es: 'Reproducir video', en: 'Play video', fr: 'Lire la video' },
  downloadPDF: { es: 'Descargar PDF', en: 'Download PDF', fr: 'Telecharger le PDF' },
  listenAudio: { es: 'Escuchar audioguia', en: 'Listen to audioguide', fr: "Ecouter l'audioguide" },
  arExperience: { es: 'Experiencia de Realidad Aumentada', en: 'Augmented Reality Experience', fr: 'Experience de Realite Augmentee' },
  shareExperience: { es: 'Comparte esta experiencia', en: 'Share this experience', fr: 'Partagez cette experience' },
  gallery: { es: 'Galeria de imagenes', en: 'Image gallery', fr: "Galerie d'images" },
  practicalInfo: { es: 'Informacion practica', en: 'Practical information', fr: 'Informations pratiques' },
  schedule: { es: 'Horarios', en: 'Schedule', fr: 'Horaires' },
  prices: { es: 'Precios', en: 'Prices', fr: 'Prix' },
  howToGet: { es: 'Como llegar', en: 'How to get there', fr: 'Comment y arriver' },
  fromYourLocation: { es: 'Desde tu ubicacion', en: 'From your location', fr: 'Depuis votre position' },
};

const AR_INSTRUCTIONS: Record<string, Record<string, string[]>> = {
  slam: {
    es: ['Permite el acceso a la camara', 'Apunta la camara al suelo y muevela lentamente', 'Toca para colocar el contenido AR'],
    en: ['Allow camera access', 'Point the camera at the floor and move slowly', 'Tap to place the AR content'],
    fr: ["Autorisez l'acces a la camera", 'Pointez la camera vers le sol', 'Touchez pour placer le contenu AR'],
  },
  'image-tracking': {
    es: ['Imprime el marcador en A4', 'Coloca en superficie plana', 'Apunta la camara al marcador'],
    en: ['Print the marker in A4', 'Place it on a flat surface', 'Point the camera at the marker'],
    fr: ['Imprimez le marqueur en A4', 'Placez-le sur une surface plane', 'Pointez la camera vers le marqueur'],
  },
  geo: {
    es: ['Ve a la ubicacion marcada', 'La AR se activara automaticamente'],
    en: ['Go to the marked location', 'AR will activate automatically'],
    fr: ["Rendez-vous a l'emplacement", "L'AR s'activera automatiquement"],
  },
};

export function PointDetailSheet({ point, onClose }: PointDetailSheetProps) {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [showARViewer, setShowARViewer] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [loadedARScene, setLoadedARScene] = useState<ARScene | null>(null);
  const poiStartTime = useRef<number>(Date.now());
  const prevUrlRef = useRef<string>(window.location.pathname);

  useEffect(() => {
    if (!point?.content?.arExperience) return;
    prevUrlRef.current = window.location.pathname;
    getARScenesByPOI(point.id, language as Language).then(scenes => {
      if (scenes.length > 0) {
        setLoadedARScene(scenes[0]);
        window.history.pushState({ fromRoute: true }, '', `/ar/${scenes[0].slug}`);
      }
    });
    return () => { window.history.pushState({}, '', prevUrlRef.current); };
  }, [point?.id, point?.content?.arExperience, language]);

  useEffect(() => {
    return () => {
      if (point) {
        const durationSec = Math.round((Date.now() - poiStartTime.current) / 1000);
        if (durationSec > 2) trackPOITimeSpent(point.id, getText(point.title, language), durationSec);
      }
    };
  }, [point, language]);

  const arScene: ARScene | null = useMemo(() => {
    if (!point) return null;
    if (loadedARScene) return loadedARScene;
    const content = point.content;
    if (!content.arExperience?.iframe3dUrl) return null;
    return {
      id: point.id, slug: `poi-${point.id}`,
      title: typeof point.title === 'string' ? { es: point.title, en: point.title, fr: point.title } : point.title,
      description: (point as any).shortDescription || { es: '', en: '', fr: '' },
      needle_scene_url: content.arExperience.iframe3dUrl,
      needle_type: 'slam' as const, scene_mode: 'build' as const, build_path: undefined,
      preview_image: point.coverImage || '', difficulty: 'easy' as const,
      duration_minutes: 5, requires_outdoors: false, published: true,
    };
  }, [point, loadedARScene]);

  if (!point) return null;

  const content = point.content;
  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;
  const title = getText(point.title, language);
  const shortDescription = getText((point as any).shortDescription ?? (point as any).short_description, language);

  const handleNavigateToStart = () => {
    if (point.location !== null) openNavigation(point.location.lat, point.location.lng, title);
  };


  const arTitle = arScene ? getText(arScene.title, language) : title;
  const arDescription = arScene ? getText(arScene.description, language) : shortDescription;

  return (
    <>
      <AnimatePresence>
        <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div key="sheet"
          initial={{ x: '100%', opacity: 0.8 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0.8 }}
          transition={{ type: 'spring', damping: 28, stiffness: 200, mass: 0.9, opacity: { duration: 0.2, ease: 'easeOut' } }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background z-50 shadow-2xl flex flex-col overflow-hidden md:rounded-l-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero image */}
          <div
            className="relative h-56 bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: point.coverImage ? `url(${import.meta.env.VITE_DIRECTUS_URL || 'https://back.asturias.digitalmetaverso.com'}/assets/${point.coverImage})` : undefined }}
          >
            <div className="absolute inset-0 from-background via-background/40 to-transparent" />
            <button
              onClick={() => {
                onClose();
                window.history.pushState({}, '', '/routes/' + window.location.href.split('/')[4]);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {hasAR && (
              <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warm text-warm-foreground text-sm font-bold shadow-lg">
                <Smartphone className="w-4 h-4" />AR<Sparkles className="w-3 h-3" />
              </motion.span>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="px-6 pt-3 space-y-1">
              <h1 className="text-2xl font-serif font-bold">{title}</h1>
              {hasAR && arDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">{arDescription}</p>
              )}
            </div>
            <div className="p-6 space-y-6">
              {!hasAR && <p className="text-muted-foreground leading-relaxed text-base">{shortDescription}</p>}
              <NavigationSection point={point} />
              {point.location.address && (
                <div className="cursor-pointer flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50" onClick={handleNavigateToStart}>
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(texts.location)}</p>
                    <p className="text-sm text-muted-foreground">{point.location.address}</p>
                  </div>
                </div>
              )}

              {hasAR && arScene && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-warm/20"><Smartphone className="w-5 h-5 text-warm" /></div>
                    <h3 className="text-base font-semibold text-foreground">{t(texts.arExperience)}</h3>
                  </div>

                  <NeedleARViewer scene={arScene} locale={language as Language} />

                  {isMobile && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={() => setShowARViewer(true)}
                        className="w-full h-14 text-base font-bold bg-gradient-to-r from-warm to-amber-500 hover:from-warm/90 hover:to-amber-500/90 text-warm-foreground shadow-lg shadow-warm/25 border-0">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-white/20 rounded-lg"><Smartphone className="w-5 h-5" /></div>
                          <span>{t(texts.launchAR)}</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </Button>
                    </motion.div>
                  )}

                  <div className="bg-card border border-border rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      {language === 'es' ? 'Como usar esta experiencia' : language === 'en' ? 'How to use this experience' : 'Comment utiliser cette experience'}
                    </h4>
                    <ol className="space-y-2">
                      {(AR_INSTRUCTIONS[arScene.needle_type]?.[language] ?? AR_INSTRUCTIONS.slam[language] ?? AR_INSTRUCTIONS.slam.es).map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">{idx + 1}</span>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                    {arScene.needle_type === 'image-tracking' && arScene.tracking_image_url && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <img src={arScene.tracking_image_url} alt="AR Marker" className="w-24 h-24 border border-border rounded-lg mb-2" />
                        <a href={arScene.tracking_image_url} download={`marcador-${arScene.slug}.png`} className="inline-flex items-center text-sm text-primary hover:underline">
                          <Download className="w-4 h-4 mr-1" />
                          {language === 'es' ? 'Descargar marcador (A4)' : language === 'en' ? 'Download marker (A4)' : 'Telecharger le marqueur (A4)'}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-primary" />{t(texts.shareExperience)}
                    </h4>
                    <ShareButtons url={window.location.href} title={arTitle} description={arDescription} variant="inline" />
                  </div>
                </motion.div>
              )}

              {hasAR && !arScene && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-warm/20"><Smartphone className="w-5 h-5 text-warm" /></div>
                    <h3 className="text-base font-semibold text-foreground">{t(texts.arExperience)}</h3>
                  </div>
                  <div className="flex items-center justify-center p-8 bg-muted/30 rounded-xl">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </motion.div>
              )}

              {has360 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />Tour 360
                  </h3>
                  <Button variant="outline" className="w-full justify-between" onClick={() => window.open(content.tour360!.iframe360Url, '_blank')}>
                    {t(texts.open360)}<Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {(hasVideo || hasAudio || hasPDF) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{t(texts.contentAvailable)}</h3>
                  <div className="space-y-2">
                    {hasVideo && (
                      <Button variant="outline" className="w-full justify-between" onClick={() => window.open(content.video!.url, '_blank')}>
                        <span className="flex items-center gap-2"><Play className="w-4 h-4" />{t(texts.playVideo)}</span><ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                    {hasAudio && content.audioGuide?.[language as keyof typeof content.audioGuide] && (
                      <Button variant="outline" className="w-full justify-between" onClick={() => window.open(content.audioGuide![language as keyof typeof content.audioGuide]!.url, '_blank')}>
                        <span className="flex items-center gap-2"><Headphones className="w-4 h-4" />{t(texts.listenAudio)}</span><ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                    {hasPDF && (
                      <Button variant="outline" className="w-full justify-between" onClick={() => window.open(content.pdf!.url, '_blank')}>
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4" />{t(texts.downloadPDF)}</span><ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!hasAR && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />{t(texts.gallery)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(content.gallery || (content.image ? [content.image] : [])).map((img, index) => (
                      <motion.button key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedGalleryImage(img.url)}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/50 hover:border-primary/50 transition-colors group">
                        <img src={img.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {content.image?.caption && <p className="text-xs text-muted-foreground italic text-center">{t(content.image.caption)}</p>}

              {(content.practicalInfo?.phone || content.practicalInfo?.email || content.practicalInfo?.website || content.practicalInfo?.schedule || content.practicalInfo?.prices) && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />{t(texts.practicalInfo)}
                  </h3>
                  <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/50">
                    {(content.practicalInfo?.phone || content.practicalInfo?.email || content.practicalInfo?.website) && (
                      <div className="space-y-2">
                        {content.practicalInfo?.phone && <a href={`tel:${content.practicalInfo.phone}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"><Phone className="w-4 h-4 text-muted-foreground" />{content.practicalInfo.phone}</a>}
                        {content.practicalInfo?.email && <a href={`mailto:${content.practicalInfo.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"><Mail className="w-4 h-4 text-muted-foreground" />{content.practicalInfo.email}</a>}
                        {content.practicalInfo?.website && <a href={content.practicalInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"><Globe className="w-4 h-4 text-muted-foreground" />{content.practicalInfo.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>}
                      </div>
                    )}
                    {content.practicalInfo?.schedule && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t(texts.schedule)}</p><p className="text-sm text-foreground whitespace-pre-line">{t(content.practicalInfo.schedule)}</p></div>
                        </div>
                      </div>
                    )}
                    {content.practicalInfo?.prices && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-start gap-3">
                          <Euro className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t(texts.prices)}</p><p className="text-sm text-foreground whitespace-pre-line">{t(content.practicalInfo.prices)}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedGalleryImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedGalleryImage(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-4xl max-h-[80vh] w-full">
              <img src={selectedGalleryImage} alt="Gallery fullscreen" className="w-full h-full object-contain rounded-lg" />
              <button onClick={() => setSelectedGalleryImage(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"><X className="w-5 h-5" /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showARViewer && arScene && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black">
            <NeedleARViewer scene={arScene} locale={language as Language} onError={() => setShowARViewer(false)} />
            <button onClick={() => setShowARViewer(false)} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-[80]"><X className="w-5 h-5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavigationSection({ point }: { point: RoutePoint }) {
  const { language } = useLanguage();
  const { mode } = useExplorationMode();
  const { latitude, longitude, hasLocation } = useGeolocation();
  if (mode !== 'here' || !hasLocation || latitude === null || longitude === null) return null;
  const destination: NavigationDestination = { id: point.id, name: getText(point.title, language), lat: point.location.lat, lng: point.location.lng, type: 'route-point' };
  const distanceResult = calculateDistanceTo(latitude, longitude, destination);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-primary/20"><Navigation className="w-5 h-5 text-primary" /></div>
        <div>
          <h3 className="font-semibold text-foreground">{texts.howToGet[language as keyof typeof texts.howToGet]}</h3>
          <p className="text-xs text-muted-foreground">{texts.fromYourLocation[language as keyof typeof texts.fromYourLocation]}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-card/50">
        <div className="text-center"><p className="text-2xl font-bold text-primary">{distanceResult.distanceFormatted}</p></div>
        <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground"><Footprints className="w-4 h-4" /><span>{formatTime(distanceResult.estimatedWalkingTime)}</span></div>
          <div className="flex items-center gap-1.5 text-muted-foreground"><Car className="w-4 h-4" /><span>{formatTime(distanceResult.estimatedDrivingTime)}</span></div>
        </div>
      </div>
      <NavigationButton destination={destination} variant="primary" className="w-full" />
    </motion.div>
  );
}
