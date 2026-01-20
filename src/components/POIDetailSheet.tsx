import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Euro, Phone, Mail, Globe, Share2, Play, Pause, Camera, Smartphone, ExternalLink, Navigation } from 'lucide-react';
import { useState } from 'react';
import { POI, categories } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

interface POIDetailSheetProps {
  poi: POI | null;
  onClose: () => void;
}

const texts = {
  howToGet: { es: 'Cómo llegar', en: 'How to get there', fr: 'Comment y arriver' },
  accessibility: { es: 'Accesibilidad', en: 'Accessibility', fr: 'Accessibilité' },
  parking: { es: 'Parking', en: 'Parking', fr: 'Parking' },
  audioGuide: { es: 'Audioguía', en: 'Audio guide', fr: 'Audioguide' },
  hours: { es: 'Horarios', en: 'Hours', fr: 'Horaires' },
  prices: { es: 'Precios', en: 'Prices', fr: 'Prix' },
  contact: { es: 'Contacto', en: 'Contact', fr: 'Contact' },
  links: { es: 'Enlaces', en: 'Links', fr: 'Liens' },
  share: { es: 'Compartir', en: 'Share', fr: 'Partager' },
  arExperience: { es: 'Experiencia AR', en: 'AR Experience', fr: 'Expérience AR' },
  launchAR: { es: 'Iniciar AR', en: 'Launch AR', fr: 'Lancer AR' },
  view360: { es: 'Ver en 360°', en: 'View in 360°', fr: 'Voir en 360°' },
  gallery: { es: 'Galería', en: 'Gallery', fr: 'Galerie' },
};

export function POIDetailSheet({ poi, onClose }: POIDetailSheetProps) {
  const { t, language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);

  if (!poi) return null;

  const audioUrl = poi.audioGuides?.[selectedLang as 'es' | 'en' | 'fr'];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: t(poi.title),
        text: t(poi.shortDescription),
        url: window.location.href,
      });
    }
  };

  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-16 md:top-20 bg-background rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-48 md:h-64">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${poi.media.images[0]})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              {/* Experience type badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  poi.experienceType === 'AR' ? 'badge-ar'
                  : poi.experienceType === '360' ? 'badge-360'
                  : 'badge-info'
                }`}>
                  {poi.experienceType === 'AR' && <Smartphone className="w-4 h-4 inline mr-1" />}
                  {poi.experienceType === '360' && <Camera className="w-4 h-4 inline mr-1" />}
                  {poi.experienceType}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(100vh-16rem)] md:max-h-[calc(100vh-20rem)] p-6 space-y-6">
              {/* Title and categories */}
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                  {t(poi.title)}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {poi.categoryIds.map(catId => {
                    const cat = categories.find(c => c.id === catId);
                    return cat ? (
                      <span key={catId} className="category-chip">
                        {t(cat.label)}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Short description */}
              <p className="text-lg text-foreground/80">
                {t(poi.shortDescription)}
              </p>

              {/* AR Experience button */}
              {poi.experienceType === 'AR' && poi.arExperience && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <h3 className="font-semibold text-accent mb-2 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    {t(texts.arExperience)}
                  </h3>
                  <p className="text-sm text-foreground/70 mb-3">
                    {t(poi.arExperience.instructions)}
                  </p>
                  <button className="cta-primary w-full py-3 bg-accent hover:bg-accent/90">
                    {t(texts.launchAR)}
                  </button>
                </div>
              )}

              {/* 360 View button */}
              {poi.experienceType === '360' && (
                <button className="cta-primary w-full py-3 flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  {t(texts.view360)}
                </button>
              )}

              {/* Audio guide */}
              {poi.audioGuides && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      🎧 {t(texts.audioGuide)}
                    </h3>
                    <div className="flex gap-1">
                      {(['es', 'en', 'fr'] as const).map(lang => (
                        poi.audioGuides?.[lang] && (
                          <button
                            key={lang}
                            onClick={() => setSelectedLang(lang)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              selectedLang === lang 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted hover:bg-muted/80 text-foreground/60'
                            }`}
                          >
                            {lang.toUpperCase()}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors text-primary font-medium"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? 'Pausar' : 'Reproducir'}
                  </button>
                </div>
              )}

              {/* Access info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {t(texts.howToGet)}
                </h3>
                <p className="text-foreground/70">{poi.access.address}</p>
                {poi.access.notes && (
                  <p className="text-sm text-muted-foreground">{poi.access.notes}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  {poi.access.accessibility && (
                    <span className="text-sm text-foreground/60">
                      ♿ {poi.access.accessibility}
                    </span>
                  )}
                  {poi.access.parking && (
                    <span className="text-sm text-foreground/60">
                      🅿️ {poi.access.parking}
                    </span>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${poi.access.lat},${poi.access.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Google Maps
                </a>
              </div>

              {/* Hours and prices */}
              {(poi.hours || poi.prices) && (
                <div className="grid grid-cols-2 gap-4">
                  {poi.hours && (
                    <div className="p-4 rounded-xl bg-muted/30">
                      <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {t(texts.hours)}
                      </h4>
                      <p className="text-sm text-foreground/70">{poi.hours}</p>
                    </div>
                  )}
                  {poi.prices && (
                    <div className="p-4 rounded-xl bg-muted/30">
                      <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                        <Euro className="w-4 h-4 text-primary" />
                        {t(texts.prices)}
                      </h4>
                      <p className="text-sm text-foreground/70">{poi.prices}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery */}
              {poi.media.images.length > 1 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    📷 {t(texts.gallery)}
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {poi.media.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-32 h-24 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {poi.contact && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    {t(texts.contact)}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {poi.contact.phone && (
                      <a href={`tel:${poi.contact.phone}`} className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary">
                        <Phone className="w-4 h-4" />
                        {poi.contact.phone}
                      </a>
                    )}
                    {poi.contact.email && (
                      <a href={`mailto:${poi.contact.email}`} className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary">
                        <Mail className="w-4 h-4" />
                        {poi.contact.email}
                      </a>
                    )}
                    {poi.contact.website && (
                      <a href={poi.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary">
                        <Globe className="w-4 h-4" />
                        Web
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* External links */}
              {poi.links && poi.links.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    {t(texts.links)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {poi.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground/80 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted/50 transition-colors text-foreground"
              >
                <Share2 className="w-5 h-5" />
                {t(texts.share)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
