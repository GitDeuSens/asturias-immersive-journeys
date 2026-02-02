import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mountain, ExternalLink } from 'lucide-react';

// Import institutional logos
import nextgenEuLogo from '@/assets/logos/nextgen-eu.png';
import planRecuperacionLogo from '@/assets/logos/plan-recuperacion.png';
import ministerioTurismoLogo from '@/assets/logos/ministerio-turismo.png';
import principadoAsturiasLogo from '@/assets/logos/principado-asturias.png';
import asturiasParaisoNaturalLogo from '@/assets/logos/asturias-paraiso-natural.png';

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
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {/* NextGenerationEU Logo */}
              <a 
                href="https://next-generation-eu.europa.eu/index_es" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 md:h-20 w-auto flex items-center justify-center bg-white rounded-lg px-3 py-2 hover:shadow-lg transition-all hover:scale-105"
                aria-label="NextGenerationEU - Financiado por la Unión Europea"
              >
                <img 
                  src={nextgenEuLogo} 
                  alt="NextGenerationEU - Financiado por la Unión Europea" 
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </a>
              {/* Plan de Recuperación */}
              <a 
                href="https://planderecuperacion.gob.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 md:h-20 w-auto flex items-center justify-center bg-white rounded-lg px-3 py-2 hover:shadow-lg transition-all hover:scale-105"
                aria-label="Plan de Recuperación, Transformación y Resiliencia"
              >
                <img 
                  src={planRecuperacionLogo} 
                  alt="Plan de Recuperación, Transformación y Resiliencia" 
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </a>
              {/* Ministerio */}
              <a 
                href="https://www.mintur.gob.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 md:h-20 w-auto flex items-center justify-center bg-white rounded-lg px-3 py-2 hover:shadow-lg transition-all hover:scale-105"
                aria-label="Ministerio de Industria y Turismo de España"
              >
                <img 
                  src={ministerioTurismoLogo} 
                  alt="Ministerio de Industria y Turismo de España" 
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </a>
              {/* Principado */}
              <a 
                href="https://www.asturias.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 md:h-20 w-auto flex items-center justify-center bg-white rounded-lg px-3 py-2 hover:shadow-lg transition-all hover:scale-105"
                aria-label="Principado de Asturias"
              >
                <img 
                  src={principadoAsturiasLogo} 
                  alt="Escudo del Principado de Asturias" 
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </a>
              {/* Asturias Paraíso Natural */}
              <a 
                href="https://turismoasturias.es/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 md:h-20 w-auto flex items-center justify-center bg-white rounded-lg px-3 py-2 hover:shadow-lg transition-all hover:scale-105"
                aria-label="Asturias Paraíso Natural"
              >
                <img 
                  src={asturiasParaisoNaturalLogo} 
                  alt="Asturias Paraíso Natural" 
                  className="h-12 md:h-16 w-auto object-contain"
                />
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
              <h3 className="font-semibold text-secondary-foreground mb-4">{t('nav.home') && 'Navegación'}</h3>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                      {t('nav.home')}
                    </a>
                  </li>
                  <li>
                    <a href="/tours" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                      {t('nav.tours360')}
                    </a>
                  </li>
                  <li>
                    <a href="/routes" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                      {t('nav.routes')}
                    </a>
                  </li>
                  <li>
                    <a href="/vr" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                      {t('nav.vrExperiences')}
                    </a>
                  </li>
                  <li>
                    <a href="/ar" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
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
                    className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    turismoasturias.es
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                    {t('footer.privacy')}
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                    {t('footer.cookies')}
                  </a>
                </li>
                <li>
                  <a href="/legal" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                    {t('footer.legal')}
                  </a>
                </li>
                <li>
                  <a href="/accessibility" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                    {t('footer.accessibility')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright + Developer credit */}
        <div className="border-t border-border/20 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <p className="text-center md:text-left text-xs text-secondary-foreground/60">
                {t('footer.copyright')}
              </p>
              <p className="text-center md:text-right text-xs text-secondary-foreground/60">
                {t('footer.developedBy')}{' '}
                <a 
                  href="https://deusens.com/es" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label="Deusens - Desarrollador de la plataforma (abre en nueva ventana)"
                >
                  Deusens
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
);
