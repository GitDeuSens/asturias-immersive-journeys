import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import heroImage from '@/assets/hero-mountains.jpg';
import { Language } from '@/hooks/useLanguage';

interface WelcomeSplashProps {
  onContinue: (lang: Language) => void;
}

const languages = [
  { code: 'es' as Language, label: 'Español', flag: '🇪🇸' },
  { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
  { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
];

export function WelcomeSplash({ onContinue }: WelcomeSplashProps) {
  const [selectedLang, setSelectedLang] = useState<Language>('es');

  return (
    <div className="screen-fullscreen bg-asturias-dark">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Green accent stripe - Turismo Asturias style */}
      <div className="absolute top-0 left-8 md:left-12 w-1.5 h-32 bg-primary" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-12"
        >
          {/* Logo area inspired by turismoasturias.es */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <div className="h-12 w-px bg-white/30" />
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                Asturias
              </h1>
              <p className="text-primary text-lg md:text-xl font-semibold tracking-widest uppercase">
                Inmersivo
              </p>
            </div>
          </div>
          
          <p className="text-white/80 text-lg md:text-xl max-w-xl font-light">
            Descubre el paraíso natural a través de experiencias inmersivas
          </p>
        </motion.div>

        {/* Language selector - cleaner style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-2 mb-10"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`
                px-5 py-3 rounded-lg text-base font-semibold transition-all duration-300
                ${selectedLang === lang.code 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                }
              `}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </motion.div>

        {/* Continue button - Official style */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={() => onContinue(selectedLang)}
          className="cta-primary flex items-center gap-3 group"
        >
          <span>
            {selectedLang === 'es' ? 'COMENZAR EXPERIENCIA' : selectedLang === 'en' ? 'START EXPERIENCE' : 'COMMENCER'}
          </span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Bottom credits */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-6 left-0 right-0 text-center"
      >
        <p className="text-white/50 text-sm">
          Inspirado en turismoasturias.es
        </p>
      </motion.div>
    </div>
  );
}
