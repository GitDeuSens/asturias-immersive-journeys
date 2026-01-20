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
    <div className="screen-fullscreen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Fog effect */}
      <div className="fog-layer" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground mb-4 tracking-tight">
            Asturias
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl font-serif text-foreground/80 italic mb-12">
            Inmersivo
          </p>
        </motion.div>

        {/* Language selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-3 mb-10"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`
                px-5 py-3 rounded-xl text-lg font-medium transition-all duration-300
                ${selectedLang === lang.code 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                  : 'bg-muted/30 text-foreground/70 hover:bg-muted/50 border border-border/50'
                }
              `}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </motion.div>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={() => onContinue(selectedLang)}
          className="cta-primary flex items-center gap-2 group"
        >
          <span>
            {selectedLang === 'es' ? 'Continuar' : selectedLang === 'en' ? 'Continue' : 'Continuer'}
          </span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Mountain silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 mountain-separator opacity-60" />
    </div>
  );
}
