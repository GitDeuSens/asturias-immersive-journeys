import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, ExternalLink } from 'lucide-react';

export const Footer = forwardRef<HTMLElement>(
  function Footer(_, ref) {
    const { t } = useTranslation();
    
    return (
      <footer 
        ref={ref}
        className="bg-secondary text-secondary-foreground border-t border-border"
        role="contentinfo"
        aria-label="Footer"
      >
        {/* Institutional logos */}
        <div className="border-b border-border/20 py-6">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-secondary-foreground/80 mb-4">
              {t('footer.fundedBy')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {/* EU Logo placeholder */}
              <a 
                href="https://next-generation-eu.europa.eu/index_es" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-12 w-auto flex items-center justify-center bg-white/10 rounded px-4 py-2 hover:bg-white/20 transition-colors"
              >
                <span className="text-xs font-semibold">🇪🇺 NextGenerationEU</span>
              </a>
              {/* Plan de Recuperación */}
              <a 
                href="https://planderecuperacion.gob.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-12 w-auto flex items-center justify-center bg-white/10 rounded px-4 py-2 hover:bg-white/20 transition-colors"
              >
                <span className="text-xs font-semibold">Plan de Recuperación</span>
              </a>
              {/* Ministerio */}
              <a 
                href="https://www.mintur.gob.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-12 w-auto flex items-center justify-center bg-white/10 rounded px-4 py-2 hover:bg-white/20 transition-colors"
              >
                <span className="text-xs font-semibold">Min. Industria y Turismo</span>
              </a>
              {/* Principado */}
              <a 
                href="https://www.asturias.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-12 w-auto flex items-center justify-center bg-white/10 rounded px-4 py-2 hover:bg-white/20 transition-colors"
              >
                <span className="text-xs font-semibold">Principado de Asturias</span>
              </a>
              {/* Asturias Paraíso Natural */}
              <a 
                href="https://turismoasturias.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-12 w-auto flex items-center justify-center bg-primary/20 rounded px-4 py-2 hover:bg-primary/30 transition-colors"
              >
                <Mountain className="w-5 h-5 text-primary mr-2" aria-hidden="true" />
                <span className="text-xs font-bold text-primary">Asturias Paraíso Natural</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-lg">Asturias</span>
                  <span className="text-primary font-semibold text-sm ml-1 uppercase tracking-wider">
                    Inmersivo
                  </span>
                </div>
              </div>
              <p className="text-sm text-secondary-foreground/70 max-w-xs">
                Plataforma de experiencias inmersivas del Principado de Asturias. Tours virtuales 360°, realidad aumentada y rutas interactivas.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-secondary-foreground mb-4">Navegación</h3>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                      {t('nav.home')}
                    </a>
                  </li>
                  <li>
                    <a href="/tours" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                      {t('nav.tours360')}
                    </a>
                  </li>
                  <li>
                    <a href="/routes" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                      {t('nav.routes')}
                    </a>
                  </li>
                  <li>
                    <a href="/vr" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                      {t('nav.vrExperiences')}
                    </a>
                  </li>
                  <li>
                    <a href="/ar" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                      {t('nav.arExperiences')}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Legal + Contact */}
            <div>
              <h3 className="font-semibold text-secondary-foreground mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://turismoasturias.es" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors inline-flex items-center gap-1 focus:outline-none focus:text-primary"
                  >
                    turismoasturias.es
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                    {t('footer.privacy')}
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                    {t('footer.cookies')}
                  </a>
                </li>
                <li>
                  <a href="/legal" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                    {t('footer.legal')}
                  </a>
                </li>
                <li>
                  <a href="/accessibility" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:text-primary">
                    {t('footer.accessibility')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/20 py-4">
          <div className="container mx-auto px-4">
            <p className="text-center text-xs text-secondary-foreground/60">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    );
  }
);
