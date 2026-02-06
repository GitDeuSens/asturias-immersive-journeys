import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { View, ChevronRight, X, Filter, Search } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { KuulaTourEmbed } from '@/components/KuulaTourEmbed';
import { GlobalSearch } from '@/components/GlobalSearch';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/hooks/useLanguage';
import { useDirectusTours, useDirectusCategories } from '@/hooks/useDirectusData';
import type { KuulaTour, Language } from '@/lib/types';

const texts = {
  title: { es: 'Tours Virtuales 360°', en: 'Virtual Tours 360°', fr: 'Visites Virtuelles 360°' },
  subtitle: { es: 'Explora Asturias desde cualquier lugar', en: 'Explore Asturias from anywhere', fr: 'Explorez les Asturies de n\'importe où' },
  startTour: { es: 'Iniciar Tour', en: 'Start Tour', fr: 'Démarrer la visite' },
  scenes: { es: 'escenas', en: 'scenes', fr: 'scènes' },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  allCategories: { es: 'Todas las categorías', en: 'All categories', fr: 'Toutes les catégories' },
  searchPlaceholder: { es: 'Buscar tours...', en: 'Search tours...', fr: 'Rechercher des visites...' },
};

export function Tours360Page() {
  const { t, language } = useLanguage();
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const slugHandledRef = useRef<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTour, setActiveTour] = useState<KuulaTour | null>(null);
  const [activeTourData, setActiveTourData] = useState<KuulaTour | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Load tours and categories from Directus
  const { tours: kuulaTours } = useDirectusTours(language as 'es' | 'en' | 'fr');
  const { categories } = useDirectusCategories(language as 'es' | 'en' | 'fr');

  // Auto-open tour when navigating to /tours/:slug (only once per slug)
  useEffect(() => {
    if (slug && kuulaTours.length > 0 && slugHandledRef.current !== slug) {
      const match = kuulaTours.find((tour: any) => tour.slug === slug || tour.id === slug);
      if (match) {
        slugHandledRef.current = slug;
        setActiveTour(match);
        setActiveTourData(match);
      }
    }
  }, [slug, kuulaTours]);

  const filteredTours = useMemo(() => {
    return kuulaTours;
  }, [kuulaTours]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const handleTourClick = (tour: KuulaTour) => {
    setActiveTour(tour);
    setActiveTourData(tour);
    // Update URL to /tours/:slug
    if (tour.slug) {
      navigate(`/tours/${tour.slug}`, { replace: true });
    }
  };

  const closeTour = () => {
    setActiveTour(null);
    setActiveTourData(null);
    slugHandledRef.current = null;
    navigate('/tours', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader variant="light" />
      
      <main className="pt-20 pb-12">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-primary to-asturias-forest py-12 mb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <View className="w-10 h-10" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {t(texts.title)}
                </h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
                {t(texts.subtitle)}
              </p>

              {/* Search toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>{t(texts.searchPlaceholder)}</span>
              </button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Search bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <GlobalSearch locale={language as Language} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{t(texts.allCategories)}</span>
            </div>
            <CategoryChips
              categories={categories}
              selectedIds={selectedCategories}
              onToggle={toggleCategory}
            />
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
                transition={{ delay: 0.1 * index }}
                className="group cursor-pointer bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary"
                onClick={() => handleTourClick(tour)}
              >
                <div className="relative">
                  <div 
                    className="aspect-[16/10] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: tour.thumbnail_url ? `url(${tour.thumbnail_url})` : undefined }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* 360 badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge-360 flex items-center gap-1">
                      <View className="w-3 h-3" />
                      360°
                    </span>
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

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {tour.total_panoramas || 0} {t(texts.scenes)}
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

      {/* Tour Viewer Modal */}
      <AnimatePresence>
        {activeTourData && (
          <motion.div
            key="tour-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Viewer header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <View className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  {t(activeTourData.title)}
                </h2>
              </div>
              <button
                onClick={closeTour}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-4 h-4" />
                {t(texts.close)}
              </button>
            </div>

            {/* 3DVista Tour — full height iframe */}
            <div className="flex-1 min-h-0">
              <KuulaTourEmbed 
                tour={activeTourData} 
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
