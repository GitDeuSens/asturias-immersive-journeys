import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Clock, Euro, Phone, Mail, Globe, Share2, 
  Play, Pause, Camera, Smartphone, ExternalLink, Navigation,
  ChevronDown, Info, Image, Link2, Headphones
} from 'lucide-react';
import { useState } from 'react';
import { POI, categories } from '@/data/mockData';
import { useLanguage, Language } from '@/hooks/useLanguage';
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
  hoursAndPrices: { es: 'Horarios y precios', en: 'Hours & prices', fr: 'Horaires et prix' },
  hours: { es: 'Horarios', en: 'Hours', fr: 'Horaires' },
  prices: { es: 'Precios', en: 'Prices', fr: 'Prix' },
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
};

export function POIDetailSheet({ poi, onClose }: POIDetailSheetProps) {
  const { t, language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(language);

  if (!poi) return null;

  // Get CTA based on experience type
  const getCTA = () => {
    switch (poi.experienceType) {
      case 'AR':
        return { 
          label: t(texts.launchAR), 
          icon: Smartphone, 
          className: 'bg-[hsl(48,100%,50%)] text-[hsl(210,11%,15%)] hover:bg-[hsl(48,100%,45%)]' 
        };
      case '360':
        return { 
          label: t(texts.open360), 
          icon: Camera, 
          className: 'bg-primary text-primary-foreground hover:bg-primary/90' 
        };
      case 'INFO':
      default:
        return { 
          label: t(texts.getDirections), 
          icon: Navigation, 
          className: 'bg-[hsl(203,100%,32%)] text-white hover:bg-[hsl(203,100%,28%)]' 
        };
    }
  };

  const cta = getCTA();
  const CTAIcon = cta.icon;

  // Type badge config
  const getTypeBadge = () => {
    switch (poi.experienceType) {
      case 'AR':
        return { 
          className: 'bg-[hsl(48,100%,50%)] text-[hsl(210,11%,15%)]', 
          icon: Smartphone,
          label: 'AR'
        };
      case '360':
        return { 
          className: 'bg-primary text-primary-foreground', 
          icon: Camera,
          label: '360°'
        };
      case 'INFO':
      default:
        return { 
          className: 'bg-[hsl(203,100%,32%)] text-white', 
          icon: Info,
          label: 'INFO'
        };
    }
  };

  const badge = getTypeBadge();
  const BadgeIcon = badge.icon;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(poi.title),
          text: t(poi.shortDescription),
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled
      }
    }
  };

  const handleCTAClick = () => {
    if (poi.experienceType === 'INFO') {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${poi.access.lat},${poi.access.lng}`,
        '_blank'
      );
    }
    // AR and 360 would trigger their respective experiences
  };

  // Check if audio is available for selected language
  const audioAvailable = poi.audioGuides?.[selectedAudioLang];

  // Determine which accordion items should be open by default
  const defaultOpenItems = ['description'];
  if (poi.audioGuides) defaultOpenItems.push('audioguide');

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
            className="absolute inset-x-0 bottom-0 top-14 bg-white rounded-t-3xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ===== HERO SECTION ===== */}
            <div className="relative h-52 md:h-64 flex-shrink-0">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: poi.media.images[0] 
                    ? `url(${poi.media.images[0]})` 
                    : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)/0.2) 100%)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              {/* Type Badge - Very Visible */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg ${badge.className}`}>
                  <BadgeIcon className="w-4 h-4" />
                  {badge.label}
                </span>
              </div>

              {/* Title & Chips overlaid at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 drop-shadow-sm">
                  {t(poi.title)}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {poi.categoryIds.map(catId => {
                    const cat = categories.find(c => c.id === catId);
                    return cat ? (
                      <span 
                        key={catId} 
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-foreground shadow-sm"
                      >
                        {t(cat.label)}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* ===== SCROLLABLE CONTENT ===== */}
            <div className="flex-1 overflow-y-auto pb-24">
              <Accordion 
                type="multiple" 
                defaultValue={defaultOpenItems}
                className="px-5 py-4"
              >
                {/* Description Section */}
                <AccordionItem value="description" className="border-b border-border/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <Info className="w-5 h-5 text-primary" />
                      {t(texts.description)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-foreground/80 leading-relaxed">
                      {t(poi.shortDescription)}
                    </p>
                    {poi.richText && (
                      <p className="text-foreground/70 mt-3 leading-relaxed">
                        {t(poi.richText)}
                      </p>
                    )}
                    {poi.experienceType === 'AR' && poi.arExperience && (
                      <div className="mt-4 p-4 rounded-xl bg-[hsl(48,100%,50%)]/10 border border-[hsl(48,100%,50%)]/30">
                        <p className="text-sm text-foreground/70 flex items-start gap-2">
                          <Smartphone className="w-4 h-4 mt-0.5 text-[hsl(48,100%,40%)]" />
                          {t(poi.arExperience.instructions)}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Audio Guide Section */}
                {poi.audioGuides && (
                  <AccordionItem value="audioguide" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Headphones className="w-5 h-5 text-primary" />
                        {t(texts.audioGuide)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      {/* Language selector */}
                      <div className="flex gap-2 mb-4">
                        {(['es', 'en', 'fr'] as const).map(lang => {
                          const hasAudio = !!poi.audioGuides?.[lang];
                          return (
                            <button
                              key={lang}
                              onClick={() => setSelectedAudioLang(lang)}
                              disabled={!hasAudio}
                              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                selectedAudioLang === lang && hasAudio
                                  ? 'bg-primary text-white' 
                                  : hasAudio 
                                    ? 'bg-muted border border-border hover:border-primary text-foreground'
                                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
                              }`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Player */}
                      {audioAvailable ? (
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-bold"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          {isPlaying ? t(texts.pauseAudio) : t(texts.playAudio)}
                        </button>
                      ) : (
                        <p className="text-sm text-muted-foreground italic py-2">
                          {t(texts.notAvailable)}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* How to get there */}
                <AccordionItem value="access" className="border-b border-border/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      {t(texts.howToGet)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    <p className="text-foreground/80">{poi.access.address}</p>
                    
                    {poi.access.notes && (
                      <p className="text-sm text-muted-foreground">{poi.access.notes}</p>
                    )}
                    
                    {/* Accessibility & Parking pills */}
                    <div className="flex flex-wrap gap-2">
                      {poi.access.accessibility && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground/70">
                          ♿ {poi.access.accessibility}
                        </span>
                      )}
                      {poi.access.parking && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground/70">
                          🅿️ {t(texts.parking)}
                        </span>
                      )}
                    </div>
                    
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${poi.access.lat},${poi.access.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      {t(texts.openMaps)}
                    </a>
                  </AccordionContent>
                </AccordionItem>

                {/* Hours and prices */}
                {(poi.hours || poi.prices) && (
                  <AccordionItem value="hours-prices" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Clock className="w-5 h-5 text-primary" />
                        {t(texts.hoursAndPrices)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {poi.hours && (
                          <div className="p-4 rounded-xl bg-muted/50">
                            <h4 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              {t(texts.hours)}
                            </h4>
                            <p className="text-sm text-muted-foreground">{poi.hours}</p>
                          </div>
                        )}
                        {poi.prices && (
                          <div className="p-4 rounded-xl bg-muted/50">
                            <h4 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                              <Euro className="w-4 h-4 text-primary" />
                              {t(texts.prices)}
                            </h4>
                            <p className="text-sm text-muted-foreground">{poi.prices}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Contact */}
                {poi.contact && (
                  <AccordionItem value="contact" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Phone className="w-5 h-5 text-primary" />
                        {t(texts.contact)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex flex-wrap gap-3">
                        {poi.contact.phone && (
                          <a 
                            href={`tel:${poi.contact.phone}`} 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"
                          >
                            <Phone className="w-4 h-4 text-primary" />
                            {poi.contact.phone}
                          </a>
                        )}
                        {poi.contact.email && (
                          <a 
                            href={`mailto:${poi.contact.email}`} 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"
                          >
                            <Mail className="w-4 h-4 text-primary" />
                            {poi.contact.email}
                          </a>
                        )}
                        {poi.contact.website && (
                          <a 
                            href={poi.contact.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"
                          >
                            <Globe className="w-4 h-4 text-primary" />
                            Web
                          </a>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Gallery */}
                {poi.media.images.length > 1 && (
                  <AccordionItem value="gallery" className="border-b border-border/50">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Image className="w-5 h-5 text-primary" />
                        {t(texts.gallery)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {poi.media.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 w-36 h-28 rounded-xl bg-cover bg-center shadow-sm border border-border/30"
                            style={{ backgroundImage: `url(${img})` }}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* External links */}
                {poi.links && poi.links.length > 0 && (
                  <AccordionItem value="links" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Link2 className="w-5 h-5 text-primary" />
                        {t(texts.links)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex flex-wrap gap-2">
                        {poi.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border hover:border-primary hover:text-primary text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            {/* ===== STICKY CTA BAR ===== */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <div className="flex gap-3">
                <button
                  onClick={handleCTAClick}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all shadow-md ${cta.className}`}
                >
                  <CTAIcon className="w-5 h-5" />
                  {cta.label}
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-4 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-colors"
                  aria-label={t(texts.share)}
                >
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
