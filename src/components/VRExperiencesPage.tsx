// ============ VR EXPERIENCES PAGE ============
// Catalog of VR experiences with consistent design matching AR/360 pages

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Glasses,
  Download,
  Clock,
  Star,
  ChevronRight,
  X,
  Play,
  Info,
  AlertTriangle,
  Home,
  Smartphone,
  Monitor,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { UnifiedSearchBar, type CustomFilter } from '@/components/UnifiedSearchBar';
import { TourCardSkeleton } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { getVRExperiences } from '@/lib/api/directus-client';
import { trackVRStarted, trackVRExperienceViewed } from '@/lib/analytics';
import { useLanguage } from '@/hooks/useLanguage';
import type { VRExperience, Language } from '@/lib/types';

const texts = {
  title: { es: 'Experiencias VR', en: 'VR Experiences', fr: 'Expériences VR' },
  subtitle: {
    es: 'Sumérgete en Asturias con Realidad Virtual',
    en: 'Immerse yourself in Asturias with Virtual Reality',
    fr: "Plongez dans les Asturies avec la Réalité Virtuelle",
  },
  searchPlaceholder: {
    es: 'Buscar experiencias VR...',
    en: 'Search VR experiences...',
    fr: 'Rechercher des expériences VR...',
  },
  downloadAPK: { es: 'Descargar APK', en: 'Download APK', fr: "Télécharger l'APK" },
  openWeb: { es: 'Abrir en navegador', en: 'Open in browser', fr: 'Ouvrir dans le navigateur' },
  apkNotAvailable: {
    es: 'APK no disponible aún',
    en: 'APK not available yet',
    fr: 'APK pas encore disponible',
  },
  noExperiences: {
    es: 'No hay experiencias VR disponibles',
    en: 'No VR experiences available',
    fr: 'Aucune expérience VR disponible',
  },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  details: { es: 'Ver detalles', en: 'View details', fr: 'Voir les détails' },
  duration: { es: 'min', en: 'min', fr: 'min' },
  tryInBrowser: { es: 'Probar en navegador', en: 'Try in browser', fr: 'Essayer dans le navigateur' },
  webPreview: { es: 'Vista previa interactiva', en: 'Interactive preview', fr: 'Aperçu interactif' },
  videoPreview: { es: 'Video preview', en: 'Video preview', fr: 'Aperçu vidéo' },
  difficulty: {
    easy: { es: 'Fácil', en: 'Easy', fr: 'Facile' },
    moderate: { es: 'Moderado', en: 'Moderate', fr: 'Modéré' },
  },
  motionWarning: {
    es: 'Puede causar mareos',
    en: 'May cause motion sickness',
    fr: 'Peut provoquer le mal des transports',
  },
  compatibleDevices: { es: 'Dispositivos compatibles', en: 'Compatible devices', fr: 'Appareils compatibles' },
  version: { es: 'Versión', en: 'Version', fr: 'Version' },
  size: { es: 'Tamaño', en: 'Size', fr: 'Taille' },
  filterAll: { es: 'Todas', en: 'All', fr: 'Toutes' },
};

// Category filter labels
const categoryLabels: Record<string, Record<Language, string>> = {
  mine: { es: 'Minas', en: 'Mines', fr: 'Mines' },
  industry: { es: 'Industria', en: 'Industry', fr: 'Industrie' },
  railway: { es: 'Ferrocarril', en: 'Railway', fr: 'Chemin de fer' },
  cave: { es: 'Cuevas', en: 'Caves', fr: 'Grottes' },
  heritage: { es: 'Patrimonio', en: 'Heritage', fr: 'Patrimoine' },
  nature: { es: 'Naturaleza', en: 'Nature', fr: 'Nature' },
};

export function VRExperiencesPage() {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [vrExperiences, setVrExperiences] = useState<VRExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<VRExperience | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getVRExperiences(lang);
        setVrExperiences(data);
      } catch (err) {
        if (import.meta.env.DEV) console.error('[VRExperiencesPage] Error loading VR experiences:', err);
        setVrExperiences([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lang]);

  // Build category filters from actual data
  const categoryFilters: CustomFilter[] = useMemo(() => {
    const cats = new Set(vrExperiences.map(e => e.category).filter(Boolean));
    return Array.from(cats).map(cat => ({
      id: cat,
      label: categoryLabels[cat] || { es: cat, en: cat, fr: cat },
    }));
  }, [vrExperiences]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredExperiences = useMemo(() => {
    let filtered = vrExperiences;
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(e => selectedCategories.includes(e.category));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => {
        const title = e.title[lang] || e.title.es || '';
        return title.toLowerCase().includes(q) ||
          title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
      });
    }
    return filtered;
  }, [vrExperiences, selectedCategories, searchQuery, lang]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={t(texts.title)}
        description={t(texts.subtitle)}
      />
      <AppHeader variant="light" />

      <main id="main-content" className="flex-1 pt-14 md:pt-[122px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 max-w-6xl pt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-1 text-xs">
                  <Home className="w-3 h-3" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">{t(texts.title)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero section — consistent with AR/360 pages using bg-primary */}
        <div className="bg-primary py-6 sm:py-12 mb-6 sm:mb-8 mt-2">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Glasses className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" aria-hidden="true" />
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold">
                  {t(texts.title)}
                </h1>
              </div>
              <p className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto px-2">
                {t(texts.subtitle)}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl pb-5">
          {/* Search + Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <UnifiedSearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              placeholder={t(texts.searchPlaceholder)}
              customFilters={categoryFilters}
              selectedCustomFilters={selectedCategories}
              onToggleCustomFilter={toggleCategory}
              resultCount={filteredExperiences.length}
            />
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredExperiences.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Glasses className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t(texts.noExperiences)}</p>
            </div>
          )}

          {/* Experiences grid */}
          {!loading && filteredExperiences.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                >
                  <article
                    className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary"
                    onClick={() => {
                      trackVRExperienceViewed(exp.id, exp.title[lang]);
                      setSelectedExperience(exp);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${t(texts.details)}: ${exp.title[lang]}`}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedExperience(exp)}
                  >
                    {/* Cover image */}
                    <div className="relative">
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        {exp.thumbnail_url ? (
                          <img
                            src={exp.thumbnail_url}
                            alt={exp.title[lang]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Glasses className="w-16 h-16 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* VR badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/90 text-primary-foreground">
                          <Glasses className="w-3 h-3 mr-1" />
                          VR
                        </Badge>
                      </div>

                      {/* Category badge */}
                      {exp.category && categoryLabels[exp.category] && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-card/90">
                            {t(categoryLabels[exp.category])}
                          </Badge>
                        </div>
                      )}

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-5">
                      <h2 className="text-base sm:text-xl font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {exp.title[lang]}
                      </h2>

                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">
                        {exp.description[lang]}
                      </p>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                        {exp.duration_minutes && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {exp.duration_minutes} {t(texts.duration)}
                          </Badge>
                        )}
                        {exp.difficulty && texts.difficulty[exp.difficulty] && (
                          <Badge variant="outline" className="text-xs">
                            {t(texts.difficulty[exp.difficulty])}
                          </Badge>
                        )}
                        {exp.age_rating && (
                          <Badge variant="outline" className="text-xs">
                            {exp.age_rating}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          {t(texts.details)}
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <Footer />
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedExperience(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vr-detail-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header image */}
              <div className="relative aspect-video bg-muted">
                {selectedExperience.thumbnail_url ? (
                  <img
                    src={selectedExperience.thumbnail_url}
                    alt={selectedExperience.title[lang]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Glasses className="w-20 h-20 text-primary/40" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label={t(texts.close)}
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6">
                  <h2 id="vr-detail-title" className="text-2xl font-bold text-foreground">
                    {selectedExperience.title[lang]}
                  </h2>
                </div>
              </div>

              <ScrollArea className="max-h-[50vh]">
                <div className="p-6 space-y-5">
                  {/* Metadata badges */}
                  <div className="flex flex-wrap gap-2">
                    {selectedExperience.duration_minutes && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                        <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                        {selectedExperience.duration_minutes} min
                      </span>
                    )}
                    {selectedExperience.difficulty && texts.difficulty[selectedExperience.difficulty] && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                        <Star className="w-4 h-4 text-primary" aria-hidden="true" />
                        {t(texts.difficulty[selectedExperience.difficulty])}
                      </span>
                    )}
                    {selectedExperience.category && categoryLabels[selectedExperience.category] && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                        {t(categoryLabels[selectedExperience.category])}
                      </span>
                    )}
                    {selectedExperience.age_rating && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                        {selectedExperience.age_rating}
                      </span>
                    )}
                  </div>

                  {/* Motion sickness warning */}
                  {selectedExperience.motion_sickness_warning && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {t(texts.motionWarning)}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedExperience.description[lang]}
                  </p>

                  {/* Compatible devices */}
                  {selectedExperience.compatible_devices && selectedExperience.compatible_devices.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-primary" />
                        {t(texts.compatibleDevices)}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedExperience.compatible_devices.map(device => (
                          <Badge key={device} variant="outline" className="text-xs">
                            {device}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* APK info */}
                  {(selectedExperience.apk_version || selectedExperience.apk_size_mb) && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {selectedExperience.apk_version && (
                        <span>{t(texts.version)}: {selectedExperience.apk_version}</span>
                      )}
                      {selectedExperience.apk_size_mb && (
                        <span>{t(texts.size)}: {selectedExperience.apk_size_mb} MB</span>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* CTA Footer */}
              <div className="p-4 border-t border-border space-y-2">
                {selectedExperience.web_url && (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-bold"
                    onClick={() => {
                      trackVRStarted(selectedExperience.id, selectedExperience.title[lang]);
                      window.open(selectedExperience.web_url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Monitor className="w-5 h-5 mr-2" aria-hidden="true" />
                    {t(texts.openWeb)}
                  </Button>
                )}
                {selectedExperience.apk_url ? (
                  <Button
                    className="w-full h-12 text-base font-bold"
                    onClick={() => {
                      trackVRStarted(selectedExperience.id, selectedExperience.title[lang]);
                      window.open(selectedExperience.apk_url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                    {t(texts.downloadAPK)}
                  </Button>
                ) : !selectedExperience.web_url ? (
                  <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Info className="w-4 h-4" />
                      {t(texts.apkNotAvailable)}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
