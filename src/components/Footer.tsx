import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import institutional logos
import nextgenEuLogo from "@/assets/logos/nextgen-eu.png";
import planRecuperacionLogo from "@/assets/logos/plan-recuperacion.png";
import ministerioTurismoLogo from "@/assets/logos/ministerio-turismo.png";
import principadoAsturiasLogo from "@/assets/logos/principado-asturias.png";
import asturiasParaisoNaturalLogo from "@/assets/logos/asturias-paraiso-natural.png";

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={ref}
      className="relative"
      role="contentinfo"
      aria-label={t("footer.ariaLabel", "Pie de página")}
    >
      {/* Green top bar */}
      <div className="h-2 bg-primary" aria-hidden="true" />

      {/* Main footer content - light gray background */}
      <div className="bg-[#e8e8e8]">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Top row: Logos + Social icons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            {/* Institutional logos row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
              {/* Principado de Asturias coat of arms */}
              <a
                href="https://www.asturias.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 md:h-14 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-label="Principado de Asturias"
              >
                <img
                  src={principadoAsturiasLogo}
                  alt="Principado de Asturias"
                  className="h-full w-auto object-contain"
                />
              </a>

              {/* Divider */}
              <div className="hidden md:block w-px h-10 bg-gray-400" aria-hidden="true" />

              {/* Asturias Paraíso Natural */}
              <a
                href="https://www.turismoasturias.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 md:h-12 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-label="Asturias Paraíso Natural"
              >
                <img
                  src={asturiasParaisoNaturalLogo}
                  alt="Asturias Paraíso Natural"
                  className="h-full w-auto object-contain"
                />
              </a>

              {/* Divider */}
              <div className="hidden md:block w-px h-10 bg-gray-400" aria-hidden="true" />

              {/* Project title */}
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold text-gray-800">ASTURIAS</span>
                <span className="text-lg md:text-xl font-semibold text-primary">INMERSIVO</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/turismoasturias"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-500 hover:bg-gray-600 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com/TurismoAsturias"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-500 hover:bg-gray-600 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5 text-white" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Separator line */}
          <div className="h-px bg-gray-300 mb-6" aria-hidden="true" />

          {/* EU Funding logos row */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-6">
            {/* NextGenerationEU */}
            <a
              href="https://next-generation-eu.europa.eu/index_es"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 md:h-12 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
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
              className="h-10 md:h-12 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label="Gobierno de España - Ministerio de Industria y Turismo"
            >
              <img
                src={ministerioTurismoLogo}
                alt="Gobierno de España - Ministerio de Industria y Turismo"
                className="h-full w-auto object-contain"
              />
            </a>

            {/* Plan de Recuperación */}
            <a
              href="https://planderecuperacion.gob.es/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 md:h-10 flex items-center transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
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
          <nav aria-label={t("footer.legalNav", "Enlaces legales")} className="mb-4">
            <ul className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <li>
                <a
                  href="/legal"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
                >
                  {t("footer.legal")}
                </a>
              </li>
              <li>
                <a
                  href="/accessibility"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
                >
                  {t("footer.accessibility")}
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
                >
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded uppercase tracking-wide"
                >
                  {t("footer.cookies")}
                </a>
              </li>
            </ul>
          </nav>

          {/* Copyright */}
          <p className="text-center text-xs text-gray-500">{t("footer.copyright")}</p>
        </div>
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
