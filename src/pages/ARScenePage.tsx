// ============ AR SCENE PAGE ============
// Fullscreen AR viewer page with floating header controls
// On iOS: shows POI sheet instead of full AR viewer (iOS uses Quick Look natively)

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, AlertCircle, X,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { NeedleARViewer } from "@/components/NeedleARViewer";
import { ARPointSheet } from "@/components/ARPointSheet";
import { SEOHead } from "@/components/SEOHead";
import { getARSceneBySlug } from "@/lib/api/directus-client";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/hooks/useLanguage";
import type { ARScene, Language } from "@/lib/types";

const texts = {
  back: { es: "Volver", en: "Back", fr: "Retour" },
  notFound: { es: "Experiencia no encontrada", en: "Experience not found", fr: "Expérience non trouvée" },
  loading: { es: "Cargando...", en: "Loading...", fr: "Chargement..." },
};

// Detect iOS devices
function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function ARScenePage() {
  const { slug } = useParams<{ slug: string }>();
  const { language: locale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const fromRoute = (location.state as any)?.fromRoute as string | undefined;
  const [scene, setScene] = useState<ARScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIOS] = useState(() => isIOSDevice());

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

  // iOS: Show mobile sheet with POI info instead of full AR viewer
  if (isIOS && slug) {
    return (
      <>
        <SEOHead
          title={scene?.title[lang] || scene?.title.es || 'AR Experience'}
          description={scene?.description[lang] || scene?.description.es || ''}
          image={scene?.preview_image}
          type="article"
        />
        <ARPointSheet
          arSlug={slug}
          routeId={fromRoute}
          onClose={handleClose}
        />
      </>
    );
  }

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
        <NeedleARViewer scene={scene} locale={lang} onClose={handleClose} />
      </div>
    </div>
  );
}

export default ARScenePage;
