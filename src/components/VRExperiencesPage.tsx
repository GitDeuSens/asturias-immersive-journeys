import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Glasses, 
  Download, 
  Clock, 
  Star, 
  ChevronRight, 
  X, 
  Play,
  Smartphone,
  Monitor,
  Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getVRExperiences } from '@/lib/api/directus-client';
import type { VRExperience, Language } from '@/lib/types';

export function VRExperiencesPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'es') as Language;
  const [vrExperiences, setVrExperiences] = useState<VRExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<VRExperience | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getVRExperiences(lang);
        setVrExperiences(data);
      } catch (err) {
        console.error('[VRExperiencesPage] Error loading VR experiences:', err);
        setVrExperiences([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lang]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={t('vr.title')}
        description={t('vr.subtitle')}
      />
      <AppHeader variant="light" />
      
      <main id="main-content" className="pt-20 pb-12">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-accent to-accent/80 py-12 mb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Glasses className="w-10 h-10" aria-hidden="true" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {t('vr.title')}
                </h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                {t('vr.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Experiences grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : vrExperiences.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Glasses className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{lang === 'es' ? 'No hay experiencias VR disponibles' : lang === 'fr' ? 'Aucune expérience VR disponible' : 'No VR experiences available'}</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vrExperiences.map((exp, index) => (
              <motion.article
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group cursor-pointer bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-accent"
                onClick={() => setSelectedExperience(exp)}
                tabIndex={0}
                role="button"
                aria-label={`${t('common.viewDetails')}: ${exp.title[lang]}`}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedExperience(exp)}
              >
                {/* Cover image */}
                <div className="relative aspect-video bg-muted">
                  {exp.thumbnail_url ? (
                    <img
                      src={exp.thumbnail_url}
                      alt={exp.title[lang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                      <Glasses className="w-16 h-16 text-accent/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* VR badge */}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-bold">
                    <Glasses className="w-4 h-4" aria-hidden="true" />
                    VR
                  </span>

                  {/* Category badge */}
                  {exp.category && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium">
                      {exp.category}
                    </span>
                  )}

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {exp.title[lang]}
                  </h2>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {exp.description[lang]}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Duration */}
                    {exp.duration_minutes && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {exp.duration_minutes} min
                      </span>
                    )}

                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-accent transition-colors" aria-hidden="true" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                    <Glasses className="w-20 h-20 text-accent/40" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label={t('common.close')}
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
                <div className="p-6 space-y-6">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3">
                    {selectedExperience.duration_minutes && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium">
                        <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                        {selectedExperience.duration_minutes} min
                      </span>
                    )}
                    {selectedExperience.category && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium">
                        <Star className="w-4 h-4" aria-hidden="true" />
                        {selectedExperience.category}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedExperience.description[lang]}
                  </p>
                </div>
              </ScrollArea>

              {/* CTA Footer */}
              {selectedExperience.apk_url && (
                <div className="p-4 border-t border-border">
                  <Button 
                    className="w-full h-12 text-base font-bold bg-accent hover:bg-accent/90"
                    onClick={() => window.open(selectedExperience.apk_url, '_blank')}
                  >
                    <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                    {t('vr.downloadAPK')}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
