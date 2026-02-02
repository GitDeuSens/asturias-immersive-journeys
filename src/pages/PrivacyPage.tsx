import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Shield } from 'lucide-react';

const privacyContent = {
  es: {
    title: 'Política de Privacidad',
    subtitle: 'Protección de datos personales',
    intro: 'En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), le informamos sobre el tratamiento de sus datos personales.',
    controller: {
      title: 'Responsable del tratamiento',
      text: 'Principado de Asturias\nPlaza General Primo de Rivera, 1\n33071 Oviedo, Asturias\nEmail: dpd@asturias.es'
    },
    purposes: {
      title: 'Finalidad del tratamiento',
      list: [
        'Prestar los servicios de la plataforma Asturias Inmersivo',
        'Gestionar la navegación y experiencia del usuario',
        'Análisis estadístico anónimo del uso del sitio web',
        'Mejora continua de los servicios ofrecidos'
      ]
    },
    legal: {
      title: 'Base legal',
      text: 'El tratamiento de sus datos se basa en el interés legítimo del Principado de Asturias para la promoción turística de la región y la prestación de servicios públicos digitales.'
    },
    data: {
      title: 'Datos tratados',
      list: [
        'Datos de navegación (páginas visitadas, tiempo de sesión)',
        'Datos técnicos (tipo de dispositivo, navegador)',
        'Datos de geolocalización (solo si el usuario lo autoriza expresamente)',
        'Preferencias de idioma y tema'
      ]
    },
    retention: {
      title: 'Conservación de datos',
      text: 'Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad para la que se recabaron. Los datos estadísticos anónimos se conservan de forma indefinida.'
    },
    rights: {
      title: 'Derechos del usuario',
      text: 'Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición enviando un correo a:',
      email: 'dpd@asturias.es'
    },
    security: {
      title: 'Seguridad',
      text: 'Hemos implementado medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo, incluyendo cifrado de datos en tránsito y almacenamiento seguro.'
    }
  },
  en: {
    title: 'Privacy Policy',
    subtitle: 'Personal data protection',
    intro: 'In compliance with Regulation (EU) 2016/679 of the European Parliament and Council (GDPR), we inform you about the processing of your personal data.',
    controller: {
      title: 'Data controller',
      text: 'Principality of Asturias\nPlaza General Primo de Rivera, 1\n33071 Oviedo, Asturias, Spain\nEmail: dpd@asturias.es'
    },
    purposes: {
      title: 'Purpose of processing',
      list: [
        'Provide Asturias Inmersivo platform services',
        'Manage navigation and user experience',
        'Anonymous statistical analysis of website usage',
        'Continuous improvement of offered services'
      ]
    },
    legal: {
      title: 'Legal basis',
      text: 'The processing of your data is based on the legitimate interest of the Principality of Asturias for tourist promotion of the region and provision of digital public services.'
    },
    data: {
      title: 'Data processed',
      list: [
        'Navigation data (pages visited, session time)',
        'Technical data (device type, browser)',
        'Geolocation data (only if user expressly authorizes)',
        'Language and theme preferences'
      ]
    },
    retention: {
      title: 'Data retention',
      text: 'Data will be retained for the time necessary to fulfill the purpose for which it was collected. Anonymous statistical data is retained indefinitely.'
    },
    rights: {
      title: 'User rights',
      text: 'You can exercise your rights of access, rectification, erasure, restriction, portability and objection by sending an email to:',
      email: 'dpd@asturias.es'
    },
    security: {
      title: 'Security',
      text: 'We have implemented appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including data encryption in transit and secure storage.'
    }
  },
  fr: {
    title: 'Politique de Confidentialité',
    subtitle: 'Protection des données personnelles',
    intro: 'Conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil (RGPD), nous vous informons sur le traitement de vos données personnelles.',
    controller: {
      title: 'Responsable du traitement',
      text: 'Principauté des Asturies\nPlaza General Primo de Rivera, 1\n33071 Oviedo, Asturies, Espagne\nEmail: dpd@asturias.es'
    },
    purposes: {
      title: 'Finalité du traitement',
      list: [
        'Fournir les services de la plateforme Asturias Inmersivo',
        'Gérer la navigation et l\'expérience utilisateur',
        'Analyse statistique anonyme de l\'utilisation du site web',
        'Amélioration continue des services offerts'
      ]
    },
    legal: {
      title: 'Base légale',
      text: 'Le traitement de vos données est basé sur l\'intérêt légitime de la Principauté des Asturies pour la promotion touristique de la région et la fourniture de services publics numériques.'
    },
    data: {
      title: 'Données traitées',
      list: [
        'Données de navigation (pages visitées, durée de session)',
        'Données techniques (type d\'appareil, navigateur)',
        'Données de géolocalisation (uniquement si l\'utilisateur l\'autorise expressément)',
        'Préférences de langue et de thème'
      ]
    },
    retention: {
      title: 'Conservation des données',
      text: 'Les données seront conservées pendant le temps nécessaire pour remplir la finalité pour laquelle elles ont été collectées. Les données statistiques anonymes sont conservées indéfiniment.'
    },
    rights: {
      title: 'Droits de l\'utilisateur',
      text: 'Vous pouvez exercer vos droits d\'accès, de rectification, d\'effacement, de limitation, de portabilité et d\'opposition en envoyant un email à:',
      email: 'dpd@asturias.es'
    },
    security: {
      title: 'Sécurité',
      text: 'Nous avons mis en œuvre des mesures techniques et organisationnelles appropriées pour garantir un niveau de sécurité adapté au risque, y compris le chiffrement des données en transit et le stockage sécurisé.'
    }
  }
};

export function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.substring(0, 2) as 'es' | 'en' | 'fr') || 'es';
  const content = privacyContent[lang] || privacyContent.es;

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
                <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {content.subtitle}
              </p>
            </div>

            {/* Intro */}
            <section className="mb-8 p-6 bg-muted/50 rounded-xl">
              <p className="text-foreground/80 leading-relaxed">
                {content.intro}
              </p>
            </section>

            {/* Controller */}
            <section className="mb-8 p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {content.controller.title}
              </h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {content.controller.text}
              </p>
            </section>

            {/* Purposes */}
            <section className="mb-8 p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {content.purposes.title}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {content.purposes.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Legal Basis */}
            <section className="mb-8 p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {content.legal.title}
              </h2>
              <p className="text-muted-foreground">
                {content.legal.text}
              </p>
            </section>

            {/* Data Processed */}
            <section className="mb-8 p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {content.data.title}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {content.data.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Retention */}
            <section className="mb-8 p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {content.retention.title}
              </h2>
              <p className="text-muted-foreground">
                {content.retention.text}
              </p>
            </section>

            {/* Rights */}
            <section className="mb-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {content.rights.title}
              </h2>
              <p className="text-muted-foreground mb-4">
                {content.rights.text}
              </p>
              <a 
                href={`mailto:${content.rights.email}`}
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                {content.rights.email}
              </a>
            </section>

            {/* Security */}
            <section className="p-6 bg-card border border-border rounded-xl">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {content.security.title}
              </h2>
              <p className="text-muted-foreground">
                {content.security.text}
              </p>
            </section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPage;
