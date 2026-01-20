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
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-8 md:top-12 left-0 right-0 text-center text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground px-6 z-10"
      >
        {t(texts.title)}
      </motion.h1>

      {/* Two experience options */}
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Tours 360 */}
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => onSelect('tours')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${covadongaImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary/50 transition-colors duration-300" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center mb-8 group-hover:bg-primary/40 transition-all duration-300 border-2 border-primary/50 group-hover:scale-110">
              <View className="w-10 h-10 md:w-14 md:h-14 text-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 text-center">
              {t(texts.toursTitle)}
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 text-center">
              {t(texts.toursSubtitle)}
            </p>
          </div>
        </motion.button>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="md:hidden h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Immersive Routes */}
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={() => onSelect('routes')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${caresImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 border-4 border-transparent group-hover:border-accent/50 transition-colors duration-300" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-accent/20 backdrop-blur-md flex items-center justify-center mb-8 group-hover:bg-accent/40 transition-all duration-300 border-2 border-accent/50 group-hover:scale-110">
              <Map className="w-10 h-10 md:w-14 md:h-14 text-accent" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 text-center">
              {t(texts.routesTitle)}
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 text-center">
              {t(texts.routesSubtitle)}
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
