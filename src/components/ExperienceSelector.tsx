import { motion } from 'framer-motion';
import { View, Map, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ExperienceSelectorProps {
  onSelect: (experience: 'tours' | 'routes') => void;
  onBack?: () => void;
}

const texts = {
  title: { es: 'Elige tu experiencia', en: 'Choose your experience', fr: 'Choisissez votre expérience' },
  toursTitle: { es: 'Tours Virtuales 360°', en: 'Virtual Tours 360°', fr: 'Visites Virtuelles 360°' },
  toursSubtitle: { es: 'Explora lugares icónicos con vistas panorámicas inmersivas', en: 'Explore iconic places with immersive panoramic views', fr: 'Explorez des lieux emblématiques avec des vues panoramiques immersives' },
  routesTitle: { es: 'Rutas Inmersivas', en: 'Immersive Routes', fr: 'Itinéraires Immersifs' },
  routesSubtitle: { es: 'Recorre itinerarios con mapa, AR y puntos de interés', en: 'Follow routes with map, AR and points of interest', fr: 'Suivez des itinéraires avec carte, AR et points d\'intérêt' },
  back: { es: 'Volver', en: 'Back', fr: 'Retour' },
  homeDescription: {
    es: "Planifica tu viaje con tours virtuales 360° y rutas inmersivas. Explora Asturias sin moverte del sofá.",
    en: "Plan your trip with 360° virtual tours and immersive routes. Explore Asturias from your couch.",
    fr: "Planifiez votre voyage avec des visites virtuelles 360° et des itinéraires immersifs. Explorez les Asturies depuis chez vous.",
  },
};

export function ExperienceSelector({ onSelect, onBack }: ExperienceSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-10">
      {/* Back button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onBack}
          className="hidden absolute top-24 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t(texts.back)}</span>
        </motion.button>
      )}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 drop-shadow-lg"
      >
        {t(texts.title)}
      </motion.h1>
      <p className="text-white/80 text-base md:text-lg leading-relaxed pb-4">{t(texts.homeDescription)}</p>

      {/* Experience Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Tours 360 */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => onSelect('tours')}
          className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-primary/50 hover:scale-[1.02]"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            <View className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-md">
            {t(texts.toursTitle)}
          </h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed">
            {t(texts.toursSubtitle)}
          </p>

          {/* CTA hint on hover */}
          <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">
              {t({ es: 'Explorar tours →', en: 'Explore tours →', fr: 'Explorer les visites →' })}
            </span>
          </div>

          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.button>

        {/* Immersive Routes */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => onSelect('routes')}
          className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-accent/50 hover:scale-[1.02]"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            <Map className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-md">
            {t(texts.routesTitle)}
          </h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed">
            {t(texts.routesSubtitle)}
          </p>

          {/* CTA hint on hover */}
          <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-accent font-semibold uppercase tracking-wider text-sm">
              {t({ es: 'Ver rutas →', en: 'View routes →', fr: 'Voir les itinéraires →' })}
            </span>
          </div>

          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.button>
      </div>
    </div>
  );
}
