// ============ ANALYTICS INTEGRATION ============
// Dual tracking: GA4 + Directus analytics_events collection
// Respects user cookie consent preferences for GA4
// Directus tracking is always active (first-party, no cookies)
//
// Tracked dimensions:
//   - experience_type: ar | vr | tour360 | route | poi | page
//   - access_location: home | on_location | unknown
//   - browser, os, screen_resolution, country
//   - is_returning, session duration, completion %

import { directus } from '@/lib/api/directus-client';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID;
const CONSENT_KEY = 'asturias-inmersivo-cookie-consent';
const VISITOR_KEY = 'asturias-inmersivo-visitor-id';
const ACCESS_MODE_KEY = 'asturias-inmersivo-access-mode';

// ============ SESSION & DEVICE UTILS ============

let _sessionId: string | null = null;
let _sessionStartTime: number = Date.now();

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

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'Other';
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Other';
}

function getScreenResolution(): string {
  return `${window.screen.width}x${window.screen.height}`;
}

function getCountry(): string {
  try {
    const locale = navigator.language || 'es-ES';
    const parts = locale.split('-');
    return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();
  } catch {
    return 'ES';
  }
}

function isReturningVisitor(): boolean {
  const visitorId = localStorage.getItem(VISITOR_KEY);
  if (visitorId) return true;
  localStorage.setItem(VISITOR_KEY, `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  return false;
}

/**
 * Get user access mode: 'home' or 'on_location'.
 * Set during onboarding when user chooses "Discovering from home" vs "I'm already in Asturias".
 */
function getAccessLocation(): 'home' | 'on_location' | 'unknown' {
  const mode = localStorage.getItem(ACCESS_MODE_KEY) || sessionStorage.getItem(ACCESS_MODE_KEY);
  if (mode === 'home' || mode === 'on_location') return mode;
  return 'unknown';
}

/** Called from onboarding to set access mode */
export const setAccessMode = (mode: 'home' | 'on_location') => {
  localStorage.setItem(ACCESS_MODE_KEY, mode);
  sessionStorage.setItem(ACCESS_MODE_KEY, mode);
};

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
  if (!GA4_ID || !hasAnalyticsConsent()) {
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
  
  // GA4 initialized
};

// ============ ENRICHED DIRECTUS TRACKING ============

/** Build common fields for every Directus event */
function getCommonFields() {
  return {
    session_id: getSessionId(),
    device_type: getDeviceType(),
    language: getCurrentLanguage(),
    page_url: window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
    screen_resolution: getScreenResolution(),
    browser: getBrowserName(),
    os: getOS(),
    country: getCountry(),
    is_returning: isReturningVisitor(),
    access_location: getAccessLocation(),
  };
}

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
    ...getCommonFields(),
    page_url: url,
    experience_type: 'page',
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
    ...getCommonFields(),
    resource_id: (params?.tour_id || params?.ar_id || params?.route_id || params?.content_id || '') as string,
    resource_type: (params?.content_type || params?.ar_type || '') as string,
    duration_seconds: params?.time_spent_sec as number || params?.duration_sec as number || undefined,
    completion_percentage: params?.completion_rate as number || undefined,
    experience_type: (params?.experience_type || '') as string || undefined,
    extra_data: params as Record<string, any>,
  });
};

// ============ SESSION LIFECYCLE ============

/** Track session start — call once on app mount */
export const trackSessionStart = () => {
  _sessionStartTime = Date.now();
  directus.trackEvent({
    event_type: 'session_start',
    ...getCommonFields(),
    extra_data: {
      entry_page: window.location.pathname,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    },
  });
};

/** Track session end — call on beforeunload / visibilitychange */
export const trackSessionEnd = () => {
  const durationSec = Math.round((Date.now() - _sessionStartTime) / 1000);
  if (durationSec < 1) return;

  // Use sendBeacon for reliability on page unload
  const payload = {
    id: crypto.randomUUID(),
    event_type: 'session_end',
    ...getCommonFields(),
    duration_seconds: durationSec,
    extra_data: { exit_page: window.location.pathname },
    created_at: new Date().toISOString(),
  };

  const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
  const BASE_URL = import.meta.env.DEV ? '/directus-api' : DIRECTUS_URL;
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  navigator.sendBeacon(`${BASE_URL}/items/analytics_events`, blob);
};

/** Initialize session tracking listeners */
export const initSessionTracking = () => {
  trackSessionStart();

  // Track session end on page unload
  window.addEventListener('beforeunload', trackSessionEnd);

  // Also track on visibility change (mobile tab switch)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackSessionEnd();
    }
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
    experience_type: 'tour360',
  });
};

export const trackTourStarted = (tourId: string, tourTitle: string) => {
  trackEvent('tour_started', {
    tour_id: tourId,
    tour_title: tourTitle,
    experience_type: 'tour360',
  });
};

export const trackTourCompleted = (tourId: string, timeSpentSec: number) => {
  trackEvent('tour_completed', {
    tour_id: tourId,
    time_spent_sec: timeSpentSec,
    experience_type: 'tour360',
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
    experience_type: 'ar',
  });
};

export const trackARCompleted = (arId: string, durationSec: number, completionRate?: number) => {
  trackEvent('ar_completed', {
    ar_id: arId,
    duration_sec: durationSec,
    experience_type: 'ar',
    ...(completionRate != null ? { completion_rate: completionRate } : {}),
  });
};

export const trackARError = (arId: string, errorMessage: string) => {
  trackEvent('ar_error', {
    ar_id: arId,
    error: errorMessage,
    experience_type: 'ar',
  });
};

export const trackVRStarted = (vrId: string, vrTitle: string) => {
  trackEvent('vr_started', {
    content_id: vrId,
    content_type: 'vr',
    vr_title: vrTitle,
    experience_type: 'vr',
  });
};

export const trackVRCompleted = (vrId: string, durationSec: number, completionRate?: number) => {
  trackEvent('vr_completed', {
    content_id: vrId,
    content_type: 'vr',
    duration_sec: durationSec,
    experience_type: 'vr',
    ...(completionRate != null ? { completion_rate: completionRate } : {}),
  });
};

export const trackVRExperienceViewed = (vrId: string, vrTitle: string) => {
  trackEvent('vr_viewed', {
    content_id: vrId,
    content_type: 'vr',
    vr_title: vrTitle,
    experience_type: 'vr',
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
    experience_type: 'route',
  });
};

export const trackRouteStarted = (routeId: string, routeName: string) => {
  trackEvent('route_started', {
    route_id: routeId,
    route_name: routeName,
    experience_type: 'route',
  });
};

export const trackRouteCompleted = (routeId: string, routeName: string, durationSec: number, poisVisited: number, totalPois: number) => {
  const completionRate = totalPois > 0 ? Math.round((poisVisited / totalPois) * 100) : 0;
  trackEvent('route_completed', {
    route_id: routeId,
    route_name: routeName,
    duration_sec: durationSec,
    completion_rate: completionRate,
    pois_visited: poisVisited,
    total_pois: totalPois,
    experience_type: 'route',
  });
};

export const trackPOIViewed = (poiId: string, poiName: string, routeId?: string) => {
  trackEvent('poi_viewed', {
    content_id: poiId,
    content_type: 'poi',
    poi_name: poiName,
    experience_type: 'poi',
    ...(routeId ? { route_id: routeId } : {}),
  });
};

export const trackPOITimeSpent = (poiId: string, poiName: string, durationSec: number, routeId?: string) => {
  trackEvent('poi_time_spent', {
    content_id: poiId,
    content_type: 'poi',
    poi_name: poiName,
    duration_sec: durationSec,
    experience_type: 'poi',
    ...(routeId ? { route_id: routeId } : {}),
  });
};

export const trackGPXDownloaded = (routeId: string, routeName: string) => {
  trackEvent('gpx_downloaded', {
    route_id: routeId,
    route_name: routeName,
    experience_type: 'route',
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
  if (window.gtag) {
    window.gtag('event', 'cookie_consent', {
      consent_status: status,
      ...preferences,
    });
  }

  // Also track in Directus
  directus.trackEvent({
    event_type: 'cookie_consent',
    ...getCommonFields(),
    extra_data: { status, ...preferences },
  });
};

// ============ ADDITIONAL ANALYTICS ============

export const trackMapInteraction = (action: string, details?: Record<string, string | number>) => {
  trackEvent('map_interaction', {
    map_action: action,
    ...(details || {}),
  });
};

export const trackQRScanned = (contentId: string, contentType: string) => {
  trackEvent('qr_scanned', {
    content_id: contentId,
    content_type: contentType,
  });
};

export const trackNavigationStarted = (destinationId: string, destinationName: string, mode: 'walking' | 'driving') => {
  trackEvent('navigation_started', {
    content_id: destinationId,
    destination_name: destinationName,
    navigation_mode: mode,
  });
};

export const trackErrorOccurred = (errorType: string, errorMessage: string, context?: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...(context ? { error_context: context } : {}),
  });
};

export const trackOnboardingCompleted = (mode: 'home' | 'on_location', experienceChosen: string) => {
  setAccessMode(mode);
  trackEvent('onboarding_completed', {
    access_mode: mode,
    experience_chosen: experienceChosen,
  });
};
