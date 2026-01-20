import { motion } from 'framer-motion';
import { Mountain, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '@/hooks/useLanguage';

const languages = [
  { code: 'es' as Language, label: 'ES', fullLabel: 'Español', flag: '🇪🇸' },
  { code: 'en' as Language, label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
  { code: 'fr' as Language, label: 'FR', fullLabel: 'Français', flag: '🇫🇷' },
];

export function OnboardingHeader() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-lg text-white drop-shadow-md">
              Asturias
            </span>
            <span className="text-primary font-semibold text-sm ml-1 uppercase tracking-wider drop-shadow-md">
              Inmersivo
            </span>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          >
            <span className="text-lg">{currentLang.flag}</span>
            <span className="font-medium">{currentLang.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-44 rounded-lg bg-white/95 backdrop-blur-md shadow-xl border border-white/20 overflow-hidden"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                      language === lang.code 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.fullLabel}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

// Need to import AnimatePresence
import { AnimatePresence } from 'framer-motion';
