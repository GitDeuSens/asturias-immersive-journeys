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

      {/* Two giant decision cards */}
      <div className="flex flex-col md:flex-row w-full h-full pt-24 md:pt-0">
        {/* From Home */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => onSelect('home')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${vrImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-primary/80 group-hover:via-primary/40 transition-all duration-500" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 md:pb-24 px-6">
            <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {t(texts.homeTitle)}
            </h2>
            <p className="text-lg md:text-xl text-white/80 text-center max-w-sm">
              {t(texts.homeSubtitle)}
            </p>
          </div>
        </motion.button>

        {/* Divider */}
        <div className="hidden md:block w-1 bg-primary" />
        <div className="md:hidden h-1 bg-primary" />

        {/* Already Here */}
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={() => onSelect('here')}
          className="relative flex-1 group overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${arImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-accent/80 group-hover:via-accent/40 transition-all duration-500" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 md:pb-24 px-6">
            <div className="w-20 h-20 rounded-xl bg-accent flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {t(texts.hereTitle)}
            </h2>
            <p className="text-lg md:text-xl text-white/80 text-center max-w-sm">
              {t(texts.hereSubtitle)}
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
