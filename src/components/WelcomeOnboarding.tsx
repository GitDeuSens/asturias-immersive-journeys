/**
 * First-visit welcome dialog explaining content types and navigation.
 * Shows once per device, stored in localStorage.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Camera, Info, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'asturias-welcome-seen';

export function WelcomeOnboarding() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Show after a short delay so the page renders first
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-background rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white relative">
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-7 h-7" />
                <h2 className="text-xl font-bold">{t('welcome.title')}</h2>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{t('welcome.message')}</p>
            </div>

            {/* Content type explanations */}
            <div className="p-6 space-y-4">
              {/* AR */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-warm/15 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-warm" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">AR</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('welcome.arExplain')}</p>
                </div>
              </div>

              {/* 360 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">360°</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('welcome.360Explain')}</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Info className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t('content.infoFull')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('poi.contentAvailable')}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <Button onClick={dismiss} className="w-full h-12 text-base font-bold">
                {t('welcome.understood')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
