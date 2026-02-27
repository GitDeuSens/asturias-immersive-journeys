import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { View, ChevronRight, X, Filter, Search, Home, Maximize2, Share2, Info, Minimize2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { KuulaTourEmbed } from "@/components/KuulaTourEmbed";
import { GlobalSearch, LocalSearchItem } from "@/components/GlobalSearch";
import { Footer } from "@/components/Footer";
import { useDirectusTours, useDirectusCategories } from "@/hooks/useDirectusData";
import { useLanguage } from "@/hooks/useLanguage";
import { trackTourViewed, trackEvent } from "@/lib/analytics";
import { slugify } from "@/lib/slugify";
import type { KuulaTour, Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const texts = {
  title: { es: "Tours Virtuales 360°", en: "Virtual Tours 360°", fr: "Visites Virtuelles 360°" },
  subtitle: {
    es: "Explora Asturias desde cualquier lugar",
    en: "Explore Asturias from anywhere",
    fr: "Explorez les Asturies de n'importe où",
  },
  startTour: { es: "Iniciar Tour", en: "Start Tour", fr: "Démarrer la visite" },
  scenes: { es: "escenas", en: "scenes", fr: "scènes" },
  close: { es: "Cerrar", en: "Close", fr: "Fermer" },
  allCategories: { es: "Todas las categorías", en: "All categories", fr: "Toutes les catégories" },
  searchPlaceholder: { es: "Buscar tours...", en: "Search tours...", fr: "Rechercher des visites..." },
  fullscreen: { es: "Pantalla completa", en: "Fullscreen", fr: "Plein écran" },
  share: { es: "Compartir", en: "Share", fr: "Partager" },
  panoramas: { es: "panoramas", en: "panoramas", fr: "panoramas" },
  duration: { es: "min", en: "min", fr: "min" },
};

export function Tours360Page() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { tours: kuulaTours, loading: toursLoading } = useDirectusTours(language as Language);
  const { categories } = useDirectusCategories(language as Language);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTour, setActiveTour] = useState<KuulaTour | null>(null);
  const [showSearch, setShowSearch] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // Generate slug for a tour — prefer DB slug, fallback to title
  const getTourSlug = (tour: KuulaTour): string => {
    if (tour.slug) return tour.slug;
    const title = typeof tour.title === 'string' ? tour.title : tour.title[language] || tour.title.es || '';
    return slugify(title);
  };

  // Resolve tour from URL slug — always sync state with URL
  useEffect(() => {
    if (slug && kuulaTours.length > 0) {
      const found = kuulaTours.find(tour => {
        const tourSlug = getTourSlug(tour);
        return tourSlug === slug || slugify(tour.id) === slug || slug === tour.slug;
      });
      if (found) {
        // Only update if different tour (avoid unnecessary re-renders)
        if (!activeTour || activeTour.id !== found.id) {
          setActiveTour(found);
        }
      }
    } else if (!slug && activeTour) {
      // URL changed to /tours (no slug) — close the modal
      setActiveTour(null);
      setShowInfo(false);
    }
  }, [slug, kuulaTours]);

  const filteredTours = useMemo(() => {
    if (selectedCategories.length === 0) return kuulaTours;
    return kuulaTours;
  }, [selectedCategories, kuulaTours]);

  const localSearchData: LocalSearchItem[] = useMemo(() => {
    return filteredTours.map((tour) => ({
      id: tour.id,
      title: tour.title,
      subtitle: "",
    }));
  }, [filteredTours]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => (prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]));
  };

  const handleTourClick = (tour: KuulaTour) => {
    const tourTitle = typeof tour.title === 'string' ? tour.title : tour.title[language] || tour.title.es;
    trackTourViewed(tour.id, tourTitle, language, 'desktop');
    setActiveTour(tour);
    setShowInfo(false);
    navigate(`/tours/${getTourSlug(tour)}`);
  };

  const closeTour = () => {
    setActiveTour(null);
    setShowInfo(false);
    navigate('/tours');
  };

  const handleShare = async () => {
    if (!activeTour) return;
    const shareData = {
      title: t(activeTour.title),
      text: t(activeTour.description),
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackEvent('tour_shared', { tour_id: activeTour.id, method: 'native' });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        trackEvent('tour_shared', { tour_id: activeTour.id, method: 'clipboard' });
      }
    } catch {}
  };

  const handleFullscreen = () => {
    const el = document.querySelector('.tour-viewer-container');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen?.();
      }
    }
  };

  const handleLocalSearchSelect = (item: LocalSearchItem) => {
    const tour = kuulaTours.find((t) => t.id === item.id);
    if (tour) {
      handleTourClick(tour);
      setShowSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader variant="light" />

      <main className="pt-20">
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
                {activeTour ? (
                  <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); closeTour(); }} className="text-xs">
                    {t(texts.title)}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-xs">{t(texts.title)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {activeTour && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xs truncate max-w-[150px]">{t(activeTour.title)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero section */}
        <div className="bg-primary pt-12 mb-8 mt-2">
          <div className="container mx-auto pb-5 px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <View className="w-10 h-10" />
                <h1 className="text-4xl md:text-5xl font-bold">{t(texts.title)}</h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">{t(texts.subtitle)}</p>

              {/* Search toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="hidden inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>{t(texts.searchPlaceholder)}</span>
              </button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto pb-5 px-4 max-w-6xl">
          {/* Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="hidden flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{t(texts.allCategories)}</span>
            </div>
            <div className="flex">
              <CategoryChips categories={categories} selectedIds={selectedCategories} onToggle={toggleCategory} />
              <div style={{ marginLeft: '25px' }}>
                <GlobalSearch
                  locale={language as Language}
                  localData={localSearchData}
                  onLocalSelect={handleLocalSearchSelect}
                  localIcon={<View className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  placeholder={t(texts.searchPlaceholder)}
                />
              </div>
            </div>
          </motion.div>

          {/* Tours grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary"
                onClick={() => handleTourClick(tour)}
              >
                <div className="relative">
                  <div
                    className="aspect-[16/10] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${tour.thumbnail_url})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* 360 badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge-360 flex items-center gap-1">
                      <View className="w-3 h-3" />
                      360°
                    </span>
                  </div>

                  {/* Metadata badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {tour.total_panoramas > 0 && (
                      <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {tour.total_panoramas} {t(texts.scenes)}
                      </span>
                    )}
                    {tour.duration_minutes && (
                      <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {tour.duration_minutes} {t(texts.duration)}
                      </span>
                    )}
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                      <ChevronRight className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {t(tour.title)}
                  </h3>
                  {tour.description[language] && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tour.description[language]}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {tour.total_panoramas} {t(texts.scenes)}
                    </span>
                    <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t(texts.startTour)}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <Footer />
      </main>

      {/* Tour Viewer Modal — z-[70] per layering conventions */}
      <AnimatePresence>
        {activeTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black flex flex-col overflow-hidden"
          >
            {/* Viewer header — compact, no scroll */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/90 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <View className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-white truncate">{t(activeTour.title)}</h2>
                  <p className="text-xs text-white/50">
                    {activeTour.total_panoramas} {t(texts.panoramas)}
                    {activeTour.duration_minutes && ` · ${activeTour.duration_minutes} ${t(texts.duration)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Info toggle */}
                {activeTour.description[language] && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowInfo(!showInfo)}
                    className={`text-white hover:bg-white/20 h-8 w-8 ${showInfo ? 'bg-white/20' : ''}`}
                    title={language === 'es' ? 'Información' : 'Info'}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                )}
                {/* Share */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20 h-8 w-8"
                  title={t(texts.share)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullscreen}
                  className="text-white hover:bg-white/20 h-8 w-8"
                  title={t(texts.fullscreen)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                {/* Close */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeTour}
                  className="text-white hover:bg-white/20 gap-1 h-8 px-3"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{t(texts.close)}</span>
                </Button>
              </div>
            </div>

            {/* Info panel — collapsible */}
            <AnimatePresence>
              {showInfo && activeTour.description[language] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-black/80 border-b border-white/10 overflow-hidden shrink-0"
                >
                  <p className="px-4 py-3 text-sm text-white/70 max-w-4xl">
                    {activeTour.description[language]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tour viewer — fills remaining space, no scroll */}
            <div className="tour-viewer-container flex-1 min-h-0">
              <KuulaTourEmbed
                tour={activeTour}
                locale={language as Language}
                showControls={false}
                onClose={closeTour}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
