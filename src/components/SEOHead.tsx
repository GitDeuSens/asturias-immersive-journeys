import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schemaData?: Record<string, unknown>;
}

export function SEOHead({ 
  title, 
  description, 
  image = 'https://turismoasturias.es/documents/asturias-og.jpg',
  url,
  type = 'website',
  schemaData 
}: SEOHeadProps) {
  const { i18n } = useTranslation();
  
  const baseTitle = 'Asturias Inmersivo';
  const fullTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} - Explora Asturias en 360° y Realidad Aumentada`;
  const metaDescription = description || 'Descubre Asturias con experiencias inmersivas: tours virtuales 360°, rutas con realidad aumentada, y mucho más. Patrimonio minero, gastronomía y naturaleza.';
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://asturias-inmersivo.es');
  
  // Default Schema.org for tourism website
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: 'Asturias Inmersivo',
    description: metaDescription,
    url: currentUrl,
    image: image,
    touristType: ['Cultural tourism', 'Nature tourism', 'Gastronomy tourism'],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.36,
      longitude: -5.85,
    },
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Principado de Asturias',
      containedInPlace: {
        '@type': 'Country',
        name: 'España',
      },
    },
    potentialAction: {
      '@type': 'ExploreAction',
      target: currentUrl,
    },
  };

  const schema = schemaData || defaultSchema;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={i18n.language} />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="author" content="Principado de Asturias" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />
      
      {/* Keywords */}
      <meta name="keywords" content="Asturias, turismo, tours virtuales, realidad aumentada, AR, VR, 360, patrimonio minero, sidra, naturaleza, Picos de Europa, museos" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Asturias Inmersivo" />
      <meta property="og:locale" content={i18n.language === 'es' ? 'es_ES' : i18n.language === 'fr' ? 'fr_FR' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@TurismoAsturias" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Accessibility */}
      <meta name="theme-color" content="#7AB800" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// Schema generators for specific content types
export function generateRouteSchema(route: {
  title: string;
  description: string;
  image: string;
  distance?: number;
  duration?: string;
  difficulty?: string;
  points?: Array<{ name: string; lat: number; lng: number }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: route.title,
    description: route.description,
    image: route.image,
    touristType: 'Cultural tourism',
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: route.points?.length || 0,
      itemListElement: route.points?.map((point, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'TouristAttraction',
          name: point.name,
          geo: {
            '@type': 'GeoCoordinates',
            latitude: point.lat,
            longitude: point.lng,
          },
        },
      })),
    },
  };
}

export function generatePOISchema(poi: {
  title: string;
  description: string;
  image: string;
  address?: string;
  lat: number;
  lng: number;
  openingHours?: string;
  phone?: string;
  website?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: poi.title,
    description: poi.description,
    image: poi.image,
    address: poi.address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: poi.lat,
      longitude: poi.lng,
    },
    openingHoursSpecification: poi.openingHours,
    telephone: poi.phone,
    url: poi.website,
  };
}

export function generateMuseumSchema(museum: {
  title: string;
  description: string;
  image: string;
  address?: string;
  lat: number;
  lng: number;
  virtualTourUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Museum',
    name: museum.title,
    description: museum.description,
    image: museum.image,
    address: museum.address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: museum.lat,
      longitude: museum.lng,
    },
    hasMap: museum.virtualTourUrl,
    virtualLocation: museum.virtualTourUrl ? {
      '@type': 'VirtualLocation',
      url: museum.virtualTourUrl,
    } : undefined,
  };
}
