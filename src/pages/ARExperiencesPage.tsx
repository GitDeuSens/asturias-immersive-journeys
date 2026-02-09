// ============ AR EXPERIENCES LIST PAGE ============
// List of all available AR experiences

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Clock, MapPin, ChevronRight, Filter } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { getARScenes } from "@/lib/api/directus-client";
import { useLanguage } from "@/hooks/useLanguage";
import type { ARScene, Language } from "@/lib/types";

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
  filterAll: { es: "Todas", en: "All", fr: "Toutes" },
  filterSLAM: { es: "Superficie", en: "Surface", fr: "Surface" },
  filterMarker: { es: "Marcador", en: "Marker", fr: "Marqueur" },
  filterGeo: { es: "GPS", en: "GPS", fr: "GPS" },
  noScenes: {
    es: "No hay experiencias disponibles",
    en: "No experiences available",
    fr: "Aucune expérience disponible",
  },
};

export function ARExperiencesPage() {
  const { language, t } = useLanguage();
  const locale = language as Language;
  const [scenes, setScenes] = useState<ARScene[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "slam" | "image-tracking" | "geo">("all");

  useEffect(() => {
    async function loadScenes() {
      setIsLoading(true);
      try {
        const data = await getARScenes(locale);
        setScenes(data);
      } catch (error) {
        // Silently fail AR scenes loading
      } finally {
        setIsLoading(false);
      }
    }
    loadScenes();
  }, [locale]);

  const filteredScenes = filter === "all" ? scenes : scenes.filter((s) => s.needle_type === filter);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={texts.title[locale]} description={texts.subtitle[locale]} />

      <AppHeader variant="light" />

      <main className="pt-20">
        {/* Hero section */}
        <div className="bg-primary py-12 mb-8">
          <div className="container mx-auto px-4 pb-5 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-10 h-10" />
                <h1 className="text-4xl md:text-5xl font-bold">{texts.title[locale]}</h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">{texts.subtitle[locale]}</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto pb-5 px-4 max-w-6xl">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {locale === "es" ? "Filtrar por tipo" : locale === "en" ? "Filter by type" : "Filtrer par type"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "slam", "image-tracking", "geo"] as const).map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                >
                  {type === "all"
                    ? texts.filterAll[locale]
                    : type === "slam"
                      ? texts.filterSLAM[locale]
                      : type === "image-tracking"
                        ? texts.filterMarker[locale]
                        : texts.filterGeo[locale]}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    to={`/ar/${scene.slug}`}
                    className="group block bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary"
                  >
                    <div className="relative">
                      <div
                        className="aspect-[16/10] bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${scene.preview_image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* AR badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/90 text-primary-foreground">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AR
                        </Badge>
                      </div>

                      {/* Type badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-card/90">
                          {texts.arType[scene.needle_type][locale]}
                        </Badge>
                      </div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {scene.title[locale] || scene.title.es}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {scene.description[locale] || scene.description.es}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {scene.duration_minutes} {texts.duration[locale]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {texts.difficulty[scene.difficulty][locale]}
                        </Badge>
                        {scene.location && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            GPS
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          {texts.startExperience[locale]}
                          <ChevronRight className="w-4 h-4" />
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
