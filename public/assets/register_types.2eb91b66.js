var x=Object.defineProperty;var m=(l,n,t)=>n in l?x(l,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[n]=t;var i=(l,n,t)=>(m(l,typeof n!="symbol"?n+"":n,t),t);import{Behaviour as _,DeviceUtilities as y,onXRSessionStart as v,onXRSessionEnd as k,WebXRButtonFactory as u,generateQRCode as w,TypeStore as $}from"./needle-engine@4.12.3.js";import"./three@0.169.15.js";import"./gltf-progressive.f6515b98.js";import"./three-examples.efffc148.js";import"./three-mesh-ui.a91f26d8.js";import"./three-quarks.5328ca18.js";import"./postprocessing.170e2adf.js";const s={colors:{primary:"#7AB800",primaryDark:"#5c8a00",accent:"#0066A1",warm:"#FFD100",dark:"#1a2633",forest:"#1d4a27",stone:"#8a7460",cream:"#faf8f2",white:"#ffffff",black:"#000000",overlay:"rgba(0,0,0,0.55)",glass:"rgba(255,255,255,0.95)",glassDark:"rgba(20,35,25,0.92)",border:"rgba(122,184,0,0.25)",borderStrong:"rgba(122,184,0,0.6)",textMuted:"#6b7a6e",danger:"#c0392b"},fonts:{family:"'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif"},radius:{sm:"8px",md:"10px",base:"12px",lg:"16px",xl:"20px",full:"999px"},shadow:{soft:"0 4px 20px rgba(0,0,0,0.08)",medium:"0 8px 30px rgba(0,0,0,0.12)",strong:"0 15px 50px rgba(0,0,0,0.20)",green:"0 10px 40px rgba(122,184,0,0.25)"},zIndex:{overlay:9e3,panel:9100,controls:9200,qr:9300,toast:9400}},f={startAR:{es:"Iniciar Experiencia AR",en:"Start AR Experience",fr:"Démarrer l'AR"},stopAR:{es:"Salir de AR",en:"Exit AR",fr:"Quitter AR"},info:{es:"Información",en:"Information",fr:"Informations"},close:{es:"Cerrar",en:"Close",fr:"Fermer"},qrTitle:{es:"Escanea para AR",en:"Scan for AR",fr:"Scanner pour AR"},qrDesc:{es:"Apunta la cámara de tu móvil a este código para abrir la experiencia de Realidad Aumentada.",en:"Point your phone camera at this code to open the Augmented Reality experience.",fr:"Pointez la caméra de votre téléphone sur ce code pour ouvrir l'expérience AR."},vrTitle:{es:"Abrir en VR",en:"Open in VR",fr:"Ouvrir en VR"},audioGuide:{es:"Audioguía",en:"Audio Guide",fr:"Audioguide"},language:{es:"Idioma",en:"Language",fr:"Langue"},scanInstructions:{es:"Apunta hacia una superficie plana y toca para colocar",en:"Point at a flat surface and tap to place",fr:"Pointez une surface plane et touchez pour placer"},loading:{es:"Cargando...",en:"Loading...",fr:"Chargement..."}},h=[{code:"es",label:"Español"},{code:"en",label:"English"},{code:"fr",label:"Français"}];function d(l,n){var t,e;return((t=f[l])==null?void 0:t[n])??((e=f[l])==null?void 0:e.es)??l}function b(){return window.__DIRECTUS_URL??window.VITE_DIRECTUS_URL??"http://192.168.12.71:8055"}function A(l){return`${b()}/assets/${l}`}async function P(l){var n;try{const e=`${b()}/items/ar_scenes?filter[slug][_eq]=${encodeURIComponent(l)}&fields=id,slug,title,description,glb_model,audio_es,audio_en,audio_fr&limit=1`,o=await fetch(e);return o.ok?((n=(await o.json()).data)==null?void 0:n[0])??null:null}catch{return null}}class R{constructor(){i(this,"audio");i(this,"_playing",!1)}get isPlaying(){return this._playing}play(n,t=1){this.stop(),this.audio=new Audio(n),this.audio.volume=t,this.audio.addEventListener("ended",()=>{this._playing=!1}),this.audio.play().then(()=>{this._playing=!0}).catch(()=>{})}stop(){this.audio&&(this.audio.pause(),this.audio.removeAttribute("src"),this.audio.load(),this.audio=void 0),this._playing=!1}toggle(n){this._playing?this.stop():this.play(n)}}class S extends _{constructor(){super(...arguments);i(this,"_lang","es");i(this,"_isAR",!1);i(this,"_isDesktop",!1);i(this,"_sceneInfo",null);i(this,"_slug","");i(this,"_arUrl","");i(this,"_root");i(this,"_prePanel");i(this,"_arControls");i(this,"_desktopPanel");i(this,"_qrPanel");i(this,"_infoPanel");i(this,"_langPanel");i(this,"_subtitleBar");i(this,"_audio",new R);i(this,"_xrStartHandler");i(this,"_xrEndHandler")}awake(){this._detectLanguage(),this._detectSlug(),this._isDesktop=y.isDesktop(),this._loadGoogleFont(),this._injectGlobalStyles()}async start(){this._slug&&(this._sceneInfo=await P(this._slug)),this._arUrl=window.location.href,this._isDesktop?this._buildDesktopPanel():this._buildPreARPanel(),this._xrStartHandler=()=>{this._isAR=!0,this._hidePrePanel(),this._hideDesktopPanel(),this._buildARControls()},this._xrEndHandler=()=>{this._isAR=!1,this._removeARControls(),this._isDesktop?this._showDesktopPanel():this._showPrePanel(),this._audio.stop(),this._hideSubtitle()},v(this._xrStartHandler),k(this._xrEndHandler)}onDestroy(){var t,e,o;if(this._audio.stop(),(t=this._root)==null||t.remove(),this._xrStartHandler)try{(e=window.offXRSessionStart)==null||e.call(window,this._xrStartHandler)}catch{}if(this._xrEndHandler)try{(o=window.offXRSessionEnd)==null||o.call(window,this._xrEndHandler)}catch{}}_detectLanguage(){var a;const e=(a=new URLSearchParams(window.location.search).get("lang"))==null?void 0:a.toLowerCase();if(e&&h.some(r=>r.code===e)){this._lang=e;return}const o=navigator.language.split("-")[0].toLowerCase();h.some(r=>r.code===o)&&(this._lang=o)}_detectSlug(){const t=window.location.pathname.split("/"),e=t.indexOf("ar");if(this._slug=e>=0?t[e+1]??"":"",!this._slug){const o=new URLSearchParams(window.location.search);this._slug=o.get("slug")??""}}_loadGoogleFont(){if(document.getElementById("montserrat-font"))return;const t=document.createElement("link");t.id="montserrat-font",t.rel="stylesheet",t.href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap",document.head.appendChild(t)}_getContainer(){return document.querySelector(":xr-overlay")??document.querySelector("needle-engine")??document.body}_ensureRoot(){return this._root||(this._root=document.createElement("div"),this._root.id="asturias-ar-root",this._root.style.cssText=`
                position: fixed; inset: 0; pointer-events: none;
                z-index: ${s.zIndex.overlay};
                font-family: ${s.fonts.family};
            `,document.body.appendChild(this._root)),this._root}_getTitle(){if(!this._sceneInfo)return this._slug;const t=this._sceneInfo.title;return typeof t=="string"?t:(t==null?void 0:t[this._lang])??(t==null?void 0:t.es)??this._slug}_getDescription(){var e;const t=(e=this._sceneInfo)==null?void 0:e.description;return t?typeof t=="string"?t:(t==null?void 0:t[this._lang])??(t==null?void 0:t.es)??"":""}_hasAudio(){return this._sceneInfo?!!(this._sceneInfo.audio_es||this._sceneInfo.audio_en||this._sceneInfo.audio_fr):!1}_getAudioUrl(){const t=this._sceneInfo;if(!t)return null;const o={es:t.audio_es,en:t.audio_en,fr:t.audio_fr}[this._lang]??t.audio_es??t.audio_en??t.audio_fr;return o?A(o):null}async _startAR(){try{const t=u.getOrCreate();if(t.arButton)t.arButton.click();else{const e=document.querySelector("[ar-button]");e==null||e.click()}}catch(t){console.error("[AsturiasAROverlay] Start AR failed",t)}}async _startVR(){try{const t=u.getOrCreate();if(t.vrButton)t.vrButton.click();else{const e=document.querySelector("[vr-button]");e==null||e.click()}}catch(t){console.error("[AsturiasAROverlay] Start VR failed",t)}}_injectGlobalStyles(){const t="asturias-ar-styles";if(document.getElementById(t))return;const e=document.createElement("style");e.id=t,e.textContent=`
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
            border: none; cursor: pointer; font-family: ${s.fonts.family};
            font-weight: 600; letter-spacing: 0.3px; transition: all 0.2s ease;
            -webkit-tap-highlight-color: transparent; white-space: nowrap;
        }
        .ast-btn:active { transform: scale(0.97); }
        .ast-btn-primary {
            background: ${s.colors.primary};
            color: ${s.colors.white};
            border-radius: ${s.radius.base};
            padding: 14px 28px; font-size: 15px;
            box-shadow: ${s.shadow.green};
        }
        .ast-btn-primary:hover { background: ${s.colors.primaryDark}; transform: translateY(-2px); }
        .ast-btn-ghost {
            background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
            color: ${s.colors.white}; border-radius: ${s.radius.base};
            padding: 10px 18px; font-size: 13px; border: 1px solid rgba(255,255,255,0.3);
        }
        .ast-btn-ghost:hover { background: rgba(255,255,255,0.25); }
        .ast-btn-icon {
            background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
            color: ${s.colors.white}; border-radius: ${s.radius.full};
            width: 44px; height: 44px; font-size: 18px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .ast-btn-icon:hover { background: rgba(255,255,255,0.3); }
        .ast-btn-danger {
            background: ${s.colors.danger};
            color: ${s.colors.white};
        }
        .ast-panel {
            background: ${s.colors.glass}; backdrop-filter: blur(16px);
            border-radius: ${s.radius.xl}; box-shadow: ${s.shadow.strong};
            border: 1px solid ${s.colors.border};
            animation: ast-fade-up 0.35s ease forwards;
        }
        .ast-overlay-backdrop {
            position: fixed; inset: 0; background: ${s.colors.overlay};
            backdrop-filter: blur(4px); z-index: ${s.zIndex.panel};
            display: flex; align-items: center; justify-content: center;
            padding: 20px; pointer-events: auto;
        }
        `,document.head.appendChild(e)}_buildPreARPanel(){var r,c,p;const t=this._ensureRoot(),e=document.createElement("div");this._prePanel=e,e.style.cssText=`
            position: fixed; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, ${s.colors.forest} 0%, ${s.colors.dark} 100%);
            border-radius: ${s.radius.xl} ${s.radius.xl} 0 0;
            padding: 24px 20px max(env(safe-area-inset-bottom, 16px), 20px);
            pointer-events: auto; z-index: ${s.zIndex.panel};
            animation: ast-fade-up 0.4s ease forwards;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.3);
        `;const o=this._getTitle(),a=this._getDescription();e.innerHTML=`
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div style="
                    width:48px;height:48px;border-radius:${s.radius.base};
                    background:${s.colors.primary};display:flex;align-items:center;
                    justify-content:center;flex-shrink:0;font-size:22px;
                ">🏛️</div>
                <div>
                    <div style="font-size:11px;font-weight:700;color:${s.colors.primary};
                        text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">
                        Asturias AR
                    </div>
                    <div style="font-size:16px;font-weight:700;color:#fff;line-height:1.2;">
                        ${o}
                    </div>
                </div>
                <button id="ast-pre-info-btn" class="ast-btn ast-btn-icon" style="margin-left:auto;">ℹ️</button>
            </div>
            ${a?`<p style="font-size:13px;color:rgba(255,255,255,0.75);margin:0 0 16px;line-height:1.5;">${a}</p>`:""}
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button id="ast-start-ar-btn" class="ast-btn ast-btn-primary" style="width:100%;font-size:16px;padding:16px;">
                    <span>📱</span> ${d("startAR",this._lang)}
                </button>
                <div style="display:flex;gap:8px;">
                    ${this._hasAudio()?`
                        <button id="ast-lang-btn" class="ast-btn ast-btn-ghost" style="flex:1;">
                            🌐 ${d("language",this._lang)} (${this._lang.toUpperCase()})
                        </button>
                    `:""}
                </div>
            </div>
        `,t.appendChild(e),(r=e.querySelector("#ast-start-ar-btn"))==null||r.addEventListener("click",()=>this._startAR()),(c=e.querySelector("#ast-pre-info-btn"))==null||c.addEventListener("click",()=>this._showInfoPanel()),(p=e.querySelector("#ast-lang-btn"))==null||p.addEventListener("click",()=>this._showLangPanel())}_showPrePanel(){this._prePanel&&(this._prePanel.style.display="block")}_hidePrePanel(){this._prePanel&&(this._prePanel.style.display="none")}_buildDesktopPanel(){var a,r;const t=this._ensureRoot(),e=document.createElement("div");this._desktopPanel=e,e.style.cssText=`
            position: fixed; top: 20px; right: 20px;
            width: 280px; pointer-events: auto;
            z-index: ${s.zIndex.panel};
            animation: ast-fade-up 0.4s ease forwards;
        `,e.className="ast-panel",e.style.padding="20px";const o=this._getTitle();e.innerHTML=`
            <div style="margin-bottom:16px;">
                <div style="font-size:10px;font-weight:700;color:${s.colors.primary};
                    text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">
                    Asturias AR — Vista Escritorio
                </div>
                <div style="font-size:15px;font-weight:700;color:${s.colors.dark};">
                    ${o}
                </div>
            </div>
            <div style="background:#f5f8f0;border-radius:${s.radius.base};
                padding:12px;margin-bottom:14px;text-align:center;">
                <div style="font-size:12px;font-weight:600;color:${s.colors.dark};margin-bottom:8px;">
                    ${d("qrTitle",this._lang)}
                </div>
                <div id="ast-desktop-qr" style="display:flex;justify-content:center;"></div>
                <div style="font-size:11px;color:${s.colors.textMuted};margin-top:8px;line-height:1.4;">
                    ${d("qrDesc",this._lang)}
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <button id="ast-vr-btn" class="ast-btn ast-btn-primary" style="width:100%;justify-content:center;">
                    🥽 ${d("vrTitle",this._lang)}
                </button>
                <button id="ast-desk-info-btn" class="ast-btn ast-btn-ghost" style="
                    width:100%;justify-content:center;
                    background:transparent;border:1px solid ${s.colors.border};
                    color:${s.colors.dark};
                ">
                    ℹ️ ${d("info",this._lang)}
                </button>
            </div>
        `,t.appendChild(e),this._generateDesktopQR(),(a=e.querySelector("#ast-vr-btn"))==null||a.addEventListener("click",()=>this._startVR()),(r=e.querySelector("#ast-desk-info-btn"))==null||r.addEventListener("click",()=>this._showInfoPanel())}async _generateDesktopQR(){var e;const t=(e=this._desktopPanel)==null?void 0:e.querySelector("#ast-desktop-qr");if(t)try{const a=(await w({text:this._arUrl,width:180,height:180,colorDark:s.colors.dark,colorLight:s.colors.white,showLogo:!1,domElement:t})).querySelector("img, canvas");a&&(a.style.borderRadius=s.radius.sm,a.style.display="block")}catch{t.textContent="⚠️ QR unavailable"}}_showDesktopPanel(){this._desktopPanel&&(this._desktopPanel.style.display="block")}_hideDesktopPanel(){this._desktopPanel&&(this._desktopPanel.style.display="none")}_buildARControls(){var a,r,c,p;const t=this._getContainer(),e=document.createElement("div");this._arControls=e,e.style.cssText=`
            position: fixed; bottom: max(env(safe-area-inset-bottom, 16px), 24px);
            left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; gap: 10px;
            pointer-events: auto; z-index: ${s.zIndex.controls};
            animation: ast-fade-up 0.4s ease forwards;
        `;const o=this._hasAudio();e.innerHTML=`
            <div style="
                display: flex; align-items: center; gap: 8px;
                background: rgba(0,0,0,0.65); backdrop-filter: blur(12px);
                border-radius: ${s.radius.full}; padding: 8px 12px;
                border: 1px solid rgba(255,255,255,0.2);
                box-shadow: ${s.shadow.strong};
            ">
                ${o?`
                    <button id="ast-ar-lang" class="ast-btn ast-btn-icon" title="${d("language",this._lang)}">
                        🌐
                    </button>
                    <button id="ast-ar-audio" class="ast-btn ast-btn-icon" title="${d("audioGuide",this._lang)}">
                        🎧
                    </button>
                    <div style="width:1px;height:28px;background:rgba(255,255,255,0.2);margin:0 2px;"></div>
                `:""}
                <button id="ast-ar-info" class="ast-btn ast-btn-icon" title="${d("info",this._lang)}">
                    ℹ️
                </button>
                <button id="ast-ar-close" class="ast-btn ast-btn-icon ast-btn-danger" title="${d("stopAR",this._lang)}"
                    style="background:rgba(192,57,43,0.8);">
                    ✕
                </button>
            </div>
        `,t.appendChild(e),(a=e.querySelector("#ast-ar-close"))==null||a.addEventListener("click",()=>this._stopAR()),(r=e.querySelector("#ast-ar-info"))==null||r.addEventListener("click",()=>this._showInfoPanel()),(c=e.querySelector("#ast-ar-lang"))==null||c.addEventListener("click",()=>this._showLangPanel()),(p=e.querySelector("#ast-ar-audio"))==null||p.addEventListener("click",()=>this._toggleAudio())}_removeARControls(){var t;(t=this._arControls)==null||t.remove(),this._arControls=void 0}async _stopAR(){try{const t=u.getOrCreate();t.arButton&&t.arButton.click()}catch{}}_toggleAudio(){var o;const t=this._getAudioUrl();if(!t)return;const e=(o=this._arControls)==null?void 0:o.querySelector("#ast-ar-audio");this._audio.isPlaying?(this._audio.stop(),this._hideSubtitle(),e&&(e.textContent="🎧")):(this._audio.play(t),e&&(e.textContent="⏹️"))}_showSubtitle(t){this._hideSubtitle();const e=document.createElement("div");this._subtitleBar=e,e.style.cssText=`
            position: fixed; left: 50%; bottom: 120px;
            transform: translateX(-50%);
            width: min(85vw, 600px); max-height: 160px;
            background: rgba(0,0,0,0.85); color: #fff;
            font-family: ${s.fonts.family}; font-size: 15px; font-weight: 500;
            line-height: 1.5; text-align: center;
            border-radius: ${s.radius.base}; padding: 14px 18px;
            pointer-events: none; z-index: ${s.zIndex.controls+10};
            overflow: hidden;
        `,e.textContent=t,this._getContainer().appendChild(e)}_hideSubtitle(){var t;(t=this._subtitleBar)==null||t.remove(),this._subtitleBar=void 0}_showInfoPanel(){var r;this._removeAllPopups();const t=document.createElement("div");t.className="ast-overlay-backdrop",this._infoPanel=t;const e=document.createElement("div");e.className="ast-panel",e.style.cssText=`
            width: min(480px, 90vw); max-height: 80vh; overflow-y: auto;
            padding: 24px; pointer-events: auto;
        `;const o=this._getTitle(),a=this._getDescription();e.innerHTML=`
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                    <div style="font-size:10px;font-weight:700;color:${s.colors.primary};
                        text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">
                        Asturias AR
                    </div>
                    <h2 style="margin:0;font-size:20px;font-weight:800;color:${s.colors.dark};">
                        ${o}
                    </h2>
                </div>
                <button id="ast-info-close" class="ast-btn" style="
                    background:${s.colors.cream};border-radius:${s.radius.full};
                    width:36px;height:36px;color:${s.colors.dark};font-size:16px;
                    flex-shrink:0;margin-left:12px;
                ">✕</button>
            </div>
            ${a?`
                <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">
                    ${a}
                </p>
            `:""}
            <div style="
                background: linear-gradient(135deg, ${s.colors.primary}15 0%, ${s.colors.accent}15 100%);
                border-radius: ${s.radius.base}; padding: 14px;
                border-left: 3px solid ${s.colors.primary};
            ">
                <div style="font-size:12px;font-weight:700;color:${s.colors.primary};
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                    💡 ${d("scanInstructions",this._lang)}
                </div>
                <ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.8;">
                    <li>Permite el acceso a la cámara</li>
                    <li>Apunta hacia una superficie plana</li>
                    <li>Toca la pantalla para colocar el modelo</li>
                </ol>
            </div>
            ${this._slug?`
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid ${s.colors.border};
                    font-size:11px;color:${s.colors.textMuted};">
                    ID: ${this._slug}
                </div>
            `:""}
        `,t.appendChild(e),document.body.appendChild(t),t.addEventListener("click",c=>{c.target===t&&this._removeAllPopups()}),(r=e.querySelector("#ast-info-close"))==null||r.addEventListener("click",()=>this._removeAllPopups())}_showLangPanel(){var o;this._removeAllPopups();const t=document.createElement("div");t.className="ast-overlay-backdrop",this._langPanel=t;const e=document.createElement("div");e.className="ast-panel",e.style.cssText="width:280px;padding:20px;pointer-events:auto;",e.innerHTML=`
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="margin:0;font-size:16px;font-weight:700;color:${s.colors.dark};">
                    🌐 ${d("language",this._lang)}
                </h3>
                <button id="ast-lang-close" class="ast-btn" style="
                    background:${s.colors.cream};border-radius:${s.radius.full};
                    width:32px;height:32px;color:${s.colors.dark};font-size:14px;
                ">✕</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${h.map(a=>`
                    <button class="ast-btn ast-lang-option" data-lang="${a.code}" style="
                        justify-content:flex-start;padding:12px 16px;
                        border-radius:${s.radius.base};font-size:14px;
                        background:${this._lang===a.code?s.colors.primary+"15":s.colors.cream};
                        border:2px solid ${this._lang===a.code?s.colors.primary:"transparent"};
                        color:${this._lang===a.code?s.colors.primary:s.colors.dark};
                        font-weight:${this._lang===a.code?"700":"500"};
                    ">
                        ${this._lang===a.code?"✓ ":""}${a.label}
                    </button>
                `).join("")}
            </div>
        `,t.appendChild(e),document.body.appendChild(t),t.addEventListener("click",a=>{a.target===t&&this._removeAllPopups()}),(o=e.querySelector("#ast-lang-close"))==null||o.addEventListener("click",()=>this._removeAllPopups()),e.querySelectorAll(".ast-lang-option").forEach(a=>{a.addEventListener("click",r=>{var g;const c=r.currentTarget.dataset.lang??"es";this._lang=c,this._removeAllPopups(),this._audio.stop(),this._hideSubtitle();const p=(g=this._prePanel)==null?void 0:g.querySelector("#ast-lang-btn");p&&(p.textContent=`🌐 ${d("language",this._lang)} (${this._lang.toUpperCase()})`)})})}_removeAllPopups(){var t,e,o;(t=this._infoPanel)==null||t.remove(),this._infoPanel=void 0,(e=this._langPanel)==null||e.remove(),this._langPanel=void 0,(o=this._qrPanel)==null||o.remove(),this._qrPanel=void 0}}$.add("AsturiasAROverlay",S);
