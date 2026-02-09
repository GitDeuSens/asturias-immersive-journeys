import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n"; // Initialize i18next with bundled fallback translations
import { loadDirectusTranslations } from "./i18n";
import "./index.css";

// Load CMS-managed translations (merges over bundled fallbacks)
loadDirectusTranslations();

createRoot(document.getElementById("root")!).render(<App />);
