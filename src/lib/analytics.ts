// ============ ANALYTICS INTEGRATION ============
// 🗄️ GA4 tracking for user interactions and events
// Respects user cookie consent preferences

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID;
const CONSENT_KEY = 'asturias-inmersivo-cookie-consent';

// Check if analytics cookies are allowed
export const hasAnalyticsConsent = (): boolean => {
  try {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) return false;
    
    const parsed = JSON.parse(consent);
    return parsed.preferences?.analytics === true;
  } catch {
    return false;
  }
};

// Initialize GA4 (only if consent given)
export const initGA = () => {
  if (!GA4_ID) {
    console.warn('[Analytics] GA4_ID not configured - analytics disabled');
    return;
  }

  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] User has not consented to analytics cookies');
    return;
  }

  // Add GA4 script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, {
    page_path: window.location.pathname,
    anonymize_ip: true, // GDPR compliance
  });
  
  console.log('[Analytics] GA4 initialized with consent');
};

// Track page view
export const trackPageView = (url: string) => {
  if (!window.gtag || !hasAnalyticsConsent()) return;

  window.gtag('config', GA4_ID, {
    page_path: url,
  });
};

// Track custom event
export const trackEvent = (
  eventName: string, 
  params?: Record<string, string | number | boolean>
) => {
  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] Event blocked (no consent):', eventName);
    return;
  }
  
  if (!window.gtag) {
    console.log('[Analytics] Event (dev):', eventName, params);
    return;
  }

  window.gtag('event', eventName, params);
};

// ============ PREDEFINED EVENTS ============

export const trackTourViewed = (
  tourId: string, 
  museumName: string, 
  language: string, 
  device: string
) => {
  trackEvent('tour_viewed', {
    tour_id: tourId,
    museum_name: museumName,
    language,
    device,
  });
};

export const trackTourStarted = (tourId: string, tourTitle: string) => {
  trackEvent('tour_started', {
    tour_id: tourId,
    tour_title: tourTitle,
  });
};

export const trackTourCompleted = (tourId: string, timeSpentSec: number) => {
  trackEvent('tour_completed', {
    tour_id: tourId,
    time_spent_sec: timeSpentSec,
  });
};

export const trackARStarted = (
  arId: string, 
  arType: string, 
  poiName: string
) => {
  trackEvent('ar_started', {
    ar_id: arId,
    ar_type: arType,
    poi_name: poiName,
  });
};

export const trackARCompleted = (arId: string, durationSec: number) => {
  trackEvent('ar_completed', {
    ar_id: arId,
    duration_sec: durationSec,
  });
};

export const trackARError = (arId: string, errorMessage: string) => {
  trackEvent('ar_error', {
    ar_id: arId,
    error: errorMessage,
  });
};

export const trackRouteViewed = (
  routeId: string, 
  routeName: string, 
  numPois: number
) => {
  trackEvent('route_viewed', {
    route_id: routeId,
    route_name: routeName,
    num_pois: numPois,
  });
};

export const trackGPXDownloaded = (routeId: string, routeName: string) => {
  trackEvent('gpx_downloaded', {
    route_id: routeId,
    route_name: routeName,
  });
};

export const trackShare = (
  method: string, 
  contentType: string, 
  contentId: string
) => {
  trackEvent('share', {
    method,
    content_type: contentType,
    content_id: contentId,
  });
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

export const trackAudioPlayed = (
  audioUrl: string, 
  language: string
) => {
  trackEvent('audio_played', {
    audio_url: audioUrl,
    language,
  });
};

export const trackAudioCompleted = (
  audioUrl: string, 
  language: string, 
  completionRate: number
) => {
  trackEvent('audio_completed', {
    audio_url: audioUrl,
    language,
    completion_rate: completionRate,
  });
};

export const trackFullscreenOpened = (contentType: string, contentId: string) => {
  trackEvent('fullscreen_opened', {
    content_type: contentType,
    content_id: contentId,
  });
};

export const trackLanguageChanged = (fromLang: string, toLang: string) => {
  trackEvent('language_changed', {
    from_language: fromLang,
    to_language: toLang,
  });
};

export const trackThemeChanged = (theme: string) => {
  trackEvent('theme_changed', {
    theme,
  });
};

export const trackCookieConsent = (status: string, preferences: Record<string, boolean>) => {
  // This event is allowed even without full consent as it tracks the consent itself
  if (!window.gtag) return;
  
  window.gtag('event', 'cookie_consent', {
    consent_status: status,
    ...preferences,
  });
};
