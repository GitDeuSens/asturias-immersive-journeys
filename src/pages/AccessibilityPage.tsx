import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { 
  Eye, 
  Keyboard, 
  Volume2, 
  MousePointer2, 
  Monitor,
  Languages,
  Contrast,
  ZoomIn
} from 'lucide-react';

const accessibilityContent = {
  es: {
    title: 'Declaración de Accesibilidad',
    subtitle: 'Compromiso con la accesibilidad web',
    intro: 'El Principado de Asturias se compromete a hacer accesible su sitio web de conformidad con el Real Decreto 1112/2018, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público.',
    conformance: {
      title: 'Estado de conformidad',
      text: 'Este sitio web es parcialmente conforme con el nivel AA de las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1 debido a las excepciones y la falta de conformidad de los aspectos que se indican a continuación.'
    },
    features: {
      title: 'Características de accesibilidad',
      list: [
        {
          icon: 'Keyboard',
          title: 'Navegación por teclado',
          description: 'Todo el contenido es accesible mediante teclado. Use Tab para navegar y Enter para activar.'
        },
        {
          icon: 'Volume2',
          title: 'Compatibilidad con lectores de pantalla',
          description: 'El sitio está optimizado para lectores de pantalla como NVDA, JAWS y VoiceOver.'
        },
        {
          icon: 'Contrast',
          title: 'Alto contraste',
          description: 'Los colores cumplen con los requisitos de contraste WCAG 2.1 AA (4.5:1 para texto).'
        },
        {
          icon: 'ZoomIn',
          title: 'Texto redimensionable',
          description: 'El contenido puede ampliarse hasta un 200% sin pérdida de funcionalidad.'
        },
        {
          icon: 'Languages',
          title: 'Multilingüe',
          description: 'Disponible en español, inglés y francés con soporte para cambio de idioma.'
        },
        {
          icon: 'Monitor',
          title: 'Movimiento reducido',
          description: 'Respetamos la preferencia de movimiento reducido del sistema operativo.'
        }
      ]
    },
    contact: {
      title: 'Contacto',
      text: 'Si detecta algún problema de accesibilidad o necesita ayuda para acceder al contenido, puede contactar con nosotros en:',
      email: 'accesibilidad@asturias.es'
    },
    enforcement: {
      title: 'Procedimiento de aplicación',
      text: 'Si una vez realizada una solicitud de información accesible o queja, ésta hubiera sido desestimada, no estuviera de acuerdo con la decisión adoptada, o la respuesta no cumpliera los requisitos, la persona interesada podrá iniciar una reclamación.'
    },
    lastUpdate: 'Última actualización: Febrero 2024'
  },
  en: {
    title: 'Accessibility Statement',
    subtitle: 'Commitment to web accessibility',
    intro: 'The Principality of Asturias is committed to making its website accessible in accordance with Royal Decree 1112/2018, of September 7, on accessibility of websites and mobile applications in the public sector.',
    conformance: {
      title: 'Conformance status',
      text: 'This website is partially compliant with Level AA of the Web Content Accessibility Guidelines (WCAG) 2.1 due to the exceptions and lack of compliance of the aspects indicated below.'
    },
    features: {
      title: 'Accessibility features',
      list: [
        {
          icon: 'Keyboard',
          title: 'Keyboard navigation',
          description: 'All content is accessible via keyboard. Use Tab to navigate and Enter to activate.'
        },
        {
          icon: 'Volume2',
          title: 'Screen reader compatibility',
          description: 'The site is optimized for screen readers like NVDA, JAWS, and VoiceOver.'
        },
        {
          icon: 'Contrast',
          title: 'High contrast',
          description: 'Colors meet WCAG 2.1 AA contrast requirements (4.5:1 for text).'
        },
        {
          icon: 'ZoomIn',
          title: 'Resizable text',
          description: 'Content can be enlarged up to 200% without loss of functionality.'
        },
        {
          icon: 'Languages',
          title: 'Multilingual',
          description: 'Available in Spanish, English, and French with language switching support.'
        },
        {
          icon: 'Monitor',
          title: 'Reduced motion',
          description: 'We respect the reduced motion preference of the operating system.'
        }
      ]
    },
    contact: {
      title: 'Contact',
      text: 'If you detect any accessibility issues or need help accessing content, you can contact us at:',
      email: 'accesibilidad@asturias.es'
    },
    enforcement: {
      title: 'Enforcement procedure',
      text: 'If after submitting a request for accessible information or a complaint, it has been rejected, you do not agree with the decision made, or the response does not meet the requirements, the interested person may file a claim.'
    },
    lastUpdate: 'Last updated: February 2024'
  },
  fr: {
    title: 'Déclaration d\'accessibilité',
    subtitle: 'Engagement en faveur de l\'accessibilité web',
    intro: 'La Principauté des Asturies s\'engage à rendre son site web accessible conformément au décret royal 1112/2018 du 7 septembre sur l\'accessibilité des sites web et des applications mobiles du secteur public.',
    conformance: {
      title: 'État de conformité',
      text: 'Ce site web est partiellement conforme au niveau AA des Directives pour l\'accessibilité du contenu web (WCAG) 2.1 en raison des exceptions et du manque de conformité des aspects indiqués ci-dessous.'
    },
    features: {
      title: 'Fonctionnalités d\'accessibilité',
      list: [
        {
          icon: 'Keyboard',
          title: 'Navigation au clavier',
          description: 'Tout le contenu est accessible via le clavier. Utilisez Tab pour naviguer et Entrée pour activer.'
        },
        {
          icon: 'Volume2',
          title: 'Compatibilité avec les lecteurs d\'écran',
          description: 'Le site est optimisé pour les lecteurs d\'écran comme NVDA, JAWS et VoiceOver.'
        },
        {
          icon: 'Contrast',
          title: 'Contraste élevé',
          description: 'Les couleurs respectent les exigences de contraste WCAG 2.1 AA (4.5:1 pour le texte).'
        },
        {
          icon: 'ZoomIn',
          title: 'Texte redimensionnable',
          description: 'Le contenu peut être agrandi jusqu\'à 200% sans perte de fonctionnalité.'
        },
        {
          icon: 'Languages',
          title: 'Multilingue',
          description: 'Disponible en espagnol, anglais et français avec prise en charge du changement de langue.'
        },
        {
          icon: 'Monitor',
          title: 'Mouvement réduit',
          description: 'Nous respectons la préférence de mouvement réduit du système d\'exploitation.'
        }
      ]
    },
    contact: {
      title: 'Contact',
      text: 'Si vous détectez des problèmes d\'accessibilité ou avez besoin d\'aide pour accéder au contenu, vous pouvez nous contacter à:',
      email: 'accesibilidad@asturias.es'
    },
    enforcement: {
      title: 'Procédure d\'application',
      text: 'Si après avoir soumis une demande d\'information accessible ou une plainte, celle-ci a été rejetée, vous n\'êtes pas d\'accord avec la décision prise, ou la réponse ne répond pas aux exigences, la personne intéressée peut déposer une réclamation.'
    },
    lastUpdate: 'Dernière mise à jour: Février 2024'
  }
};

const iconMap: Record<string, React.ElementType> = {
  Keyboard,
  Volume2,
  Contrast,
  ZoomIn,
  Languages,
  Monitor
};

export function AccessibilityPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.substring(0, 2) as 'es' | 'en' | 'fr') || 'es';
  const content = accessibilityContent[lang] || accessibilityContent.es;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={content.title}
        description={content.intro}
      />
      <AppHeader showRestart={false} />

      <main id="main-content" className="pt-20 pb-12" role="main">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {content.subtitle}
              </p>
            </div>

            {/* Intro */}
            <section className="mb-12">
              <p className="text-foreground/80 leading-relaxed">
                {content.intro}
              </p>
            </section>

            {/* Conformance */}
            <section className="mb-12 p-6 bg-muted/50 rounded-xl">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {content.conformance.title}
              </h2>
              <p className="text-muted-foreground">
                {content.conformance.text}
              </p>
            </section>

            {/* Features Grid */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {content.features.title}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {content.features.list.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Eye;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="p-4 bg-card border border-border rounded-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Contact */}
            <section className="mb-12 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {content.contact.title}
              </h2>
              <p className="text-muted-foreground mb-4">
                {content.contact.text}
              </p>
              <a 
                href={`mailto:${content.contact.email}`}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                {content.contact.email}
              </a>
            </section>

            {/* Enforcement */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {content.enforcement.title}
              </h2>
              <p className="text-muted-foreground">
                {content.enforcement.text}
              </p>
            </section>

            {/* Last Update */}
            <p className="text-sm text-muted-foreground text-center">
              {content.lastUpdate}
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AccessibilityPage;
