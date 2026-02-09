#!/usr/bin/env node
// ============================================
// Setup Directus UI Translations Collection
// Creates ui_translations + ui_translations_translations (Content Translations pattern)
// Then populates all UI strings from i18n
// ============================================

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@asturiasxr.com';
const ADMIN_PASSWORD = '6xkMbCgPA636ZNCc';

let _token = null;
async function getToken() {
  if (_token) return _token;
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await res.json();
  _token = json.data.access_token;
  return _token;
}

async function api(method, path, body) {
  const token = await getToken();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${DIRECTUS_URL}${path}`, opts);
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

// ============ STEP 1: Create collections ============

async function createCollections() {
  console.log('📦 Creating ui_translations collection...');

  // Check if collection already exists
  const check = await api('GET', '/collections/ui_translations');
  if (check.status === 200) {
    console.log('  ⚠️  Collection ui_translations already exists, skipping creation');
    return;
  }

  // Create main collection
  const mainRes = await api('POST', '/collections', {
    collection: 'ui_translations',
    meta: {
      icon: 'translate',
      note: 'UI translations for the application (keys and translated values)',
      display_template: '{{key}}',
      hidden: false,
      singleton: false,
      translations: null,
      archive_field: null,
      archive_app_filter: true,
      archive_value: null,
      unarchive_value: null,
      sort_field: 'key',
      accountability: 'all',
      color: null,
      item_duplication_fields: null,
      sort: 1,
      group: null,
      collapse: 'open',
      preview_url: null,
      versioning: false,
    },
    schema: {},
  });

  if (mainRes.status !== 200) {
    console.error('❌ Failed to create ui_translations collection:', mainRes.data);
    return;
  }

  console.log('  ✅ Created ui_translations collection');

  // Create junction collection for translations (like categories_translations)
  const junctionRes = await api('POST', '/collections', {
    collection: 'ui_translations_translations',
    meta: {
      icon: 'language',
      note: 'Junction table for UI translations (many-to-many with languages)',
      hidden: true,
      singleton: false,
      translations: null,
      archive_field: null,
      archive_app_filter: false,
      archive_value: null,
      unarchive_value: null,
      sort_field: null,
      accountability: 'all',
      color: null,
      item_duplication_fields: null,
      sort: null,
      group: null,
      collapse: 'open',
      preview_url: null,
      versioning: false,
    },
    schema: {},
  });

  if (junctionRes.status !== 200) {
    console.error('❌ Failed to create ui_translations_translations collection:', junctionRes.data);
    return;
  }

  console.log('  ✅ Created ui_translations_translations junction collection');
}

// ============ STEP 2: Create fields ============

async function createFields() {
  console.log('\n🔧 Creating fields...');

  const fields = [
    // Main collection fields
    {
      collection: 'ui_translations',
      field: 'id',
      type: 'integer',
      schema: { is_primary_key: true, has_auto_increment: true },
      meta: { hidden: true },
    },
    {
      collection: 'ui_translations',
      field: 'status',
      type: 'string',
      schema: { default_value: 'published' },
      meta: {
        interface: 'select-dropdown',
        display: 'labels',
        width: 'half',
        options: {
          choices: [
            { text: 'Published', value: 'published', foreground: '#FFFFFF', background: '#2ECDA7' },
            { text: 'Draft', value: 'draft', foreground: '#18222F', background: '#D3DAE4' },
            { text: 'Archived', value: 'archived', foreground: '#FFFFFF', background: '#A2B5CD' },
          ],
        },
        display_options: {
          showAsDot: true,
          choices: [
            { text: 'Published', value: 'published', foreground: '#FFFFFF', background: '#2ECDA7' },
            { text: 'Draft', value: 'draft', foreground: '#18222F', background: '#D3DAE4' },
            { text: 'Archived', value: 'archived', foreground: '#FFFFFF', background: '#A2B5CD' },
          ],
        },
      },
    },
    {
      collection: 'ui_translations',
      field: 'sort',
      type: 'integer',
      schema: {},
      meta: { hidden: true },
    },
    {
      collection: 'ui_translations',
      field: 'key',
      type: 'string',
      schema: { is_unique: true, is_nullable: false },
      meta: {
        interface: 'input',
        display: 'raw',
        width: 'full',
        note: 'Unique translation key, e.g. "common.loading", "nav.home", "routes.title"',
        required: true,
        sort: 1,
        options: {
          placeholder: 'e.g. common.loading',
          font: 'monospace',
        },
      },
    },
    {
      collection: 'ui_translations',
      field: 'group',
      type: 'string',
      schema: { is_nullable: true },
      meta: {
        interface: 'select-dropdown',
        display: 'labels',
        width: 'half',
        note: 'Category group for organizing translations',
        sort: 2,
        options: {
          choices: [
            { text: 'Common', value: 'common' },
            { text: 'Navigation', value: 'nav' },
            { text: 'Header', value: 'header' },
            { text: 'Onboarding', value: 'onboarding' },
            { text: 'Routes', value: 'routes' },
            { text: 'Difficulty', value: 'difficulty' },
            { text: 'POI / Points', value: 'poi' },
            { text: 'Tours 360', value: 'tours360' },
            { text: 'VR', value: 'vr' },
            { text: 'Map', value: 'map' },
            { text: 'Navigation (directions)', value: 'navigation' },
            { text: 'Network', value: 'network' },
            { text: 'Categories', value: 'category' },
            { text: 'Share', value: 'share' },
            { text: 'Accessibility', value: 'a11y' },
            { text: 'Settings', value: 'settings' },
            { text: 'Footer', value: 'footer' },
            { text: 'Cookies', value: 'cookies' },
            { text: 'Errors', value: 'error' },
          ],
          allowOther: true,
        },
      },
    },
    {
      collection: 'ui_translations',
      field: 'context',
      type: 'string',
      schema: { is_nullable: true },
      meta: {
        interface: 'input',
        width: 'half',
        note: 'Optional context/description for translators',
        sort: 3,
        options: {
          placeholder: 'e.g. Button label on tour page',
        },
      },
    },
    // Translations relation field (M2M via Content Translations)
    {
      collection: 'ui_translations',
      field: 'translations',
      type: 'alias',
      meta: {
        interface: 'translations',
        display: 'translations',
        width: 'full',
        sort: 4,
        options: {
          languageField: 'name',
          defaultLanguage: 'es',
        },
        special: ['translations'],
      },
    },

    // Junction table fields
    {
      collection: 'ui_translations_translations',
      field: 'id',
      type: 'integer',
      schema: { is_primary_key: true, has_auto_increment: true },
      meta: { hidden: true },
    },
    {
      collection: 'ui_translations_translations',
      field: 'ui_translations_id',
      type: 'integer',
      schema: { is_nullable: true, foreign_key_table: 'ui_translations', foreign_key_column: 'id' },
      meta: { hidden: true },
    },
    {
      collection: 'ui_translations_translations',
      field: 'languages_code',
      type: 'string',
      schema: { is_nullable: true, foreign_key_table: 'languages', foreign_key_column: 'code' },
      meta: { hidden: true },
    },
    {
      collection: 'ui_translations_translations',
      field: 'name',
      type: 'text',
      schema: { is_nullable: true },
      meta: {
        interface: 'input-multiline',
        display: 'raw',
        width: 'full',
        note: 'Translated text value',
        options: {
          placeholder: 'Translation text...',
        },
      },
    },
  ];

  for (const field of fields) {
    const res = await api('POST', `/fields/${field.collection}`, field);
    const ok = res.status === 200 || res.status === 204;
    // Field might already exist
    if (!ok && res.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`  ⏭️  ${field.collection}.${field.field} (already exists)`);
    } else {
      console.log(`  ${ok ? '✅' : '❌'} ${field.collection}.${field.field}: ${res.status}`);
      if (!ok) console.log(`     ${JSON.stringify(res.data).substring(0, 200)}`);
    }
  }

  // Create the M2M relation
  console.log('\n🔗 Creating translations relation...');
  const relRes = await api('POST', '/relations', {
    collection: 'ui_translations_translations',
    field: 'ui_translations_id',
    related_collection: 'ui_translations',
    meta: {
      one_field: 'translations',
      junction_field: 'languages_code',
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });
  console.log(`  ${relRes.status === 200 || relRes.status === 204 ? '✅' : '⚠️'} translations relation: ${relRes.status}`);

  const langRelRes = await api('POST', '/relations', {
    collection: 'ui_translations_translations',
    field: 'languages_code',
    related_collection: 'languages',
    meta: {},
    schema: {
      on_delete: 'SET NULL',
    },
  });
  console.log(`  ${langRelRes.status === 200 || langRelRes.status === 204 ? '✅' : '⚠️'} languages relation: ${langRelRes.status}`);
}

// ============ STEP 3: Set public read permissions ============

async function setPermissions() {
  console.log('\n🔐 Setting public read permissions...');

  for (const collection of ['ui_translations', 'ui_translations_translations']) {
    const res = await api('POST', '/permissions', {
      role: null, // public
      collection,
      action: 'read',
      fields: ['*'],
    });
    console.log(`  ${res.status === 200 || res.status === 204 ? '✅' : '⚠️'} ${collection} public READ: ${res.status}`);
  }
}

// ============ STEP 4: Populate translations ============

async function populateTranslations() {
  console.log('\n📝 Populating UI translations...\n');

  // All translations from i18n/index.ts
  const translations = {
    // Common
    "common.loading": { es: "Cargando...", en: "Loading...", fr: "Chargement...", group: "common" },
    "common.error": { es: "Error", en: "Error", fr: "Erreur", group: "common" },
    "common.close": { es: "Cerrar", en: "Close", fr: "Fermer", group: "common" },
    "common.back": { es: "Volver", en: "Back", fr: "Retour", group: "common" },
    "common.next": { es: "Siguiente", en: "Next", fr: "Suivant", group: "common" },
    "common.restart": { es: "Reiniciar", en: "Restart", fr: "Redémarrer", group: "common" },
    "common.share": { es: "Compartir", en: "Share", fr: "Partager", group: "common" },
    "common.download": { es: "Descargar", en: "Download", fr: "Télécharger", group: "common" },
    "common.search": { es: "Buscar", en: "Search", fr: "Rechercher", group: "common" },
    "common.filter": { es: "Filtrar", en: "Filter", fr: "Filtrer", group: "common" },
    "common.all": { es: "Todos", en: "All", fr: "Tous", group: "common" },
    "common.results": { es: "resultados", en: "results", fr: "résultats", group: "common" },
    "common.viewDetails": { es: "Ver detalles", en: "View details", fr: "Voir les détails", group: "common" },
    "common.viewList": { es: "Ver lista", en: "View list", fr: "Vue liste", group: "common" },
    "common.viewMap": { es: "Ver mapa", en: "View map", fr: "Vue carte", group: "common" },

    // Navigation
    "nav.home": { es: "Inicio", en: "Home", fr: "Accueil", group: "nav" },
    "nav.tours360": { es: "Tours 360°", en: "360° Tours", fr: "Tours 360°", group: "nav" },
    "nav.routes": { es: "Rutas Inmersivas", en: "Immersive Routes", fr: "Itinéraires Immersifs", group: "nav" },
    "nav.map": { es: "Mapa", en: "Map", fr: "Carte", group: "nav" },
    "nav.vrExperiences": { es: "Experiencias VR", en: "VR Experiences", fr: "Expériences VR", group: "nav" },
    "nav.arExperiences": { es: "Experiencias AR", en: "AR Experiences", fr: "Expériences AR", group: "nav" },
    "nav.help": { es: "Ayuda", en: "Help", fr: "Aide", group: "nav" },

    // Header
    "header.asturiasInmersivo": { es: "Asturias Inmersivo", en: "Asturias Immersive", fr: "Asturies Immersif", group: "header" },
    "header.skipToContent": { es: "Saltar al contenido principal", en: "Skip to main content", fr: "Aller au contenu principal", group: "header" },

    // Onboarding
    "onboarding.discoverFrom": { es: "Descubriendo desde casa", en: "Discovering from home", fr: "Découvrir depuis chez soi", group: "onboarding" },
    "onboarding.discoverFromDesc": { es: "Explora Asturias virtualmente", en: "Explore Asturias virtually", fr: "Explorez les Asturies virtuellement", group: "onboarding" },
    "onboarding.alreadyHere": { es: "Ya estoy en Asturias", en: "I'm already in Asturias", fr: "Je suis déjà aux Asturies", group: "onboarding" },
    "onboarding.alreadyHereDesc": { es: "Contenido según tu ubicación", en: "Location-based content", fr: "Contenu basé sur votre position", group: "onboarding" },
    "onboarding.selectMode": { es: "¿Cómo quieres explorar?", en: "How do you want to explore?", fr: "Comment voulez-vous explorer ?", group: "onboarding" },
    "onboarding.selectExperience": { es: "Elige tu experiencia", en: "Choose your experience", fr: "Choisissez votre expérience", group: "onboarding" },
    "onboarding.tours360": { es: "Tours Virtuales 360°", en: "360° Virtual Tours", fr: "Visites Virtuelles 360°", group: "onboarding" },
    "onboarding.tours360Desc": { es: "11 museos y equipamientos", en: "11 museums and venues", fr: "11 musées et équipements", group: "onboarding" },
    "onboarding.immersiveRoutes": { es: "Rutas Inmersivas", en: "Immersive Routes", fr: "Itinéraires Immersifs", group: "onboarding" },
    "onboarding.immersiveRoutesDesc": { es: "29 rutas AR/360°", en: "29 AR/360° routes", fr: "29 itinéraires AR/360°", group: "onboarding" },

    // Routes
    "routes.title": { es: "Rutas Inmersivas", en: "Immersive Routes", fr: "Itinéraires Immersifs", group: "routes" },
    "routes.search": { es: "Buscar rutas...", en: "Search routes...", fr: "Rechercher des itinéraires...", group: "routes" },
    "routes.fitBounds": { es: "Ajustar vista", en: "Fit view", fr: "Ajuster la vue", group: "routes" },
    "routes.enterRoute": { es: "Entrar en la ruta", en: "Enter route", fr: "Entrer dans l'itinéraire", group: "routes" },
    "routes.exitRoute": { es: "Salir de la ruta", en: "Exit route", fr: "Quitter l'itinéraire", group: "routes" },
    "routes.duration": { es: "Duración", en: "Duration", fr: "Durée", group: "routes" },
    "routes.difficulty": { es: "Dificultad", en: "Difficulty", fr: "Difficulté", group: "routes" },
    "routes.points": { es: "puntos", en: "points", fr: "points", group: "routes" },
    "routes.distance": { es: "Distancia", en: "Distance", fr: "Distance", group: "routes" },
    "routes.circular": { es: "Ruta circular", en: "Circular route", fr: "Itinéraire circulaire", group: "routes" },
    "routes.linear": { es: "Ruta lineal", en: "Linear route", fr: "Itinéraire linéaire", group: "routes" },
    "routes.tour360Available": { es: "Tour 360° disponible", en: "360° tour available", fr: "Tour 360° disponible", group: "routes" },
    "routes.noPoints": { es: "Los puntos de esta ruta están en desarrollo", en: "Points for this route are in development", fr: "Les points de cet itinéraire sont en développement", group: "routes" },
    "routes.progress": { es: "Progreso", en: "Progress", fr: "Progression", group: "routes" },
    "routes.exploring": { es: "Explorando", en: "Exploring", fr: "Exploration", group: "routes" },
    "routes.howToGet": { es: "Cómo llegar", en: "How to get there", fr: "Comment y aller", group: "routes" },

    // Difficulty
    "difficulty.easy": { es: "Fácil", en: "Easy", fr: "Facile", group: "difficulty" },
    "difficulty.medium": { es: "Media", en: "Medium", fr: "Moyenne", group: "difficulty" },
    "difficulty.hard": { es: "Difícil", en: "Hard", fr: "Difficile", group: "difficulty" },

    // POI / Points
    "poi.arExperience": { es: "Experiencia de Realidad Aumentada", en: "Augmented Reality Experience", fr: "Expérience de Réalité Augmentée", group: "poi" },
    "poi.launchAR": { es: "Abrir experiencia AR", en: "Launch AR experience", fr: "Lancer l'expérience AR", group: "poi" },
    "poi.scanQR": { es: "Escanea con tu móvil", en: "Scan with your phone", fr: "Scannez avec votre téléphone", group: "poi" },
    "poi.scanQRDesc": { es: "Apunta la cámara de tu móvil al código QR para abrir la experiencia de Realidad Aumentada", en: "Point your phone camera at the QR code to open the Augmented Reality experience", fr: "Pointez la caméra de votre téléphone vers le code QR pour ouvrir l'expérience de Réalité Augmentée", group: "poi" },
    "poi.arInstructions": { es: "Instrucciones AR", en: "AR Instructions", fr: "Instructions AR", group: "poi" },
    "poi.location": { es: "Ubicación", en: "Location", fr: "Emplacement", group: "poi" },
    "poi.open360": { es: "Abrir tour 360°", en: "Open 360° tour", fr: "Ouvrir le tour 360°", group: "poi" },
    "poi.playVideo": { es: "Reproducir vídeo", en: "Play video", fr: "Lire la vidéo", group: "poi" },
    "poi.downloadPDF": { es: "Descargar PDF", en: "Download PDF", fr: "Télécharger le PDF", group: "poi" },
    "poi.listenAudio": { es: "Escuchar audioguía", en: "Listen to audioguide", fr: "Écouter l'audioguide", group: "poi" },
    "poi.tryARDesktop": { es: "Probar en este dispositivo", en: "Try on this device", fr: "Essayer sur cet appareil", group: "poi" },
    "poi.arRecommendation": { es: "Recomendado: usa tu móvil para la mejor experiencia AR", en: "Recommended: use your phone for the best AR experience", fr: "Recommandé : utilisez votre téléphone pour la meilleure expérience AR", group: "poi" },
    "poi.gallery": { es: "Galería de imágenes", en: "Image gallery", fr: "Galerie d'images", group: "poi" },
    "poi.practicalInfo": { es: "Información práctica", en: "Practical information", fr: "Informations pratiques", group: "poi" },
    "poi.schedule": { es: "Horarios", en: "Schedule", fr: "Horaires", group: "poi" },
    "poi.prices": { es: "Precios", en: "Prices", fr: "Prix", group: "poi" },
    "poi.contact": { es: "Contacto", en: "Contact", fr: "Contact", group: "poi" },
    "poi.contentAvailable": { es: "Contenido disponible", en: "Available content", fr: "Contenu disponible", group: "poi" },

    // Tours 360
    "tours360.title": { es: "Tours Virtuales 360°", en: "360° Virtual Tours", fr: "Visites Virtuelles 360°", group: "tours360" },
    "tours360.subtitle": { es: "Explora Asturias desde cualquier lugar", en: "Explore Asturias from anywhere", fr: "Explorez les Asturies de n'importe où", group: "tours360" },
    "tours360.startTour": { es: "Iniciar Tour", en: "Start Tour", fr: "Démarrer la visite", group: "tours360" },
    "tours360.scenes": { es: "escenas", en: "scenes", fr: "scènes", group: "tours360" },
    "tours360.allCategories": { es: "Todas las categorías", en: "All categories", fr: "Toutes les catégories", group: "tours360" },

    // VR Experiences
    "vr.title": { es: "Experiencias VR", en: "VR Experiences", fr: "Expériences VR", group: "vr" },
    "vr.subtitle": { es: "Sumérgete en Asturias con realidad virtual", en: "Immerse yourself in Asturias with virtual reality", fr: "Plongez dans les Asturies avec la réalité virtuelle", group: "vr" },
    "vr.downloadAPK": { es: "Descargar APK", en: "Download APK", fr: "Télécharger APK", group: "vr" },
    "vr.duration": { es: "Duración estimada", en: "Estimated duration", fr: "Durée estimée", group: "vr" },
    "vr.difficulty": { es: "Dificultad", en: "Difficulty", fr: "Difficulté", group: "vr" },
    "vr.instructions": { es: "Instrucciones de uso", en: "Usage instructions", fr: "Instructions d'utilisation", group: "vr" },
    "vr.requirements": { es: "Requisitos", en: "Requirements", fr: "Exigences", group: "vr" },
    "vr.compatible": { es: "Compatible con", en: "Compatible with", fr: "Compatible avec", group: "vr" },

    // Map
    "map.yourLocation": { es: "Tu ubicación", en: "Your location", fr: "Votre position", group: "map" },
    "map.locationActive": { es: "Ubicación activa", en: "Location active", fr: "Position active", group: "map" },
    "map.enableLocation": { es: "Activar ubicación", en: "Enable location", fr: "Activer la position", group: "map" },
    "map.clusterPoints": { es: "puntos de interés", en: "points of interest", fr: "points d'intérêt", group: "map" },

    // Navigation (directions)
    "navigation.getDirections": { es: "Cómo llegar", en: "Get directions", fr: "Itinéraire", group: "navigation" },
    "navigation.walking": { es: "A pie", en: "Walking", fr: "À pied", group: "navigation" },
    "navigation.driving": { es: "En coche", en: "Driving", fr: "En voiture", group: "navigation" },
    "navigation.chooseMode": { es: "Elige cómo llegar", en: "Choose how to get there", fr: "Choisissez comment y aller", group: "navigation" },
    "navigation.fromYourLocation": { es: "Desde tu ubicación", en: "From your location", fr: "Depuis votre position", group: "navigation" },
    "navigation.nearestPoint": { es: "Punto más cercano", en: "Nearest point", fr: "Point le plus proche", group: "navigation" },
    "navigation.startHere": { es: "Empezar aquí", en: "Start here", fr: "Commencer ici", group: "navigation" },
    "navigation.nearYou": { es: "Cerca de ti", en: "Near you", fr: "Près de vous", group: "navigation" },
    "navigation.withinRadius": { es: "en un radio de", en: "within", fr: "dans un rayon de", group: "navigation" },
    "navigation.noLocation": { es: "Activa tu ubicación para ver qué tienes cerca", en: "Enable location to see what's nearby", fr: "Activez la localisation pour voir ce qui est proche", group: "navigation" },
    "navigation.nothingNearby": { es: "No hay puntos cercanos en un radio de 50km", en: "No points within 50km radius", fr: "Aucun point dans un rayon de 50km", group: "navigation" },
    "navigation.calculatingRoute": { es: "Calculando ruta...", en: "Calculating route...", fr: "Calcul de l'itinéraire...", group: "navigation" },
    "navigation.error": { es: "Error", en: "Error", fr: "Erreur", group: "navigation" },
    "navigation.retry": { es: "Reintentar", en: "Retry", fr: "Réessayer", group: "navigation" },
    "navigation.arrived": { es: "¡Has llegado!", en: "You arrived!", fr: "Vous êtes arrivé !", group: "navigation" },
    "navigation.arrivedDesc": { es: "Has llegado a tu destino", en: "You have arrived at your destination", fr: "Vous êtes arrivé à destination", group: "navigation" },
    "navigation.recalculate": { es: "Recalcular", en: "Recalculate", fr: "Recalculer", group: "navigation" },
    "navigation.remaining": { es: "restante", en: "remaining", fr: "restant", group: "navigation" },
    "navigation.stepOf": { es: "Paso", en: "Step", fr: "Étape", group: "navigation" },
    "navigation.of": { es: "de", en: "of", fr: "sur", group: "navigation" },
    "navigation.allSteps": { es: "Todas las indicaciones", en: "All directions", fr: "Toutes les indications", group: "navigation" },
    "navigation.stopNavigation": { es: "Detener navegación", en: "Stop navigation", fr: "Arrêter la navigation", group: "navigation" },
    "navigation.selectMode": { es: "Selecciona modo de transporte", en: "Select transport mode", fr: "Sélectionnez le mode de transport", group: "navigation" },
    "navigation.start": { es: "Iniciar", en: "Start", fr: "Démarrer", group: "navigation" },
    "navigation.offlineMode": { es: "Modo sin conexión", en: "Offline mode", fr: "Mode hors ligne", group: "navigation" },
    "navigation.progress": { es: "Progreso", en: "Progress", fr: "Progression", group: "navigation" },
    "navigation.inApp": { es: "Navegar en app", en: "Navigate in app", fr: "Naviguer dans l'app", group: "navigation" },
    "navigation.externalMaps": { es: "Abrir en Maps", en: "Open in Maps", fr: "Ouvrir dans Maps", group: "navigation" },
    "navigation.stepByStep": { es: "Paso a paso con mapa en tiempo real", en: "Step-by-step with real-time map", fr: "Pas à pas avec carte en temps réel", group: "navigation" },
    "navigation.cachedRoutes": { es: "rutas guardadas disponibles", en: "saved routes available", fr: "itinéraires sauvegardés disponibles", group: "navigation" },

    // Network
    "network.offline": { es: "Sin conexión a Internet", en: "No internet connection", fr: "Pas de connexion Internet", group: "network" },
    "network.offlineDescription": { es: "Algunas funciones pueden no estar disponibles", en: "Some features may not be available", fr: "Certaines fonctionnalités peuvent ne pas être disponibles", group: "network" },
    "network.offlineWithCache": { es: "Modo sin conexión - Datos disponibles", en: "Offline mode - Data available", fr: "Mode hors ligne - Données disponibles", group: "network" },
    "network.backOnline": { es: "¡Conexión restaurada!", en: "Connection restored!", fr: "Connexion restaurée !", group: "network" },
    "network.slowConnection": { es: "Conexión lenta detectada", en: "Slow connection detected", fr: "Connexion lente détectée", group: "network" },
    "network.slowConnectionDescription": { es: "El contenido puede tardar más en cargar", en: "Content may take longer to load", fr: "Le contenu peut prendre plus de temps à charger", group: "network" },

    // Categories
    "category.nature": { es: "Naturaleza", en: "Nature", fr: "Nature", group: "category" },
    "category.heritage": { es: "Patrimonio", en: "Heritage", fr: "Patrimoine", group: "category" },
    "category.adventure": { es: "Aventura", en: "Adventure", fr: "Aventure", group: "category" },
    "category.gastronomy": { es: "Gastronomía", en: "Gastronomy", fr: "Gastronomie", group: "category" },
    "category.culture": { es: "Cultura", en: "Culture", fr: "Culture", group: "category" },

    // Share
    "share.title": { es: "Compartir", en: "Share", fr: "Partager", group: "share" },
    "share.copyLink": { es: "Copiar enlace", en: "Copy link", fr: "Copier le lien", group: "share" },
    "share.linkCopied": { es: "Enlace copiado", en: "Link copied", fr: "Lien copié", group: "share" },
    "share.whatsapp": { es: "Compartir en WhatsApp", en: "Share on WhatsApp", fr: "Partager sur WhatsApp", group: "share" },
    "share.facebook": { es: "Compartir en Facebook", en: "Share on Facebook", fr: "Partager sur Facebook", group: "share" },
    "share.twitter": { es: "Compartir en Twitter", en: "Share on Twitter", fr: "Partager sur Twitter", group: "share" },
    "share.email": { es: "Enviar por email", en: "Send by email", fr: "Envoyer par email", group: "share" },

    // Accessibility
    "a11y.mainNavigation": { es: "Navegación principal", en: "Main navigation", fr: "Navigation principale", group: "a11y" },
    "a11y.closeModal": { es: "Cerrar ventana modal", en: "Close modal window", fr: "Fermer la fenêtre modale", group: "a11y" },
    "a11y.openMenu": { es: "Abrir menú", en: "Open menu", fr: "Ouvrir le menu", group: "a11y" },
    "a11y.closeMenu": { es: "Cerrar menú", en: "Close menu", fr: "Fermer le menu", group: "a11y" },
    "a11y.languageSelector": { es: "Selector de idioma", en: "Language selector", fr: "Sélecteur de langue", group: "a11y" },
    "a11y.currentLanguage": { es: "Idioma actual", en: "Current language", fr: "Langue actuelle", group: "a11y" },
    "a11y.mapInteractive": { es: "Mapa interactivo", en: "Interactive map", fr: "Carte interactive", group: "a11y" },
    "a11y.zoomIn": { es: "Acercar", en: "Zoom in", fr: "Zoom avant", group: "a11y" },
    "a11y.zoomOut": { es: "Alejar", en: "Zoom out", fr: "Zoom arrière", group: "a11y" },
    "a11y.imageGallery": { es: "Galería de imágenes", en: "Image gallery", fr: "Galerie d'images", group: "a11y" },
    "a11y.playPause": { es: "Reproducir/Pausar", en: "Play/Pause", fr: "Lecture/Pause", group: "a11y" },
    "a11y.fullscreen": { es: "Pantalla completa", en: "Fullscreen", fr: "Plein écran", group: "a11y" },

    // Settings
    "settings.language": { es: "Idioma", en: "Language", fr: "Langue", group: "settings" },
    "settings.theme": { es: "Tema", en: "Theme", fr: "Thème", group: "settings" },
    "settings.lightTheme": { es: "Claro", en: "Light", fr: "Clair", group: "settings" },
    "settings.darkTheme": { es: "Oscuro", en: "Dark", fr: "Sombre", group: "settings" },
    "settings.systemTheme": { es: "Sistema", en: "System", fr: "Système", group: "settings" },

    // Footer
    "footer.privacy": { es: "Política de privacidad", en: "Privacy Policy", fr: "Politique de confidentialité", group: "footer" },
    "footer.cookies": { es: "Política de cookies", en: "Cookie Policy", fr: "Politique de cookies", group: "footer" },
    "footer.accessibility": { es: "Declaración de accesibilidad", en: "Accessibility Statement", fr: "Déclaration d'accessibilité", group: "footer" },
    "footer.contact": { es: "Contacto", en: "Contact", fr: "Contact", group: "footer" },
    "footer.legal": { es: "Aviso legal", en: "Legal Notice", fr: "Mentions légales", group: "footer" },
    "footer.fundedBy": { es: "Financiado por la Unión Europea – NextGenerationEU", en: "Funded by the European Union – NextGenerationEU", fr: "Financé par l'Union Européenne – NextGenerationEU", group: "footer" },
    "footer.copyright": { es: "© 2026 Principado de Asturias. Todos los derechos reservados.", en: "© 2026 Principality of Asturias. All rights reserved.", fr: "© 2026 Principauté des Asturies. Tous droits réservés.", group: "footer" },
    "footer.developedBy": { es: "Desarrollado por", en: "Developed by", fr: "Développé par", group: "footer" },
    "footer.arExperiences": { es: "Experiencias AR", en: "AR Experiences", fr: "Expériences AR", group: "footer" },

    // Cookie Consent
    "cookies.consentTitle": { es: "Utilizamos cookies", en: "We use cookies", fr: "Nous utilisons des cookies", group: "cookies" },
    "cookies.consentDescription": { es: "Usamos cookies para mejorar tu experiencia de navegación, mostrar contenido personalizado y analizar nuestro tráfico.", en: "We use cookies to improve your browsing experience, show personalized content and analyze our traffic.", fr: "Nous utilisons des cookies pour améliorer votre expérience de navigation, afficher du contenu personnalisé et analyser notre trafic.", group: "cookies" },
    "cookies.learnMore": { es: "Más información", en: "Learn more", fr: "En savoir plus", group: "cookies" },
    "cookies.acceptAll": { es: "Aceptar todas", en: "Accept all", fr: "Tout accepter", group: "cookies" },
    "cookies.rejectAll": { es: "Rechazar", en: "Reject", fr: "Refuser", group: "cookies" },
    "cookies.customize": { es: "Personalizar", en: "Customize", fr: "Personnaliser", group: "cookies" },
    "cookies.savePreferences": { es: "Guardar preferencias", en: "Save preferences", fr: "Enregistrer les préférences", group: "cookies" },
    "cookies.necessary": { es: "Cookies necesarias", en: "Necessary cookies", fr: "Cookies nécessaires", group: "cookies" },
    "cookies.necessaryDesc": { es: "Esenciales para el funcionamiento del sitio web.", en: "Essential for the website to function properly.", fr: "Essentiels au bon fonctionnement du site.", group: "cookies" },
    "cookies.analytics": { es: "Cookies analíticas", en: "Analytics cookies", fr: "Cookies analytiques", group: "cookies" },
    "cookies.analyticsDesc": { es: "Nos ayudan a entender cómo usas el sitio.", en: "Help us understand how you use the site.", fr: "Nous aident à comprendre comment vous utilisez le site.", group: "cookies" },
    "cookies.marketing": { es: "Cookies de marketing", en: "Marketing cookies", fr: "Cookies marketing", group: "cookies" },
    "cookies.marketingDesc": { es: "Utilizadas para mostrarte anuncios relevantes.", en: "Used to show you relevant ads.", fr: "Utilisés pour vous montrer des publicités pertinentes.", group: "cookies" },
    "cookies.required": { es: "Obligatorio", en: "Required", fr: "Requis", group: "cookies" },

    // Errors
    "error.generic": { es: "Ha ocurrido un error", en: "An error has occurred", fr: "Une erreur s'est produite", group: "error" },
    "error.notFound": { es: "Página no encontrada", en: "Page not found", fr: "Page non trouvée", group: "error" },
    "error.goHome": { es: "Volver al inicio", en: "Go to home", fr: "Aller à l'accueil", group: "error" },
    "error.tryAgain": { es: "Intentar de nuevo", en: "Try again", fr: "Réessayer", group: "error" },
  };

  const keys = Object.keys(translations);
  console.log(`  Total keys to insert: ${keys.length}\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches of 10
  for (let i = 0; i < keys.length; i += 10) {
    const batch = keys.slice(i, i + 10);
    
    for (const key of batch) {
      const t = translations[key];
      
      const res = await api('POST', '/items/ui_translations', {
        key,
        group: t.group,
        status: 'published',
        translations: {
          create: [
            { languages_code: 'es', name: t.es },
            { languages_code: 'en', name: t.en },
            { languages_code: 'fr', name: t.fr },
          ],
          update: [],
          delete: [],
        },
      });

      if (res.status === 200) {
        created++;
      } else if (res.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        skipped++;
      } else {
        errors++;
        console.log(`  ❌ ${key}: ${res.status} — ${JSON.stringify(res.data).substring(0, 150)}`);
      }
    }

    // Progress
    const progress = Math.min(i + 10, keys.length);
    process.stdout.write(`\r  Progress: ${progress}/${keys.length} (created: ${created}, skipped: ${skipped}, errors: ${errors})`);
  }

  console.log(`\n\n  ✅ Created: ${created}`);
  console.log(`  ⏭️  Skipped (duplicates): ${skipped}`);
  if (errors > 0) console.log(`  ❌ Errors: ${errors}`);
}

// ============ MAIN ============

async function main() {
  console.log('🌐 Setting up UI Translations in Directus\n');
  console.log('='.repeat(50));

  await getToken();
  console.log('🔐 Authenticated\n');

  await createCollections();
  await createFields();
  await setPermissions();
  await populateTranslations();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Done! UI Translations collection is ready.');
  console.log(`   Open: ${DIRECTUS_URL}/admin/content/ui_translations`);
  console.log('   Each item has a key, group, and translations (es/en/fr)');
  console.log('   Edit translations directly in Directus with the translations interface!');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
