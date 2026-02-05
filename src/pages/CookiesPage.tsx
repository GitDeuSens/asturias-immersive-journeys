import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Cookie, Settings } from "lucide-react";
import { openCookieSettings } from "@/hooks/useCookieConsent";

const cookiesContent = {
  es: {
    title: "Política de Cookies",
    subtitle: "Uso de cookies en este sitio web",
    intro:
      "Este sitio web utiliza cookies propias y de terceros para mejorar su experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido.",
    what: {
      title: "¿Qué son las cookies?",
      text: "Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Permiten que el sitio recuerde sus acciones y preferencias durante un período de tiempo.",
    },
    types: {
      title: "Tipos de cookies que utilizamos",
      list: [
        {
          name: "Cookies técnicas (esenciales)",
          description: "Necesarias para el funcionamiento básico del sitio. Incluyen preferencias de idioma y tema.",
          duration: "Sesión / 1 año",
        },
        {
          name: "Cookies de análisis",
          description:
            "Nos ayudan a entender cómo los visitantes interactúan con el sitio. Usamos Google Analytics con IP anonimizada.",
          duration: "2 años",
        },
        {
          name: "Cookies de preferencias",
          description: "Guardan sus preferencias como el modo de exploración seleccionado (desde casa / en Asturias).",
          duration: "1 año",
        },
      ],
    },
    manage: {
      title: "Gestión de cookies",
      text: "Puede configurar su navegador para rechazar cookies o para que le avise cuando se envíen. Sin embargo, algunas funciones del sitio pueden no funcionar correctamente si desactiva las cookies.",
    },
    browsers: {
      title: "Configuración por navegador",
      list: [
        { name: "Chrome", url: "https://support.google.com/chrome/answer/95647" },
        {
          name: "Firefox",
          url: "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias",
        },
        { name: "Safari", url: "https://support.apple.com/es-es/guide/safari/sfri11471/mac" },
        {
          name: "Edge",
          url: "https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
        },
      ],
    },
    update: "Esta política de cookies fue actualizada por última vez en febrero de 2024.",
  },
  en: {
    title: "Cookie Policy",
    subtitle: "Use of cookies on this website",
    intro:
      "This website uses its own and third-party cookies to improve your browsing experience, analyze site traffic, and personalize content.",
    what: {
      title: "What are cookies?",
      text: "Cookies are small text files that are stored on your device when you visit a website. They allow the site to remember your actions and preferences over a period of time.",
    },
    types: {
      title: "Types of cookies we use",
      list: [
        {
          name: "Technical cookies (essential)",
          description: "Necessary for basic site operation. Includes language and theme preferences.",
          duration: "Session / 1 year",
        },
        {
          name: "Analytics cookies",
          description:
            "Help us understand how visitors interact with the site. We use Google Analytics with anonymized IP.",
          duration: "2 years",
        },
        {
          name: "Preference cookies",
          description: "Store your preferences such as selected exploration mode (from home / in Asturias).",
          duration: "1 year",
        },
      ],
    },
    manage: {
      title: "Cookie management",
      text: "You can configure your browser to reject cookies or to alert you when cookies are being sent. However, some site features may not work properly if you disable cookies.",
    },
    browsers: {
      title: "Browser settings",
      list: [
        { name: "Chrome", url: "https://support.google.com/chrome/answer/95647" },
        { name: "Firefox", url: "https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" },
        { name: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
        {
          name: "Edge",
          url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
        },
      ],
    },
    update: "This cookie policy was last updated in February 2024.",
  },
  fr: {
    title: "Politique de Cookies",
    subtitle: "Utilisation des cookies sur ce site web",
    intro:
      "Ce site web utilise des cookies propres et tiers pour améliorer votre expérience de navigation, analyser le trafic du site et personnaliser le contenu.",
    what: {
      title: "Que sont les cookies?",
      text: "Les cookies sont de petits fichiers texte qui sont stockés sur votre appareil lorsque vous visitez un site web. Ils permettent au site de se souvenir de vos actions et préférences pendant une période de temps.",
    },
    types: {
      title: "Types de cookies que nous utilisons",
      list: [
        {
          name: "Cookies techniques (essentiels)",
          description: "Nécessaires au fonctionnement de base du site. Incluent les préférences de langue et de thème.",
          duration: "Session / 1 an",
        },
        {
          name: "Cookies d'analyse",
          description:
            "Nous aident à comprendre comment les visiteurs interagissent avec le site. Nous utilisons Google Analytics avec IP anonymisée.",
          duration: "2 ans",
        },
        {
          name: "Cookies de préférences",
          description:
            "Enregistrent vos préférences comme le mode d'exploration sélectionné (depuis chez soi / aux Asturies).",
          duration: "1 an",
        },
      ],
    },
    manage: {
      title: "Gestion des cookies",
      text: "Vous pouvez configurer votre navigateur pour rejeter les cookies ou pour vous avertir lorsque des cookies sont envoyés. Cependant, certaines fonctionnalités du site peuvent ne pas fonctionner correctement si vous désactivez les cookies.",
    },
    browsers: {
      title: "Configuration par navigateur",
      list: [
        { name: "Chrome", url: "https://support.google.com/chrome/answer/95647" },
        { name: "Firefox", url: "https://support.mozilla.org/fr/kb/activer-desactiver-cookies-preferences" },
        { name: "Safari", url: "https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" },
        {
          name: "Edge",
          url: "https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
        },
      ],
    },
    update: "Cette politique de cookies a été mise à jour pour la dernière fois en février 2024.",
  },
};

export function CookiesPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.substring(0, 2) as "es" | "en" | "fr") || "es";
  const content = cookiesContent[lang] || cookiesContent.es;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={content.title} description={content.intro} />
      <AppHeader showRestart={false} />

      <main id="main-content" className="pt-20" role="main">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Cookie className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{content.title}</h1>
              <p className="text-lg text-muted-foreground">{content.subtitle}</p>
            </div>

            {/* Intro */}
            <section className="mb-8 p-6 bg-muted/50 rounded-xl">
              <p className="text-foreground/80 leading-relaxed mb-4">{content.intro}</p>
              <Button onClick={openCookieSettings} variant="outline" className="gap-2">
                <Settings className="w-4 h-4" aria-hidden="true" />
                {lang === "en"
                  ? "Manage my preferences"
                  : lang === "fr"
                    ? "Gérer mes préférences"
                    : "Gestionar mis preferencias"}
              </Button>
            </section>

            {/* What are cookies */}
            <section className="mb-8 p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">{content.what.title}</h2>
              <p className="text-muted-foreground">{content.what.text}</p>
            </section>

            {/* Types */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">{content.types.title}</h2>
              <div className="space-y-4">
                {content.types.list.map((cookie, index) => (
                  <div key={index} className="p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-foreground mb-1">{cookie.name}</h3>
                        <p className="text-sm text-muted-foreground">{cookie.description}</p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">{cookie.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Management */}
            <section className="mb-8 p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">{content.manage.title}</h2>
              <p className="text-muted-foreground">{content.manage.text}</p>
            </section>

            {/* Browser settings */}
            <section className="mb-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">{content.browsers.title}</h2>
              <div className="flex flex-wrap gap-3">
                {content.browsers.list.map((browser, index) => (
                  <a
                    key={index}
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-background rounded-lg text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {browser.name}
                  </a>
                ))}
              </div>
            </section>

            {/* Update */}
            <p className="text-sm text-muted-foreground text-center">{content.update}</p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CookiesPage;
