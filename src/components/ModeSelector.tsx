import { useState } from "react";
import { motion } from "framer-motion";
import { Home, MapPin, Navigation, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useGeolocation } from "@/hooks/useGeolocation";
import { GeolocationErrorAlert } from "@/components/GeolocationErrorAlert";
import { Footer } from "./Footer";
import { useHomepageConfig } from "@/hooks/useHomepageConfig";

interface ModeSelectorProps {
  onSelect: (mode: "home" | "here") => void;
}

// Fallback texts when CMS has no data
const fallbackTexts = {
  title: {
    es: "Visita Asturias como nunca antes.",
    en: "Visit Asturias like never before.",
    fr: "Découvrez les Asturies comme jamais auparavant.",
  },
  subtitle: {
    es: "Visitas y tours inmersivos.",
    en: "Immersive visits and tours.",
    fr: "Visites et excursions immersives.",
  },
  homeTitle: {
    es: "Descúbrela desde casa",
    en: "Discovering from home",
    fr: "Découvrir depuis chez vous",
  },
  homeDescription: {
    es: "Planifica tu viaje con tours virtuales 360° y rutas inmersivas. Explora Asturias sin moverte del sofá.",
    en: "Plan your trip with 360° virtual tours and immersive routes. Explore Asturias from your couch.",
    fr: "Planifiez votre voyage avec des visites virtuelles 360° et des itinéraires immersifs. Explorez les Asturies depuis chez vous.",
  },
  hereTitle: {
    es: "Ya estoy en Asturias",
    en: "I'm already in Asturias",
    fr: "Je suis déjà dans les Asturies",
  },
  hereDescription: {
    es: "Activa tu ubicación para descubrir qué tienes cerca: experiencias de realidad aumentada, rutas y puntos de interés.",
    en: "Enable your location to discover what's nearby: AR experiences, routes and points of interest.",
    fr: "Activez votre localisation pour découvrir ce qui est proche: expériences AR, itinéraires et points d'intérêt.",
  }
};

/** Pick CMS value or fallback */
function pick(cms: Record<string, string> | undefined, fallback: Record<string, string>, lang: string): string {
  const v = cms?.[lang] || cms?.es;
  return v || fallback[lang] || fallback.es || '';
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  const { t, language: lang } = useLanguage();
  const { requestLocation, loading, error, clearLocation } = useGeolocation();
  const [selectedMode, setSelectedMode] = useState<"home" | "here" | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const { data: config } = useHomepageConfig();

  const title = pick(config?.main_title, fallbackTexts.title, lang);
  const subtitle = pick(config?.main_subtitle, fallbackTexts.subtitle, lang);
  const card1Title = pick(config?.card1_title, fallbackTexts.homeTitle, lang);
  const card1Desc = pick(config?.card1_description, fallbackTexts.homeDescription, lang);
  const card2Title = pick(config?.card2_title, fallbackTexts.hereTitle, lang);
  const card2Desc = pick(config?.card2_description, fallbackTexts.hereDescription, lang);

  const handleHomeSelect = () => {
    setSelectedMode("home");
    onSelect("home");
  };

  const handleHereSelect = async () => {
    setSelectedMode("here");
    setGeoError(null);
    const success = await requestLocation();

    if (!success && error) {
      setGeoError(error);
    }

    // Continue anyway - user can still explore without location
    onSelect("here");
  };

  const handleRetryLocation = async () => {
    setGeoError(null);
    clearLocation();
    await requestLocation();
    if (error) {
      setGeoError(error);
    }
  };

  const handleDismissError = () => {
    setGeoError(null);
  };

  return (
    <>
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-3 min-h-dvh">
        {/* Geolocation Error Alert */}
        <GeolocationErrorAlert error={geoError} onDismiss={handleDismissError} onRetry={handleRetryLocation} />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontWeight: 'lighter'}}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-7xl text-white text-center mb-3 sm:mb-5 drop-shadow-lg max-w-3xl initial-title"
        >
          {title}
        </motion.h1>

        <div className="mb-3 sm:mb-5 w-16 sm:w-24 h-px bg-white/40" />
        <span className="text-white mb-4 sm:mb-8 text-sm sm:text-base text-center px-2">{subtitle}</span>

        {/* Mode Cards */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 w-full max-w-4xl">
          {/* From Home Card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={handleHomeSelect}
            disabled={loading}
            style={{ backdropFilter: 'blur(25px)' }}
            className="initial-buttons flex-1 group relative overflow-hidden rounded-2xl bg-white/20  border border-white/20 p-5 md:p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-primary/50 hover:scale-[1.02] disabled:opacity-50"
          >
            {/* Icon */}
            <div style={{ position: 'relative', right: '5px' }}>
              <Home strokeWidth={1} className="icons text-primary" />
            </div>
            {/* Content */}
            <h2 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-3 drop-shadow-md">{card1Title}</h2>
            <p className="text-white/80 text-sm md:text-lg leading-relaxed line-clamp-2 md:line-clamp-none">{card1Desc}</p>

            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.button>

          {/* Already Here Card */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={handleHereSelect}
            disabled={loading}
            style={{ backdropFilter: 'blur(25px)' }}
            className="initial-buttons flex-1 group relative overflow-hidden rounded-2xl bg-white/20 border border-white/20 p-5 md:p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-accent/50 hover:scale-[1.02] disabled:opacity-50"
          >
            {/* Icon */}
            <div style={{ position: 'relative', right: '10px' }}>
              <MapPin strokeWidth={1} className="icons text-primary" />
            </div>

            {/* Content */}
            <h2 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-3 drop-shadow-md">{card2Title}</h2>
            <p className="text-white/80 text-sm md:text-lg leading-relaxed mb-2 md:mb-4 line-clamp-2 md:line-clamp-none">{card2Desc}</p>
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.button>
        </div>

      </div>
      <Footer />
    </>
  );
}
