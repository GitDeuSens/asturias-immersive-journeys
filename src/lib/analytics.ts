// ============ ANALYTICS INTEGRATION ============
// Dual tracking: GA4 + Directus analytics_events collection
// Respects user cookie consent preferences for GA4
// Directus tracking is always active (first-party, no cookies)

import { directus } from '@/lib/api/directus-client';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID;
const CONSENT_KEY = 'asturias-inmersivo-cookie-consent';

// ============ SESSION & DEVICE UTILS ============

let _sessionId: string | null = null;

function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = sessionStorage.getItem('analytics_session_id') 
      || `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('analytics_session_id', _sessionId);
  }
  return _sessionId;
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getCurrentLanguage(): string {
  return document.documentElement.lang || 'es';
}

// ============ GA4 CONSENT ============

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
    console.warn('[Analytics] GA4_ID not configured - GA4 disabled');
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

// ============ CORE TRACKING ============

// Track page view
export const trackPageView = (url: string) => {
  // GA4
  if (window.gtag && hasAnalyticsConsent()) {
    window.gtag('config', GA4_ID, { page_path: url });
  }

  // Directus (always)
  directus.trackEvent({
    event_type: 'page_view',
    session_id: getSessionId(),
    device_type: getDeviceType(),
    language: getCurrentLanguage(),
    extra_data: { url },
  });
};

// Track custom event — sends to both GA4 and Directus
export const trackEvent = (
  eventName: string, 
  params?: Record<string, string | number | boolean>
) => {
  // GA4 (consent required)
  if (hasAnalyticsConsent() && window.gtag) {
    window.gtag('event', eventName, params);
  }

  // Directus (always — first-party analytics, no cookies)
  directus.trackEvent({
    event_type: eventName,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    language: getCurrentLanguage(),
    resource_id: (params?.tour_id || params?.ar_id || params?.route_id || params?.content_id || '') as string,
    resource_type: (params?.content_type || params?.ar_type || '') as string,
    duration_seconds: params?.time_spent_sec as number || params?.duration_sec as number || undefined,
    completion_percentage: params?.completion_rate as number || undefined,
    extra_data: params as Record<string, any>,
  });
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

export const trackRouteStarted = (routeId: string, routeName: string) => {
  trackEvent('route_started', {
    route_id: routeId,
    route_name: routeName,
  });
};

export const trackPOIViewed = (poiId: string, poiName: string, routeId?: string) => {
  trackEvent('poi_viewed', {
    content_id: poiId,
    content_type: 'poi',
    poi_name: poiName,
    ...(routeId ? { route_id: routeId } : {}),
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

export const trackVRExperienceViewed = (vrId: string, vrTitle: string) => {
  trackEvent('vr_viewed', {
    content_id: vrId,
    content_type: 'vr',
    vr_title: vrTitle,
  });
};

export const trackCookieConsent = (status: string, preferences: Record<string, boolean>) => {
  // This event is allowed even without full consent as it tracks the consent itself
  if (window.gtag) {
    window.gtag('event', 'cookie_consent', {
      consent_status: status,
      ...preferences,
    });
  }

  // Also track in Directus
  directus.trackEvent({
    event_type: 'cookie_consent',
    session_id: getSessionId(),
    device_type: getDeviceType(),
    extra_data: { status, ...preferences },
  });
};
