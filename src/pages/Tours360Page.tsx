import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, ChevronRight, X, Filter } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { tours360, categories, Tour360 } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

const texts = {
  title: { es: 'Tours Virtuales 360°', en: 'Virtual Tours 360°', fr: 'Visites Virtuelles 360°' },
  subtitle: { es: 'Explora Asturias desde cualquier lugar', en: 'Explore Asturias from anywhere', fr: 'Explorez les Asturies de n\'importe où' },
  startTour: { es: 'Iniciar Tour', en: 'Start Tour', fr: 'Démarrer la visite' },
  scenes: { es: 'escenas', en: 'scenes', fr: 'scènes' },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  viewerPlaceholder: { es: 'Visor 360° (placeholder)', en: '360° Viewer (placeholder)', fr: 'Visionneuse 360° (placeholder)' },
  allCategories: { es: 'Todas las categorías', en: 'All categories', fr: 'Toutes les catégories' },
};

export function Tours360Page() {
  const { t } = useLanguage();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTour, setActiveTour] = useState<Tour360 | null>(null);

  const filteredTours = useMemo(() => {
    if (selectedCategories.length === 0) return tours360;
    return tours360.filter(tour => 
      tour.categoryIds.some(catId => selectedCategories.includes(catId))
    );
  }, [selectedCategories]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
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
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                {t(texts.subtitle)}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
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
                onClick={() => setActiveTour(tour)}
              >
                <div className="relative">
                  <div 
                    className="aspect-[16/10] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${tour.coverImage})` }}
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
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tour.categoryIds.map(catId => {
                      const cat = categories.find(c => c.id === catId);
                      return cat ? (
                        <span key={catId} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {t(cat.label)}
                        </span>
                      ) : null;
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {tour.scenes.length} {t(texts.scenes)}
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
      </main>

      {/* Tour Viewer Modal */}
      <AnimatePresence>
        {activeTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          >
            {/* Viewer header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <View className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {t(activeTour.title)}
                </h2>
              </div>
              <button
                onClick={() => setActiveTour(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-4 h-4" />
                {t(texts.close)}
              </button>
            </div>

            {/* Viewer placeholder */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-4xl w-full">
                <div 
                  className="w-full aspect-video bg-cover bg-center rounded-2xl mb-6 shadow-2xl"
                  style={{ backgroundImage: `url(${activeTour.coverImage})` }}
                />
                <div className="flex items-center justify-center gap-3 text-white/60">
                  <View className="w-8 h-8" />
                  <span className="text-lg">{t(texts.viewerPlaceholder)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
