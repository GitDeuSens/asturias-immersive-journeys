import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useLanguage } from '@/hooks/useLanguage';

const texts = {
  offline: {
    es: 'Sin conexión a Internet',
    en: 'No internet connection',
    fr: 'Pas de connexion Internet'
  },
  offlineDescription: {
    es: 'Algunas funciones pueden no estar disponibles',
    en: 'Some features may not be available',
    fr: 'Certaines fonctionnalités peuvent ne pas être disponibles'
  },
  backOnline: {
    es: '¡Conexión restaurada!',
    en: 'Connection restored!',
    fr: 'Connexion restaurée!'
  },
  slowConnection: {
    es: 'Conexión lenta detectada',
    en: 'Slow connection detected',
    fr: 'Connexion lente détectée'
  },
  slowConnectionDescription: {
    es: 'El contenido puede tardar más en cargar',
    en: 'Content may take longer to load',
    fr: 'Le contenu peut prendre plus de temps à charger'
  }
};

export function NetworkStatusAlert() {
  const { isOnline, wasOffline, effectiveType } = useNetworkStatus();
  const { t } = useLanguage();
  const [showRestored, setShowRestored] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // Show "connection restored" message when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Show slow connection warning
  useEffect(() => {
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      setShowSlowWarning(true);
      const timer = setTimeout(() => setShowSlowWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [effectiveType]);

  return (
    <AnimatePresence>
      {/* Offline Alert */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div className="text-center">
              <p className="font-semibold text-sm">{t(texts.offline)}</p>
              <p className="text-xs opacity-90">{t(texts.offlineDescription)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Back Online Toast */}
      {showRestored && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-primary text-primary-foreground px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <Wifi className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold text-sm">{t(texts.backOnline)}</p>
          </div>
        </motion.div>
      )}

      {/* Slow Connection Warning */}
      {showSlowWarning && isOnline && !showRestored && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-warm text-warm-foreground px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="text-center">
              <p className="font-semibold text-sm">{t(texts.slowConnection)}</p>
              <p className="text-xs opacity-90">{t(texts.slowConnectionDescription)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
