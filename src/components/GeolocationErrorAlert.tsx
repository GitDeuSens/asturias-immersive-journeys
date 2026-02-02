import { motion, AnimatePresence } from 'framer-motion';
import { MapPinOff, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

interface GeolocationErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

const texts = {
  permissionDenied: {
    title: {
      es: 'Acceso a ubicación denegado',
      en: 'Location access denied',
      fr: 'Accès à la localisation refusé'
    },
    description: {
      es: 'Para usar esta función, permite el acceso a tu ubicación en la configuración del navegador.',
      en: 'To use this feature, please allow location access in your browser settings.',
      fr: 'Pour utiliser cette fonctionnalité, veuillez autoriser l\'accès à votre localisation dans les paramètres du navigateur.'
    }
  },
  positionUnavailable: {
    title: {
      es: 'Ubicación no disponible',
      en: 'Location unavailable',
      fr: 'Localisation non disponible'
    },
    description: {
      es: 'No se pudo determinar tu ubicación. Comprueba que el GPS esté activado.',
      en: 'Could not determine your location. Make sure GPS is enabled.',
      fr: 'Impossible de déterminer votre position. Vérifiez que le GPS est activé.'
    }
  },
  timeout: {
    title: {
      es: 'Tiempo de espera agotado',
      en: 'Request timed out',
      fr: 'Délai d\'attente dépassé'
    },
    description: {
      es: 'La solicitud de ubicación tardó demasiado. Intenta de nuevo.',
      en: 'The location request took too long. Please try again.',
      fr: 'La demande de localisation a pris trop de temps. Veuillez réessayer.'
    }
  },
  generic: {
    title: {
      es: 'Error de ubicación',
      en: 'Location error',
      fr: 'Erreur de localisation'
    },
    description: {
      es: 'Ocurrió un error al obtener tu ubicación.',
      en: 'An error occurred while getting your location.',
      fr: 'Une erreur s\'est produite lors de l\'obtention de votre localisation.'
    }
  },
  retry: {
    es: 'Reintentar',
    en: 'Retry',
    fr: 'Réessayer'
  },
  openSettings: {
    es: 'Abrir configuración',
    en: 'Open settings',
    fr: 'Ouvrir les paramètres'
  },
  dismiss: {
    es: 'Cerrar',
    en: 'Dismiss',
    fr: 'Fermer'
  }
};

export function GeolocationErrorAlert({ error, onDismiss, onRetry }: GeolocationErrorAlertProps) {
  const { t } = useLanguage();

  if (!error) return null;

  const getErrorContent = () => {
    if (error.includes('denied') || error.includes('PERMISSION_DENIED')) {
      return texts.permissionDenied;
    }
    if (error.includes('unavailable') || error.includes('POSITION_UNAVAILABLE')) {
      return texts.positionUnavailable;
    }
    if (error.includes('timeout') || error.includes('TIMEOUT')) {
      return texts.timeout;
    }
    return texts.generic;
  };

  const errorContent = getErrorContent();
  const isPermissionError = error.includes('denied') || error.includes('PERMISSION_DENIED');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        aria-labelledby="geolocation-error-title"
        aria-describedby="geolocation-error-description"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 bg-destructive/5">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <MapPinOff className="w-5 h-5 text-destructive" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 id="geolocation-error-title" className="font-semibold text-foreground text-sm">
              {t(errorContent.title)}
            </h4>
            <p id="geolocation-error-description" className="text-muted-foreground text-xs mt-1">
              {t(errorContent.description)}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={t(texts.dismiss)}
          >
            <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-3 bg-muted/30" role="group" aria-label="Error actions">
          {isPermissionError ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => {
                // Open browser settings for location (this varies by browser)
                // Most modern browsers don't allow direct access, so we show instructions
                alert(t({
                  es: 'Haz clic en el icono del candado en la barra de direcciones para cambiar los permisos de ubicación.',
                  en: 'Click the lock icon in the address bar to change location permissions.',
                  fr: 'Cliquez sur l\'icône du cadenas dans la barre d\'adresse pour modifier les autorisations de localisation.'
                }));
              }}
              aria-label={t(texts.openSettings)}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              {t(texts.openSettings)}
            </Button>
          ) : onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onRetry}
              aria-label={t(texts.retry)}
            >
              {t(texts.retry)}
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
