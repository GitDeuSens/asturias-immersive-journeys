import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { GeolocationErrorAlert } from '@/components/GeolocationErrorAlert';

interface ModeSelectorProps {
  onSelect: (mode: 'home' | 'here') => void;
}

const texts = {
  title: { 
    es: '¿Cómo quieres explorar Asturias?', 
    en: 'How do you want to explore Asturias?', 
    fr: 'Comment voulez-vous explorer les Asturies?' 
  },
  homeTitle: { 
    es: 'Descubriendo desde casa', 
    en: 'Discovering from home', 
    fr: 'Découvrir depuis chez vous' 
  },
  homeDescription: { 
    es: 'Planifica tu viaje con tours virtuales 360° y rutas inmersivas. Explora Asturias sin moverte del sofá.', 
    en: 'Plan your trip with 360° virtual tours and immersive routes. Explore Asturias from your couch.', 
    fr: 'Planifiez votre voyage avec des visites virtuelles 360° et des itinéraires immersifs. Explorez les Asturies depuis chez vous.' 
  },
  hereTitle: { 
    es: 'Ya estoy en Asturias', 
    en: "I'm already in Asturias", 
    fr: 'Je suis déjà dans les Asturies' 
  },
  hereDescription: { 
    es: 'Activa tu ubicación para descubrir qué tienes cerca: experiencias de realidad aumentada, rutas y puntos de interés.', 
    en: 'Enable your location to discover what\'s nearby: AR experiences, routes and points of interest.', 
    fr: 'Activez votre localisation pour découvrir ce qui est proche: expériences AR, itinéraires et points d\'intérêt.' 
  },
  locationHint: {
    es: 'Se solicitará acceso a tu ubicación',
    en: 'Location access will be requested',
    fr: 'L\'accès à la localisation sera demandé'
  },
  gettingLocation: {
    es: 'Obteniendo ubicación...',
    en: 'Getting location...',
    fr: 'Obtention de la localisation...'
  }
};

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  const { t } = useLanguage();
  const { requestLocation, loading, error, clearLocation } = useGeolocation();
  const [selectedMode, setSelectedMode] = useState<'home' | 'here' | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleHomeSelect = () => {
    setSelectedMode('home');
    onSelect('home');
  };

  const handleHereSelect = async () => {
    setSelectedMode('here');
    setGeoError(null);
    const success = await requestLocation();
    
    if (!success && error) {
      setGeoError(error);
    }
    
    // Continue anyway - user can still explore without location
    onSelect('here');
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
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-10">
      {/* Geolocation Error Alert */}
      <GeolocationErrorAlert 
        error={geoError} 
        onDismiss={handleDismissError}
        onRetry={handleRetryLocation}
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 drop-shadow-lg max-w-3xl"
      >
        {t(texts.title)}
      </motion.h1>

      {/* Mode Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* From Home Card */}
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={handleHomeSelect}
          disabled={loading}
          className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-primary/50 hover:scale-[1.02] disabled:opacity-50"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            <Home className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-md">
            {t(texts.homeTitle)}
          </h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed">
            {t(texts.homeDescription)}
          </p>

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
          className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-accent/50 hover:scale-[1.02] disabled:opacity-50"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            {loading && selectedMode === 'here' ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <MapPin className="w-8 h-8 text-white" />
            )}
          </div>

          {/* Content */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-md">
            {t(texts.hereTitle)}
          </h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-4">
            {t(texts.hereDescription)}
          </p>

          {/* Location hint */}
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Navigation className="w-4 h-4" />
            <span>{loading && selectedMode === 'here' ? t(texts.gettingLocation) : t(texts.locationHint)}</span>
          </div>

          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.button>
      </div>

      {/* Bottom branding */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-12 text-white/40 text-sm"
      >
        Inspirado en turismoasturias.es
      </motion.p>
    </div>
  );
}
