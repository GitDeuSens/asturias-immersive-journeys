import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, ChevronRight, X } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { tours360, categories, Tour360 } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

const texts = {
  title: { es: 'Tours Virtuales 360°', en: 'Virtual Tours 360°', fr: 'Visites Virtuelles 360°' },
  subtitle: { es: 'Explora Asturias sin moverte', en: 'Explore Asturias without moving', fr: 'Explorez les Asturies sans bouger' },
  startTour: { es: 'Iniciar Tour', en: 'Start Tour', fr: 'Démarrer la visite' },
  scenes: { es: 'escenas', en: 'scenes', fr: 'scènes' },
  close: { es: 'Cerrar', en: 'Close', fr: 'Fermer' },
  viewerPlaceholder: { es: 'Visor 360° (placeholder)', en: '360° Viewer (placeholder)', fr: 'Visionneuse 360° (placeholder)' },
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
      <AppHeader />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
              {t(texts.title)}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t(texts.subtitle)}
            </p>
          </motion.div>

          {/* Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="decision-card group cursor-pointer"
                onClick={() => setActiveTour(tour)}
              >
                <div 
                  className="aspect-[16/10] bg-cover bg-center"
                  style={{ backgroundImage: `url(${tour.coverImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center">
                      <View className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/60">
                      {tour.scenes.length} {t(texts.scenes)}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                    {t(tour.title)}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tour.categoryIds.map(catId => {
                      const cat = categories.find(c => c.id === catId);
                      return cat ? (
                        <span key={catId} className="category-chip text-xs">
                          {t(cat.label)}
                        </span>
                      ) : null;
                    })}
                  </div>

                  <button className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                    {t(texts.startTour)}
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
          >
            {/* Viewer header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-serif font-bold text-foreground">
                {t(activeTour.title)}
              </h2>
              <button
                onClick={() => setActiveTour(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
                {t(texts.close)}
              </button>
            </div>

            {/* Viewer placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div 
                  className="w-full max-w-4xl aspect-video bg-cover bg-center rounded-2xl mx-auto mb-6"
                  style={{ backgroundImage: `url(${activeTour.coverImage})` }}
                />
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
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
