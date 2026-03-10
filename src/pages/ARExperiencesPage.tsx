// ============ AR EXPERIENCES LIST PAGE ============

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Clock, MapPin, ChevronRight, Home, Bookmark } from "lucide-react";
import { UnifiedSearchBar, type CustomFilter } from "@/components/UnifiedSearchBar";
import { TourCardSkeleton } from "@/components/SkeletonCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PopularityBadge } from "@/components/PopularityBadge";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { getARScenes } from "@/lib/api/directus-client";
import { useLanguage } from "@/hooks/useLanguage";
import type { ARScene, Language } from "@/lib/types";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const texts = {
  title: { es: "Experiencias AR", en: "AR Experiences", fr: "Expériences AR" },
  subtitle: {
    es: "Descubre Asturias a través de la Realidad Aumentada",
    en: "Discover Asturias through Augmented Reality",
    fr: "Découvrez les Asturies à travers la Réalité Augmentée",
  },
  duration: { es: "min", en: "min", fr: "min" },
  difficulty: {
    easy: { es: "Fácil", en: "Easy", fr: "Facile" },
    moderate: { es: "Moderado", en: "Moderate", fr: "Modéré" },
    advanced: { es: "Avanzado", en: "Advanced", fr: "Avancé" },
  },
  arType: {
    slam: { es: "Superficie", en: "Surface", fr: "Surface" },
    "image-tracking": { es: "Marcador", en: "Marker", fr: "Marqueur" },
    geo: { es: "GPS", en: "GPS", fr: "GPS" },
  },
  startExperience: { es: "Iniciar experiencia", en: "Start experience", fr: "Démarrer l'expérience" },
  noScenes: {
    es: "No hay experiencias disponibles",
    en: "No experiences available",
    fr: "Aucune expérience disponible",
  },
  featured: { es: "Destacados", en: "Featured", fr: "En vedette" },
};

export function ARExperiencesPage() {
  const { language, t } = useLanguage();
  const locale = language as Language;
  const [scenes, setScenes] = useState<ARScene[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const arTypeFilters: CustomFilter[] = [
    { id: 'slam', label: texts.arType.slam },
    { id: 'image-tracking', label: texts.arType['image-tracking'] },
    { id: 'geo', label: texts.arType.geo },
  ];

  const toggleType = (id: string) => {
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    async function loadScenes() {
      setIsLoading(true);
      try {
        const data = await getARScenes(locale);
        setScenes(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    loadScenes();
  }, [locale]);

  const filteredScenes = (() => {
    let filtered = scenes;
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(s => selectedTypes.includes(s.needle_type));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => {
        const title = s.title[locale] || s.title.es || '';
        return title.toLowerCase().includes(q) || title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
      });
    }
    return filtered;
  })();

  // Carousel items
  const carouselItems = useMemo(() => {
    return scenes.slice(0, 5).map(scene => ({
      id: scene.id,
      title: scene.title[locale] || scene.title.es,
      subtitle: `${texts.arType[scene.needle_type]?.[locale]} · ${scene.duration_minutes} min`,
      image: scene.preview_image,
    }));
  }, [scenes, locale]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={texts.title[locale]} description={texts.subtitle[locale]} />
      <AppHeader variant="light" />

      <main className="flex-1 pt-14 md:pt-[122px]">
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
                <BreadcrumbPage className="text-xs">{texts.title[locale]}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero section */}
        <div className="bg-primary py-6 sm:py-12 mb-6 sm:mb-8 mt-2">
          <div className="container mx-auto px-4 pb-5 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold">{texts.title[locale]}</h1>
              </div>
              <p className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto px-2">{texts.subtitle[locale]}</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto pb-5 px-4 max-w-6xl">
          {/* Hero Carousel */}
          {!isLoading && carouselItems.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-warm fill-warm" /> {t(texts.featured)}
              </h2>
              <HeroCarousel items={carouselItems} />
            </motion.div>
          )}

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
              placeholder={t({ es: 'Buscar experiencias AR...', en: 'Search AR experiences...', fr: 'Rechercher des expériences AR...' })}
              customFilters={arTypeFilters}
              selectedCustomFilters={selectedTypes}
              onToggleCustomFilter={toggleType}
              resultCount={filteredScenes.length}
            />
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <TourCardSkeleton key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredScenes.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{texts.noScenes[locale]}</p>
            </div>
          )}

          {/* Scenes grid */}
          {!isLoading && filteredScenes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredScenes.map((scene, index) => (
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                >
                  <Link
                    to={`/ar/${scene.slug}`}
                    className="group block bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary"
                  >
                    <div className="relative">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={scene.preview_image}
                          alt={scene.title[locale] || scene.title.es}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <Badge className="bg-primary/90 text-primary-foreground">
                          <Sparkles className="w-3 h-3 mr-1" />AR
                        </Badge>
                        <PopularityBadge launchCount={scene.launch_count} />
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-2" onClick={e => e.preventDefault()}>
                        <Badge variant="secondary" className="bg-card/90">
                          {texts.arType[scene.needle_type][locale]}
                        </Badge>
                        <FavoriteButton
                          id={scene.id}
                          type="ar"
                          title={scene.title[locale] || scene.title.es}
                          image={scene.preview_image}
                          size="sm"
                        />
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-5">
                      <h3 className="text-base sm:text-xl font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {scene.title[locale] || scene.title.es}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">
                        {scene.description[locale] || scene.description.es}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />{scene.duration_minutes} {texts.duration[locale]}
                        </Badge>
                        {scene.difficulty && texts.difficulty[scene.difficulty] && (
                          <Badge variant="outline" className="text-xs">{texts.difficulty[scene.difficulty][locale]}</Badge>
                        )}
                        {scene.location && (
                          <Badge variant="outline" className="text-xs"><MapPin className="w-3 h-3 mr-1" />GPS</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          {texts.startExperience[locale]}<ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default ARExperiencesPage;
