// ============ XR EXPERIENCES PAGE ============
// Unified catalog for AR and VR experiences with tab filtering

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
const GLBPreviewViewer = lazy(() => import('@/components/GLBPreviewViewer'));
import {
  Sparkles,
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
  Box,
  MapPin,
  Bookmark,
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { UnifiedSearchBar, type CustomFilter } from '@/components/UnifiedSearchBar';
import { TourCardSkeleton } from '@/components/SkeletonCard';
import { HeroCarousel } from '@/components/HeroCarousel';
import { FavoriteButton } from '@/components/FavoriteButton';
import { PopularityBadge } from '@/components/PopularityBadge';
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
import { getARScenes, getVRExperiences } from '@/lib/api/directus-client';
import { trackVRStarted, trackVRExperienceViewed } from '@/lib/analytics';
import { useLanguage } from '@/hooks/useLanguage';
import type { ARScene, VRExperience, Language } from '@/lib/types';

// ============ TYPES ============

type XRMode = 'all' | 'ar' | 'vr';

type XRItem =
  | { kind: 'ar'; data: ARScene }
  | { kind: 'vr'; data: VRExperience };

// ============ TEXTS ============

const texts = {
  title: { es: 'Experiencias XR', en: 'XR Experiences', fr: 'Expériences XR' },
  subtitle: {
    es: 'Realidad Aumentada y Virtual para explorar Asturias',
    en: 'Augmented and Virtual Reality to explore Asturias',
    fr: 'Réalité Augmentée et Virtuelle pour explorer les Asturies',
  },
  searchPlaceholder: {
    es: 'Buscar experiencias XR...',
    en: 'Search XR experiences...',
    fr: 'Rechercher des expériences XR...',
  },
  tabAll: { es: 'Todas', en: 'All', fr: 'Toutes' },
  tabAR: { es: 'Realidad Aumentada', en: 'Augmented Reality', fr: 'Réalité Augmentée' },
  tabVR: { es: 'Realidad Virtual', en: 'Virtual Reality', fr: 'Réalité Virtuelle' },
  duration: { es: 'min', en: 'min', fr: 'min' },
  startExperience: { es: 'Iniciar experiencia', en: 'Start experience', fr: "Démarrer l'expérience" },
  details: { es: 'Ver detalles', en: 'View details', fr: 'Voir les détails' },
  noExperiences: {
    es: 'No hay experiencias disponibles',
    en: 'No experiences available',
    fr: 'Aucune expérience disponible',
  },
  featured: { es: 'Destacados', en: 'Featured', fr: 'En vedette' },
  // AR-specific
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
  // VR-specific
  downloadAPK: { es: 'Descargar APK', en: 'Download APK', fr: "Télécharger l'APK" },
  openWeb: { es: 'Abrir en navegador', en: 'Open in browser', fr: 'Ouvrir dans le navigateur' },
  apkNotAvailable: { es: 'APK no disponible aún', en: 'APK not available yet', fr: 'APK pas encore disponible' },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  tryInBrowser: { es: 'Probar en navegador', en: 'Try in browser', fr: 'Essayer dans le navigateur' },
  webPreview: { es: 'Vista previa interactiva', en: 'Interactive preview', fr: 'Aperçu interactif' },
  videoPreview: { es: 'Video preview', en: 'Video preview', fr: 'Aperçu vidéo' },
  view3D: { es: 'Vista 3D', en: '3D View', fr: 'Vue 3D' },
  motionWarning: {
    es: 'Puede causar mareos',
    en: 'May cause motion sickness',
    fr: 'Peut provoquer le mal des transports',
  },
  compatibleDevices: { es: 'Dispositivos compatibles', en: 'Compatible devices', fr: 'Appareils compatibles' },
  version: { es: 'Versión', en: 'Version', fr: 'Version' },
  size: { es: 'Tamaño', en: 'Size', fr: 'Taille' },
};

const vrCategoryLabels: Record<string, Record<Language, string>> = {
  mine: { es: 'Minas', en: 'Mines', fr: 'Mines' },
  industry: { es: 'Industria', en: 'Industry', fr: 'Industrie' },
  railway: { es: 'Ferrocarril', en: 'Railway', fr: 'Chemin de fer' },
  cave: { es: 'Cuevas', en: 'Caves', fr: 'Grottes' },
  heritage: { es: 'Patrimonio', en: 'Heritage', fr: 'Patrimoine' },
  nature: { es: 'Naturaleza', en: 'Nature', fr: 'Nature' },
};

// ============ MAIN PAGE ============

export function XRExperiencesPage() {
  const { language, t } = useLanguage();
  const lang = language as Language;

  const [arScenes, setArScenes] = useState<ARScene[]>([]);
  const [vrExperiences, setVrExperiences] = useState<VRExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<XRMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVR, setSelectedVR] = useState<VRExperience | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ar, vr] = await Promise.all([getARScenes(lang), getVRExperiences(lang)]);
        setArScenes(ar);
        setVrExperiences(vr);
      } catch (err) {
        if (import.meta.env.DEV) console.error('[XRExperiencesPage] Error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lang]);

  // Combine items
  const allItems: XRItem[] = useMemo(() => {
    const arItems: XRItem[] = arScenes.map(s => ({ kind: 'ar', data: s }));
    const vrItems: XRItem[] = vrExperiences.map(e => ({ kind: 'vr', data: e }));
    return [...arItems, ...vrItems];
  }, [arScenes, vrExperiences]);

  // Filter by mode and search
  const filteredItems = useMemo(() => {
    let items = allItems;
    // AR tab: only AR scenes; VR tab: ALL AR scenes + VR experiences
    if (mode === 'ar') items = items.filter(i => i.kind === 'ar');
    // 'vr' mode shows everything (AR + VR), no filter needed

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => {
        const title = i.data.title[lang] || i.data.title.es || '';
        return title.toLowerCase().includes(q) ||
          title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
      });
    }
    return items;
  }, [allItems, mode, searchQuery, lang]);

  // Carousel
  const carouselItems = useMemo(() => {
    return allItems.slice(0, 6).map(item => ({
      id: item.data.id,
      title: item.data.title[lang] || item.data.title.es,
      subtitle: item.kind === 'ar'
        ? `AR · ${(item.data as ARScene).duration_minutes} min`
        : `VR · ${(item.data as VRExperience).duration_minutes || '?'} min`,
      image: item.kind === 'ar' ? (item.data as ARScene).preview_image : (item.data as VRExperience).thumbnail_url,
    }));
  }, [allItems, lang]);

  // Counts
  const arCount = allItems.filter(i => i.kind === 'ar').length;
  const vrCount = allItems.filter(i => i.kind === 'vr').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={t(texts.title)} description={t(texts.subtitle)} />
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

        {/* Hero */}
        <div className="bg-primary py-6 sm:py-12 mb-6 sm:mb-8 mt-2">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" aria-hidden="true" />
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold">{t(texts.title)}</h1>
                <Glasses className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto px-2">
                {t(texts.subtitle)}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl pb-5">
          {/* Mode tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-2 mb-5 overflow-x-auto scrollbar-none"
          >
            {([
              { key: 'all' as XRMode, label: texts.tabAll, icon: null, count: allItems.length },
              { key: 'ar' as XRMode, label: texts.tabAR, icon: Sparkles, count: arCount },
              { key: 'vr' as XRMode, label: texts.tabVR, icon: Glasses, count: vrCount },
            ]).map(tab => {
              const active = mode === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setMode(tab.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
                    transition-all duration-200 border-2
                    ${active
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                    }
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {t(tab.label)}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-muted'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Carousel (only in 'all' mode) */}
          {!loading && mode === 'all' && carouselItems.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-muted-foreground" /> {t(texts.featured)}
              </h2>
              <HeroCarousel items={carouselItems} />
            </motion.div>
          )}

          {/* Search */}
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
              resultCount={filteredItems.length}
            />
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <TourCardSkeleton key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t(texts.noExperiences)}</p>
            </div>
          )}

          {/* Grid */}
          {!loading && filteredItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={`${item.kind}-${item.data.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                >
                  {item.kind === 'ar' ? (
                    <ARCard scene={item.data as ARScene} lang={lang} t={t} />
                  ) : (
                    <VRCard
                      experience={item.data as VRExperience}
                      lang={lang}
                      t={t}
                      onSelect={() => {
                        trackVRExperienceViewed((item.data as VRExperience).id, (item.data as VRExperience).title[lang]);
                        setSelectedVR(item.data as VRExperience);
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <Footer />
      </main>

      {/* VR Detail Modal */}
      <AnimatePresence>
        {selectedVR && (
          <VRDetailModal
            experience={selectedVR}
            lang={lang}
            t={t}
            onClose={() => setSelectedVR(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ AR CARD ============

function ARCard({ scene, lang, t }: { scene: ARScene; lang: Language; t: (v: any) => string }) {
  return (
    <Link
      to={`/ar/${scene.slug}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary"
    >
      <div className="relative">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={scene.preview_image}
            alt={scene.title[lang] || scene.title.es}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <Badge className="bg-[hsl(var(--ar-accent,48_100%_50%))] text-black font-bold">
            <Sparkles className="w-3 h-3 mr-1" />AR
          </Badge>
          <PopularityBadge launchCount={scene.launch_count} dateCreated={scene.created_at} />
        </div>

        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <Badge variant="secondary" className="bg-card/90">
            {t(texts.arType[scene.needle_type])}
          </Badge>
          <div
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); e.preventDefault(); }}
          >
            <FavoriteButton
              id={scene.id}
              type="ar"
              title={scene.title[lang] || scene.title.es}
              image={scene.preview_image}
              size="sm"
            />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <h3 className="text-base sm:text-xl font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {scene.title[lang] || scene.title.es}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">
          {scene.description[lang] || scene.description.es}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-4">
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />{scene.duration_minutes} {t(texts.duration)}
          </Badge>
          {scene.difficulty && texts.difficulty[scene.difficulty] && (
            <Badge variant="outline" className="text-xs">{t(texts.difficulty[scene.difficulty])}</Badge>
          )}
          {scene.location && (
            <Badge variant="outline" className="text-xs"><MapPin className="w-3 h-3 mr-1" />GPS</Badge>
          )}
        </div>
        <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          {t(texts.startExperience)}<ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

// ============ VR CARD ============

function VRCard({
  experience, lang, t, onSelect,
}: {
  experience: VRExperience; lang: Language; t: (v: any) => string; onSelect: () => void;
}) {
  return (
    <article
      className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary"
      onClick={onSelect}
      tabIndex={0}
      role="button"
      aria-label={`${t(texts.details)}: ${experience.title[lang]}`}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className="relative">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {experience.thumbnail_url ? (
            <img
              src={experience.thumbnail_url}
              alt={experience.title[lang]}
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

        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 text-primary-foreground font-bold">
            <Glasses className="w-3 h-3 mr-1" />VR
          </Badge>
        </div>

        {experience.category && vrCategoryLabels[experience.category] && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-card/90">
              {t(vrCategoryLabels[experience.category])}
            </Badge>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <h3 className="text-base sm:text-xl font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {experience.title[lang]}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">
          {experience.description[lang]}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-4">
          {experience.duration_minutes && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />{experience.duration_minutes} {t(texts.duration)}
            </Badge>
          )}
          {experience.difficulty && texts.difficulty[experience.difficulty] && (
            <Badge variant="outline" className="text-xs">{t(texts.difficulty[experience.difficulty])}</Badge>
          )}
          {experience.age_rating && (
            <Badge variant="outline" className="text-xs">{experience.age_rating}</Badge>
          )}
        </div>
        <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          {t(texts.details)}<ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
}

// ============ VR DETAIL MODAL ============

function VRDetailModal({
  experience, lang, t, onClose,
}: {
  experience: VRExperience; lang: Language; t: (v: any) => string; onClose: () => void;
}) {
  const [previewMode, setPreviewMode] = useState<'thumbnail' | 'video' | 'web' | '3d'>('thumbnail');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const hasWebUrl = !!experience.web_url;
  const hasVideo = !!experience.preview_video_url;
  const hasGLB = !!experience.glb_url;

  const handleFullscreen = () => {
    const el = iframeContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
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
        {/* Preview area */}
        <div ref={iframeContainerRef} className="relative aspect-video bg-black">
          {previewMode === 'thumbnail' && (
            <>
              {experience.thumbnail_url ? (
                <img src={experience.thumbnail_url} alt={experience.title[lang]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <Glasses className="w-20 h-20 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
                {hasWebUrl && (
                  <button
                    onClick={() => { setPreviewMode('web'); trackVRStarted(experience.id, experience.title[lang]); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Monitor className="w-5 h-5" />
                    {t(texts.tryInBrowser)}
                  </button>
                )}
                {hasVideo && (
                  <button
                    onClick={() => setPreviewMode('video')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium text-sm hover:bg-white/30 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {t(texts.videoPreview)}
                  </button>
                )}
                {hasGLB && (
                  <button
                    onClick={() => setPreviewMode('3d')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium text-sm hover:bg-white/30 transition-colors"
                  >
                    <Box className="w-4 h-4" />
                    {t(texts.view3D)}
                  </button>
                )}
              </div>
            </>
          )}

          {previewMode === 'video' && hasVideo && (
            <video
              ref={videoRef}
              src={experience.preview_video_url}
              className="w-full h-full object-cover"
              controls autoPlay muted playsInline
              onEnded={() => setPreviewMode('thumbnail')}
            />
          )}

          {previewMode === 'web' && hasWebUrl && (
            <iframe
              src={experience.web_url!}
              className="w-full h-full border-0"
              allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
              title={experience.title[lang]}
            />
          )}

          {previewMode === '3d' && hasGLB && (
            <Suspense fallback={<div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center"><Box className="w-10 h-10 text-primary/40 animate-pulse" /></div>}>
              <GLBPreviewViewer glbUrl={experience.glb_url!} scale={experience.glb_scale} rotationY={experience.glb_rotation_y} />
            </Suspense>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {previewMode === 'web' && (
              <button onClick={handleFullscreen} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" title="Fullscreen">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" aria-label={t(texts.close)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {previewMode !== 'thumbnail' && (
            <button
              onClick={() => setPreviewMode('thumbnail')}
              className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              ← Back
            </button>
          )}

          {previewMode === 'thumbnail' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6">
              <h2 id="vr-detail-title" className="text-2xl font-bold text-foreground">{experience.title[lang]}</h2>
            </div>
          )}

          {(previewMode === 'web' || previewMode === '3d') && (
            <div className="absolute bottom-3 left-3 z-10 px-2 py-1 rounded-md bg-primary/80 text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              {previewMode === 'web' ? t(texts.webPreview) : t(texts.view3D)}
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="p-6 space-y-5">
            {previewMode !== 'thumbnail' && (
              <h2 className="text-xl font-bold text-foreground">{experience.title[lang]}</h2>
            )}

            <div className="flex flex-wrap gap-2">
              {experience.duration_minutes && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary" />{experience.duration_minutes} min
                </span>
              )}
              {experience.difficulty && texts.difficulty[experience.difficulty] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                  <Star className="w-4 h-4 text-primary" />{t(texts.difficulty[experience.difficulty])}
                </span>
              )}
              {experience.category && vrCategoryLabels[experience.category] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  {t(vrCategoryLabels[experience.category])}
                </span>
              )}
              {experience.age_rating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                  {experience.age_rating}
                </span>
              )}
            </div>

            {experience.motion_sickness_warning && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />{t(texts.motionWarning)}
              </div>
            )}

            <p className="text-muted-foreground leading-relaxed">{experience.description[lang]}</p>

            {experience.compatible_devices && experience.compatible_devices.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-primary" />{t(texts.compatibleDevices)}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {experience.compatible_devices.map(device => (
                    <Badge key={device} variant="outline" className="text-xs">{device}</Badge>
                  ))}
                </div>
              </div>
            )}

            {(experience.apk_version || experience.apk_size_mb) && (
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {experience.apk_version && <span>{t(texts.version)}: {experience.apk_version}</span>}
                {experience.apk_size_mb && <span>{t(texts.size)}: {experience.apk_size_mb} MB</span>}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* CTA Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {hasGLB && previewMode !== '3d' && (
            <Button variant="outline" className="w-full h-12 text-base font-bold" onClick={() => setPreviewMode('3d')}>
              <Box className="w-5 h-5 mr-2" />{t(texts.view3D)}
            </Button>
          )}
          {experience.web_url && previewMode !== 'web' && (
            <Button variant="outline" className="w-full h-12 text-base font-bold" onClick={() => setPreviewMode('web')}>
              <Monitor className="w-5 h-5 mr-2" />{t(texts.tryInBrowser)}
            </Button>
          )}
          {experience.web_url && previewMode === 'web' && (
            <Button variant="outline" className="w-full h-12 text-base font-bold" onClick={() => window.open(experience.web_url, '_blank', 'noopener,noreferrer')}>
              <Maximize2 className="w-5 h-5 mr-2" />{t(texts.openWeb)}
            </Button>
          )}
          {experience.apk_url ? (
            <Button className="w-full h-12 text-base font-bold" onClick={() => { trackVRStarted(experience.id, experience.title[lang]); window.open(experience.apk_url, '_blank', 'noopener,noreferrer'); }}>
              <Download className="w-5 h-5 mr-2" />{t(texts.downloadAPK)}
            </Button>
          ) : !experience.web_url ? (
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Info className="w-4 h-4" />{t(texts.apkNotAvailable)}
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default XRExperiencesPage;
