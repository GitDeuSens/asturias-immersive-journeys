import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import institutional logos
import nextgenEuLogo from "@/assets/logos/nextgen-eu.png";
import planRecuperacionLogo from "@/assets/logos/plan-recuperacion.png";
import ministerioTurismoLogo from "@/assets/logos/ministerio-turismo.png";
import principadoAsturiasLogo from "@/assets/logos/principado-asturias.png";

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={ref}
      className="bg-muted text-muted-foreground relative"
      role="contentinfo"
      aria-label={t("footer.ariaLabel", "Pie de página")}
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Institutional logos - Row 1 */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mb-6">
          {/* NextGenerationEU */}
          <a
            href="https://next-generation-eu.europa.eu/index_es"
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 md:h-16 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label="Financiado por la Unión Europea - NextGenerationEU"
          >
            <img
              src={nextgenEuLogo}
              alt="Financiado por la Unión Europea - NextGenerationEU"
              className="h-full w-auto object-contain"
            />
          </a>

          {/* Ministerio */}
          <a
            href="https://www.mintur.gob.es/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 md:h-16 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label="Gobierno de España - Ministerio de Industria y Turismo"
          >
            <img
              src={ministerioTurismoLogo}
              alt="Gobierno de España - Ministerio de Industria y Turismo"
              className="h-full w-auto object-contain"
            />
          </a>

          {/* Principado */}
          <a
            href="https://www.asturias.es/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 md:h-16 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label="Principado de Asturias"
          >
            <img src={principadoAsturiasLogo} alt="Principado de Asturias" className="h-full w-auto object-contain" />
          </a>
          <a
            href="https://planderecuperacion.gob.es/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 md:h-14 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label="Plan de Recuperación, Transformación y Resiliencia"
          >
            <img
              src={planRecuperacionLogo}
              alt="Plan de Recuperación, Transformación y Resiliencia"
              className="h-full w-auto object-contain"
            />
          </a>
        </div>
        {/* Legal links */}
        <nav aria-label={t("footer.legalNav", "Enlaces legales")} className="mb-6">
          <ul className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <li>
              <a
                href="/legal"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
              >
                {t("footer.legal")}
              </a>
            </li>
            <li>
              <a
                href="/accessibility"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
              >
                {t("footer.accessibility")}
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
              >
                {t("footer.privacy")}
              </a>
            </li>
            <li>
              <a
                href="/cookies"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
              >
                {t("footer.cookies")}
              </a>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-center text-sm text-muted-foreground/80">{t("footer.copyright")}</p>
      </div>

      {/* Scroll to top button */}
      <Button
        onClick={scrollToTop}
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-50 rounded-md shadow-lg"
        aria-label={t("footer.scrollToTop", "Volver arriba")}
      >
        <ChevronUp className="h-5 w-5" aria-hidden="true" />
      </Button>
    </footer>
  );
});
