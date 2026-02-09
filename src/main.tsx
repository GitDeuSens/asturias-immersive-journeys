import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n"; // Initialize i18next with bundled fallback translations
import { loadDirectusTranslations } from "./i18n";
import i18n from "i18next";
import "./index.css";

// Load CMS-managed translations (merges over bundled fallbacks)
loadDirectusTranslations().catch(err => {
  // Silently fail translation loading
});

createRoot(document.getElementById("root")!).render(<App />);
