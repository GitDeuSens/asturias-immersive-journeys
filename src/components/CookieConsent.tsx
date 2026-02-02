import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Settings, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'asturias-inmersivo-cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'customized';

interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent('accepted', allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent('rejected', onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent('customized', preferences);
  };

  const saveConsent = (status: ConsentStatus, prefs: CookiePreferences) => {
    const consentData = {
      status,
      preferences: prefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Main banner */}
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-12 h-12 bg-primary/10 rounded-xl items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 
                    id="cookie-consent-title" 
                    className="text-lg font-semibold text-foreground mb-2"
                  >
                    {t('cookies.consentTitle')}
                  </h2>
                  <p 
                    id="cookie-consent-description" 
                    className="text-sm text-muted-foreground mb-4"
                  >
                    {t('cookies.consentDescription')}{' '}
                    <Link 
                      to="/cookies" 
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {t('cookies.learnMore')}
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </p>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                      {t('cookies.acceptAll')}
                    </button>
                    
                    <button
                      onClick={handleRejectAll}
                      className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                      {t('cookies.rejectAll')}
                    </button>
                    
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-2 px-5 py-2.5 text-foreground hover:bg-muted rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-expanded={showSettings}
                    >
                      <Settings className="w-4 h-4" aria-hidden="true" />
                      {t('cookies.customize')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Settings panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border overflow-hidden"
                >
                  <div className="p-4 md:p-6 bg-muted/30">
                    <div className="space-y-4">
                      {/* Necessary cookies */}
                      <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {t('cookies.necessary')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('cookies.necessaryDesc')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground uppercase">
                            {t('cookies.required')}
                          </span>
                          <div className="w-11 h-6 bg-primary rounded-full flex items-center justify-end px-0.5">
                            <div className="w-5 h-5 bg-background rounded-full shadow" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Analytics cookies */}
                      <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {t('cookies.analytics')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('cookies.analyticsDesc')}
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                          className={`w-11 h-6 rounded-full flex items-center transition-colors ${
                            preferences.analytics ? 'bg-primary justify-end' : 'bg-input justify-start'
                          } px-0.5`}
                          role="switch"
                          aria-checked={preferences.analytics}
                          aria-label={t('cookies.analytics')}
                        >
                          <div className="w-5 h-5 bg-background rounded-full shadow" />
                        </button>
                      </div>
                      
                      {/* Marketing cookies */}
                      <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {t('cookies.marketing')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('cookies.marketingDesc')}
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                          className={`w-11 h-6 rounded-full flex items-center transition-colors ${
                            preferences.marketing ? 'bg-primary justify-end' : 'bg-input justify-start'
                          } px-0.5`}
                          role="switch"
                          aria-checked={preferences.marketing}
                          aria-label={t('cookies.marketing')}
                        >
                          <div className="w-5 h-5 bg-background rounded-full shadow" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSavePreferences}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <Check className="w-4 h-4" aria-hidden="true" />
                        {t('cookies.savePreferences')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
