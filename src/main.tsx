import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n"; // Initialize i18next with bundled fallback translations
import { loadDirectusTranslations } from "./i18n";
import i18n from "i18next";
import "./index.css";

// Load CMS-managed translations (merges over bundled fallbacks)
loadDirectusTranslations().then(() => {
  console.log('[i18n] Directus translations loaded');
  console.log('[i18n] Final test translation:', i18n.t('a11y.closeMenu'));
  console.log('[i18n] Available resources:', Object.keys(i18n.options.resources || {}));
}).catch(err => {
  console.error('[i18n] Failed to load Directus translations:', err);
});

createRoot(document.getElementById("root")!).render(<App />);
