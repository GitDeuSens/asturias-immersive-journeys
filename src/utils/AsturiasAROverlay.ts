import {
    Behaviour,
    WebXRButtonFactory,
    generateQRCode,
    onXRSessionStart,
    onXRSessionEnd,
    XRStateFlag,
} from "@needle-tools/engine";
import { DeviceUtilities } from "@needle-tools/engine";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SceneInfo {
    id: string;
    slug: string;
    title: Record<string, string>;
    description?: Record<string, string>;
    glb_model?: string;
    audio_es?: string;
    audio_en?: string;
    audio_fr?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASTURIAS DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const ASTURIAS = {
    colors: {
        primary:        '#7AB800',
        primaryDark:    '#5c8a00',
        accent:         '#0066A1',
        warm:           '#FFD100',
        dark:           '#1a2633',
        forest:         '#1d4a27',
        stone:          '#8a7460',
        cream:          '#faf8f2',
        white:          '#ffffff',
        black:          '#000000',
        overlay:        'rgba(0,0,0,0.55)',
        glass:          'rgba(255,255,255,0.95)',
        glassDark:      'rgba(20,35,25,0.92)',
        border:         'rgba(122,184,0,0.25)',
        borderStrong:   'rgba(122,184,0,0.6)',
        textMuted:      '#6b7a6e',
        danger:         '#c0392b',
    },
    fonts: {
        family: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    radius: {
        sm:   '8px',
        md:   '10px',
        base: '12px',
        lg:   '16px',
        xl:   '20px',
        full: '999px',
    },
    shadow: {
        soft:   '0 4px 20px rgba(0,0,0,0.08)',
        medium: '0 8px 30px rgba(0,0,0,0.12)',
        strong: '0 15px 50px rgba(0,0,0,0.20)',
        green:  '0 10px 40px rgba(122,184,0,0.25)',
    },
    zIndex: {
        overlay:  9000,
        panel:    9100,
        controls: 9200,
        qr:       9300,
        toast:    9400,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────────────────────────────────────

const T: Record<string, Record<string, string>> = {
    startAR: { es: 'Iniciar Experiencia AR', en: 'Start AR Experience', fr: 'Démarrer l\'AR' },
    stopAR:  { es: 'Salir de AR',            en: 'Exit AR',             fr: 'Quitter AR' },
    info:    { es: 'Información',            en: 'Information',         fr: 'Informations' },
    close:   { es: 'Cerrar',                 en: 'Close',               fr: 'Fermer' },
    qrTitle: { es: 'Escanea para AR',        en: 'Scan for AR',         fr: 'Scanner pour AR' },
    qrDesc:  {
        es: 'Apunta la cámara de tu móvil a este código para abrir la experiencia de Realidad Aumentada.',
        en: 'Point your phone camera at this code to open the Augmented Reality experience.',
        fr: 'Pointez la caméra de votre téléphone sur ce code pour ouvrir l\'expérience AR.',
    },
    vrTitle: { es: 'Abrir en VR',            en: 'Open in VR',          fr: 'Ouvrir en VR' },
    audioGuide: { es: 'Audioguía',           en: 'Audio Guide',         fr: 'Audioguide' },
    language:   { es: 'Idioma',              en: 'Language',            fr: 'Langue' },
    scanInstructions: {
        es: 'Apunta hacia una superficie plana y toca para colocar',
        en: 'Point at a flat surface and tap to place',
        fr: 'Pointez une surface plane et touchez pour placer',
    },
    loading: { es: 'Cargando...', en: 'Loading...', fr: 'Chargement...' },
};

const LANGUAGES = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
];

function t(key: string, lang: string): string {
    return T[key]?.[lang] ?? T[key]?.['es'] ?? key;
}

/** Escape user/CMS-provided strings before inserting into innerHTML to prevent XSS */
function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTUS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getDirectusUrl(): string {
    // Try to read from window (set by React app) or fallback
    return (window as any).__DIRECTUS_URL
        ?? (window as any).VITE_DIRECTUS_URL
        ?? 'https://back.asturias.digitalmetaverso.com';
}

function getAssetUrl(uuid: string): string {
    return `${getDirectusUrl()}/assets/${uuid}`;
}

async function fetchSceneInfo(slug: string): Promise<SceneInfo | null> {
    try {
        const base = getDirectusUrl();
        const url = `${base}/items/ar_scenes`
            + `?filter[slug][_eq]=${encodeURIComponent(slug)}`
            + `&fields=id,slug,title,description,glb_model,audio_es,audio_en,audio_fr`
            + `&limit=1`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const json = await res.json();
        return (json.data?.[0] as SceneInfo) ?? null;
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO PLAYER
// ─────────────────────────────────────────────────────────────────────────────

class InlineAudioPlayer {
    private audio?: HTMLAudioElement;
    private _playing = false;

    get isPlaying() { return this._playing; }

    play(url: string, volume = 1) {
        this.stop();
        this.audio = new Audio(url);
        this.audio.volume = volume;
        this.audio.addEventListener('ended', () => { this._playing = false; });
        this.audio.play().then(() => { this._playing = true; }).catch(() => {});
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.removeAttribute('src');
            this.audio.load();
            this.audio = undefined;
        }
        this._playing = false;
    }

    toggle(url: string) {
        if (this._playing) { this.stop(); } else { this.play(url); }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export class AsturiasAROverlay extends Behaviour {
    constructor() {
        super();
        console.log('[Overlay] CONSTRUCTOR called');
  }
    // ── Internal state ─────────────────────────────────────────────────────
    private _lang:     string = 'es';
    private _isAR:     boolean = false;
    private _isDesktop: boolean = false;
    private _sceneInfo: SceneInfo | null = null;
    private _slug:     string = '';
    private _arUrl:    string = '';

    // ── DOM references ─────────────────────────────────────────────────────
    private _root?:         HTMLElement;   // shadow host / fixed container
    private _prePanel?:     HTMLElement;   // pre-AR panel (mobile)
    private _arControls?:   HTMLElement;   // in-AR HUD
    private _desktopPanel?: HTMLElement;   // desktop QR + info panel
    private _qrPanel?:      HTMLElement;   // QR popup
    private _infoPanel?:    HTMLElement;   // info popup
    private _langPanel?:    HTMLElement;   // language picker
    private _subtitleBar?:  HTMLElement;   // audio subtitle bar
    private _resizeHandler?: () => void;

    private _audio = new InlineAudioPlayer();
    private _xrStartHandler?: () => void;
    private _xrEndHandler?:   () => void;

    // ─────────────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────

   awake() {
    console.log('[Overlay] awake() called');
    this._detectLanguage();
    this._detectSlug();
    this._isDesktop = DeviceUtilities.isDesktop();
    console.log('[Overlay] isDesktop:', this._isDesktop, 'slug:', this._slug, 'lang:', this._lang);
    this._loadGoogleFont();
    this._injectGlobalStyles();
    this._ensureRoot();
    console.log('[Overlay] awake() done');
}

async start() {
    console.log('[Overlay] start() called');
    if (this._slug) {
        this._sceneInfo = await fetchSceneInfo(this._slug);
        console.log('[Overlay] sceneInfo:', this._sceneInfo);
    }
    this._arUrl = window.location.href;
    console.log('[Overlay] arUrl:', this._arUrl);
    if (this._isDesktop) {
        console.log('[Overlay] building DESKTOP panel');
        this._buildDesktopPanel();
    } else {
        console.log('[Overlay] building PRE-AR panel');
        this._buildPreARPanel();
    }

        // XR event hooks
        this._xrStartHandler = () => {
            this._isAR = true;
            this._hidePrePanel();
            this._hideDesktopPanel();
            this._buildARControls();
        };
        this._xrEndHandler = () => {
            this._isAR = false;
            this._removeARControls();
            if (this._isDesktop) { this._showDesktopPanel(); }
            else { this._showPrePanel(); }
            this._audio.stop();
            this._hideSubtitle();
        };

        onXRSessionStart(this._xrStartHandler);
        onXRSessionEnd(this._xrEndHandler);
    }

    onDestroy() {
        this._audio.stop();
        this._root?.remove();
        if (this._xrStartHandler) {
            try { (window as any).offXRSessionStart?.(this._xrStartHandler); } catch {}
        }
        if (this._xrEndHandler) {
            try { (window as any).offXRSessionEnd?.(this._xrEndHandler); } catch {}
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private _detectLanguage() {
        const p = new URLSearchParams(window.location.search);
        const l = p.get('lang')?.toLowerCase();
        if (l && LANGUAGES.some(x => x.code === l)) { this._lang = l; return; }
        const b = navigator.language.split('-')[0].toLowerCase();
        if (LANGUAGES.some(x => x.code === b)) { this._lang = b; }
    }

    private _detectSlug() {
        // /ar/{slug}
        const parts = window.location.pathname.split('/');
        const idx = parts.indexOf('ar');
        this._slug = idx >= 0 ? (parts[idx + 1] ?? '') : '';
        if (!this._slug) {
            const p = new URLSearchParams(window.location.search);
            this._slug = p.get('slug') ?? '';
        }
    }

    private _loadGoogleFont() {
        if (document.getElementById('montserrat-font')) return;
        const link = document.createElement('link');
        link.id   = 'montserrat-font';
        link.rel  = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap';
        document.head.appendChild(link);
    }

    private _getContainer(): HTMLElement {
        return (document.querySelector(':xr-overlay') as HTMLElement)
            ?? (document.querySelector('needle-engine') as HTMLElement)
            ?? document.body;
    }

    private _ensureRoot() {
        if (!this._root) {
            const slot = document.getElementById('needle-overlay-slot') ?? document.body;
            this._root = document.createElement('div');
            this._root.id = 'asturias-ar-root';
            this._root.style.cssText = `
                position: fixed; inset: 0; pointer-events: none;
                z-index: ${ASTURIAS.zIndex.overlay};
                font-family: ${ASTURIAS.fonts.family};
            `;
            slot.appendChild(this._root);
        }
        return this._root;
    }

    private _getTitle(): string {
        if (!this._sceneInfo) return escapeHtml(this._slug);
        const t = this._sceneInfo.title;
        if (typeof t === 'string') return escapeHtml(t);
        return escapeHtml(t?.[this._lang] ?? t?.['es'] ?? this._slug);
    }

    private _getDescription(): string {
        const d = this._sceneInfo?.description;
        if (!d) return '';
        if (typeof d === 'string') return escapeHtml(d);
        return escapeHtml(d?.[this._lang] ?? d?.['es'] ?? '');
    }

    private _hasAudio(): boolean {
        if (!this._sceneInfo) return false;
        return !!(this._sceneInfo.audio_es || this._sceneInfo.audio_en || this._sceneInfo.audio_fr);
    }

    private _getAudioUrl(): string | null {
        const s = this._sceneInfo;
        if (!s) return null;
        const map: Record<string, string | undefined> = {
            es: s.audio_es, en: s.audio_en, fr: s.audio_fr,
        };
        const id = map[this._lang] ?? s.audio_es ?? s.audio_en ?? s.audio_fr;
        return id ? getAssetUrl(id) : null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRIGGER AR (reuse Needle's button)
    // ─────────────────────────────────────────────────────────────────────────

    private async _startAR() {
        try {
            const factory = WebXRButtonFactory.getOrCreate();
            if (factory.arButton) {
                factory.arButton.click();
            } else {
                const btn = document.querySelector('[ar-button]') as HTMLElement;
                btn?.click();
            }
        } catch (e) {
            console.error('[AsturiasAROverlay] Start AR failed', e);
        }
    }

    private async _startVR() {
        try {
            const factory = WebXRButtonFactory.getOrCreate();
            if ((factory as any).vrButton) {
                (factory as any).vrButton.click();
            } else {
                const btn = document.querySelector('[vr-button]') as HTMLElement;
                btn?.click();
            }
        } catch (e) {
            console.error('[AsturiasAROverlay] Start VR failed', e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GLOBAL STYLES
    // ─────────────────────────────────────────────────────────────────────────

    private _injectGlobalStyles() {
        const id = 'asturias-ar-styles';
        if (document.getElementById(id)) return;
        const s = document.createElement('style');
        s.id = id;
        s.textContent = `
        @keyframes ast-fade-up {
            from { opacity:0; transform:translateY(16px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ast-scale-in {
            from { opacity:0; transform:scale(0.92); }
            to   { opacity:1; transform:scale(1); }
        }
        @keyframes ast-pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(122,184,0,0.4); }
            50%      { box-shadow: 0 0 0 12px rgba(122,184,0,0); }
        }
        @keyframes ast-spin {
            to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; transition: none !important; }
        }
        .ast-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            border: none; cursor: pointer; font-family: ${ASTURIAS.fonts.family};
            font-weight: 600; letter-spacing: 0.3px; transition: all 0.2s ease;
            -webkit-tap-highlight-color: transparent; white-space: nowrap;
        }
        .ast-btn:active { transform: scale(0.97); }
        .ast-btn-primary {
            background: ${ASTURIAS.colors.primary};
            color: ${ASTURIAS.colors.white};
            border-radius: ${ASTURIAS.radius.base};
            padding: 14px 28px; font-size: 15px;
            box-shadow: ${ASTURIAS.shadow.green};
        }
        .ast-btn-primary:hover { background: ${ASTURIAS.colors.primaryDark}; transform: translateY(-2px); }
        .ast-btn-ghost {
            background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
            color: ${ASTURIAS.colors.white}; border-radius: ${ASTURIAS.radius.base};
            padding: 10px 18px; font-size: 13px; border: 1px solid rgba(255,255,255,0.3);
        }
        .ast-btn-ghost:hover { background: rgba(255,255,255,0.25); }
        .ast-btn-icon {
            background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
            color: ${ASTURIAS.colors.white}; border-radius: ${ASTURIAS.radius.full};
            width: 44px; height: 44px; font-size: 18px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .ast-btn-icon:hover { background: rgba(255,255,255,0.3); }
        .ast-btn-danger {
            background: ${ASTURIAS.colors.danger};
            color: ${ASTURIAS.colors.white};
        }
        .ast-panel {
            background: ${ASTURIAS.colors.glass}; backdrop-filter: blur(16px);
            border-radius: ${ASTURIAS.radius.xl}; box-shadow: ${ASTURIAS.shadow.strong};
            border: 1px solid ${ASTURIAS.colors.border};
            animation: ast-fade-up 0.35s ease forwards;
        }
        .ast-overlay-backdrop {
            position: fixed; inset: 0; background: ${ASTURIAS.colors.overlay};
            backdrop-filter: blur(4px); z-index: ${ASTURIAS.zIndex.panel};
            display: flex; align-items: center; justify-content: center;
            padding: 20px; pointer-events: auto;
        }
        `;
        document.head.appendChild(s);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ICONS HELPER
    // ─────────────────────────────────────────────────────────────────────────

    private _icon(name: string): string {
        const icons: Record<string, string> = {
            ar:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
            qr:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="18" y="18" width="3" height="3"/></svg>`,
            info:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
            close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
            lang:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
            audio: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
            stop:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
        };
        return icons[name] ?? '';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRE-AR PANEL (mobile, before entering AR)
    // ─────────────────────────────────────────────────────────────────────────

    private _buildPreARPanel() {
        const panel = document.createElement('div');
        this._prePanel = panel;
        panel.style.cssText = `
            position: fixed; bottom: 0;
            background: linear-gradient(160deg, ${ASTURIAS.colors.forest} 0%, #0d2b18 100%);
            border-radius: ${ASTURIAS.radius.xl} ${ASTURIAS.radius.xl} 0 0;
            padding: 20px 20px max(env(safe-area-inset-bottom, 16px), 20px);
            pointer-events: auto; z-index: ${ASTURIAS.zIndex.panel};
            animation: ast-fade-up 0.4s ease forwards;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.5);
            box-sizing: border-box;
            font-family: ${ASTURIAS.fonts.family};
        `;

        const title = this._getTitle();

        panel.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <div>
                    <div style="font-size:10px;font-weight:700;color:${ASTURIAS.colors.primary};
                        text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px;">
                        Asturias AR
                    </div>
                    <div style="font-size:16px;font-weight:700;color:#fff;line-height:1.2;">
                        ${title}
                    </div>
                </div>
                <button id="ast-pre-close" style="
                    background:rgba(255,255,255,0.1);border:none;border-radius:${ASTURIAS.radius.full};
                    width:32px;height:32px;display:flex;align-items:center;justify-content:center;
                    color:#fff;cursor:pointer;flex-shrink:0;
                ">${this._icon('close')}</button>
            </div>
            <div style="display:flex;gap:10px;align-items:stretch;">
                <button id="ast-start-ar-btn" style="
                    flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;
                    background:${ASTURIAS.colors.primary};color:#fff;
                    border:none;border-radius:${ASTURIAS.radius.base};padding:13px 16px;
                    font-size:14px;font-weight:700;cursor:pointer;
                    box-shadow:0 4px 20px rgba(122,184,0,0.4);
                    font-family:${ASTURIAS.fonts.family};
                ">${this._icon('ar')} ${t('startAR', this._lang)}</button>
                <button id="ast-lang-btn" style="
                    background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);
                    border-radius:${ASTURIAS.radius.base};padding:13px 14px;
                    color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
                    font-size:12px;font-weight:600;gap:6px;font-family:${ASTURIAS.fonts.family};
                ">${this._icon('lang')} ${this._lang.toUpperCase()}</button>
            </div>
        `;

        document.body.appendChild(panel);
        this._updatePrePanelPosition();
        this._resizeHandler = () => this._updatePrePanelPosition();
        window.addEventListener('resize', this._resizeHandler);

        panel.querySelector('#ast-pre-close')?.addEventListener('click', () => this._hidePrePanel());
        panel.querySelector('#ast-start-ar-btn')?.addEventListener('click', () => {
            this._hidePrePanel();
            this._startAR();
        });
        panel.querySelector('#ast-lang-btn')?.addEventListener('click', () => this._showLangPanel());
    }

    private _showPrePanel()  { if (this._prePanel) this._prePanel.style.display = 'block'; }
    private _hidePrePanel()  { if (this._prePanel) this._prePanel.style.display = 'none'; }

    private _updatePrePanelPosition() {
        if (!this._prePanel) return;
        const rect = this._getContainer()?.getBoundingClientRect();
        if (!rect) {
            this._prePanel.style.left = '50%';
            this._prePanel.style.width = 'min(640px, 94vw)';
            this._prePanel.style.transform = 'translateX(-50%)';
            return;
        }
        this._prePanel.style.left = `${rect.left + window.scrollX}px`;
        this._prePanel.style.width = `${rect.width}px`;
        this._prePanel.style.transform = 'none';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DESKTOP PANEL
    // ─────────────────────────────────────────────────────────────────────────

    private _buildDesktopPanel() {
        const root = this._ensureRoot();
        const panel = document.createElement('div');
        this._desktopPanel = panel;
        panel.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            width: 280px; pointer-events: auto;
            z-index: ${ASTURIAS.zIndex.panel};
            animation: ast-fade-up 0.4s ease forwards;
        `;
        panel.className = 'ast-panel';
        panel.style.padding = '20px';

        const title = this._getTitle();

        panel.innerHTML = `
            <div style="margin-bottom:16px;">
                <div style="font-size:10px;font-weight:700;color:${ASTURIAS.colors.primary};
                    text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">
                    Asturias AR — Vista Escritorio
                </div>
                <div style="font-size:15px;font-weight:700;color:${ASTURIAS.colors.dark};">
                    ${title}
                </div>
            </div>
            <div style="background:#f5f8f0;border-radius:${ASTURIAS.radius.base};
                padding:12px;margin-bottom:14px;text-align:center;">
                <div style="font-size:12px;font-weight:600;color:${ASTURIAS.colors.dark};margin-bottom:8px;">
                    ${t('qrTitle', this._lang)}
                </div>
                <div id="ast-desktop-qr" style="display:flex;justify-content:center;"></div>
                <div style="font-size:11px;color:${ASTURIAS.colors.textMuted};margin-top:8px;line-height:1.4;">
                    ${t('qrDesc', this._lang)}
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <button id="ast-vr-btn" class="ast-btn ast-btn-primary" style="width:100%;justify-content:center;">
                    🥽 ${t('vrTitle', this._lang)}
                </button>
                <button id="ast-desk-info-btn" class="ast-btn ast-btn-ghost" style="
                    width:100%;justify-content:center;
                    background:transparent;border:1px solid ${ASTURIAS.colors.border};
                    color:${ASTURIAS.colors.dark};
                ">
                    ℹ️ ${t('info', this._lang)}
                </button>
            </div>
        `;

        root.appendChild(panel);

        // Generate QR
        this._generateDesktopQR();

        panel.querySelector('#ast-vr-btn')?.addEventListener('click', () => this._startVR());
        panel.querySelector('#ast-desk-info-btn')?.addEventListener('click', () => this._showInfoPanel());
    }

    private async _generateDesktopQR() {
        const container = this._desktopPanel?.querySelector('#ast-desktop-qr') as HTMLElement;
        if (!container) return;
        try {
            const qrEl = await generateQRCode({
                text: this._arUrl,
                width: 180, height: 180,
                colorDark: ASTURIAS.colors.dark,
                colorLight: ASTURIAS.colors.white,
                showLogo: false,
                domElement: container,
            });
            // style the inner canvas/img
            const img = qrEl.querySelector('img, canvas') as HTMLElement;
            if (img) {
                img.style.borderRadius = ASTURIAS.radius.sm;
                img.style.display = 'block';
            }
        } catch (e) {
            container.textContent = '⚠️ QR unavailable';
        }
    }

    private _showDesktopPanel() { if (this._desktopPanel) this._desktopPanel.style.display = 'block'; }
    private _hideDesktopPanel() { if (this._desktopPanel) this._desktopPanel.style.display = 'none'; }

    // ─────────────────────────────────────────────────────────────────────────
    // IN-AR CONTROLS HUD
    // ─────────────────────────────────────────────────────────────────────────

    private _buildARControls() {
        const container = this._getContainer();
        const hud = document.createElement('div');
        this._arControls = hud;
        hud.style.cssText = `
            position: fixed; bottom: max(env(safe-area-inset-bottom, 16px), 24px);
            left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; gap: 10px;
            pointer-events: auto; z-index: ${ASTURIAS.zIndex.controls};
            animation: ast-fade-up 0.4s ease forwards;
        `;

        const hasAudio = this._hasAudio();

        hud.innerHTML = `
            <div style="
                display: flex; align-items: center; gap: 8px;
                background: rgba(0,0,0,0.65); backdrop-filter: blur(12px);
                border-radius: ${ASTURIAS.radius.full}; padding: 8px 12px;
                border: 1px solid rgba(255,255,255,0.2);
                box-shadow: ${ASTURIAS.shadow.strong};
            ">
                ${hasAudio ? `
                    <button id="ast-ar-lang" class="ast-btn ast-btn-icon" title="${t('language', this._lang)}">
                        🌐
                    </button>
                    <button id="ast-ar-audio" class="ast-btn ast-btn-icon" title="${t('audioGuide', this._lang)}">
                        🎧
                    </button>
                    <div style="width:1px;height:28px;background:rgba(255,255,255,0.2);margin:0 2px;"></div>
                ` : ''}
                <button id="ast-ar-info" class="ast-btn ast-btn-icon" title="${t('info', this._lang)}">
                    ℹ️
                </button>
                <button id="ast-ar-close" class="ast-btn ast-btn-icon ast-btn-danger" title="${t('stopAR', this._lang)}"
                    style="background:rgba(192,57,43,0.8);">
                    ✕
                </button>
            </div>
        `;

        container.appendChild(hud);

        hud.querySelector('#ast-ar-close')?.addEventListener('click', () => this._stopAR());
        hud.querySelector('#ast-ar-info')?.addEventListener('click', () => this._showInfoPanel());
        hud.querySelector('#ast-ar-lang')?.addEventListener('click', () => this._showLangPanel());
        hud.querySelector('#ast-ar-audio')?.addEventListener('click', () => this._toggleAudio());
    }

    private _removeARControls() {
        this._arControls?.remove();
        this._arControls = undefined;
    }

    private async _stopAR() {
        try {
            const factory = WebXRButtonFactory.getOrCreate();
            if (factory.arButton) { factory.arButton.click(); }
        } catch {}
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUDIO
    // ─────────────────────────────────────────────────────────────────────────

    private _toggleAudio() {
        const url = this._getAudioUrl();
        if (!url) return;

        const btn = this._arControls?.querySelector('#ast-ar-audio') as HTMLElement;
        if (this._audio.isPlaying) {
            this._audio.stop();
            this._hideSubtitle();
            if (btn) btn.textContent = '🎧';
        } else {
            this._audio.play(url);
            if (btn) btn.textContent = '⏹️';
        }
    }

    private _showSubtitle(text: string) {
        this._hideSubtitle();
        const bar = document.createElement('div');
        this._subtitleBar = bar;
        bar.style.cssText = `
            position: fixed; left: 50%; bottom: 120px;
            transform: translateX(-50%);
            width: min(85vw, 600px); max-height: 160px;
            background: rgba(0,0,0,0.85); color: #fff;
            font-family: ${ASTURIAS.fonts.family}; font-size: 15px; font-weight: 500;
            line-height: 1.5; text-align: center;
            border-radius: ${ASTURIAS.radius.base}; padding: 14px 18px;
            pointer-events: none; z-index: ${ASTURIAS.zIndex.controls + 10};
            overflow: hidden;
        `;
        bar.textContent = text;
        this._getContainer().appendChild(bar);
    }

    private _hideSubtitle() {
        this._subtitleBar?.remove();
        this._subtitleBar = undefined;
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
        card.style.cssText = `
            width: min(480px, 90vw); max-height: 80vh; overflow-y: auto;
            padding: 24px; pointer-events: auto;
        `;

        const title = this._getTitle();
        const desc  = this._getDescription();

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                    <div style="font-size:10px;font-weight:700;color:${ASTURIAS.colors.primary};
                        text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">
                        Asturias AR
                    </div>
                    <h2 style="margin:0;font-size:20px;font-weight:800;color:${ASTURIAS.colors.dark};">
                        ${title}
                    </h2>
                </div>
                <button id="ast-info-close" class="ast-btn" style="
                    background:${ASTURIAS.colors.cream};border-radius:${ASTURIAS.radius.full};
                    width:36px;height:36px;color:${ASTURIAS.colors.dark};font-size:16px;
                    flex-shrink:0;margin-left:12px;
                ">✕</button>
            </div>
            ${desc ? `
                <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">
                    ${desc}
                </p>
            ` : ''}
            <div style="
                background: linear-gradient(135deg, ${ASTURIAS.colors.primary}15 0%, ${ASTURIAS.colors.accent}15 100%);
                border-radius: ${ASTURIAS.radius.base}; padding: 14px;
                border-left: 3px solid ${ASTURIAS.colors.primary};
            ">
                <div style="font-size:12px;font-weight:700;color:${ASTURIAS.colors.primary};
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                    💡 ${t('scanInstructions', this._lang)}
                </div>
                <ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.8;">
                    <li>Permite el acceso a la cámara</li>
                    <li>Apunta hacia una superficie plana</li>
                    <li>Toca la pantalla para colocar el modelo</li>
                </ol>
            </div>
            ${this._slug ? `
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid ${ASTURIAS.colors.border};
                    font-size:11px;color:${ASTURIAS.colors.textMuted};">
                    ID: ${this._slug}
                </div>
            ` : ''}
        `;

        backdrop.appendChild(card);
        document.body.appendChild(backdrop);

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this._removeAllPopups();
        });
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
                <h3 style="margin:0;font-size:16px;font-weight:700;color:${ASTURIAS.colors.dark};">
                    🌐 ${t('language', this._lang)}
                </h3>
                <button id="ast-lang-close" class="ast-btn" style="
                    background:${ASTURIAS.colors.cream};border-radius:${ASTURIAS.radius.full};
                    width:32px;height:32px;color:${ASTURIAS.colors.dark};font-size:14px;
                ">✕</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${LANGUAGES.map(l => `
                    <button class="ast-btn ast-lang-option" data-lang="${l.code}" style="
                        justify-content:flex-start;padding:12px 16px;
                        border-radius:${ASTURIAS.radius.base};font-size:14px;
                        background:${this._lang === l.code ? ASTURIAS.colors.primary + '15' : ASTURIAS.colors.cream};
                        border:2px solid ${this._lang === l.code ? ASTURIAS.colors.primary : 'transparent'};
                        color:${this._lang === l.code ? ASTURIAS.colors.primary : ASTURIAS.colors.dark};
                        font-weight:${this._lang === l.code ? '700' : '500'};
                    ">
                        ${this._lang === l.code ? '✓ ' : ''}${l.label}
                    </button>
                `).join('')}
            </div>
        `;

        backdrop.appendChild(card);
        document.body.appendChild(backdrop);

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this._removeAllPopups();
        });
        card.querySelector('#ast-lang-close')?.addEventListener('click', () => this._removeAllPopups());
        card.querySelectorAll('.ast-lang-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = (e.currentTarget as HTMLElement).dataset['lang'] ?? 'es';
                this._lang = code;
                this._removeAllPopups();
                this._audio.stop();
                this._hideSubtitle();
                // Refresh pre-panel language button if visible
                const lb = this._prePanel?.querySelector('#ast-lang-btn');
                if (lb) lb.textContent = `🌐 ${t('language', this._lang)} (${this._lang.toUpperCase()})`;
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