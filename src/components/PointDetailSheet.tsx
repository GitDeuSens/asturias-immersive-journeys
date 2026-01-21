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
  Maximize2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RoutePoint } from '@/data/immersiveRoutes';
import { useLanguage } from '@/hooks/useLanguage';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
};

export function PointDetailSheet({ point, onClose }: PointDetailSheetProps) {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

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
          className="relative h-48 bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: point.coverImage ? `url(${point.coverImage})` : undefined }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* AR badge */}
          {hasAR && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warm/90 text-warm-foreground text-sm font-bold">
              <Smartphone className="w-4 h-4" />
              AR
            </span>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-xl font-serif font-bold text-white drop-shadow-lg">
              {t(point.title)}
            </h1>
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {t(point.shortDescription)}
            </p>

            {/* Location */}
            {point.location.address && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t(texts.location)}</p>
                  <p className="text-sm text-muted-foreground">{point.location.address}</p>
                </div>
              </div>
            )}

            {/* AR Experience Section */}
            {hasAR && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-warm" />
                  Realidad Aumentada
                </h3>

                {isMobile ? (
                  /* Mobile: Direct launch button */
                  <Button 
                    onClick={handleLaunchAR}
                    className="w-full h-14 text-base font-bold bg-warm hover:bg-warm/90 text-warm-foreground"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    {t(texts.launchAR)}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  /* Desktop: QR Code */
                  <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-white rounded-xl shadow-inner">
                        <QRCodeSVG 
                          value={content.arExperience!.qrValue}
                          size={180}
                          level="H"
                          includeMargin={false}
                          bgColor="white"
                          fgColor="black"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t(texts.scanQR)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t(texts.scanQRDesc)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AR Instructions */}
                {content.arExperience?.instructions && (
                  <div className="p-4 rounded-lg bg-warm/10 border border-warm/20">
                    <p className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">
                      {t(texts.arInstructions)}
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {t(content.arExperience.instructions)}
                    </p>
                  </div>
                )}
              </div>
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

            {/* Image caption */}
            {content.image?.caption && (
              <p className="text-xs text-muted-foreground italic text-center">
                {t(content.image.caption)}
              </p>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}
