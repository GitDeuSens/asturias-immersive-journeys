import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertTriangle, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getCacheStats, clearExpiredCache } from '@/lib/offlineCache';

export function NetworkStatusAlert() {
  const { isOnline, wasOffline, effectiveType } = useNetworkStatus();
  const { t } = useTranslation();
  const [showRestored, setShowRestored] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [cachedRouteCount, setCachedRouteCount] = useState(0);

  // Clear expired cache on mount
  useEffect(() => {
    clearExpiredCache();
  }, []);

  // Check cache stats when going offline
  useEffect(() => {
    if (!isOnline) {
      getCacheStats().then(stats => {
        setCachedRouteCount(stats.routeCount);
      });
    }
  }, [isOnline]);

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
          className={`fixed top-0 left-0 right-0 z-[100] px-4 py-3 shadow-lg ${
            cachedRouteCount > 0 
              ? 'bg-amber-500 text-white' 
              : 'bg-destructive text-destructive-foreground'
          }`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            {cachedRouteCount > 0 ? (
              <>
                <Database className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <div className="text-center">
                  <p className="font-semibold text-sm">{t('network.offlineWithCache')}</p>
                  <p className="text-xs opacity-90">
                    {cachedRouteCount} {t('navigation.cachedRoutes')}
                  </p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <div className="text-center">
                  <p className="font-semibold text-sm">{t('network.offline')}</p>
                  <p className="text-xs opacity-90">{t('network.offlineDescription')}</p>
                </div>
              </>
            )}
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
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <Wifi className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <p className="font-semibold text-sm">{t('network.backOnline')}</p>
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
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="text-center">
              <p className="font-semibold text-sm">{t('network.slowConnection')}</p>
              <p className="text-xs opacity-90">{t('network.slowConnectionDescription')}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
