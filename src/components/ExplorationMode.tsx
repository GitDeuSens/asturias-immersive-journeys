import { motion } from 'framer-motion';
import { Home, MapPin } from 'lucide-react';
import vrImage from '@/assets/vr-experience.jpg';
import arImage from '@/assets/ar-hiking.jpg';
import { useLanguage } from '@/hooks/useLanguage';

interface ExplorationModeProps {
  onSelect: (mode: 'home' | 'here') => void;
}

const texts = {
  title: { es: '¿Cómo quieres explorar?', en: 'How do you want to explore?', fr: 'Comment voulez-vous explorer?' },
  homeTitle: { es: 'Desde casa', en: 'From home', fr: 'Depuis chez vous' },
  homeSubtitle: { es: 'Tours virtuales inmersivos', en: 'Immersive virtual tours', fr: 'Visites virtuelles immersives' },
  hereTitle: { es: 'Ya estoy aquí', en: "I'm already here", fr: 'Je suis déjà ici' },
  hereSubtitle: { es: 'Rutas y experiencias AR in situ', en: 'Routes and AR experiences on-site', fr: 'Itinéraires et expériences AR sur place' },
};

export function ExplorationMode({ onSelect }: ExplorationModeProps) {
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

      {/* Two giant decision cards */}
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* From Home */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => onSelect('home')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${vrImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 md:pb-24 px-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-primary/40 transition-colors border border-primary/30">
              <Home className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3">
              {t(texts.homeTitle)}
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 text-center max-w-sm">
              {t(texts.homeSubtitle)}
            </p>
          </div>
        </motion.button>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="md:hidden h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Already Here */}
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={() => onSelect('here')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${arImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 md:pb-24 px-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-accent/40 transition-colors border border-accent/30">
              <MapPin className="w-8 h-8 md:w-10 md:h-10 text-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3">
              {t(texts.hereTitle)}
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 text-center max-w-sm">
              {t(texts.hereSubtitle)}
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
