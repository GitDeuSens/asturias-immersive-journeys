import {
    Behaviour,
    WebXRButtonFactory,
    onXRSessionStart,
    onXRSessionEnd,
    DeviceUtilities,
} from "@needle-tools/engine";
import QRCode from 'qrcode';

// Dev-only logging — silent in production builds
const _log = (...args: any[]) => { if (import.meta.env.DEV) console.log(...args); };

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SceneInfo {
    id: string;
    slug: string;
    title: Record<string, string>;
    description?: Record<string, string>;
    glb_model?: string;
    // Audio from linked POI (pois.ar_scene_id = ar_scenes.id)
    audio_es?: string;
    audio_en?: string;
    audio_fr?: string;
    translations?: Array<{ languages_code: string; title?: string; description?: string }>;
}

interface PoiInfo {
    id: string;
    audio_es?: string | null;
    audio_en?: string | null;
    audio_fr?: string | null;
    translations?: Array<{ languages_code: string; title?: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASTURIAS DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const ASTURIAS = {
    colors: {
        primary:      '#7AB800',
        primaryDark:  '#5c8a00',
        accent:       '#0066A1',
        dark:         '#1a2633',
        forest:       '#1d4a27',
        cream:        '#faf8f2',
        white:        '#ffffff',
        overlay:      'rgba(0,0,0,0.55)',
        glass:        'rgba(255,255,255,0.95)',
        border:       'rgba(122,184,0,0.25)',
        danger:       '#c0392b',
    },
    fonts: { family: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif" },
    radius: { sm: '8px', base: '12px', lg: '16px', xl: '20px', full: '999px' },
    shadow: {
        strong: '0 15px 50px rgba(0,0,0,0.20)',
        green:  '0 10px 40px rgba(122,184,0,0.25)',
    },
    zIndex: {
        overlay:  2147483640,
        panel:    2147483641,
        controls: 2147483642,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────────────────────────────────────

const T: Record<string, Record<string, string>> = {
    startAR:          { es: 'Iniciar AR',                 en: 'Start AR',               fr: 'Démarrer AR' },
    startVR:          { es: 'Iniciar Experiencia',        en: 'Start Experience',        fr: "Démarrer l'Expérience" },
    stopAR:           { es: 'Salir de AR',                en: 'Exit AR',                fr: 'Quitter AR' },
    info:             { es: 'Información',                en: 'Information',            fr: 'Informations' },
    close:            { es: 'Cerrar',                     en: 'Close',                  fr: 'Fermer' },
    qrTitle:          { es: 'Escanear para abrir AR',     en: 'Scan to open AR',        fr: 'Scanner pour ouvrir AR' },
    audioGuide:       { es: 'Audioguía',                  en: 'Audio Guide',            fr: 'Audioguide' },
    language:         { es: 'Idioma',                     en: 'Language',               fr: 'Langue' },
    scanInstructions: {
        es: 'Apunta hacia una superficie plana y toca para colocar',
        en: 'Point at a flat surface and tap to place',
        fr: 'Pointez une surface plane et touchez pour placer',
    },
};

const LANGUAGES = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
];

function t(key: string, lang: string): string {
    return T[key]?.[lang] ?? T[key]?.['es'] ?? key;
}

function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTUS
// ─────────────────────────────────────────────────────────────────────────────

function getDirectusUrl(): string {
    return (window as any).__DIRECTUS_URL
        ?? (window as any).VITE_DIRECTUS_URL
        ?? (import.meta.env.VITE_DIRECTUS_URL || 'https://back.asturias.digitalmetaverso.com');
}

function getAssetUrl(uuid: string): string {
    return `${getDirectusUrl()}/assets/${uuid}`;
}

async function fetchSceneInfo(slug: string): Promise<SceneInfo | null> {
    try {
        const base = getDirectusUrl();

        // 1. Fetch ar_scene by slug
        const sceneUrl = `${base}/items/ar_scenes`
            + `?filter[slug][_eq]=${encodeURIComponent(slug)}`
            + `&fields=id,slug,glb_model,translations.languages_code,translations.title,translations.description`
            + `&limit=1`;
        const sceneRes = await fetch(sceneUrl);
        if (!sceneRes.ok) return null;
        const sceneJson = await sceneRes.json();
        const raw = sceneJson.data?.[0];
        if (!raw) return null;

        // Build multilingual title/description from translations
        const title: Record<string, string>       = { es: raw.slug, en: raw.slug, fr: raw.slug };
        const description: Record<string, string> = { es: '', en: '', fr: '' };
        for (const tr of (raw.translations ?? [])) {
            if (tr.languages_code) {
                if (tr.title)       title[tr.languages_code]       = tr.title;
                if (tr.description) description[tr.languages_code] = tr.description;
            }
        }

        // 2. Fetch linked POI (pois.ar_scene_id = raw.id) to get audio fields
        let audio_es: string | undefined;
        let audio_en: string | undefined;
        let audio_fr: string | undefined;

        try {
            const poiUrl = `${base}/items/pois`
                + `?filter[ar_scene_id][_eq]=${encodeURIComponent(raw.id)}`
                + `&fields=id,audio_es,audio_en,audio_fr`
                + `&limit=1`;
            const poiRes = await fetch(poiUrl);
            if (poiRes.ok) {
                const poiJson = await poiRes.json();
                const poi: PoiInfo | undefined = poiJson.data?.[0];
                if (poi) {
                    audio_es = poi.audio_es ?? undefined;
                    audio_en = poi.audio_en ?? undefined;
                    audio_fr = poi.audio_fr ?? undefined;
                }
            }
        } catch { /* audio optional — continue without it */ }

        return { ...raw, title, description, audio_es, audio_en, audio_fr } as SceneInfo;
    } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO PLAYER
// ─────────────────────────────────────────────────────────────────────────────

class InlineAudioPlayer {
    private _el?: HTMLAudioElement;
    private _playing = false;
    private _url     = '';
    onProgress?: (current: number, duration: number) => void;
    onEnded?: () => void;

    get isPlaying() { return this._playing; }
    get duration()  { return this._el?.duration ?? 0; }

    play(url: string, volume = 1) {
        // If same URL already loaded — just resume from current position
        if (this._el && this._url === url) {
            this._el.play().then(() => { this._playing = true; }).catch(() => {});
            return;
        }
        // New URL — create fresh element
        this._cleanup();
        this._url = url;
        this._el  = new Audio(url);
        this._el.volume = volume;
        this._el.addEventListener('timeupdate', () => {
            this.onProgress?.(this._el!.currentTime, this._el!.duration || 0);
        });
        this._el.addEventListener('ended', () => { this._playing = false; this.onEnded?.(); });
        this._el.play().then(() => { this._playing = true; }).catch(() => {});
    }

    pause() {
        if (this._el && this._playing) {
            this._el.pause();
            this._playing = false;
        }
    }

    stop() {
        this._cleanup();
        this._url = '';
    }

    seek(time: number) { if (this._el) this._el.currentTime = time; }

    private _cleanup() {
        if (this._el) {
            this._el.pause();
            this._el.removeAttribute('src');
            this._el.load();
            this._el = undefined;
        }
        this._playing = false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export class AsturiasAROverlay extends Behaviour {

    private _lang      = 'es';
    private _isDesktop = false;
    private _isVRHeadset = false;
    private _sceneInfo: SceneInfo | null = null;
    private _slug      = '';

    /**
     * _sceneUrl  — clean URL, NO query params. Passed to App Clip.
     * _arUrl     — with ?autostart=1. Encoded inside QR for Android direct open.
     *
     * The App Clip URL always uses _sceneUrl so there is no redirect loop:
     *   appclip.needle.tools/ar?url=<_sceneUrl>
     *   → opens <_sceneUrl> inside the App Clip (no ?autostart, no re-redirect)
     */
    private _sceneUrl = '';
    private _arUrl    = '';

    private _root?:       HTMLElement;
    private _headerBar?:  HTMLElement;
    private _prePanel?:   HTMLElement;
    private _arControls?: HTMLElement;
    private _audioPanel?: HTMLElement;
    private _qrPanel?:    HTMLElement;
    private _infoPanel?:  HTMLElement;
    private _langPanel?:  HTMLElement;
    private _subtitleBar?: HTMLElement;

    private _audio = new InlineAudioPlayer();

    // ─────────────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────

    override awake() {
        this._detectLanguage();
        this._detectSlug();
        this._isDesktop = this._detectDesktop();
        this._detectVRHeadset();
        this._loadGoogleFont();
        this._injectGlobalStyles();
        this._hideNeedleDefaultUI();
        this._ensureRoot();
    }

    override async start() {
        // 1. Fetch scene data first — everything else depends on it
        if (this._slug) {
            this._sceneInfo = await fetchSceneInfo(this._slug);
        }

        // 2. Build URLs after sceneInfo is ready
        this._sceneUrl = this._slug
            ? `${window.location.origin}/ar/${this._slug}`
            : window.location.origin + window.location.pathname;

        const withAutostart = new URL(this._sceneUrl);
        withAutostart.searchParams.set('autostart', '1');
        this._arUrl = withAutostart.toString();

        // 3. Build static UI
        this._buildHeaderBar();
        this._buildPreARPanel();

        // 4. Handle autostart AFTER sceneInfo and URLs are ready
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === '1') {
            // Android QR scan path
            this._hidePrePanel();
            this._handleAutostart();
        } else if (params.get('xr') === 'ar') {
            // iOS App Clip path — page is loaded inside the App Clip WebView,
            // skip pre-panel and go straight to AR (iOS satisfies gesture via App Clip tap)
            this._hidePrePanel();
            this._hideHeaderBar();
            this._startAR();
        }

        // 5. XR session hooks
        onXRSessionStart(() => {
            this._hidePrePanel();
            this._hideHeaderBar();
            // Stop pre-panel audio before switching to AR controls
            this._audio.stop();
            if (this._preAudioPanel) this._preAudioPanel.style.display = 'none';
            this._buildARControls();
            if (this._hasAudio()) this._toggleAudioPanel();
        });
        onXRSessionEnd(() => {
            this._removeARControls();
            this._removeAllPopups();
            this._showPrePanel();
            this._showHeaderBar();
            this._audio.stop();
            this._hideSubtitle();
        });
    }

    override onDestroy() {
        this._audio.stop();
        this._root?.remove();
        this._headerBar?.remove();
        this._prePanel?.remove();
        this._arControls?.remove();
        this._subtitleBar?.remove();
        (this as any)._menuObserver?.disconnect();
        this._removeAllPopups();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DETECTION HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private _detectDesktop(): boolean {
        return !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            && window.innerWidth >= 768;
    }

    private _detectVRHeadset() {
        // Check for VR headset via WebXR API
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then(supported => {
                if (supported) {
                    this._isVRHeadset = true;
                    this._isDesktop = false; // VR headsets should not show QR
                    // Rebuild pre-panel if already built to show VR button
                    const existing = document.getElementById('ast-pre-panel');
                    if (existing) {
                        existing.remove();
                        this._buildPreARPanel();
                    }
                }
            }).catch(() => {});
        }
        // Also detect common VR headset user agents as fallback
        const ua = navigator.userAgent;
        if (/OculusBrowser|Quest|Pico|HTC.*VR|XR Viewer/i.test(ua)) {
            this._isVRHeadset = true;
            this._isDesktop = false;
        }
    }

    private _isiOS(): boolean {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    private _isInsideAppClip(): boolean {
        return new URLSearchParams(window.location.search).get('xr') === 'ar';
    }

    /**
     * App Clip URL for iOS.
     * Appends ?xr=ar so the page knows it's running inside the App Clip WebView
     * and should start AR directly without showing the pre-panel.
     */
    private _getAppClipUrl(): string {
        const url = new URL(this._sceneUrl);
        url.searchParams.set('xr', 'ar');
        return `https://appclip.needle.tools/ar?url=${encodeURIComponent(url.toString())}`;
    }

    private _detectLanguage() {
        const stored = localStorage.getItem('asturias-inmersivo-lang')?.toLowerCase();
        if (stored && LANGUAGES.some(x => x.code === stored)) { this._lang = stored; return; }
        const l = new URLSearchParams(window.location.search).get('lang')?.toLowerCase();
        if (l && LANGUAGES.some(x => x.code === l)) { this._lang = l; return; }
        const b = navigator.language.split('-')[0].toLowerCase();
        if (LANGUAGES.some(x => x.code === b)) this._lang = b;
    }

    private _detectSlug() {
        const g = (window as any).__AR_SCENE_SLUG;
        if (g) { this._slug = g; return; }
        const parts = window.location.pathname.split('/');
        const idx   = parts.indexOf('ar');
        this._slug  = idx >= 0 ? (parts[idx + 1] ?? '') : '';
        if (!this._slug) this._slug = new URLSearchParams(window.location.search).get('slug') ?? '';
    }

    private _loadGoogleFont() {
        if (document.getElementById('montserrat-font')) return;
        const link = Object.assign(document.createElement('link'), {
            id: 'montserrat-font', rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap',
        });
        document.head.appendChild(link);
    }

    private _getContainer(): HTMLElement {
        return this._root ?? (document.querySelector('needle-engine') as HTMLElement) ?? document.body;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE DATA HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private _getTitle(): string {
        const raw = this._sceneInfo?.title ?? (window as any).__AR_SCENE_TITLE;
        if (!raw) return escapeHtml(this._slug);
        return escapeHtml(typeof raw === 'string' ? raw : (raw[this._lang] ?? raw['es'] ?? this._slug));
    }

    private _getDescription(): string {
        const raw = this._sceneInfo?.description ?? (window as any).__AR_SCENE_DESCRIPTION;
        if (!raw) return '';
        return escapeHtml(typeof raw === 'string' ? raw : (raw[this._lang] ?? raw['es'] ?? ''));
    }

    private _hasAudio(): boolean {
        return !!(this._sceneInfo?.audio_es || this._sceneInfo?.audio_en || this._sceneInfo?.audio_fr);
    }

    private _getAudioUrl(): string | null {
        const s = this._sceneInfo;
        if (!s) return null;
        const id = ({ es: s.audio_es, en: s.audio_en, fr: s.audio_fr } as Record<string,string|undefined>)[this._lang]
            ?? s.audio_es ?? s.audio_en ?? s.audio_fr;
        return id ? getAssetUrl(id) : null;
    }

    private _fmtTime(sec: number): string {
        if (!isFinite(sec)) return '0:00';
        return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SVG ICONS
    // ─────────────────────────────────────────────────────────────────────────

    private _icon(name: string): string {
        const icons: Record<string, string> = {
            ar:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
            qr:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="18" y="18" width="3" height="3"/></svg>`,
            info:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
            close:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
            lang:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
            play:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
            pause:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
            headphones: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
        };
        return icons[name] ?? '';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NEEDLE DEFAULT UI — hide
    // ─────────────────────────────────────────────────────────────────────────

    private _hideNeedleDefaultUI() {
        const tryHide = (): boolean => {
            const el = document.querySelector('needle-engine');
            if (!el) return false;
            const menu = el.shadowRoot?.querySelector('needle-menu') as HTMLElement | null
                ?? el.querySelector('needle-menu') as HTMLElement | null
                ?? document.querySelector('needle-menu') as HTMLElement | null;
            if (menu) { menu.style.display = 'none'; return true; }
            return false;
        };
        if (tryHide()) return;
        const obs = new MutationObserver(() => {
            const el = document.querySelector('needle-engine');
            if (!el) return;
            obs.disconnect();
            if (tryHide()) return;
            if (el.shadowRoot) {
                const sObs = new MutationObserver(() => { if (tryHide()) sObs.disconnect(); });
                sObs.observe(el.shadowRoot, { childList: true, subtree: true });
                (this as any)._menuObserver = sObs;
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        (this as any)._menuObserver = obs;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ROOT ELEMENT
    // ─────────────────────────────────────────────────────────────────────────

    private _ensureRoot() {
        if (this._root) return this._root;
        this._root = document.createElement('div');
        this._root.id = 'asturias-ar-root';
        this._root.style.cssText = `
            position:absolute;inset:0;width:100%;height:100%;
            pointer-events:none;overflow:hidden;
            z-index:${ASTURIAS.zIndex.overlay};
            font-family:${ASTURIAS.fonts.family};
        `;
        const isAppClip = DeviceUtilities.isNeedleAppClip();
        const isAndroid = DeviceUtilities.isAndroidDevice();
        const needle    = document.querySelector('needle-engine') as HTMLElement | null;
        const slot      = document.getElementById('needle-overlay-slot');

        if (isAppClip) {
            (slot ?? needle ?? document.body).appendChild(this._root);
        } else if (isAndroid) {
            if (needle) {
                if (!needle.style.position || needle.style.position === 'static')
                    needle.style.position = 'relative';
                needle.appendChild(this._root);
            } else { document.body.appendChild(this._root); }
        } else {
            if (slot) { slot.appendChild(this._root); }
            else if (needle) {
                if (!needle.style.position || needle.style.position === 'static')
                    needle.style.position = 'relative';
                needle.appendChild(this._root);
            } else { document.body.appendChild(this._root); }
        }
        return this._root;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTOSTART
    // ─────────────────────────────────────────────────────────────────────────

    private _handleAutostart() {
        if (this._isiOS()) {
            // Redirect to App Clip with CLEAN _sceneUrl — no autostart param,
            // so the App Clip opens the page normally without re-triggering autostart.
            _log('[AsturiasAROverlay] iOS autostart → App Clip');
            window.location.href = this._getAppClipUrl();
            return;
        }
        if (DeviceUtilities.isAndroidDevice()) {
            // WebXR requires a user gesture on Android — show tap-to-start overlay
            _log('[AsturiasAROverlay] Android autostart → tap prompt');
            this._showAndroidTapPrompt();
            return;
        }
        this._showPrePanel();
    }

    private _showAndroidTapPrompt() {
        const root    = this._ensureRoot();
        const overlay = document.createElement('div');
        overlay.id    = 'ast-android-tap';
        overlay.style.cssText = `
            position:absolute;inset:0;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            background:linear-gradient(160deg,${ASTURIAS.colors.forest} 0%,#0d2b18 100%);
            z-index:${ASTURIAS.zIndex.panel};pointer-events:auto;
            cursor:pointer;-webkit-tap-highlight-color:transparent;
            font-family:${ASTURIAS.fonts.family};
        `;
        overlay.innerHTML = `
            <div style="text-align:center;padding:32px;animation:ast-scale-in 0.3s ease forwards;">
                <div style="width:88px;height:88px;border-radius:50%;background:${ASTURIAS.colors.primary};
                    display:flex;align-items:center;justify-content:center;
                    margin:0 auto 20px;box-shadow:${ASTURIAS.shadow.green};animation:ast-pulse 2s ease infinite;">
                    ${this._icon('ar')}
                </div>
                <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:8px;">
                    ${t('startAR', this._lang)}
                </div>
                <div style="font-size:14px;color:rgba(255,255,255,0.55);">
                    ${t('scanInstructions', this._lang)}
                </div>
            </div>
        `;
        overlay.addEventListener('click', () => { overlay.remove(); this._startAR(); }, { once: true });
        root.appendChild(overlay);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // START / STOP AR
    // ─────────────────────────────────────────────────────────────────────────

    private async _startAR() {
        if (this._isiOS() && !this._isInsideAppClip()) {
            // Outside App Clip WebView — redirect to App Clip
            window.location.href = this._getAppClipUrl();
            return;
        }
        // Inside App Clip WebView (?xr=ar) OR Android/Desktop — use Needle WebXR directly
        try {
            const { NeedleXRSession, Context } = await import('@needle-tools/engine');
            const ctx = Context.Current;
            if (NeedleXRSession && ctx) { await NeedleXRSession.start("ar", undefined, ctx); return; }
        } catch (err) { console.warn('[AsturiasAROverlay] NeedleXRSession.start failed', err); }
        try {
            const f = WebXRButtonFactory.getOrCreate();
            if (f.arButton) { f.arButton.click(); return; }
        } catch { /* ignore */ }
        (document.querySelector('[ar-button]') as HTMLElement)?.click();
    }

    private async _stopAR() {
        try {
            const session = (window as any).__currentXRSession
                ?? document.querySelector('needle-engine')?.['context']?.xrSession
                ?? (window as any).needle?.context?.xrSession;
            if (session) { await session.end(); return; }
        } catch { /* ignore */ }
        try {
            const f = WebXRButtonFactory.getOrCreate();
            if (f.arButton) { f.arButton.click(); return; }
        } catch { /* ignore */ }
        (document.querySelector('[ar-button]') as HTMLElement)?.click();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GLOBAL STYLES
    // ─────────────────────────────────────────────────────────────────────────

    private _injectGlobalStyles() {
        if (document.getElementById('asturias-ar-styles')) return;
        const s = document.createElement('style');
        s.id = 'asturias-ar-styles';
        s.textContent = `
        @keyframes ast-fade-up  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ast-scale-in { from{opacity:0;transform:scale(0.92)}      to{opacity:1;transform:scale(1)} }
        @keyframes ast-pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(122,184,0,0.4)} 50%{box-shadow:0 0 0 12px rgba(122,184,0,0)} }
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
        .ast-btn {
            display:inline-flex;align-items:center;justify-content:center;gap:8px;
            border:none;cursor:pointer;font-family:${ASTURIAS.fonts.family};
            font-weight:600;letter-spacing:0.3px;transition:all 0.2s ease;
            -webkit-tap-highlight-color:transparent;white-space:nowrap;
        }
        .ast-btn:active{transform:scale(0.97)}
        .ast-btn-primary{background:${ASTURIAS.colors.primary};color:#fff;border-radius:${ASTURIAS.radius.base};padding:14px 28px;font-size:15px;box-shadow:${ASTURIAS.shadow.green}}
        .ast-btn-primary:hover{background:${ASTURIAS.colors.primaryDark};transform:translateY(-2px)}
        .ast-panel{background:${ASTURIAS.colors.glass};backdrop-filter:blur(16px);border-radius:${ASTURIAS.radius.xl};box-shadow:${ASTURIAS.shadow.strong};border:1px solid ${ASTURIAS.colors.border};animation:ast-fade-up 0.35s ease forwards;box-sizing:border-box}
        .ast-overlay-backdrop{position:absolute;inset:0;background:${ASTURIAS.colors.overlay};backdrop-filter:blur(4px);z-index:${ASTURIAS.zIndex.panel};display:flex;align-items:center;justify-content:center;padding:20px;pointer-events:auto}
        .ast-progress-track{width:100%;height:4px;background:rgba(122,184,0,0.25);border-radius:2px;cursor:pointer;position:relative;overflow:hidden}
        .ast-progress-fill{height:100%;background:${ASTURIAS.colors.primary};border-radius:2px;transition:width 0.25s linear;pointer-events:none}
        `;
        document.head.appendChild(s);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HEADER BAR
    // ─────────────────────────────────────────────────────────────────────────

    private _preAudioPanel?: HTMLElement;

    private _buildHeaderBar() {
        const root = this._ensureRoot();
        const bar  = document.createElement('div');
        this._headerBar = bar;
        const title  = this._getTitle();
        const btnSt  = `display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);color:#fff;transition:all 0.15s ease;`;
        const share  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
        const fs     = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
        const closeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        bar.style.cssText = `position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:linear-gradient(to bottom,rgba(0,0,0,0.8),transparent);pointer-events:auto;z-index:${ASTURIAS.zIndex.controls};animation:ast-fade-up 0.3s ease forwards;font-family:${ASTURIAS.fonts.family};`;
        bar.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                <div style="width:32px;height:32px;border-radius:8px;background:${ASTURIAS.colors.primary};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${this._icon('ar')}</div>
                <div style="font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                <button id="ast-hdr-info"       style="${btnSt}">${this._icon('info')}</button>
                <button id="ast-hdr-share"      style="${btnSt}">${share}</button>
                <button id="ast-hdr-fullscreen" style="${btnSt}">${fs}</button>
                <button id="ast-hdr-close"      style="${btnSt}">${closeIcon}</button>
            </div>
        `;
        root.appendChild(bar);
        bar.querySelector('#ast-hdr-info')?.addEventListener('click', () => this._showInfoPanel());
        bar.querySelector('#ast-hdr-share')?.addEventListener('click', async () => {
            try {
                if (navigator.share) await navigator.share({ title, url: this._sceneUrl });
                else await navigator.clipboard.writeText(this._sceneUrl);
            } catch { /* ignore */ }
        });
        bar.querySelector('#ast-hdr-fullscreen')?.addEventListener('click', () => {
            const el = document.querySelector('.ar-fullscreen-container')
                ?? document.querySelector('needle-engine')?.parentElement
                ?? document.documentElement;
            document.fullscreenElement ? document.exitFullscreen() : el?.requestFullscreen?.();
        });
        bar.querySelector('#ast-hdr-close')?.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/xr';
            }
        });
    }

    private _showHeaderBar() { if (this._headerBar) this._headerBar.style.display = 'flex'; }
    private _hideHeaderBar() { if (this._headerBar) this._headerBar.style.display = 'none'; }

    // ─────────────────────────────────────────────────────────────────────────
    // PRE-AR PANEL
    // ─────────────────────────────────────────────────────────────────────────

    private _buildPreARPanel() {
        const root  = this._ensureRoot();
        const panel = document.createElement('div');
        this._prePanel = panel;
        const hasAudio = this._hasAudio();
        panel.style.cssText = `
            position:absolute;left:0;right:0;bottom:0;
            background:linear-gradient(160deg,${ASTURIAS.colors.forest} 0%,#0d2b18 100%);
            border-radius:${ASTURIAS.radius.xl} ${ASTURIAS.radius.xl} 0 0;
            padding:20px 20px max(env(safe-area-inset-bottom,16px),20px);
            pointer-events:auto;z-index:${ASTURIAS.zIndex.panel};
            animation:ast-fade-up 0.4s ease forwards;
            box-shadow:0 -8px 40px rgba(0,0,0,0.5);box-sizing:border-box;
            font-family:${ASTURIAS.fonts.family};
        `;
        const title = this._getTitle();
        const secondaryBtnSt = `background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:${ASTURIAS.radius.base};padding:clamp(10px,2.5vw,14px);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:clamp(10px,2.5vw,13px);font-weight:600;gap:5px;font-family:${ASTURIAS.fonts.family};flex-shrink:0;`;
        panel.innerHTML = `
            <div style="margin-bottom:clamp(10px,2.5vw,16px);">
                <div style="font-size:clamp(9px,2vw,11px);font-weight:700;color:${ASTURIAS.colors.primary};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px;">Asturias AR</div>
                <div style="font-size:clamp(13px,3.5vw,17px);font-weight:700;color:#fff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
            </div>
            <div style="display:flex;gap:clamp(6px,2vw,10px);align-items:stretch;">
                ${this._isDesktop
                    ? `<button id="ast-show-qr-btn" class="ast-btn" style="flex:1;gap:6px;background:${ASTURIAS.colors.primary};color:#fff;border-radius:${ASTURIAS.radius.base};padding:clamp(10px,2.5vw,14px) clamp(10px,3vw,16px);font-size:clamp(11px,2.8vw,14px);font-weight:700;justify-content:center;box-shadow:0 4px 20px rgba(122,184,0,0.4);">${this._icon('qr')} ${t('qrTitle', this._lang)}</button>`
                    : `<button id="ast-start-ar-btn" class="ast-btn" style="flex:1;gap:6px;background:${ASTURIAS.colors.primary};color:#fff;border-radius:${ASTURIAS.radius.base};padding:clamp(10px,2.5vw,14px) clamp(10px,3vw,16px);font-size:clamp(11px,2.8vw,14px);font-weight:700;justify-content:center;box-shadow:0 4px 20px rgba(122,184,0,0.4);">${this._icon('ar')} ${t('startAR', this._lang)}</button>`
                }
                ${hasAudio ? `<button id="ast-pre-audio-btn" style="${secondaryBtnSt}" title="${t('audioGuide', this._lang)}">${this._icon('headphones')}</button>` : ''}
                <button id="ast-lang-btn" style="${secondaryBtnSt}">
                    ${this._icon('lang')} ${this._lang.toUpperCase()}
                </button>
            </div>
            ${hasAudio ? `<div id="ast-pre-audio-player" style="display:none;margin-top:clamp(10px,2.5vw,14px);"></div>` : ''}
        `;
        root.appendChild(panel);
        panel.querySelector('#ast-start-ar-btn')?.addEventListener('click', () => this._startAR());
        panel.querySelector('#ast-show-qr-btn')?.addEventListener('click', () => this._showQRPanel());
        panel.querySelector('#ast-lang-btn')?.addEventListener('click',    () => this._showLangPanel());

        // Audio guide in bottom panel
        if (hasAudio) {
            panel.querySelector('#ast-pre-audio-btn')?.addEventListener('click', () => this._togglePreAudio());
            this._buildPreAudioPlayer(panel.querySelector('#ast-pre-audio-player') as HTMLElement);
        }
    }

    /** Inline audio player inside the pre-AR bottom panel */
    private _buildPreAudioPlayer(container: HTMLElement) {
        if (!container) return;
        this._preAudioPanel = container;
        const playBtnSt = `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(122,184,0,0.5);cursor:pointer;background:rgba(122,184,0,0.15);color:${ASTURIAS.colors.primary};transition:all 0.15s ease;flex-shrink:0;`;
        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                    background:rgba(122,184,0,0.2);border:1px solid rgba(122,184,0,0.4);
                    display:flex;align-items:center;justify-content:center;color:${ASTURIAS.colors.primary};">
                    ${this._icon('headphones')}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:9px;font-weight:700;color:${ASTURIAS.colors.primary};text-transform:uppercase;letter-spacing:0.8px;">
                        ${t('audioGuide', this._lang)}
                    </div>
                </div>
                <button id="ast-pre-audio-play" style="${playBtnSt}">
                    ${this._icon('play')}
                </button>
                <button id="ast-pre-audio-close" style="background:transparent;border:none;padding:4px;flex-shrink:0;color:rgba(255,255,255,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;">
                    ${this._icon('close')}
                </button>
            </div>
            <div id="ast-pre-progress-track" class="ast-progress-track">
                <div id="ast-pre-progress-fill" class="ast-progress-fill" style="width:0%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:3px;">
                <span id="ast-pre-time-cur" style="font-size:10px;color:rgba(255,255,255,0.4);">0:00</span>
                <span id="ast-pre-time-tot" style="font-size:10px;color:rgba(255,255,255,0.4);">0:00</span>
            </div>
        `;
        container.querySelector('#ast-pre-audio-play')?.addEventListener('click', () => {
            const url = this._getAudioUrl();
            if (!url) return;
            if (this._audio.isPlaying) {
                this._audio.pause();
                this._updatePreAudioUI(false);
            } else {
                this._audio.play(url);
                this._updatePreAudioUI(true);
            }
        });
        container.querySelector('#ast-pre-audio-close')?.addEventListener('click', () => {
            this._audio.stop();
            this._updatePreAudioUI(false);
            container.style.display = 'none';
            const btn = this._prePanel?.querySelector('#ast-pre-audio-btn') as HTMLElement | null;
            if (btn) btn.style.background = 'rgba(255,255,255,0.12)';
        });
        container.querySelector('#ast-pre-progress-track')?.addEventListener('click', (evt) => {
            const track = evt.currentTarget as HTMLElement;
            const rect  = track.getBoundingClientRect();
            const ratio = ((evt as MouseEvent).clientX - rect.left) / rect.width;
            this._audio.seek(ratio * this._audio.duration);
        });
        this._audio.onProgress = (current, duration) => {
            const fill = container.querySelector('#ast-pre-progress-fill') as HTMLElement | null;
            const cur  = container.querySelector('#ast-pre-time-cur') as HTMLElement | null;
            const tot  = container.querySelector('#ast-pre-time-tot') as HTMLElement | null;
            if (fill && duration > 0) fill.style.width = `${(current / duration) * 100}%`;
            if (cur) cur.textContent = this._fmtTime(current);
            if (tot) tot.textContent = this._fmtTime(duration);
        };
        this._audio.onEnded = () => {
            this._updatePreAudioUI(false);
            const fill = container.querySelector('#ast-pre-progress-fill') as HTMLElement | null;
            if (fill) fill.style.width = '0%';
        };
    }

    private _togglePreAudio() {
        const panel = this._preAudioPanel;
        if (!panel) return;
        const open = panel.style.display !== 'block';
        panel.style.display = open ? 'block' : 'none';
        const btn = this._prePanel?.querySelector('#ast-pre-audio-btn') as HTMLElement | null;
        if (btn) btn.style.background = open ? 'rgba(122,184,0,0.25)' : 'rgba(255,255,255,0.12)';
    }

    private _updatePreAudioUI(playing: boolean) {
        const playBtn = this._preAudioPanel?.querySelector('#ast-pre-audio-play') as HTMLElement | null;
        if (playBtn) playBtn.innerHTML = playing ? this._icon('pause') : this._icon('play');
    }

    private _showPrePanel() { if (this._prePanel) this._prePanel.style.display = 'block'; }
    private _hidePrePanel() { if (this._prePanel) this._prePanel.style.display = 'none'; }

    // ─────────────────────────────────────────────────────────────────────────
    // IN-AR CONTROLS HUD
    // _buildARControls is called from onXRSessionStart, at which point
    // _sceneInfo is guaranteed to be loaded (fetchSceneInfo runs in start()
    // before the XR hooks are registered), so _hasAudio() is reliable here.
    // ─────────────────────────────────────────────────────────────────────────

    private _buildARControls() {
        const root     = this._ensureRoot();
        const hasAudio = this._hasAudio();

        const btnBase = `
            display:inline-flex;align-items:center;justify-content:center;
            width:48px;height:48px;border-radius:${ASTURIAS.radius.full};
            border:1.5px solid rgba(122,184,0,0.5);cursor:pointer;transition:all 0.15s ease;
            background:rgba(122,184,0,0.15);color:${ASTURIAS.colors.primary};
        `;

        // Outer wrapper — column, centres children
        const hud = document.createElement('div');
        this._arControls = hud;
        hud.style.cssText = `
            position:absolute;bottom:max(env(safe-area-inset-bottom,16px),24px);
            left:0;right:0;
            display:flex;flex-direction:column;align-items:center;gap:10px;
            pointer-events:none;z-index:${ASTURIAS.zIndex.controls};
            animation:ast-fade-up 0.4s ease forwards;font-family:${ASTURIAS.fonts.family};
        `;

        // ── Audio player card (above the pill) ─────────────────────────────
        if (hasAudio) {
            const audioBar = document.createElement('div');
            audioBar.id = 'ast-audio-bar';
            // Initially hidden; _toggleAudioPanel() sets display:flex + flex-direction:column
            audioBar.style.cssText = `
                display:none;
                pointer-events:auto;
                background:linear-gradient(160deg,${ASTURIAS.colors.forest} 0%,#0d2b18 100%);
                border:1.5px solid rgba(122,184,0,0.35);border-radius:${ASTURIAS.radius.lg};
                padding:12px 16px;width:min(320px,85vw);box-sizing:border-box;
                box-shadow:0 8px 32px rgba(0,0,0,0.5);
            `;
            audioBar.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;flex-shrink:0;
                        background:rgba(122,184,0,0.2);border:1.5px solid rgba(122,184,0,0.5);
                        display:flex;align-items:center;justify-content:center;color:${ASTURIAS.colors.primary};">
                        ${this._icon('headphones')}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:11px;font-weight:700;color:${ASTURIAS.colors.primary};text-transform:uppercase;letter-spacing:1px;">
                            ${t('audioGuide', this._lang)}
                        </div>
                        <div style="font-size:12px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${this._getTitle()}
                        </div>
                    </div>
                    <button id="ast-audio-playpause" style="${btnBase}width:40px;height:40px;flex-shrink:0;">
                        ${this._icon('play')}
                    </button>
                    <button id="ast-audio-close" style="background:transparent;border:none;padding:4px;flex-shrink:0;color:rgba(255,255,255,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;">
                        ${this._icon('close')}
                    </button>
                </div>
                <div id="ast-progress-track" class="ast-progress-track">
                    <div id="ast-progress-fill" class="ast-progress-fill" style="width:0%"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:4px;">
                    <span id="ast-time-current" style="font-size:10px;color:rgba(255,255,255,0.4);">0:00</span>
                    <span id="ast-time-total"   style="font-size:10px;color:rgba(255,255,255,0.4);">0:00</span>
                </div>
            `;
            hud.appendChild(audioBar);
            this._audioPanel = audioBar;

            audioBar.querySelector('#ast-audio-playpause')?.addEventListener('click', () => this._toggleAudioPlayback());
            audioBar.querySelector('#ast-audio-close')?.addEventListener('click', () => {
                this._audio.stop();
                this._updateAudioUI(false);
                audioBar.style.display = 'none';
                // reset pill button highlight
                const ab = this._arControls?.querySelector('#ast-ar-audio') as HTMLElement | null;
                if (ab) ab.style.background = 'rgba(122,184,0,0.15)';
            });
            audioBar.querySelector('#ast-progress-track')?.addEventListener('click', (evt) => {
                const track = evt.currentTarget as HTMLElement;
                const rect  = track.getBoundingClientRect();
                const ratio = ((evt as MouseEvent).clientX - rect.left) / rect.width;
                this._audio.seek(ratio * this._audio.duration);
            });

            this._audio.onProgress = (current, duration) => {
                const fill = audioBar.querySelector('#ast-progress-fill') as HTMLElement | null;
                const cur  = audioBar.querySelector('#ast-time-current') as HTMLElement | null;
                const tot  = audioBar.querySelector('#ast-time-total')   as HTMLElement | null;
                if (fill && duration > 0) fill.style.width = `${(current / duration) * 100}%`;
                if (cur) cur.textContent = this._fmtTime(current);
                if (tot) tot.textContent = this._fmtTime(duration);
            };
            this._audio.onEnded = () => {
                this._updateAudioUI(false);
                const fill = audioBar.querySelector('#ast-progress-fill') as HTMLElement | null;
                const cur  = audioBar.querySelector('#ast-time-current') as HTMLElement | null;
                if (fill) fill.style.width = '0%';
                if (cur)  cur.textContent  = '0:00';
            };
        }

        // ── Main pill ───────────────────────────────────────────────────────
        const pill = document.createElement('div');
        pill.style.cssText = `
            display:inline-flex;align-items:center;gap:10px;pointer-events:auto;
            background:linear-gradient(160deg,${ASTURIAS.colors.forest} 0%,#0d2b18 100%);
            border-radius:${ASTURIAS.radius.full};padding:10px 16px;
            border:1.5px solid rgba(122,184,0,0.35);
            box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(122,184,0,0.1);
        `;
        pill.innerHTML = `
            <button id="ast-ar-info"  title="${t('info', this._lang)}"       style="${btnBase}">${this._icon('info')}</button>
            ${hasAudio ? `<button id="ast-ar-audio" title="${t('audioGuide', this._lang)}" style="${btnBase}">${this._icon('headphones')}</button>` : ''}
            <button id="ast-ar-lang"  title="${t('language', this._lang)}"   style="${btnBase};font-size:11px;font-weight:700;">${this._lang.toUpperCase()}</button>
            <div style="width:1px;height:28px;background:rgba(122,184,0,0.3);"></div>
            <button id="ast-ar-close" title="${t('stopAR', this._lang)}"     style="${btnBase};background:rgba(192,57,43,0.85);border-color:rgba(255,80,60,0.5);color:#fff;">${this._icon('close')}</button>
        `;
        hud.appendChild(pill);
        root.appendChild(hud);

        pill.querySelector('#ast-ar-info')?.addEventListener('click',  () => this._showInfoPanel());
        pill.querySelector('#ast-ar-lang')?.addEventListener('click',  () => this._showLangPanel());
        pill.querySelector('#ast-ar-close')?.addEventListener('click', () => this._stopAR());
        pill.querySelector('#ast-ar-audio')?.addEventListener('click', () => this._toggleAudioPanel());
    }

    private _removeARControls() {
        this._audio.stop();
        this._audioPanel = undefined;
        this._arControls?.remove();
        this._arControls = undefined;
    }

    // ── Audio helpers ───────────────────────────────────────────────────────

    private _toggleAudioPanel() {
        const bar = this._audioPanel;
        if (!bar) return;
        const open = bar.style.display !== 'flex';
        bar.style.display       = open ? 'flex'   : 'none';
        bar.style.flexDirection = open ? 'column' : '';
        const btn = this._arControls?.querySelector('#ast-ar-audio') as HTMLElement | null;
        if (btn) btn.style.background = open ? 'rgba(122,184,0,0.45)' : 'rgba(122,184,0,0.15)';
    }

    private _toggleAudioPlayback() {
        const url = this._getAudioUrl();
        if (!url) return;
        if (this._audio.isPlaying) {
            this._audio.pause();          // pause — keeps position
            this._updateAudioUI(false);
        } else {
            this._audio.play(url);        // resumes from same position if url unchanged
            this._updateAudioUI(true);
        }
    }

    private _updateAudioUI(playing: boolean) {
        const playBtn  = this._audioPanel?.querySelector('#ast-audio-playpause') as HTMLElement | null;
        const audioBtn = this._arControls?.querySelector('#ast-ar-audio')        as HTMLElement | null;
        if (playBtn)  playBtn.innerHTML        = playing ? this._icon('pause') : this._icon('play');
        if (audioBtn) audioBtn.style.background = playing ? 'rgba(122,184,0,0.45)' : 'rgba(122,184,0,0.15)';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUBTITLE
    // ─────────────────────────────────────────────────────────────────────────

    private _showSubtitle(text: string) {
        this._hideSubtitle();
        const bar = document.createElement('div');
        this._subtitleBar = bar;
        bar.style.cssText = `
            position:absolute;left:50%;bottom:140px;transform:translateX(-50%);
            width:min(85vw,600px);background:rgba(0,0,0,0.85);color:#fff;
            font-family:${ASTURIAS.fonts.family};font-size:15px;font-weight:500;
            line-height:1.5;text-align:center;border-radius:${ASTURIAS.radius.base};
            padding:14px 18px;pointer-events:none;z-index:${ASTURIAS.zIndex.controls + 10};
        `;
        bar.textContent = text;
        this._ensureRoot().appendChild(bar);
    }

    private _hideSubtitle() { this._subtitleBar?.remove(); this._subtitleBar = undefined; }

    // ─────────────────────────────────────────────────────────────────────────
    // QR PANEL
    // ─────────────────────────────────────────────────────────────────────────

    private _showQRPanel() {
        this._removeAllPopups();
        const backdrop = document.createElement('div');
        backdrop.className = 'ast-overlay-backdrop';
        this._qrPanel = backdrop;
        const card = document.createElement('div');
        card.className = 'ast-panel';
        card.style.cssText = 'width:min(320px,90vw);padding:24px;pointer-events:auto;text-align:center;';
        card.innerHTML = `
            <div style="font-size:11px;font-weight:700;color:${ASTURIAS.colors.primary};text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px;">${t('qrTitle', this._lang)}</div>
            <div id="ast-qr-container" style="display:flex;justify-content:center;margin-bottom:16px;"></div>
            <button id="ast-qr-close" class="ast-btn" style="width:100%;justify-content:center;background:transparent;border:1px solid ${ASTURIAS.colors.border};color:${ASTURIAS.colors.dark};font-size:13px;padding:10px;border-radius:${ASTURIAS.radius.base};">✕ ${t('close', this._lang)}</button>
        `;
        backdrop.appendChild(card);
        this._getContainer().appendChild(backdrop);
        const container = card.querySelector('#ast-qr-container') as HTMLElement;
        const canvas    = document.createElement('canvas');
        canvas.style.cssText = 'display:block;width:200px;height:200px;border-radius:8px;';
        container.appendChild(canvas);
        QRCode.toCanvas(canvas, this._getAppClipUrl(), {
            width: 200, margin: 2,
            color: { dark: ASTURIAS.colors.dark, light: ASTURIAS.colors.white },
        }).catch(() => { container.textContent = '⚠️ QR unavailable'; });
        backdrop.addEventListener('click', (evt) => { if (evt.target === backdrop) this._removeAllPopups(); });
        card.querySelector('#ast-qr-close')?.addEventListener('click', () => this._removeAllPopups());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INFO PANEL
    // ─────────────────────────────────────────────────────────────────────────

    private _showInfoPanel() {
        this._removeAllPopups();
        const backdrop = document.createElement('div');
        backdrop.className = 'ast-overlay-backdrop';
        this._infoPanel = backdrop;
        const card = document.createElement('div');
        card.className = 'ast-panel';
        card.style.cssText = 'width:min(480px,90vw);max-height:80vh;overflow-y:auto;padding:24px;pointer-events:auto;';
        const title = this._getTitle();
        const desc  = this._getDescription();
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                    <div style="font-size:10px;font-weight:700;color:${ASTURIAS.colors.primary};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Asturias AR</div>
                    <h2 style="margin:0;font-size:20px;font-weight:800;color:${ASTURIAS.colors.dark};">${title}</h2>
                </div>
                <button id="ast-info-close" class="ast-btn" style="background:${ASTURIAS.colors.cream};border-radius:${ASTURIAS.radius.full};width:36px;height:36px;color:${ASTURIAS.colors.dark};font-size:16px;flex-shrink:0;margin-left:12px;">✕</button>
            </div>
            ${desc ? `<p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">${desc}</p>` : ''}
            <div style="background:linear-gradient(135deg,${ASTURIAS.colors.primary}15 0%,${ASTURIAS.colors.accent}15 100%);border-radius:${ASTURIAS.radius.base};padding:14px;border-left:3px solid ${ASTURIAS.colors.primary};">
                <div style="font-size:12px;font-weight:700;color:${ASTURIAS.colors.primary};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${t('scanInstructions', this._lang)}</div>
                <ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.8;">
                    <li>Permite el acceso a la cámara</li>
                    <li>Apunta hacia una superficie plana</li>
                    <li>Toca la pantalla para colocar el modelo</li>
                </ol>
            </div>
        `;
        backdrop.appendChild(card);
        this._ensureRoot().appendChild(backdrop);
        backdrop.addEventListener('click', (evt) => { if (evt.target === backdrop) this._removeAllPopups(); });
        card.querySelector('#ast-info-close')?.addEventListener('click', () => this._removeAllPopups());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LANGUAGE PANEL
    // ─────────────────────────────────────────────────────────────────────────

    private _showLangPanel() {
        this._removeAllPopups();
        const backdrop = document.createElement('div');
        backdrop.className = 'ast-overlay-backdrop';
        this._langPanel = backdrop;
        const card = document.createElement('div');
        card.className = 'ast-panel';
        card.style.cssText = 'width:280px;padding:20px;pointer-events:auto;';
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="margin:0;font-size:16px;font-weight:700;color:${ASTURIAS.colors.dark};display:flex;align-items:center;gap:8px;">${this._icon('lang')} ${t('language', this._lang)}</h3>
                <button id="ast-lang-close" style="background:${ASTURIAS.colors.cream};border:none;border-radius:${ASTURIAS.radius.full};width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:${ASTURIAS.colors.dark};cursor:pointer;">${this._icon('close')}</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${LANGUAGES.map(l => `
                    <button class="ast-btn ast-lang-option" data-lang="${l.code}" style="justify-content:flex-start;padding:12px 16px;border-radius:${ASTURIAS.radius.base};font-size:14px;background:${this._lang === l.code ? ASTURIAS.colors.primary + '15' : ASTURIAS.colors.cream};border:2px solid ${this._lang === l.code ? ASTURIAS.colors.primary : 'transparent'};color:${this._lang === l.code ? ASTURIAS.colors.primary : ASTURIAS.colors.dark};font-weight:${this._lang === l.code ? '700' : '500'};">
                        ${this._lang === l.code ? '✓ ' : ''}${l.label}
                    </button>
                `).join('')}
            </div>
        `;
        backdrop.appendChild(card);
        this._ensureRoot().appendChild(backdrop);
        backdrop.addEventListener('click', (evt) => { if (evt.target === backdrop) this._removeAllPopups(); });
        card.querySelector('#ast-lang-close')?.addEventListener('click', () => this._removeAllPopups());
        card.querySelectorAll('.ast-lang-option').forEach(btn => {
            btn.addEventListener('click', (evt) => {
                const code = (evt.currentTarget as HTMLElement).dataset['lang'] ?? 'es';
                this._lang = code;
                this._removeAllPopups();
                this._audio.stop();
                this._updateAudioUI(false);
                this._hideSubtitle();
                const lb = this._prePanel?.querySelector('#ast-lang-btn') as HTMLElement | null;
                if (lb) lb.innerHTML = `${this._icon('lang')} ${this._lang.toUpperCase()}`;
                const al = this._arControls?.querySelector('#ast-ar-lang') as HTMLElement | null;
                if (al) al.textContent = this._lang.toUpperCase();
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────

    private _removeAllPopups() {
        this._infoPanel?.remove(); this._infoPanel = undefined;
        this._langPanel?.remove(); this._langPanel = undefined;
        this._qrPanel?.remove();   this._qrPanel   = undefined;
    }
}