import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useLanguage } from '@/hooks/useLanguage';

const texts = {
  title: { es: 'Instala la app', en: 'Install the app', fr: "Installer l'app" },
  description: {
    es: 'Acceso rápido y funcionalidad offline',
    en: 'Quick access and offline features',
    fr: 'Accès rapide et fonctionnalités hors ligne',
  },
  install: { es: 'Instalar', en: 'Install', fr: 'Installer' },
};

export function PWAInstallPrompt() {
  const { canInstall, install, dismiss } = usePWAInstall();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[55] bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-foreground">{t(texts.title)}</h4>
            <p className="text-xs text-muted-foreground">{t(texts.description)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              <Download className="w-3.5 h-3.5 inline mr-1" />
              {t(texts.install)}
            </button>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
