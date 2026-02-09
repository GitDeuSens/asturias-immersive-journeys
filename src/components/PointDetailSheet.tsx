import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Camera,
  Play,
  FileText,
  Headphones,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Sparkles,
  ScanLine,
  Image as ImageIcon,
  Phone,
  Mail,
  Globe,
  Clock,
  Euro,
  Info,
  Navigation,
  Footprints,
  Car
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { RoutePoint } from '@/data/types';
import { useLanguage, useExplorationMode } from '@/hooks/useLanguage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import FullscreenModal from '@/components/poi/FullscreenModal';
import { NavigationButton } from '@/components/NavigationButton';
import {
  calculateDistanceTo,
  formatTime,
  type NavigationDestination
} from '@/lib/navigationService';
import { trackPOITimeSpent } from '@/lib/analytics';

interface PointDetailSheetProps {
  point: RoutePoint | null;
  onClose: () => void;
}

const texts = {
  launchAR: { es: 'Abrir experiencia AR', en: 'Launch AR experience', fr: 'Lancer l\'expérience AR' },
  scanQR: { es: 'Escanea con tu móvil', en: 'Scan with your phone', fr: 'Scannez avec votre téléphone' },
  scanQRDesc: { es: 'Apunta la cámara de tu móvil al código QR para abrir la experiencia de Realidad Aumentada', en: 'Point your phone camera at the QR code to open the Augmented Reality experience', fr: 'Pointez la caméra de votre téléphone vers le code QR pour ouvrir l\'expérience de Réalité Augmentée' },
  arInstructions: { es: 'Instrucciones AR', en: 'AR Instructions', fr: 'Instructions AR' },
  location: { es: 'Ubicación', en: 'Location', fr: 'Emplacement' },
  contentAvailable: { es: 'Contenido disponible', en: 'Available content', fr: 'Contenu disponible' },
  open360: { es: 'Abrir tour 360°', en: 'Open 360° tour', fr: 'Ouvrir le tour 360°' },
  playVideo: { es: 'Reproducir vídeo', en: 'Play video', fr: 'Lire la vidéo' },
  downloadPDF: { es: 'Descargar PDF', en: 'Download PDF', fr: 'Télécharger le PDF' },
  listenAudio: { es: 'Escuchar audioguía', en: 'Listen to audioguide', fr: 'Écouter l\'audioguide' },
  arExperience: { es: 'Experiencia de Realidad Aumentada', en: 'Augmented Reality Experience', fr: 'Expérience de Réalité Augmentée' },
  tryARDesktop: { es: 'Probar en este dispositivo', en: 'Try on this device', fr: 'Essayer sur cet appareil' },
  arRecommendation: { es: 'Recomendado: usa tu móvil para la mejor experiencia AR', en: 'Recommended: use your phone for the best AR experience', fr: 'Recommandé: utilisez votre téléphone pour la meilleure expérience AR' },
  gallery: { es: 'Galería de imágenes', en: 'Image gallery', fr: 'Galerie d\'images' },
  practicalInfo: { es: 'Información práctica', en: 'Practical information', fr: 'Informations pratiques' },
  schedule: { es: 'Horarios', en: 'Schedule', fr: 'Horaires' },
  prices: { es: 'Precios', en: 'Prices', fr: 'Prix' },
  contact: { es: 'Contacto', en: 'Contact', fr: 'Contact' },
  howToGet: { es: 'Cómo llegar', en: 'How to get there', fr: 'Comment y arriver' },
  fromYourLocation: { es: 'Desde tu ubicación', en: 'From your location', fr: 'Depuis votre position' },
  walking: { es: 'a pie', en: 'walking', fr: 'à pied' },
  driving: { es: 'en coche', en: 'by car', fr: 'en voiture' },
};


export function PointDetailSheet({ point, onClose }: PointDetailSheetProps) {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [showARFullscreen, setShowARFullscreen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const poiStartTime = useRef<number>(Date.now());

  // Track POI time spent on unmount
  useEffect(() => {
    return () => {
      if (point) {
        const durationSec = Math.round((Date.now() - poiStartTime.current) / 1000);
        if (durationSec > 2) { // Only track if spent more than 2 seconds
          const poiName = typeof point.title === 'string' ? point.title : point.title[language as keyof typeof point.title] || point.title.es;
          trackPOITimeSpent(point.id, poiName, durationSec);
        }
      }
    };
  }, [point, language]);

  if (!point) return null;

  const content = point.content;
  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;

  const handleLaunchAR = () => {
    if (content.arExperience?.launchUrl) {
      window.open(content.arExperience.launchUrl, '_blank');
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
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
          className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background z-50 shadow-2xl flex flex-col overflow-hidden md:rounded-l-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero image */}
          <div
            className="relative h-56 bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: point.coverImage ? `url(${point.coverImage})` : undefined }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* AR badge */}
            {hasAR && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warm text-warm-foreground text-sm font-bold shadow-lg"
              >
                <Smartphone className="w-4 h-4" />
                AR
                <Sparkles className="w-3 h-3" />
              </motion.span>
            )}


          </div>

          {/* Scrollable content */}
          <ScrollArea className="flex-1">
            {/* Bottom info */}
            <div className="pl-6 pt-3">
              <h1 className="text-2xl font-serif font-bold">
                {point.title[language]}
              </h1>
            </div>
            <div className="p-6 space-y-6">
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed text-base">
                {point.shortDescription[language]}
              </p>

              {/* Navigation Section - Priority for "here" mode */}
              <NavigationSection point={point} />

              {/* Location */}
              {point.location.address && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(texts.location)}</p>
                    <p className="text-sm text-muted-foreground">{point.location.address}</p>
                  </div>
                </div>
              )}

              {/* AR Experience Section - HERO SECTION */}
              {hasAR && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* AR Header with glow effect */}
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-warm/20">
                      <Smartphone className="w-5 h-5 text-warm" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t(texts.arExperience)}
                    </h3>
                  </div>

                  {isMobile ? (
                    /* Mobile: Direct launch button with enhanced styling */
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleLaunchAR}
                        className="w-full h-16 text-lg font-bold bg-gradient-to-r from-warm to-amber-500 hover:from-warm/90 hover:to-amber-500/90 text-warm-foreground shadow-lg shadow-warm/25 border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Smartphone className="w-6 h-6" />
                          </div>
                          <span>{t(texts.launchAR)}</span>
                          <ExternalLink className="w-5 h-5" />
                        </div>
                      </Button>
                    </motion.div>
                  ) : (
                    /* Desktop: QR Code with enhanced visual design */
                    <div className="bg-gradient-to-br from-warm/5 via-background to-amber-500/5 rounded-2xl p-6 border border-warm/20 shadow-lg">
                      <div className="flex flex-col items-center text-center space-y-5">
                        {/* QR Code container with glow */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-warm/20 rounded-2xl blur-xl" />
                          <div className="relative p-5 bg-white rounded-2xl shadow-xl border-4 border-warm/30">
                            <QRCodeSVG
                              value={content.arExperience!.qrValue}
                              size={200}
                              level="H"
                              includeMargin={false}
                              bgColor="white"
                              fgColor="#1a1a1a"
                            />
                          </div>
                          {/* Scan indicator */}
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <ScanLine className="w-16 h-16 text-warm/40" />
                          </motion.div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2">
                          <p className="font-semibold text-foreground text-lg flex items-center justify-center gap-2">
                            <Smartphone className="w-5 h-5 text-warm" />
                            {t(texts.scanQR)}
                          </p>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            {t(texts.scanQRDesc)}
                          </p>
                        </div>

                        {/* Desktop fallback option */}
                        <div className="w-full pt-4 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-3">
                            {t(texts.arRecommendation)}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setShowARFullscreen(true)}
                            className="w-full border-warm/30 text-warm hover:bg-warm/10 hover:text-warm"
                          >
                            <Maximize2 className="w-4 h-4 mr-2" />
                            {t(texts.tryARDesktop)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AR Instructions */}
                  {content.arExperience?.instructions && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 rounded-xl bg-warm/10 border border-warm/20"
                    >
                      <p className="text-xs font-semibold text-warm uppercase tracking-wide mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        {t(texts.arInstructions)}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {t(content.arExperience.instructions)}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* 360 Tour */}
              {has360 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    Tour 360°
                  </h3>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => window.open(content.tour360!.iframe360Url, '_blank')}
                  >
                    {t(texts.open360)}
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Other content types */}
              {(hasVideo || hasAudio || hasPDF) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {t(texts.contentAvailable)}
                  </h3>
                  <div className="space-y-2">
                    {hasVideo && (
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(content.video!.url, '_blank')}
                      >
                        <span className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          {t(texts.playVideo)}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                    {hasAudio && content.audioGuide?.[language as keyof typeof content.audioGuide] && (
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(content.audioGuide![language as keyof typeof content.audioGuide]!.url, '_blank')}
                      >
                        <span className="flex items-center gap-2">
                          <Headphones className="w-4 h-4" />
                          {t(texts.listenAudio)}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                    {hasPDF && (
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(content.pdf!.url, '_blank')}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {t(texts.downloadPDF)}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Image Gallery - shown for non-AR POIs */}
              {!hasAR && (content.gallery?.length || content.image?.url) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {t(texts.gallery)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(content.gallery || (content.image ? [content.image] : [])).map((img, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedGalleryImage(img.url)}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/50 hover:border-primary/50 transition-colors group"
                      >
                        <img
                          src={img.url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image caption */}
              {content.image?.caption && (
                <p className="text-xs text-muted-foreground italic text-center">
                  {t(content.image.caption)}
                </p>
              )}

              {/* Practical Information - shown at the bottom for all POIs */}
              {(content.practicalInfo?.phone || content.practicalInfo?.email || content.practicalInfo?.website || content.practicalInfo?.schedule || content.practicalInfo?.prices) && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    {t(texts.practicalInfo)}
                  </h3>
                  <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/50">
                    {/* Contact info */}
                    {(content.practicalInfo?.phone || content.practicalInfo?.email || content.practicalInfo?.website) && (
                      <div className="space-y-2">
                        {content.practicalInfo?.phone && (
                          <a
                            href={`tel:${content.practicalInfo.phone}`}
                            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                          >
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {content.practicalInfo.phone}
                          </a>
                        )}
                        {content.practicalInfo?.email && (
                          <a
                            href={`mailto:${content.practicalInfo.email}`}
                            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {content.practicalInfo.email}
                          </a>
                        )}
                        {content.practicalInfo?.website && (
                          <a
                            href={content.practicalInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                          >
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            {content.practicalInfo.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Schedule */}
                    {content.practicalInfo?.schedule && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              {t(texts.schedule)}
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-line">
                              {t(content.practicalInfo.schedule)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Prices */}
                    {content.practicalInfo?.prices && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-start gap-3">
                          <Euro className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                              {t(texts.prices)}
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-line">
                              {t(content.practicalInfo.prices)}
                            </p>
                          </div>
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

      {/* AR Fullscreen Modal for Desktop */}
      {hasAR && (
        <FullscreenModal
          isOpen={showARFullscreen}
          onClose={() => setShowARFullscreen(false)}
          iframeUrl={content.arExperience!.launchUrl}
          title={t(point.title)}
        />
      )}

      {/* Gallery Fullscreen Modal */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] w-full"
            >
              <img
                src={selectedGalleryImage}
                alt="Gallery fullscreen"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedGalleryImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Navigation Section Component for "here" mode
function NavigationSection({ point }: { point: RoutePoint }) {
  const { t, language } = useLanguage();
  const { mode } = useExplorationMode();
  const { latitude, longitude, hasLocation } = useGeolocation();

  // Only show in "here" mode with location
  if (mode !== 'here' || !hasLocation || latitude === null || longitude === null) {
    return null;
  }

  const destination: NavigationDestination = {
    id: point.id,
    name: typeof point.title === 'string' ? point.title : point.title[language as keyof typeof point.title] || point.title.es,
    lat: point.location.lat,
    lng: point.location.lng,
    type: 'route-point',
  };

  const distanceResult = calculateDistanceTo(latitude, longitude, destination);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <Navigation className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{texts.howToGet[language as keyof typeof texts.howToGet]}</h3>
          <p className="text-xs text-muted-foreground">{texts.fromYourLocation[language as keyof typeof texts.fromYourLocation]}</p>
        </div>
      </div>

      {/* Distance info */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-card/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{distanceResult.distanceFormatted}</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Footprints className="w-4 h-4" />
            <span>{formatTime(distanceResult.estimatedWalkingTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>{formatTime(distanceResult.estimatedDrivingTime)}</span>
          </div>
        </div>
      </div>

      {/* Navigation button */}
      <NavigationButton
        destination={destination}
        variant="primary"
        className="w-full"
      />
    </motion.div>
  );
}
