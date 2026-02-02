import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Scale } from 'lucide-react';

const legalContent = {
  es: {
    title: 'Aviso Legal',
    owner: {
      title: 'Titular del sitio web',
      text: 'Este sitio web es propiedad del Principado de Asturias, con domicilio en Plaza General Primo de Rivera, 1 - 33071 Oviedo, Asturias.',
      cif: 'CIF: S-3300001-G'
    },
    purpose: {
      title: 'Objeto y finalidad',
      text: 'Asturias Inmersivo es una plataforma de experiencias inmersivas para la promoción turística de Asturias. Ofrece tours virtuales 360°, experiencias de realidad aumentada y rutas interactivas.'
    },
    intellectual: {
      title: 'Propiedad intelectual',
      text: 'Los contenidos de este sitio web, incluyendo textos, imágenes, diseño gráfico, código fuente, logos, marcas y demás elementos, están protegidos por la legislación de propiedad intelectual e industrial. Queda prohibida su reproducción sin autorización expresa.'
    },
    responsibility: {
      title: 'Responsabilidad',
      text: 'El Principado de Asturias no se hace responsable de los daños o perjuicios derivados del uso de este sitio web ni de la información contenida en él. El usuario es el único responsable del uso que haga de los contenidos y servicios.'
    },
    links: {
      title: 'Enlaces externos',
      text: 'Este sitio puede contener enlaces a sitios web de terceros. El Principado de Asturias no se responsabiliza del contenido ni de la política de privacidad de dichos sitios.'
    },
    jurisdiction: {
      title: 'Legislación aplicable',
      text: 'Este aviso legal se rige por la legislación española. Para cualquier controversia se someterá a los tribunales de Oviedo, Asturias.'
    },
    funding: {
      title: 'Financiación',
      text: 'Proyecto financiado por la Unión Europea – NextGenerationEU, en el marco del Plan de Recuperación, Transformación y Resiliencia.'
    }
  },
  en: {
    title: 'Legal Notice',
    owner: {
      title: 'Website owner',
      text: 'This website is owned by the Principality of Asturias, with address at Plaza General Primo de Rivera, 1 - 33071 Oviedo, Asturias, Spain.',
      cif: 'Tax ID: S-3300001-G'
    },
    purpose: {
      title: 'Purpose',
      text: 'Asturias Inmersivo is an immersive experiences platform for tourist promotion of Asturias. It offers 360° virtual tours, augmented reality experiences, and interactive routes.'
    },
    intellectual: {
      title: 'Intellectual property',
      text: 'The contents of this website, including texts, images, graphic design, source code, logos, trademarks, and other elements, are protected by intellectual and industrial property legislation. Their reproduction without express authorization is prohibited.'
    },
    responsibility: {
      title: 'Liability',
      text: 'The Principality of Asturias is not responsible for damages arising from the use of this website or the information contained therein. The user is solely responsible for the use made of the contents and services.'
    },
    links: {
      title: 'External links',
      text: 'This site may contain links to third-party websites. The Principality of Asturias is not responsible for the content or privacy policy of such sites.'
    },
    jurisdiction: {
      title: 'Applicable law',
      text: 'This legal notice is governed by Spanish law. Any disputes will be submitted to the courts of Oviedo, Asturias.'
    },
    funding: {
      title: 'Funding',
      text: 'Project funded by the European Union – NextGenerationEU, within the framework of the Recovery, Transformation and Resilience Plan.'
    }
  },
  fr: {
    title: 'Mentions Légales',
    owner: {
      title: 'Propriétaire du site web',
      text: 'Ce site web appartient à la Principauté des Asturies, avec siège social à Plaza General Primo de Rivera, 1 - 33071 Oviedo, Asturies, Espagne.',
      cif: 'N° fiscal: S-3300001-G'
    },
    purpose: {
      title: 'Objet et finalité',
      text: 'Asturias Inmersivo est une plateforme d\'expériences immersives pour la promotion touristique des Asturies. Elle propose des visites virtuelles à 360°, des expériences de réalité augmentée et des itinéraires interactifs.'
    },
    intellectual: {
      title: 'Propriété intellectuelle',
      text: 'Les contenus de ce site web, y compris les textes, images, design graphique, code source, logos, marques et autres éléments, sont protégés par la législation sur la propriété intellectuelle et industrielle. Leur reproduction sans autorisation expresse est interdite.'
    },
    responsibility: {
      title: 'Responsabilité',
      text: 'La Principauté des Asturies n\'est pas responsable des dommages découlant de l\'utilisation de ce site web ou des informations qu\'il contient. L\'utilisateur est seul responsable de l\'utilisation qu\'il fait des contenus et services.'
    },
    links: {
      title: 'Liens externes',
      text: 'Ce site peut contenir des liens vers des sites web tiers. La Principauté des Asturies n\'est pas responsable du contenu ou de la politique de confidentialité de ces sites.'
    },
    jurisdiction: {
      title: 'Législation applicable',
      text: 'Ces mentions légales sont régies par la loi espagnole. Tout litige sera soumis aux tribunaux d\'Oviedo, Asturies.'
    },
    funding: {
      title: 'Financement',
      text: 'Projet financé par l\'Union Européenne – NextGenerationEU, dans le cadre du Plan de Relance, Transformation et Résilience.'
    }
  }
};

export function LegalPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.substring(0, 2) as 'es' | 'en' | 'fr') || 'es';
  const content = legalContent[lang] || legalContent.es;

  const sections = [
    content.owner,
    content.purpose,
    content.intellectual,
    content.responsibility,
    content.links,
    content.jurisdiction,
    content.funding
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={content.title}
        description={content.purpose.text}
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
                <Scale className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {content.title}
              </h1>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.section
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="p-6 bg-card border border-border rounded-xl"
                >
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.text}
                  </p>
                  {'cif' in section && section.cif && (
                    <p className="mt-2 text-sm text-muted-foreground font-mono">
                      {String(section.cif)}
                    </p>
                  )}
                </motion.section>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LegalPage;
