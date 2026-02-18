// ============ AR SCENE PAGE ============
// Individual AR scene page with QR code and WebXR support

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, Clock, MapPin, Download, Share2,
  Smartphone, Eye, Navigation, Sparkles, AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeedleARViewer } from "@/components/NeedleARViewer";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { getARSceneBySlug } from "@/lib/api/directus-client";
import { trackEvent, trackShare } from "@/lib/analytics";
import { useLanguage } from "@/hooks/useLanguage";
import type { ARScene, Language } from "@/lib/types";

const texts = {
  back: { es: "Volver", en: "Back", fr: "Retour" },
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
  howToUse: {
    es: "Cómo usar esta experiencia",
    en: "How to use this experience",
    fr: "Comment utiliser cette expérience",
  },
  downloadQR: { es: "Descargar código QR", en: "Download QR code", fr: "Télécharger le code QR" },
  shareExperience: { es: "Comparte esta experiencia", en: "Share this experience", fr: "Partagez cette expérience" },
  instructions: {
    slam: {
      es: ["Asegúrate de estar en un espacio abierto con buena iluminación", "Permite el acceso a la cámara cuando se solicite", "Apunta la cámara al suelo y muévela lentamente", "Cuando aparezca un punto, toca para colocar el contenido"],
      en: ["Make sure you are in an open space with good lighting", "Allow camera access when prompted", "Point the camera at the floor and move it slowly", "When a point appears, tap to place the content"],
      fr: ["Assurez-vous d'être dans un espace ouvert bien éclairé", "Autorisez l'accès à la caméra lorsque demandé", "Pointez la caméra vers le sol et déplacez-la lentement", "Lorsqu'un point apparaît, touchez pour placer le contenu"],
    },
    "image-tracking": {
      es: ["Imprime el marcador en tamaño A4", "Colócalo en una superficie plana", "Apunta la cámara al marcador", "El contenido AR aparecerá sobre el marcador"],
      en: ["Print the marker in A4 size", "Place it on a flat surface", "Point the camera at the marker", "The AR content will appear over the marker"],
      fr: ["Imprimez le marqueur au format A4", "Placez-le sur une surface plane", "Pointez la caméra vers le marqueur", "Le contenu AR apparaîtra sur le marqueur"],
    },
    geo: {
      es: ["Ve a la ubicación marcada en el mapa", "La experiencia AR se activará automáticamente al acercarte", "Permite el acceso a tu ubicación cuando se solicite"],
      en: ["Go to the location marked on the map", "The AR experience will activate automatically when you approach", "Allow location access when prompted"],
      fr: ["Rendez-vous à l'emplacement indiqué sur la carte", "L'expérience AR s'activera automatiquement à l'approche", "Autorisez l'accès à votre position lorsque demandé"],
    },
  },
  notFound: { es: "Experiencia no encontrada", en: "Experience not found", fr: "Expérience non trouvée" },
  loading: { es: "Cargando...", en: "Loading...", fr: "Chargement..." },
};

export function ARScenePage() {
  const { slug } = useParams<{ slug: string }>();
  const { language: locale } = useLanguage();
  const [scene, setScene] = useState<ARScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScene() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await getARSceneBySlug(slug, locale as Language);
        setScene(data);
        if (data) trackEvent("ar_scene_viewed", { ar_id: data.id, ar_slug: slug });
      } catch {
        setError("Failed to load AR scene");
      } finally {
        setIsLoading(false);
      }
    }
    loadScene();
  }, [slug, locale]);

  const handleDownloadQR = () => {
    const svg = document.getElementById("ar-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1024; canvas.height = 1024;
      ctx?.drawImage(img, 0, 0, 1024, 1024);
      const link = document.createElement("a");
      link.download = `qr-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      trackEvent("qr_downloaded", { ar_id: scene?.id, ar_slug: slug });
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (!scene) return;
    const shareData = {
      title: scene.title[locale as Language] || scene.title.es,
      text: scene.description[locale as Language] || scene.description.es,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader variant="light" />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{texts.loading[locale as Language]}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!scene || error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader variant="light" />
        <div className="pt-20 flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">{texts.notFound[locale as Language]}</h1>
          <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />{texts.back[locale as Language]}</Button></Link>
        </div>
      </div>
    );
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const instructions = texts.instructions[scene.needle_type][locale as Language];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={scene.title[locale as Language] || scene.title.es}
        description={scene.description[locale as Language] || scene.description.es}
        image={scene.preview_image}
        type="article"
      />
      <AppHeader variant="light" />

      <main className="pt-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />{texts.back[locale as Language]}
          </Link>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden mb-8"
          >
            {scene.preview_video
              ? <video src={scene.preview_video} autoPlay loop muted playsInline className="w-full aspect-video object-cover" poster={scene.preview_image} />
              : <img src={scene.preview_image} alt={scene.title[locale as Language] || scene.title.es} className="w-full aspect-video object-cover" />
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />AR
                </Badge>
                <Badge variant="secondary" className="bg-card/90">
                  <Clock className="w-3 h-3 mr-1" />{scene.duration_minutes} {texts.duration[locale as Language]}
                </Badge>
                <Badge variant="secondary" className="bg-card/90">{texts.arType[scene.needle_type][locale as Language]}</Badge>
                <Badge variant="secondary" className="bg-card/90">{texts.difficulty[scene.difficulty][locale as Language]}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {scene.title[locale as Language] || scene.title.es}
              </h1>
              <p className="text-white/80">{scene.description[locale as Language] || scene.description.es}</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* 
                AR Viewer — NeedleARViewer handles all 3 modes internally:
                  • scene_mode === "dynamic" → inline needle-engine + GLB from Directus
                  • build_path set          → iframe with deployed Needle build
                  • fallback               → launch button + iframe on click
              */}
              <section>
                <NeedleARViewer scene={scene} locale={locale as Language} />
              </section>

              {/* Instructions */}
              <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />{texts.howToUse[locale as Language]}
                </h2>
                <ol className="space-y-3">
                  {instructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">{idx + 1}</span>
                      <span className="text-muted-foreground">{instruction}</span>
                    </li>
                  ))}
                </ol>

                {scene.needle_type === "image-tracking" && scene.tracking_image_url && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      {locale === "es" ? "Marcador para imprimir:" : locale === "en" ? "Marker to print:" : "Marqueur à imprimer:"}
                    </p>
                    <img src={scene.tracking_image_url} alt="AR Marker" className="w-32 h-32 border border-border rounded-lg mb-3" />
                    <a href={scene.tracking_image_url} download={`marcador-${scene.slug}.png`}
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {locale === "es" ? "Descargar marcador (A4)" : locale === "en" ? "Download marker (A4)" : "Télécharger le marqueur (A4)"}
                    </a>
                  </div>
                )}

                {scene.needle_type === "geo" && scene.location && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {scene.location.lat.toFixed(4)}, {scene.location.lng.toFixed(4)}
                      </span>
                    </div>
                    <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${scene.location?.lat ?? 43.36},${scene.location?.lng ?? -5.85}`, "_blank")}>
                      <Navigation className="w-4 h-4 mr-2" />
                      {locale === "es" ? "Cómo llegar" : locale === "en" ? "Get directions" : "Itinéraire"}
                    </Button>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QRCodeSVG id="ar-qr-code" value={currentUrl} size={180} level="H" includeMargin={false} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {locale === "es" ? "Escanea para abrir en tu móvil" : locale === "en" ? "Scan to open on your phone" : "Scannez pour ouvrir sur votre téléphone"}
                </p>
                <Button variant="outline" size="sm" onClick={handleDownloadQR} className="w-full">
                  <Download className="w-4 h-4 mr-2" />{texts.downloadQR[locale as Language]}
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />{texts.shareExperience[locale as Language]}
                </h3>
                <ShareButtons
                  url={currentUrl}
                  title={scene.title[locale as Language] || scene.title.es}
                  description={scene.description[locale as Language] || scene.description.es}
                />
              </div>

              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {locale === "es" ? "Esta experiencia funciona mejor en dispositivos móviles con ARCore (Android) o ARKit (iOS)."
                      : locale === "en" ? "This experience works best on mobile devices with ARCore (Android) or ARKit (iOS)."
                      : "Cette expérience fonctionne mieux sur les appareils mobiles avec ARCore (Android) ou ARKit (iOS)."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ARScenePage;