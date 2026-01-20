import { motion } from 'framer-motion';
import { View, Map } from 'lucide-react';
import covadongaImg from '@/assets/covadonga.jpg';
import caresImg from '@/assets/cares.jpg';
import { useLanguage } from '@/hooks/useLanguage';

interface ExperienceSelectorProps {
  onSelect: (experience: 'tours' | 'routes') => void;
}

const texts = {
  title: { es: 'Elige tu experiencia', en: 'Choose your experience', fr: 'Choisissez votre expérience' },
  toursTitle: { es: 'Tours Virtuales 360°', en: 'Virtual Tours 360°', fr: 'Visites Virtuelles 360°' },
  toursSubtitle: { es: 'Explora sin moverte', en: 'Explore without moving', fr: 'Explorez sans bouger' },
  routesTitle: { es: 'Rutas Inmersivas', en: 'Immersive Routes', fr: 'Itinéraires Immersifs' },
  routesSubtitle: { es: 'Mapa + AR + Descubrimiento', en: 'Map + AR + Discovery', fr: 'Carte + AR + Découverte' },
};

export function ExperienceSelector({ onSelect }: ExperienceSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="screen-fullscreen bg-background">
      {/* Green stripe accent */}
      <div className="absolute top-0 left-8 md:left-12 w-1.5 h-24 bg-primary z-20" />
      
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-8 md:top-12 left-0 right-0 text-center z-10 px-6"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
          {t(texts.title)}
        </h1>
      </motion.div>

      {/* Two experience options */}
      <div className="flex flex-col md:flex-row w-full h-full pt-24 md:pt-0">
        {/* Tours 360 */}
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => onSelect('tours')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${covadongaImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to top, hsla(79, 100%, 36%, 0.8), transparent)' }} />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 border-2 border-primary/50">
              <View className="w-12 h-12 md:w-16 md:h-16 text-primary group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-center">
              {t(texts.toursTitle)}
            </h2>
            <p className="text-lg md:text-xl text-white/80 text-center">
              {t(texts.toursSubtitle)}
            </p>
            
            {/* CTA hint */}
            <div className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-semibold uppercase tracking-wider text-sm">
                {t({ es: 'Explorar tours', en: 'Explore tours', fr: 'Explorer les visites' })}
              </span>
            </div>
          </div>
        </motion.button>

        {/* Divider */}
        <div className="hidden md:block w-1 bg-primary" />
        <div className="md:hidden h-1 bg-primary" />

        {/* Immersive Routes */}
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={() => onSelect('routes')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${caresImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to top, hsla(199, 89%, 48%, 0.8), transparent)' }} />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-accent/20 backdrop-blur-md flex items-center justify-center mb-8 group-hover:bg-accent group-hover:scale-110 transition-all duration-300 border-2 border-accent/50">
              <Map className="w-12 h-12 md:w-16 md:h-16 text-accent group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-center">
              {t(texts.routesTitle)}
            </h2>
            <p className="text-lg md:text-xl text-white/80 text-center">
              {t(texts.routesSubtitle)}
            </p>
            
            {/* CTA hint */}
            <div className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-semibold uppercase tracking-wider text-sm">
                {t({ es: 'Ver rutas', en: 'View routes', fr: 'Voir les itinéraires' })}
              </span>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
