import { motion } from 'framer-motion';
import { View, Map, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Footer } from './Footer';

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
    <>
      <div style={{ height: '90vh' }} className="experiences-container relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-4">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} style={{ fontWeight: 'lighter' }}
          className="sm:text-xl md:text-4xl lg:text-7xl text-white text-center mb-5 drop-shadow-lg max-w-3xl initial-title"
        >
          {t(texts.title)}
        </motion.h1>

        <img className="mb-5" src="./assets/line.png" />
        <span style={{ fontWeight: 'bold' }} className="description text-white mb-8">{t(texts.homeDescription)}</span>


        {/* Experience Cards */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 w-full max-w-4xl">
          {/* Tours 360 */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => onSelect('tours')}
            className="experience-buttons flex-1 group relative overflow-hidden rounded-2xl bg-white/10  border border-white/20 p-5 md:p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-primary/50 hover:scale-[1.02]"
          >
            {/* Icon */}
            <img className='icons' src='./assets/panoramas.svg' />

            {/* Content */}
            <h2 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-3 drop-shadow-md">
              {t(texts.toursTitle)}
            </h2>
            <p className="text-white/80 text-sm md:text-lg leading-relaxed line-clamp-2 md:line-clamp-none">
              {t(texts.toursSubtitle)}
            </p>

            {/* CTA hint on hover */}
            <div className="mt-3 md:mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-semibold uppercase tracking-wider text-xs md:text-sm">
                {t({ es: 'Explorar →', en: 'Explore →', fr: 'Explorer →' })}
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
            className="experience-buttons flex-1 group relative overflow-hidden rounded-2xl bg-white/10  border border-white/20 p-5 md:p-8 text-left transition-all duration-300 hover:bg-white/20 hover:border-accent/50 hover:scale-[1.02]"
          >
            {/* Icon */}
            <img className='icons' src='./assets/rutas.svg' />

            {/* Content */}
            <h2 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-3 drop-shadow-md">
              {t(texts.routesTitle)}
            </h2>
            <p className="text-white/80 text-sm md:text-lg leading-relaxed line-clamp-2 md:line-clamp-none">
              {t(texts.routesSubtitle)}
            </p>

            {/* CTA hint on hover */}
            <div className="mt-3 md:mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-semibold uppercase tracking-wider text-xs md:text-sm">
              {t({ es: 'Explorar →', en: 'Explore →', fr: 'Explorer →' })}
              </span>
            </div>

            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.button>
        </div>
        {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onBack}
          className="mt-6 flex items-center text-md gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-7 h-7" />
          <span className="font-medium text-xl">{t(texts.back)}</span>
        </motion.button>
        )}
      </div>
      <Footer />
    </>
  );
}
