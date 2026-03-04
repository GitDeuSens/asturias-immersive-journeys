// ============ AR SCENE PAGE ============
// Fullscreen AR viewer page with floating header controls (same pattern as 360 tours)

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Maximize2, X, Info, Sparkles, AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { NeedleARViewer } from "@/components/NeedleARViewer";
import { SEOHead } from "@/components/SEOHead";
import { getARSceneBySlug } from "@/lib/api/directus-client";
import { trackEvent, trackShare } from "@/lib/analytics";
import { useLanguage } from "@/hooks/useLanguage";
import type { ARScene, Language } from "@/lib/types";

const texts = {
  back: { es: "Volver", en: "Back", fr: "Retour" },
  notFound: { es: "Experiencia no encontrada", en: "Experience not found", fr: "Expérience non trouvée" },
  loading: { es: "Cargando...", en: "Loading...", fr: "Chargement..." },
  share: { es: "Compartir", en: "Share", fr: "Partager" },
  fullscreen: { es: "Pantalla completa", en: "Fullscreen", fr: "Plein écran" },
  close: { es: "Cerrar", en: "Close", fr: "Fermer" },
  info: { es: "Información", en: "Info", fr: "Info" },
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
};

export function ARScenePage() {
  const { slug } = useParams<{ slug: string }>();
  const { language: locale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const fromRoute = (location.state as any)?.fromRoute as string | undefined;
  const [scene, setScene] = useState<ARScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const lang = locale as Language;

  useEffect(() => {
    async function loadScene() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await getARSceneBySlug(slug, lang);
        setScene(data);
        if (data) trackEvent("ar_scene_viewed", { ar_id: data.id, ar_slug: slug });
      } catch {
        setError("Failed to load AR scene");
      } finally {
        setIsLoading(false);
      }
    }
    loadScene();
  }, [slug, lang]);

  const handleClose = () => {
    if (fromRoute) {
      navigate(`/routes/${fromRoute}`);
    } else {
      navigate(-1);
    }
  };

  const handleFullscreen = () => {
    const el = document.querySelector('.ar-fullscreen-container');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen?.();
      }
    }
  };

  const handleShare = async () => {
    if (!scene) return;
    const shareData = {
      title: scene.title[lang] || scene.title.es,
      text: scene.description[lang] || scene.description.es,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackShare("native", "ar_scene", scene.id);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        trackShare("clipboard", "ar_scene", scene.id);
      }
    } catch { /* cancelled */ }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[80] bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/70">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{texts.loading[lang]}</span>
        </div>
      </div>
    );
  }

  // Error / not found
  if (!scene || error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader variant="light" />
        <div className="pt-20 flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">{texts.notFound[lang]}</h1>
          <button
            onClick={handleClose}
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />{texts.back[lang]}
          </button>
        </div>
      </div>
    );
  }

  const title = scene.title[lang] || scene.title.es;
  const description = scene.description[lang] || scene.description.es;
  const arTypeName = texts.arType[scene.needle_type as keyof typeof texts.arType]?.[lang] ?? scene.needle_type;
  const difficultyName = texts.difficulty[scene.difficulty as keyof typeof texts.difficulty]?.[lang] ?? scene.difficulty;

  return (
    <div className="fixed inset-0 z-[80] bg-black ar-fullscreen-container">
      <SEOHead
        title={title}
        description={description}
        image={scene.preview_image}
        type="article"
      />

      {/* NeedleARViewer fills the entire screen */}
      <div className="absolute inset-0 z-0">
        <NeedleARViewer scene={scene} locale={lang} />
      </div>

      {/* Floating header bar — z-10 above viewer */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate">{title}</h1>
            <p className="text-xs text-white/50">
              {arTypeName}
              {scene.difficulty && ` · ${difficultyName}`}
              {scene.duration_minutes && ` · ${scene.duration_minutes} ${texts.duration[lang]}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {description && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className={`text-white hover:bg-white/20 h-8 w-8 ${showInfo ? 'bg-white/20' : ''}`}
              title={texts.info[lang]}
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleShare} className="text-white hover:bg-white/20 h-8 w-8" title={texts.share[lang]}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFullscreen} className="text-white hover:bg-white/20 h-8 w-8" title={texts.fullscreen[lang]}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20 gap-1 h-8 px-3">
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">{texts.close[lang]}</span>
          </Button>
        </div>
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && description && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-[49px] left-0 right-0 z-10 bg-black/80 border-b border-white/10 overflow-hidden"
          >
            <p className="px-4 py-3 text-sm text-white/70 max-w-4xl">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ARScenePage;
