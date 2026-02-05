import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Clock,
  RotateCw,
  Mountain,
  ChevronRight,
  Camera,
  Play,
  FileText,
  Headphones,
  Smartphone,
  Info,
  Ruler,
  Navigation,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImmersiveRoute, RoutePoint } from "@/data/immersiveRoutes";
import { getCategoryById } from "@/data/mockData";
import { calculateRouteDistance, formatDistance } from "@/lib/mapUtils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareButtons } from "@/components/ShareButtons";

interface RouteDetailSheetProps {
  route: ImmersiveRoute | null;
  onClose: () => void;
  onEnterRoute: (route: ImmersiveRoute) => void;
}

export function RouteDetailSheet({ route, onClose, onEnterRoute }: RouteDetailSheetProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en" | "fr";

  if (!route) return null;

  const distance = calculateRouteDistance(route.polyline);

  const difficultyColors = {
    easy: "bg-primary/20 text-primary border-primary",
    medium: "bg-warm/20 text-warm border-warm",
    hard: "bg-destructive/20 text-destructive border-destructive",
  };

  const routeStartDirectionsUrl = (() => {
    if (route.polyline.length === 0) return null;
    const start = route.polyline[0];

    const encodedName = encodeURIComponent(route.title[lang]);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return isIOS
      ? `maps://maps.apple.com/?daddr=${start.lat},${start.lng}&dirflg=d&q=${encodedName}`
      : `https://www.google.com/maps/dir/?api=1&destination=${start.lat},${start.lng}&travelmode=driving`;
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <motion.div
        key="sheet"
        initial={{ x: "100%", opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0.8 }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 200,
          mass: 0.9,
          opacity: { duration: 0.2, ease: "easeOut" },
        }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background z-50 shadow-2xl flex flex-col overflow-hidden md:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-detail-title"
      >
        {/* Hero image */}
        <div
          className="relative h-56 bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url(${route.coverImage})` }}
          role="img"
          aria-label={route.title[lang]}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
            aria-label={t("common.close")}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Route ID */}
          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-foreground text-sm font-bold shadow-lg">
            {route.id}
          </span>

          {/* Bottom info */}
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="pt-3 pl-6">
            <h1 id="route-detail-title" className="text-2xl font-serif font-bold mb-1">
              {route.title[lang]}
            </h1>
            <p className="text-sm font-medium">{route.theme[lang]}</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2">
              {/* Duration */}
              {route.duration && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                  {route.duration[lang]}
                </span>
              )}

              {/* Distance - NEW */}
              {distance > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                  <Ruler className="w-4 h-4 text-primary" aria-hidden="true" />
                  {formatDistance(distance)}
                </span>
              )}

              {/* Points */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                {route.points.length} {t("routes.points")}
              </span>

              {/* Difficulty */}
              {route.difficulty && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${difficultyColors[route.difficulty]}`}
                >
                  <Mountain className="w-4 h-4" aria-hidden="true" />
                  {t(`difficulty.${route.difficulty}`)}
                </span>
              )}

              {/* Circular/Linear */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-foreground text-sm font-medium">
                <RotateCw
                  className={`w-4 h-4 ${route.isCircular ? "text-primary" : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
                {route.isCircular ? t("routes.circular") : t("routes.linear")}
              </span>

              {/* 360 tour */}
              {route.tour360?.available && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-bold border border-primary/30">
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  360°
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {route.fullDescription ? route.fullDescription[lang] : route.shortDescription[lang]}
              </p>
            </div>

            {/* Navigation button */}
            {routeStartDirectionsUrl && (
              <Button asChild variant="outline" className="w-full justify-between">
                <a href={routeStartDirectionsUrl} target="_blank" rel="noopener noreferrer">
                  <span className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" aria-hidden="true" />
                    {t("routes.howToGet")}
                  </span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </Button>
            )}

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {route.categoryIds.map((catId) => {
                const cat = getCategoryById(catId);
                return cat ? (
                  <span key={catId} className="category-chip">
                    {cat.label[lang]}
                  </span>
                ) : null;
              })}
            </div>

            {/* Share buttons - NEW */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">{t("common.share")}</p>
              <ShareButtons
                title={route.title[lang]}
                description={route.shortDescription[lang]}
                hashtags={["AsturiasParaisoNatural", "AsturiasInmersivo", route.id.replace("-", "")]}
              />
            </div>

            {/* Points preview (if any) */}
            {route.points.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  {t("routes.points")} ({route.points.length})
                </h3>
                <div className="space-y-2">
                  {route.points.slice(0, 3).map((point, idx) => (
                    <PointPreviewCard key={point.id} point={point} index={idx} lang={lang} />
                  ))}
                  {route.points.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center py-2">+{route.points.length - 3} más...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* CTA Footer */}
        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <Button
            onClick={() => onEnterRoute(route)}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
          >
            {t("routes.enterRoute")}
            <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Small point preview card
function PointPreviewCard({ point, index, lang }: { point: RoutePoint; index: number; lang: "es" | "en" | "fr" }) {
  const content = point.content;

  // Determine what content types are available
  const hasAR = !!content.arExperience;
  const has360 = !!content.tour360;
  const hasVideo = !!content.video;
  const hasAudio = !!content.audioGuide;
  const hasPDF = !!content.pdf;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <div
          className="w-12 h-12 rounded-lg bg-cover bg-center border-2 border-primary/30"
          style={{ backgroundImage: point.coverImage ? `url(${point.coverImage})` : undefined }}
          role="img"
          aria-label={point.title[lang]}
        />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">
          {index + 1}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{point.title[lang]}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {hasAR && <Smartphone className="w-3.5 h-3.5 text-warm" aria-label="AR" />}
          {has360 && <Camera className="w-3.5 h-3.5 text-primary" aria-label="360°" />}
          {hasVideo && <Play className="w-3.5 h-3.5 text-muted-foreground" aria-label="Video" />}
          {hasAudio && <Headphones className="w-3.5 h-3.5 text-muted-foreground" aria-label="Audio" />}
          {hasPDF && <FileText className="w-3.5 h-3.5 text-muted-foreground" aria-label="PDF" />}
          {!hasAR && !has360 && !hasVideo && !hasAudio && !hasPDF && (
            <Info className="w-3.5 h-3.5 text-accent" aria-label="Info" />
          )}
        </div>
      </div>
    </div>
  );
}
