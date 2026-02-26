import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Clock, Euro, Phone, Mail, Globe, Share2, 
  Play, Pause, Camera, Smartphone, ExternalLink, Navigation,
  Info, Image, Link2, Headphones, Maximize2, QrCode
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { POI } from '@/data/types';
import { useDirectusCategories } from '@/hooks/useDirectusData';
import { useLanguage, Language } from '@/hooks/useLanguage';
import { QRCodeSVG } from 'qrcode.react';
import RichTextRenderer from '@/components/poi/RichTextRenderer';
import FullscreenModal from '@/components/poi/FullscreenModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface POIDetailSheetProps {
  poi: POI | null;
  onClose: () => void;
}

const texts = {
  description: { es: 'Descripción', en: 'Description', fr: 'Description' },
  howToGet: { es: 'Cómo llegar', en: 'How to get there', fr: 'Comment y arriver' },
  accessibility: { es: 'Accesibilidad', en: 'Accessibility', fr: 'Accessibilité' },
  parking: { es: 'Parking disponible', en: 'Parking available', fr: 'Parking disponible' },
  audioGuide: { es: 'Audioguía', en: 'Audio guide', fr: 'Audioguide' },
  practicalInfo: { es: 'Información práctica', en: 'Practical info', fr: 'Infos pratiques' },
  hours: { es: 'Horarios', en: 'Hours', fr: 'Horaires' },
  prices: { es: 'Precios', en: 'Prices', fr: 'Prix' },
  duration: { es: 'Duración recomendada', en: 'Recommended duration', fr: 'Durée recommandée' },
  contact: { es: 'Contacto', en: 'Contact', fr: 'Contact' },
  links: { es: 'Enlaces', en: 'Links', fr: 'Liens' },
  gallery: { es: 'Galería', en: 'Gallery', fr: 'Galerie' },
  share: { es: 'Compartir', en: 'Share', fr: 'Partager' },
  launchAR: { es: 'Iniciar AR', en: 'Launch AR', fr: 'Lancer AR' },
  open360: { es: 'Abrir Tour 360°', en: 'Open 360° Tour', fr: 'Ouvrir Tour 360°' },
  getDirections: { es: 'Cómo llegar', en: 'Get directions', fr: 'Itinéraire' },
  openMaps: { es: 'Abrir en Maps', en: 'Open in Maps', fr: 'Ouvrir dans Maps' },
  notAvailable: { es: 'No disponible', en: 'Not available', fr: 'Non disponible' },
  playAudio: { es: 'Reproducir', en: 'Play', fr: 'Jouer' },
  pauseAudio: { es: 'Pausar', en: 'Pause', fr: 'Pause' },
  experienceAR: { es: 'Experiencia AR', en: 'AR Experience', fr: 'Expérience AR' },
  tour360: { es: 'Tour Virtual 360°', en: '360° Virtual Tour', fr: 'Visite Virtuelle 360°' },
  scanQR: { es: 'Escanea para abrir en tu móvil', en: 'Scan to open on your phone', fr: 'Scannez pour ouvrir sur mobile' },
  openExperience: { es: 'Abrir experiencia', en: 'Open experience', fr: 'Ouvrir l\'expérience' },
  maximize: { es: 'Maximizar', en: 'Maximize', fr: 'Maximiser' },
  scenes: { es: 'Escenas', en: 'Scenes', fr: 'Scènes' },
  didYouKnow: { es: '¿Sabías que...?', en: 'Did you know...?', fr: 'Le saviez-vous...?' },
};

export function POIDetailSheet({ poi, onClose }: POIDetailSheetProps) {
  const { t, language } = useLanguage();
  const { categories } = useDirectusCategories(language as 'es' | 'en' | 'fr');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(language);
  const [show360Modal, setShow360Modal] = useState(false);
  const experienceSectionRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount or language change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when switching languages
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [selectedAudioLang]);

  const handleToggleAudio = useCallback(() => {
    const audioData = poi?.audioGuides?.[selectedAudioLang];
    if (!audioData?.url) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioData.url);
        audioRef.current.addEventListener('ended', () => setIsPlaying(false));
        audioRef.current.addEventListener('error', () => setIsPlaying(false));
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying, selectedAudioLang, poi?.audioGuides]);

  if (!poi) return null;

  const getCTA = () => {
    switch (poi.experienceType) {
      case 'AR':
        return { label: t(texts.launchAR), icon: Smartphone, className: 'bg-[hsl(48,100%,50%)] text-[hsl(210,11%,15%)] hover:bg-[hsl(48,100%,45%)]' };
      case '360':
        return { label: t(texts.open360), icon: Camera, className: 'bg-primary text-primary-foreground hover:bg-primary/90' };
      default:
        return { label: t(texts.getDirections), icon: Navigation, className: 'bg-[hsl(203,100%,32%)] text-white hover:bg-[hsl(203,100%,28%)]' };
    }
  };

  const cta = getCTA();
  const CTAIcon = cta.icon;

  const getTypeBadge = () => {
    switch (poi.experienceType) {
      case 'AR': return { className: 'bg-[hsl(48,100%,50%)] text-[hsl(210,11%,15%)]', icon: Smartphone, label: 'AR' };
      case '360': return { className: 'bg-primary text-primary-foreground', icon: Camera, label: '360°' };
      default: return { className: 'bg-[hsl(203,100%,32%)] text-white', icon: Info, label: 'INFO' };
    }
  };

  const badge = getTypeBadge();
  const BadgeIcon = badge.icon;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t(poi.title), text: poi.shortDescription[language], url: poi.share.shareUrl });
      } catch (e) {}
    }
  };

  const handleCTAClick = () => {
    if (poi.experienceType === 'AR') {
      experienceSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (poi.experienceType === '360' && poi.tour360) {
      setShow360Modal(true);
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.access.lat},${poi.access.lng}`, '_blank', 'noopener,noreferrer');
    }
  };

  const audioAvailable = poi.audioGuides?.[selectedAudioLang];
  const audioDuration = audioAvailable?.durationSec ? `${Math.floor(audioAvailable.durationSec / 60)}:${String(audioAvailable.durationSec % 60).padStart(2, '0')}` : null;
  const heroImage = poi.media.heroImageUrl || poi.media.images[0]?.url;

  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 top-14 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:w-full bg-card rounded-t-3xl overflow-hidden flex flex-col md:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HERO */}
            <div className="relative h-52 md:h-64 flex-shrink-0">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: heroImage ? `url(${heroImage})` : undefined }} />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg ${badge.className}`}>
                  <BadgeIcon className="w-4 h-4" />{badge.label}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground mb-2 drop-shadow-sm">{t(poi.title)}</h1>
                <div className="flex flex-wrap gap-2">
                  {poi.categoryIds.map(catId => {
                    const cat = categories.find(c => c.id === catId);
                    return cat ? <span key={catId} className="px-3 py-1 rounded-full text-xs font-medium bg-card/90 text-foreground shadow-sm">{t(cat.label)}</span> : null;
                  })}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto pb-24">
              <Accordion type="multiple" defaultValue={['description', 'ar-experience', 'tour360-experience']} className="px-5 py-4">
                {/* Description */}
                <AccordionItem value="description" className="border-b border-border/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-2 font-semibold text-foreground"><Info className="w-5 h-5 text-primary" />{t(texts.description)}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-foreground/80 leading-relaxed mb-4">{t(poi.shortDescription)}</p>
                    {poi.richText?.blocks && <RichTextRenderer blocks={poi.richText.blocks} lang={language} />}
                    {poi.info?.didYouKnow && (
                      <div className="mt-4 p-4 rounded-xl bg-accent/50 border border-accent">
                        <p className="text-sm font-semibold text-primary mb-1">{t(texts.didYouKnow)}</p>
                        <p className="text-foreground/80 text-sm">{t(poi.info.didYouKnow)}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* AR Experience Section */}
                {poi.ar && (
                  <AccordionItem value="ar-experience" className="border-b border-border/50" ref={experienceSectionRef}>
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Smartphone className="w-5 h-5 text-warm" />
                        {t(texts.experienceAR)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
                          <QRCodeSVG value={poi.ar.qrValue} size={150} className="mb-3" />
                          <p className="text-sm text-muted-foreground text-center">{t(texts.scanQR)}</p>
                        </div>
                        <a href={poi.ar.launchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-warm text-warm-foreground font-bold hover:bg-warm/90 transition-colors">
                          <Smartphone className="w-5 h-5" />{t(texts.openExperience)}
                        </a>
                        {poi.ar.iframe3dUrl && (
                          <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                            <iframe src={poi.ar.iframe3dUrl} className="w-full h-full" allowFullScreen title="3D Model" />
                          </div>
                        )}
                        {poi.ar.instructions && (
                          <div className="p-3 bg-warm/10 rounded-lg text-sm text-foreground/80 whitespace-pre-line">{t(poi.ar.instructions)}</div>
                        )}
                        {poi.ar.compatibilityNote && <p className="text-xs text-muted-foreground text-center">{t(poi.ar.compatibilityNote)}</p>}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 360 Tour Section */}
                {poi.tour360 && (
                  <AccordionItem value="tour360-experience" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Camera className="w-5 h-5 text-primary" />
                        {t(texts.tour360)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4">
                        <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                          <iframe src={poi.tour360.iframe360Url} className="w-full h-full rounded-2xl" allowFullScreen allow="xr-spatial-tracking; gyroscope; accelerometer" title="360 Tour" />
                        </div>
                        {poi.tour360.allowFullscreen && (
                          <button onClick={() => setShow360Modal(true)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                            <Maximize2 className="w-5 h-5" />{t(texts.maximize)}
                          </button>
                        )}
                        {poi.tour360.scenes && poi.tour360.scenes.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">{t(texts.scenes)}</p>
                            <div className="flex flex-wrap gap-2">
                              {poi.tour360.scenes.map(scene => (
                                <span key={scene.id} className="px-3 py-1.5 rounded-full text-xs bg-muted text-foreground">{t(scene.title)}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Audio Guide */}
                {poi.audioGuides && Object.keys(poi.audioGuides).length > 0 && (
                  <AccordionItem value="audioguide" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground"><Headphones className="w-5 h-5 text-primary" />{t(texts.audioGuide)}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex gap-2 mb-4">
                        {(['es', 'en', 'fr'] as const).map(lang => {
                          const hasAudio = !!poi.audioGuides?.[lang];
                          return (
                            <button key={lang} onClick={() => setSelectedAudioLang(lang)} disabled={!hasAudio}
                              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${selectedAudioLang === lang && hasAudio ? 'bg-primary text-white' : hasAudio ? 'bg-muted border border-border hover:border-primary text-foreground' : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'}`}>
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                      {audioAvailable ? (
                        <div className="space-y-2">
                          <button onClick={handleToggleAudio} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-bold">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            {isPlaying ? t(texts.pauseAudio) : t(texts.playAudio)}
                          </button>
                          {audioDuration && <p className="text-xs text-center text-muted-foreground">{audioDuration}</p>}
                        </div>
                      ) : <p className="text-sm text-muted-foreground italic py-2">{t(texts.notAvailable)}</p>}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* How to get there */}
                <AccordionItem value="access" className="border-b border-border/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-2 font-semibold text-foreground"><MapPin className="w-5 h-5 text-primary" />{t(texts.howToGet)}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    <p className="text-foreground/80">{poi.access.address}</p>
                    {poi.access.howToGet && <p className="text-sm text-muted-foreground">{t(poi.access.howToGet)}</p>}
                    <div className="flex flex-wrap gap-2">
                      {poi.access.accessibility && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground/70">♿ {t(poi.access.accessibility)}</span>}
                      {poi.access.parking && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground/70">🅿️ {t(poi.access.parking)}</span>}
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${poi.access.lat},${poi.access.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors">
                      <Navigation className="w-4 h-4" />{t(texts.openMaps)}
                    </a>
                  </AccordionContent>
                </AccordionItem>

                {/* Practical Info */}
                {(poi.practical?.openingHours || poi.practical?.prices || poi.practical?.recommendedDuration) && (
                  <AccordionItem value="practical" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground"><Clock className="w-5 h-5 text-primary" />{t(texts.practicalInfo)}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-1 gap-3">
                        {poi.practical.openingHours && (
                          <div className="p-3 rounded-xl bg-muted/50">
                            <h4 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{t(texts.hours)}</h4>
                            <p className="text-sm text-muted-foreground">{t(poi.practical.openingHours)}</p>
                          </div>
                        )}
                        {poi.practical.prices && (
                          <div className="p-3 rounded-xl bg-muted/50">
                            <h4 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2"><Euro className="w-4 h-4 text-primary" />{t(texts.prices)}</h4>
                            <p className="text-sm text-muted-foreground">{t(poi.practical.prices)}</p>
                          </div>
                        )}
                        {poi.practical.recommendedDuration && (
                          <div className="p-3 rounded-xl bg-muted/50">
                            <h4 className="font-semibold text-foreground text-sm mb-1">{t(texts.duration)}</h4>
                            <p className="text-sm text-muted-foreground">{t(poi.practical.recommendedDuration)}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Contact */}
                {poi.contact && (poi.contact.phone || poi.contact.email || poi.contact.website) && (
                  <AccordionItem value="contact" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground"><Phone className="w-5 h-5 text-primary" />{t(texts.contact)}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex flex-wrap gap-3">
                        {poi.contact.phone && <a href={`tel:${poi.contact.phone}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"><Phone className="w-4 h-4 text-primary" />{poi.contact.phone}</a>}
                        {poi.contact.email && <a href={`mailto:${poi.contact.email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"><Mail className="w-4 h-4 text-primary" />{poi.contact.email}</a>}
                        {poi.contact.website && <a href={poi.contact.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"><Globe className="w-4 h-4 text-primary" />{poi.contact.website.replace(/^https?:\/\//, '')}</a>}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Gallery */}
                {poi.media.images.length > 1 && (
                  <AccordionItem value="gallery" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground"><Image className="w-5 h-5 text-primary" />{t(texts.gallery)}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {poi.media.images.map((img, i) => (
                          <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted">
                            <img src={img.url} alt={img.caption ? t(img.caption) : ''} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Links */}
                {poi.links.length > 0 && (
                  <AccordionItem value="links" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground"><Link2 className="w-5 h-5 text-primary" />{t(texts.links)}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-2">
                        {poi.links.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                            <span className="text-sm font-medium text-foreground">{t(link.label)}</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            {/* STICKY CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
              <div className="flex gap-3">
                <button onClick={handleCTAClick} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${cta.className}`}>
                  <CTAIcon className="w-5 h-5" />{cta.label}
                </button>
                <button onClick={handleShare} className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shadow-lg">
                  <Share2 className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 360 Fullscreen Modal */}
          {poi.tour360 && (
            <FullscreenModal isOpen={show360Modal} onClose={() => setShow360Modal(false)} iframeUrl={poi.tour360.iframe360Url} title={t(poi.title)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
